package controllers

import java.nio.file.{Paths, Files}
import java.time.Instant
import java.nio.charset.StandardCharsets
import java.time.LocalDateTime
import java.util.HashMap

import com.google.common.reflect.TypeToken
import com.google.gson.internal.LinkedTreeMap
import com.sendgrid.SendGrid
import com.stripe.Stripe
import com.stripe.exception._
import com.stripe.model.Charge
import com.stripe.model.StripeObject
import com.stripe.net.APIResource
import play.api.Play
import play.api.libs.json.{JsValue, Json}
import play.api.mvc.{Headers, Action}
import play.api.mvc.Results._
import play.api.Play.current

import scala.concurrent.Future
import scala.util.parsing.json.JSONObject
import play.api.Logger

import scala.util.{Try,Success, Failure}
import scala.collection.JavaConverters._
import scala.collection.mutable.ListBuffer

class StripeController {
  val log = Logger(this.getClass())
  val sendgrid = new SendGrid(Play.application.configuration.getString("sendgrid.apiKey").get)

  def notJsonResult= {
    val errorStr = "Invalid, request not made in JSON"
    log.error(errorStr)
    BadRequest(Json.obj("result"->errorStr))
  }

  def writeTransactionFile(chargeId: String, timestamp: String, requestJson: JsValue, resultJson: JsValue, headers: Headers) = {
    try {
      val logJson = Json.obj(
        "headers" -> Json.toJson(headers.toSimpleMap),
        "request" -> requestJson,
        "result" -> resultJson
      )
      val logFileName = s"$chargeId--$timestamp"
      val path = Paths.get(s"/hakkapeliitta/transactions/$logFileName")
      Files.write(path, s"${Json.prettyPrint(logJson)}\n".getBytes(StandardCharsets.UTF_8))
    } catch {
      case error : Throwable => log.error(s"Error writing transaction log for $chargeId", error)
    }
  }

  def prettyPrice(currency: String, amount: Integer): String = {
    (currency match {
      case "eur" => "€"
      case "usd" => "$"
      case c => c.toUpperCase + " "
    }) + f"${BigDecimal(amount) / 100}%1.2f"
  }

  def prettyPurchaseDetails(description: String, requestJson: JsValue): String = {
    (for {
      details <- (requestJson \ "purchase" \ "details").asOpt[JsValue]
    } yield {
      val result = ListBuffer("", s"Purchase:  $description")

      val name = (details \ "name").asOpt[String]
      if (name.isDefined) { result += s"Official name:  ${name.get}" }

      val email = (details \ "email").asOpt[String]
      if (email.isDefined) { result += s"Email address:  ${email.get}" }

      val city = (details \ "city").asOpt[String]
      val state = (details \ "state").asOpt[String]
      val country = (details \ "country").asOpt[String]
      val location = List(city, state, country).flatten.filter(_.nonEmpty).mkString(", ")
      if (!location.isEmpty) { result += s"Home location:  $location" }

      val pubFirst = (details \ "public-first").asOpt[String]
      val pubLast = (details \ "public-last").asOpt[String]
      val pubName = List(pubFirst, pubLast).flatten.mkString(" ").trim
      if (!pubName.isEmpty) { result += s"Public name:  $pubName" }

      if (!description.startsWith("Child")) {
        val hugo2016 = (details \ "hugo-2016").asOpt[Boolean].getOrElse(false)
        result += "Participate in 2016 Hugo Awards nomination:  " + (if (hugo2016) "yes" else "no")
      }

      val paperPubs = (details \ "paper-pubs").asOpt[Boolean].getOrElse(false)
      result +=  "Paper publications:  " + (if (paperPubs) "yes" else "no")
      if (paperPubs) {
        val pName = (details \ "paper-name").asOpt[String].getOrElse("[No name!]")
        result += s"    $pName"
        val pAddress = (details \ "paper-address").asOpt[String].getOrElse("[No address!]")
        result ++= pAddress.split("\\n").map(line => s"    $line")
        val pCountry = (details \ "paper-country").asOpt[String].getOrElse("[No country!]")
        result += s"    $pCountry"
      }
      result.mkString("\n    ")
    }).getOrElse {
      log.error("Error parsing purchase details from request!")
      Json.prettyPrint(requestJson)
    }
  }

  def successMessage(description: String, requestJson: JsValue, result: Charge) = {
    val price = prettyPrice(result.getCurrency, result.getAmount)
    val details = prettyPurchaseDetails(description, requestJson)
    s"""
Tervetuloa Maailmanconiin! Welcome to Worldcon!

Thank you for joining us! We have now received your payment of ${price} for a Worldcon 75 ${description}.

Here are the details we have for you:
${details}

The charge will appear on your statement as "WORLDCON 75". Our internal ID for this transaction is ${result.getId}.

Please double check your order and inform us immediately of any errors, omissions, or changes at registration@worldcon.fi.


Kiitos! Thank you!

Worldcon 75
info@worldcon.fi
http://worldcon.fi/"""
  }

  def sendEmail(mailTo: String, message: String, live: Boolean) = {
    val email = new SendGrid.Email()
    email.addTo(mailTo)
    email.setFrom("registration@worldcon.fi")
    email.setFromName("Worldcon 75 Registration")
    if (live) {
      email.addBcc("registration@worldcon.fi")
      email.setSubject("Welcome to Worldcon 75!")
    } else {
      email.setSubject("TEST - Welcome to Worldcon 75!")
    }
    email.setText(message)

    try {
      val response = sendgrid.send(email)
      log.debug(response.getMessage)
    }
    catch {
      case e: Throwable => log.error("Sendgrid error", e)
    }
  }

  def orderMembership = Action { request =>
    request.body.asJson.map { requestJson =>
      (for {
        apiKey <- Play.application.configuration.getString("stripe.apiKey")
        tokenId <- (requestJson \ "token" \ "id").asOpt[String]
        email <-  (requestJson \ "token" \ "email").asOpt[String]
        amount <- (requestJson \ "purchase" \ "amount").asOpt[BigDecimal]
        description <- (requestJson \ "purchase" \ "description").asOpt[String]
      } yield {
        log.info(s"$email is ordering $description")
        Stripe.apiKey = apiKey

        val chargeParams = new HashMap[String, Object]
        chargeParams.put("amount", new Integer(amount.toIntExact))
        chargeParams.put("currency", "eur")
        chargeParams.put("source", tokenId)
        chargeParams.put("description", description)

        Try(Charge.create(chargeParams)) match {
          case Success(result) =>
            val chargeId = result.getId
            log.info(s"$email Charge ($amount) ${result.getStatus}, id: $chargeId")
            val timestamp = Try(Instant.ofEpochSecond(result.getCreated)).toOption.getOrElse(Instant.now).toString
            val resultJson = Json.parse(APIResource.GSON.toJson(result))
            writeTransactionFile(chargeId, timestamp, requestJson, resultJson, request.headers)
            if (result.getStatus == "succeeded") {
              val message = successMessage(description, requestJson, result)
              sendEmail(email, message, result.getLivemode)
              log.info(s"$email Confirmation email sent.")
              Ok(Json.obj(
                "status" -> result.getStatus,
                "message" -> message,
                "result" -> resultJson
              ))
            } else {
              InternalServerError(Json.obj(
                "status" -> result.getStatus,
                "message" -> result.getFailureMessage,
                "result" -> resultJson
              ))
            }
          case Failure(e: CardException) =>
            val errorJson = Json.obj(
              "status" -> "declined",
              "code" -> e.getCode,
              "message" -> e.getMessage,
              "email" -> email
            )
            log.error(errorJson.toString, e)
            InternalServerError(errorJson)
          case Failure(e: StripeException) =>
            val errorJson = Json.obj(
              "status" -> "error",
              "code" -> e.getStatusCode.toString,
              "message" -> e.toString,
              "email" -> email
            )
            log.error(errorJson.toString, e)
            InternalServerError(errorJson)
          case Failure(e: Throwable) =>
            val errorJson = Json.obj(
              "status" -> "error",
              "message" -> e.toString,
              "email" -> email
            )
            log.error(errorJson.toString, e)
            InternalServerError(errorJson)
        }
      }).getOrElse {
        val errorJson = Json.obj(
          "status" -> "error",
          "message" -> "Missing parameters in request",
          "request" -> requestJson
        )
        log.error(errorJson.toString)
        BadRequest(errorJson)
      }
    }.getOrElse(notJsonResult)
  }

  def webHook = Action.async { request =>
    request.body.asJson.map { json =>
      log.info(s"Stripe web hook received $json")
      Future.successful(Ok(s"yep. $json"))
    }.getOrElse {
      Future.successful(notJsonResult)
    }
  }
}

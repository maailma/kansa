package controllers

import java.nio.file.{Paths, Files}
import java.time.Instant
import java.nio.charset.StandardCharsets
import java.time.LocalDateTime
import java.util.HashMap

import com.google.common.reflect.TypeToken
import com.google.gson.internal.LinkedTreeMap
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

class StripeController {
  val log = Logger(this.getClass())

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

  def orderMembership = Action { request =>
    request.body.asJson.map { requestJson =>
      (for {
        apiKey <- Play.application.configuration.getString("stripe.apiKey")
        tokenId <- (requestJson \ "token" \ "id").asOpt[String]
        email <-  (requestJson \ "token" \ "email").asOpt[String]
        price <- (requestJson \ "purchase" \ "amount").asOpt[BigDecimal]
        description <- (requestJson \ "purchase" \ "description").asOpt[String]
      } yield {
        log.info(s"$email is ordering $description for $price")
        Stripe.apiKey = apiKey

        val chargeParams = new HashMap[String, Object]
        chargeParams.put("amount", new Integer(price.toIntExact))
        chargeParams.put("currency", "eur")
        chargeParams.put("source", tokenId)
        chargeParams.put("description", description)

        Try(Charge.create(chargeParams)) match {
          case Success(result) =>
            val chargeId = result.getId
            val timestamp = Try(Instant.ofEpochSecond(result.getCreated)).toOption.getOrElse(Instant.now).toString
            val resultJson = Json.parse(APIResource.GSON.toJson(result))
            writeTransactionFile(chargeId, timestamp, requestJson, resultJson, request.headers)
            log.info(s"$email successfully created Charge ID $chargeId. $description $price")
            Ok(resultJson)
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

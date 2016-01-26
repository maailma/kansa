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

  def writeTransactionFile(tokenId: String, requestJson: JsValue, result: Charge, headers: Headers) = {
    try {
      val jsonResult  = Json.parse(APIResource.GSON.toJson(result))
      val jsonHeaders = Json.toJson(headers.toSimpleMap)
      val jsonLog = Json.obj("request" -> requestJson, "result" -> jsonResult, "headers" -> jsonHeaders)
      val logFileName = s"$tokenId--${Instant.now}"
      val path = Paths.get(s"/hakkapeliitta/transactions/$logFileName")
      Files.write(path, s"${Json.prettyPrint(jsonLog)}\n".getBytes(StandardCharsets.UTF_8))
    } catch {
      case error : Throwable => log.error(s"Error writing transaction log for ${result.getId}", error)
    }
  }

  def orderMembership = Action { request =>
    request.body.asJson.map { json =>
      (for {
        apiKey <- Play.application.configuration.getString("stripe.apiKey")
        tokenId <- (json \ "tokenId").asOpt[String]
        email <-  (json \ "email").asOpt[String]
        productId <- (json \ "productId").asOpt[String]
        price <- (json \ "amount").asOpt[BigDecimal]
        description <- (json \ "descr").asOpt[String]
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
            writeTransactionFile(tokenId, json, result, request.headers)
            log.info(s"$email successfully created Charge ID ${result.getId}. $description $price")
            val instant = Try(Instant.ofEpochSecond(result.getCreated)).toOption.getOrElse(Instant.now)
            Ok(Json.obj("result" -> "successful", "time" -> instant.toString))
          case Failure(e: StripeException) =>
            val errorStr = s"Error making Strip request for $email.\nRequest id: ${e.getRequestId}\nStatus code${e.getStatusCode}"
            log.error(errorStr, e)
            InternalServerError(Json.obj("result"-> errorStr))
          case Failure(e: Throwable) =>
            val errorStr = s"Unknown issue making Stripe request for $email."
            log.error(errorStr, e)
            InternalServerError(Json.obj("result" -> errorStr))
        }
      }).getOrElse {
        val errorStr = "Missing parameters in request"
        log.error(errorStr)
        BadRequest(Json.obj("result" -> errorStr))
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

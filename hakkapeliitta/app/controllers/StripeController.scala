package controllers

import java.nio.file.{Paths, Files}
import java.nio.charset.StandardCharsets
import java.time.LocalDateTime
import java.util.HashMap

import com.stripe.Stripe
import com.stripe.exception._
import com.stripe.model.Charge
import com.stripe.model.StripeObject
import play.api.Play
import play.api.mvc.Action
import play.api.mvc.Results._
import play.api.Play.current

import scala.concurrent.Future
import scala.util.parsing.json.JSONObject

class StripeController {
  val notJsonResult= BadRequest("Invalid, request not made in JSON")

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
        Stripe.apiKey = apiKey

        val chargeParams = new HashMap[String, Object]
        chargeParams.put("amount", new Integer(price.toIntExact))
        chargeParams.put("currency", "eur")
        chargeParams.put("source", tokenId)
        chargeParams.put("description", description)

        try {
          println(s"Processing transaction $tokenId...")
          val result = Charge.create(chargeParams)
          println(s"Transaction $tokenId status: ${result.getStatus}")
          val jsonHeaders = JSONObject(request.headers.toSimpleMap)
          val jsonResult = StripeObject.PRETTY_PRINT_GSON.toJson(result)
          val jsonLog = s"""{\n"headers": $jsonHeaders,\n"request": $json,\n"response": $jsonResult\n}\n"""
          val logFileName = s"$tokenId--${LocalDateTime.now}"
          val path = Paths.get(s"/transactions/$logFileName")
          Files.write(path, jsonLog.getBytes(StandardCharsets.UTF_8))
          println(s"Transaction complete, stored as `$logFileName`.")
          Ok(s"yep $result")
        } catch {
          case e: StripeException =>
            val errorStr = s"Error making Stripe request.\nRequest id: ${e.getRequestId}\nStatus code${e.getStatusCode}"
            InternalServerError(errorStr)
          case e: Throwable =>
            e.printStackTrace
            InternalServerError(s"Unknown issue making Stripe request:\n$e")
        }
      }).getOrElse(BadRequest(s"Missing parameters in request\n$json\n${(json \ "descr").asOpt[String]}"))
    }.getOrElse(notJsonResult)
  }

  def webHook = Action.async { request =>
    request.body.asJson.map { json =>
      println(s"Stripe web hook received $json")
      Future.successful(Ok(s"yep. $json"))
    }.getOrElse {
      Future.successful(notJsonResult)
    }
  }
}

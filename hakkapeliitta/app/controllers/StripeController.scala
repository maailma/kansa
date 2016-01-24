package controllers

import java.util.HashMap

import com.stripe.Stripe
import com.stripe.exception._
import com.stripe.model.Charge
import play.api.Play
import play.api.mvc.Action
import play.api.mvc.Results._
import play.api.Play.current

import scala.concurrent.Future

class StripeController {
  val notJsonResult= BadRequest("Invalid, request not made in JSON")

  def orderMembership = Action { request =>
    request.body.asJson.map { json =>
      println("And the secret is")
      println(Play.application.configuration.getString("stripe.apiKey"))
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
          val result = Charge.create(chargeParams)
          Ok(s"yep $result")
        } catch {
          case e: StripeException =>
            val errorStr = s"Error making Strip request.\nRequest id: ${e.getRequestId}\nStatus code${e.getStatusCode}"
            InternalServerError(errorStr)
          case _ : Throwable => InternalServerError("Unknown issue making Stripe request.")
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

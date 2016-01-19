package controllers

import play.api.mvc.Action

import scala.concurrent.Future
import play.api.mvc.Results._

class StripeWebHook {
  def webHook = Action.async { request =>
    request.body.asJson.map { json =>
      println(s"Stripe web hook received $json")
      Future.successful(Ok(s"yep. $json"))
    }.getOrElse {
      Future.successful(BadRequest("Invalid, request not made in JSON"))
    }
  }
}

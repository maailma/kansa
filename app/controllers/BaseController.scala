package controllers

import java.util.UUID

import org.joda.time.LocalDateTime
import play.api.i18n.I18nSupport
import services.user.AuthenticationEnvironment
import com.mohiva.play.silhouette.api._
import com.mohiva.play.silhouette.impl.authenticators.CookieAuthenticator
import models.user.{ Role, User }
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.mvc.{ AnyContent, Result }

import scala.concurrent.Future

abstract class BaseController() extends Silhouette[User, CookieAuthenticator] with I18nSupport {
  def env: AuthenticationEnvironment

  def withAdminSession(block: (SecuredRequest[AnyContent]) => Future[Result]) = SecuredAction.async { implicit request =>
    if (request.identity.roles.contains(Role.Admin)) {
      block(request)
    } else {
      Future.successful(NotFound("404 Not Found"))
    }
  }

  def withSession(block: (SecuredRequest[AnyContent]) => Future[Result]) = UserAwareAction.async { implicit request =>
    val response = request.identity match {
      case Some(user) =>
        val secured = SecuredRequest(user, request.authenticator.getOrElse(throw new IllegalStateException()), request)
        block(secured).map { r =>
          r
        }
      case None =>
        val user = User(
          id = UUID.randomUUID(),
          username = None,
          profiles = Nil,
          created = new LocalDateTime()
        )

        for {
          user <- env.userService.save(user)
          authenticator <- env.authenticatorService.create(LoginInfo("anonymous", user.id.toString))
          value <- env.authenticatorService.init(authenticator)
          result <- block(SecuredRequest(user, authenticator, request))
          authedResponse <- env.authenticatorService.embed(value, result)
        } yield {
          env.eventBus.publish(SignUpEvent(user, request, request2Messages))
          env.eventBus.publish(LoginEvent(user, request, request2Messages))
          authedResponse
        }
    }
    response
  }
}

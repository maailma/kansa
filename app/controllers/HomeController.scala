package controllers

import play.api.i18n.MessagesApi
import services.user.AuthenticationEnvironment

import scala.concurrent.Future

@javax.inject.Singleton
class HomeController @javax.inject.Inject() (override val messagesApi: MessagesApi, override val env: AuthenticationEnvironment) extends BaseController {
  def index = withSession { s =>
    Future.successful(Ok(views.html.index(s.identity)))
  }

  def adminTest = withAdminSession{ s =>
    Future.successful(Ok(views.html.index(s.identity)))
  }
}

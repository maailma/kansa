package controllers

import jdub.async.Database
import models.queries.ProfileQueries
import play.api.i18n.MessagesApi
import services.user.AuthenticationEnvironment
import play.api.libs.concurrent.Execution.Implicits.defaultContext

@javax.inject.Singleton
class ProfileController @javax.inject.Inject() (override val messagesApi: MessagesApi, override val env: AuthenticationEnvironment) extends BaseController {
  def profile = withSession { implicit request =>
    Database.query(ProfileQueries.FindProfilesByUser(request.identity.id)).map { profiles =>
      Ok(views.html.profile(request.identity, profiles))
    }
  }
}

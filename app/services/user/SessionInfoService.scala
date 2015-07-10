package services.user

import com.mohiva.play.silhouette.impl.authenticators.CookieAuthenticator
import com.mohiva.play.silhouette.impl.daos.AuthenticatorDAO
import jdub.async.Database
import models.queries.AuthenticatorQueries
import play.api.libs.concurrent.Execution.Implicits.defaultContext

object SessionInfoService extends AuthenticatorDAO[CookieAuthenticator] {
  override def find(id: String) = Database.query(AuthenticatorQueries.getById(Seq(id))).map {
    case Some(dbSess) => Some(dbSess)
    case None => None
  }

  override def add(session: CookieAuthenticator) = Database.execute(AuthenticatorQueries.insert(session)).map(x => session)

  override def update(session: CookieAuthenticator) = Database.execute(AuthenticatorQueries.UpdateAuthenticator(session)).map(x => session)

  override def remove(id: String) = Database.execute(AuthenticatorQueries.removeById(Seq(id))).map(x => Unit)
}

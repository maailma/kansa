package worldcon.hakkapeliitta.services.database

import jdub.async.Database
import models.queries.ddl._
import play.api.Logger
import play.api.libs.concurrent.Execution.Implicits.defaultContext

import scala.concurrent.Future

object Schema {
  val tables = Seq(
    "users" -> CreateUsersTable,

    "user_profiles" -> CreateUserProfilesTable,
    "password_info" -> CreatePasswordInfoTable,
    "oauth1_info" -> CreateOAuth1InfoTable,
    "oauth2_info" -> CreateOAuth2InfoTable,
    "openid_info" -> CreateOpenIdInfoTable,
    "session_info" -> CreateSessionInfoTable
  )

  def update() = {
    tables.foldLeft(Future.successful(Unit)) { (f, t) =>
      f.flatMap { u =>
        Database.query(DdlQueries.DoesTableExist(t._1)).flatMap { exists =>
          if (exists) {
            Future.successful(Unit)
          } else {
            Logger.info(s"Creating missing table [${t._1}].")
            val name = s"CreateTable-${t._1}"
            Database.raw(name, t._2.sql).map(x => Unit)
          }
        }
      }
    }
  }
}

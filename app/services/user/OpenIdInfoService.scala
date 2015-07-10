package services.user

import com.mohiva.play.silhouette.api.LoginInfo
import com.mohiva.play.silhouette.impl.daos.DelegableAuthInfoDAO
import com.mohiva.play.silhouette.impl.providers.OpenIDInfo
import jdub.async.Database
import models.queries.OpenIdInfoQueries
import play.api.libs.concurrent.Execution.Implicits.defaultContext

import scala.concurrent.Future

object OpenIdInfoService extends DelegableAuthInfoDAO[OpenIDInfo] {
  override def find(loginInfo: LoginInfo) = Database.query(OpenIdInfoQueries.getById(Seq(loginInfo.providerID, loginInfo.providerKey)))

  override def save(loginInfo: LoginInfo, authInfo: OpenIDInfo) = {
    Database.transaction { conn =>
      Database.execute(OpenIdInfoQueries.UpdateOpenIdInfo(loginInfo, authInfo), Some(conn)).flatMap { rowsAffected =>
        if (rowsAffected == 0) {
          Database.execute(OpenIdInfoQueries.CreateOpenIdInfo(loginInfo, authInfo), Some(conn)).map(x => authInfo)
        } else {
          Future.successful(authInfo)
        }
      }
    }
  }

  override def add(loginInfo: LoginInfo, authInfo: OpenIDInfo) = {
    Database.execute(OpenIdInfoQueries.CreateOpenIdInfo(loginInfo, authInfo)).map(x => authInfo)
  }

  override def update(loginInfo: LoginInfo, authInfo: OpenIDInfo) = {
    Database.execute(OpenIdInfoQueries.UpdateOpenIdInfo(loginInfo, authInfo)).map(x => authInfo)
  }

  override def remove(loginInfo: LoginInfo) = {
    Database.execute(OpenIdInfoQueries.removeById(Seq(loginInfo.providerID, loginInfo.providerKey))).map(x => Unit)
  }
}

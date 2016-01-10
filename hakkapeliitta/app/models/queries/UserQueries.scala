package models.queries

import java.util.UUID

import com.mohiva.play.silhouette.api.LoginInfo
import jdub.async.{ FlatSingleRowQuery, Row, Statement }
import jdub.async.queries.BaseQueries
import models.user.{ Role, User }
import org.joda.time.LocalDateTime

object UserQueries extends BaseQueries[User] {
  override protected val tableName = "users"
  override protected val columns = Seq("id", "username", "profiles", "roles", "created")
  override protected val searchColumns = Seq("id::text", "username")

  val insert = Insert
  val getById = GetById
  def searchCount(q: String, groupBy: Option[String] = None) = new SearchCount(q, groupBy)
  val search = Search
  val removeById = RemoveById

  case class UpdateUser(u: User) extends Statement {
    override val sql = updateSql(Seq("username", "profiles", "roles"))
    override val values = {
      val profiles = u.profiles.map(l => s"${l.providerID}:${l.providerKey}").toArray
      val roles = u.roles.map(_.name).toArray
      Seq(u.username, profiles, roles, u.id)
    }
  }

  case class SetUsername(userId: UUID, username: Option[String]) extends Statement {
    override val sql = updateSql(Seq("username"))
    override val values = Seq(username, userId)
  }

  case class AddRole(id: UUID, role: Role) extends Statement {
    override val sql = s"update $tableName set roles = array_append(roles, ?) where id = ?"
    override val values = Seq(role.name, id)
  }

  case class FindUserByUsername(username: String) extends FlatSingleRowQuery[User] {
    override val sql = getSql(Some("username = ?"))
    override val values = Seq(username)
    override def flatMap(row: Row) = Some(fromRow(row))
  }

  case class FindUserByProfile(loginInfo: LoginInfo) extends FlatSingleRowQuery[User] {
    override val sql = getSql(Some("profiles @> ARRAY[?]::text[]"))
    override val values = Seq(s"${loginInfo.providerID}:${loginInfo.providerKey}")
    override def flatMap(row: Row) = Some(fromRow(row))
  }

  override protected def fromRow(row: Row) = {
    val id = UUID.fromString(row.as[String]("id"))
    val profiles = row.as[collection.mutable.ArrayBuffer[_]]("profiles").map { l =>
      val info = l.toString
      val delimiter = info.indexOf(':')
      val provider = info.substring(0, delimiter)
      val key = info.substring(delimiter + 1)
      LoginInfo(provider, key)
    }
    val username = row.asOpt[String]("username")
    val roles = row.as[collection.mutable.ArrayBuffer[_]]("roles").map(x => Role(x.toString)).toSet
    val created = row.as[LocalDateTime]("created")
    User(id, username, profiles, roles, created)
  }

  override protected def toDataSeq(u: User) = {
    val profiles = u.profiles.map(l => s"${l.providerID}:${l.providerKey}").toArray
    val roles = u.roles.map(_.name).toArray
    Seq(u.id, u.username, profiles, roles, u.created)
  }
}

package models.queries.ddl

import jdub.async.{ Row, SingleRowQuery }

import scala.util.Try

object DdlQueries {
  case class DoesTableExist(tableName: String) extends SingleRowQuery[Boolean] {
    override val sql = "select exists (select * from information_schema.tables WHERE table_name = ?);"
    override val values = tableName :: Nil
    override def map(row: Row) = {
      Try(row.as[Boolean]("exists")).toOption match {
        case Some(true) => true
        case _ => false
      }
    }
  }
}

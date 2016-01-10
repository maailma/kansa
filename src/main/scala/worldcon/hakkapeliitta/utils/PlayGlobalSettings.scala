package worldcon.hakkapeliitta.utils

import java.util.TimeZone

import jdub.async.Database
import org.joda.time.DateTimeZone
import play.api.{ Application, GlobalSettings }
import services.database.Schema

object PlayGlobalSettings extends GlobalSettings {
  override def onStart(app: Application) = {
    println("here we are")
    DateTimeZone.setDefault(DateTimeZone.UTC)
    TimeZone.setDefault(TimeZone.getTimeZone("UTC"))

    val cnf = play.api.Play.current.configuration
    val host = cnf.getString("db.host").getOrElse("127.0.0.1")
    val port = 5432
    val database = cnf.getString("db.database")
    val username = cnf.getString("db.username").getOrElse("silhouette")
    val password = cnf.getString("db.password")

    Database.open(username, host, port, password, database)
    Schema.update()
    println("schema updated")

    super.onStart(app)
  }

  override def onStop(app: Application) = {
    Database.close()
    super.onStop(app)
  }
}

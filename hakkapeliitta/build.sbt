import com.typesafe.sbt.packager.universal.UniversalPlugin.autoImport._

name := "hakkapeliitta"

version := "1.0"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.11.7"

resolvers += Resolver.jcenterRepo

libraryDependencies ++= Seq(
  cache,
  "com.mohiva" %% "play-silhouette" % "3.0.2",
  "com.kyleu" %% "jdub-async" % "1.0",
  "org.webjars" % "bootstrap" % "3.3.5"
)

routesGenerator := InjectedRoutesGenerator

val copyPackage = TaskKey[Unit]("copyPackage", "Copies tarball to the Docker directory")
copyPackage <<= (packageZipTarball in Universal) map { tarball =>
  val destinationDir = "../docker/app/temp/"
  val destinationFile = new File(destinationDir + tarball.getName)
  IO.copyFile(tarball, destinationFile)
  println(s"Copying $tarball to $destinationFile")
}

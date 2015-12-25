enablePlugins(TomcatPlugin)

libraryDependencies += "javax.servlet" % "javax.servlet-api" % "3.0.1" % "provided"

lazy val root = (project in file(".")).
  settings(
    name := "hello",
    version := "1.0",
    scalaVersion := "2.11.7"
  )

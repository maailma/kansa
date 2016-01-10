name := "play-silhouette-postgres-async-seed"

version := "1.0"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.11.7"

resolvers += Resolver.jcenterRepo

libraryDependencies ++= Seq(
  cache,
  "com.mohiva" %% "play-silhouette" % "3.0.0-RC2",
  "com.kyleu" %% "jdub-async" % "1.0",
  "org.webjars" % "bootstrap" % "3.3.5"
)

routesGenerator := InjectedRoutesGenerator

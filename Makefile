# Run "make" in the project folder, in order to pack the application.
# Then set up the build environment for the app. (Remove the orphan container afterwards.)
# Last, start the application and dependent containers.

all:
	cd docker; docker-compose kill && docker-compose rm -f app
	cd hakkapeliitta; sbt copyPackage
	cd docker/build-environment; docker-compose run --rm sbt
	cd docker; docker-compose build; docker-compose up -d

run: all
build: all
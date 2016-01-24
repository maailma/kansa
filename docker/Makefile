# Run "make" in the project folder, in order to pack the application.
# Then set up the build environment for the app. (Remove the orphan container afterwards.)
# Last, start the application and dependent containers.

all: stop build start

stop:
	docker-compose kill
	docker-compose rm -f app

build:
	# cd hakkapeliitta; sbt copyPackage
	cd build-environment; docker-compose run --rm sbt
	docker-compose build

start:
	docker-compose up -d

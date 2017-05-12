# kansa-admin

#### To build locally

```sh
npm install

# Optionally, if non-default:
export API_HOST='example.com'
export TITLE='Example'

npm run build:prod
```


#### To build inside a Docker container

```sh
docker build -t kansa-admin-build --build-arg 'host=localhost:4430 title=Kansa' .
  # replace localhost:4430 with e.g. 192.168.99.100:4430 if using a Docker
  # Machine VM, or some non-default configuration

docker run --rm -v ${PWD}/dist:/usr/src/app/dist kansa-admin-build`
   # note that the volume-mount may not work for a Docker Machine VM is the
   # current directory is not under `/Users` or `C:\Users`
```

----

Both procedures should output a file `dist/build.js`, after which the `dist/`
directory may be served in a read-only file system; the member data will be read
and written to using the [server API](https://github.com/worldcon75/api).

For development, `npm start` will build the app and run the webpack-dev-server
at <http://localhost:8080/webpack-dev-server/>.

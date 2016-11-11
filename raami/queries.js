var promise = require('bluebird');

var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var db = pgp(process.env.DATABASE_URL)

// add query functions

module.exports = {
	getArtists: getArtists,
	createArtist: createArtist,
	getArtist: getArtist,
	updateArtist: updateArtist,
	getWork: getWork,
	getWorks: getWorks,
	createWork: createWork,
	updateWork: updateWork,
	removeWork: removeWork,
};

function getArtists(req, res, next) {
  db.any('select id,continent from Artist')
    .then(function (data) {
      res.status(200)
        .json({
          data: data,
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function getArtist(req, res, next) {
  var person_id = parseInt(req.params.id);
  db.one('select * from Artist where person_id = $1', person_id)
    .then(function (data) {
      res.status(200)
        .json({
          data: data,
        });
    })
    .catch(function (err) {
      return next(err);
    });
}


function createArtist(req, res, next) {
  req.body.age = parseInt(req.body.age);
  // continent, url, filename, portfolio, category, orientation, description, transport
  db.none('insert into Artist(continent, url, filename, portfolio, category, orientation, description, transport)' +
      'values(${continent}, ${url}, ${filename}, ${portfolio},${category}, ${orientation},${description},${transport})',
    req.body)
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          //inserted: id
        });
    })
    .catch(function (err) {
      return next(err);
    });
}


function updateArtist(req, res, next) {
  db.none('update Artists set continent=$1, url=$2, filename=$3, portfolio=$4, category=$5, orientation=$6, description=$7, transport=$8 where id=$0',
    [req.params.id, 
     req.body.continent, 
     req.body.url,
     req.body.filename,
     req.body.portfolio,
     req.body.category,
     req.body.orientation,
     req.body.description,
     req.body.transport
     ])
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          updated: req.body
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

// function removeArtists(req, res, next) {
//   var _id = parseInt(req.params.id);
//   db.result('delete from Artist where id = $1', _id)
//     .then(function (result) {
//       /* jshint ignore:start */
//       res.status(200)
//         .json({
//           status: 'success',
//           message: `Removed ${result.rowCount} puppy`
//         });
//       /* jshint ignore:end */
//     })
//     .catch(function (err) {
//       return next(err);
//     });
// }

/**** WORKS ***/

function getWorks(req, res, next) {
  db.any('select id from Works where artist_id = $1', artist_id)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function getWork(req, res, next) {
  var Work_id = parseInt(req.params.id);
  db.one('select * from Works where id = $1', work_id)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
        });
    })
    .catch(function (err) {
      return next(err);
    });
}


function createWork(req, res, next) {
  db.none('insert into Works(`artist_id`, `title` , `width` , `height` , `technique` , `graduation` , `filename` , `image` , `price` )' +
      'values(${aritst_id}, ${title}, ${width}, ${height}, ${technique}, ${graduation}, ${filename}, ${image}, ${price})',
    req.body)
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          // inserted: id,
        });
    })
    .catch(function (err) {
      return next(err);
    });
}


function updateWork(req, res, next) {
  db.none('update Works set artist_id=$1, title=$2, width=$3, height=$4, technique=$5, graduation=$6, filename=$7, image=$8, price=$9 where id=$0',
    [parseInt(req.params.id), req.body.title, req.body.width, req.body.height, req.body.technique, req.body.graduation, req.body.filename, req.body.image, req.body.price])
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          updated: req.body
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function removeWork(req, res, next) {
  var _id = parseInt(req.params.id);
  db.result('delete from Work where id = $1', _id)
    .then(function (result) {
      /* jshint ignore:start */
      res.status(200)
        .json({
          status: 'success',
          deleted: [_id]
        });
      /* jshint ignore:end */
    })
    .catch(function (err) {
      return next(err);
    });
}
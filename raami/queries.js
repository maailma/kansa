var promise = require('bluebird');

var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = 'postgres://localhost:5432/api';
var db = pgp(connectionString);
// var db = pgp(process.env.DATABASE_URL)

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
  db.any('select * from Artist')
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ALL puppies'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function getArtist(req, res, next) {
  var member_id = parseInt(req.params.id);
  db.one('select * from Artist where member_id = $1', member_id)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ONE Artist'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}


function createArtist(req, res, next) {
  req.body.age = parseInt(req.body.age);
  db.none('insert into Artist(name, breed, age, sex)' +
      'values(${name}, ${breed}, ${age}, ${sex})',
    req.body)
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Inserted one puppy'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}


function updateArtist(req, res, next) {
  db.none('update Artists set name=$1, breed=$2, age=$3, sex=$4 where id=$5',
    [req.body.name, req.body.breed, parseInt(req.body.age),
      req.body.sex, parseInt(req.params.id)])
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Updated puppy'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function removeArtists(req, res, next) {
  var _id = parseInt(req.params.id);
  db.result('delete from Artist where id = $1', _id)
    .then(function (result) {
      /* jshint ignore:start */
      res.status(200)
        .json({
          status: 'success',
          message: `Removed ${result.rowCount} puppy`
        });
      /* jshint ignore:end */
    })
    .catch(function (err) {
      return next(err);
    });
}

/**** WORKS ***/

function getWorks(req, res, next) {
  db.any('select * from Works where artist_id = $1', artist_id)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ALL Works'
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
          message: 'Retrieved ONE Work'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}


function createWork(req, res, next) {
  req.body.age = parseInt(req.body.age);
  db.none('insert into Works(name, breed, age, sex)' +
      'values(${name}, ${breed}, ${age}, ${sex})',
    req.body)
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Inserted one Work'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}


function updateWork(req, res, next) {
  db.none('update Works set name=$1, breed=$2, age=$3, sex=$4 where id=$5',
    [req.body.name, req.body.breed, parseInt(req.body.age),
      req.body.sex, parseInt(req.params.id)])
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Updated Work'
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
          message: 'Removed ${result.rowCount} Work'
        });
      /* jshint ignore:end */
    })
    .catch(function (err) {
      return next(err);
    });
}
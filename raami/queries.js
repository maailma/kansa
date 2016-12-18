var promise = require('bluebird');

var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var db = pgp(process.env.DATABASE_URL)

// add query functions

module.exports = {
  getPeople: getPeople,
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

function getPeople(req, res, next) {
  var _id = parseInt(req.params.id);
  db.any('select * from Artist where person_id = $1', _id)
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function getArtists(req, res, next) {
  db.any('select id,continent from Artist')
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function getArtist(req, res, next) {
  var _id = parseInt(req.params.id);
  db.one('select * from Artist where id = $1', _id)
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}


function createArtist(req, res, next) {

  db.none('insert into Artist(person_id, name, continent, url, filename, portfolio, description, transport, legal, auction, print, digital)' +
      'values(${person_id}, ${name}, ${continent}, ${url}, ${filename}, ${portfolio}, ${description}, ${transport}, ${legal}, ${auction}, ${print}, ${digital} )',
    req.body)
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          inserted: res
        });
    })
    .catch(function (err) {
      return next(err);
    });
}


function updateArtist(req, res, next) {
  var _id = parseInt(req.params.id);
  db.none('update Artist set continent=$1, url=$2, filename=$3, portfolio=$4, name=$6, description=$6, transport=$7, legal=$8, auction=$9, print=$10, digital=$11 where id=$12',
    [req.body.continent, 
     req.body.url,
     req.body.filename,
     req.body.filedata,
     req.body.name,
     req.body.description,
     req.body.transport,
     req.body.legal,
     req.body.auction,
     req.body.print,
     req.body.digital,
     _id
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
  var _id = parseInt(req.params.id);
  db.any('select * from Works where artist_id = $1', _id)
    .then(function (data) {
      res.status(200)
        .json({
          works: data,
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function getWork(req, res, next) {
  var _id = parseInt(req.params.id);
  db.one('select * from Works where id = $1', _id)
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}


function createWork(req, res, next) {
  db.none('insert into Works(artist_id, title, width, height, gallery, orientation, technique, filename, image, year, price )' +
      'values(${artist_id}, ${title}, ${width}, ${height}, ${gallery}, ${orientation}, ${technique}, ${filename}, ${image}, ${year}, ${price})',
    req.body)
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          data: res
        });
    })
    .catch(function (err) {
      return next(err);
    });
}


function updateWork(req, res, next) {
  var _id = parseInt(req.params.id)	
  db.none('update Works set artist_id=$1, title=$2, width=$3, height=$4, gallery=$5, filename=$7, filedata=$8, price=$9, year=$10, orientation=$11, technique=$12 where id=$13',
    [ req.body.artist_id,
      req.body.title, 
      req.body.width, 
      req.body.height, 
      req.body.gallery, 
      req.body.filename, 
      req.body.filedata, 
      req.body.price,
      req.body.year,
      req.body.orientation,
      req.body.technique, 
      _id])
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
  db.result('delete from Works where id = $1', _id)
    .then(function (result) {
      /* jshint ignore:start */
      res.status(200)
        .json({
          status: 'success',
          deleted: _id
        });
      /* jshint ignore:end */
    })
    .catch(function (err) {
      return next(err);
    });
}
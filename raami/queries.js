var promise = require("bluebird");

var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require("pg-promise")(options);
var db = pgp(process.env.DATABASE_URL)


module.exports = {
  getPeople,
	getArtists,
	createArtist,
	getArtist,
	updateArtist,
	getWork,
	getWorks,
	createWork,
	updateWork,
	removeWork,
};

function getPeople(req, res, next) {
  var _id = parseInt(req.params.id);                             
  db.any(`
    SELECT id, person_id, name, continent, url, filename, filedata, description,
           transport, legal, auction, print, digital
      FROM Artist
     WHERE person_id = $1`, _id
  )
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function getArtists(req, res, next) {
  db.any('SELECT person_id, id, name FROM Artist')
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
  db.one(`
    SELECT person_id, name, continent, url, filename, filedata, description,
           transport, legal, auction, print, digital
      FROM Artist
     WHERE id = $1`, _id
  )
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}


function createArtist(req, res, next) {
  db.one(`
     INSERT INTO Artist
                 (
                   person_id, name, continent, url, filename, filedata,
                   description, transport, legal, auction, print, digital
                 )
          VALUES (
                   $(person_id), $(name), $(continent), $(url), $(filename),
                   $(filedata), $(description), $(transport), $(legal),
                   $(auction), $(print), $(digital)
                 )
       RETURNING id`, req.body
  )
    .then(function (data) {
      console.log(data.id)
      res.status(200)
        .json({
          status: 'success',
          inserted: data.id
        });
    })
    .catch(function (err) {
      return next(err);
    });
}


function updateArtist(req, res, next) {
  var _id = parseInt(req.params.id);
  db.none(`
    UPDATE Artist
       SET continent=$1, url=$2, filename=$3, filedata=$4, name=$5,
           description=$6, transport=$7, legal=$8, auction=$9, print=$10,
           digital=$11
     WHERE id=$12`, [
      req.body.continent,
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
    ]
  )
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
//   db.result('DELETE FROM Artist WHERE id = $1', _id)
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
  db.any(`
    SELECT id, artist_id, title, width, height, gallery, orientation, technique,
           filename, filedata, year, price
      FROM Works
     WHERE artist_id = $1`, _id
  )
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
  db.one(`
    SELECT artist_id, title, width, height, gallery, orientation, technique,
           filename, filedata, year, price
      FROM Works
     WHERE id = $1`, _id
  )
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}


function createWork(req, res, next) {
  db.one(`
    INSERT INTO Works
                (
                  artist_id, title, width, height, gallery, orientation,
                  technique, filename, filedata, year, price
                )
         VALUES (
                  $(artist_id), $(title), $(width), $(height), $(gallery),
                  $(orientation), $(technique), $(filename), $(filedata),
                  $(year), $(price)
                )
        RETURNING id`, req.body
  )
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          insrted: data.id
        });
    })
    .catch(function (err) {
      return next(err);
    });
}


function updateWork(req, res, next) {
  var _id = parseInt(req.params.id)	
  db.none(`
    UPDATE Works
       SET artist_id=$1, title=$2, width=$3, height=$4, gallery=$5, filename=$6,
           filedata=$7, price=$8, year=$9, orientation=$10, technique=$11
     WHERE id=$12`, [
      req.body.artist_id,
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
      _id
    ]
  )
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
  db.result('DELETE FROM Works WHERE id = $1', _id)
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
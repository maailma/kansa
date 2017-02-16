const AuthError = require('./errors').AuthError;
const InputError = require('./errors').InputError;

module.exports = {
  // getPeople,
	// getArtists,
	createArtist,
	getArtist,
	// updateArtist,
	getWork,
	getWorks,
	createWork,
	updateWork,
	removeWork,
};

function access(req) {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id < 0) return Promise.reject(new InputError('Bad id number'));
  if (!req.session || !req.session.user || !req.session.user.email) return Promise.reject(new AuthError());
  return req.app.locals.db.oneOrNone('SELECT email FROM kansa.People WHERE id = $1', id)
    .then(data => {
      if (!data || !req.session.user.raami_admin && req.session.user.email !== data.email) throw new AuthError();
      return {
        id,
      };
    });
}

// function getPeople(req, res, next) {
//   var _id = (req.params.id);                             
//   access(req)
//   .then(req.app.locals.db.any(`
//     SELECT id, person_id, name, continent, url, filename, filedata, description,
//            transport, legal, auction, print, digital, agent, contact, waitlist, postage
//       FROM Artist
//      WHERE person_id = $1`, _id
//   ))
//     .then(function (data) {
//       res.status(200)
//         .json(data);
//     })
//     .catch(next);
// }

// function getArtists(req, res, next) {
//   access(req)
//   .then(req.app.locals.db.any('SELECT person_id, id, name FROM Artist'))
//     .then(function (data) {
//       res.status(200)
//         .json(data);
//     })
//     .catch(next);
// }

function getArtist(req, res, next) {
  access(req)
  .then(({id}) => {
    // const id = req.params.id;
    return req.app.locals.db.oneOrNone(`
      SELECT *
        FROM Artist
       WHERE people_id = $1`, id
    )
    })
  .then((data)=> {

      res.status(200)
        .json(data);
    })
  .catch(next);
}


function createArtist(req, res, next) {
  access(req)
  .then(({id}) => {
    // const id = (req.params.id);
    console.log(id)
    return req.app.locals.db.one(`
      UPDATE Artist SET continent=$(continent), url=$(url), filename=$(filename), filedata=$(filedata), name=$(name),
                  description=$(description), transport=$(transport), legal=$(legal), auction=$(auction), print=$(print),
                  digital=$(digital), agent=$(agent), contact=$(contact), waitlist=$(waitlist), postage=$(postage)
      WHERE people_id = $(people_id);
      INSERT INTO Artist
                   (
                     people_id, name, continent, url, filename, filedata,
                     description, transport, legal, auction, print, digital, agent, contact, waitlist, postage
                   )
      SELECT 
                     $(people_id), $(name), $(continent), $(url), $(filename),
                     $(filedata), $(description), $(transport), $(legal),
                     $(auction), $(print), $(digital), $(agent), $(contact), $(waitlist), $(postage)
      WHERE NOT EXISTS (SELECT 1 FROM Artist WHERE people_id=$(people_id))
      RETURNING people_id`, req.body)
      }
    )
    .then((data)=> {
          console.log(data)

      res.status(200)
        .json({
          status: 'success',
          inserted: data.people_id
        });
    })
    .catch(next);
  }


// function updateArtist(req, res, next) {

//   var _id = (req.params.id);
//   access(req)
//   .then(req.app.locals.db.none(`
//     UPDATE Artist
//        SET continent=$1, url=$2, filename=$3, filedata=$4, name=$5,
//            description=$6, transport=$7, legal=$8, auction=$9, print=$10,
//            digital=$11, agent=$12, contact=$13, waitlist=$14, postage=$15
//      WHERE people_id=$16`, [
//       req.body.continent,
//       req.body.url,
//       req.body.filename,
//       req.body.filedata,
//       req.body.name,
//       req.body.description,
//       req.body.transport,
//       req.body.legal,
//       (req.body.auction),
//       (req.body.print),
//       req.body.digital,
//       req.body.agent,
//       req.body.contact,
//       req.body.waitlist,
//       req.body.postage,
//       _id
//     ]
//   ))
//     .then(function () {
//       res.status(200)
//         .json({
//           status: 'success',
//           updated: req.body
//         });
//     })
//     .catch(next);
// }

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
  access(req)
  .then(() => {
  const id = (req.params.id);

    req.app.locals.db.any(`
      SELECT *
        FROM Works
       WHERE people_id = $1`, id
    )}
  )
    .then(function (data) {
      res.status(200)
        .json({
          works: data,
        });
    })
    .catch(next);
}

function getWork(req, res, next) {
  var _id = (req.params.work);
    access(req)
  .then(req.app.locals.db.one(`
    SELECT *
      FROM Works
     WHERE id = $1`, _id
  ))
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(next);
}


function createWork(req, res, next) {
  access(req)
  .then(req.app.locals.db.one(`
    INSERT INTO Works
                (
                  people_id, title, width, height, depth, gallery, orientation,
                  technique, filename, filedata, year, price
                )
         VALUES (
                  $(people_id), $(title), $(width), $(height), $(depth), $(gallery),
                  $(orientation), $(technique), $(filename), $(filedata),
                  $(year), $(price)
                )
        RETURNING id`, req.body
  ))
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          insrted: data.id
        });
    })
    .catch(next);
}


function updateWork(req, res, next) {
  var _id = (req.params.work)
  access(req)
  .then(req.app.locals.db.none(`
    UPDATE Works
       SET people_id=$1, title=$2, width=$3, height=$4, depth=$5, gallery=$6, filename=$7,
           filedata=$8, price=$9, year=$10, orientation=$11, technique=$12
     WHERE id=$13`, [
      req.body.people_id,
      req.body.title,
      req.body.width,
      req.body.height,
      req.body.depth,
      req.body.gallery,
      req.body.filename,
      req.body.filedata,
      req.body.price,
      req.body.year,
      req.body.orientation,
      req.body.technique,
      _id
    ]
  ))
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          updated: req.body
        });
    })
    .catch(next);
}

function removeWork(req, res, next) {
  var _id = (req.params.work);
    access(req)
  .then(req.app.locals.db.result('DELETE FROM Works WHERE id = $1', _id))
    .then(function (result) {
      /* jshint ignore:start */
      res.status(200)
        .json({
          status: 'success',
          deleted: _id
        });
      /* jshint ignore:end */
    })
    .catch(next);
}
const AuthError = require('./errors').AuthError;
const InputError = require('./errors').InputError;

module.exports = {
	upsertArtist,
	getArtist,
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

function getArtist(req, res, next) {
  access(req)
  .then(({id}) => {
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


function upsertArtist(req, res, next) {
  access(req)
  .then(({id}) => {
    // const id = (req.params.id);
    req.app.locals.db.one(`
      WITH upsert AS (
      UPDATE Artist SET continent=$(continent), url=$(url), filename=$(filename), filedata=$(filedata), name=$(name),
                  description=$(description), transport=$(transport), legal=$(legal), auction=$(auction), print=$(print),
                  digital=$(digital), agent=$(agent), contact=$(contact), waitlist=$(waitlist), postage=$(postage)
      WHERE people_id = $(people_id)
      RETURNING *)
      INSERT INTO Artist
                   (
                     people_id, name, continent, url, filename, filedata,
                     description, transport, legal, auction, print, digital, agent, contact, waitlist, postage
                   )
      SELECT 
                     $(people_id), $(name), $(continent), $(url), $(filename),
                     $(filedata), $(description), $(transport), $(legal),
                     $(auction), $(print), $(digital), $(agent), $(contact), $(waitlist), $(postage)
      WHERE NOT EXISTS (SELECT * FROM upsert)
      RETURNING people_id`, req.body)
    return id
      }
    )
    .then((people_id)=> {
      res.status(200)
        .json({
          status: 'success',
          upserted: people_id
        });
    })
    .catch(next);
  }


/**** WORKS ***/

function getWorks(req, res, next) {
  access(req)
  .then(({id}) => {
    return req.app.locals.db.any(`
      SELECT *
        FROM Works
       WHERE people_id = $1`, id)
    }
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
    access(req)
  .then(({id}) => {
    const work = req.params.work
    return req.app.locals.db.one(`
      SELECT *
        FROM Works
       WHERE id = $1`, work)}
  )
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(next);
}


function createWork(req, res, next) {
  access(req)
  .then(({id}) => {
    return req.app.locals.db.one(`
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
          RETURNING id`, req.body)
    })
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
  access(req)
  .then(({id}) => {
    const work = req.params.work
    return req.app.locals.db.none(`
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
      work])
  })
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
  const work = (req.params.work);
    access(req)
  .then(req.app.locals.db.result('DELETE FROM Works WHERE id = $1', work))
    .then(function (result) {
      /* jshint ignore:start */
      res.status(200)
        .json({
          status: 'success',
          deleted: work
        });
      /* jshint ignore:end */
    })
    .catch(next);
}

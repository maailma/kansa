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
    .then(({ id }) => req.app.locals.db.oneOrNone(`SELECT * FROM Artist WHERE people_id = $1`, id))
    .then(data => res.status(200).json(data || {}))
    .catch(next);
}

function upsertArtist(req, res, next) {
  access(req)
    .then(({ id }) => {
      const artist = Object.assign({}, req.body, { people_id: id });
      const keys = [
        'people_id', 'name', 'continent', 'url', 'filename', 'filedata',
        'category', 'description', 'transport', 'auction', 'print', 'digital',
        'legal', 'agent', 'contact', 'waitlist', 'postage'
      ].filter(key => artist.hasOwnProperty(key));
      const insertValues = keys.map(key => `$(${key})`).join(', ');
      const insertArtist = `(${keys.join(', ')}) VALUES(${insertValues})`;
      const updateArtist = keys.map(key => `${key}=$(${key})`).join(', ');
      return req.app.locals.db.one(`
        INSERT INTO Artist ${insertArtist}
        ON CONFLICT (people_id)
          DO UPDATE SET ${updateArtist}
          RETURNING people_id`, artist)
    })
    .then(people_id => res.status(200).json({ status: 'success', people_id }))
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

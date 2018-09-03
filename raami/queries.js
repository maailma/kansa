const AuthError = require('./errors').AuthError
const InputError = require('./errors').InputError
const csv = require('csv-express')
const fs = require('fs')
const path = require('path')
const archiver = require('archiver')

module.exports = {
  upsertArtist,
  getArtist,
  getWork,
  getWorks,
  createWork,
  updateWork,
  removeWork,
  exportArtists,
  exportPreview,
  exportWorks
}

function access(req) {
  const id = parseInt(req.params.id)
  if (isNaN(id) || id < 0)
    return Promise.reject(new InputError('Bad id number'))
  if (!req.session || !req.session.user || !req.session.user.email)
    return Promise.reject(new AuthError())
  return req.app.locals.db
    .oneOrNone('SELECT email FROM kansa.People WHERE id = $1', id)
    .then(data => {
      if (
        !data ||
        (!req.session.user.raami_admin && req.session.user.email !== data.email)
      )
        throw new AuthError()
      return {
        id
      }
    })
}

function getArtist(req, res, next) {
  access(req)
    .then(({ id }) =>
      req.app.locals.db.oneOrNone(
        `SELECT * FROM Artist WHERE people_id = $1`,
        id
      )
    )
    .then(data => res.status(200).json(data || {}))
    .catch(next)
}

function upsertArtist(req, res, next) {
  access(req)
    .then(({ id }) => {
      const artist = Object.assign({}, req.body, { people_id: id })
      const keys = [
        'people_id',
        'name',
        'continent',
        'url',
        'filename',
        'filedata',
        'category',
        'description',
        'transport',
        'auction',
        'print',
        'digital',
        'legal',
        'agent',
        'contact',
        'waitlist',
        'postage',
        'half'
      ].filter(key => artist.hasOwnProperty(key))
      const insertValues = keys.map(key => `$(${key})`).join(', ')
      const insertArtist = `(${keys.join(', ')}) VALUES(${insertValues})`
      const updateArtist = keys.map(key => `${key}=$(${key})`).join(', ')
      return req.app.locals.db.one(
        `
        INSERT INTO Artist ${insertArtist}
        ON CONFLICT (people_id)
          DO UPDATE SET ${updateArtist}
          RETURNING people_id`,
        artist
      )
    })
    .then(people_id => res.status(200).json({ status: 'success', people_id }))
    .catch(next)
}

/**** WORKS ***/

function getWorks(req, res, next) {
  access(req)
    .then(({ id }) =>
      req.app.locals.db.any(`SELECT * FROM Works WHERE people_id=$1`, id)
    )
    .then(data => res.status(200).json(data))
    .catch(next)
}

function getWork(req, res, next) {
  access(req)
    .then(({ id }) => {
      const params = Object.assign({}, req.params, { people_id: id })
      req.app.locals.db.one(
        `SELECT * FROM Works WHERE id=$(work) AND people_id=$(people_id)`,
        params
      )
    })
    .then(data => res.status(200).json(data))
    .catch(next)
}

function createWork(req, res, next) {
  access(req)
    .then(({ id }) => {
      const work = Object.assign({}, req.body, { people_id: id })
      const keys = [
        'people_id',
        'title',
        'width',
        'height',
        'depth',
        'gallery',
        'original',
        'orientation',
        'technique',
        'filename',
        'filedata',
        'year',
        'price',
        'start',
        'sale',
        'copies',
        'form',
        'permission'
      ].filter(key => work.hasOwnProperty(key))
      const insertValues = keys.map(key => `$(${key})`).join(', ')
      return req.app.locals.db.one(
        `
        INSERT INTO Works
                    (${keys.join(', ')})
             VALUES (${insertValues})
          RETURNING id`,
        work
      )
    })
    .then(({ id }) => res.status(200).json({ status: 'success', inserted: id }))
    .catch(next)
}

function updateWork(req, res, next) {
  access(req)
    .then(({ id }) => {
      const work = Object.assign({}, req.body, {
        people_id: id,
        work: req.params.work
      })
      const keys = [
        'people_id',
        'title',
        'width',
        'height',
        'depth',
        'gallery',
        'original',
        'orientation',
        'technique',
        'filename',
        'filedata',
        'year',
        'price',
        'start',
        'sale',
        'copies',
        'form',
        'permission'
      ].filter(key => work.hasOwnProperty(key))
      const updateWork = keys.map(key => `${key}=$(${key})`).join(', ')
      return req.app.locals.db.none(
        `
        UPDATE Works
           SET ${updateWork}
         WHERE id=$(work) AND people_id=$(people_id)`,
        work
      )
    })
    .then(() => res.status(200).json({ status: 'success' }))
    .catch(next)
}

function removeWork(req, res, next) {
  access(req)
    .then(({ id }) =>
      req.app.locals.db.result(
        `
      DELETE FROM Works
       WHERE id=$(work) AND people_id=$(people_id)`,
        { people_id: id, work: req.params.work }
      )
    )
    .then(() => res.status(200).json({ status: 'success' }))
    .catch(next)
}

/**** exports ****/

function exportArtists(req, res, next) {
  if (!req.session.user.raami_admin)
    return res.status(401).json({ status: 'unauthorized' })
  req.app.locals.db
    .any(
      `
    SELECT p.member_number, p.membership, p.legal_name, p.email, p.city, p.country,
        a.name, a.continent, a.url,
        a.category, a.description, a.transport, a.auction, a.print, a.digital, a.half,
        a.legal, a.agent, a.contact, a.waitlist, a.postage
        FROM Artist as a, kansa.people as p WHERE a.people_id = p.ID order by p.member_number
    `
    )
    .then(data => res.status(200).csv(data, true))
    .catch(next)
}

function exportPreview(req, res, next) {
  //const dir = '/tmp/raamitmp/'
  const output = fs.createWriteStream('/tmp/raamipreview.zip')
  const zip = archiver('zip', {
    store: true // Sets the compression method to STORE.
  })
  output.on('close', () => {
    console.log(zip.pointer() + ' total bytes')
    fs.stat('/tmp/raamipreview.zip', (err, stats) => {
      if (err) return console.error(err)
      console.log(stats)
    })
    res.sendFile(path.resolve('/tmp/raamipreview.zip'))
  })
  zip.on('error', err => {
    throw err
  })

  if (!req.session.user.raami_admin)
    return res.status(401).json({ status: 'unauthorized' })
  req.app.locals.db
    .any(
      `
		SELECT w.filedata, w.filename, a.name
		  FROM Works w LEFT JOIN Artist a USING (people_id)
		 WHERE w.filedata IS NOT NULL`
    )
    .then(data => {
      zip.pipe(output)
      for (img of data) {
        const imgdata = img.filedata.match(/^data:([A-Za-z-+\/]*);base64,(.+)$/)
        if (imgdata) {
          const buffer3 = new Buffer.from(imgdata[2], 'base64')
          zip.append(buffer3, { name: img.name + '_' + img.filename })
        }
        // fs.writeFile(dir+img.name+'_'+img.filename, img.filedata, (err)=>{
        //     if (err) throw err
        // })
        // console.log(dir+img.name+'_'+img.filename+' saved')
      }
      //archive.directory(dir);
      zip.finalize()
    })
    .catch(next)
}

function exportWorks(req, res, next) {
  const { user } = req.session || {}
  if (!user || !user.raami_admin) return next(new AuthError())
  req.app.locals.db
    .any(
      `
    SELECT a.name, a.people_id AS artist_id, w.id AS work_id,
           w.title, w.width, w.height, w.depth, w.technique, w.orientation,
           w.graduation, w.filename, w.price, w.gallery, w.year, w.original,
           w.copies, w.start, w.sale, w.permission, w.form
      FROM Works w LEFT JOIN Artist a USING (people_id)`
    )
    .then(data => res.csv(data, true))
    .catch(next)
}

const AuthError = require('./errors').AuthError;
const InputError = require('./errors').InputError;
const csv = require('csv-express');

module.exports = {
	getVolunteers,
	getVolunteer,
	upsertVolunteer,
  exportVolunteers
};

function access(req) {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id < 0) return Promise.reject(new InputError('Bad id number'));
  if (!req.session || !req.session.user || !req.session.user.email) return Promise.reject(new AuthError());
  return req.app.locals.db.oneOrNone('SELECT email FROM kansa.People WHERE id = $1', id)
    .then(data => {
      if (!data || !req.session.user.voltti_admin && req.session.user.email !== data.email) throw new AuthError();
      return { id };
    });
}

function getVolunteers(req, res, next) {
  if (!req.session.user || !req.session.user.voltti_admin) return next(new AuthError())
  req.app.locals.db.any(`SELECT * FROM Volunteers`)
    .then(data => res.json(data))
    .catch(next);
}

function getVolunteer(req, res, next) {
  access(req)
    .then(({ id }) => req.app.locals.db.oneOrNone(`SELECT * FROM Volunteers WHERE people_id = $1`, id))
    .then(data => res.json(data || {}))
    .catch(next)
}

function upsertVolunteer(req, res, next) {
  access(req)
    .then(({ id }) => {
      const volunteer = Object.assign({}, req.body, { people_id: id });
      const keys = [
        'people_id', 'birth', 'phone', 'experience', 'jv', 'hygiene', 'firstaid', 'languages', 'tshirt' , 'allergies',
        'hugo', 'ex_mimo', 'ex_con', 'reg', 'outreach', 'program', 'helpdesk', 'logistic', 'turva', 'ops', 'site', 'members', 'design', 'events', 'notes','hours',
        'day_in', 'day_1', 'day_2', 'day_3', 'day_4', 'day_5', 'day_out'
      ].filter(key => volunteer.hasOwnProperty(key));
      const insertValues = keys.map(key => `$(${key})`).join(', ');
      const insertVolunteer = `(${keys.join(', ')}) VALUES(${insertValues})`;
      const updateVolunteer = keys.map(key => `${key}=$(${key})`).join(', ');
      return req.app.locals.db.none(`
        INSERT INTO Volunteers ${insertVolunteer}
        ON CONFLICT (people_id) DO UPDATE SET ${updateVolunteer}`, volunteer)
    })
    .then(() => res.json({ status: 'success' }))
    .catch(next)
}


/**** export CSV ****/

function exportVolunteers(req, res, next) {
  if (!req.session.user.voltti_admin) return next(new AuthError())
  req.app.locals.db.any(`
    SELECT p.member_number, p.membership, p.legal_name, p.email, p.city, p.country,
        v.people_id, v.birth, v.phone, v.experience, v.jv, v.hygiene, v.firstaid, v.languages, v.tshirt, v.allergies,
        v.hugo, v.ex_mimo, v.ex_con, v.reg, v.outreach, v.program, v.helpdesk, v.logistic, v.turva, v.ops, v.site, v.members, v.design, v.events, v.notes, v.hours,
        v.day_in, v.day_1, v.day_2, v.day_3, v.day_4, v.day_5, v.day_out
        FROM Volunteers as v, kansa.people as p WHERE a.people_id = p.id order by p.member_number
  `)
    .then((data) => res.csv(data, true))
    .catch(next)
}

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
      return {
        id,
      };
    });
}

function getVolunteers(req, res, next) {
  access(req)
    .then(({ id }) => req.app.locals.db.oneOrNone(`SELECT * FROM Volunteer`))
    .then(data => res.status(200).json(data || {}))
    .catch(next);
}

function getVolunteer(req, res, next) {
  access(req)
    .then(({ id }) => req.app.locals.db.oneOrNone(`SELECT * FROM Volunteer WHERE people_id = $1`, id))
    .then(data => res.status(200).json(data || {}))
    .catch(next);
}

// 'people_id', 'birth', 'phone', 'experience', 'JV', 'hygiene', 'firstaid', 'languages', 'tshirt' , 'allergies'
// hugo, ex_mimo, ex_con, reg, outreach, program, helpdesk, logistic, turva, ops, site, members, design, notes
function upsertVolunteer(req, res, next) {
  access(req)
    .then(({ id }) => {
      const volunteer = Object.assign({}, req.body, { people_id: id });
      const keys = [
        'people_id', 'birth', 'phone', 'experience', 'JV', 'hygiene', 'firstaid', 'languages', 'tshirt' , 'allergies',
        'hugo', 'ex_mimo', 'ex_con', 'reg', 'outreach', 'program', 'helpdesk', 'logistic', 'turva', 'ops', 'site', 'members', 'design', 'notes'
      ].filter(key => volunteer.hasOwnProperty(key));
      const insertValues = keys.map(key => `$(${key})`).join(', ');
      const insertVolunteer = `(${keys.join(', ')}) VALUES(${insertValues})`;
      const updateVolunteer = keys.map(key => `${key}=$(${key})`).join(', ');
      return req.app.locals.db.one(`
        INSERT INTO Volunteer ${insertVolunteer}
        ON CONFLICT (people_id)
          DO UPDATE SET ${updateVolunteer}
          RETURNING people_id`, volunteer)
    })
    .then(people_id => res.status(200).json({ status: 'success', people_id }))
    .catch(next);
}


/**** export CSV ****/

function exportVolunteers(req, res, next) {
     if (!req.session.user.voltti_admin) return res.status(401).json({ status: 'unauthorized' });
    req.app.locals.db.any(`
    SELECT p.member_number, p.membership, p.legal_name, p.email, p.city, p.country,
        v.people_id, v.birth, v.phone, v.experience, v.JV, v.hygiene, v.firstaid, v.languages, v.tshirt, v.allergies,
        v.hugo, v.ex_mimo, v.ex_con, v.reg, v.outreach, v.program, v.helpdesk, v.logistic, v.turva, v.ops, v.site, v.members, v.design, v.notes
        FROM Volunteer as v, kansa.people as p WHERE a.people_id = p.ID order by p.member_number
    `)
    .then((data) => res.status(200).csv(data, true))
    .catch(next)
}
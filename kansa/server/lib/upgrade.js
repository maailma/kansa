const LogEntry = require('./types/logentry');
const Person = require('./types/person');
const InputError = require('./types/inputerror');

module.exports = { authUpgradePerson, upgradePerson };

function verifyUpgrade(data) {
  const checks = {
    membership: Person.cleanMemberType,
    paper_pubs: Person.cleanPaperPubs
  };
  for (const key in checks) {
    if (data.hasOwnProperty(key)) try {
      data[key] = checks[key](data[key]);
    } catch (e) {
      throw new Error(`${key}: ${e.message}`);
    }
  }
  if (data.membership === 'NonMember') throw new Error(`Can't "upgrade" to NonMember`);
}

function upgradePaperPubs(req, db, data) {
  if (!data.paper_pubs) throw new InputError('No valid parameters');
  const log = new LogEntry(req, 'Add paper pubs');
  return db.tx(tx => tx.batch([
    tx.one(`
         UPDATE People
            SET paper_pubs=$(paper_pubs)
          WHERE id=$(id) AND membership != 'NonMember'
      RETURNING member_number`,
      data),
    tx.none(`INSERT INTO Log ${log.sqlValues}`, log)
  ]))
    .then((results) => ({
      member_number: results[0].member_number,
      updated: ['paper_pubs']
    }))
    .catch(err => {
      if (!err[0].success && err[1].success && err[0].result.message == 'No data returned from the query.') {
        const err2 = new Error('Paper publications are only available for members');
        err2.status = 402;
        throw err2;
      } else {
        throw err;
      }
    });
}

function upgradeMembership(req, db, data) {
  const set = [ 'membership=$(membership)' ];
  let member_number;
  return db.tx(tx => tx.sequence((i, prev) => { switch (i) {

    case 0:
      return tx.one(`
        SELECT membership, member_number
          FROM People
         WHERE id=$1`,
        data.id);

    case 1:
      const prevTypeIdx = Person.membershipTypes.indexOf(prev.membership);
      const nextTypeIdx = Person.membershipTypes.indexOf(data.membership);
      if (nextTypeIdx <= prevTypeIdx) throw new InputError(`Can't "upgrade" from ${prev.membership} to ${data.membership}`);
      if (!parseInt(prev.member_number)) set.push("member_number=nextdamm('member_number_seq')");
      if (data.paper_pubs) set.push('paper_pubs=$(paper_pubs)');
      return tx.one(`
           UPDATE People
              SET ${set.join(', ')}
            WHERE id=$(id)
        RETURNING member_number`, data);

    case 2:
      member_number = prev.member_number;
      const log = new LogEntry(req, `Upgrade to ${data.membership}`);
      if (data.paper_pubs) log.description += ' and add paper pubs';
      log.subject = data.id;
      return tx.none(`INSERT INTO Log ${log.sqlValues}`, log);

  }}))
    .then(() => ({
      member_number,
      updated: set.map(sql => sql.replace(/=.*/, ''))
    }));
}

function upgradePerson(req, db, data) {
  try {
    verifyUpgrade(data);
  } catch (err) {
    return Promise.reject(err)
  }
  return data.membership
    ? upgradeMembership(req, db, data)
    : upgradePaperPubs(req, db, data);
}

function authUpgradePerson(req, res, next) {
  if (!req.session.user.member_admin) return res.status(401).json({ status: 'unauthorized' });
  const data = Object.assign({}, req.body, {
    id: parseInt(req.params.id)
  });
  upgradePerson(req, req.app.locals.db, data)
    .then(({ member_number, updated }) => res.status(200).json({ status: 'success', member_number, updated }))
    .catch(next);
}

const LogEntry = require('./types/logentry');
const Person = require('./types/person');
const InputError = require('./types/inputerror');

module.exports = { upgradePerson };

function upgradePaperPubs(req, res, next, { paper_pubs }) {
  if (!paper_pubs) return res.status(400).json({ status: 'error', message: 'No valid parameters' });
  const log = new LogEntry(req, 'Add paper pubs');
  const id = log.subject = parseInt(req.params.id);
  req.app.locals.db.tx(tx => tx.batch([
    tx.one(`UPDATE People SET paper_pubs=$(paper_pubs) WHERE id=$(id) AND membership != 'NonMember' RETURNING true`,
      { id, paper_pubs }),
    tx.none(`INSERT INTO Log ${log.sqlValues}`, log)
  ]))
    .then(() => res.status(200).json({ status: 'success', updated: ['paper_pubs'] }))
    .catch(err => (!err[0].success && err[1].success && err[0].result.message == 'No data returned from the query.')
      ? res.status(402).json({ status: 'error', message: 'Paper publications are only available for members' })
      : next(err));
}

function upgradeMembership(req, res, next, { membership, member_number, paper_pubs }) {
  const id = parseInt(req.params.id);
  const fields = [ 'membership', 'member_number' ];
  if (paper_pubs) fields.push('paper_pubs');
  req.app.locals.db.tx(tx => tx.sequence((i, data) => { switch (i) {
    case 0:
      return tx.one('SELECT membership, member_number FROM People WHERE id=$1', id);
    case 1:
      const prevTypeIdx = Person.membershipTypes.indexOf(data.membership);
      const nextTypeIdx = Person.membershipTypes.indexOf(membership);
      if (nextTypeIdx <= prevTypeIdx) throw new InputError(`Can't "upgrade" from ${data.membership} to ${membership}`);
      if (member_number) {
        if (parseInt(data.member_number)) throw new InputError('Member number already set');
        return {};
      } else {
        return tx.one('SELECT max(member_number) FROM People');
      }
    case 2:
      if (data.hasOwnProperty('max')) member_number = Person.nextMemberNumber(data.max);
      const sqlFields = fields.map(fn => `${fn}=$(${fn})`).join(', ');
      return tx.one(`UPDATE People SET ${sqlFields} WHERE id=$(id) RETURNING true`, { id, membership, member_number, paper_pubs });
    case 3:
      const log = new LogEntry(req, `Upgrade to ${membership}`);
      if (paper_pubs) log.description += ' and add paper pubs';
      log.subject = id;
      return tx.none(`INSERT INTO Log ${log.sqlValues}`, log);
  }}))
    .then(() => { res.status(200).json({ status: 'success', updated: fields }); })
    .catch(err => next(err));
}

function upgradePerson(req, res, next) {
  if (!req.session.user.member_admin) return res.status(401).json({ status: 'unauthorized' });
  const data = Object.assign({}, req.body);
  const checks = {
    membership: Person.cleanMemberType,
    member_number: Person.cleanMemberNumber,
    paper_pubs: Person.cleanPaperPubs
  };
  for (const key in checks) {
    if (data.hasOwnProperty(key)) try {
      data[key] = checks[key](data[key]);
    } catch (e) {
      return res.status(400).json({ status: 'error', message: `${key}: ${e.message}` });
    }
  }
  if (data.membership === 'NonMember') {
    return res.status(400).json({ status: 'error', message: `Can't "upgrade" to NonMember` });
  } else if (!data.membership) {
    upgradePaperPubs(req, res, next, data);
  } else {
    upgradeMembership(req, res, next, data);
  }
}

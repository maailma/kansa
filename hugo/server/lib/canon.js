const AuthError = require('./errors').AuthError;
const InputError = require('./errors').InputError;

class Canon {
  static verifyCanonAccess(req, res, next) {
    const user = req.session.user;
    if (user.hugo_admin) {
      next();
    } else {
      next(new AuthError());
    }
  }

  constructor(pgp, db) {
    this.pgp = pgp;
    this.db = db;
    this.getCanon = this.getCanon.bind(this);
    this.getNominations = this.getNominations.bind(this);
    this.classify = this.classify.bind(this);
  }

  getCanon(req, res, next) {
    this.db.any(`SELECT category, nomination FROM Canon`)
      .then(data => res.status(200).json(data.reduce((canon, { category, nomination }) => {
        if (canon.hasOwnProperty(category)) {
          canon[category].push(nomination);
        } else {
          canon[category] = [ nomination ];
        }
        return canon;
      }, {})))
      .catch(next);
  }

  getNominations(req, res, next) {
    this.db.any(`
      SELECT DISTINCT ON (category, nomination)
      category, nomination, canon
      FROM CurrentNominations
      ORDER BY category, nomination
    `)
      .then(data => res.status(200).json(data.reduce((nominations, { category, nomination, canon }) => {
        const entry = { raw: nomination };
        if (canon) entry.canon = canon;
        if (nominations.hasOwnProperty(category)) {
          nominations[category].push(entry);
        } else {
          nominations[category] = [ entry ];
        }
        return nominations;
      }, {})))
      .catch(next);
  }

  classify(req, res, next) {
    if (!req.body) return next(new InputError('Empty POST body!?'));
    const category = req.body.category;
    const src = req.body.nominations;
    const tgt = req.body.canon;
    if (!category || !src || !src.length || !tgt) {
      return next(new InputError('Required fields: category, nominations, canon'));
    }
    const cs = new this.pgp.helpers.ColumnSet([
      'category',
      { name: 'nomination', mod: ':json' },
      'canon_id'
    ], {
      table: 'classification'
    });
    this.db.tx(tx => tx.sequence((i, data) => { switch (i) {
      case 0:
        return tx.one(`
          INSERT INTO Canon (category, nomination)
          VALUES ($(category), $(nomination)::jsonb)
          ON CONFLICT (category, nomination)
            DO UPDATE SET category = EXCLUDED.category
          RETURNING id
        `, { category, nomination: tgt });  //
      case 1:
        const insert = this.pgp.helpers.insert(src.map(
          nomination => ({ category, nomination, canon_id: data.id })
        ), cs);
        return tx.none(`
          ${insert}
          ON CONFLICT (category, nomination)
            DO UPDATE SET canon_id = EXCLUDED.canon_id
        `);
    }}))
      .then(() => res.status(200).json({ status: 'success' }))
      .catch(next);
  }
}

module.exports = Canon;

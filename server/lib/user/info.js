const Person = require('../people/person')

module.exports = function getInfo(db, config, req) {
  const { user } = req.session
  const email = (user.member_admin && req.query.email) || user.email
  return db.task(async t => {
    const people = await t.any(
      `${Person.SELECT}
        WHERE email=$1
        ORDER BY coalesce(public_last_name, preferred_name(p))`,
      email
    )
    const roleData = await t.oneOrNone(
      `SELECT ${config.auth.admin_roles.join(', ')}
      FROM admin.Admins WHERE email=$1`,
      email
    )
    const roles = roleData ? Object.keys(roleData).filter(r => roleData[r]) : []
    return { email, people, roles }
  })
}

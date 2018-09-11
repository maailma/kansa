const config = require('@kansa/common/config')

module.exports = getConfig

function getConfig(db) {
  return db
    .any(
      `SELECT membership, badge, hugo_nominator, member, wsfs_member
      FROM membership_types`
    )
    .then(rows => {
      const membershipTypes = {}
      rows.forEach(({ membership, ...props }) => {
        membershipTypes[membership] = props
      })
      return Object.assign({ membershipTypes }, config, { auth: undefined })
    })
}

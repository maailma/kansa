module.exports = async function eventsLogin(ts, ctx, user) {
  const { events } = ctx.config.modules
  if (!events || !user.email || user.events_admin) return
  const isEditor = await ts.oneOrNone(
    `SELECT true FROM events.permission WHERE user_email = $1`,
    user.email
  )
  if (isEditor) {
    user.events_editor = true
    return
  }
  let test
  switch (events.participants) {
    case 'everyone':
      user.events_participant = true
      return
    case 'members':
      test = `kansa.people p
          LEFT JOIN kansa.membership_types m USING (membership)
          WHERE p.email = $1 AND m.member = true`
      break
    case 'selected':
      test = `events.participant e
          LEFT JOIN kansa.people p ON (e.person_id = p.id)
          WHERE p.email = $1`
      break
    case 'confirmed':
      test = `events.participant e
          LEFT JOIN kansa.people p ON (e.person_id = p.id)
          LEFT JOIN events.participant_status s USING (status_id)
          WHERE p.email = $1 AND s.name = 'confirmed'`
      break
  }
  if (test) {
    const isParticipant = await ts.oneOrNone(
      `SELECT true FROM ${test} LIMIT 1`,
      user.email
    )
    user.events_participant = !!isParticipant
  } else {
    user.events_participant = false
  }
}

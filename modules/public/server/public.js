module.exports = {
  getDaypassStats,
  getPublicPeople,
  getPublicStats
}

function getDaypassStats(db, csv) {
  return db.any('SELECT * FROM daypass_stats').then(rows => {
    if (csv) return rows
    const data = { Wed: {}, Thu: {}, Fri: {}, Sat: {}, Sun: {} }
    rows.forEach(row => {
      Object.keys(data).forEach(day => {
        if (row[day]) data[day][row.status] = row[day]
      })
    })
    return data
  })
}

function getPublicPeople(db) {
  return db.any('SELECT * FROM public_members')
}

function getPublicStats(db, csv) {
  return db.any('SELECT * from country_stats').then(rows => {
    if (csv) return rows
    const data = {}
    rows.forEach(({ country, membership, count }) => {
      const c = data[country]
      if (c) c[membership] = Number(count)
      else data[country] = { [membership]: Number(count) }
    })
    return data
  })
}

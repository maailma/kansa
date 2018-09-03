const fs = require('fs')
const csvParseSync = require('csv-parse/lib/sync')

class PaperPubs {
  constructor(argv, csvOptions) {
    const idx = argv.indexOf('--paperpubs') + 1
    const src = idx > 0 && argv[idx]
    const csv = src && fs.readFileSync(src, { encoding: 'utf8' })
    this.data = src && csvParseSync(csv, csvOptions)
  }

  get(id, name) {
    if (!this.data) throw new Error('Paper pubs data is null!')
    const match = this.data.filter(rec => rec.ID == id || rec.Name == name)
    switch (match.length) {
      case 0:
        throw new Error(`No paper pubs found for ${name}, pp ID ${id}`)
      case 1:
        const rec = match[0]
        if (rec._found)
          throw new Error(
            `Paper pubs re-match for ${name}, pp ID ${id}! ${JSON.stringify(
              pp
            )}`
          )
        rec._found = true
        return rec
      default:
        throw new Error(
          `Multiple matches found for ${name}, pp ID ${id}! ${JSON.stringify(
            match
          )}`
        )
    }
  }

  getData(id, name) {
    const rec = this.get(id, name)
    const d = {
      paper_pubs: {
        name: rec.Name,
        address: rec.Address.replace(/\\n/g, '\n'),
        country: rec.Country
      },
      timestamp: `${rec.Date} UTC`
    }
    if (rec.Comments) d.comment = rec.Comments
    return d
  }

  remaining() {
    return this.data.filter(rec => !rec._found)
  }
}

module.exports = PaperPubs

const fs = require('fs')
const csvParseSync = require('csv-parse/lib/sync')

const startDate = '2015-08-18'

const src = process.argv[2]
const csv = src && fs.readFileSync(src, { encoding: 'utf8' })
const data = csv && csvParseSync(csv, { columns: true, skip_empty_lines: true })
if (!data) throw new Error('No data!? Usage: node index.js data.csv')

const dates = {}
data.forEach(({ add_date, add_ms, up_date, up_ms }) => {
  if (!dates[add_date]) {
    dates[add_date] = { [add_ms]: 1 }
  } else {
    const n = dates[add_date][add_ms] || 0
    dates[add_date][add_ms] = n + 1;
  }
  if (up_ms) {
    if (!dates[up_date]) {
      dates[up_date] = { [add_ms]: -1, [up_ms]: 1 }
    } else {
      const n0 = dates[up_date][add_ms] || 0
      const n1 = dates[up_date][up_ms] || 0
      dates[up_date][add_ms] = n0 - 1
      dates[up_date][up_ms] = n1 + 1
    }
  }
});

const sum = {Adult:0,Unwaged:0,Youth:0,Child:0,KidInTow:0,Exhibitor:0,Helper:0,Supporter:0,NonMember:0}
const types = Object.keys(sum)
console.log(['date', ...types].join(','));
Object.keys(dates).sort().forEach(date => {
  const src = dates[date]
  Object.keys(src).forEach(type => sum[type] += src[type])
  console.log([date, ...types.map(type => sum[type])].join(','))
  //sums[date] = Object.assign({}, sum)
})

//console.log(JSON.stringify(sums));

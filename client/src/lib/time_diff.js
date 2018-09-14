// generated in part from messageformat.js output;
// should be replaced by build-time generation

const select = (value, data) =>
  ({}.hasOwnProperty.call(data, value) ? data[value] : data.other)
const txt = ({ t, unit, past }) =>
  t +
  ' ' +
  select(unit, {
    0: 'seconds',
    1: 'minutes',
    2: 'hours',
    3: 'days',
    4: 'weeks',
    5: 'months',
    6: 'years',
    other: '???'
  }) +
  ' ' +
  select(past, { true: 'ago', other: 'from now' })

export default t => {
  const d = (Date.now() - t) / 1e3
  const s = [1, 60, 60, 24, 7, 4.333, 12, 1e9]
  let a = Math.abs(d)
  if (a < 20) return 'just now'
  for (let i = 0, l = s.length; i < l; ++i) {
    if ((a /= s[i]) < 2)
      return txt({ t: ~~(a *= s[i]), unit: i - 1, past: d > 0 })
  }
}

function categoryString({ category, finalists }, wrap) {
  const fi = finalists && finalists.filter(f => f)
  if (!fi || fi.length === 0) return null
  const title = category.charAt(0) + category.slice(1).replace(/[A-Z]/g, ' $&')
  const votes = fi.map((finalist, i) => `  ${i + 1}. ` + wrap('     ', finalist))
  return `${title}:\n${votes.join('\n')}`
}

module.exports = (data, wrap) => {
  data.votes = data.votes
    .map(v => categoryString(v, wrap))
    .filter(s => s)
    .join('\n\n')
}

function categoryString({ category, nominations }, wrap) {
  const title = category.charAt(0) + category.slice(1).replace(/[A-Z]/g, ' $&')
  const cn = nominations.map(n => {
    const ns = Object.values(n).join('; ')
    return '  - ' + wrap('    ', ns)
  })
  return `${title}:\n${cn.join('\n')}`
}

module.exports = (data, wrap) => {
  data.nominations = data.nominations
    .map(n => categoryString(n, wrap))
    .join('\n\n')
}

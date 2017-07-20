const apiRoot = process.env.API_URI_ROOT
const loginRoot = process.env.LOGIN_URI_ROOT

function barcodeUri({ key, memberId }) {
  const parts = [apiRoot, 'barcode', key, memberId]
  return encodeURI(parts.join('/'))
}

function loginUri({ email, key, memberId, path }) {
  const parts = [loginRoot, email, key]
  if (memberId) parts.push(memberId)
  let uri = parts.join('/')
  if (!memberId && path) {
    const m = path.match(/\/#(.*)\?_k=/)
    if (m) path = m[1]
    if (path !== '/') uri += '?next=' + path
  }
  return encodeURI(uri)
}

module.exports = { barcodeUri, loginUri }

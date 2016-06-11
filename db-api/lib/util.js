module.exports = { isTrueish, forceBool, forceInt };

function isTrueish(v) {
  if (!v) return false;
  if (typeof v === 'boolean') return v;
  const s = v.toString().trim();
  return s !== '' && s !== '0' && s.toLowerCase() !== 'false';
}

function forceBool(obj, prop) {
  const src = obj[prop];
  if (obj.hasOwnProperty(prop) && typeof src !== 'boolean') {
    obj[prop] = isTrueish(src);
  }
}

function forceInt(obj, prop) {
  const src = obj[prop];
  if (obj.hasOwnProperty(prop) && !Number.isInteger(src)) {
    obj[prop] = src ? parseInt(src) : null;
  }
}

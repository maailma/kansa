module.exports = { forceBool, forceInt };

function forceBool(obj, prop) {
  const src = obj[prop];
  if (obj.hasOwnProperty(prop) && typeof src !== 'boolean') {
    if (src) {
      const s = src.trim().toLowerCase();
      obj[prop] = (s !== '' && s !== '0' && s !== 'false');
    } else {
      obj[prop] = false;
    }
  }
}

function forceInt(obj, prop) {
  const src = obj[prop];
  if (obj.hasOwnProperty(prop) && !Number.isInteger(src)) {
    obj[prop] = src ? parseInt(src) : null;
  }
}

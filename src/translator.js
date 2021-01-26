const locales = require('./locales');

const kw = [
  '$eq',
  '$ne',
  '$in',
  '$nin',
  '$all',
  '$gt',
  '$gte',
  '$lt',
  '$lte',
  '$regex'
];

/**
 *
 * @param {Object} obj the object to reduce to single depth
 * @param {String} parent only used for internal recursive calls
 */
function reduce(obj = {}, parent = '') {
  const result = {};
  const path = `${parent}${parent ? '.' : ''}`;
  for (k in obj) {
    if (typeof obj[k] === 'string' || obj[k] instanceof String) {
      result[`${path}${k}`] = obj[k];
    } else if (obj[k] instanceof Number) {
      result[`${path}${k}`] = obj[k];
    } else if (obj[k] instanceof RegExp) {
      result[`${path}${k}`] = obj[k];
    } else if (obj[k] instanceof Date) {
      result[`${path}${k}`] = obj[k];
    } else if (obj[k] instanceof Array) {
      result[`${path}${k}`] = obj[k];
    } else if (typeof obj[k] === 'object') {
      Object.assign(result, reduce(obj[k], `${path}${k}`));
    } else {
      result[`${path}${k}`] = obj[k];
    }
  }

  return result;
}

function getValueString(value = '') {
  let result = `${value}`;
  if (typeof value === 'string') {
    const parts = value.split('/');
    if (parts.length === 3 && parts[1]) {
      // ASSUMES IT FOUND A REGULAR EXPRESSION (update with better regex detection)
      result = parts[1];
    }
  } else if (value instanceof Date) {
    result = `${value.toLocaleString()}`;
  } else if (value instanceof RegExp) {
    result = value.toString().split('/')[1];
  } else if (value instanceof Array) {
    result = value.join(', ');
  }

  return `[ ${result} ]`;
}

/**
 * Translates a MongoDB query into sentences that describe the query based on locale
 *
 * @param {Object} filter MongoDB filter
 * @param {Object} config {labels: Object, locale: String}
 */
function translate(filter = {}, config = { labels: {}, locale: 'en-us' }) {
  const locale = config.locale
    ? locales[config.locale] || locales['en-us']
    : locales['en-us'];
  const r = reduce(filter);
  const keys = Object.keys(r);
  const result = [];
  for (k of keys) {
    const parts = k.split('.');
    const op = kw.indexOf(parts[parts.length - 1]) >= 0 ? parts.pop() : '$eq';
    const path = parts.join('.');
    const label = (config.labels ? config.labels[path] : null) || path;
    const value = r[k];
    result.push(
      `${label} ${locale[op]}`.replace('{value}', `${getValueString(value)}`)
    );
  }

  return result;
}

module.exports = {
  locales,
  translate,
  reduce
};

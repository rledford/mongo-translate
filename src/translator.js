const locales = require('./locales');
const isNumberRegex = new RegExp('^-?(0|[1-9]\\d*)(\\.\\d+)?$');
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
  '$regex',
];

/**
 * Iterates through all keys and nested keys and returns an new object with a depth of 1 where nested object keys are strings using dot notation
 *
 * @param {Object} filter mongodb filter
 */
function depthOne(filter = {}, parent = '') {
  const result = {};
  for (const k in filter) {
    const fullPath = `${parent}${parent ? '.' : ''}`;
    let isRegex = true;
    const regexParts = `${filter[k]}`.split('/');
    const regexBody = regexParts[1];
    const regexOptions = regexParts[2];
    try {
      if (regexBody !== undefined) {
        new RegExp(regexBody, regexOptions);
      } else {
        isRegex = false;
      }
    } catch (err) {
      isRegex = false;
    }
    if (
      typeof filter[k] === 'object' &&
      !Array.isArray(filter[k]) &&
      !isRegex
    ) {
      const nor = depthOne(filter[k], `${fullPath}${k}`);
      for (const n in nor) {
        result[`${n}`] = nor[n];
      }
    } else {
      result[`${fullPath}${k}`] = isRegex ? regexParts[1] : filter[k];
    }
  }
  return result;
}

function getValueString(value = '') {
  const date = new Date(value);
  const isDate = !Number.isNaN(date.getTime());
  const isNumber = isNumberRegex.test(value);
  const isArray = Array.isArray(value);
  let result = value.toString();
  if (!isNumber && isDate) {
    result = date.toLocaleString();
  } else if (isArray) {
    result = value.join(', ');
  }
  return `[ ${result} ]`;
}

/**
 * Translates a MongoDB query into sentences that describe the query based on locale
 *
 * @param {Object} options {filter: Object, labels: Object, locale: String}
 */
function translate(options = {}) {
  const { filter, labels } = options;
  const locale = options.locale
    ? locales[options.locale] || locales['en-us']
    : locales['en-us'];
  const d = depthOne(filter);
  const keys = Object.keys(d);
  const result = [];
  for (k of keys) {
    const parts = k.split('.');
    const op = kw.indexOf(parts[parts.length - 1]) >= 0 ? parts.pop() : '$eq';
    const path = parts.join('.');
    const label = labels ? labels[path] : null || path;
    const value = d[k];
    result.push(
      `${label} ${locale[op]}`.replace('{value}', `${getValueString(value)}`)
    );
  }

  return result;
}

module.exports = {
  locales,
  translate,
};

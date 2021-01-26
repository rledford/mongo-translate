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
  '$regex'
];

function reduce(obj = {}, parent = '') {
  const result = {};
  const path = `${parent}${parent ? '.' : ''}`;
  for (k in obj) {
    if (typeof obj[k] === 'string') {
      const parts = obj[k].split('/');
      if (parts.length === 3 && parts[1]) {
        // ASSUMES IT FOUND A REGULAR EXPRESSION (update with better regex detection)
        result[parent] = parts[1];
      } else {
        result[parent] = obj[k];
      }
    } else if (obj[k] instanceof Number) {
      result[parent] = obj[k];
    } else if (obj[k] instanceof RegExp) {
      result[parent] = obj[k].toString().split('/')[1];
    } else if (obj[k] instanceof Array) {
      for (let i = 0; i < obj[k].length; i++) {
        typeof obj[k][i] === 'object'
          ? Object.assign(result, reduce(obj[k][i], `${path}${i}`))
          : (result[`${path}${i}`] = obj[k][i]);
      }
    } else if (obj[k] instanceof Date) {
      result[parent] = obj[k].toLocaleString();
    } else if (typeof obj[k] === 'object') {
      Object.assign(result, reduce(obj[k], `${path}${k}`));
    } else {
      result[parent] = obj[k];
    }
  }

  return result;
}

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
    let isDate = filter[k] instanceof Date;
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
      !isRegex &&
      !isDate
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
  const isDate = value instanceof Date || !Number.isNaN(date.getTime());
  const isNumber = isNumberRegex.test(value);
  const isArray = Array.isArray(value);
  const isBoolean =
    ['true', 'false'].indexOf(value.toString().toLowerCase()) >= 0;
  let result = value.toString();
  if (!isNumber && !isBoolean && isDate) {
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
    const label = (labels ? labels[path] : null) || path;
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
  reduce
};

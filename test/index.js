const { translate, locales } = require('../src/translator');

const customLocale = {
  $gt: 'CUSTOM GT LOCALE {value}',
  $gte: 'CUSTOM GTE LOCALE {value}',
  $lt: 'CUSTOM LT LOCALE {value}',
  $lte: 'CUSTOM LTE LOCALE  {value}',
  $in: 'CUSTOM IN LOCALE {value}',
  $nin: 'CUSTOM NIN LOCALE {value}',
  $all: 'CUSTOM ALL LOCALE {value}',
  $eq: 'CUSTOM EQ LOCALE {value}',
  $ne: 'CUSTOM NE LOCALE {value}',
  $regex: 'CUSTOM REGEX LOCALE {value}'
};

const filter = {
  name: {
    $regex: '/^test/i'
  },
  type: {
    $ne: 'TEST'
  },
  organization: {
    $eq: 'TEST'
  },
  tags: {
    $all: ['TEST', 'ALL']
  },
  category: {
    $in: ['TEST', 'IN']
  },
  time: {
    $gt: '2021-01-01',
    $lte: new Date()
  },
  count: {
    $gte: 10,
    $lt: 20
  },
  metrics: {
    total: 1, // no operator $eq
    keys: { $in: ['nested'] },
    data: {
      nested: { $eq: 1 }
    }
  },
  flag: {
    $eq: true
  }
};
const labels = {
  name: 'Name',
  type: 'Type',
  organization: 'Organization',
  tags: 'Tags',
  category: 'Category',
  time: 'Date/Time',
  count: 'Count',
  flag: 'Flag',
  'metrics.total': 'Metrics Total',
  'metrics.keys': 'Metrics Keys',
  'metrics.data.nested': 'Metrics Data Nested'
};

locales.custom = customLocale;

console.log(
  translate({
    filter,
    labels,
    locale: locales.enus
  })
);

console.log(
  translate({
    filter,
    labels,
    locale: 'custom'
  })
);

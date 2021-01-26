const { translate, locales, reduce } = require('../src/translator');

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
  description: {
    $regex: new RegExp('^label', 'g')
  },
  type: {
    $ne: 'TEST'
  },
  asset: {
    $eq: 'asset-0'
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
  description: 'Description',
  type: 'Type',
  asset: 'Asset',
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

console.log('\nTest translate with default locale');
console.log(
  translate(filter, {
    labels,
    locale: locales['en-us']
  })
);

console.log('\nTest translate with custom locale');
console.log(
  translate(filter, {
    labels,
    locale: 'custom'
  })
);

const obj = {
  propA: 1,
  propB: {
    nestedPropA: 1,
    nestedPropB: ['a', 'b', 'c']
  },
  propC: [
    { propA: 1, propB: 2 },
    { propA: 1, propB: 2 }
  ]
};

console.log('\nTest reduce');
console.log('FROM');
console.log(obj);
console.log('TO');
console.log(reduce(obj));

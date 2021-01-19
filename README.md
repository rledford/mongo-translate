## Mongo Translate

Translates MongoDB query filters into sentences. Supports nested properties, custom field labeling, and custom locales. Contributions to support more locales is appreciated (currently only EN-US is supported). The result is an array of translated text for each field.

### Table of Contents

- [Install](#install)
- [Usage](#install)
- [Options](#options)
- [Custom Locale](#custom-locale)

### Install

```bash
npm i -S mongo-translate
```

### Usage

```js
// Import mongo-translate
const mongoTranslate = require('mongo-translate');

// Query Filter Sample
const filter = {
  name: {
    $regex: '/^test/i',
  },
  type: {
    $ne: 'TEST',
  },
  organization: {
    $eq: 'TEST',
  },
  tags: {
    $all: ['TEST', 'ALL'],
  },
  category: {
    $in: ['TEST', 'IN'],
  },
  time: {
    $gt: '2021-01-01',
    $lte: '2021-01-31',
  },
  count: {
    $gte: 10,
    $lt: 20,
  },
  metrics: {
    total: 1, // no operator $eq
    keys: { $in: ['nested'] },
    data: {
      nested: { $eq: 1 },
    },
  },
};

// Custom Field Labels
const labels = {
  name: 'Name',
  type: 'Type',
  organization: 'Organization',
  tags: 'Tags',
  category: 'Category',
  time: 'Date/Time',
  count: 'Count',
  'metrics.total': 'Metrics Total',
  'metrics.keys': 'Metrics Keys',
  'metrics.data.nested': 'Metrics Data Nested',
};

// Translate MongoDB query filter
mongoTranslate.translate({
  filter,
  labels,
  locale: 'enus',
});

/* Output
[
  'Name is like [ ^test ]',
  'Type is not equal to [ TEST ]',
  'Organization is equal to [ TEST ]',
  'Tags includes all [ TEST, ALL ]',
  'Category includes [ TEST, IN ]',
  'Date/Time is greater than [ 12/31/2020, 6:00:00 PM ]',
  'Date/Time is less than or equal to [ 1/30/2021, 6:00:00 PM ]',
  'Count is greater than or equal to [ 10 ]',
  'Count is less than [ 20 ]',
  'Metrics Total is equal to [ 1 ]',
  'Metrics Keys includes [ nested ]',
  'Metrics Data Nested is equal to [ 1 ]'
]
*/
```

### Options

| Property | Type   | Required | Description                                                                                                                                  |
| -------- | ------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| filter   | Object | Yes      | MongoDB query filter                                                                                                                         |
| labels   | Object | No       | Key:Value pairs where the Key matches an expected field or path in the MongoDB query filter, and the Value is a String to use in place of it |
| locale   | String | No       | The locale to use when translating the query filter. Defaults to _en-us_ (English - United States) if missing or invalid                     |

_IMPORTANT_ - Not providing a label for any field that appears in the query filter will result in the path being used. If the field is nested, it will use dot notation (e.g. _parent.nested-field_).

### Custom Locale

If the supported locale(s) are not sufficient, it is possible to use a custom one. Adding a custom locale with the same name of an existing locale will overwrite the existing one.

_IMPORTANT_ - Each supported query filter operator (e.g. $gt, $lt, ...) should be defined in the custom locale. Be sure to include `{value}` where the query filter's field value should show up in the text.

In the example below, the name of the custom locale is _custom_ but it could be anything (e.g. _sarcastic_, _lame_, _hopeful_, _sullen_).

```js
// Import mongo-translate
const mongoTranslate = require('mongo-translate');

// Define custom locale
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
  $regex: 'CUSTOM REGEX LOCALE {value}',
};
// Add custom locale to the mongo-translate's locales
mongoTranslate.locales.custom = customLocale;

const filter = {...}; // same as defined in Usage
const labels = {...}; // same as defined in Usage

// Translate MongoDB query filter
mongoTranslate.translate({
    filter,
    labels,
    locale: 'custom'
})

/* Output
[
  'Name CUSTOM REGEX LOCALE [ ^test ]',
  'Type CUSTOM NE LOCALE [ TEST ]',
  'Organization CUSTOM EQ LOCALE [ TEST ]',
  'Tags CUSTOM ALL LOCALE [ TEST, ALL ]',
  'Category CUSTOM IN LOCALE [ TEST, IN ]',
  'Date/Time CUSTOM GT LOCALE [ 12/31/2020, 6:00:00 PM ]',
  'Date/Time CUSTOM LTE LOCALE  [ 1/30/2021, 6:00:00 PM ]',
  'Count CUSTOM GTE LOCALE [ 10 ]',
  'Count CUSTOM LT LOCALE [ 20 ]',
  'Metrics Total CUSTOM EQ LOCALE [ 1 ]',
  'Metrics Keys CUSTOM IN LOCALE [ nested ]',
  'Metrics Data Nested CUSTOM EQ LOCALE [ 1 ]'
]
*/
```

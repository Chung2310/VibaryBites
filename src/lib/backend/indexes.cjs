'use strict';

/** Ensure uniqueness for application string identifiers without dropping legacy indexes.
 * @param {import('mongodb').Collection} collection
 * @param {string} field
 */
async function ensureUniqueStringIndex(collection, field) {
  try {
    let indexes;
    try { indexes = await collection.listIndexes().toArray(); }
    catch (error) {
      if (error.code !== 26) throw error; // New collection: NamespaceNotFound.
      indexes = [];
    }
    const compatible = indexes.find(index => {
      const keys = Object.keys(index.key);
      if (keys.length !== 1 || keys[0] !== field || ![1, -1].includes(index.key[field]) || index.unique !== true) return false;
      if (index.collation && index.collation.locale !== 'simple') return false;
      const filter = index.partialFilterExpression;
      if (!filter) return true; // Full and sparse unique indexes both cover strings.
      if (Object.keys(filter).length !== 1) return false;
      const condition = filter[field];
      return condition && Object.keys(condition).length === 1 &&
        (condition.$type === 'string' || condition.$type === 2 || condition.$exists === true);
    });
    if (compatible) return compatible.name;
    // A different name permits coexistence with the old non-unique index.
    // Duplicate strings still fail: never delete records or weaken uniqueness.
    return await collection.createIndex({ [field]: 1 }, {
      name: 'vibary_' + field + '_unique_string_v1',
      unique: true,
      partialFilterExpression: { [field]: { $type: 'string' } },
      collation: { locale: 'simple' },
    });
  } catch (error) {
    console.error('[indexes] Failed ensuring unique string index', {
      collection: collection.collectionName, field, code: error.code, codeName: error.codeName,
    });
    throw error;
  }
}
module.exports = { ensureUniqueStringIndex };

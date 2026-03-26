/** Matches backend capabilityLab run log categories for $db data-type tabs */
const TAB_TO_CATEGORY = {
  string: '$db-string',
  list: '$db-list',
  map: '$db-map',
  number: '$db-number',
  boolean: '$db-boolean',
};

export function dbTabToLogCategory(tabId) {
  return TAB_TO_CATEGORY[tabId] || TAB_TO_CATEGORY.string;
}

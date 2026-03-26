/** Matches backend capabilityLab scheduleLogCategory() — one run log stream per schedule tab */
const TAB_TO_CATEGORY = {
  ONE_TIME: '$schedule-one_time',
  CRON: '$schedule-cron',
  RECURRING: '$schedule-recurring',
};

export function scheduleTabToLogCategory(tabId) {
  return TAB_TO_CATEGORY[tabId] || TAB_TO_CATEGORY.ONE_TIME;
}

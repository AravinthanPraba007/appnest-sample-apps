const { AppnestFunctions } = require('@sparrowengg/appnest-app-sdk-utils');

const {
  $db,
  $fetch,
  $file,
  $next,
  $schedule,
  getTraceId,
} = AppnestFunctions;

const RUNS_KEY = 'capability_lab:runs';

/** Run log categories for $db — one stream per data-type tab (matches lab UI) */
const DB_LOG_CATEGORY = {
  STRING: '$db-string',
  LIST: '$db-list',
  MAP: '$db-map',
  NUMBER: '$db-number',
  BOOLEAN: '$db-boolean',
};

/** Per–data-type lab keys (readable names for demos / queries) */
const DB_KEY_STRING = 'StringTest';
const DB_KEY_LIST = 'ListTest';
const DB_KEY_MAP = 'MapTest';
const DB_KEY_NUMBER = 'NumberTest';
const DB_KEY_BOOLEAN = 'BooleanTest';

/** Previous lab keys — still cleared on full reset */
const LEGACY_DB_KEYS = {
  string: 'capability_lab:storage_demo',
  list: 'capability_lab:list_demo',
  map: 'capability_lab:map_demo',
  number: 'capability_lab:num_demo',
  boolean: 'capability_lab:bool_demo',
};
/** $db.string keys for last-known schedule params per type (lab UI only) */
const SCHEDULE_META_KEY_ONE_TIME = 'capability_lab:last_schedule_meta';
const SCHEDULE_META_KEY_CRON = 'capability_lab:schedule_meta_cron';
const SCHEDULE_META_KEY_RECURRING = 'capability_lab:schedule_meta_recurring';

/** $db.list keys — one append-only list per schedule type (onScheduledEvent) */
const SCHEDULE_TRIGGERS_LIST_KEY = {
  ONE_TIME: 'capability_lab:schedule_triggers_received_one_time',
  CRON: 'capability_lab:schedule_triggers_received_cron',
  RECURRING: 'capability_lab:schedule_triggers_received_recurring',
};

/** $db.list — $next.run invocations for nextLabLogInvocation (lab UI history) */
const NEXT_INVOCATIONS_LIST_KEY = 'capability_lab:next_run_invocations';

function scheduleTriggersListKey(scheduleType) {
  if (scheduleType === 'ONE_TIME') return SCHEDULE_TRIGGERS_LIST_KEY.ONE_TIME;
  if (scheduleType === 'CRON') return SCHEDULE_TRIGGERS_LIST_KEY.CRON;
  if (scheduleType === 'RECURRING') return SCHEDULE_TRIGGERS_LIST_KEY.RECURRING;
  return null;
}

/** UNKNOWN / unmapped payloads go to the ONE_TIME list so nothing is dropped */
function scheduleTypeForTriggerStorage(scheduleType) {
  if (scheduleType === 'ONE_TIME' || scheduleType === 'CRON' || scheduleType === 'RECURRING') {
    return scheduleType;
  }
  return 'ONE_TIME';
}

/** Fixed job names (≤30 chars) — one slot per type; create always delete+create */
const LAB_SCHEDULE_NAME = {
  ONE_TIME: 'test-one-time-schedule',
  CRON: 'test-cron-schedule',
  RECURRING: 'test-recurring-schedule',
};

const RECURRING_TIME_UNITS = [
  'MINUTES',
  'HOURS',
  'DAYS',
  'WEEKS',
  'MONTHS',
  'YEARS',
];

function scheduleMetaKey(scheduleType) {
  if (scheduleType === 'ONE_TIME') return SCHEDULE_META_KEY_ONE_TIME;
  if (scheduleType === 'CRON') return SCHEDULE_META_KEY_CRON;
  if (scheduleType === 'RECURRING') return SCHEDULE_META_KEY_RECURRING;
  return null;
}

/** Run log category per schedule type (matches lab UI tabs) */
function scheduleLogCategory(scheduleType) {
  if (scheduleType === 'ONE_TIME') return '$schedule-one_time';
  if (scheduleType === 'CRON') return '$schedule-cron';
  if (scheduleType === 'RECURRING') return '$schedule-recurring';
  return '$schedule';
}

async function getScheduleTriggersListForType(scheduleType) {
  const key = scheduleTriggersListKey(scheduleType);
  if (!key) return [];
  try {
    const raw = await $db.list.get({ key });
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function inferScheduleTypeFromScheduledEventBody(body) {
  if (!body || typeof body !== 'object') return 'UNKNOWN';
  const t = body.type || body.scheduleType;
  if (t === 'ONE_TIME' || t === 'CRON' || t === 'RECURRING') return t;
  const n = body.name || body.jobName;
  if (n === LAB_SCHEDULE_NAME.ONE_TIME) return 'ONE_TIME';
  if (n === LAB_SCHEDULE_NAME.CRON) return 'CRON';
  if (n === LAB_SCHEDULE_NAME.RECURRING) return 'RECURRING';
  return 'UNKNOWN';
}

async function appendScheduleTriggerRecord(record) {
  const storageType = scheduleTypeForTriggerStorage(record.scheduleType);
  const key = scheduleTriggersListKey(storageType);
  const prev = await getScheduleTriggersListForType(storageType);
  const row = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    receivedAt: new Date().toISOString(),
    ...record,
  };
  const next = [...prev, row];
  const trimmed = next.length > 500 ? next.slice(-500) : next;
  await $db.list.set({ key, value: trimmed });
}

async function getNextInvocationsList() {
  try {
    const raw = await $db.list.get({ key: NEXT_INVOCATIONS_LIST_KEY });
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

async function appendNextInvocationRecord({ invokedAt, payload }) {
  const prev = await getNextInvocationsList();
  const row = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    invokedAt: invokedAt || new Date().toISOString(),
    payload: payload != null && typeof payload === 'object' ? payload : { value: payload },
  };
  const next = [...prev, row];
  const trimmed = next.length > 500 ? next.slice(-500) : next;
  await $db.list.set({ key: NEXT_INVOCATIONS_LIST_KEY, value: trimmed });
}
const FILE_PATH = 'capability-lab/demo.txt';
const FILE_LIST_PREFIX = 'capability-lab/';
const NETWORK_BASE = 'https://api.salesparrow.com';
const FETCH_ALLOWED_HOST = 'api.salesparrow.com';
const FETCH_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function isFetchUrlAllowed(urlString) {
  try {
    const u = new URL(String(urlString).trim());
    return u.protocol === 'https:' && u.hostname === FETCH_ALLOWED_HOST;
  } catch {
    return false;
  }
}

async function getRunStrings() {
  try {
    const raw = await $db.list.get({ key: RUNS_KEY });
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

async function appendRun(entry) {
  const row = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    at: new Date().toISOString(),
    ...entry,
  };
  const prev = await getRunStrings();
  const nextList = [...prev, JSON.stringify(row)];
  const trimmed = nextList.length > 200 ? nextList.slice(-200) : nextList;
  await $db.list.set({ key: RUNS_KEY, value: trimmed });
}

function parseRuns(strings, limit, filterCategory) {
  let rows = strings.map((s) => {
    try {
      return JSON.parse(s);
    } catch {
      return { message: String(s), status: 'parse_error' };
    }
  });
  if (filterCategory) {
    rows = rows.filter((r) => rowCategory(r) === filterCategory);
  }
  const lim = Math.min(Math.max(Number(limit) || 80, 1), 150);
  return rows.slice(-lim).reverse();
}

function inferDbLogCategoryFromAction(action) {
  if (!action || typeof action !== 'string') return DB_LOG_CATEGORY.STRING;
  if (action.startsWith('string')) return DB_LOG_CATEGORY.STRING;
  if (action.startsWith('list')) return DB_LOG_CATEGORY.LIST;
  if (action.startsWith('map')) return DB_LOG_CATEGORY.MAP;
  if (action.startsWith('number')) return DB_LOG_CATEGORY.NUMBER;
  if (action.startsWith('boolean')) return DB_LOG_CATEGORY.BOOLEAN;
  return DB_LOG_CATEGORY.STRING;
}

function rowCategory(r) {
  let cat;
  if (r.category != null && r.category !== '') {
    cat = r.category;
  } else {
    const legacy = {
      file: '$file',
      storage: '$db',
      network: '$fetch',
      schedule: '$schedule',
      chain: '$next',
    };
    cat = legacy[r.module] || r.module || '';
  }
  if (cat === '$db') {
    return inferDbLogCategoryFromAction(r.action);
  }
  if (cat === '$http') {
    return '$fetch';
  }
  return cat;
}

async function getCapabilityLabState({ payload = {} } = {}) {
  const strings = await getRunStrings();
  const { limit, filterCategory } = payload;
  return {
    runs: parseRuns(strings, limit, filterCategory || null),
    totalRuns: strings.length,
  };
}

async function clearCapabilityLabLogs({ payload = {} } = {}) {
  const { category } = payload;
  const strings = await getRunStrings();
  if (!category) {
    await $db.list.set({ key: RUNS_KEY, value: [] });
    return { ok: true, removed: strings.length };
  }
  const kept = [];
  let removed = 0;
  for (const s of strings) {
    try {
      const row = JSON.parse(s);
      if (rowCategory(row) === category) {
        removed += 1;
      } else {
        kept.push(s);
      }
    } catch {
      kept.push(s);
    }
  }
  await $db.list.set({ key: RUNS_KEY, value: kept });
  return { ok: true, removed, kept: kept.length };
}

function vis(v) {
  return v === 'PRIVATE' ? 'PRIVATE' : 'PUBLIC';
}

async function runSdkLabAction({ payload = {} } = {}) {
  const category = payload.category;
  const action = payload.action;
  if (!category || !action) {
    return { ok: false, message: 'category and action are required' };
  }

  try {
    switch (category) {
      case '$file':
        return await handleFileAction(action, payload);
      case '$db':
        return await handleDbAction(action, payload);
      case '$fetch':
      case '$http':
        return await handleFetchAction(action, payload);
      case '$schedule':
        return await handleScheduleAction(action, payload);
      case '$next':
        return await handleNextAction(action, payload);
      case 'getTraceId':
        return await handleTraceAction(action, payload);
      default:
        return { ok: false, message: `Unknown category: ${category}` };
    }
  } catch (e) {
    let logCategory =
      category === '$db' ? inferDbLogCategoryFromAction(action) : category;
    if (logCategory === '$http') {
      logCategory = '$fetch';
    }
    await appendRun({
      category: logCategory,
      action,
      status: 'error',
      message: e.message,
    });
    return { ok: false, message: e.message };
  }
}

async function handleFileAction(action, payload) {
  const path = typeof payload.path === 'string' && payload.path.trim()
    ? payload.path.trim()
    : FILE_PATH;
  const visibility = vis(payload.visibility);

  switch (action) {
    case 'getUploadUrl': {
      const { preSignedUrl } = await $file.getUploadUrl({ path, visibility });
      await appendRun({
        category: '$file',
        action,
        status: 'ok',
        message: `getUploadUrl ${path}`,
      });
      return {
        ok: true,
        message: 'Upload URL issued',
        path,
        preSignedUrl: preSignedUrl || null,
      };
    }
    case 'getDownloadUrl': {
      const { preSignedUrl } = await $file.getDownloadUrl({ path, visibility });
      await appendRun({
        category: '$file',
        action,
        status: 'ok',
        message: `getDownloadUrl ${path}`,
      });
      return {
        ok: true,
        message: 'Download URL issued',
        path,
        preSignedUrl: preSignedUrl || null,
      };
    }
    case 'exists': {
      const ex = await $file.exists({ path, visibility });
      await appendRun({
        category: '$file',
        action,
        status: 'ok',
        message: `exists=${ex?.exists} ${path}`,
      });
      return {
        ok: true,
        message: `exists=${ex?.exists}`,
        exists: ex?.exists,
        path,
      };
    }
    case 'list': {
      const listPath =
        typeof payload.listPath === 'string' && payload.listPath.trim()
          ? payload.listPath.trim()
          : FILE_LIST_PREFIX;
      const { objects } = await $file.list({ path: listPath, visibility });
      await appendRun({
        category: '$file',
        action,
        status: 'ok',
        message: `list ${listPath} → ${(objects || []).length} objects`,
      });
      return {
        ok: true,
        message: `Found ${(objects || []).length} object(s)`,
        objects: objects || [],
        listPath,
      };
    }
    case 'delete': {
      const del = await $file.delete({ path, visibility });
      await appendRun({
        category: '$file',
        action,
        status: 'ok',
        message: `delete deleted=${del?.deleted} ${path}`,
      });
      return {
        ok: true,
        message: `deleted=${del?.deleted}`,
        path,
      };
    }
    case 'uploadDemo': {
      const { preSignedUrl } = await $file.getUploadUrl({ path, visibility });
      let note = 'URL generated';
      if (preSignedUrl) {
        try {
          await $fetch.request({
            url: preSignedUrl,
            method: 'PUT',
            headers: { 'Content-Type': 'text/plain' },
            body: 'Core Capability Lab demo file',
            query: {},
          });
          note = 'URL + PUT attempted';
        } catch (e) {
          note = `PUT failed: ${e.message}`;
        }
      }
      await appendRun({
        category: '$file',
        action,
        status: 'ok',
        message: `${note} @ ${path}`,
      });
      return { ok: true, message: note, path };
    }
    default:
      return { ok: false, message: `Unknown $file action: ${action}` };
  }
}

async function handleDbAction(action, payload) {
  switch (action) {
    case 'stringSet': {
      let toStore;
      if (Object.prototype.hasOwnProperty.call(payload, 'stringValue')) {
        toStore = String(payload.stringValue);
      } else {
        const demo = {
          at: new Date().toISOString(),
          sample: payload.value || 'lab-string-demo',
        };
        toStore = JSON.stringify(demo);
      }
      await $db.string.set({
        key: DB_KEY_STRING,
        value: toStore,
      });
      await appendRun({
        category: DB_LOG_CATEGORY.STRING,
        action,
        status: 'ok',
        message: `string.set ${DB_KEY_STRING}`,
      });
      return { ok: true, message: 'String key written', value: toStore };
    }
    case 'stringGet': {
      let value = null;
      try {
        value = await $db.string.get({ key: DB_KEY_STRING });
      } catch {
        value = null;
      }
      await appendRun({
        category: DB_LOG_CATEGORY.STRING,
        action,
        status: 'ok',
        message: `string.get ${DB_KEY_STRING} ${value == null ? '(empty)' : 'ok'}`,
      });
      return { ok: true, message: 'Read OK', value };
    }
    case 'stringDelete': {
      await $db.string.delete({ key: DB_KEY_STRING });
      await appendRun({
        category: DB_LOG_CATEGORY.STRING,
        action,
        status: 'ok',
        message: `string.delete ${DB_KEY_STRING}`,
      });
      return { ok: true, message: 'String key deleted' };
    }
    case 'listAppend': {
      const entry = JSON.stringify({
        t: new Date().toISOString(),
        n: Math.random().toString(36).slice(2, 8),
      });
      let list = [];
      try {
        const raw = await $db.list.get({ key: DB_KEY_LIST });
        if (Array.isArray(raw)) list = [...raw];
      } catch {
        list = [];
      }
      list.push(entry);
      await $db.list.set({ key: DB_KEY_LIST, value: list });
      await appendRun({
        category: DB_LOG_CATEGORY.LIST,
        action,
        status: 'ok',
        message: `list.set ${DB_KEY_LIST} len=${list.length}`,
      });
      return { ok: true, message: `List length ${list.length}`, length: list.length };
    }
    case 'listGet': {
      let list = [];
      try {
        const raw = await $db.list.get({ key: DB_KEY_LIST });
        if (Array.isArray(raw)) list = raw;
      } catch {
        list = [];
      }
      await appendRun({
        category: DB_LOG_CATEGORY.LIST,
        action,
        status: 'ok',
        message: `list.get ${DB_KEY_LIST} len=${list.length}`,
      });
      return { ok: true, message: `Items: ${list.length}`, items: list };
    }
    case 'listDelete': {
      await $db.list.set({ key: DB_KEY_LIST, value: [] });
      await appendRun({
        category: DB_LOG_CATEGORY.LIST,
        action,
        status: 'ok',
        message: `list.clear ${DB_KEY_LIST} (empty array)`,
      });
      return { ok: true, message: 'List cleared at ListTest', length: 0 };
    }
    case 'mapSet': {
      let value;
      if (
        typeof payload.mapJson === 'string' &&
        payload.mapJson.trim() !== ''
      ) {
        let parsed;
        try {
          parsed = JSON.parse(payload.mapJson);
        } catch (e) {
          return {
            ok: false,
            message: `Invalid map JSON: ${e.message}`,
          };
        }
        if (
          parsed === null ||
          typeof parsed !== 'object' ||
          Array.isArray(parsed)
        ) {
          return {
            ok: false,
            message: 'Map JSON must be a single object {...}, not an array or primitive.',
          };
        }
        value = parsed;
      } else {
        value = {
          updatedAt: new Date().toISOString(),
          note: payload.mapNote || 'map-demo',
        };
      }
      await $db.map.set({ key: DB_KEY_MAP, value });
      await appendRun({
        category: DB_LOG_CATEGORY.MAP,
        action,
        status: 'ok',
        message: `map.set ${DB_KEY_MAP}`,
      });
      return { ok: true, message: 'Map written', value };
    }
    case 'mapGet': {
      let value = null;
      try {
        value = await $db.map.get({ key: DB_KEY_MAP });
      } catch {
        value = null;
      }
      await appendRun({
        category: DB_LOG_CATEGORY.MAP,
        action,
        status: 'ok',
        message: `map.get ${DB_KEY_MAP}`,
      });
      return { ok: true, message: 'Map read', value };
    }
    case 'mapDelete': {
      await $db.map.delete({ key: DB_KEY_MAP });
      await appendRun({
        category: DB_LOG_CATEGORY.MAP,
        action,
        status: 'ok',
        message: `map.delete ${DB_KEY_MAP}`,
      });
      return { ok: true, message: 'Map deleted' };
    }
    case 'numberSet': {
      const n = Number(payload.numberValue);
      const v = Number.isFinite(n) ? n : 0;
      await $db.number.set({ key: DB_KEY_NUMBER, value: v });
      await appendRun({
        category: DB_LOG_CATEGORY.NUMBER,
        action,
        status: 'ok',
        message: `number.set ${DB_KEY_NUMBER} = ${v}`,
      });
      return { ok: true, message: `Set to ${v}`, value: v };
    }
    case 'numberGet': {
      let value = null;
      try {
        value = await $db.number.get({ key: DB_KEY_NUMBER });
      } catch {
        value = null;
      }
      await appendRun({
        category: DB_LOG_CATEGORY.NUMBER,
        action,
        status: 'ok',
        message: `number.get ${DB_KEY_NUMBER} → ${value}`,
      });
      return { ok: true, message: String(value), value };
    }
    case 'numberIncrement': {
      const step = Number(payload.incrementBy);
      const delta =
        Number.isFinite(step) && step !== 0 ? step : 1;
      await $db.number.increment({ key: DB_KEY_NUMBER, value: delta });
      let value = null;
      try {
        value = await $db.number.get({ key: DB_KEY_NUMBER });
      } catch {
        value = null;
      }
      await appendRun({
        category: DB_LOG_CATEGORY.NUMBER,
        action,
        status: 'ok',
        message: `number.increment ${DB_KEY_NUMBER} by ${delta} → ${value}`,
      });
      return { ok: true, message: `Now ${value} (Δ ${delta})`, value };
    }
    case 'numberDelete': {
      await $db.number.delete({ key: DB_KEY_NUMBER });
      await appendRun({
        category: DB_LOG_CATEGORY.NUMBER,
        action,
        status: 'ok',
        message: `number.delete ${DB_KEY_NUMBER}`,
      });
      return { ok: true, message: 'Number key deleted' };
    }
    case 'booleanSet': {
      const b = payload.boolValue === false ? false : true;
      await $db.boolean.set({ key: DB_KEY_BOOLEAN, value: b });
      await appendRun({
        category: DB_LOG_CATEGORY.BOOLEAN,
        action,
        status: 'ok',
        message: `boolean.set ${DB_KEY_BOOLEAN} = ${b}`,
      });
      return { ok: true, message: String(b), value: b };
    }
    case 'booleanGet': {
      let value = null;
      try {
        value = await $db.boolean.get({ key: DB_KEY_BOOLEAN });
      } catch {
        value = null;
      }
      await appendRun({
        category: DB_LOG_CATEGORY.BOOLEAN,
        action,
        status: 'ok',
        message: `boolean.get ${DB_KEY_BOOLEAN} → ${value}`,
      });
      return { ok: true, message: String(value), value };
    }
    case 'booleanDelete': {
      await $db.boolean.delete({ key: DB_KEY_BOOLEAN });
      await appendRun({
        category: DB_LOG_CATEGORY.BOOLEAN,
        action,
        status: 'ok',
        message: `boolean.delete ${DB_KEY_BOOLEAN}`,
      });
      return { ok: true, message: 'Boolean key deleted' };
    }
    default:
      return { ok: false, message: `Unknown $db action: ${action}` };
  }
}

async function handleFetchAction(action, payload) {
  if (action === 'request') {
    return handleFetchRequest(payload);
  }
  if (action === 'get') {
    const path = typeof payload.path === 'string' ? payload.path : '';
    const normalized = path.startsWith('/') ? path : `/${path}`;
    const url = `${NETWORK_BASE}${normalized === '//' ? '/' : normalized}`;
    return handleFetchRequest({
      method: 'GET',
      url,
      headers: {},
      body: {},
      query: {},
      _logAction: 'get',
    });
  }
  return { ok: false, message: `Unknown $fetch action: ${action}` };
}

async function handleFetchRequest(payload) {
  const urlRaw =
    typeof payload.url === 'string' ? payload.url.trim() : '';
  if (!urlRaw) {
    return { ok: false, message: 'url is required' };
  }
  if (!isFetchUrlAllowed(urlRaw)) {
    return {
      ok: false,
      message: `URL must be https://${FETCH_ALLOWED_HOST}/... (manifest whitelist)`,
    };
  }

  const method = String(payload.method || 'GET').toUpperCase();
  if (!FETCH_METHODS.includes(method)) {
    return {
      ok: false,
      message: `method must be one of: ${FETCH_METHODS.join(', ')}`,
    };
  }

  let headers = payload.headers;
  if (headers == null || typeof headers !== 'object' || Array.isArray(headers)) {
    headers = {};
  }

  let query = payload.query;
  if (query == null || typeof query !== 'object' || Array.isArray(query)) {
    query = {};
  }

  let body = payload.body;
  if (method === 'GET' || method === 'HEAD') {
    body = {};
  } else if (body === undefined || body === null || body === '') {
    body = {};
  }

  const doRequest = async () =>
    $fetch.request({
      url: urlRaw,
      method,
      headers,
      body,
      query,
    });

  let res = await doRequest();
  if (res.status === 429) {
    await sleep(1000);
    res = await doRequest();
  }

  const snippet =
    typeof res.body === 'string'
      ? res.body.slice(0, 200)
      : JSON.stringify(res.body || {}).slice(0, 200);

  const logAction = payload._logAction || 'request';
  await appendRun({
    category: '$fetch',
    action: logAction,
    status: 'ok',
    message: `${method} ${urlRaw} → ${res.status}`,
  });

  return {
    ok: true,
    statusCode: res.status,
    message: `${method} ${res.status}. Preview: ${snippet}`,
  };
}

async function deleteLabScheduleByTypeSilently(scheduleType) {
  const name = LAB_SCHEDULE_NAME[scheduleType];
  if (!name) return;
  try {
    await $schedule.delete({ name, type: scheduleType });
  } catch {
    /* job may not exist — satisfies unique name on next create */
  }
}

async function labScheduleCreate(scheduleType, payload) {
  const name = LAB_SCHEDULE_NAME[scheduleType];
  const metaKey = scheduleMetaKey(scheduleType);
  const baseData = {
    functionName: 'executeScheduledCapabilityJob',
    payload: { source: 'schedule', scheduleType },
  };

  await deleteLabScheduleByTypeSilently(scheduleType);

  if (scheduleType === 'ONE_TIME') {
    const delaySeconds = Number(payload.delaySeconds);
    if (!Number.isFinite(delaySeconds) || delaySeconds < 5 || delaySeconds > 600) {
      return { ok: false, message: 'delaySeconds must be 5–600' };
    }
    const runAt = new Date(Date.now() + delaySeconds * 1000).toISOString();
    await $schedule.create({
      name,
      type: 'ONE_TIME',
      data: baseData,
      runAt,
    });
    await $db.string.set({
      key: metaKey,
      value: JSON.stringify({ name, type: scheduleType, runAt }),
    });
    return {
      ok: true,
      message: `Job "${name}" scheduled (replaces any previous lab ${scheduleType} with same name)`,
      jobName: name,
      scheduledFor: runAt,
    };
  }

  if (scheduleType === 'CRON') {
    const cronExpression =
      typeof payload.cronExpression === 'string'
        ? payload.cronExpression.trim()
        : '';
    if (!cronExpression || cronExpression.length > 256) {
      return {
        ok: false,
        message: 'cronExpression is required (max 256 characters)',
      };
    }
    await $schedule.create({
      name,
      type: 'CRON',
      data: baseData,
      cronExpression,
    });
    await $db.string.set({
      key: metaKey,
      value: JSON.stringify({ name, type: scheduleType, cronExpression }),
    });
    return {
      ok: true,
      message: `CRON job "${name}" scheduled`,
      jobName: name,
      cronExpression,
    };
  }

  if (scheduleType === 'RECURRING') {
    const frequency = Number(payload.frequency);
    const timeUnit =
      typeof payload.timeUnit === 'string'
        ? payload.timeUnit.toUpperCase()
        : '';
    if (!Number.isFinite(frequency) || frequency < 1) {
      return { ok: false, message: 'frequency must be >= 1' };
    }
    if (!RECURRING_TIME_UNITS.includes(timeUnit)) {
      return {
        ok: false,
        message: `timeUnit must be one of: ${RECURRING_TIME_UNITS.join(', ')}`,
      };
    }
    if (timeUnit === 'MINUTES' && frequency < 10) {
      return {
        ok: false,
        message: 'frequency must be >= 10 when timeUnit is MINUTES',
      };
    }
    const repeat = { frequency, timeUnit };
    await $schedule.create({
      name,
      type: 'RECURRING',
      data: baseData,
      repeat,
    });
    await $db.string.set({
      key: metaKey,
      value: JSON.stringify({ name, type: scheduleType, ...repeat }),
    });
    return {
      ok: true,
      message: `RECURRING job "${name}" scheduled`,
      jobName: name,
      repeat,
    };
  }

  return { ok: false, message: 'Invalid scheduleType' };
}

async function handleScheduleAction(action, payload) {
  if (action === 'listTriggers') {
    const scheduleType = payload.scheduleType;
    if (!['ONE_TIME', 'CRON', 'RECURRING'].includes(scheduleType)) {
      return {
        ok: false,
        message: 'listTriggers requires scheduleType: ONE_TIME | CRON | RECURRING',
      };
    }
    const list = await getScheduleTriggersListForType(scheduleType);
    const triggers = [...list].reverse().slice(0, 150);
    return {
      ok: true,
      triggers,
      total: list.length,
      storageKey: scheduleTriggersListKey(scheduleType),
    };
  }

  if (action === 'clearTriggers') {
    const scheduleType = payload.scheduleType;
    if (!['ONE_TIME', 'CRON', 'RECURRING'].includes(scheduleType)) {
      return {
        ok: false,
        message: 'clearTriggers requires scheduleType: ONE_TIME | CRON | RECURRING',
      };
    }
    const key = scheduleTriggersListKey(scheduleType);
    const prev = await getScheduleTriggersListForType(scheduleType);
    const removed = prev.length;
    await $db.list.set({ key, value: [] });
    await appendRun({
      category: scheduleLogCategory(scheduleType),
      action,
      status: 'ok',
      message: `clearTriggers removed ${removed} row(s) (${key})`,
    });
    return {
      ok: true,
      message: `Cleared ${removed} record(s) for ${scheduleType}`,
      removed,
      remaining: 0,
      storageKey: key,
    };
  }

  if (action !== 'scheduleOp') {
    return {
      ok: false,
      message: `Unknown $schedule action: ${action} (expected scheduleOp, listTriggers, or clearTriggers)`,
    };
  }

  const op = payload.op;
  const scheduleType = payload.scheduleType;
  if (!['create', 'get', 'delete'].includes(op)) {
    return { ok: false, message: 'op must be create, get, or delete' };
  }
  if (!['ONE_TIME', 'CRON', 'RECURRING'].includes(scheduleType)) {
    return {
      ok: false,
      message: 'scheduleType must be ONE_TIME, CRON, or RECURRING',
    };
  }

  const name = LAB_SCHEDULE_NAME[scheduleType];
  const metaKey = scheduleMetaKey(scheduleType);

  const logCat = scheduleLogCategory(scheduleType);

  if (op === 'delete') {
    try {
      await deleteLabScheduleByTypeSilently(scheduleType);
      await $db.string.delete({ key: metaKey });
      await appendRun({
        category: logCat,
        action,
        status: 'ok',
        message: `scheduleOp delete ${scheduleType}`,
      });
      return {
        ok: true,
        message: `Removed ${scheduleType} job "${name}" (if it existed)`,
      };
    } catch (e) {
      await appendRun({
        category: logCat,
        action,
        status: 'error',
        message: e.message,
      });
      return { ok: false, message: e.message };
    }
  }

  if (op === 'get') {
    try {
      await $schedule.get({ name, type: scheduleType });
      let meta = { name, type: scheduleType };
      const metaRaw = await $db.string.get({ key: metaKey });
      if (metaRaw) {
        try {
          meta = { ...meta, ...JSON.parse(metaRaw) };
        } catch {
          /* ignore */
        }
      }
      await appendRun({
        category: logCat,
        action,
        status: 'ok',
        message: `scheduleOp get ${scheduleType}`,
      });
      return {
        ok: true,
        message: 'get invoked (see platform logs)',
        meta,
      };
    } catch (e) {
      await appendRun({
        category: logCat,
        action,
        status: 'error',
        message: e.message,
      });
      return { ok: false, message: e.message };
    }
  }

  try {
    const result = await labScheduleCreate(scheduleType, payload);
    if (!result.ok) {
      await appendRun({
        category: logCat,
        action,
        status: 'error',
        message: result.message || 'scheduleOp create validation failed',
      });
      return result;
    }
    await appendRun({
      category: logCat,
      action,
      status: 'ok',
      message: `scheduleOp create ${scheduleType}`,
    });
    return result;
  } catch (e) {
    await appendRun({
      category: logCat,
      action,
      status: 'error',
      message: e.message,
    });
    return { ok: false, message: e.message };
  }
}

async function handleNextAction(action, payload) {
  if (action === 'listNextInvocations') {
    const list = await getNextInvocationsList();
    const invocations = [...list].reverse().slice(0, 150);
    return {
      ok: true,
      invocations,
      total: list.length,
      storageKey: NEXT_INVOCATIONS_LIST_KEY,
    };
  }

  if (action === 'clearNextInvocations') {
    const prev = await getNextInvocationsList();
    const removed = prev.length;
    await $db.list.set({ key: NEXT_INVOCATIONS_LIST_KEY, value: [] });
    await appendRun({
      category: '$next',
      action,
      status: 'ok',
      message: `clearNextInvocations removed ${removed} row(s) (${NEXT_INVOCATIONS_LIST_KEY})`,
    });
    return {
      ok: true,
      message: `Cleared ${removed} record(s)`,
      removed,
      storageKey: NEXT_INVOCATIONS_LIST_KEY,
    };
  }

  if (action === 'run') {
    const functionName = payload.functionName;
    if (!functionName || typeof functionName !== 'string') {
      return { ok: false, message: 'functionName required' };
    }
    let body = {};
    if (typeof payload.payloadJson === 'string' && payload.payloadJson.trim()) {
      try {
        body = JSON.parse(payload.payloadJson);
      } catch {
        return { ok: false, message: 'Invalid JSON in payloadJson' };
      }
    } else if (
      payload.payload &&
      typeof payload.payload === 'object'
    ) {
      body = payload.payload;
    }
    const delay = Math.max(
      0,
      Math.min(300, Number(payload.delaySeconds) || 0),
    );
    await $next.run({ functionName, payload: body, delay });
    await appendRun({
      category: '$next',
      action,
      status: 'ok',
      message: `$next.run ${functionName} delay=${delay}`,
    });
    return {
      ok: true,
      message: `Invoked ${functionName} (delay ${delay}s)`,
    };
  }

  return { ok: false, message: `Unknown $next action: ${action}` };
}

async function handleTraceAction(action, _payload) {
  if (action !== 'read') {
    return { ok: false, message: `Unknown getTraceId action: ${action}` };
  }
  const traceId = getTraceId();
  await appendRun({
    category: 'getTraceId',
    action,
    status: 'ok',
    message: `traceId=${traceId}`,
  });
  return { ok: true, message: 'Trace ID read', traceId };
}

/**
 * Invoked via $next.run — records wall-clock time and payload for the lab trigger history UI.
 */
async function nextLabLogInvocation({ payload = {} } = {}) {
  const invokedAt = new Date().toISOString();
  await appendNextInvocationRecord({ invokedAt, payload });
  const preview = JSON.stringify(payload).slice(0, 240);
  await appendRun({
    category: '$next',
    action: 'nextLabLogInvocation',
    status: 'ok',
    message: `invokedAt=${invokedAt} payload=${preview}${preview.length >= 240 ? '…' : ''}`,
  });
  return { ok: true, invokedAt, receivedPayload: payload };
}

async function executeScheduledCapabilityJob({ payload = {} } = {}) {
  const st = payload.scheduleType;
  const scheduleType =
    st === 'ONE_TIME' || st === 'CRON' || st === 'RECURRING' ? st : 'ONE_TIME';
  await appendRun({
    category: scheduleLogCategory(scheduleType),
    action: 'scheduledHandler',
    status: 'ok',
    message: `handler (${JSON.stringify(payload).slice(0, 120)})`,
  });
  return { ok: true };
}

/**
 * Platform event: fired on each schedule trigger (manifest event_listener_functions).
 * Persists a row in the $db.list for this schedule type (see SCHEDULE_TRIGGERS_LIST_KEY).
 */
async function onScheduledEvent(invokeArg = {}) {
  const body =
    invokeArg.payload != null && typeof invokeArg.payload === 'object'
      ? invokeArg.payload
      : invokeArg;
  const scheduleType = inferScheduleTypeFromScheduledEventBody(body);
  const jobName =
    (body && (body.name || body.jobName)) ||
    (scheduleType !== 'UNKNOWN' ? LAB_SCHEDULE_NAME[scheduleType] : null);
  let summary = '';
  try {
    const snap =
      body && typeof body === 'object'
        ? JSON.parse(JSON.stringify(body))
        : body;
    summary =
      typeof snap === 'string'
        ? snap.slice(0, 500)
        : JSON.stringify(snap ?? {}).slice(0, 500);
  } catch {
    summary = '[payload not serializable]';
  }
  try {
    await appendScheduleTriggerRecord({
      scheduleType,
      jobName: jobName || undefined,
      summary,
      traceId: getTraceId(),
    });
  } catch (e) {
    return { ok: false, message: e.message };
  }
  const logCat =
    scheduleType === 'ONE_TIME' ||
    scheduleType === 'CRON' ||
    scheduleType === 'RECURRING'
      ? scheduleLogCategory(scheduleType)
      : '$schedule';
  try {
    await appendRun({
      category: logCat,
      action: 'onScheduledEvent',
      status: 'ok',
      message: `trigger ${jobName || scheduleType} (${summary.slice(0, 100)})`,
    });
  } catch {
    /* run log best-effort */
  }
  return {
    ok: true,
    message: 'onScheduledEvent recorded',
    scheduleType,
    jobName: jobName || null,
  };
}

async function clearCapabilityLabData() {
  const cleared = [];

  try {
    await $db.list.set({ key: RUNS_KEY, value: [] });
    cleared.push(RUNS_KEY);
  } catch {
    try {
      await $db.delete({ key: RUNS_KEY });
      cleared.push(RUNS_KEY);
    } catch {
      /* ignore */
    }
  }

  const clearKey = async (key, fn) => {
    try {
      await fn({ key });
      cleared.push(key);
    } catch {
      /* ignore */
    }
  };
  await clearKey(DB_KEY_STRING, $db.string.delete.bind($db.string));
  await clearKey(DB_KEY_MAP, $db.map.delete.bind($db.map));
  try {
    await $db.list.set({ key: DB_KEY_LIST, value: [] });
    cleared.push(DB_KEY_LIST);
  } catch {
    /* ignore */
  }
  await clearKey(DB_KEY_NUMBER, $db.number.delete.bind($db.number));
  await clearKey(DB_KEY_BOOLEAN, $db.boolean.delete.bind($db.boolean));

  await clearKey(LEGACY_DB_KEYS.string, $db.string.delete.bind($db.string));
  await clearKey(LEGACY_DB_KEYS.map, $db.map.delete.bind($db.map));
  try {
    await $db.list.set({ key: LEGACY_DB_KEYS.list, value: [] });
    cleared.push(LEGACY_DB_KEYS.list);
  } catch {
    /* ignore */
  }
  await clearKey(LEGACY_DB_KEYS.number, $db.number.delete.bind($db.number));
  await clearKey(LEGACY_DB_KEYS.boolean, $db.boolean.delete.bind($db.boolean));

  try {
    for (const st of ['ONE_TIME', 'CRON', 'RECURRING']) {
      try {
        await $schedule.delete({
          name: LAB_SCHEDULE_NAME[st],
          type: st,
        });
        cleared.push(`schedule:${LAB_SCHEDULE_NAME[st]}`);
      } catch {
        /* ignore */
      }
    }
    for (const key of [
      SCHEDULE_META_KEY_ONE_TIME,
      SCHEDULE_META_KEY_CRON,
      SCHEDULE_META_KEY_RECURRING,
    ]) {
      try {
        await $db.string.delete({ key });
        cleared.push(key);
      } catch {
        /* ignore */
      }
    }
    for (const st of ['ONE_TIME', 'CRON', 'RECURRING']) {
      const tKey = scheduleTriggersListKey(st);
      try {
        await $db.list.set({ key: tKey, value: [] });
        cleared.push(tKey);
      } catch {
        /* ignore */
      }
    }
    try {
      await $db.list.set({ key: NEXT_INVOCATIONS_LIST_KEY, value: [] });
      cleared.push(NEXT_INVOCATIONS_LIST_KEY);
    } catch {
      /* ignore */
    }
  } catch {
    /* ignore */
  }

  try {
    await $file.delete({ path: FILE_PATH, visibility: 'PUBLIC' });
    cleared.push(FILE_PATH);
  } catch {
    /* ignore */
  }

  return { ok: true, cleared };
}

module.exports = {
  getCapabilityLabState,
  runSdkLabAction,
  clearCapabilityLabLogs,
  clearCapabilityLabData,
  nextLabLogInvocation,
  executeScheduledCapabilityJob,
  onScheduledEvent,
};

import { useCallback, useEffect, useState } from 'react';
import { Box, Button, HStack, Input, Text, VStack } from '@sparrowengg/twigs-react';
import { invokeBackendBody, sdkAction } from '../labApi.js';
import { scheduleTabToLogCategory } from '../scheduleLogCategories.js';

const SCHEDULE_TABS = [
  { id: 'ONE_TIME', label: 'One time', jobName: 'test-one-time-schedule' },
  { id: 'CRON', label: 'Cron', jobName: 'test-cron-schedule' },
  { id: 'RECURRING', label: 'Recurring', jobName: 'test-recurring-schedule' },
];

const RECURRING_UNITS = [
  'MINUTES',
  'HOURS',
  'DAYS',
  'WEEKS',
  'MONTHS',
  'YEARS',
];

const TRIGGER_LIST_DB_KEY = {
  ONE_TIME: 'capability_lab:schedule_triggers_received_one_time',
  CRON: 'capability_lab:schedule_triggers_received_cron',
  RECURRING: 'capability_lab:schedule_triggers_received_recurring',
};

function formatTriggerAt(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return String(iso);
  }
}

function parseTriggerSummary(summary) {
  if (!summary || typeof summary !== 'string') {
    return { parsed: null, pretty: '', raw: summary ? String(summary) : '' };
  }
  try {
    const parsed = JSON.parse(summary);
    return {
      parsed,
      pretty: JSON.stringify(parsed, null, 2),
      raw: summary,
    };
  } catch {
    return { parsed: null, pretty: summary, raw: summary };
  }
}

function scheduleTypeChipStyle(st) {
  switch (st) {
    case 'ONE_TIME':
      return { bg: '#ccfbf1', color: '#0f766e', border: '#5eead4' };
    case 'CRON':
      return { bg: '#ede9fe', color: '#5b21b6', border: '#c4b5fd' };
    case 'RECURRING':
      return { bg: '#dbeafe', color: '#1d4ed8', border: '#93c5fd' };
    default:
      return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
  }
}

function extractPayloadHighlights(parsed) {
  if (!parsed || typeof parsed !== 'object') return [];
  const out = [];
  if (parsed.eventType != null) {
    out.push({ k: 'Event', v: String(parsed.eventType) });
  }
  const d = parsed.data;
  if (d && typeof d === 'object') {
    if (d.functionName != null) {
      out.push({ k: 'Function', v: String(d.functionName) });
    }
    const p = d.payload;
    if (p && typeof p === 'object' && p.scheduleType != null) {
      out.push({ k: 'Job payload', v: String(p.scheduleType) });
    }
  }
  return out;
}

/** Prefer nested job payload when platform stored row.scheduleType as UNKNOWN */
function displayScheduleType(parsed, stored) {
  if (stored && stored !== 'UNKNOWN') return stored;
  const p = parsed?.data?.payload;
  const st = p?.scheduleType;
  if (st === 'ONE_TIME' || st === 'CRON' || st === 'RECURRING') return st;
  return stored || 'UNKNOWN';
}

function TriggerHistoryEntry({ row, index, total }) {
  const { parsed, pretty, raw } = parseTriggerSummary(row.summary);
  const highlights = extractPayloadHighlights(parsed);
  const typeLabel = displayScheduleType(parsed, row.scheduleType);
  const chip = scheduleTypeChipStyle(typeLabel);
  const shortId = row.id && typeof row.id === 'string' ? row.id.slice(0, 10) : '—';
  const typeMismatch = row.scheduleType === 'UNKNOWN' && typeLabel !== 'UNKNOWN';

  return (
    <Box
      className="lab-trigger-history-card"
      css={{
        border: '1px solid $neutral200',
        borderRadius: '$lg',
        overflow: 'hidden',
        backgroundColor: '$white900',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
      }}
    >
      <Box
        css={{
          padding: '$3 $4',
          backgroundColor: '$neutral50',
          borderBottom: '1px solid $neutral200',
        }}
      >
        <HStack justify="space-between" align="flex-start" wrap="wrap" gap="$3">
          <VStack gap="$1" align="flex-start" css={{ flex: '1 1 11rem', minWidth: 0 }}>
            <HStack gap="$2" align="center" wrap="wrap">
              <Text as="div" size="sm" weight="bold" css={{ color: '$neutral900' }}>
                {formatTriggerAt(row.receivedAt)}
              </Text>
              {index === 0 ? (
                <Text
                  as="span"
                  size="xs"
                  weight="bold"
                  css={{
                    color: '$positive600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Latest
                </Text>
              ) : null}
            </HStack>
            <Text
              as="div"
              size="xs"
              css={{ color: '$neutral500', fontFamily: 'ui-monospace, monospace' }}
            >
              {index + 1} of {total} · {shortId}…
            </Text>
          </VStack>
          <HStack gap="$2" wrap="wrap" align="center" css={{ flex: '0 1 auto' }}>
            <Box
              css={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                padding: '0.25rem 0.6rem',
                borderRadius: '999px',
                border: `1px solid ${chip.border}`,
                backgroundColor: chip.bg,
                color: chip.color,
              }}
            >
              {typeLabel}
              {typeMismatch ? ' *' : ''}
            </Box>
            {row.jobName ? (
              <Text
                size="xs"
                css={{
                  fontFamily: 'ui-monospace, monospace',
                  color: '$neutral700',
                  maxWidth: '16rem',
                }}
                title={row.jobName}
              >
                {row.jobName}
              </Text>
            ) : null}
          </HStack>
        </HStack>
        {row.traceId ? (
          <Text
            as="div"
            size="xs"
            css={{
              marginTop: '$2',
              fontFamily: 'ui-monospace, monospace',
              color: '$neutral600',
              wordBreak: 'break-all',
            }}
          >
            trace · {row.traceId}
          </Text>
        ) : null}
        {highlights.length > 0 ? (
          <HStack gap="$4" wrap="wrap" css={{ marginTop: '$3' }}>
            {highlights.map(({ k, v }) => (
              <Box key={k} css={{ minWidth: 0 }}>
                <Text
                  size="xs"
                  css={{
                    color: '$neutral500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 600,
                  }}
                >
                  {k}
                </Text>
                <Text
                  size="sm"
                  weight="bold"
                  css={{ color: '$neutral800', fontFamily: 'ui-monospace, monospace' }}
                >
                  {v}
                </Text>
              </Box>
            ))}
          </HStack>
        ) : null}
        {typeMismatch ? (
          <Text as="div" size="xs" css={{ marginTop: '$2', color: '$neutral500', fontStyle: 'italic' }}>
            * Type from payload{' '}
            <Box as="span" css={{ fontFamily: 'ui-monospace, monospace', fontStyle: 'normal' }}>
              data.payload.scheduleType
            </Box>
            {' '}(stored as UNKNOWN).
          </Text>
        ) : null}
      </Box>
      <Box>
        <Text
          as="div"
          size="xs"
          weight="bold"
          css={{
            padding: '$2 $4',
            color: '$neutral600',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            borderBottom: '1px solid $neutral200',
            backgroundColor: '$neutral50',
          }}
        >
          Payload (JSON)
        </Text>
        <Box
          as="pre"
          className="lab-trigger-payload-pre"
          css={{
            margin: 0,
            padding: '$3 $4',
            maxHeight: '14rem',
            overflow: 'auto',
            fontFamily: 'ui-monospace, monospace',
            fontSize: '0.75rem',
            lineHeight: 1.55,
            backgroundColor: '#0f172a',
            color: '#e2e8f0',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {pretty || raw || '(empty)'}
        </Box>
      </Box>
    </Box>
  );
}

function TriggerHistoryList({ rows }) {
  if (!rows.length) return null;
  const total = rows.length;
  return (
    <VStack gap="$3" align="stretch" css={{ width: '100%' }}>
      <Text size="sm" weight="bold" css={{ color: '$neutral700' }}>
        {total} {total === 1 ? 'trigger' : 'triggers'}
        <Text as="span" weight="normal" css={{ color: '$neutral500', marginLeft: '$2' }}>
          · newest first
        </Text>
      </Text>
      <VStack
        gap="$4"
        align="stretch"
        className="lab-trigger-history-list"
        css={{
          maxHeight: 'min(70vh, 28rem)',
          overflowY: 'auto',
          paddingRight: '$2',
          width: '100%',
        }}
      >
        {rows.map((row, index) => (
          <TriggerHistoryEntry
            key={row.id || `trigger-${index}`}
            row={row}
            index={index}
            total={total}
          />
        ))}
      </VStack>
    </VStack>
  );
}

function ScheduleActionRow({ title, description, input, cta, inputWide = false }) {
  return (
    <Box
      className="lab-db-action-row"
      css={{
        padding: '$4 0',
        borderBottom: '1px solid $neutral200',
        '&:last-of-type': {
          borderBottom: 'none',
          paddingBottom: 0,
        },
      }}
    >
      <Text
        as="div"
        size="xs"
        weight="bold"
        css={{
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '$neutral700',
          marginBottom: description ? '$1' : '$2',
        }}
      >
        {title}
      </Text>
      {description ? (
        <Text as="div" size="xs" css={{ color: '$neutral500', lineHeight: 1.45, marginBottom: '$2' }}>
          {description}
        </Text>
      ) : null}
      {input ? (
        <Box
          css={{
            marginBottom: '$3',
            width: '100%',
            maxWidth: inputWide ? 'min(100%, 56rem)' : 'min(100%, 36rem)',
          }}
        >
          {input}
        </Box>
      ) : null}
      <HStack gap="$2" wrap="wrap" align="flex-start">
        {cta}
      </HStack>
    </Box>
  );
}

export function ScheduleLabPanel({
  loading,
  runAction,
  scheduleTab,
  setScheduleTab,
}) {
  const [delaySeconds, setDelaySeconds] = useState('30');
  const [cronExpression, setCronExpression] = useState('0 9 * * *');
  const [recurringFreq, setRecurringFreq] = useState('10');
  const [recurringUnit, setRecurringUnit] = useState('MINUTES');
  const [triggerRows, setTriggerRows] = useState([]);
  const [triggersLoading, setTriggersLoading] = useState(false);
  const [triggersError, setTriggersError] = useState(null);

  const loadTriggers = useCallback(async () => {
    setTriggersError(null);
    setTriggersLoading(true);
    try {
      const body = await invokeBackendBody('runSdkLabAction', {
        category: '$schedule',
        action: 'listTriggers',
        scheduleType: scheduleTab,
      });
      setTriggerRows(Array.isArray(body?.triggers) ? body.triggers : []);
    } catch (e) {
      setTriggersError(e?.message || String(e));
      setTriggerRows([]);
    } finally {
      setTriggersLoading(false);
    }
  }, [scheduleTab]);

  useEffect(() => {
    setTriggerRows([]);
    setTriggersError(null);
  }, [scheduleTab]);

  const clearTriggersThisTab = async () => {
    setTriggersError(null);
    setTriggersLoading(true);
    try {
      await invokeBackendBody('runSdkLabAction', {
        category: '$schedule',
        action: 'clearTriggers',
        scheduleType: scheduleTab,
      });
      await loadTriggers();
    } catch (e) {
      setTriggersError(e?.message || String(e));
    } finally {
      setTriggersLoading(false);
    }
  };

  const tabMeta = SCHEDULE_TABS.find((t) => t.id === scheduleTab) || SCHEDULE_TABS[0];
  const triggerStorageKey = TRIGGER_LIST_DB_KEY[scheduleTab] || TRIGGER_LIST_DB_KEY.ONE_TIME;
  const logCategory = scheduleTabToLogCategory(scheduleTab);

  const buildSchedulePayload = (op) => {
    const base = { op, scheduleType: scheduleTab };
    if (scheduleTab === 'ONE_TIME') {
      return { ...base, delaySeconds: Number(delaySeconds) || 30 };
    }
    if (scheduleTab === 'CRON') {
      return { ...base, cronExpression: cronExpression.trim() };
    }
    return {
      ...base,
      frequency: Number(recurringFreq) || 1,
      timeUnit: recurringUnit,
    };
  };

  const runScheduleOp = (op) =>
    runAction(
      () => sdkAction('$schedule', 'scheduleOp', buildSchedulePayload(op)),
      `$schedule · ${logCategory} · ${op}`,
    );

  const createInputs =
    scheduleTab === 'ONE_TIME' ? (
      <Box css={{ width: '140px', maxWidth: '100%' }}>
        <Text
          as="span"
          className="lab-field-label"
          size="sm"
          weight="bold"
          css={{ marginBottom: '$2', display: 'block' }}
        >
          Delay (seconds)
        </Text>
        <Input
          type="number"
          min={5}
          max={600}
          value={delaySeconds}
          onChange={(e) => setDelaySeconds(e.target.value)}
        />
      </Box>
    ) : scheduleTab === 'CRON' ? (
      <Box>
        <Text
          as="span"
          className="lab-field-label"
          size="sm"
          weight="bold"
          css={{ marginBottom: '$2', display: 'block' }}
        >
          Cron expression
        </Text>
        <Input
          type="text"
          placeholder="e.g. 0 9 * * *"
          value={cronExpression}
          onChange={(e) => setCronExpression(e.target.value)}
          css={{ fontFamily: 'ui-monospace, monospace' }}
        />
        <Text as="div" size="xs" css={{ color: '$neutral500', marginTop: '$2', lineHeight: 1.45 }}>
          Platform validates the expression; use a schedule your environment allows.
        </Text>
      </Box>
    ) : (
      <VStack gap="$3" align="stretch" css={{ maxWidth: 'min(100%, 36rem)' }}>
        <HStack gap="$4" align="end" wrap="wrap">
          <Box css={{ width: '120px', maxWidth: '100%' }}>
            <Text
              as="span"
              className="lab-field-label"
              size="sm"
              weight="bold"
              css={{ marginBottom: '$2', display: 'block' }}
            >
              Frequency
            </Text>
            <Input
              type="number"
              min={1}
              value={recurringFreq}
              onChange={(e) => setRecurringFreq(e.target.value)}
            />
          </Box>
          <Box css={{ minWidth: '160px', maxWidth: '100%' }}>
            <Text
              as="span"
              className="lab-field-label"
              size="sm"
              weight="bold"
              css={{ marginBottom: '$2', display: 'block' }}
            >
              Time unit
            </Text>
            <select
              className="lab-schedule-unit-select"
              value={recurringUnit}
              onChange={(e) => setRecurringUnit(e.target.value)}
            >
              {RECURRING_UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </Box>
        </HStack>
        <Text as="div" size="xs" css={{ color: '$neutral500', lineHeight: 1.45 }}>
          If time unit is MINUTES, frequency must be at least 10 (platform rule).
        </Text>
      </VStack>
    );

  return (
    <VStack gap="$4" align="stretch">
      <Text as="div" size="md" css={{ color: '$neutral800', lineHeight: 1.6 }}>
        <Text as="span" weight="bold">$schedule</Text> — one fixed job name per type (unique per product).
        Run logs are kept per tab (
        <Text as="span" css={{ fontFamily: 'ui-monospace, monospace' }}>$schedule-one_time</Text>,{' '}
        <Text as="span" css={{ fontFamily: 'ui-monospace, monospace' }}>$schedule-cron</Text>,{' '}
        <Text as="span" css={{ fontFamily: 'ui-monospace, monospace' }}>$schedule-recurring</Text>
        ). Target handler:{' '}
        <Text as="span" css={{ fontFamily: 'ui-monospace, monospace' }}>executeScheduledCapabilityJob</Text>.
      </Text>

      <Box
        className="lab-schedule-tablist"
        role="tablist"
        aria-label="Schedule types"
        css={{
          marginTop: '$2',
          paddingBottom: '$4',
          borderBottom: '1px solid $neutral200',
        }}
      >
        {SCHEDULE_TABS.map((t) => {
          const selected = scheduleTab === t.id;
          return (
            <Button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`schedule-tabpanel-${t.id}`}
              id={`schedule-tab-${t.id}`}
              className={`lab-schedule-tab${selected ? ' is-selected' : ''}`}
              size="md"
              color={selected ? 'primary' : 'secondary'}
              variant={selected ? 'solid' : 'outline'}
              onClick={() => setScheduleTab(t.id)}
            >
              {t.label}
            </Button>
          );
        })}
      </Box>

      <Box
        role="tabpanel"
        id={`schedule-tabpanel-${scheduleTab}`}
        aria-labelledby={`schedule-tab-${scheduleTab}`}
        className="lab-db-tabpanel lab-db-action-list"
        css={{ paddingTop: '$1' }}
      >
        <Text
          as="div"
          size="sm"
          css={{
            color: '$neutral600',
            fontFamily: 'ui-monospace, monospace',
            marginBottom: '$3',
          }}
        >
          Job name: <Text as="span" weight="bold">{tabMeta.jobName}</Text>
          {' · '}
          Log filter: <Text as="span" weight="bold">{logCategory}</Text>
        </Text>

        <ScheduleActionRow
          title="Create"
          description={
            scheduleTab === 'ONE_TIME'
              ? 'Deletes any existing lab job for this type, then creates a ONE_TIME schedule at now + delay. Only this action uses the fields below.'
              : scheduleTab === 'CRON'
                ? 'Deletes any existing lab CRON job, then creates with your cron expression. Only this action uses the fields below.'
                : 'Deletes any existing lab RECURRING job, then creates with frequency and time unit. Only this action uses the fields below.'
          }
          input={createInputs}
          cta={
            <Button
              color="secondary"
              variant="outline"
              disabled={loading}
              onClick={() => runScheduleOp('create')}
            >
              Create
            </Button>
          }
        />

        <ScheduleActionRow
          title="Get"
          description="Calls platform $schedule.get for this type’s fixed job name and returns merged metadata from $db.string (last create parameters)."
          cta={
            <Button
              color="secondary"
              variant="outline"
              disabled={loading}
              onClick={() => runScheduleOp('get')}
            >
              Get
            </Button>
          }
        />

        <ScheduleActionRow
          title="Delete"
          description="Removes the lab job for this type (if present) and clears stored metadata for this type."
          cta={
            <Button
              color="secondary"
              variant="outline"
              disabled={loading}
              onClick={() => runScheduleOp('delete')}
            >
              Delete
            </Button>
          }
        />

        <ScheduleActionRow
          inputWide
          title="Platform trigger history"
          description={
            <>
              When a schedule runs, the platform can invoke{' '}
              <Text as="span" css={{ fontFamily: 'ui-monospace, monospace' }}>onScheduledEvent</Text>{' '}
              (<Text as="span" css={{ fontFamily: 'ui-monospace, monospace' }}>manifest.json</Text>
              ). This tab reads/writes only its own{' '}
              <Text as="span" css={{ fontFamily: 'ui-monospace, monospace' }}>$db.list</Text> key:{' '}
              <Text as="span" css={{ fontFamily: 'ui-monospace, monospace' }}>{triggerStorageKey}</Text>.
              Unclassified payloads are stored in the One time list. Use <Text as="span" weight="bold">Get trigger list</Text> to load rows.
            </>
          }
          input={
            <VStack gap="$2" align="stretch" css={{ width: '100%' }}>
              {triggersError ? (
                <Text as="div" size="sm" css={{ color: '$negative600' }}>
                  {triggersError}
                </Text>
              ) : null}
              {triggerRows.length === 0 && !triggersLoading ? (
                <Text as="div" size="sm" css={{ color: '$neutral500', lineHeight: 1.5 }}>
                  No rows loaded for <Text as="span" weight="bold">{tabMeta.label}</Text>. Click{' '}
                  <Text as="span" weight="bold">Get trigger list</Text> after schedules fire.
                </Text>
              ) : null}
              {triggerRows.length > 0 ? <TriggerHistoryList rows={triggerRows} /> : null}
            </VStack>
          }
          cta={
            <HStack gap="$2" wrap="wrap" align="flex-start">
              <Button
                color="secondary"
                variant="outline"
                disabled={loading || triggersLoading}
                onClick={() => loadTriggers()}
              >
                {triggersLoading ? 'Loading…' : 'Get trigger list'}
              </Button>
              <Button
                color="secondary"
                variant="outline"
                disabled={loading || triggersLoading}
                onClick={() => clearTriggersThisTab()}
              >
                Clear trigger list
              </Button>
            </HStack>
          }
        />
      </Box>
    </VStack>
  );
}

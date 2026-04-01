import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  HStack,
  Input,
  Separator,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  VStack,
} from '@sparrowengg/twigs-react';
import { invokeBackendBody, sdkAction } from '../labApi.js';

const NEXT_HISTORY_STORAGE_KEY = 'capability_lab:next_run_invocations';

function formatInvocationAt(iso) {
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

function payloadPretty(row) {
  if (row.payload == null) return '(empty payload)';
  try {
    return JSON.stringify(row.payload, null, 2);
  } catch {
    return String(row.payload);
  }
}

function NextInvocationHistoryTable({ rows }) {
  if (!rows.length) return null;
  const total = rows.length;
  return (
    <VStack gap="$3" align="stretch" css={{ width: '100%' }}>
      <Text size="sm" weight="bold" css={{ color: '$neutral700' }}>
        {total} {total === 1 ? 'invocation' : 'invocations'}
        <Text as="span" weight="normal" css={{ color: '$neutral500', marginLeft: '$2' }}>
          · newest first
        </Text>
      </Text>
      <Box
        className="lab-next-history-table-wrap"
        css={{
          width: '100%',
          maxWidth: 'min(100%, 64rem)',
          overflow: 'auto',
          maxHeight: 'min(70vh, 32rem)',
          borderRadius: '$lg',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: '$neutral200',
        }}
      >
        <Table css={{ width: '100%', minWidth: '36rem', borderCollapse: 'collapse' }}>
          <Thead
            css={{
              position: 'sticky',
              top: 0,
              zIndex: 2,
              backgroundColor: '$neutral50',
              boxShadow: '0 1px 0 $neutral200',
            }}
          >
            <Tr css={{ backgroundColor: '$neutral50' }}>
              <Th
                css={{
                  width: '3rem',
                  padding: '$2 $3',
                  fontSize: '$xs',
                  textAlign: 'left',
                  borderBottom: '1px solid $neutral200',
                }}
              >
                #
              </Th>
              <Th
                css={{
                  minWidth: '11rem',
                  padding: '$2 $3',
                  fontSize: '$xs',
                  textAlign: 'left',
                  borderBottom: '1px solid $neutral200',
                }}
              >
                Invoked at
              </Th>
              <Th
                css={{
                  minWidth: '9rem',
                  padding: '$2 $3',
                  fontSize: '$xs',
                  textAlign: 'left',
                  borderBottom: '1px solid $neutral200',
                }}
              >
                Record id
              </Th>
              <Th
                css={{
                  minWidth: '14rem',
                  padding: '$2 $3',
                  fontSize: '$xs',
                  textAlign: 'left',
                  borderBottom: '1px solid $neutral200',
                }}
              >
                Payload (JSON)
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((row, index) => (
              <Tr key={row.id || `next-inv-${index}`} css={{ verticalAlign: 'top' }}>
                <Td
                  css={{
                    padding: '$2 $3',
                    borderBottom: '1px solid $neutral200',
                    fontSize: '$sm',
                  }}
                >
                  <VStack gap="$1" align="flex-start">
                    <Text size="sm" weight="bold" css={{ color: '$neutral800' }}>
                      {index + 1}
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
                  </VStack>
                </Td>
                <Td
                  css={{
                    padding: '$2 $3',
                    borderBottom: '1px solid $neutral200',
                  }}
                >
                  <Text size="sm" weight="bold" css={{ color: '$neutral900' }}>
                    {formatInvocationAt(row.invokedAt)}
                  </Text>
                </Td>
                <Td
                  css={{
                    padding: '$2 $3',
                    borderBottom: '1px solid $neutral200',
                  }}
                >
                  <Text
                    size="xs"
                    css={{
                      fontFamily: 'ui-monospace, monospace',
                      color: '$neutral700',
                      wordBreak: 'break-all',
                    }}
                    title={row.id ? String(row.id) : ''}
                  >
                    {row.id ? String(row.id) : '—'}
                  </Text>
                </Td>
                <Td
                  css={{
                    padding: '$2 $3',
                    borderBottom: '1px solid $neutral200',
                    maxWidth: '28rem',
                  }}
                >
                  <Box
                    as="pre"
                    className="lab-next-payload-scroll"
                    css={{
                      margin: 0,
                      padding: '$2 $3',
                      maxHeight: '11rem',
                      maxWidth: '100%',
                      overflow: 'auto',
                      fontFamily: 'ui-monospace, monospace',
                      fontSize: '0.75rem',
                      lineHeight: 1.55,
                      backgroundColor: '#0f172a',
                      color: '#e2e8f0',
                      whiteSpace: 'pre',
                      borderRadius: '$md',
                    }}
                  >
                    {payloadPretty(row)}
                  </Box>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </VStack>
  );
}

export function NextLabPanel({
  loading,
  runAction,
  nextFn,
  setNextFn,
  nextDelay,
  setNextDelay,
  nextPayloadJson,
  setNextPayloadJson,
}) {
  const [invocationRows, setInvocationRows] = useState([]);
  const [invocationsLoading, setInvocationsLoading] = useState(false);
  const [invocationsError, setInvocationsError] = useState(null);

  const loadInvocations = useCallback(async () => {
    setInvocationsError(null);
    setInvocationsLoading(true);
    try {
      const body = await invokeBackendBody('runSdkLabAction', {
        category: '$next',
        action: 'listNextInvocations',
      });
      setInvocationRows(Array.isArray(body?.invocations) ? body.invocations : []);
    } catch (e) {
      setInvocationsError(e?.message || String(e));
      setInvocationRows([]);
    } finally {
      setInvocationsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvocations();
  }, [loadInvocations]);

  const clearInvocations = async () => {
    setInvocationsError(null);
    setInvocationsLoading(true);
    try {
      await invokeBackendBody('runSdkLabAction', {
        category: '$next',
        action: 'clearNextInvocations',
      });
      await loadInvocations();
    } catch (e) {
      setInvocationsError(e?.message || String(e));
    } finally {
      setInvocationsLoading(false);
    }
  };

  const runNextAndRefresh = async (fn, title) => {
    await runAction(fn, title);
    await loadInvocations();
  };

  return (
    <VStack gap="$4" align="stretch">
      <Text as="div" size="md" css={{ color: '$neutral800', lineHeight: 1.6 }}>
        <Text as="span" weight="bold">$next.run</Text> invokes an exported backend function by name. The
        lab ships <Text as="span" css={{ fontFamily: 'ui-monospace, monospace' }}>nextLabLogInvocation</Text>
        , which appends <Text as="span" weight="bold">invocation time</Text> and{' '}
        <Text as="span" weight="bold">payload</Text> to a <Text as="span" css={{ fontFamily: 'ui-monospace, monospace' }}>$db.list</Text>{' '}
        history (see below).
      </Text>
      <Separator />
      <Text weight="bold">Invoke a function</Text>
      <Text size="sm" css={{ color: '$neutral600', lineHeight: 1.5 }}>
        Default <Text as="span" weight="bold">functionName</Text> is{' '}
        <Text as="span" css={{ fontFamily: 'ui-monospace, monospace' }}>nextLabLogInvocation</Text>
        (must match <Text as="span" css={{ fontFamily: 'ui-monospace, monospace' }}>manifest.json</Text>
        ). After a delayed run, use <Text as="span" weight="bold">Refresh history</Text> to see the new row.
      </Text>
      <Box css={{ maxWidth: '520px' }}>
        <Text as="span" className="lab-field-label" size="sm" css={{ marginBottom: '$2' }}>
          functionName
        </Text>
        <Input value={nextFn} onChange={(e) => setNextFn(e.target.value)} />
      </Box>
      <Box css={{ maxWidth: '520px' }}>
        <Text as="span" className="lab-field-label" size="sm" css={{ marginBottom: '$2' }}>
          delay (seconds, 0–300)
        </Text>
        <Input value={nextDelay} onChange={(e) => setNextDelay(e.target.value)} />
      </Box>
      <Box css={{ maxWidth: '520px' }}>
        <Text as="span" className="lab-field-label" size="sm" css={{ marginBottom: '$2' }}>
          payload (JSON object)
        </Text>
        <Textarea
          value={nextPayloadJson}
          onChange={(e) => setNextPayloadJson(e.target.value)}
          rows={4}
        />
      </Box>
      <Button
        color="secondary"
        variant="outline"
        disabled={loading}
        css={{ alignSelf: 'flex-start' }}
        onClick={() =>
          runNextAndRefresh(
            () =>
              sdkAction('$next', 'run', {
                functionName: nextFn.trim(),
                payloadJson: nextPayloadJson,
                delaySeconds: Number(nextDelay) || 0,
              }),
            '$next · run',
          )
        }
      >
        Run $next.run
      </Button>

      <Separator />

      <Box
        className="lab-db-action-row"
        css={{
          padding: '$4 0',
          borderTop: '1px solid $neutral200',
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
            marginBottom: '$2',
          }}
        >
          $next trigger history
        </Text>
        <Text as="div" size="xs" css={{ color: '$neutral500', lineHeight: 1.45, marginBottom: '$3' }}>
          Rows are written only when{' '}
          <Text as="span" css={{ fontFamily: 'ui-monospace, monospace' }}>nextLabLogInvocation</Text>{' '}
          runs. Storage key:{' '}
          <Text as="span" css={{ fontFamily: 'ui-monospace, monospace' }}>{NEXT_HISTORY_STORAGE_KEY}</Text>.
        </Text>
        <VStack gap="$2" align="stretch" css={{ width: '100%', maxWidth: 'min(100%, 56rem)' }}>
          {invocationsError ? (
            <Text as="div" size="sm" css={{ color: '$negative600' }}>
              {invocationsError}
            </Text>
          ) : null}
          {invocationRows.length === 0 && !invocationsLoading ? (
            <Text as="div" size="sm" css={{ color: '$neutral500', lineHeight: 1.5 }}>
              No invocations yet. Run <Text as="span" weight="bold">$next.run</Text> with{' '}
              <Text as="span" css={{ fontFamily: 'ui-monospace, monospace' }}>nextLabLogInvocation</Text>, then{' '}
              <Text as="span" weight="bold">Refresh history</Text>
              {Number(nextDelay) > 0 ? ' after the delay' : ''}.
            </Text>
          ) : null}
          {invocationRows.length > 0 ? <NextInvocationHistoryTable rows={invocationRows} /> : null}
        </VStack>
        <HStack gap="$2" wrap="wrap" align="flex-start" css={{ marginTop: '$3' }}>
          <Button
            color="secondary"
            variant="outline"
            disabled={loading || invocationsLoading}
            onClick={() => loadInvocations()}
          >
            {invocationsLoading ? 'Loading…' : 'Refresh history'}
          </Button>
          <Button
            color="secondary"
            variant="outline"
            disabled={loading || invocationsLoading}
            onClick={() => clearInvocations()}
          >
            Clear history
          </Button>
        </HStack>
      </Box>
    </VStack>
  );
}

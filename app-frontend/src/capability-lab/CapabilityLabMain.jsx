import {
  Alert,
  AlertDescription,
  Box,
  Button,
  Heading,
  HStack,
  Separator,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from '@sparrowengg/twigs-react';

export function CapabilityLabMain({
  activeMeta,
  logsHeading,
  panel,
  error,
  actionOutcome,
  lastResult,
  runs,
  totalRuns,
  loading,
  onRefreshRuns,
  onOpenClearLogs,
}) {
  return (
    <Box
      id="capability-lab-main"
      css={{
        flex: 1,
        minWidth: 0,
        padding: '$5',
        '@media (min-width: 900px)': { padding: '$8' },
        backgroundColor: '$white900',
      }}
    >
      <VStack gap="$5" align="stretch">
        <VStack gap="$2" align="start" className="lab-main-header">
          <HStack gap="$2" align="center" wrap="wrap">
            <Heading
              size="h4"
              css={{ fontFamily: 'ui-monospace, monospace', color: '$primary700' }}
            >
              {activeMeta.title}
            </Heading>
            <Box
              className="lab-badge"
              css={{
                padding: '$1 $3',
                borderRadius: '$pill',
                backgroundColor: '$accent100',
                color: '$accent800',
              }}
            >
              <Text size="xs" weight="bold">
                Appnest function
              </Text>
            </Box>
          </HStack>
          <Text as="p" className="lab-blurb" css={{ color: '$neutral700', maxWidth: '720px' }}>
            {activeMeta.blurb}
          </Text>
        </VStack>

        <Box
          className="lab-main-card"
          css={{
            padding: '$5',
            borderRadius: '$xl',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: '$neutral200',
            background:
              'linear-gradient(180deg, $colors$white900 0%, $colors$neutral50 100%)',
            boxShadow: 'sm',
          }}
        >
          {panel}
        </Box>

        {error ? (
          <Alert status="error">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {actionOutcome ? (
          <div className="lab-action-outcome">
            <Text
              as="div"
              className="lab-action-outcome-title"
              size="xs"
              weight="bold"
              css={{
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '$neutral600',
                marginBottom: '$1',
              }}
            >
              {actionOutcome.title}
            </Text>
            {actionOutcome.statusLine ? (
              <Text
                as="div"
                className="lab-action-outcome-status"
                size="xs"
                css={{ color: '$neutral500', marginBottom: '$2' }}
              >
                {actionOutcome.statusLine}
              </Text>
            ) : null}
            <div className="lab-action-outcome-scroll-host">
              <pre className="lab-action-outcome-body">{actionOutcome.body}</pre>
            </div>
          </div>
        ) : null}

        {lastResult?.preSignedUrl ? (
          <Alert status="info">
            <AlertDescription>
              <Text as="span" size="sm" css={{ wordBreak: 'break-all' }}>
                URL: {String(lastResult.preSignedUrl).slice(0, 200)}
                {String(lastResult.preSignedUrl).length > 200 ? '…' : ''}
              </Text>
            </AlertDescription>
          </Alert>
        ) : null}

        <Separator />

        <VStack gap="$3" align="stretch">
          <HStack
            className="lab-logs-header"
            justify="space-between"
            align="center"
            wrap="wrap"
            gap="$3"
          >
            <Heading size="h6">
              Run logs · {logsHeading}{' '}
              <Text as="span" size="sm" css={{ color: '$neutral600' }}>
                ({runs.length} shown / {totalRuns} total in store)
              </Text>
            </Heading>
            <HStack className="lab-logs-actions" gap="$2" wrap="wrap" justify="flex-end">
              <Button
                className="lab-toolbar-btn"
                color="secondary"
                variant="outline"
                size="sm"
                disabled={loading}
                onClick={onRefreshRuns}
              >
                Refresh logs
              </Button>
              <Button
                className="lab-toolbar-btn"
                color="secondary"
                variant="outline"
                size="sm"
                disabled={loading}
                onClick={onOpenClearLogs}
              >
                Clear this function's logs
              </Button>
            </HStack>
          </HStack>
          {runs.length === 0 ? (
            <Box
              className="lab-logs-empty"
              css={{
                padding: '$8',
                textAlign: 'center',
                borderRadius: '$lg',
                backgroundColor: '$neutral100',
                border: '1px dashed $neutral300',
              }}
            >
              <Text css={{ color: '$neutral600' }}>
                No log rows for {logsHeading} yet. Run an action above.
              </Text>
            </Box>
          ) : (
            <Box css={{ overflowX: 'auto', borderRadius: '$lg' }}>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Time</Th>
                    <Th>Action</Th>
                    <Th>Status</Th>
                    <Th>Message</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {runs.map((r) => (
                    <Tr key={r.id || `${r.at}-${r.message}`}>
                      <Td>
                        <Text size="sm">{r.at || '—'}</Text>
                      </Td>
                      <Td>
                        <Text
                          size="sm"
                          weight="bold"
                          css={{ fontFamily: 'ui-monospace, monospace' }}
                        >
                          {r.action || r.module || '—'}
                        </Text>
                      </Td>
                      <Td>
                        <Text size="sm">{r.status || '—'}</Text>
                      </Td>
                      <Td>
                        <Text size="sm" css={{ maxWidth: '400px' }}>
                          {r.message || '—'}
                        </Text>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </VStack>
      </VStack>
    </Box>
  );
}

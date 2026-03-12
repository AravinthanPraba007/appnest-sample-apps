import { useState, useEffect } from 'react';
import { Button, Box, Stack, Text } from '@sparrowengg/twigs-react';
import { AddColumnIcon } from '@sparrowengg/twigs-react-icons';
import { api } from '../services/api';

function Dashboard({ onNewImport, onImportHistory, onOpenImportDetails, error, setError }) {
  const [recentRuns, setRecentRuns] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getImportHistory({ limit: 5 })
      .then((res) => {
        if (!cancelled && res?.runs) setRecentRuns(res.runs);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [setError]);

  return (
    <Box className="screen dashboard" padding="xl">
      <Stack gap="xl">
        <header className="screen-header">
          <Text as="h1" size="xl" weight="bold" css={{ margin: 0 }}>CSV Response Importer</Text>
          <Text size="sm" color="dimmed">Import survey responses from CSV into SurveySparrow</Text>
        </header>

        {error && (
          <Box
            padding="md"
            css={{ background: '#f8d7da', color: '#721c24', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            role="alert"
          >
            <Text size="sm">{error}</Text>
            <Button variant="ghost" size="xs" color="default" onClick={() => setError(null)} aria-label="Dismiss">
              ×
            </Button>
          </Box>
        )}

        <Stack gap="md" direction="row">
          <Button color="primary" size="md" leftIcon={<AddColumnIcon size={18} />} onClick={onNewImport}>
            New Import
          </Button>
          <Button color="secondary" variant="outline" size="md" onClick={onImportHistory}>
            Import History
          </Button>
        </Stack>

        <Box as="section" className="recent-imports">
          <Text as="h2" size="lg" weight="semibold" css={{ marginBottom: 8 }}>Recent Imports</Text>
          {loading ? (
            <Text size="sm" color="dimmed">Loading…</Text>
          ) : recentRuns.length === 0 ? (
            <Text size="sm" color="dimmed">No imports yet. Start with <strong>New Import</strong>.</Text>
          ) : (
            <Stack gap="sm" as="ul" className="run-list" css={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {recentRuns.map((run) => (
                <Box
                  key={run.importId}
                  as="li"
                  padding="md"
                  css={{ borderBottom: '1px solid $border', display: 'flex', alignItems: 'center', gap: 16 }}
                  className="run-item"
                >
                  <Text size="sm" css={{ fontFamily: 'monospace' }} className="run-id">{run.importId}</Text>
                  <Text size="sm" className="run-status">{run.status}</Text>
                  <Text size="sm" color="dimmed" className="run-counts">
                    {run.successCount ?? 0} / {run.totalRows ?? 0} rows
                  </Text>
                  <Button variant="ghost" size="sm" color="primary" onClick={() => onOpenImportDetails(run.importId)}>
                    View details
                  </Button>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </Stack>
    </Box>
  );
}

export default Dashboard;

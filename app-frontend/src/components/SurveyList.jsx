import { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Stack,
  Text,
  Button,
  CircleLoader,
  Alert,
  AlertDescription,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@sparrowengg/twigs-react';
import { invoke } from '../services/backend';

export function SurveyList({ onSelectSurvey }) {
  const [surveys, setSurveys] = useState([]);
  const [lastSync, setLastSync] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await invoke('getSurveys', {});
      setSurveys(res?.surveys ?? []);
      setLastSync(res?.lastSync ?? null);
    } catch (e) {
      setError(e.message || 'Failed to load surveys');
      setSurveys([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSync = async () => {
    setError(null);
    setSyncing(true);
    try {
      await invoke('syncSurveys', {});
      await load();
    } catch (e) {
      setError(e.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" css={{ minHeight: 200 }}>
        <Stack gap="md" alignX="center" alignY="center">
          <Text variant="body">Loading surveys…</Text>
          <CircleLoader size="lg" />
        </Stack>
      </Flex>
    );
  }

  return (
    <Stack gap="lg" alignX="left" alignY="stretch">
      {/* Toolbar: title + sync */}
      <Flex justifyContent="space-between" alignItems="center" gap="$4" wrap="wrap">
        <Stack gap="xs">
          <Text css={{ fontWeight: 600, fontSize: '$lg' }}>Surveys</Text>
          {lastSync && (
            <Text variant="bodySmall" color="neutral600">
              Last synced: {new Date(lastSync).toLocaleString()}
            </Text>
          )}
        </Stack>
        <Button variant="primary" onClick={handleSync} disabled={syncing}>
          {syncing ? 'Syncing…' : 'Sync from API'}
        </Button>
      </Flex>

      {error && (
        <Alert status="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!error && surveys.length === 0 && (
        <Box css={{ padding: '$8', textAlign: 'center', backgroundColor: '$white900', borderRadius: '$lg', border: '1px solid $colors$neutral200' }}>
          <Text variant="body">No surveys yet. Click “Sync from API” to load from SurveySparrow.</Text>
        </Box>
      )}

      {!error && surveys.length > 0 && (
        <Box css={{ backgroundColor: '$white900', borderRadius: '$lg', border: '1px solid $colors$neutral200', overflow: 'hidden' }}>
          <Table css={{ width: '100%', tableLayout: 'fixed' }}>
            <Thead>
              <Tr>
                <Th css={{ width: '40%' }}>Survey Name</Th>
                <Th css={{ width: '20%' }}>Survey ID</Th>
                <Th css={{ width: '22%' }}>Created</Th>
                <Th css={{ width: '18%', textAlign: 'right' }}>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {surveys.map((s) => (
                <Tr key={s.id || s.survey_id}>
                  <Td css={{ fontWeight: 500 }}>{s.name || s.title || '—'}</Td>
                  <Td>
                    <Text variant="bodySmall" color="neutral700">{s.id ?? s.survey_id ?? '—'}</Text>
                  </Td>
                  <Td>
                    <Text variant="bodySmall">
                      {s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}
                    </Text>
                  </Td>
                  <Td css={{ textAlign: 'right' }}>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onSelectSurvey(s.id ?? s.survey_id, s.name || s.title)}
                    >
                      View Responses
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Stack>
  );
}

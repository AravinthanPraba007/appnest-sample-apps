import * as Twigs from '@sparrowengg/twigs-react';

const { Box, Stack, Text, Button, CircleLoader } = Twigs;

export default function BackupsView({ backups, loading, error, onRefresh, onDownload }) {
  if (loading) {
    return (
      <Stack gap="md" direction="column" alignX="center" padding="xl">
        <CircleLoader size="lg" />
        <Text size="sm" color="gray">Loading backups…</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="xl" direction="column" className="app-section">
      <div className="app-header-row">
        <Text as="h1" size="xl" weight="semibold">Response backups</Text>
        <div className="app-actions">
          <Button variant="secondary" size="sm" onClick={onRefresh}>Refresh</Button>
        </div>
      </div>

      {error && (
        <Box padding="md" className="app-error">
          <Text size="sm">{error}</Text>
        </Box>
      )}

      <Text size="md" color="gray" className="app-subtitle">CSV backups created from the Response view. Click Download to open the file.</Text>

      {!backups?.length ? (
        <div className="app-empty">
          <Text size="md" color="gray">No backups yet. Open a survey, view responses, and use “Backup as CSV”.</Text>
        </div>
      ) : (
        <Stack gap="md" direction="column">
          {backups.map((b) => (
            <Box key={b.path} padding="lg" className="app-card">
              <Stack direction="row" alignY="center" justify="space-between" gap="md">
                <Stack gap="xs" direction="column">
                  <Text size="md" weight="medium">{b.filename || b.path}</Text>
                  <Text size="sm" color="gray">
                    {b.surveyName || `Survey ${b.surveyId}`} · {b.createdAt ? new Date(b.createdAt).toLocaleString() : ''}
                  </Text>
                </Stack>
                <Button size="sm" onClick={() => onDownload(b.path)}>
                  Download
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

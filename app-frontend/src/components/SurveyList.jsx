import { Box, Stack, Text, Button, CircleLoader } from '@sparrowengg/twigs-react';


export default function SurveyList({ surveys, loading, syncing, error, onRetry, onSync, onViewResponses }) {
  if (loading) {
    return (
      <Stack gap="md" direction="column" alignX="center" padding="xl">
        <CircleLoader size="lg" />
        <Text size="sm" color="gray">Loading surveys…</Text>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack gap="md" direction="column">
        <Box padding="md" className="app-error">
          <Text size="sm">{error}</Text>
        </Box>
        <Button variant="secondary" size="sm" onClick={onRetry}>Retry</Button>
      </Stack>
    );
  }

  return (
    <Stack gap="xl" direction="column" className="app-section">
      <div className="app-header-row">
        <Text as="h1" size="xl" weight="semibold">Surveys</Text>
        <div className="app-actions">
          <Button variant="secondary" size="sm" onClick={onSync} disabled={syncing}>
            {syncing ? 'Syncing…' : 'Sync latest'}
          </Button>
        </div>
      </div>
      <Text size="md" color="gray" className="app-subtitle">Cached list. Use “Sync latest” to refresh from SurveySparrow.</Text>

      {!surveys?.length ? (
        <div className="app-empty">
          <Text size="md" color="gray">No surveys in cache. Click “Sync latest” to fetch from SurveySparrow.</Text>
        </div>
      ) : (
        <Stack gap="md" direction="column">
          {surveys.map((survey) => (
            <Box key={survey.id} padding="lg" className="app-card">
              <Stack gap="sm" direction="column">
                <Stack direction="row" alignY="center" justify="space-between" gap="md">
                  <Text size="lg" weight="medium">{survey.name || 'Unnamed Survey'}</Text>
                  <Button
                    size="sm"
                    onClick={() => onViewResponses(survey)}
                  >
                    View Responses
                  </Button>
                </Stack>
                <Stack direction="row" gap="lg">
                  <Text size="sm" color="gray">ID: {survey.id}</Text>
                  {survey.created_at && (
                    <Text size="sm" color="gray">
                      Created: {new Date(survey.created_at).toLocaleDateString()}
                    </Text>
                  )}
                </Stack>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

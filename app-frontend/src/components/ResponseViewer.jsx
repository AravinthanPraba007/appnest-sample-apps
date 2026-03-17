import * as Twigs from '@sparrowengg/twigs-react';

const { Box, Stack, Text, Button, CircleLoader } = Twigs;

function formatAnswer(answer) {
  if (answer == null) return '—';
  if (typeof answer === 'object' && answer.answer !== undefined) return String(answer.answer);
  if (Array.isArray(answer)) return answer.map((a) => (a?.answer != null ? a.answer : a)).join(', ');
  return String(answer);
}

function ResponseCard({ response }) {
  const answers = response?.answers ?? [];
  const completedTime = response?.completed_time;

  return (
    <Box padding="lg" className="app-card">
      <Stack gap="sm" direction="column">
        <Stack direction="row" gap="md">
          <Text size="sm" weight="medium">Response ID: {response?.id ?? '—'}</Text>
          {completedTime && (
            <Text size="sm" color="gray">
              Submitted: {new Date(completedTime).toLocaleString()}
            </Text>
          )}
        </Stack>
        {answers.length > 0 ? (
          <Stack gap="xs" direction="column">
            {answers.map((item, idx) => (
              <Box key={idx} padding="sm">
                <Text size="sm" weight="medium">
                  {item.question_id != null ? `Q${item.question_id}: ` : ''}
                  {item.question ?? 'Question'}
                </Text>
                <Text size="sm" color="gray">
                  A: {item.skipped ? '(Skipped)' : formatAnswer(item.answer ?? item)}
                </Text>
              </Box>
            ))}
          </Stack>
        ) : (
          <Text size="sm" color="gray">No answers</Text>
        )}
      </Stack>
    </Box>
  );
}

export default function ResponseViewer({
  survey,
  responses,
  meta,
  loading,
  error,
  onRetry,
  onPageChange,
  onBackupCsv,
  backupLoading,
}) {
  const { page = 1, per_page: perPage = 10, total = 0, has_next_page: hasNext } = meta ?? {};
  const totalPages = total > 0 ? Math.max(1, Math.ceil(total / perPage)) : (hasNext ? page + 1 : page);
  const isFirstPage = page <= 1;
  const isLastPage = !hasNext;

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
        <Text as="h1" size="xl" weight="semibold">Survey: {survey?.name ?? 'Responses'}</Text>
        {survey?.id && (
          <Button
            size="sm"
            onClick={onBackupCsv}
            disabled={backupLoading}
          >
            {backupLoading ? 'Creating backup…' : 'Backup as CSV'}
          </Button>
        )}
      </div>

      {loading ? (
        <Stack gap="md" direction="column" alignX="center" padding="xl">
          <CircleLoader size="lg" />
          <Text size="sm" color="gray">Loading responses…</Text>
        </Stack>
      ) : !responses?.length ? (
        <div className="app-empty">
          <Text size="md" color="gray">No responses found.</Text>
        </div>
      ) : (
        <>
          <Stack gap="md" direction="column">
            {responses.map((r) => (
              <ResponseCard key={r.id} response={r} />
            ))}
          </Stack>

          <Stack direction="row" alignY="center" gap="md" padding="md">
            <Button
              size="sm"
              variant="secondary"
              disabled={isFirstPage}
              onClick={() => onPageChange(page - 1)}
            >
              Previous
            </Button>
            <Text size="sm" color="gray">
              Page {page}{total > 0 ? ` of ${totalPages} (${total} total)` : ''}
            </Text>
            <Button
              size="sm"
              variant="secondary"
              disabled={isLastPage}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </Button>
          </Stack>
        </>
      )}
    </Stack>
  );
}

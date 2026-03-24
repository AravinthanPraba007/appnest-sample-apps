import { useState, useEffect, useRef, Fragment } from 'react';
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

const PER_PAGE = 10;

export function ResponseViewer({ surveyId, surveyName, onBack }) {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, per_page: PER_PAGE, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const prevSurveyIdRef = useRef(surveyId);

  useEffect(() => {
    if (!surveyId) return;
    const isNewSurvey = prevSurveyIdRef.current !== surveyId;
    if (isNewSurvey) {
      prevSurveyIdRef.current = surveyId;
      setPage(1);
      setExpandedId(null);
    }
    setError(null);
    setLoading(true);
    const pageToFetch = isNewSurvey ? 1 : page;
    invoke('getResponses', { surveyId, page: pageToFetch, per_page: PER_PAGE })
      .then((res) => {
        setData(res?.data ?? []);
        setMeta(res?.meta ?? { page: pageToFetch, per_page: PER_PAGE, total: 0 });
        if (isNewSurvey) setPage(1);
      })
      .catch((e) => {
        setError(e.message || 'Failed to load responses');
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [surveyId, page]);

  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / (meta.per_page || PER_PAGE)));

  if (!surveyId) {
    return (
      <Box css={{ padding: '$8', textAlign: 'center', backgroundColor: '$white900', borderRadius: '$lg', border: '1px solid $colors$neutral200' }}>
        <Stack gap="md" alignX="center" alignY="center">
          <Text variant="body">Select a survey from the Surveys tab to view responses.</Text>
          {onBack && (
            <Button variant="secondary" onClick={onBack}>Go to Surveys</Button>
          )}
        </Stack>
      </Box>
    );
  }

  if (loading && data.length === 0) {
    return (
      <Flex justifyContent="center" alignItems="center" css={{ minHeight: 200 }}>
        <Stack gap="md" alignX="center" alignY="center">
          <Text variant="body">Loading responses…</Text>
          <CircleLoader size="lg" />
        </Stack>
      </Flex>
    );
  }

  return (
    <Stack gap="lg" alignX="left" alignY="stretch">
      {/* Header: back + survey name + pagination */}
      <Flex justifyContent="space-between" alignItems="center" gap="$4" wrap="wrap">
        <Flex alignItems="center" gap="$4">
          {onBack && (
            <Button variant="secondary" size="sm" onClick={onBack}>← Surveys</Button>
          )}
          <Text css={{ fontWeight: 600, fontSize: '$lg' }}>{surveyName || 'Responses'}</Text>
        </Flex>
        {data.length > 0 && (
          <Flex alignItems="center" gap="$2">
            <Text variant="bodySmall">Page {meta.page} of {totalPages}</Text>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </Flex>
        )}
      </Flex>

      {error && (
        <Alert status="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!error && data.length === 0 && (
        <Box css={{ padding: '$8', textAlign: 'center', backgroundColor: '$white900', borderRadius: '$lg', border: '1px solid $colors$neutral200' }}>
          <Text variant="body">No responses for this survey.</Text>
        </Box>
      )}

      {!error && data.length > 0 && (
        <Box css={{ backgroundColor: '$white900', borderRadius: '$lg', border: '1px solid $colors$neutral200', overflow: 'hidden' }}>
          <Table css={{ width: '100%', tableLayout: 'fixed' }}>
            <Thead>
              <Tr>
                <Th css={{ width: '18%' }}>Response ID</Th>
                <Th css={{ width: '22%' }}>Submitted</Th>
                <Th css={{ width: '35%' }}>Respondent</Th>
                <Th css={{ width: '25%', textAlign: 'right' }}>Details</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.map((r, i) => {
                const id = r.id ?? r.response_id ?? i;
                const isExpanded = expandedId === id;
                return (
                  <Fragment key={id}>
                    <Tr>
                      <Td css={{ fontWeight: 500 }}>{id}</Td>
                      <Td>
                        <Text variant="bodySmall">
                          {r.submitted_at
                            ? new Date(r.submitted_at).toLocaleString()
                            : r.created_at
                              ? new Date(r.created_at).toLocaleString()
                              : '—'}
                        </Text>
                      </Td>
                      <Td>
                        <Text variant="bodySmall">
                          {r.respondent
                            ? typeof r.respondent === 'object'
                              ? JSON.stringify(r.respondent)
                              : r.respondent
                            : '—'}
                        </Text>
                      </Td>
                      <Td css={{ textAlign: 'right' }}>
                        {(r.questions?.length || r.data) ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setExpandedId(isExpanded ? null : id)}
                          >
                            {isExpanded ? 'Hide' : 'Show Q&A'}
                          </Button>
                        ) : (
                          '—'
                        )}
                      </Td>
                    </Tr>
                    {isExpanded && (
                      <Tr>
                        <Td colSpan={4} css={{ padding: '$4', backgroundColor: '$neutral50', verticalAlign: 'top' }}>
                          <Stack gap="sm">
                            {r.questions && Array.isArray(r.questions) && r.questions.map((q, qi) => (
                              <Box key={qi} css={{ padding: '$2', borderLeft: '3px solid $colors$primary500', paddingLeft: '$3' }}>
                                <Text variant="bodySmall" css={{ fontWeight: 500 }}>Q: {q.question_text ?? q.text ?? q.id}</Text>
                                <Text variant="bodySmall" color="neutral700">A: {q.answer ?? q.value ?? '—'}</Text>
                              </Box>
                            ))}
                            {r.data && typeof r.data === 'object' && !r.questions && (
                              <Text variant="bodySmall" color="neutral700">{JSON.stringify(r.data)}</Text>
                            )}
                          </Stack>
                        </Td>
                      </Tr>
                    )}
                  </Fragment>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      )}
    </Stack>
  );
}

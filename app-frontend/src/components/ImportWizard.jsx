import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircleLoader,
  Flex,
  Heading,
  HStack,
  Input,
  Select,
  Stack,
  Stepper,
  StepperItem,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@sparrowengg/twigs-react';
import { invokeBackend } from '../services/backendApi';

function hostMissingMessage(err) {
  return err && err.code === 'NO_HOST';
}

export function ImportWizard() {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const [ingestId, setIngestId] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [previewRows, setPreviewRows] = useState([]);

  const [surveys, setSurveys] = useState([]);
  const [surveyId, setSurveyId] = useState(null);
  const [surveySelectValue, setSurveySelectValue] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [mapping, setMapping] = useState({});

  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);

  const run = useCallback(async (fn, arg) => {
    setError(null);
    setBusy(true);
    try {
      return await invokeBackend(fn, arg);
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setBusy(false);
    }
  }, []);

  const loadAllSurveys = useCallback(async () => {
    let page = 1;
    const acc = [];
    let hasNext = true;
    while (hasNext) {
      const body = await run('listSurveys', { page, limit: 100 });
      acc.push(...(body.surveys || []));
      hasNext = Boolean(body.has_next_page);
      page += 1;
      if (page > 60) break;
    }
    return acc.filter((s) => !s.archived);
  }, [run]);

  useEffect(() => {
    if (step !== 1) return;
    let cancelled = false;
    (async () => {
      try {
        const list = await loadAllSurveys();
        if (!cancelled) setSurveys(list);
      } catch {
        /* run() sets error */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [step, loadAllSurveys]);

  const surveyOptions = useMemo(
    () =>
      surveys.map((s) => ({
        label: `${s.name} (#${s.id})`,
        value: String(s.id),
      })),
    [surveys]
  );

  const columnOptions = useMemo(() => {
    const skip = { label: '— Skip —', value: '__skip__' };
    return [
      skip,
      ...headers.map((h) => ({ label: h, value: h })),
    ];
  }, [headers]);

  const onCsvSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError(new Error('Please choose a .csv file'));
      return;
    }
    const text = await file.text();
    try {
      const body = await run('ingestCsv', { csvText: text });
      setIngestId(body.ingestId);
      setHeaders(body.headers || []);
      setRowCount(body.rowCount ?? 0);
      setPreviewRows(body.previewRows || []);
      setStep(1);
      setSurveyId(null);
      setSurveySelectValue(null);
      setQuestions([]);
      setMapping({});
      setJobId(null);
      setJobStatus(null);
    } catch {
      /* error set */
    }
  };

  const onSurveyContinue = async () => {
    if (!surveyId) return;
    try {
      const body = await run('getSurveyQuestions', { surveyId: Number(surveyId) });
      setQuestions(body.questions || []);
      const init = {};
      (body.questions || []).forEach((q) => {
        init[String(q.id)] = '__skip__';
      });
      setMapping(init);
      setStep(2);
    } catch {
      /* error set */
    }
  };

  const onMappingContinue = async () => {
    try {
      const body = await run('validateMapping', {
        ingestId,
        surveyId: Number(surveyId),
        mapping,
      });
      if (!body.valid) {
        const msg =
          (body.errors && body.errors.map((x) => x.message).join(' ')) ||
          'Invalid mapping';
        setError(new Error(msg));
        return;
      }
      setStep(3);
      setJobId(null);
      setJobStatus(null);
    } catch {
      /* error set */
    }
  };

  const startImport = async () => {
    try {
      const body = await run('startImportJob', {
        ingestId,
        surveyId: Number(surveyId),
        mapping,
      });
      setJobId(body.jobId);
      setJobStatus({
        status: 'running',
        totalRows: body.totalRows,
        succeeded: 0,
        failed: 0,
        skipped: 0,
        cursor: 0,
        failures: [],
      });
    } catch {
      /* error set */
    }
  };

  useEffect(() => {
    if (!jobId || step !== 3) return;
    let stop = false;
    const tick = async () => {
      try {
        const s = await invokeBackend('getImportJobStatus', { jobId });
        if (stop) return;
        setJobStatus(s);
        if (
          s.status === 'completed' ||
          s.status === 'failed' ||
          s.status === 'cancelled'
        ) {
          return;
        }
      } catch (e) {
        if (!stop) setError(e);
      }
    };
    tick();
    const id = setInterval(tick, 1500);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [jobId, step]);

  const cancelImport = async () => {
    if (!jobId) return;
    try {
      await run('cancelImportJob', { jobId });
      const s = await invokeBackend('getImportJobStatus', { jobId });
      setJobStatus(s);
    } catch {
      /* error set */
    }
  };

  const resetWizard = () => {
    setStep(0);
    setIngestId(null);
    setHeaders([]);
    setRowCount(0);
    setPreviewRows([]);
    setSurveys([]);
    setSurveyId(null);
    setSurveySelectValue(null);
    setQuestions([]);
    setMapping({});
    setJobId(null);
    setJobStatus(null);
    setError(null);
  };

  const menuPortal =
    typeof document !== 'undefined' ? document.body : undefined;

  return (
    <Stack gap="xl" css={{ maxWidth: '960px', margin: '0 auto', padding: '$8' }}>
      <Stack gap="xs">
        <Heading size="h4">Survey response CSV import</Heading>
        <Text size="md" css={{ color: '$neutral600' }}>
          Upload a CSV, choose a SurveySparrow survey, map columns to questions,
          and create responses via the public API.
        </Text>
      </Stack>

      {error && (
        <Alert status="error" css={{ width: '100%' }}>
          <Text size="sm">{error.message}</Text>
          {hostMissingMessage(error) && (
            <Text size="xs" css={{ marginTop: '$2', color: '$neutral600' }}>
              Open this app from SurveySparrow after installing it so the host
              provides the backend client.
            </Text>
          )}
        </Alert>
      )}

      {busy && (
        <HStack gap="sm" align="center">
          <CircleLoader size="sm" />
          <Text size="sm" css={{ color: '$neutral600' }}>
            Working…
          </Text>
        </HStack>
      )}

      <Stepper activeStep={step}>
        <StepperItem label="Upload CSV" allowClick={false}>
          <Stack gap="lg" css={{ paddingTop: '$6' }}>
            <Text size="sm">
              First row must be column headers. Limits are enforced on the server.
            </Text>
            <Box>
              <Text size="xs" css={{ marginBottom: '$2', fontWeight: '$4' }}>
                CSV file
              </Text>
              <Input type="file" accept=".csv,text/csv" onChange={onCsvSelected} />
            </Box>
            {previewRows.length > 0 && (
              <Stack gap="sm">
                <Text size="sm" css={{ fontWeight: '$5' }}>
                  Preview ({rowCount} data rows)
                </Text>
                <Box css={{ overflowX: 'auto' }}>
                  <Table>
                    <Thead>
                      <Tr>
                        {headers.map((h) => (
                          <Th key={h}>{h}</Th>
                        ))}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {previewRows.map((row, ri) => (
                        <Tr key={ri}>
                          {headers.map((h) => (
                            <Td key={h}>{row[h] ?? ''}</Td>
                          ))}
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </Stack>
            )}
          </Stack>
        </StepperItem>

        <StepperItem label="Choose survey" allowClick={false}>
          <Stack gap="lg" css={{ paddingTop: '$6' }}>
            <Text size="sm">
              Select the survey that should receive imported responses.
            </Text>
            <Box css={{ maxWidth: '420px' }}>
              <Select
                label="Survey"
                placeholder="Choose a survey"
                options={surveyOptions}
                value={surveySelectValue}
                onChange={(opt) => {
                  setSurveySelectValue(opt);
                  setSurveyId(opt ? opt.value : null);
                }}
                menuPortalTarget={menuPortal}
              />
            </Box>
            <HStack gap="md">
              <Button variant="secondary" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button disabled={!surveyId || busy} onClick={onSurveyContinue}>
                Continue
              </Button>
            </HStack>
          </Stack>
        </StepperItem>

        <StepperItem label="Map columns" allowClick={false}>
          <Stack gap="md" css={{ paddingTop: '$6' }}>
            <Text size="sm">
              Map each question to a CSV column. Required questions must be
              mapped unless they are optional.
            </Text>
            <Stack gap="md">
              {questions.map((q) => (
                <Stack
                  key={q.id}
                  gap="xs"
                  css={{
                    padding: '$4',
                    borderRadius: '$md',
                    backgroundColorOpacity: ['$secondary500', 0.04],
                  }}
                >
                <Flex
                  justifyContent="space-between"
                  alignItems="flex-start"
                  gap="$4"
                  css={{ width: '100%', flexWrap: 'wrap' }}
                >
                  <Stack gap="2">
                    <Text size="md" css={{ fontWeight: '$5' }}>
                      {q.label}
                    </Text>
                    <Text size="xs" css={{ color: '$neutral600' }}>
                      ID {q.id} · {q.type}
                      {q.required ? ' · Required' : ''}
                    </Text>
                  </Stack>
                  <Box css={{ minWidth: '260px' }}>
                    <Select
                        placeholder="Column"
                        options={columnOptions}
                        value={
                          columnOptions.find(
                            (o) => o.value === mapping[String(q.id)]
                          ) || null
                        }
                        onChange={(opt) => {
                          setMapping((m) => ({
                            ...m,
                            [String(q.id)]: opt ? opt.value : '__skip__',
                          }));
                        }}
                        menuPortalTarget={menuPortal}
                      />
                    </Box>
                </Flex>
                </Stack>
              ))}
            </Stack>
            <HStack gap="md">
              <Button variant="secondary" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button disabled={busy} onClick={onMappingContinue}>
                Continue
              </Button>
            </HStack>
          </Stack>
        </StepperItem>

        <StepperItem label="Import" allowClick={false}>
          <Stack gap="lg" css={{ paddingTop: '$6' }}>
            <Text size="sm">
              Start the import when you are ready. Progress updates every few
              seconds. You can cancel while the job is running.
            </Text>
            {!jobId && (
              <HStack gap="md">
                <Button variant="secondary" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button disabled={busy} onClick={startImport}>
                  Start import
                </Button>
              </HStack>
            )}
            {jobStatus && (
              <Stack gap="md">
                <Alert
                  status={
                    jobStatus.status === 'completed'
                      ? 'success'
                      : jobStatus.status === 'failed'
                        ? 'error'
                        : 'info'
                  }
                  css={{ width: '100%' }}
                >
                  <Text size="sm">
                    Status: <strong>{jobStatus.status}</strong>
                    {jobStatus.lastError
                      ? ` — ${jobStatus.lastError}`
                      : ''}
                  </Text>
                </Alert>
                <Text size="sm">
                  Processed {jobStatus.cursor ?? 0} /{' '}
                  {jobStatus.totalRows ?? '—'} rows
                  {' · '}
                  Succeeded {jobStatus.succeeded ?? 0}
                  {' · '}
                  Failed {jobStatus.failed ?? 0}
                  {' · '}
                  Skipped {jobStatus.skipped ?? 0}
                </Text>
                {jobStatus.status === 'running' && (
                  <HStack gap="md" align="center">
                    <CircleLoader size="sm" />
                    <Button variant="secondary" size="sm" onClick={cancelImport}>
                      Cancel import
                    </Button>
                  </HStack>
                )}
                {jobStatus.failures && jobStatus.failures.length > 0 && (
                  <Stack gap="xs">
                    <Text size="sm" css={{ fontWeight: '$5' }}>
                      Recent errors
                    </Text>
                    <Box css={{ maxHeight: '220px', overflowY: 'auto' }}>
                      <Table>
                        <Thead>
                          <Tr>
                            <Th>Row</Th>
                            <Th>Message</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {jobStatus.failures.map((f, i) => (
                            <Tr key={i}>
                              <Td>{f.rowIndex ?? '—'}</Td>
                              <Td>{f.message ?? '—'}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  </Stack>
                )}
                {(jobStatus.status === 'completed' ||
                  jobStatus.status === 'failed' ||
                  jobStatus.status === 'cancelled') && (
                  <Button variant="secondary" onClick={resetWizard}>
                    New import
                  </Button>
                )}
              </Stack>
            )}
          </Stack>
        </StepperItem>
      </Stepper>
    </Stack>
  );
}

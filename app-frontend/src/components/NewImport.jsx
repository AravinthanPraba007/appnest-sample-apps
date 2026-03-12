import { useState } from 'react';
import { Button, Box, Stack, Text } from '@sparrowengg/twigs-react';
import SurveySelection from './SurveySelection';
import CsvUpload from './CsvUpload';
import ColumnMapping from './ColumnMapping';
import ImportConfig from './ImportConfig';

const STEPS = ['survey', 'csv', 'mapping', 'config'];
const STEP_LABELS = { survey: 'Survey', csv: 'CSV Upload', mapping: 'Column Mapping', config: 'Import Config' };

function NewImport({ onBack, onImportStarted, onOpenProgress, error, setError }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [surveyId, setSurveyId] = useState(null);
  const [surveyVersion, setSurveyVersion] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [importId, setImportId] = useState(null);
  const [filePath, setFilePath] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [config, setConfig] = useState({
    timestampSource: 'current',
    timezone: 'UTC',
    duplicateRule: 'allow',
  });

  const step = STEPS[stepIndex];
  const canNext = () => {
    if (step === 'survey') return !!surveyId;
    if (step === 'csv') return !!importId && !!filePath;
    if (step === 'mapping') return true;
    if (step === 'config') return true;
    return false;
  };

  const handleNext = () => {
    if (stepIndex < STEPS.length - 1) setStepIndex(stepIndex + 1);
  };

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  return (
    <Box className="screen new-import" padding="xl">
      <Stack gap="xl">
        <header className="screen-header">
          <Button variant="ghost" size="sm" color="default" onClick={onBack}>
            ← Back
          </Button>
          <Text as="h1" size="xl" weight="bold" css={{ margin: '8px 0' }}>New Import</Text>
          <Stack gap="md" direction="row" css={{ flexWrap: 'wrap' }} className="stepper">
            {STEPS.map((s, i) => (
              <Text
                key={s}
                size="sm"
                css={{
                  color: i === stepIndex ? 'var(--twigs-colors-primary)' : i < stepIndex ? 'var(--twigs-colors-success)' : '#999',
                  fontWeight: i === stepIndex ? 600 : 400,
                }}
              >
                {i + 1}. {STEP_LABELS[s]}
              </Text>
            ))}
          </Stack>
        </header>

        {error && (
          <Box padding="md" css={{ background: '#f8d7da', color: '#721c24', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text size="sm">{error}</Text>
            <Button variant="ghost" size="xs" onClick={() => setError(null)}>×</Button>
          </Box>
        )}

        <Box className="step-content">
        {step === 'survey' && (
          <SurveySelection
            surveyId={surveyId}
            surveyVersion={surveyVersion}
            onSelectSurvey={setSurveyId}
            onSelectVersion={setSurveyVersion}
            onQuestionsLoaded={setQuestions}
            setError={setError}
          />
        )}
        {step === 'csv' && (
          <CsvUpload
            importId={importId}
            surveyId={surveyId}
            onImportIdReady={setImportId}
            onFilePathReady={setFilePath}
            onHeadersLoaded={setHeaders}
            setError={setError}
          />
        )}
        {step === 'mapping' && (
          <ColumnMapping
            headers={headers}
            questions={questions}
            mappings={mappings}
            onMappingsChange={setMappings}
            importId={importId}
            surveyId={surveyId}
            setError={setError}
          />
        )}
        {step === 'config' && (
          <ImportConfig
            config={config}
            onConfigChange={setConfig}
            importId={importId}
            surveyId={surveyId}
            filePath={filePath}
            mappings={mappings}
            onImportStarted={onImportStarted}
            setError={setError}
          />
        )}
        </Box>

        <Stack gap="md" direction="row" className="step-actions">
          <Button color="secondary" variant="outline" size="md" onClick={stepIndex === 0 ? onBack : handleBack}>
            Back
          </Button>
          {step !== 'config' && (
            <Button color="primary" size="md" onClick={handleNext} disabled={!canNext()}>
            Next
          </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}

export default NewImport;

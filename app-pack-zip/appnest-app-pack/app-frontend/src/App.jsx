import { useState } from 'react';
import { Box, Flex, Tabs, TabsList, TabsTrigger, TabsContent, Text } from '@sparrowengg/twigs-react';
import { SurveyList } from './components/SurveyList';
import { ResponseViewer } from './components/ResponseViewer';
import { BackupFiles } from './components/BackupFiles';
import './css/App.css';

const TAB_SURVEYS = 'surveys';
const TAB_RESPONSES = 'responses';
const TAB_BACKUPS = 'backups';

function App() {
  const [activeTab, setActiveTab] = useState(TAB_SURVEYS);
  const [selectedSurveyId, setSelectedSurveyId] = useState(null);
  const [selectedSurveyName, setSelectedSurveyName] = useState(null);

  const showResponses = (surveyId, surveyName) => {
    setSelectedSurveyId(surveyId);
    setSelectedSurveyName(surveyName ?? null);
    setActiveTab(TAB_RESPONSES);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <Box css={{ minHeight: '100vh', backgroundColor: '$neutral50', display: 'flex', flexDirection: 'column' }}>
        {/* Header with tabs */}
        <Box
          css={{
            borderBottom: '1px solid $colors$neutral200',
            backgroundColor: '$white900',
            padding: '$4 $6',
            flexShrink: 0,
          }}
        >
          <Flex justifyContent="space-between" alignItems="center" gap="$4" wrap="wrap">
            <Text css={{ fontWeight: 600, fontSize: '$lg' }}>SurveySparrow Response Viewer</Text>
            <TabsList>
              <TabsTrigger value={TAB_SURVEYS}>Surveys</TabsTrigger>
              <TabsTrigger value={TAB_RESPONSES}>Responses</TabsTrigger>
              <TabsTrigger value={TAB_BACKUPS}>Backup Files</TabsTrigger>
            </TabsList>
          </Flex>
        </Box>

        {/* Content area */}
        <Box css={{ flex: 1, padding: '$6', overflow: 'auto' }}>
          <TabsContent value={TAB_SURVEYS} css={{ margin: 0, padding: 0 }}>
            <SurveyList onSelectSurvey={showResponses} />
          </TabsContent>
          <TabsContent value={TAB_RESPONSES} css={{ margin: 0, padding: 0 }}>
            <ResponseViewer
              surveyId={selectedSurveyId}
              surveyName={selectedSurveyName}
              onBack={() => setActiveTab(TAB_SURVEYS)}
            />
          </TabsContent>
          <TabsContent value={TAB_BACKUPS} css={{ margin: 0, padding: 0 }}>
            <BackupFiles />
          </TabsContent>
        </Box>
      </Box>
    </Tabs>
  );
}

export default App;

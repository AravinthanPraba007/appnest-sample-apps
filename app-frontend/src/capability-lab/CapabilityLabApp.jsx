import { useCallback, useEffect, useState } from 'react';
import { Box } from '@sparrowengg/twigs-react';
import { CapabilityLabDialogs } from './CapabilityLabDialogs.jsx';
import { CapabilityLabMain } from './CapabilityLabMain.jsx';
import { CapabilityLabSidebar } from './CapabilityLabSidebar.jsx';
import { CapabilityLabTopNav } from './CapabilityLabTopNav.jsx';
import {
  formatOutcomePayload,
  invokeBackend,
  invokeBackendBody,
  unwrapInvokeResult,
} from './labApi.js';
import { DbLabPanel } from './panels/DbLabPanel.jsx';
import { FileLabPanel } from './panels/FileLabPanel.jsx';
import { FetchLabPanel } from './panels/FetchLabPanel.jsx';
import { NextLabPanel } from './panels/NextLabPanel.jsx';
import { ScheduleLabPanel } from './panels/ScheduleLabPanel.jsx';
import { TraceLabPanel } from './panels/TraceLabPanel.jsx';
import { dbTabToLogCategory } from './dbLogCategories.js';
import { scheduleTabToLogCategory } from './scheduleLogCategories.js';
import { SDK_NAV } from './sdkNav.js';

export function CapabilityLabApp() {
  const [activeSdk, setActiveSdk] = useState('$file');
  const [runs, setRuns] = useState([]);
  const [totalRuns, setTotalRuns] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionOutcome, setActionOutcome] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState(null);
  const [clearAllOpen, setClearAllOpen] = useState(false);
  const [clearLogsOpen, setClearLogsOpen] = useState(false);

  const [filePath, setFilePath] = useState('capability-lab/demo.txt');
  const [listPath, setListPath] = useState('capability-lab/');
  const [nextFn, setNextFn] = useState('chainCapabilityStepTwo');
  const [nextDelay, setNextDelay] = useState('0');
  const [nextPayloadJson, setNextPayloadJson] = useState('{"fromStep":0}');
  const [mapJson, setMapJson] = useState(
    () =>
      JSON.stringify(
        { note: 'map-demo', tags: ['lab'], count: 1 },
        null,
        2,
      ),
  );
  const [numVal, setNumVal] = useState('0');
  const [dbStringValue, setDbStringValue] = useState('Hello, StringTest');
  const [dbIncrementBy, setDbIncrementBy] = useState('1');
  const [dbTab, setDbTab] = useState('string');
  const [scheduleTab, setScheduleTab] = useState('ONE_TIME');

  const activeMeta = SDK_NAV.find((n) => n.id === activeSdk) || SDK_NAV[0];
  const logsHeading =
    activeSdk === '$db'
      ? dbTabToLogCategory(dbTab)
      : activeSdk === '$schedule'
        ? scheduleTabToLogCategory(scheduleTab)
        : activeMeta.title;

  const loadState = useCallback(async () => {
    setError(null);
    try {
      const filterCategory =
        activeSdk === 'getTraceId'
          ? 'getTraceId'
          : activeSdk === '$db'
            ? dbTabToLogCategory(dbTab)
            : activeSdk === '$schedule'
              ? scheduleTabToLogCategory(scheduleTab)
              : activeSdk;
      const data = await invokeBackendBody('getCapabilityLabState', {
        limit: 100,
        filterCategory,
      });
      setRuns(data?.runs || []);
      setTotalRuns(data?.totalRuns ?? 0);
    } catch (e) {
      setError(e?.message || String(e));
    }
  }, [activeSdk, dbTab, scheduleTab]);

  useEffect(() => {
    loadState();
  }, [loadState]);

  const runAction = async (fn, actionTitle = 'Action result') => {
    setLoading(true);
    setActionOutcome(null);
    setLastResult(null);
    setError(null);
    try {
      const raw = await fn();
      const { statusCode, body } = unwrapInvokeResult(raw);
      setLastResult(body && typeof body === 'object' ? body : null);
      setActionOutcome({
        title: actionTitle,
        statusLine: statusCode != null ? `HTTP ${statusCode}` : null,
        body: formatOutcomePayload(body),
      });
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const clearSectionLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const cat =
        activeSdk === 'getTraceId'
          ? 'getTraceId'
          : activeSdk === '$db'
            ? dbTabToLogCategory(dbTab)
            : activeSdk === '$schedule'
              ? scheduleTabToLogCategory(scheduleTab)
              : activeSdk;
      const res = await invokeBackendBody('clearCapabilityLabLogs', {
        category: cat,
      });
      setActionOutcome({
        title: 'Clear logs',
        statusLine: null,
        body: `Removed ${res?.removed ?? 0} log row(s) for ${logsHeading}.`,
      });
      setClearLogsOpen(false);
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await invokeBackendBody('clearCapabilityLabData', {});
      setActionOutcome({
        title: 'Reset all lab data',
        statusLine: null,
        body: `Full reset: ${(result?.cleared || []).length} key(s) / paths cleared.`,
      });
      setClearAllOpen(false);
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSdk = (id) => {
    setActiveSdk(id);
    setActionOutcome(null);
    setLastResult(null);
  };

  let panel;
  switch (activeSdk) {
    case '$db':
      panel = (
        <DbLabPanel
          loading={loading}
          runAction={runAction}
          dbTab={dbTab}
          setDbTab={setDbTab}
          dbStringValue={dbStringValue}
          setDbStringValue={setDbStringValue}
          mapJson={mapJson}
          setMapJson={setMapJson}
          numVal={numVal}
          setNumVal={setNumVal}
          dbIncrementBy={dbIncrementBy}
          setDbIncrementBy={setDbIncrementBy}
        />
      );
      break;
    case '$fetch':
      panel = (
        <FetchLabPanel loading={loading} runAction={runAction} />
      );
      break;
    case '$schedule':
      panel = (
        <ScheduleLabPanel
          loading={loading}
          runAction={runAction}
          scheduleTab={scheduleTab}
          setScheduleTab={setScheduleTab}
        />
      );
      break;
    case '$next':
      panel = (
        <NextLabPanel
          loading={loading}
          runAction={runAction}
          nextFn={nextFn}
          setNextFn={setNextFn}
          nextDelay={nextDelay}
          setNextDelay={setNextDelay}
          nextPayloadJson={nextPayloadJson}
          setNextPayloadJson={setNextPayloadJson}
        />
      );
      break;
    case 'getTraceId':
      panel = <TraceLabPanel loading={loading} runAction={runAction} />;
      break;
    default:
      panel = (
        <FileLabPanel
          loading={loading}
          runAction={runAction}
          filePath={filePath}
          setFilePath={setFilePath}
          listPath={listPath}
          setListPath={setListPath}
        />
      );
  }

  return (
    <Box
      id="capability-lab-shell"
      className="capability-lab-app"
      css={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      <CapabilityLabTopNav
        loading={loading}
        onOpenResetAll={() => setClearAllOpen(true)}
      />
      <Box
        id="capability-lab-body"
        css={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          '@media (min-width: 900px)': {
            flexDirection: 'row',
            alignItems: 'stretch',
          },
        }}
      >
        <CapabilityLabSidebar activeSdk={activeSdk} onSelectSdk={handleSelectSdk} />
        <CapabilityLabMain
          activeMeta={activeMeta}
          logsHeading={logsHeading}
          panel={panel}
          error={error}
          actionOutcome={actionOutcome}
          lastResult={lastResult}
          runs={runs}
          totalRuns={totalRuns}
          loading={loading}
          onRefreshRuns={loadState}
          onOpenClearLogs={() => setClearLogsOpen(true)}
        />
      </Box>

      <CapabilityLabDialogs
        clearAllOpen={clearAllOpen}
        setClearAllOpen={setClearAllOpen}
        clearLogsOpen={clearLogsOpen}
        setClearLogsOpen={setClearLogsOpen}
        activeMetaTitle={logsHeading}
        loading={loading}
        onClearAllConfirm={clearAllData}
        onClearLogsConfirm={clearSectionLogs}
      />
    </Box>
  );
}

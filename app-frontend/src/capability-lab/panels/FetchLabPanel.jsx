import { useState } from 'react';
import {
  Box,
  Button,
  HStack,
  Input,
  Text,
  Textarea,
  VStack,
} from '@sparrowengg/twigs-react';
import { sdkAction } from '../labApi.js';

const DEFAULT_URL = 'https://api.salesparrow.com/';
const METHOD_OPTIONS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'];

const HEADERS_PLACEHOLDER = '{\n  "Accept": "application/json"\n}';

function parseJsonObject(label, raw, allowEmpty) {
  const t = String(raw ?? '').trim();
  if (!t) {
    return allowEmpty ? { value: {} } : { error: `${label} is required` };
  }
  try {
    const v = JSON.parse(t);
    if (v === null || typeof v !== 'object' || Array.isArray(v)) {
      return { error: `${label} must be a JSON object { ... }` };
    }
    return { value: v };
  } catch (e) {
    return { error: `${label}: ${e?.message || 'invalid JSON'}` };
  }
}

function normalizeBodyForMethod(method, bodyText) {
  const m = method.toUpperCase();
  if (m === 'GET' || m === 'HEAD') {
    return {};
  }
  const t = String(bodyText ?? '').trim();
  if (!t) {
    return {};
  }
  try {
    return JSON.parse(t);
  } catch {
    return t;
  }
}

export function FetchLabPanel({ loading, runAction }) {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState(DEFAULT_URL);
  const [headersJson, setHeadersJson] = useState('{}');
  const [queryJson, setQueryJson] = useState('{}');
  const [bodyText, setBodyText] = useState('');
  const [parseError, setParseError] = useState(null);

  const bodyDisabled = method === 'GET' || method === 'HEAD';

  const sendRequest = () => {
    setParseError(null);
    const urlTrim = url.trim();
    if (!urlTrim) {
      setParseError('URL is required.');
      return;
    }

    const headersResult = parseJsonObject('Headers', headersJson, true);
    if (headersResult.error) {
      setParseError(headersResult.error);
      return;
    }
    const queryResult = parseJsonObject('Query', queryJson, true);
    if (queryResult.error) {
      setParseError(queryResult.error);
      return;
    }

    const headers = headersResult.value;
    const query = queryResult.value;
    const body = normalizeBodyForMethod(method, bodyText);

    const payload = {
      method,
      url: urlTrim,
      headers,
      query,
      body,
    };

    const shortUrl =
      urlTrim.length > 56 ? `${urlTrim.slice(0, 54)}…` : urlTrim;
    runAction(
      () => sdkAction('$fetch', 'request', payload),
      `$fetch · ${method} ${shortUrl}`,
    );
  };

  return (
    <VStack gap="$4" align="stretch" className="lab-fetch-builder">
      <Text as="div" size="md" css={{ color: '$neutral800', lineHeight: 1.6 }}>
        Build a <Text as="span" weight="bold">$fetch.request</Text> call: method, full URL,
        headers, query, and body (when allowed). Only{' '}
        <Text as="span" weight="bold">https://api.salesparrow.com</Text> is allowed — same as{' '}
        <Text as="span" css={{ fontFamily: 'ui-monospace, monospace' }}>whitelisted_domains</Text> in{' '}
        <Text as="span" css={{ fontFamily: 'ui-monospace, monospace' }}>manifest.json</Text>.
      </Text>

      {parseError ? (
        <Box
          className="lab-fetch-parse-error"
          css={{
            padding: '$3',
            borderRadius: '$md',
            border: '1px solid $colors$error300',
            backgroundColor: '$colors$error50',
          }}
        >
          <Text size="sm" css={{ color: '$colors$error800' }}>
            {parseError}
          </Text>
        </Box>
      ) : null}

      <Box
        className="lab-fetch-form"
        css={{ width: '100%', maxWidth: 'min(100%, 60rem)' }}
      >
        <Box className="lab-fetch-row">
          <Text as="span" className="lab-field-label" size="sm" weight="bold">
            Method
          </Text>
          <select
            className="lab-fetch-method-select"
            value={method}
            disabled={loading}
            onChange={(e) => setMethod(e.target.value)}
            aria-label="HTTP method"
          >
            {METHOD_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </Box>

        <Box className="lab-fetch-row">
          <Text as="span" className="lab-field-label" size="sm" weight="bold">
            URL
          </Text>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
            placeholder="https://api.salesparrow.com/..."
            size="lg"
            css={{ width: '100%' }}
          />
        </Box>

        <Box className="lab-fetch-row">
          <Text as="span" className="lab-field-label" size="sm" weight="bold">
            Headers (JSON object)
          </Text>
          <Textarea
            value={headersJson}
            onChange={(e) => setHeadersJson(e.target.value)}
            disabled={loading}
            placeholder={HEADERS_PLACEHOLDER}
            className="lab-fetch-json-textarea"
            css={{ minHeight: '5.5rem', fontFamily: 'ui-monospace, monospace', fontSize: '$sm' }}
          />
        </Box>

        <Box className="lab-fetch-row">
          <Text as="span" className="lab-field-label" size="sm" weight="bold">
            Query (JSON object)
          </Text>
          <Textarea
            value={queryJson}
            onChange={(e) => setQueryJson(e.target.value)}
            disabled={loading}
            placeholder='{\n  "page": "1"\n}'
            className="lab-fetch-json-textarea"
            css={{ minHeight: '4.5rem', fontFamily: 'ui-monospace, monospace', fontSize: '$sm' }}
          />
        </Box>

        <Box className="lab-fetch-row">
          <HStack justify="space-between" align="center" css={{ marginBottom: '$2' }}>
            <Text as="span" className="lab-field-label" size="sm" weight="bold" css={{ marginBottom: 0 }}>
              Body
            </Text>
            {bodyDisabled ? (
              <Text size="xs" css={{ color: '$neutral500' }}>
                Not sent for GET / HEAD
              </Text>
            ) : null}
          </HStack>
          <Textarea
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            disabled={loading || bodyDisabled}
            placeholder={
              bodyDisabled
                ? '—'
                : 'JSON object or plain text (e.g. {"name":"lab"} or hello)'
            }
            className="lab-fetch-json-textarea"
            css={{
              minHeight: '8rem',
              fontFamily: 'ui-monospace, monospace',
              fontSize: '$sm',
              opacity: bodyDisabled ? 0.55 : 1,
            }}
          />
        </Box>
      </Box>

      <HStack gap="$2" wrap="wrap" align="center">
        <Button
          color="primary"
          variant="solid"
          size="lg"
          disabled={loading}
          onClick={sendRequest}
        >
          Send request
        </Button>
        <Button
          color="secondary"
          variant="outline"
          size="md"
          disabled={loading}
          type="button"
          onClick={() => {
            setMethod('GET');
            setUrl(DEFAULT_URL);
            setHeadersJson('{}');
            setQueryJson('{}');
            setBodyText('');
            setParseError(null);
          }}
        >
          Reset form
        </Button>
      </HStack>
    </VStack>
  );
}

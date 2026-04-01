import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  HStack,
  Input,
  Text,
  Textarea,
  VStack,
} from '@sparrowengg/twigs-react';
import { sdkAction, unwrapInvokeResult } from '../labApi.js';

/** Save bytes in the browser (Downloads / save dialog). */
function downloadBlobInBrowser(blob, filename) {
  const objectUrl = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    a.click();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/** Normalize common fileDownload / API shapes to a Blob (or null). */
function coerceResponseToBlob(value) {
  if (!value) return null;
  if (value instanceof Blob) return value;
  if (typeof value !== 'object') return null;
  const candidates = [value.blob, value.file, value.body, value.data, value.buffer];
  for (const c of candidates) {
    if (c instanceof Blob) return c;
    if (c instanceof ArrayBuffer) return new Blob([c]);
  }
  return null;
}

const FILE_TABS = [
  { id: 'getUploadUrl', label: 'getUploadUrl' },
  { id: 'getDownloadUrl', label: 'getDownloadUrl' },
  { id: 'downloadFile', label: 'Download file' },
  { id: 'exists', label: 'exists' },
  { id: 'list', label: 'list' },
  { id: 'delete', label: 'delete' },
  { id: 'upload', label: 'Upload file' },
];

function FieldBlock({ label, children }) {
  return (
    <Box
      css={{
        maxWidth: '480px',
        width: '100%',
        paddingBottom: '$2',
      }}
    >
      <Text
        as="span"
        className="lab-field-label"
        size="sm"
        weight="bold"
        css={{ marginBottom: '$2', display: 'block' }}
      >
        {label}
      </Text>
      {children}
    </Box>
  );
}

export function FileLabPanel({
  loading,
  runAction,
  filePath,
  setFilePath,
  listPath,
  setListPath,
}) {
  const [fileTab, setFileTab] = useState('getUploadUrl');
  const [presignedUploadUrl, setPresignedUploadUrl] = useState('');
  const [selectedFileLabel, setSelectedFileLabel] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    setPresignedUploadUrl('');
    setSelectedFileLabel('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [filePath]);

  const requestUrlForBrowserUpload = () =>
    runAction(async () => {
      const raw = await sdkAction('$file', 'getUploadUrl', { path: filePath });
      const { body } = unwrapInvokeResult(raw);
      const url = body?.preSignedUrl ? String(body.preSignedUrl) : '';
      setPresignedUploadUrl(url);
      if (!url) setSelectedFileLabel('');
      return raw;
    }, '$file · getUploadUrl (browser upload)');

  const putSelectedFileToPresignedUrl = () =>
    runAction(async () => {
      const presignedUrl = presignedUploadUrl.trim();
      if (!presignedUrl) {
        throw new Error('Request an upload URL first (browser upload section).');
      }
      const input = fileInputRef.current;
      const file = input?.files?.[0];
      if (!file) {
        throw new Error('Choose a file to upload.');
      }
      const fileUpload = window.AppnestFunctions?.$app?.fileUpload;
      if (typeof fileUpload !== 'function') {
        throw new Error(
          'window.AppnestFunctions.$app.fileUpload is not available. Open this app inside Appnest.',
        );
      }
      let result;
      try {
        result = await fileUpload({ file, presignedUrl });
      } catch (e) {
        throw new Error(e?.message || String(e));
      }
      if (result && typeof result === 'object' && result.ok === false) {
        throw new Error(result.message || 'fileUpload failed');
      }
      return {
        ok: true,
        message: `Uploaded ${file.name} (${file.size} bytes) to ${filePath}`,
        path: filePath,
        fileUploadResult: result,
      };
    }, '$file · $app.fileUpload (presigned URL)');

  const copyPresignedUrl = async () => {
    const url = presignedUploadUrl.trim();
    if (!url || typeof navigator?.clipboard?.writeText !== 'function') return;
    await navigator.clipboard.writeText(url);
  };

  const downloadFileViaPresignedUrl = () =>
    runAction(async () => {
      const raw = await sdkAction('$file', 'getDownloadUrl', { path: filePath });
      const { body } = unwrapInvokeResult(raw);
      const presignedUrl = body?.preSignedUrl ? String(body.preSignedUrl) : '';
      if (!presignedUrl) {
        throw new Error('No presigned download URL in response.');
      }
      const baseName = filePath.replace(/^.*[/\\]/, '').trim() || 'download';
      const safeName = baseName.replace(/[/\\?%*:|"<>]/g, '_') || 'download';
      const file = new File([], safeName, { type: 'application/octet-stream' });
      const fileDownload = window.AppnestFunctions?.$app?.fileDownload;
      if (typeof fileDownload !== 'function') {
        throw new Error(
          'window.AppnestFunctions.$app.fileDownload is not available. Open this app inside Appnest.',
        );
      }
      let result;
      try {
        result = await fileDownload({ file, presignedUrl });
      } catch (e) {
        throw new Error(e?.message || String(e));
      }
      if (result && typeof result === 'object' && result.ok === false) {
        throw new Error(result.message || 'fileDownload failed');
      }

      let blob = coerceResponseToBlob(result);
      if (!blob || blob.size === 0) {
        const res = await fetch(presignedUrl, { method: 'GET' });
        const errText = res.ok ? '' : await res.text().catch(() => '');
        if (!res.ok) {
          throw new Error(
            `Could not read object for download: ${res.status}${errText ? ` — ${errText.slice(0, 200)}` : ''}`,
          );
        }
        blob = await res.blob();
      }

      downloadBlobInBrowser(blob, safeName);

      return {
        ok: true,
        message: `Saved ${safeName} (${blob.size} bytes)`,
        path: filePath,
        invokeResult: raw,
        fileDownloadResult: result,
      };
    }, '$file · $app.fileDownload + browser save');

  const downloadFileViaFetchOnly = () =>
    runAction(async () => {
      const raw = await sdkAction('$file', 'getDownloadUrl', { path: filePath });
      const { body } = unwrapInvokeResult(raw);
      const presignedUrl = body?.preSignedUrl ? String(body.preSignedUrl) : '';
      if (!presignedUrl) {
        throw new Error('No presigned download URL in response.');
      }
      const baseName = filePath.replace(/^.*[/\\]/, '').trim() || 'download';
      const safeName = baseName.replace(/[/\\?%*:|"<>]/g, '_') || 'download';
      const res = await fetch(presignedUrl, { method: 'GET' });
      const errText = res.ok ? '' : await res.text().catch(() => '');
      if (!res.ok) {
        throw new Error(
          `fetch GET failed: ${res.status}${errText ? ` — ${errText.slice(0, 200)}` : ''}`,
        );
      }
      const blob = await res.blob();
      downloadBlobInBrowser(blob, safeName);
      return {
        ok: true,
        message: `Saved ${safeName} (${blob.size} bytes) via fetch`,
        path: filePath,
        invokeResult: raw,
        statusCode: res.status,
      };
    }, '$file · getDownloadUrl + fetch GET');

  const putSelectedFileWithFetch = () =>
    runAction(async () => {
      const presignedUrl = presignedUploadUrl.trim();
      if (!presignedUrl) {
        throw new Error('Request an upload URL first (browser upload section).');
      }
      const input = fileInputRef.current;
      const file = input?.files?.[0];
      if (!file) {
        throw new Error('Choose a file to upload.');
      }
      const headers = {};
      if (file.type) headers['Content-Type'] = file.type;
      const res = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers,
      });
      const errText = res.ok ? '' : await res.text().catch(() => '');
      if (!res.ok) {
        throw new Error(
          `fetch PUT failed: ${res.status}${errText ? ` — ${errText.slice(0, 200)}` : ''}`,
        );
      }
      return {
        ok: true,
        message: `Uploaded ${file.name} (${file.size} bytes) via fetch PUT to ${filePath}`,
        path: filePath,
        statusCode: res.status,
      };
    }, '$file · fetch PUT (presigned URL)');

  return (
    <VStack gap="$5" align="stretch">
      <Text as="div" size="md" css={{ color: '$neutral800', lineHeight: 1.6 }}>
        Call <Text as="span" weight="bold">$file</Text> with a path (default demo file). List uses
        a prefix path under your storage namespace. Pick a tab for the operation you want.
      </Text>

      <Box
        className="lab-file-tablist"
        role="tablist"
        aria-label="$file operations"
        css={{
          borderBottom: '1px solid $neutral200',
        }}
      >
        {FILE_TABS.map((t) => {
          const selected = fileTab === t.id;
          return (
            <Button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`file-tabpanel-${t.id}`}
              id={`file-tab-${t.id}`}
              className={`lab-file-tab${selected ? ' is-selected' : ''}`}
              size="md"
              color={selected ? 'primary' : 'secondary'}
              variant={selected ? 'solid' : 'outline'}
              onClick={() => setFileTab(t.id)}
            >
              {t.label}
            </Button>
          );
        })}
      </Box>

      <Box
        role="tabpanel"
        id={`file-tabpanel-${fileTab}`}
        aria-labelledby={`file-tab-${fileTab}`}
        className="lab-file-tabpanel"
      >
        {fileTab === 'getUploadUrl' ? (
          <VStack gap="$5" align="stretch">
            <Text size="sm" css={{ color: '$neutral600', lineHeight: 1.5 }}>
              Returns a presigned URL for uploading bytes to <Text as="span" weight="bold">path</Text>.
            </Text>
            <VStack gap="$8" align="stretch">
              <FieldBlock label="File path">
                <Input value={filePath} onChange={(e) => setFilePath(e.target.value)} size="lg" />
              </FieldBlock>
              <Button
                color="primary"
                variant="solid"
                disabled={loading}
                onClick={() =>
                  runAction(
                    () => sdkAction('$file', 'getUploadUrl', { path: filePath }),
                    '$file · getUploadUrl',
                  )
                }
                css={{ alignSelf: 'flex-start' }}
              >
                Run getUploadUrl
              </Button>
            </VStack>
          </VStack>
        ) : null}

        {fileTab === 'getDownloadUrl' ? (
          <VStack gap="$5" align="stretch">
            <Text size="sm" css={{ color: '$neutral600', lineHeight: 1.5 }}>
              Returns a presigned URL for downloading the object at <Text as="span" weight="bold">path</Text>.
            </Text>
            <VStack gap="$8" align="stretch">
              <FieldBlock label="File path">
                <Input value={filePath} onChange={(e) => setFilePath(e.target.value)} size="lg" />
              </FieldBlock>
              <Button
                color="primary"
                variant="solid"
                disabled={loading}
                onClick={() =>
                  runAction(
                    () => sdkAction('$file', 'getDownloadUrl', { path: filePath }),
                    '$file · getDownloadUrl',
                  )
                }
                css={{ alignSelf: 'flex-start' }}
              >
                Run getDownloadUrl
              </Button>
            </VStack>
          </VStack>
        ) : null}

        {fileTab === 'downloadFile' ? (
          <VStack gap="$5" align="stretch">
            <Text size="sm" css={{ color: '$neutral600', lineHeight: 1.5 }}>
              Calls <Text as="span" weight="bold">getDownloadUrl</Text>, then either{' '}
              <Text as="span" css={{ fontFamily: 'ui-monospace, monospace' }}>
                {'window.AppnestFunctions.$app.fileDownload({ file, presignedUrl })'}
              </Text>{' '}
              (first button) or a direct <Text as="span" css={{ fontFamily: 'ui-monospace, monospace' }}>fetch(presignedUrl)</Text>{' '}
              <Text as="span" weight="bold">GET</Text> (second button). The helper path needs the Appnest shell;{' '}
              <Text as="span" weight="bold">fetch</Text> works anywhere the presigned URL is reachable (CORS permitting).
            </Text>
            <VStack gap="$8" align="stretch">
              <FieldBlock label="File path">
                <Input value={filePath} onChange={(e) => setFilePath(e.target.value)} size="lg" />
              </FieldBlock>
              <HStack gap="$3" wrap="wrap" align="center" css={{ alignSelf: 'flex-start' }}>
                <Button
                  color="primary"
                  variant="solid"
                  disabled={loading}
                  onClick={downloadFileViaPresignedUrl}
                >
                  Save via fileDownload helper
                </Button>
                <Button
                  color="secondary"
                  variant="outline"
                  disabled={loading}
                  onClick={downloadFileViaFetchOnly}
                >
                  Download with fetch (GET)
                </Button>
              </HStack>
            </VStack>
          </VStack>
        ) : null}

        {fileTab === 'exists' ? (
          <VStack gap="$5" align="stretch">
            <Text size="sm" css={{ color: '$neutral600', lineHeight: 1.5 }}>
              Checks whether an object exists at <Text as="span" weight="bold">path</Text>.
            </Text>
            <VStack gap="$8" align="stretch">
              <FieldBlock label="File path">
                <Input value={filePath} onChange={(e) => setFilePath(e.target.value)} size="lg" />
              </FieldBlock>
              <Button
                color="primary"
                variant="solid"
                disabled={loading}
                onClick={() =>
                  runAction(() => sdkAction('$file', 'exists', { path: filePath }), '$file · exists')
                }
                css={{ alignSelf: 'flex-start' }}
              >
                Run exists
              </Button>
            </VStack>
          </VStack>
        ) : null}

        {fileTab === 'list' ? (
          <VStack gap="$5" align="stretch">
            <Text size="sm" css={{ color: '$neutral600', lineHeight: 1.5 }}>
              Lists objects under the storage prefix <Text as="span" weight="bold">listPath</Text>.
            </Text>
            <VStack gap="$8" align="stretch">
              <FieldBlock label="List prefix path">
                <Input value={listPath} onChange={(e) => setListPath(e.target.value)} size="lg" />
              </FieldBlock>
              <Button
                color="primary"
                variant="solid"
                disabled={loading}
                onClick={() =>
                  runAction(() => sdkAction('$file', 'list', { listPath }), '$file · list')
                }
                css={{ alignSelf: 'flex-start' }}
              >
                Run list
              </Button>
            </VStack>
          </VStack>
        ) : null}

        {fileTab === 'delete' ? (
          <VStack gap="$5" align="stretch">
            <Text size="sm" css={{ color: '$neutral600', lineHeight: 1.5 }}>
              Deletes the object at <Text as="span" weight="bold">path</Text>.
            </Text>
            <VStack gap="$8" align="stretch">
              <FieldBlock label="File path">
                <Input value={filePath} onChange={(e) => setFilePath(e.target.value)} size="lg" />
              </FieldBlock>
              <Button
                color="primary"
                variant="solid"
                disabled={loading}
                onClick={() =>
                  runAction(() => sdkAction('$file', 'delete', { path: filePath }), '$file · delete')
                }
                css={{ alignSelf: 'flex-start' }}
              >
                Run delete
              </Button>
            </VStack>
          </VStack>
        ) : null}

        {fileTab === 'upload' ? (
          <VStack gap="$5" align="stretch">
            <Text size="sm" css={{ color: '$neutral600', lineHeight: 1.55, maxWidth: '42rem' }}>
              Call <Text as="span" weight="bold">getUploadUrl</Text> for your path, then upload with{' '}
              <Text as="span" css={{ fontFamily: 'ui-monospace, monospace' }}>
                {'window.AppnestFunctions.$app.fileUpload({ file, presignedUrl })'}
              </Text>{' '}
              or <Text as="span" css={{ fontFamily: 'ui-monospace, monospace' }}>fetch PUT</Text> on the presigned URL.
              The shell helper applies host transport; <Text as="span" weight="bold">fetch</Text> goes direct (CORS and
              signed headers must allow it).
            </Text>

            <FieldBlock label="File path (upload target)">
              <Input value={filePath} onChange={(e) => setFilePath(e.target.value)} size="lg" />
            </FieldBlock>

            <Box
              css={{
                maxWidth: '42rem',
                width: '100%',
                padding: '$5',
                borderRadius: '$lg',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: '$neutral200',
                backgroundColor: '$neutral50',
              }}
            >
              <VStack gap="$6" align="stretch">
                <VStack gap="$4" align="stretch">
                  <Text
                    as="div"
                    size="sm"
                    weight="bold"
                    css={{
                      color: '$neutral900',
                      letterSpacing: '0.02em',
                    }}
                  >
                    1 · Request presigned URL
                  </Text>
                  <Button
                    color="secondary"
                    variant="outline"
                    disabled={loading}
                    onClick={requestUrlForBrowserUpload}
                    css={{ alignSelf: 'flex-start' }}
                  >
                    Request upload URL
                  </Button>
                  <VStack gap="$2" align="stretch" css={{ maxWidth: '100%' }}>
                    <HStack
                      gap="$3"
                      wrap="wrap"
                      align="center"
                      justify="space-between"
                      css={{ width: '100%' }}
                    >
                      <Text
                        as="span"
                        className="lab-field-label"
                        size="sm"
                        weight="bold"
                        css={{ marginBottom: 0 }}
                      >
                        Presigned upload URL
                      </Text>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={!presignedUploadUrl.trim() || loading}
                        onClick={copyPresignedUrl}
                      >
                        Copy URL
                      </Button>
                    </HStack>
                    <Textarea
                      readOnly
                      value={presignedUploadUrl}
                      placeholder="Run “Request upload URL” above to populate this field."
                      size="md"
                      css={{
                        minHeight: '88px',
                        fontFamily: 'ui-monospace, monospace',
                        fontSize: '$xs',
                      }}
                    />
                  </VStack>
                </VStack>

                <Box
                  css={{
                    borderTopWidth: '1px',
                    borderTopStyle: 'solid',
                    borderTopColor: '$neutral200',
                    paddingTop: '$6',
                  }}
                >
                  <VStack gap="$4" align="stretch">
                    <Text
                      as="div"
                      size="sm"
                      weight="bold"
                      css={{ color: '$neutral900', letterSpacing: '0.02em' }}
                    >
                      2 · Choose file
                    </Text>
                    <Box
                      css={{
                        padding: '$3',
                        borderRadius: '$md',
                        borderWidth: '1px',
                        borderStyle: 'dashed',
                        borderColor: '$neutral300',
                        backgroundColor: '$white900',
                      }}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        disabled={loading}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          setSelectedFileLabel(f ? `${f.name} (${f.size} bytes)` : '');
                        }}
                        style={{ maxWidth: '100%' }}
                      />
                    </Box>
                    {selectedFileLabel ? (
                      <Text as="div" size="sm" css={{ color: '$neutral600' }}>
                        Selected: {selectedFileLabel}
                      </Text>
                    ) : (
                      <Text as="div" size="xs" css={{ color: '$neutral500' }}>
                        No file selected yet.
                      </Text>
                    )}
                  </VStack>
                </Box>

                <Box
                  css={{
                    borderTopWidth: '1px',
                    borderTopStyle: 'solid',
                    borderTopColor: '$neutral200',
                    paddingTop: '$6',
                  }}
                >
                  <VStack gap="$4" align="stretch">
                    <Text
                      as="div"
                      size="sm"
                      weight="bold"
                      css={{ color: '$neutral900', letterSpacing: '0.02em' }}
                    >
                      3 · Upload
                    </Text>
                    <HStack gap="$3" wrap="wrap" align="center" css={{ alignSelf: 'flex-start' }}>
                      <Button
                        color="primary"
                        variant="solid"
                        disabled={loading || !presignedUploadUrl.trim() || !selectedFileLabel}
                        onClick={putSelectedFileToPresignedUrl}
                      >
                        Upload via fileUpload helper
                      </Button>
                      <Button
                        color="secondary"
                        variant="outline"
                        disabled={loading || !presignedUploadUrl.trim() || !selectedFileLabel}
                        onClick={putSelectedFileWithFetch}
                      >
                        Upload with fetch (PUT)
                      </Button>
                    </HStack>
                  </VStack>
                </Box>
              </VStack>
            </Box>
          </VStack>
        ) : null}
      </Box>
    </VStack>
  );
}

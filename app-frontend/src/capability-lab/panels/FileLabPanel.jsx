import {
  Box,
  Button,
  Input,
  Text,
  VStack,
} from '@sparrowengg/twigs-react';
import { ActionGrid } from '../ActionGrid.jsx';
import { sdkAction } from '../labApi.js';

export function FileLabPanel({
  loading,
  runAction,
  filePath,
  setFilePath,
  listPath,
  setListPath,
}) {
  return (
    <VStack gap="$4" align="stretch">
      <Text as="div" size="md" css={{ color: '$neutral800', lineHeight: 1.6 }}>
        Call <Text as="span" weight="bold">$file</Text> with a path (default demo
        file). List uses a prefix path under your storage namespace.
      </Text>
      <Box css={{ maxWidth: '480px' }}>
        <Text as="span" className="lab-field-label" size="sm" weight="bold" css={{ marginBottom: '$2' }}>
          File path
        </Text>
        <Input value={filePath} onChange={(e) => setFilePath(e.target.value)} size="lg" />
      </Box>
      <Box css={{ maxWidth: '480px' }}>
        <Text as="span" className="lab-field-label" size="sm" weight="bold" css={{ marginBottom: '$2' }}>
          List prefix path
        </Text>
        <Input value={listPath} onChange={(e) => setListPath(e.target.value)} size="lg" />
      </Box>
      <ActionGrid>
        <Button
          color="secondary"
          variant="outline"
          disabled={loading}
          onClick={() =>
            runAction(
              () => sdkAction('$file', 'getUploadUrl', { path: filePath }),
              '$file · getUploadUrl',
            )
          }
        >
          getUploadUrl
        </Button>
        <Button
          color="secondary"
          variant="outline"
          disabled={loading}
          onClick={() =>
            runAction(
              () => sdkAction('$file', 'getDownloadUrl', { path: filePath }),
              '$file · getDownloadUrl',
            )
          }
        >
          getDownloadUrl
        </Button>
        <Button
          color="secondary"
          variant="outline"
          disabled={loading}
          onClick={() =>
            runAction(() => sdkAction('$file', 'exists', { path: filePath }), '$file · exists')
          }
        >
          exists
        </Button>
        <Button
          color="secondary"
          variant="outline"
          disabled={loading}
          onClick={() =>
            runAction(() => sdkAction('$file', 'list', { listPath }), '$file · list')
          }
        >
          list
        </Button>
        <Button
          color="secondary"
          variant="outline"
          disabled={loading}
          onClick={() =>
            runAction(() => sdkAction('$file', 'delete', { path: filePath }), '$file · delete')
          }
        >
          delete
        </Button>
        <Button
          color="secondary"
          variant="outline"
          disabled={loading}
          onClick={() =>
            runAction(
              () => sdkAction('$file', 'uploadDemo', { path: filePath }),
              '$file · upload demo',
            )
          }
        >
          upload demo (URL + PUT)
        </Button>
      </ActionGrid>
    </VStack>
  );
}

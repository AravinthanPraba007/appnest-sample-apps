import { useState, useEffect } from 'react';
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

export function BackupFiles() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    setLoading(true);
    invoke('listBackups', {})
      .then((res) => setFiles(res?.files ?? []))
      .catch((e) => {
        setError(e.message || 'Failed to list backups');
        setFiles([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (path) => {
    try {
      const res = await invoke('getBackupDownloadUrl', { path });
      if (res?.url) window.open(res.url, '_blank');
    } catch (e) {
      setError(e.message || 'Failed to get download URL');
    }
  };

  if (loading) {
    return (
      <Flex justifyContent="center" alignItems="center" css={{ minHeight: 200 }}>
        <Stack gap="md" alignX="center" alignY="center">
          <Text variant="body">Loading backup files…</Text>
          <CircleLoader size="lg" />
        </Stack>
      </Flex>
    );
  }

  return (
    <Stack gap="lg" alignX="left" alignY="stretch">
      <Flex justifyContent="space-between" alignItems="center">
        <Text css={{ fontWeight: 600, fontSize: '$lg' }}>Backup Files</Text>
      </Flex>

      {error && (
        <Alert status="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!error && files.length === 0 && (
        <Box css={{ padding: '$8', textAlign: 'center', backgroundColor: '$white900', borderRadius: '$lg', border: '1px solid $colors$neutral200' }}>
          <Text variant="body">No backup files yet.</Text>
        </Box>
      )}

      {!error && files.length > 0 && (
        <Box css={{ backgroundColor: '$white900', borderRadius: '$lg', border: '1px solid $colors$neutral200', overflow: 'hidden' }}>
          <Table css={{ width: '100%', tableLayout: 'fixed' }}>
            <Thead>
              <Tr>
                <Th css={{ width: '70%' }}>File Name</Th>
                <Th css={{ width: '30%', textAlign: 'right' }}>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {files.map((f) => (
                <Tr key={f.path}>
                  <Td>{f.name ?? f.path}</Td>
                  <Td css={{ textAlign: 'right' }}>
                    <Button variant="primary" size="sm" onClick={() => handleDownload(f.path)}>
                      Download
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Stack>
  );
}

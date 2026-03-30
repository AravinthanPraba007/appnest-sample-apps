import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  AlertDescription,
  Box,
  Button,
  Checkbox,
  CircleLoader,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  ThemeProvider,
  Tr,
  defaultTheme,
} from '@sparrowengg/twigs-react';
import { DownloadIcon } from '@sparrowengg/twigs-react-icons';
import { listSurveySparrowContacts } from '../services/contactsApi';
import { contactsToCsv, triggerCsvDownload } from '../utils/csv';

const TYPE_OPTIONS = [
  { label: 'All types', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Unsubscribed', value: 'unsubscribed' },
  { label: 'Bounced', value: 'bounced' },
];

function contactKey(c) {
  return String(c.id ?? c.email ?? JSON.stringify(c));
}

function ContactsContent() {
  const [page, setPage] = useState(1);
  const [maxResults, setMaxResults] = useState(50);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeOption, setTypeOption] = useState(TYPE_OPTIONS[0]);
  const typeFilter = typeOption?.value ?? '';
  const [contacts, setContacts] = useState([]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedById, setSelectedById] = useState(() => new Map());

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, typeFilter]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const payload = {
      page,
      maxResults,
      search: debouncedSearch || undefined,
      type: typeFilter || undefined,
    };
    const res = await listSurveySparrowContacts(payload);
    setLoading(false);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const body = res.body || {};
      const list = Array.isArray(body.contacts) ? body.contacts : [];
      setContacts(list);
      setHasNextPage(Boolean(body.hasNextPage));
      return;
    }
    const msg =
      res.body?.message || `Could not load contacts (${res.statusCode}).`;
    setError(msg);
    setContacts([]);
    setHasNextPage(false);
  }, [page, maxResults, debouncedSearch, typeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleRow = useCallback((row, checked) => {
    const key = contactKey(row);
    setSelectedById((prev) => {
      const next = new Map(prev);
      if (checked) next.set(key, row);
      else next.delete(key);
      return next;
    });
  }, []);

  const pageIds = useMemo(() => contacts.map((c) => contactKey(c)), [contacts]);

  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedById.has(id));
  const somePageSelected = pageIds.some((id) => selectedById.has(id));

  const headerCheckboxState = allPageSelected
    ? true
    : somePageSelected
      ? 'indeterminate'
      : false;

  const toggleSelectAllOnPage = useCallback(
    (checked) => {
      setSelectedById((prev) => {
        const next = new Map(prev);
        if (checked) {
          contacts.forEach((c) => next.set(contactKey(c), c));
        } else {
          pageIds.forEach((id) => next.delete(id));
        }
        return next;
      });
    },
    [contacts, pageIds],
  );

  const selectedCount = selectedById.size;
  const selectedList = useMemo(() => [...selectedById.values()], [selectedById]);

  const handleExport = () => {
    if (selectedList.length === 0) return;
    const stamp = new Date().toISOString().slice(0, 10);
    const csv = contactsToCsv(selectedList);
    triggerCsvDownload(`contacts-export-${stamp}.csv`, csv);
  };

  const maxResultsOptions = useMemo(
    () =>
      [25, 50, 100].map((n) => ({
        label: `${n} per page`,
        value: n,
      })),
    [],
  );

  const maxResultsValue = useMemo(
    () =>
      maxResultsOptions.find((o) => o.value === maxResults) ||
      maxResultsOptions[1],
    [maxResults, maxResultsOptions],
  );

  return (
    <Stack gap="$6" css={{ padding: '$8', maxWidth: '1200px', margin: '0 auto' }}>
      <Stack gap="$2">
        <Heading size="h4">Contact export</Heading>
        <Text css={{ color: '$neutral600' }}>
          Browse SurveySparrow contacts, select rows, and download them as CSV.
        </Text>
      </Stack>

      {error ? (
        <Alert status="error" css={{ width: '100%' }}>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Box
        css={{
          padding: '$4',
          backgroundColorOpacity: ['$secondary500', 0.06],
          borderRadius: '$lg',
        }}
      >
        <Stack gap="$4">
          <HStack
            gap="$4"
            css={{
              alignItems: 'flex-end',
              flexWrap: 'wrap',
            }}
          >
            <Stack gap="$1" css={{ flex: '1 1 200px', minWidth: 180 }}>
              <FormLabel>Search</FormLabel>
              <Input
                placeholder="Name, email, phone…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </Stack>
            <Stack gap="$1" css={{ flex: '0 1 200px', minWidth: 160 }}>
              <FormLabel>Contact type</FormLabel>
              <Select
                options={TYPE_OPTIONS}
                value={typeOption}
                onChange={(opt) => setTypeOption(opt || TYPE_OPTIONS[0])}
                isSearchable={false}
              />
            </Stack>
            <Stack gap="$1" css={{ flex: '0 1 180px', minWidth: 140 }}>
              <FormLabel>Page size</FormLabel>
              <Select
                options={maxResultsOptions}
                value={maxResultsValue}
                onChange={(opt) => {
                  if (opt?.value != null) {
                    setMaxResults(Number(opt.value));
                    setPage(1);
                  }
                }}
                isSearchable={false}
              />
            </Stack>
            <Button
              variant="solid"
              disabled={selectedCount === 0}
              onClick={handleExport}
              leftIcon={<DownloadIcon aria-hidden />}
              css={{ alignSelf: 'flex-end' }}
            >
              Export CSV
            </Button>
          </HStack>

          <HStack
            gap="$3"
            css={{
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
            }}
          >
            <Text css={{ color: '$neutral600', fontSize: '$sm' }}>
              Selected: {selectedCount}
            </Text>
            <HStack gap="$2" css={{ alignItems: 'center' }}>
              <Button
                variant="ghost"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Text css={{ fontSize: '$sm' }}>Page {page}</Text>
              <Button
                variant="ghost"
                size="sm"
                disabled={!hasNextPage || loading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </HStack>
          </HStack>
        </Stack>
      </Box>

      {loading ? (
        <Stack gap="$3" css={{ alignItems: 'center', padding: '$12' }}>
          <CircleLoader size="2xl" />
          <Text css={{ color: '$neutral600' }}>Loading contacts…</Text>
        </Stack>
      ) : contacts.length === 0 ? (
        <Box css={{ padding: '$10', textAlign: 'center' }}>
          <Text css={{ color: '$neutral600' }}>No contacts match your filters.</Text>
        </Box>
      ) : (
        <Box css={{ overflowX: 'auto' }}>
          <Table>
            <Thead>
              <Tr>
                <Th css={{ width: 48 }}>
                  <Checkbox
                    checked={headerCheckboxState}
                    onChange={(v) => toggleSelectAllOnPage(v === true)}
                  />
                </Th>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Phone</Th>
                <Th>Mobile</Th>
                <Th>Title</Th>
                <Th>Active</Th>
                <Th>Unsubscribed</Th>
              </Tr>
            </Thead>
            <Tbody>
              {contacts.map((row) => {
                const key = contactKey(row);
                const checked = selectedById.has(key);
                return (
                  <Tr key={key}>
                    <Td>
                      <Checkbox
                        checked={checked}
                        onChange={(v) => toggleRow(row, v === true)}
                      />
                    </Td>
                    <Td>
                      <Text css={{ fontSize: '$sm' }}>{row.name ?? '—'}</Text>
                    </Td>
                    <Td>
                      <Text css={{ fontSize: '$sm' }}>{row.email ?? '—'}</Text>
                    </Td>
                    <Td>
                      <Text css={{ fontSize: '$sm' }}>{row.phone ?? '—'}</Text>
                    </Td>
                    <Td>
                      <Text css={{ fontSize: '$sm' }}>{row.mobile ?? '—'}</Text>
                    </Td>
                    <Td>
                      <Text css={{ fontSize: '$sm' }}>{row.jobTitle ?? '—'}</Text>
                    </Td>
                    <Td>
                      <Text css={{ fontSize: '$sm' }}>{String(row.active ?? '')}</Text>
                    </Td>
                    <Td>
                      <Text css={{ fontSize: '$sm' }}>{String(row.unsubscribed ?? '')}</Text>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      )}
    </Stack>
  );
}

export default function ContactsApp() {
  return (
    <ThemeProvider theme={defaultTheme}>
      <ContactsContent />
    </ThemeProvider>
  );
}

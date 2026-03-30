import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  AlertDescription,
  Box,
  Button,
  Checkbox,
  CircleLoader,
  Flex,
  Heading,
  HStack,
  Input,
  Select,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  ThemeProvider,
  Thead,
  Th,
  Tr,
  defaultTheme,
} from '@sparrowengg/twigs-react';
import { DownloadIcon, FilterIcon } from '@sparrowengg/twigs-react-icons';
import { contactsToCsv, downloadCsv } from './utils/csv';
import './css/App.css';

function contactKey(contact, page, index) {
  if (contact && contact.id != null) return `id:${contact.id}`;
  return `p${page}_i${index}`;
}

function formatName(c) {
  const parts = [c.first_name, c.last_name].filter(Boolean);
  if (parts.length) return parts.join(' ');
  if (c.name) return String(c.name);
  return '—';
}

async function invokeBackend(apiFunctionName, payload) {
  const invoke = window.appnestClientFunctions?.appBackend?.invoke;
  if (typeof invoke !== 'function') {
    throw new Error(
      'App backend is not available. Open this app inside SurveySparrow to load contacts.',
    );
  }
  const response = await invoke({ apiFunctionName, payload });
  if (response.statusCode >= 200 && response.statusCode < 300) {
    return response.body;
  }
  const msg = response.body?.message || `Request failed (${response.statusCode})`;
  throw new Error(msg);
}

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'unsubscribed', label: 'Unsubscribed' },
  { value: 'bounced', label: 'Bounced' },
];

const KIND_OPTIONS = [
  { value: '', label: 'Contact / employee' },
  { value: 'contact', label: 'Contact' },
  { value: 'employee', label: 'Employee' },
];

function ContactsApp() {
  const [page, setPage] = useState(1);
  const limit = 25;
  const [searchInput, setSearchInput] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [contactListId, setContactListId] = useState('');
  const [statusType, setStatusType] = useState('');
  const [contactKind, setContactKind] = useState('');
  const [contacts, setContacts] = useState([]);
  const [hasNext, setHasNext] = useState(false);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listsLoading, setListsLoading] = useState(true);
  const [listLoadWarning, setListLoadWarning] = useState(null);
  const [error, setError] = useState(null);
  const [selectedByKey, setSelectedByKey] = useState(() => new Map());

  const debounceRef = useRef();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchDebounced(searchInput.trim());
      setPage(1);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setListsLoading(true);
      setListLoadWarning(null);
      try {
        const result = await invokeBackend('getContactLists', {});
        if (!cancelled) {
          setLists(result.contact_lists || []);
        }
      } catch (e) {
        if (!cancelled) {
          setLists([]);
          setListLoadWarning(
            e.message || 'Contact lists could not be loaded; filter by list is unavailable.',
          );
        }
      } finally {
        if (!cancelled) setListsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const listSelectOptions = useMemo(() => {
    const base = [{ value: '', label: 'All lists' }];
    const rest = lists.map((l) => ({
      value: String(l.id),
      label: l.name || `List ${l.id}`,
    }));
    return base.concat(rest);
  }, [lists]);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const body = await invokeBackend('getContacts', {
        page,
        limit,
        search: searchDebounced || undefined,
        contact_list_id: contactListId || undefined,
        type: statusType || undefined,
        contact_type: contactKind || undefined,
      });
      setContacts(body.contacts || []);
      setHasNext(Boolean(body.has_next_page));
    } catch (e) {
      setContacts([]);
      setHasNext(false);
      setError(e.message || 'Failed to load contacts.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchDebounced, contactListId, statusType, contactKind]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const pageKeys = useMemo(
    () => contacts.map((c, i) => contactKey(c, page, i)),
    [contacts, page],
  );

  const allPageSelected =
    pageKeys.length > 0 && pageKeys.every((k) => selectedByKey.has(k));
  const somePageSelected = pageKeys.some((k) => selectedByKey.has(k));

  const headerCheckboxState = allPageSelected
    ? true
    : somePageSelected
      ? 'indeterminate'
      : false;

  const toggleSelectAllPage = (checked) => {
    setSelectedByKey((prev) => {
      const next = new Map(prev);
      if (checked === true || checked === 'indeterminate') {
        pageKeys.forEach((k, i) => next.set(k, contacts[i]));
      } else {
        pageKeys.forEach((k) => next.delete(k));
      }
      return next;
    });
  };

  const toggleRow = (key, contact, checked) => {
    setSelectedByKey((prev) => {
      const next = new Map(prev);
      if (checked === true) {
        next.set(key, contact);
      } else {
        next.delete(key);
      }
      return next;
    });
  };

  const exportSelected = () => {
    const rows = Array.from(selectedByKey.values());
    if (!rows.length) return;
    const csv = contactsToCsv(rows);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`surveysparrow-contacts-${stamp}.csv`, csv);
  };

  const currentListValue =
    listSelectOptions.find((o) => o.value === contactListId) || listSelectOptions[0];
  const statusValue =
    STATUS_OPTIONS.find((o) => o.value === statusType) || STATUS_OPTIONS[0];
  const kindValue =
    KIND_OPTIONS.find((o) => o.value === contactKind) || KIND_OPTIONS[0];

  return (
    <Box
      css={{
        minHeight: '100vh',
        padding: '$8',
        backgroundColor: '$neutral50',
      }}
    >
      <Stack gap="$6">
        <Flex
          justifyContent="space-between"
          alignItems="flex-start"
          wrap="wrap"
          gap="$4"
        >
          <Stack gap="$2">
            <Heading as="h1" css={{ fontSize: '$3xl', fontWeight: 700 }}>
              Contacts
            </Heading>
            <Text size="md" css={{ color: '$neutral700', maxWidth: 560 }}>
              Search and filter SurveySparrow contacts, then export your selection as CSV.
            </Text>
          </Stack>
          <HStack gap="$3" wrap="wrap" css={{ alignItems: 'center' }}>
            <Button
              size="lg"
              variant="solid"
              disabled={selectedByKey.size === 0}
              onClick={exportSelected}
            >
              <HStack gap="$2" alignItems="center">
                <DownloadIcon size={18} />
                <Text size="md" weight="medium">
                  Export CSV ({selectedByKey.size})
                </Text>
              </HStack>
            </Button>
          </HStack>
        </Flex>

        {error && (
          <Alert status="error" variant="subtle">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Box
          css={{
            backgroundColor: '$white900',
            borderRadius: '$2xl',
            padding: '$5',
            boxShadow: '$sm',
          }}
        >
          <Stack gap="$4">
            <HStack gap="$3" wrap="wrap" css={{ alignItems: 'center' }}>
              <FilterIcon size={20} />
              <Text weight="bold">Filters</Text>
            </HStack>

            <Stack gap="$4" css={{ '@screen-md': { flexDirection: 'row', flexWrap: 'wrap' } }}>
              <Box css={{ flex: '1 1 220px', minWidth: 200 }}>
                <Text size="sm" weight="medium" css={{ marginBottom: '$2' }}>
                  Search
                </Text>
                <Input
                  placeholder="Name, email, phone…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  size="lg"
                />
              </Box>
              <Box css={{ flex: '1 1 200px', minWidth: 180 }}>
                <Text size="sm" weight="medium" css={{ marginBottom: '$2' }}>
                  Contact list
                </Text>
                <Select
                  isDisabled={listsLoading}
                  options={listSelectOptions}
                  value={currentListValue}
                  onChange={(opt) => {
                    setContactListId(opt?.value ?? '');
                    setPage(1);
                  }}
                  isSearchable
                />
                {listLoadWarning && (
                  <Text size="xs" css={{ color: '$warning700', marginTop: '$2' }}>
                    {listLoadWarning}
                  </Text>
                )}
              </Box>
              <Box css={{ flex: '1 1 180px', minWidth: 160 }}>
                <Text size="sm" weight="medium" css={{ marginBottom: '$2' }}>
                  Status
                </Text>
                <Select
                  options={STATUS_OPTIONS}
                  value={statusValue}
                  onChange={(opt) => {
                    setStatusType(opt?.value ?? '');
                    setPage(1);
                  }}
                  isSearchable={false}
                />
              </Box>
              <Box css={{ flex: '1 1 180px', minWidth: 160 }}>
                <Text size="sm" weight="medium" css={{ marginBottom: '$2' }}>
                  Type
                </Text>
                <Select
                  options={KIND_OPTIONS}
                  value={kindValue}
                  onChange={(opt) => {
                    setContactKind(opt?.value ?? '');
                    setPage(1);
                  }}
                  isSearchable={false}
                />
              </Box>
            </Stack>

            <HStack gap="$3" wrap="wrap">
              <Button
                size="md"
                variant="outline"
                onClick={() => {
                  setSearchInput('');
                  setSearchDebounced('');
                  setContactListId('');
                  setStatusType('');
                  setContactKind('');
                  setPage(1);
                  setSelectedByKey(new Map());
                }}
              >
                Clear filters
              </Button>
              <Button size="md" variant="ghost" onClick={() => fetchContacts()}>
                Refresh
              </Button>
            </HStack>
          </Stack>
        </Box>

        <Box
          css={{
            backgroundColor: '$white900',
            borderRadius: '$2xl',
            padding: '$4',
            boxShadow: '$sm',
            position: 'relative',
            overflowX: 'auto',
          }}
        >
          {loading && (
            <Box
              css={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(255,255,255,0.65)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                borderRadius: '$2xl',
              }}
            >
              <CircleLoader />
            </Box>
          )}

          {contacts.length === 0 && !loading ? (
            <Box css={{ padding: '$10', textAlign: 'center' }}>
              <Text size="lg" css={{ color: '$neutral600' }}>
                No contacts match the current filters.
              </Text>
            </Box>
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th css={{ width: 48 }}>
                    <Checkbox
                      checked={headerCheckboxState}
                      onChange={(v) => toggleSelectAllPage(v)}
                      aria-label="Select all on this page"
                    />
                  </Th>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Phone</Th>
                  <Th>Job title</Th>
                  <Th>Company</Th>
                  <Th>Type</Th>
                </Tr>
              </Thead>
              <Tbody>
                {contacts.map((c, index) => {
                  const key = contactKey(c, page, index);
                  const checked = selectedByKey.has(key);
                  return (
                    <Tr key={key}>
                      <Td>
                        <Checkbox
                          checked={checked}
                          onChange={(v) => toggleRow(key, c, v)}
                          aria-label={`Select contact ${formatName(c)}`}
                        />
                      </Td>
                      <Td>
                        <Text size="sm">{formatName(c)}</Text>
                      </Td>
                      <Td>
                        <Text size="sm">{c.email || c.send_email || '—'}</Text>
                      </Td>
                      <Td>
                        <Text size="sm">{c.phone || c.mobile || '—'}</Text>
                      </Td>
                      <Td>
                        <Text size="sm">{c.job_title || '—'}</Text>
                      </Td>
                      <Td>
                        <Text size="sm">
                          {c.company || c.company_name || c.organization || '—'}
                        </Text>
                      </Td>
                      <Td>
                        <Text size="sm">{c.type || c.contact_type || '—'}</Text>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          )}

          <Flex
            justifyContent="space-between"
            alignItems="center"
            wrap="wrap"
            gap="$3"
            css={{ marginTop: '$4' }}
          >
            <Text size="sm" css={{ color: '$neutral700' }}>
              Page {page}
              {hasNext ? ' · more pages available' : contacts.length ? ' · last page' : ''}
            </Text>
            <HStack gap="$2">
              <Button
                variant="outline"
                size="md"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="md"
                disabled={!hasNext || loading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </HStack>
          </Flex>
        </Box>
      </Stack>
    </Box>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={defaultTheme}>
      <ContactsApp />
    </ThemeProvider>
  );
}

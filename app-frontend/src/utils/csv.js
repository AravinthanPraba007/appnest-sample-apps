const CSV_COLUMNS = [
  'id',
  'name',
  'email',
  'phone',
  'mobile',
  'jobTitle',
  'active',
  'unsubscribed',
];

function escapeCell(val) {
  if (val === undefined || val === null) return '';
  const s = String(val);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function contactsToCsv(contacts) {
  const header = CSV_COLUMNS.join(',');
  const lines = contacts.map((c) =>
    CSV_COLUMNS.map((col) => escapeCell(c[col])).join(','),
  );
  return [header, ...lines].join('\r\n');
}

export function triggerCsvDownload(filename, csvText) {
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

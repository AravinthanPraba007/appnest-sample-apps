/**
 * CSV parsing and validation helpers.
 * For full CSV read we rely on backend fetching the file via $file.getDownloadUrl and then parsing.
 * This module provides parse + validate logic (headers, required fields).
 */

/**
 * Parse CSV string into array of row objects using first row as headers.
 * @param {string} csvText
 * @returns {{ headers: string[], rows: Record<string, string>[] }}
 */
function parseCsvWithHeaders(csvText) {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim() !== '');
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }
  const headers = parseCsvLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] !== undefined ? String(values[idx]).trim() : '';
    });
    rows.push(row);
  }
  return { headers, rows };
}

/**
 * Parse a single CSV line handling quoted fields.
 */
function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if ((c === ',' && !inQuotes) || c === '\t') {
      result.push(current.trim());
      current = '';
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Validate that required columns exist and optionally that rows have values.
 * @param {{ headers: string[], rows: Record<string, string>[], requiredColumns?: string[] }}
 * @returns {{ valid: boolean, errors: Array<{ rowIndex?: number, message: string }>, headers: string[] }}
 */
function validateCsvContent({ headers, rows, requiredColumns = [] }) {
  const errors = [];
  const missingHeaders = requiredColumns.filter((col) => !headers.includes(col));
  if (missingHeaders.length > 0) {
    errors.push({ message: `Missing columns: ${missingHeaders.join(', ')}` });
  }
  const valid = errors.length === 0;
  return { valid, errors, headers };
}

module.exports = {
  parseCsvWithHeaders,
  parseCsvLine,
  validateCsvContent,
};

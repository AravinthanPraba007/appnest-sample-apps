/**
 * Minimal RFC4180-style CSV parser (supports quoted fields, commas, CRLF).
 * @param {string} content
 * @returns {string[][]}
 */
function parseCsv(content) {
  const rows = [];
  let i = 0;
  const len = content.length;

  const parseField = () => {
    let field = '';
    if (i < len && content[i] === '"') {
      i++;
      while (i < len) {
        if (content[i] === '"') {
          if (i + 1 < len && content[i + 1] === '"') {
            field += '"';
            i += 2;
            continue;
          }
          i++;
          break;
        }
        field += content[i];
        i++;
      }
    } else {
      while (
        i < len &&
        content[i] !== ',' &&
        content[i] !== '\n' &&
        content[i] !== '\r'
      ) {
        field += content[i];
        i++;
      }
    }
    return field;
  };

  const parseRow = () => {
    const row = [];
    while (i < len) {
      row.push(parseField());
      if (i < len && content[i] === ',') {
        i++;
        continue;
      }
      if (i < len && content[i] === '\r') i++;
      if (i < len && content[i] === '\n') {
        i++;
        break;
      }
      break;
    }
    return row;
  };

  while (i < len) {
    if (content[i] === '\r' || content[i] === '\n') {
      i++;
      continue;
    }
    rows.push(parseRow());
  }

  return rows.filter((r) => r.some((c) => String(c).trim() !== ''));
}

module.exports = { parseCsv };

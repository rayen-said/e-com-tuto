export function formatEuro(amount: number): string {
  return (
    amount.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' €'
  );
}

export function formatPercent(val: number): string {
  return (
    val.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' %'
  );
}

export function nowTime(): string {
  return new Date().toLocaleTimeString('fr-FR', { hour12: false });
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return (
    'idem-' +
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    })
  );
}

export function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;');
}

export function highlightSQL(sql: string): string {
  const tokenRegex =
    /(--[^\n]*)|('[^']*(?:''[^']*)*')|(\b(?:SELECT|FROM|WHERE|INNER|LEFT|OUTER|JOIN|ON|AND|OR|ORDER|BY|ASC|DESC|LIMIT|BEGIN|COMMIT|ROLLBACK|ISOLATION|LEVEL|READ|COMMITTED|FOR|UPDATE|SET|INSERT|INTO|VALUES|RETURNING|REFRESH|MATERIALIZED|VIEW|CONCURRENTLY|DO|NOTHING|GROUP|AS|IN|NULL|COUNT|SUM|AVG|ROUND|WITHIN|INTERVAL)\b)|(\b(?:to_tsvector|plainto_tsquery|ts_rank|COALESCE|NOW|PERCENTILE_CONT|pg_is_in_recovery|version)\b)|(-?\d+(?:\.\d*)?)/gi;
  let result = '';
  let lastIndex = 0;
  sql.replace(tokenRegex, (match, comment, str, kw, fn, num, offset) => {
    result += escapeHtml(sql.slice(lastIndex, offset));
    if (comment) result += `<span class="tok-cmt">${escapeHtml(comment)}</span>`;
    else if (str) result += `<span class="tok-str">${escapeHtml(str)}</span>`;
    else if (kw) result += `<span class="tok-kw">${escapeHtml(kw)}</span>`;
    else if (fn) result += `<span class="tok-fn">${escapeHtml(fn)}</span>`;
    else if (num) result += `<span class="tok-num">${escapeHtml(num)}</span>`;
    lastIndex = offset + match.length;
    return '';
  });
  result += escapeHtml(sql.slice(lastIndex));
  return result;
}

export function highlightRedis(cmd: string): string {
  if (!cmd) return '<span class="tok-cmt">-- Aucune commande Redis exécutée --</span>';
  const tokenRegex = /^([A-Z]+)\b|("(?:[^"\\]|\\.)*")/gm;
  let result = '';
  let lastIndex = 0;
  cmd.replace(tokenRegex, (match, cmdWord, str, offset) => {
    result += escapeHtml(cmd.slice(lastIndex, offset));
    if (cmdWord) result += `<span class="tok-cmd">${escapeHtml(cmdWord)}</span>`;
    else if (str) result += `<span class="tok-str">${escapeHtml(str)}</span>`;
    lastIndex = offset + match.length;
    return '';
  });
  result += escapeHtml(cmd.slice(lastIndex));
  return result;
}

export function highlightJSON(obj: unknown): string {
  const json = typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);
  const tokenRegex =
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^"\\])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g;
  let result = '';
  let lastIndex = 0;
  json.replace(tokenRegex, (match, keyStr, colon, boolNull, num, offset) => {
    result += escapeHtml(json.slice(lastIndex, offset));
    if (/^"/.test(match)) {
      if (/:$/.test(match)) result += `<span class="tok-key">${escapeHtml(match)}</span>`;
      else result += `<span class="tok-str">${escapeHtml(match)}</span>`;
    } else if (/true|false|null/.test(match)) {
      result += `<span class="tok-kw">${escapeHtml(match)}</span>`;
    } else {
      result += `<span class="tok-num">${escapeHtml(match)}</span>`;
    }
    lastIndex = offset + match.length;
    return '';
  });
  result += escapeHtml(json.slice(lastIndex));
  return result;
}

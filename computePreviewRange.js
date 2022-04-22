import fs from 'fs';

const extent = 5;

export default async function computePreviewRange(path, item, log) {
  const text = await fs.promises.readFile(path, 'utf-8');
  const lines = text.split('\n');

  // Do this as GitHub won't preview the last line of the file if empty
  if (lines[lines.length - 1] === '') {
    lines.pop();
  }

  log?.(lines);
  log?.(item);

  let start = item.line;
  for (let offset = 1; offset < extent; offset++) {
    if (!lines[item.line - 1 - offset]) {
      log?.('Blank line above at offset', offset);
      break;
    }

    start--;
  }

  let end = item.line;
  for (let offset = 1; offset < extent; offset++) {
    if (!lines[item.line - 1 + offset]) {
      log?.('Blank line below at offset', offset);
      break;
    }

    end++;
  }

  return `#L${start}-L${end}`;
}

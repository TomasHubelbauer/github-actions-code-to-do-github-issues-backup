import fs from 'fs';
import computePreviewRange from './computePreviewRange.js';

await fs.promises.writeFile('temp.md', `# Temp

There is a TODO here:
- [ ] Do a thing

No more TODO items here.
`);

console.log(await computePreviewRange('temp.md', { line: 4 }));
await fs.promises.unlink('temp.md');

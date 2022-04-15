import todo from 'todo/index.js';

if (!process.argv[2]) {
  throw new Error('Provide the path of ${{github.workspace}}');
}

for await (const item of todo(process.argv[2])) {
  console.log(item);
}

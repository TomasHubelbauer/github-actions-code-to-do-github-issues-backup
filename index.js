import todo from 'todo/index.js';

for await (const item of todo()) {
  console.log(item);
}

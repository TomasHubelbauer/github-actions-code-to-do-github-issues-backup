import todo from './todo/index.js';

if (!process.argv[2]) {
  throw new Error('Provide the path of ${{github.workspace}}');
}

if (!process.argv[3]) {
  throw new Error('Provide a PAT, e.g. ${{github.token}}');
}

if (!process.argv[4]) {
  throw new Error('Provide the repository name, e.g. ${{github.repository}}');
}

// Make a call to GitHub to find out the amount of pages needed to fetch issues
const pages = await surveyPages(token, `repos/${process.argv[3]}/issues`, { per_page: 100 });
console.log('Found', pages, 'issue pages');

let issues = [];
for (let page = 1; page <= pages; page++) {
  const pageIssues = await callGitHub(token, `repos/${process.argv[3]}/issues`, { params: { per_page: 100, page } });
  console.log('Fetched', pageIssues.length, 'issues on page', page);
  issues.push(...pageIssues);
}

for (const issue of issues) {
  console.log('issue', issue.number, issue.title);
}

for await (const item of todo(process.argv[2])) {
  console.log('item', item.path, item.text);
}

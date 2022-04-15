import todo from './todo/index.js';
import surveyPages from './suveryPages.js';
import callGitHub from './callGithub';

const path = process.argv[2];
if (!path) {
  throw new Error('Provide the path of ${{github.workspace}}');
}

const token = process.argv[3];
if (!token) {
  throw new Error('Provide a PAT, e.g. ${{github.token}}');
}

const repo = process.argv[4];
if (!repo) {
  throw new Error('Provide the repository name, e.g. ${{github.repository}}');
}

// Make a call to GitHub to find out the amount of pages needed to fetch issues
const pages = await surveyPages(token, `repos/${repo}/issues`, { per_page: 100 });
console.log('Found', pages, 'issue pages');

let issues = [];
for (let page = 1; page <= pages; page++) {
  const pageIssues = await callGitHub(token, `repos/${repo}/issues`, { params: { per_page: 100, page } });
  console.log('Fetched', pageIssues.length, 'issues on page', page);
  issues.push(...pageIssues);
}

for (const issue of issues) {
  console.log('issue', issue.number, issue.title);
}

for await (const item of todo(path)) {
  console.log('item', item.path, item.text);
}

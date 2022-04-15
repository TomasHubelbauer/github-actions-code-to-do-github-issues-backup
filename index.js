import fs from 'fs';
import todo from './todo/index.js';
import surveyPages from './suveryPages.js';
import callGitHub from './callGithub.js';

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
const pages = await surveyPages(token, `repos/${repo}/issues`, { per_page: 100, labels: 'to-do' });
console.log('Found', pages, 'issue pages');

let issues = [];
for (let page = 1; page <= pages; page++) {
  const pageIssues = await callGitHub(token, `repos/${repo}/issues`, { params: { per_page: 100, page, labels: 'to-do' } });
  console.log('Fetched', pageIssues.length, 'issues on page', page);
  issues.push(...pageIssues);
}

for await (const item of todo(path)) {
  const title = `${item.text} (${item.path.slice(path.length)})`;
  const issue = issues.find(issue => issue.title === title);
  if (issue) {
    issues.splice(issues.indexOf(issue), 1);
    console.log(`"${title}" already exists in #${issue.number}`);
  }
  else {
    console.log(`"${title}" is new - creating…`);
  }
}

for (const issue of issues) {
  console.log(`"${issue.title}" (#${issue.number}) is old - deleting…`);
}

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

const server = process.argv[5];
if (!server) {
  throw new Error('Provide the repository server, e.g. ${{github.server_url}}');
}

const sha = process.argv[6];
if (!sha) {
  throw new Error('Provide the commit SHA, e.g. ${{github.sha}}');
}

const labels = 'to-do';

// Make a call to GitHub to find out the amount of pages needed to fetch issues
const pages = await surveyPages(token, `repos/${repo}/issues`, { per_page: 100, labels });
console.log('Found', pages, 'issue pages');

let issues = [];
for (let page = 1; page <= pages; page++) {
  const pageIssues = await callGitHub(token, `repos/${repo}/issues`, { params: { per_page: 100, page, labels } });
  console.log('Fetched', pageIssues.length, 'issues on page', page);
  issues.push(...pageIssues);
}

for await (const item of todo(path)) {
  const name = item.path.slice(path.length + 1);
  const title = `${item.text} (${name}:${item.line})`;

  const issue = issues.find(issue => issue.title === title);
  if (issue) {
    issues.splice(issues.indexOf(issue), 1);
    console.log(`"${title}" already exists in #${issue.number}`);
  }
  else {
    // Note that `plain=true` is there to render everything as text, no viewers
    const body = `${server}/${repo}/blob/${sha}/${name}?plain=true#L${item.line}`;

    const [issue, ...dupes] = issues.filter(issue => issue.title.startsWith(`${item.text} (${name}:`));
    if (issue !== undefined && dupes.length === 0) {
      issues.splice(issues.indexOf(issue), 1);
      console.log(`"${title}" was moved - updating…`);
      const data = await callGitHub(token, `repos/${repo}/issues/${issue.number}`, { method: 'PATCH', body: { title, body } });
      console.log(`"${title}" was moved - updated ${data.number}`);
    }
    else {
      console.log(`"${title}" is new - opening…`);
      const data = await callGitHub(token, `repos/${repo}/issues`, { method: 'POST', body: { title, body, labels: [labels] } });
      console.log(`"${title}" is new - opened ${data.number}`);
    }
  }
}

for (const issue of issues) {
  // https://docs.github.com/en/actions/learn-github-actions/environment-variables#default-environment-variables
  const event = JSON.parse(await fs.promises.readFile(process.env.GITHUB_EVENT_PATH, 'utf-8'));
  const defaultMessage = `a commit\n\n\`event.head_commit\` was \`undefined`\.`;
  const [messageTitle, ...messageLines] = (event.head_commit?.message ?? defaultMessage).split('\n').filter(line => !!line);
  
  const body = `Removed in [${messageTitle}](${server}/${repo}/commit/${sha}):\n\n${messageLines.map(line => '> ' + line).join('\n')}\n`;
  console.log(`"${issue.title}" (#${issue.number}) is old - commenting…`);
  const commentData = await callGitHub(token, `repos/${repo}/issues/${issue.number}/comments`, { method: 'POST', body: { body } });
  console.log(`"${issue.title}" is old - commented ${commentData.number}`);
  
  const state = 'closed';
  console.log(`"${issue.title}" (#${issue.number}) is old - closing…`);
  const issueData = await callGitHub(token, `repos/${repo}/issues/${issue.number}`, { method: 'PATCH', body: { state } });
  console.log(`"${issue.title}" is old - closed ${issueData.number}`);
}

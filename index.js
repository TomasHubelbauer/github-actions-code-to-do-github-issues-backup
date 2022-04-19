import fs from 'fs';
import todo from './todo/index.js';
import surveyPages from './suveryPages.js';
import callGitHub from './callGithub.js';

const token = process.argv[2];
if (!token) {
  throw new Error('Provide a PAT, e.g. ${{github.token}}');
}

const path = process.env.GITHUB_WORKSPACE;
const repo = process.env.GITHUB_REPOSITORY;
const server = process.env.GITHUB_SERVER_URL;
const sha = process.env.GITHUB_SHA;

const labels = 'todo-comment';

// Make a call to GitHub to find out the amount of pages needed to fetch issues
const pages = await surveyPages(token, `repos/${repo}/issues`, { per_page: 100, labels });
console.log('Found', pages, 'issue pages');

let issues = [];
for (let page = 1; page <= pages; page++) {
  const pageIssues = await callGitHub(token, `repos/${repo}/issues`, { params: { per_page: 100, page, labels } });
  console.log('Fetched', pageIssues.length, 'issues on page', page);
  issues.push(...pageIssues);
}

// Go over the to-do items and try to match, update or create issues for them
for await (const item of todo(path)) {
  const name = item.path.slice(path.length + 1);

  const title = `${item.text} (:${item.line})`;

  // Note that `plain=true` is there to render as plain text, no preview pages
  const body = `${server}/${repo}/blob/${sha}/${name}?plain=true#L${Math.max(1, item.line - 5)}-L${item.line + 5}`;
  
  // Attempt to find an issue with the same text, line and path as the to-do item
  const existingIssue = issues.find(issue => {
    const { text, line } = issue.title.match(/(?<text>^.+) \(:(?<line>\d+)\)$/).groups;
    return text === item.text && +line === item.line && issue.labels.find(label => label.name === name);
  });

  // Skip existing issue and remove it from the pile so it doesn't get deleted
  if (existingIssue) {
    issues.splice(issues.indexOf(existingIssue), 1);
    
    // Note that existing issues still get updated to renew the preview snippet
    console.log(`"${item.text}" was found - updating…`);
    await callGitHub(token, `repos/${repo}/issues/${existingIssue.number}`, { method: 'PATCH', body: { title, body } });
    console.log(`"${item.text}" was found - updated: ${existingIssue.html_url}`);
    continue;
  }

  // See if there is a unique fallback match with only a different line number
  const [movedIssue, ...duplicates] = issues.filter(issue => {
    const { text } = issue.title.match(/(?<text>^.+) \(:(?<line>\d+)\)$/).groups;
    return text === item.text && issue.labels.find(label => label.name === name);
  });

  // Recognize the to-do comment just changed line numbers within the file
  if (movedIssue && duplicates.length === 0) {
    // Remove the candidate from the pile so it doesn't get deleted
    issues.splice(issues.indexOf(movedIssue), 1);

    console.log(`"${item.text}" was moved - updating…`);
    await callGitHub(token, `repos/${repo}/issues/${movedIssue.number}`, { method: 'PATCH', body: { title, body } });
    console.log(`"${item.text}" was moved - updated: ${movedIssue.html_url}`);
    continue;
  }

  console.log(`"${item.text}" is new - opening…`);
  const newIssue = await callGitHub(token, `repos/${repo}/issues`, { method: 'POST', body: { title, body, labels: [labels, name] } });
  console.log(`"${item.text}" is new - opened: ${newIssue.html_url}`);
}

// Go over the unmatched issues and close them with a comment (to-do is no more)
for (const issue of issues) {
  // https://docs.github.com/en/actions/learn-github-actions/environment-variables#default-environment-variables
  const event = JSON.parse(await fs.promises.readFile(process.env.GITHUB_EVENT_PATH, 'utf-8'));
  const [messageTitle, ...messageLines] = (event.head_commit?.message ?? `commit ${sha}`).split('\n').filter(line => !!line);

  const body = `Removed in [${messageTitle}](${server}/${repo}/commit/${sha})${messageLines.length > 0 ? ':\n\n' : ''}${messageLines.map(line => '> ' + line).join('\n')}\n`;
  console.log(`"${issue.title}" is old - commenting…`);
  const comment = await callGitHub(token, `repos/${repo}/issues/${issue.number}/comments`, { method: 'POST', body: { body } });
  console.log(`"${issue.title}" is old - commented: ${comment.html_url}`);

  const state = 'closed';
  console.log(`"${issue.title}" is old - closing…`);
  await callGitHub(token, `repos/${repo}/issues/${issue.number}`, { method: 'PATCH', body: { state } });
  console.log(`"${issue.title}" is old - closed: ${issue.html_url}`);
}

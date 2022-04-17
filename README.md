# `TODO` Comments GitHub Issues GitHub Action

[todo]: https://github.com/tomashubelbauer/todo

This GitHub Actions action scans your repository's code base for to-do comments
using [todo] and sync them to GitHub Issues for the repository.

- New to-do comments open new issues
- Moved to-do comments (line number change) rename the issue
- Changed to-do comments (to-do text change) close old and open new issue
- Removed to-do comments close old issues with a comment

The issue body contains a permalink to the `TODO` comment line, making it a code
preview box. The closure comments references close commit and shows its message.

This action has no `inputs` or `outputs`.

[todo] supports a handful of to-do comment patterns, nothing more is supported.
This is not configurable.

The `GITHUB_TOKEN` workflow PAT is used to call the GitHub API. See more at:
https://docs.github.com/en/actions/security-guides/automatic-token-authentication
This is not configurable.

Issues maintained by this action are labeled `to-do`. This is not configurable.

## Usage

`.github/workflows/main.yml`:
```yml
name: main
on: push

jobs:
  main:
    runs-on: ubuntu-latest
    steps:
    - name: Sync to-do comments with GitHub Issues
      uses: tomashubelbauer/todo-comments-github-issues@main
```

You can see this in action (pun intended) in this GitHub repository:
https://github.com/TomasHubelbauer/todo-comments-github-issues-demo

I have not published this GitHub Action to the GitHub Marketplace.

## Development

1. Make a change here
2. Go to https://github.com/TomasHubelbauer/todo-comments-github-issues-demo/actions/workflows/main.yml
3. Click Run workflow

## Contributing

I am not likely to accept contributions unless they benefit my use-case.

Feel free to fork the action and adjust it to suit your needs.

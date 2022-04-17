# `TODO` Comments GitHub Issues GitHub Action

[`todo`]: https://github.com/tomashubelbauer/todo

This GitHub Actions action scans your repository's code base for `TODO` comments
using [`todo`] and syncs them to GitHub Issues of the repository.

- New `TODO` comment opens a new issues
- Moved `TODO` comment (line number change) renames the issue
- Edited `TODO` comment (text change) closes the old issue and opens a new issue
- Removed `TODO` comment closes the old issue with a comment

The issue body contains a permalink to the `TODO` line, making it a code preview
box. The closure comment references the associated commit and shows its message.

This action has no `inputs` or `outputs`.

[`todo`] supports a couple of `TODO` comment patterns, only those are supported.
This is not configurable.

The `GITHUB_TOKEN` workflow PAT is used to call the GitHub API. See more at:
https://docs.github.com/en/actions/security-guides/automatic-token-authentication
This is not configurable.

Issues maintained by this action are labeled `todo-comment`.
This is not configurable.

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
https://github.com/tomashubelbauer/todo-comments-github-issues-demo

I have not published this GitHub Action to the GitHub Marketplace.

## Development

1. Make a change here
2. Go to https://github.com/tomashubelbauer/todo-comments-github-issues-demo/actions/workflows/main.yml
3. Click Run workflow

## Contributing

I am not likely to accept contributions unless they benefit my use-case.

Feel free to fork this GitHub Action and adjust it to suit your needs.

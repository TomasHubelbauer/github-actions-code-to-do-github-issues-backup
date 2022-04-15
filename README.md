# GitHub Actions code to-do GitHub Issues backup

This GitHub Actions action scans your repository's code base for to-do comments
and sync them to GitHub Issues for the repository.

Previously unseen to-do comments open new issues. Comments moved within the file
leave the issue alone (assuming it is open). Changed comments close the previous
issue and open a new one. Removed comments close the abandoned issue.

This action has no inputs or outputs.

https://github.com/TomasHubelbauer/todo is used to scan for the to-do comments.
It supports a handful of recognized formats and nothing more is supported. This
is not configurable.

The built-in workflow personal access token is used to call the GitHub API to
manage the issues. See more at:
https://docs.github.com/en/actions/security-guides/automatic-token-authentication
This is not configurable.

Issues maintained by this action are labeled `to-do`. This is not configurable.

## Usage

Make sure you check out the repository (e.g. `actions/checkout`), otherwise the
action will have code to look for to-do comments in. GitHub Actions workflows do
not check out the repository contents by default.

`.github/workflows/main.yml`:
```yml
name: main
on: push

jobs:
  main:
    runs-on: ubuntu-latest
    steps:
    - name: Sync to-do comments with GitHub Issues
      uses: tomashubelbauer/github-actions-code-to-do-github-issues-backup@main
```

You can see this in action (pun intended) in this GitHub repository:
https://github.com/TomasHubelbauer/github-actions-code-to-do-github-issues-backup-demo

I have not published this GitHub Action to the GitHub Marketplace.

## Contributing

I am not likely to accept contributions to this action unless they benefit my
use-cases of it. Feel free to fork the action and adjust it to suit your needs.

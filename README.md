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

```yml
- name: 
  uses: tomashubelbauer/github-actions-code-to-do-github-issues-backup@v1
```

## Contributing

I am not likely to accept contributions to this action unless they benefit my
use-cases of it. Feel free to fork the action and adjust it to suit your needs.

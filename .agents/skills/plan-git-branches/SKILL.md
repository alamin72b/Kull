---
name: plan-git-branches
description: Turn a plain-language work description into a safe Git branching plan with a dev integration branch, a type-based task branch, push commands, and a GitHub CLI pull-request command with an appropriate title and description. Use when the user asks what branch to create, how to name a feature or fix branch, how to push work, or how to open a PR. Never create branches, push, or open PRs automatically.
---

# Plan Git Branches

Given the user's description of upcoming work, recommend a `dev` integration branch and a task branch, then provide copyable commands for branch setup, pushing, and opening a GitHub pull request.

## Workflow

1. Read the user's work description. If it is missing or too vague to distinguish a feature, fix, documentation change, refactor, test, build, CI, or maintenance task, ask for a short description before generating branch names.

2. Inspect the repository without changing Git state. Show each command and its relevant output:

   ```bash
   git rev-parse --show-toplevel
   git branch --show-current
   git branch -a
   git remote -v
   git status --short --untracked-files=all
   ```

   When a local `dev` branch exists and the current branch is not `dev`, also compare branch ancestry and commits before recommending a new task branch:

   ```bash
   git log --oneline --decorate dev..HEAD
   git diff --stat dev...HEAD
   git merge-base --is-ancestor HEAD dev
   ```

   Interpret the results as follows: an empty `dev..HEAD` log means there are no commits unique to the current branch; a non-empty log means the current branch contains work not integrated into `dev`; and a successful `merge-base --is-ancestor HEAD dev` means the current branch is already contained in `dev`. The symmetric `dev...HEAD` diff is a summary of the complete branch divergence, including committed changes that would otherwise be missed by `git status`.

   If an `origin` remote is configured and remote lookup is useful, check whether the remote `dev` branch exists:

   ```bash
   git ls-remote --heads origin dev
   ```

   Do not hide command errors. If output is large, show the relevant portion and state what was omitted. Never expose credentials or tokens from command output.

3. Establish the branch state:

   - Treat `dev` as the integration and PR base branch.
   - Identify the repository's mainline branch from the current branch, remote HEAD, or an existing `main`/`master` branch. Prefer `main` when it exists.
   - If local `dev` exists, recommend switching to it rather than recreating it.
   - If only remote `origin/dev` exists, recommend creating a local tracking branch from it.
   - If `dev` does not exist, recommend creating it from the identified mainline branch.
   - If the working tree is dirty, warn before any branch-switching command because uncommitted changes may carry over or block switching. Do not suggest discarding, stashing, resetting, or cleaning unless the user explicitly asks.
   - If the current branch has commits not contained in `dev`, do not present ordinary `git switch dev` / `git switch -c ...` setup as if it were safe. Clearly state that the current work must first be integrated into `dev` through the user's normal commit/PR/merge workflow, or that the new task must intentionally branch from the current branch if it depends on it. Never invent or automatically run a merge command.
   - If the current branch is already contained in `dev`, state that explicitly and continue with the normal task-branch setup.

4. Convert the work description into a task branch:

   - `feat/<kebab-case-slug>` for a new capability;
   - `fix/<kebab-case-slug>` for a bug correction;
   - `docs/<kebab-case-slug>` for documentation;
   - `refactor/<kebab-case-slug>` for behavior-preserving restructuring;
   - `test/<kebab-case-slug>` for tests;
   - `build/<kebab-case-slug>` for build or dependency tooling;
   - `ci/<kebab-case-slug>` for CI changes;
   - `chore/<kebab-case-slug>` for other maintenance.

   Keep the slug lowercase, concise, imperative or noun-based, and free of spaces, punctuation, and implementation details that are not in the user's description. Do not invent issue numbers.

5. Generate commands only; do not execute them. Use the appropriate setup path:

   - If local `dev` exists and the current branch is clean and contains no commits outside `dev`:

     ```bash
     git switch dev
     git switch -c <type>/<slug>
     ```

   - If the current branch has commits outside `dev`, provide an integration warning instead of suggesting that the new task branch be created from `dev` immediately. The setup commands for the new task branch should be deferred until the user integrates the current branch; do not include merge, commit, push, stash, or reset commands unless the user separately requests those commands.

   - If only `origin/dev` exists:

     ```bash
     git switch --track -c dev origin/dev
     git switch -c <type>/<slug>
     ```

   - If `dev` does not exist:

     ```bash
     git switch <mainline-branch>
     git switch -c dev
     git push -u origin dev
     git switch -c <type>/<slug>
     ```

   Do not include `git pull`, force-push, reset, clean, or stash commands by default. If the repository has no `origin` remote, replace the push command with a clearly marked placeholder and explain that a remote must be configured first.

6. Generate the push command for the task branch:

   ```bash
   git push -u origin <type>/<slug>
   ```

   Generate a GitHub CLI PR command targeting `dev`:

   ```bash
   gh pr create \
     --base dev \
     --head <type>/<slug> \
     --title "<type>: <concise PR title>" \
     --body "## Summary
   - <what the work changes>

   ## Changes
   - <implementation area or expected outcome>

   ## Testing
   - Not run yet"
   ```

   Use the user's work description for the title and body. Do not claim tests were run, files were changed, or behavior was verified unless the user provided that information or it was observed during inspection. If `gh` is unavailable or GitHub authentication is unknown, state that the user must install/authenticate GitHub CLI before running the PR command.

7. Explain the plan briefly and clearly:

   - why `dev` is the base branch;
   - why the task branch type and name match the work;
   - why the PR title and description represent the requested change;
   - what repository-state warning, if any, affects the commands.

## Response Format

Return the following sections:

```text
## Work interpretation
<one-sentence interpretation>

## Git inspection
$ <command>
<relevant output>

## Recommended branches
- Integration: dev
- Task: <type>/<slug>
- PR base: dev

## Branch setup commands
<conditional commands for the detected repository state>

## Push command
git push -u origin <type>/<slug>

## PR command
gh pr create ...

## Why this plan
- Branch model: <reason>
- Task branch: <reason>
- PR title and description: <reason>
- Warnings: <dirty tree, remote, or CLI warning; otherwise none>
```

## Guardrails

- Never run `git switch`, `git checkout`, `git branch`, `git push`, `gh pr create`, or another state-changing command as part of this skill.
- Never overwrite, delete, rename, or force-update an existing branch.
- Never assume `dev` is the GitHub default branch; treat it as the intended integration and PR base branch only.
- Never suggest working directly on `main` or `dev` when a task branch is appropriate.
- Never include secrets, credentials, or tokens in branch names, PR titles, descriptions, or displayed output.
- If the work description contains multiple unrelated tasks, recommend separate task branches and PRs rather than one broad branch.
- If there are uncommitted changes, explain that branch setup may be blocked and let the user decide how to handle them.

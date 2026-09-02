---
name: plan-git-branches
description: Turn a plain-language work description into a safe Git branching plan with a dev integration branch, a type-based task branch, the commands needed to push or sync any existing work into dev first, and a GitHub CLI pull-request command with an appropriate title and description. Use when the user asks what branch to create, how to name a feature or fix branch, how to push or sync work into dev, or how to open a PR. Never create branches, push, merge, or open PRs automatically.
---

# Plan Git Branches

Given the user's description of upcoming work, inspect the repository, get any existing work safely into `dev`, and recommend a task branch for the new work — then provide copyable commands for syncing, branch setup, pushing, and opening a GitHub pull request.

## Workflow

1. Read the user's work description. If it is missing or too vague to distinguish a feature, fix, documentation change, refactor, test, build, CI, or maintenance task, ask for a short description before generating branch names.

2. Inspect the repository without changing Git state. Show each command and its relevant output:

   ```bash
   git rev-parse --show-toplevel
   git branch --show-current
   git branch -a
   git remote -v
   git status --short --branch --untracked-files=all
   ```

   Read the `## <branch>...origin/<branch> [ahead N, behind M]` header line from `git status`:
   - No `...origin/<branch>` segment means the current branch has no upstream yet — a push needs `-u`.
   - `ahead N` with nothing else listed means there are committed-but-unpushed commits — push, no commit needed.
   - Any file entries below the header mean the tree is dirty — resolve those before pushing.

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

   Then classify the current branch into exactly one of these cases before proposing any command:

   - **Case A — on `dev`, dirty with required baseline changes.** Inspect the dirty diff and classify each changed path. Treat required repository-baseline changes — such as `.gitignore`, shared configuration, migration metadata, skill instructions, or other files needed to keep the repository consistent — as prerequisite work. Never use `git add .` when unrelated changes are present; list exact paths. Keep unrelated, generated, cache, or uncertain changes out of the commit and explicitly call them out for separate handling — do not recommend deleting them or silently include them. Explain that creating the task branch before publishing the prerequisite can leave `dev` incomplete or cause later branches to diverge from the intended root.

   - **Case B — on `dev`, clean tree but ahead of `origin/dev`.** Nothing to commit, but local `dev` has commits `origin/dev` doesn't have yet. A push alone is enough.

   - **Case C — on `dev`, clean and in sync with `origin/dev`.** No push or merge needed. Go straight to naming the new task branch.

   - **Case D — on another branch that has commits not in `dev`.** That work must be preserved and integrated before anything new starts: push the current branch first (so it's safe on the remote even before it lands on `dev`), merge it into `dev`, push the updated `dev`, and only then name the new task branch. If the tree is dirty, state that uncommitted changes must be handled before this sequence can safely run — do not invent stash, reset, clean, or discard commands.

   - **Case E — on another branch that's already fully contained in `dev`.** State that explicitly — nothing to push or merge — and go straight to naming the new task branch from `dev`.

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

5. Generate commands only; do not execute them. Match the case identified in step 3:

   - **Case C** — clean, already in sync:

     ```bash
     git switch -c <type>/<slug>
     ```

     Only add a leading `git switch dev` if the current branch isn't already `dev`.

   - **Case B** — clean, ahead of `origin/dev`:

     ```bash
     git push origin dev
     git switch -c <type>/<slug>
     ```

   - **Case A** — dirty `dev` with required baseline changes, using only the exact prerequisite paths:

     ```bash
     git add <prerequisite-file-1> <prerequisite-file-2>
     git commit -m "<conventional prerequisite message>"
     git push origin dev
     git switch -c <type>/<slug>
     ```

     State that the task-branch command is valid only after the commit and push succeed.

   - **Case D** — another branch with commits not in `dev`, in this exact order:

     ```bash
     git push -u origin <current-branch>
     git switch dev
     git merge <current-branch>
     git push origin dev
     git switch -c <type>/<slug>
     ```

     Drop `-u` from the first line if `git status --branch` already showed an upstream for `<current-branch>`. Label the final command as valid only after the push and merge above succeed. Do not add commit, stash, reset, or clean commands to this sequence unless the user separately requests them. If `git push origin dev` is rejected because `origin/dev` has moved, do not force-push — tell the user to reconcile manually.

   - **Case E** — another branch already merged into `dev`:

     ```bash
     git switch dev
     git switch -c <type>/<slug>
     ```

   - If only `origin/dev` exists (no local `dev`):

     ```bash
     git switch --track -c dev origin/dev
     git switch -c <type>/<slug>
     ```

   - If `dev` does not exist at all:

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
   - why any push, commit, or merge step was required before the task branch could be created;
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
<conditional commands for the detected case (A/B/C/D/E) from the workflow>

- Case D: push the current branch, merge it into `dev`, push `dev`, then the new task branch — in that order.
- Case A: the scoped add, commit, and push commands, then the new task branch.
- Case B: `git push origin dev`, then the new task branch.
- Case C or E: only the new task branch (plus a leading `git switch dev` in Case E).

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

- Never run `git switch`, `git checkout`, `git branch`, `git push`, `git merge`, `gh pr create`, or another state-changing command as part of this skill.
- Never overwrite, delete, rename, or force-update an existing branch.
- Never assume `dev` is the GitHub default branch; treat it as the intended integration and PR base branch only.
- Always use `dev` as the root for new task branches. If the current branch contains commits outside `dev`, always push that branch first, then merge it into `dev`, then push the updated `dev` — and only then provide the command to create the new task branch.
- Before creating a task branch from a dirty `dev`, always classify the diff. Required baseline changes must be committed and pushed to `dev` first with exact file paths; unrelated or generated changes must not be included.
- If a push to `dev` or any other branch is rejected because the remote has moved ahead, never suggest a force-push — tell the user to reconcile manually.
- Never suggest working directly on `main` or `dev` when a task branch is appropriate.
- Never include secrets, credentials, or tokens in branch names, PR titles, descriptions, or displayed output.
- If the work description contains multiple unrelated tasks, recommend separate task branches and PRs rather than one broad branch.
- If there are uncommitted changes, explain that branch setup may be blocked and let the user decide how to handle them.
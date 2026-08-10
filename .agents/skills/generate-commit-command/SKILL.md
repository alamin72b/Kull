---
name: generate-commit-command
description: Inspect all non-ignored Git changes, show the read-only Git commands and relevant outputs, explain the recommendation in plain language, and provide a ready-to-copy command that stages all non-ignored work and commits it with both a brief and a description. Use when the user asks for a commit message, commit command, Git change summary, or help committing current repository work. Never execute the generated commands automatically.
---

# Generate Commit Command

Inspect the repository's complete non-ignored working state and suggest one concise Conventional Commit command.

## Workflow

1. Confirm the repository root and collect the full change set without changing Git state. For every command you run, show the exact command and its relevant output to the user. Use a labeled block such as:

   ```text
   $ git status --short --untracked-files=all
   <relevant output>
   ```

   Show complete output when it is reasonably sized. For a very large diff or file, show the useful beginning/summary, state exactly that the output was truncated, and explain how many lines/files were omitted. Do not hide a command's failure; show the error and adapt or stop if the result is required.

   Collect the full change set with:

   ```bash
   git rev-parse --show-toplevel
   git status --short --untracked-files=all
   git diff --stat
   git diff --cached --stat
   git diff
   git diff --cached
   git ls-files --others --exclude-standard -z
   ```

2. Inspect every untracked file reported by `git ls-files`, including enough content to understand its purpose. Show the file inspection command and relevant output for each file or clearly grouped batch. Check file type first; summarize binary files from their names and metadata rather than attempting to print binary data. Do not include ignored files.

3. Use recent commits only as a style signal when useful, and show the command and output if you use it:

   ```bash
   git log -8 --oneline
   ```

4. Infer the dominant purpose of the complete change set from the displayed status, diff, file contents, and optionally recent commit style. Choose the most specific Conventional Commit type:

   - `feat`: adds user-visible or functional capability
   - `fix`: corrects incorrect behavior
   - `docs`: documentation-only changes
   - `refactor`: behavior-preserving code restructuring
   - `test`: tests without a product change
   - `chore`: maintenance, configuration, or dependency work
   - `build`: build-system or package/build tooling changes
   - `ci`: continuous-integration configuration changes

   Add a scope only when the affected area is obvious. Use an imperative, lowercase subject of roughly 50 characters or fewer; avoid a trailing period. If changes have unrelated purposes, call that out and suggest splitting them rather than inventing one misleading message.

5. Explain the recommendation in simple, plain language. Assume the user may not know Conventional Commit terminology. Tie every conclusion to observable evidence from the displayed Git output:

   - `What changed`: describe the work in ordinary language.
   - `Commit type`: name the selected type and explain what that type means here.
   - `Brief`: explain what the short subject says.
   - `Description`: explain what the longer commit body adds.
   - `Why this fits`: connect the recommendation to specific files, status entries, diff sections, or history patterns.
   - `Alternatives`: mention another type only when it was genuinely plausible and explain why it was not selected.

6. Generate one complete, uninterrupted, single-line command that includes all non-ignored work:

   ```bash
   git add -A && git commit -m "<type>[optional scope]: <brief subject>" -m "<clear description of what changed and why>"
   ```

   `git add -A` stages all non-ignored tracked, modified, deleted, and untracked files. Ignored files remain excluded. The first `-m` contains the short Conventional Commit subject; the second contains a clear one-sentence description.

   Chat interfaces may insert hard line breaks when users copy long commands. Generate the command with explicit shell continuations so it remains copy-safe:

   ```bash
   git add -A && git commit \
     -m "<type>[optional scope]: <brief subject>" \
     -m "<clear description of what changed and why>"
   ```

   Put a backslash as the final character on every continued line. Never insert line breaks inside either quoted message. Keep the brief imperative and lowercase, normally under 50 characters after the type/scope. Keep the description specific and easy to understand. Do not repeat the brief without adding useful context.

   Add this warning immediately before the command: `Copy all lines exactly, including the trailing backslashes. Do not remove the backslashes; they tell the shell that the command continues on the next line.` Never output a standalone `git commit -m` line.

7. Return the result using this format:

   ```text
   ## Git inspection
   $ <command>
   <relevant output>

   ...

   ## What changed
   <plain-language summary>

   ## Commit type
   <type> — <what this type means and why it fits>

   ## Brief
   <type>[optional scope]: <imperative subject>

   ## Description
   <clear description of what changed and why>

   ## Why this fits
   <plain-language explanation connected to the inspected files and Git output>

   ## What the command does
   - `git add -A`: stages all non-ignored current work, including untracked files.
   - `git commit`: creates the commit from the staged files.
   - First `-m`: contains the short brief.
   - Second `-m`: contains the longer description.

   ## Commit command
   <copy-safe shell command using trailing backslashes for continuation>
   ```

   If changes have unrelated purposes, explain that this command intentionally includes all current work in one commit, then optionally provide separate staging/commit commands for recommended split commits. The all-in-one command must remain available because it is the default requested workflow.

## Guardrails

- Never execute `git add`, `git commit`, `git reset`, checkout, clean, or any other state-changing Git command as part of this skill; only print the commands for the user to run.
- Never assume that a file is part of the change solely from its filename; inspect the diff or file content when available.
- Do not expose secrets, credentials, tokens, or private file contents in the response. Redact sensitive values in displayed command output, mention that redaction occurred, and recommend review if detected.
- Do not display unbounded output. Keep command output relevant and readable; when truncating, report what was omitted rather than implying the displayed excerpt is complete.
- If there are no non-ignored changes, say `No non-ignored Git changes found; no commit command generated.`
- If the repository state is ambiguous or the diff contains unrelated work, explain the ambiguity briefly and provide the safest concise recommendation.

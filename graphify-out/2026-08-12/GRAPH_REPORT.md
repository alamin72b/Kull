# Graph Report - Kull  (2026-08-12)

## Corpus Check
- 66 files · ~16,426 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 512 nodes · 629 edges · 33 communities (26 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1784e485`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ActivitiesService
- Activity
- devDependencies
- dependencies
- contracts/package.json
- DebugNotesService
- tasks
- compilerOptions
- devDependencies
- scripts
- compilerOptions
- scripts
- CreateDebugNoteDto
- exclude
- What You Must Do When Invoked
- debug-note.ts
- compilerOptions
- nest-cli.json
- QueryDebugNotesDto
- web/eslint.config.mjs
- next-env.d.ts
- graphify reference: extra exports and benchmark
- graphify reference: query, path, explain
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- AGENTS.md
- extraction-spec.md
- README.md

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 22 edges
2. `Activity` - 22 edges
3. `ActivitiesService` - 18 edges
4. `DebugNotesService` - 16 edges
5. `compilerOptions` - 16 edges
6. `scripts` - 12 edges
7. `What You Must Do When Invoked` - 12 edges
8. `CreateActivityDto` - 11 edges
9. `PrismaService` - 10 edges
10. `CreateDebugNoteDto` - 10 edges

## Surprising Connections (you probably didn't know these)
- `ActivityCardProps` --references--> `Activity`  [EXTRACTED]
  apps/web/src/features/activities/components/activity-card.tsx → packages/contracts/src/activity.ts
- `ActivityListProps` --references--> `Activity`  [EXTRACTED]
  apps/web/src/features/activities/components/activity-list.tsx → packages/contracts/src/activity.ts
- `ActivityFormProps` --references--> `Activity`  [EXTRACTED]
  apps/web/src/features/activities/components/activity-form.tsx → packages/contracts/src/activity.ts
- `ActivityFormProps` --references--> `ActivityInput`  [EXTRACTED]
  apps/web/src/features/activities/components/activity-form.tsx → packages/contracts/src/activity.ts
- `ActivityDashboard()` --indirect_call--> `getToday()`  [INFERRED]
  apps/web/src/features/activities/components/activity-dashboard.tsx → apps/web/src/features/activities/utils/date.ts

## Import Cycles
- None detected.

## Communities (33 total, 7 thin omitted)

### Community 0 - "ActivitiesService"
Cohesion: 0.09
Nodes (21): ActivitiesController, Controller, ActivitiesService, Injectable, CreateActivityDto, IsOptional, IsString, Matches (+13 more)

### Community 1 - "Activity"
Cohesion: 0.12
Nodes (29): AppHeader(), ApiErrorBody, createActivity(), deleteActivity(), getActivities(), request(), updateActivity(), ActivityCard() (+21 more)

### Community 2 - "devDependencies"
Cohesion: 0.04
Nodes (47): devDependencies, eslint, eslint-config-prettier, @eslint/eslintrc, @eslint/js, eslint-plugin-prettier, globals, @nestjs/cli (+39 more)

### Community 3 - "dependencies"
Cohesion: 0.06
Nodes (31): dependencies, class-transformer, class-validator, dotenv, @kull/contracts, multer, @nestjs/common, @nestjs/config (+23 more)

### Community 4 - "contracts/package.json"
Cohesion: 0.18
Nodes (10): devDependencies, typescript, exports, typescript, name, private, scripts, typecheck (+2 more)

### Community 5 - "DebugNotesService"
Cohesion: 0.05
Nodes (22): ActivitiesModule, Module, AppModule, Module, PrismaModule, Module, PrismaService, Injectable (+14 more)

### Community 6 - "tasks"
Cohesion: 0.08
Nodes (20): nextConfig, metadata, ^build, ^lint, .next/**, !.next/cache/**, ^typecheck, dependsOn (+12 more)

### Community 7 - "compilerOptions"
Cohesion: 0.09
Nodes (22): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+14 more)

### Community 8 - "devDependencies"
Cohesion: 0.06
Nodes (33): dependencies, @kull/contracts, lucide-react, next, react, react-dom, devDependencies, eslint (+25 more)

### Community 9 - "scripts"
Cohesion: 0.10
Nodes (19): devDependencies, turbo, engines, node, turbo, name, packageManager, private (+11 more)

### Community 10 - "compilerOptions"
Cohesion: 0.07
Nodes (28): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+20 more)

### Community 11 - "scripts"
Cohesion: 0.11
Nodes (17): description, license, name, private, scripts, build, dev, lint (+9 more)

### Community 12 - "CreateDebugNoteDto"
Cohesion: 0.12
Nodes (14): CreateDebugNoteDto, TransformValue, IsEnum, IsOptional, IsString, MaxLength, Transform, IsOptional (+6 more)

### Community 13 - "exclude"
Cohesion: 0.25
Nodes (7): exclude, extends, dist, node_modules, **/*spec.ts, test, ./tsconfig.json

### Community 14 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 15 - "debug-note.ts"
Cohesion: 0.17
Nodes (11): DEBUG_NOTE_SEVERITIES, DEBUG_NOTE_SEVERITY_LABELS, DEBUG_NOTE_STATUS_LABELS, DEBUG_NOTE_STATUSES, DebugNote, DebugNoteSeverity, DebugNotesQuery, DebugNotesResponse (+3 more)

### Community 16 - "compilerOptions"
Cohesion: 0.20
Nodes (9): compilerOptions, module, moduleResolution, noEmit, skipLibCheck, strict, target, include (+1 more)

### Community 17 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 18 - "QueryDebugNotesDto"
Cohesion: 0.15
Nodes (11): QueryDebugNotesDto, TransformValue, IsEnum, IsOptional, IsString, MaxLength, Transform, IsInt (+3 more)

### Community 23 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 24 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 25 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 26 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 27 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

## Knowledge Gaps
- **231 isolated node(s):** `$schema`, `collection`, `sourceRoot`, `deleteOutDir`, `name` (+226 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Activity` connect `Activity` to `ActivitiesService`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `scripts`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `scripts`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `$schema`, `collection`, `sourceRoot` to the rest of the system?**
  _231 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ActivitiesService` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `Activity` be split into smaller, more focused modules?**
  _Cohesion score 0.11522198731501057 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
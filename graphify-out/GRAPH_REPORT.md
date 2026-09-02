# Graph Report - Kull  (2026-09-02)

## Corpus Check
- 122 files · ~34,825 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 893 nodes · 1513 edges · 62 communities (41 shown, 21 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 41 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `34a96586`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- PrismaService
- activity-dashboard.tsx
- devDependencies
- dependencies
- contracts/package.json
- Activity
- app/page.tsx
- compilerOptions
- devDependencies
- scripts
- compilerOptions
- scripts
- debug-notes.service.ts
- exclude
- What You Must Do When Invoked
- index.ts
- compilerOptions
- nest-cli.json
- DebugNotesService
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
- app.module.ts
- DebugNotesController
- QueryDebugNotesDto
- activity-auth.guard.ts
- MedicineTransactionsService
- DriveService
- AuthController
- CreateDebugNoteDto
- AuthService
- isProductionEnvironment
- important-documents/page.tsx
- api/package.json
- .update
- class-transformer
- medicine-transactions.api.ts
- class-validator
- cookie-parser
- dotenv
- googleapis
- multer
- @nestjs/common
- @nestjs/core
- bcryptjs
- reflect-metadata
- rxjs
- important-documents.controller.ts
- @nestjs/config

## God Nodes (most connected - your core abstractions)
1. `DebugNotesService` - 24 edges
2. `DriveService` - 24 edges
3. `compilerOptions` - 22 edges
4. `Activity` - 22 edges
5. `ActivitiesService` - 18 edges
6. `PrismaService` - 18 edges
7. `ImportantDocumentsService` - 18 edges
8. `MedicineTransactionsService` - 17 edges
9. `compilerOptions` - 16 edges
10. `AuthService` - 15 edges

## Surprising Connections (you probably didn't know these)
- `ActivityCardProps` --references--> `Activity`  [EXTRACTED]
  apps/web/src/features/activities/components/activity-card.tsx → packages/contracts/src/activity.ts
- `ActivityListProps` --references--> `Activity`  [EXTRACTED]
  apps/web/src/features/activities/components/activity-list.tsx → packages/contracts/src/activity.ts
- `ActivityFormProps` --references--> `Activity`  [EXTRACTED]
  apps/web/src/features/activities/components/activity-form.tsx → packages/contracts/src/activity.ts
- `ActivityFormProps` --references--> `ActivityInput`  [EXTRACTED]
  apps/web/src/features/activities/components/activity-form.tsx → packages/contracts/src/activity.ts
- `FormState` --references--> `DebugNoteSeverity`  [EXTRACTED]
  apps/web/src/features/debug-notes/components/DebugNoteForm.tsx → packages/contracts/src/debug-note.ts

## Import Cycles
- None detected.

## Communities (62 total, 21 thin omitted)

### Community 0 - "PrismaService"
Cohesion: 0.14
Nodes (6): ActivityUser, PrismaService, Injectable, DRIVE_SCOPES, FolderResolution, IMPORTANT:

### Community 1 - "activity-dashboard.tsx"
Cohesion: 0.10
Nodes (31): checkResponse(), createActivity(), deleteActivity(), getActivities(), getApiUrl(), getErrorMessage(), request(), updateActivity() (+23 more)

### Community 2 - "devDependencies"
Cohesion: 0.04
Nodes (49): devDependencies, eslint, eslint-config-prettier, @eslint/eslintrc, @eslint/js, eslint-plugin-prettier, globals, @nestjs/cli (+41 more)

### Community 3 - "dependencies"
Cohesion: 0.15
Nodes (13): dependencies, @kull/contracts, @nestjs/mapped-types, @nestjs/platform-express, pg, @prisma/adapter-pg, @prisma/client, @kull/contracts (+5 more)

### Community 4 - "contracts/package.json"
Cohesion: 0.17
Nodes (11): devDependencies, typescript, exports, ./debug-note, typescript, name, private, scripts (+3 more)

### Community 5 - "Activity"
Cohesion: 0.10
Nodes (24): ActivitiesController, Body, Controller, Delete, Get, HttpCode, Param, Patch (+16 more)

### Community 6 - "app/page.tsx"
Cohesion: 0.06
Nodes (25): nextConfig, metadata, Tool, tools, metadata, metadata, AppHeader(), ^build (+17 more)

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
Cohesion: 0.17
Nodes (12): scripts, build, dev, lint, prisma:generate, prisma:migrate, prisma:studio, start (+4 more)

### Community 12 - "debug-notes.service.ts"
Cohesion: 0.14
Nodes (12): DEBUG_NOTE_UPLOAD_DIRECTORY, debugNoteUploadOptions, extensionByMimeType, debugNoteInclude, DebugNoteWithRelations, ParsedTag, TransformValue, TransformValue (+4 more)

### Community 13 - "exclude"
Cohesion: 0.25
Nodes (7): exclude, extends, dist, node_modules, **/*spec.ts, test, ./tsconfig.json

### Community 14 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 15 - "index.ts"
Cohesion: 0.08
Nodes (42): EditDebugNotePage(), DebugNotePage(), formatDate(), DebugNotesPage(), first(), paginationUrl(), SearchParameters, SeverityBadge() (+34 more)

### Community 16 - "compilerOptions"
Cohesion: 0.20
Nodes (9): compilerOptions, module, moduleResolution, noEmit, skipLibCheck, strict, target, include (+1 more)

### Community 17 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

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

### Community 33 - "app.module.ts"
Cohesion: 0.22
Nodes (13): ActivitiesModule, Module, AuthModule, Module, PrismaModule, Module, DriveModule, Module (+5 more)

### Community 35 - "DebugNotesController"
Cohesion: 0.16
Nodes (8): DebugNotesController, Controller, Delete, Get, HttpCode, Param, DebugNotesModule, Module

### Community 36 - "QueryDebugNotesDto"
Cohesion: 0.17
Nodes (11): Query, QueryDebugNotesDto, IsEnum, IsInt, IsOptional, IsString, Max, MaxLength (+3 more)

### Community 37 - "activity-auth.guard.ts"
Cohesion: 0.29
Nodes (6): ActivityAuthGuard, Injectable, GOOGLE_NONCE_COOKIE, GOOGLE_STATE_COOKIE, KULL_SESSION_COOKIE, RequestWithSignedCookies

### Community 38 - "MedicineTransactionsService"
Cohesion: 0.08
Nodes (25): CreateMedicineTransactionDto, MedicineTransactionItemDto, IsString, Matches, MaxLength, MinLength, Transform, Type (+17 more)

### Community 39 - "DriveService"
Cohesion: 0.07
Nodes (24): DriveController, Body, Controller, Get, Post, Query, Req, Res (+16 more)

### Community 40 - "AuthController"
Cohesion: 0.19
Nodes (8): AuthController, Controller, Get, Post, Query, Req, Res, UseGuards

### Community 41 - "CreateDebugNoteDto"
Cohesion: 0.22
Nodes (9): CreateDebugNoteDto, IsEnum, IsIn, IsOptional, IsString, MaxLength, MinLength, Transform (+1 more)

### Community 43 - "isProductionEnvironment"
Cohesion: 0.40
Nodes (4): AppModule, Module, isProductionEnvironment(), bootstrap()

### Community 44 - "important-documents/page.tsx"
Cohesion: 0.16
Nodes (26): DriveUploadPage(), displayDate(), displaySize(), ImportantDocumentsPage(), checkDrivePath(), checkResponse(), connectGoogleDrive(), getDriveStatus() (+18 more)

### Community 45 - "api/package.json"
Cohesion: 0.33
Nodes (5): description, license, name, private, version

### Community 46 - ".update"
Cohesion: 0.38
Nodes (5): Body, Patch, Post, UseInterceptors, UploadedFiles

### Community 48 - "medicine-transactions.api.ts"
Cohesion: 0.13
Nodes (28): EditMedicineTransactionPage(), formatDate(), formatDifference(), formatMoney(), getResultClass(), getResultText(), MedicineTransactionPage(), NewMedicineTransactionPage() (+20 more)

### Community 59 - "important-documents.controller.ts"
Cohesion: 0.06
Nodes (38): AuthenticatedRequest, CheckRootFolderDto, IsString, MaxLength, MinLength, ListImportantDocumentsDto, IsIn, IsInt (+30 more)

## Knowledge Gaps
- **240 isolated node(s):** `$schema`, `collection`, `sourceRoot`, `deleteOutDir`, `name` (+235 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PrismaService` connect `PrismaService` to `app.module.ts`, `activity-auth.guard.ts`, `Activity`, `DriveService`, `MedicineTransactionsService`, `debug-notes.service.ts`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `Activity` connect `Activity` to `activity-dashboard.tsx`, `index.ts`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **What connects `$schema`, `collection`, `sourceRoot` to the rest of the system?**
  _240 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `PrismaService` be split into smaller, more focused modules?**
  _Cohesion score 0.14166666666666666 - nodes in this community are weakly interconnected._
- **Should `activity-dashboard.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09797979797979799 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.04081632653061224 - nodes in this community are weakly interconnected._
- **Should `Activity` be split into smaller, more focused modules?**
  _Cohesion score 0.09620721554116558 - nodes in this community are weakly interconnected._
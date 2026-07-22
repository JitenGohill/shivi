# Scaffold Single Wedding App Shell

## What to build

Create the application foundation for the single-Wedding planning app. The completed slice should provide a running app shell, one seeded or create-on-first-run Wedding, primary navigation, an empty-but-real Dashboard, persistence for the Wedding record, and smoke coverage proving the shell loads.

This slice should respect ADR-0001: the app is intentionally scoped to one specific Wedding for v1. Do not introduce multi-wedding workspaces, tenant switching, public signup, or self-serve wedding creation.

## Acceptance criteria

- [ ] A user can open the app and land on a Dashboard for the single Wedding.
- [ ] The app has a persistent Wedding record with basic editable identity/details appropriate for the planning workspace.
- [ ] Primary navigation exists for the major planning areas expected by later slices, even if most destinations are empty placeholders.
- [ ] There is no multi-Wedding picker, workspace creation, or tenant-switching UI.
- [ ] Smoke tests verify the app starts and the Dashboard renders for the single Wedding.

## Blocked by

None - can start immediately

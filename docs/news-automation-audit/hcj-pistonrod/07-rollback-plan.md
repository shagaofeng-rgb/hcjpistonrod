# Rollback Plan

## Baseline

- Git baseline: `pre-news-unification-audit-20260811-1125` (`a501f09`).
- Logical database backup: `backups/hcj-admin-logical-20260811T033928032Z.json`.
- Existing production data is not to be deleted by the migration.

## Rollback order

1. Disable the new News runtime through its explicit feature flag. This stops only News automation; it does not alter public content.
2. Redeploy the recorded Git baseline only after production deployment authority is provided.
3. Apply the compensating migration supplied with the new additive database migration. It restores prior defaults and drops only newly added indexes, tables and columns after their data has been exported to the logical backup.
4. If an individual new publication must be reversed, set the linked News article to `draft`, preserve its audit and delivery records, and revalidate its News paths. Do not delete the source/candidate history.
5. If a historical record was accidentally changed, restore only that row from the logical backup, preserving later audit events.

## Safety constraints

- Never run destructive bulk deletion against `news_articles` or Blog records.
- Never delete a candidate, run, publication or delivery audit record during rollback.
- Never change an existing historical publication date merely to satisfy a new automation window.
- Keep database changes additive and transactional wherever supported by PostgreSQL.

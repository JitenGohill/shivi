# Supabase Persistence and Free-Plan Activity

We will use Supabase as the persistence layer for v1: Supabase Postgres for planning records, Supabase Auth for invited Collaborator access, and Supabase Storage for uploaded Documents.

The app may run on the Supabase Free plan during early development and personal use. Free projects can be paused for low activity, so the implementation must include a lightweight daily Postgres heartbeat when the deployment is configured for the Free plan. The heartbeat should perform real database activity, such as updating a single `app_heartbeats.last_seen_at` row. An Edge Function that only returns "hello world" is not enough because it may not count as user database activity.

Supabase Pro is the only accepted option when the requirement is guaranteed no automatic inactivity pausing. The Free-plan heartbeat is a best-effort measure to keep costs at zero while the app is small.

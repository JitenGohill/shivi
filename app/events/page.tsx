import Link from "next/link";
import { getCurrentCollaborator } from "@/app/access-session";
import { createEventAction, updateEventAction } from "@/app/actions";
import { canPerform, invitationCanAccessWedding } from "@/lib/collaborators";
import { getCollaboratorRoster } from "@/lib/collaborator-store";
import { calculateEventProgress } from "@/lib/events-and-tasks";
import { getPlanningData } from "@/lib/planning-store";
import { getWedding } from "@/lib/wedding-store";

export default async function EventsPage() {
  const [wedding, currentCollaborator, roster, planningData] = await Promise.all([
    getWedding(),
    getCurrentCollaborator(),
    getCollaboratorRoster(),
    getPlanningData()
  ]);
  const acceptedCollaborators = roster.collaborators.filter(invitationCanAccessWedding);
  const collaboratorById = new Map(
    acceptedCollaborators.map((collaborator) => [collaborator.id, collaborator])
  );
  const canCreate = canPerform(currentCollaborator.role, "createPlanningRecord");
  const canEdit = canPerform(currentCollaborator.role, "editPlanningRecord");
  const eventProgress = calculateEventProgress(
    planningData.events,
    planningData.tasks
  );

  return (
    <div className="page-stack">
      <header className="page-header compact">
        <div>
          <p className="eyebrow">{wedding.name}</p>
          <h1>Events</h1>
          <p className="lede">
            Create multi-event wedding gatherings, assign Leads, and track
            Event Progress from linked Tasks.
          </p>
        </div>
        <Link className="secondary-link" href="/tasks">
          Open Tasks
        </Link>
      </header>

      {canCreate ? (
        <section className="section-band" aria-labelledby="create-event-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Planner loop</p>
              <h2 id="create-event-heading">Create Event</h2>
            </div>
          </div>

          <form action={createEventAction} className="details-form">
            <label>
              Event name
              <input name="name" required placeholder="Sangeet" />
            </label>
            <label>
              Date
              <input name="date" type="date" required />
            </label>
            <label>
              Location
              <input name="location" required placeholder="Venue or family home" />
            </label>
            <label>
              Lead
              <select name="leadId" defaultValue={currentCollaborator.id}>
                {acceptedCollaborators.map((collaborator) => (
                  <option value={collaborator.id} key={collaborator.id}>
                    {collaborator.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="full-width">
              Notes
              <textarea name="notes" rows={3} />
            </label>
            <button type="submit">Create Event</button>
          </form>
        </section>
      ) : (
        <section className="empty-state" aria-label="Planner managed events">
          <p className="eyebrow">Planner managed</p>
          <h2>Event structure</h2>
          <p>Only an Owner or Planner can create or edit Events.</p>
        </section>
      )}

      <section className="section-band" aria-labelledby="event-list-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Event Progress</p>
            <h2 id="event-list-heading">Wedding Events</h2>
          </div>
        </div>

        <div className="record-list">
          {eventProgress.map(({ event, progress }) => (
            <article className="record-card" key={event.id}>
              <div className="record-card-header">
                <div>
                  <h3>{event.name}</h3>
                  <p>
                    {event.date} - {event.location}
                  </p>
                </div>
                <strong>{progress.percent}%</strong>
              </div>
              <div className="progress-track" aria-label={`${event.name} Progress`}>
                <span style={{ width: `${progress.percent}%` }} />
              </div>
              <p className="muted">
                Lead: {collaboratorById.get(event.leadId)?.name ?? "Unassigned"} -{" "}
                {progress.done} of {progress.total} Tasks done
              </p>

              <form action={updateEventAction} className="details-form compact-form">
                <input type="hidden" name="eventId" value={event.id} />
                <label>
                  Event name
                  <input name="name" defaultValue={event.name} disabled={!canEdit} />
                </label>
                <label>
                  Date
                  <input
                    name="date"
                    type="date"
                    defaultValue={event.date}
                    disabled={!canEdit}
                  />
                </label>
                <label>
                  Location
                  <input
                    name="location"
                    defaultValue={event.location}
                    disabled={!canEdit}
                  />
                </label>
                <label>
                  Lead
                  <select name="leadId" defaultValue={event.leadId} disabled={!canEdit}>
                    {acceptedCollaborators.map((collaborator) => (
                      <option value={collaborator.id} key={collaborator.id}>
                        {collaborator.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="full-width">
                  Notes
                  <textarea
                    name="notes"
                    rows={3}
                    defaultValue={event.notes}
                    disabled={!canEdit}
                  />
                </label>
                <button type="submit" disabled={!canEdit}>
                  Save Event
                </button>
              </form>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

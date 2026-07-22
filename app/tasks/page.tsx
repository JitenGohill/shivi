import Link from "next/link";
import { getCurrentCollaborator } from "@/app/access-session";
import {
  createTaskAction,
  updateTaskAction,
  updateTaskStatusAction
} from "@/app/actions";
import { canPerform, invitationCanAccessWedding } from "@/lib/collaborators";
import { getCollaboratorRoster } from "@/lib/collaborator-store";
import {
  canUpdateTaskStatus,
  getBlockedTasks,
  getOverdueTasks,
  getUpcomingTasks,
  taskStatuses
} from "@/lib/events-and-tasks";
import { getPlanningData } from "@/lib/planning-store";
import { getWedding } from "@/lib/wedding-store";

export default async function TasksPage() {
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
  const eventById = new Map(
    planningData.events.map((event) => [event.id, event])
  );
  const canCreate = canPerform(currentCollaborator.role, "createPlanningRecord");
  const canEdit = canPerform(currentCollaborator.role, "editPlanningRecord");
  const today = new Date();
  const overdue = getOverdueTasks(planningData.tasks, today);
  const upcoming = getUpcomingTasks(planningData.tasks, today);
  const blocked = getBlockedTasks(planningData.tasks);

  return (
    <div className="page-stack">
      <header className="page-header compact">
        <div>
          <p className="eyebrow">{wedding.name}</p>
          <h1>Tasks</h1>
          <p className="lede">
            Assign owners, due dates, statuses, blockers, and Event links so
            Progress stays explainable.
          </p>
        </div>
        <Link className="secondary-link" href="/events">
          Open Events
        </Link>
      </header>

      <section className="summary-grid" aria-label="Task summary">
        <article className="summary-card attention">
          <span className="summary-label">Overdue</span>
          <strong>{overdue.length}</strong>
          <p>Tasks past their due date and not Done.</p>
        </article>
        <article className="summary-card">
          <span className="summary-label">Upcoming</span>
          <strong>{upcoming.length}</strong>
          <p>Due within the next 14 days.</p>
        </article>
        <article className="summary-card">
          <span className="summary-label">Blocked</span>
          <strong>{blocked.length}</strong>
          <p>Tasks that need a decision or unblocker.</p>
        </article>
        <article className="summary-card">
          <span className="summary-label">All Tasks</span>
          <strong>{planningData.tasks.length}</strong>
          <p>Wedding-level and Event-linked planning work.</p>
        </article>
      </section>

      {canCreate ? (
        <section className="section-band" aria-labelledby="create-task-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Planning work</p>
              <h2 id="create-task-heading">Create Task</h2>
            </div>
          </div>

          <form action={createTaskAction} className="details-form">
            <label>
              Task title
              <input name="title" required placeholder="Confirm caterer tasting" />
            </label>
            <label>
              Event
              <select name="eventId" defaultValue="wedding">
                <option value="wedding">Wedding-level</option>
                {planningData.events.map((event) => (
                  <option value={event.id} key={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Owner
              <select name="ownerId" defaultValue={currentCollaborator.id}>
                {acceptedCollaborators.map((collaborator) => (
                  <option value={collaborator.id} key={collaborator.id}>
                    {collaborator.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Due date
              <input name="dueDate" type="date" required />
            </label>
            <label>
              Status
              <select name="status" defaultValue="Not Started">
                {taskStatuses.map((status) => (
                  <option value={status} key={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Blocked reason
              <input name="blockedReason" />
            </label>
            <label className="full-width">
              Notes
              <textarea name="notes" rows={3} />
            </label>
            <button type="submit">Create Task</button>
          </form>
        </section>
      ) : (
        <section className="empty-state" aria-label="Planner managed tasks">
          <p className="eyebrow">Planner managed</p>
          <h2>Task structure</h2>
          <p>Contributors can update assigned Task statuses without changing structure.</p>
        </section>
      )}

      <section className="section-band" aria-labelledby="task-list-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Status loop</p>
            <h2 id="task-list-heading">Planning Tasks</h2>
          </div>
        </div>

        <div className="record-list">
          {planningData.tasks.map((task) => {
            const canChangeStatus = canUpdateTaskStatus(currentCollaborator, task);

            return (
              <article className="record-card" key={task.id}>
                <div className="record-card-header">
                  <div>
                    <h3>{task.title}</h3>
                    <p>
                      {eventById.get(task.eventId ?? "")?.name ?? "Wedding-level"} - Due{" "}
                      {task.dueDate}
                    </p>
                  </div>
                  <strong>{task.status}</strong>
                </div>
                <p className="muted">
                  Owner: {collaboratorById.get(task.ownerId)?.name ?? "Unassigned"}
                  {task.blockedReason ? ` - Blocked: ${task.blockedReason}` : ""}
                </p>

                <form action={updateTaskStatusAction} className="status-form">
                  <input type="hidden" name="taskId" value={task.id} />
                  <label>
                    Status
                    <select
                      name="status"
                      defaultValue={task.status}
                      disabled={!canChangeStatus}
                    >
                      {taskStatuses.map((status) => (
                        <option value={status} key={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Blocked reason
                    <input
                      name="blockedReason"
                      defaultValue={task.blockedReason ?? ""}
                      disabled={!canChangeStatus}
                    />
                  </label>
                  <button type="submit" disabled={!canChangeStatus}>
                    Update Status
                  </button>
                </form>

                <form action={updateTaskAction} className="details-form compact-form">
                  <input type="hidden" name="taskId" value={task.id} />
                  <label>
                    Task title
                    <input name="title" defaultValue={task.title} disabled={!canEdit} />
                  </label>
                  <label>
                    Event
                    <select
                      name="eventId"
                      defaultValue={task.eventId ?? "wedding"}
                      disabled={!canEdit}
                    >
                      <option value="wedding">Wedding-level</option>
                      {planningData.events.map((event) => (
                        <option value={event.id} key={event.id}>
                          {event.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Owner
                    <select name="ownerId" defaultValue={task.ownerId} disabled={!canEdit}>
                      {acceptedCollaborators.map((collaborator) => (
                        <option value={collaborator.id} key={collaborator.id}>
                          {collaborator.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Due date
                    <input
                      name="dueDate"
                      type="date"
                      defaultValue={task.dueDate}
                      disabled={!canEdit}
                    />
                  </label>
                  <label>
                    Status
                    <select name="status" defaultValue={task.status} disabled={!canEdit}>
                      {taskStatuses.map((status) => (
                        <option value={status} key={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Blocked reason
                    <input
                      name="blockedReason"
                      defaultValue={task.blockedReason ?? ""}
                      disabled={!canEdit}
                    />
                  </label>
                  <label className="full-width">
                    Notes
                    <textarea
                      name="notes"
                      rows={3}
                      defaultValue={task.notes}
                      disabled={!canEdit}
                    />
                  </label>
                  <button type="submit" disabled={!canEdit}>
                    Save Task
                  </button>
                </form>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

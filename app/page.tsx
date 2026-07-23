import Link from "next/link";
import { updateWeddingDetails } from "@/app/actions";
import { getCurrentCollaborator } from "@/app/access-session";
import { invitationCanAccessWedding } from "@/lib/collaborators";
import { getCollaboratorRoster } from "@/lib/collaborator-store";
import {
  calculateEventProgress,
  calculateProgress,
  getAttentionNeeded,
  getBlockedTasks,
  getCurrentUserAssignments,
  getOverdueTasks,
  type PlanningTask,
  type WeddingEvent
} from "@/lib/events-and-tasks";
import { accessArea, planningAreas } from "@/lib/planning-areas";
import { getPlanningData } from "@/lib/planning-store";
import { calculateVendorPipeline } from "@/lib/vendors";
import { getWedding } from "@/lib/wedding-store";

export default async function DashboardPage() {
  const [wedding, currentCollaborator, roster, planningData] = await Promise.all([
    getWedding(),
    getCurrentCollaborator(),
    getCollaboratorRoster(),
    getPlanningData()
  ]);
  const today = new Date();
  const weddingProgress = calculateProgress(planningData.tasks);
  const overdueTasks = getOverdueTasks(planningData.tasks, today);
  const blockedTasks = getBlockedTasks(planningData.tasks);
  const attentionNeeded = getAttentionNeeded(planningData.tasks, today);
  const currentAssignments = getCurrentUserAssignments(
    planningData.tasks,
    currentCollaborator.id
  );
  const eventProgress = calculateEventProgress(
    planningData.events,
    planningData.tasks
  );
  const vendorPipeline = calculateVendorPipeline(planningData.vendors);
  const bookedVendors = planningData.vendors.filter(
    (vendor) => vendor.status === "Booked"
  );
  const acceptedCollaborators = roster.collaborators.filter(invitationCanAccessWedding);
  const collaboratorById = new Map(
    acceptedCollaborators.map((collaborator) => [collaborator.id, collaborator])
  );
  const eventById = new Map(
    planningData.events.map((event) => [event.id, event])
  );

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Single Wedding workspace</p>
          <h1>{wedding.name} Dashboard</h1>
          <p className="lede">
            The first planning view for {wedding.coupleNames}, focused on urgent
            work, ownership, and a clear path into every major planning area.
          </p>
        </div>
      </header>

      <section className="summary-grid" aria-label="Dashboard summary">
        <article className="summary-card attention">
          <span className="summary-label">Attention Needed</span>
          <strong>{attentionNeeded.length}</strong>
          <p>Blocked or overdue Tasks that need Collaborator action.</p>
        </article>
        <article className="summary-card">
          <span className="summary-label">Wedding Progress</span>
          <strong>{weddingProgress.percent}%</strong>
          <p>
            {weddingProgress.done} of {weddingProgress.total} Tasks are Done.
          </p>
        </article>
        <article className="summary-card">
          <span className="summary-label">Vendors</span>
          <strong>{planningData.vendors.length}</strong>
          <p>{bookedVendors.length} booked Providers.</p>
        </article>
        <article className="summary-card">
          <span className="summary-label">Current Collaborator</span>
          <strong>{currentCollaborator.role}</strong>
          <p>{currentCollaborator.name}</p>
        </article>
      </section>

      <section className="section-band" aria-labelledby="dashboard-tasks-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Task-driven Dashboard</p>
            <h2 id="dashboard-tasks-heading">Planning Signals</h2>
          </div>
          <p>Overdue, blocked, and assigned work update from Task Status.</p>
        </div>

        <div className="dashboard-columns">
          <DashboardTaskList
            title="Overdue"
            tasks={overdueTasks}
            eventById={eventById}
            collaboratorById={collaboratorById}
          />
          <DashboardTaskList
            title="Blocked"
            tasks={blockedTasks}
            eventById={eventById}
            collaboratorById={collaboratorById}
          />
          <DashboardTaskList
            title="My Assignments"
            tasks={currentAssignments}
            eventById={eventById}
            collaboratorById={collaboratorById}
          />
        </div>
      </section>

      <section className="section-band" aria-labelledby="event-progress-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Event Progress</p>
            <h2 id="event-progress-heading">Event Rollups</h2>
          </div>
          <p>Each Event Progress value is calculated from linked Tasks.</p>
        </div>

        <div className="area-grid">
          {eventProgress.map(({ event, progress }) => (
            <a className="area-card" href="/events" key={event.id}>
              <span>{event.name}</span>
              <p>
                {progress.percent}% complete - {progress.done} of {progress.total} Tasks
              </p>
            </a>
          ))}
        </div>
      </section>

      <section className="section-band" aria-labelledby="vendor-pipeline-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Vendor Pipeline</p>
            <h2 id="vendor-pipeline-heading">Status by Category</h2>
          </div>
          <p>Vendor counts are grouped first by Vendor Status, then by Category.</p>
        </div>

        <div className="pipeline-grid">
          {vendorPipeline.map((summary) => (
            <a className="signal-panel" href="/vendors" key={summary.status}>
              <div className="record-card-header">
                <h3>{summary.status}</h3>
                <strong>{summary.total}</strong>
              </div>
              {summary.categories.length === 0 ? (
                <p className="muted">No Vendors.</p>
              ) : (
                <ul className="category-list">
                  {summary.categories.map((categorySummary) => (
                    <li key={categorySummary.category}>
                      <span>{categorySummary.category}</span>
                      <strong>{categorySummary.total}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </a>
          ))}
        </div>
      </section>

      <section className="section-band" aria-labelledby="wedding-details-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Persistent Wedding record</p>
            <h2 id="wedding-details-heading">Wedding Details</h2>
          </div>
          <p>
            These fields edit the single Wedding record used by the Dashboard and
            future planning areas.
          </p>
        </div>

        <form action={updateWeddingDetails} className="details-form">
          <label>
            Wedding name
            <input name="name" defaultValue={wedding.name} />
          </label>
          <label>
            Couple names
            <input name="coupleNames" defaultValue={wedding.coupleNames} />
          </label>
          <label>
            Wedding date
            <input name="date" type="date" defaultValue={wedding.date} />
          </label>
          <label>
            Primary location
            <input name="location" defaultValue={wedding.location} />
          </label>
          <label className="full-width">
            Planning notes
            <textarea name="notes" defaultValue={wedding.notes} rows={4} />
          </label>
          <button type="submit">Save Wedding Details</button>
        </form>
      </section>

      <section className="section-band" aria-labelledby="planning-areas-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Primary navigation</p>
            <h2 id="planning-areas-heading">Planning Areas</h2>
          </div>
          <p>Placeholder destinations are ready for later vertical slices.</p>
        </div>

        <div className="area-grid">
          {planningAreas.map((area) => (
            <a className="area-card" href={area.href} key={area.href}>
              <span>{area.label}</span>
              <p>{area.summary}</p>
            </a>
          ))}
          <a className="area-card" href={accessArea.href}>
            <span>{accessArea.label}</span>
            <p>{accessArea.summary}</p>
          </a>
        </div>
      </section>
    </div>
  );
}

type DashboardTaskListProps = {
  title: string;
  tasks: PlanningTask[];
  eventById: Map<string, WeddingEvent>;
  collaboratorById: Map<
    string,
    Awaited<ReturnType<typeof getCollaboratorRoster>>["collaborators"][number]
  >;
};

function DashboardTaskList({
  title,
  tasks,
  eventById,
  collaboratorById
}: DashboardTaskListProps) {
  return (
    <article className="signal-panel">
      <h3>{title}</h3>
      {tasks.length === 0 ? (
        <p className="muted">No Tasks here right now.</p>
      ) : (
        <ul className="task-list">
          {tasks.slice(0, 4).map((task) => (
            <li key={task.id}>
              <Link href="/tasks">{task.title}</Link>
              <span>
                {eventById.get(task.eventId ?? "")?.name ?? "Wedding-level"} -{" "}
                {collaboratorById.get(task.ownerId)?.name ?? "Unassigned"} -{" "}
                {task.dueDate}
              </span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

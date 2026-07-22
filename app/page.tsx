import { updateWeddingDetails } from "@/app/actions";
import { getCurrentCollaborator } from "@/app/access-session";
import { accessArea, planningAreas } from "@/lib/planning-areas";
import { getWedding } from "@/lib/wedding-store";

export default async function DashboardPage() {
  const [wedding, currentCollaborator] = await Promise.all([
    getWedding(),
    getCurrentCollaborator()
  ]);

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
          <strong>0</strong>
          <p>Overdue, blocked, and near-term work will appear here as slices land.</p>
        </article>
        <article className="summary-card">
          <span className="summary-label">Wedding Progress</span>
          <strong>0%</strong>
          <p>Progress will roll up from Task Status across the Wedding.</p>
        </article>
        <article className="summary-card">
          <span className="summary-label">Upcoming Payments</span>
          <strong>0</strong>
          <p>Due and overdue Payments will surface here after budget tracking.</p>
        </article>
        <article className="summary-card">
          <span className="summary-label">Current Collaborator</span>
          <strong>{currentCollaborator.role}</strong>
          <p>{currentCollaborator.name}</p>
        </article>
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

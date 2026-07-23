import Link from "next/link";
import { getCurrentCollaborator } from "@/app/access-session";
import {
  createVendorAction,
  updateVendorAction,
  updateVendorStatusAction
} from "@/app/actions";
import { canPerform } from "@/lib/collaborators";
import { getPlanningData } from "@/lib/planning-store";
import {
  calculateVendorPipeline,
  vendorCategories,
  vendorStatuses
} from "@/lib/vendors";
import { getWedding } from "@/lib/wedding-store";

export default async function VendorsPage() {
  const [wedding, currentCollaborator, planningData] = await Promise.all([
    getWedding(),
    getCurrentCollaborator(),
    getPlanningData()
  ]);
  const eventById = new Map(planningData.events.map((event) => [event.id, event]));
  const taskByVendorId = new Map(
    planningData.vendors.map((vendor) => [
      vendor.id,
      planningData.tasks.filter((task) => task.vendorId === vendor.id)
    ])
  );
  const pipeline = calculateVendorPipeline(planningData.vendors);
  const bookedCount = planningData.vendors.filter(
    (vendor) => vendor.status === "Booked"
  ).length;
  const activeCount = planningData.vendors.filter(
    (vendor) => vendor.status !== "Rejected" && vendor.status !== "Cancelled"
  ).length;
  const canCreate = canPerform(currentCollaborator.role, "createPlanningRecord");
  const canEdit = canPerform(currentCollaborator.role, "editPlanningRecord");

  return (
    <div className="page-stack">
      <header className="page-header compact">
        <div>
          <p className="eyebrow">{wedding.name}</p>
          <h1>Vendors</h1>
          <p className="lede">
            Track vendor categories, booking status, event coverage, and follow-up
            Tasks across the wedding plan.
          </p>
        </div>
        <Link className="secondary-link" href="/tasks">
          Open Tasks
        </Link>
      </header>

      <section className="summary-grid" aria-label="Vendor summary">
        <article className="summary-card">
          <span className="summary-label">All Vendors</span>
          <strong>{planningData.vendors.length}</strong>
          <p>Providers in the pipeline.</p>
        </article>
        <article className="summary-card">
          <span className="summary-label">Active Vendors</span>
          <strong>{activeCount}</strong>
          <p>Not rejected or cancelled.</p>
        </article>
        <article className="summary-card attention">
          <span className="summary-label">Booked</span>
          <strong>{bookedCount}</strong>
          <p>Confirmed providers.</p>
        </article>
        <article className="summary-card">
          <span className="summary-label">Categories</span>
          <strong>
            {new Set(planningData.vendors.map((vendor) => vendor.category)).size}
          </strong>
          <p>Vendor types represented.</p>
        </article>
      </section>

      <section className="section-band" aria-labelledby="vendor-pipeline-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Pipeline</p>
            <h2 id="vendor-pipeline-heading">Status by Category</h2>
          </div>
        </div>

        <div className="pipeline-grid">
          {pipeline.map((summary) => (
            <article className="signal-panel" key={summary.status}>
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
            </article>
          ))}
        </div>
      </section>

      {canCreate ? (
        <section className="section-band" aria-labelledby="create-vendor-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Vendor workflow</p>
              <h2 id="create-vendor-heading">Create Vendor</h2>
            </div>
          </div>

          <form action={createVendorAction} className="details-form">
            <label>
              Vendor name
              <input name="name" required placeholder="Lotus Banquet Hall" />
            </label>
            <label>
              Category
              <select name="category" required defaultValue="">
                <option value="" disabled>
                  Select category
                </option>
                {vendorCategories.map((category) => (
                  <option value={category} key={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select name="status" defaultValue="Researching">
                {vendorStatuses.map((status) => (
                  <option value={status} key={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Contact name
              <input name="contactName" />
            </label>
            <label>
              Contact email
              <input name="contactEmail" type="email" />
            </label>
            <label>
              Contact phone
              <input name="contactPhone" />
            </label>
            <fieldset className="full-width checkbox-field">
              <legend>Events</legend>
              <div className="checkbox-grid">
                {planningData.events.map((event) => (
                  <label className="checkbox-label" key={event.id}>
                    <input name="eventIds" type="checkbox" value={event.id} />
                    {event.name}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="full-width">
              Notes
              <textarea name="notes" rows={3} />
            </label>
            <button type="submit">Create Vendor</button>
          </form>
        </section>
      ) : (
        <section className="empty-state" aria-label="Planner managed vendors">
          <p className="eyebrow">Planner managed</p>
          <h2>Vendor pipeline</h2>
          <p>Only an Owner or Planner can create or edit Vendors.</p>
        </section>
      )}

      <section className="section-band" aria-labelledby="vendor-list-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Records</p>
            <h2 id="vendor-list-heading">Vendor List</h2>
          </div>
        </div>

        <div className="record-list">
          {planningData.vendors.map((vendor) => {
            const tasks = taskByVendorId.get(vendor.id) ?? [];

            return (
              <article className="record-card" key={vendor.id}>
                <div className="record-card-header">
                  <div>
                    <h3>{vendor.name}</h3>
                    <p>
                      {vendor.category} -{" "}
                      {vendor.eventIds
                        .map((eventId) => eventById.get(eventId)?.name)
                        .filter(Boolean)
                        .join(", ") || "No Events assigned"}
                    </p>
                  </div>
                  <strong>{vendor.status}</strong>
                </div>
                <p className="muted">
                  {vendor.contactName || "No contact"}{" "}
                  {vendor.contactEmail ? `- ${vendor.contactEmail}` : ""}
                  {vendor.contactPhone ? `- ${vendor.contactPhone}` : ""}
                </p>
                <p className="muted">
                  Linked Tasks:{" "}
                  {tasks.length > 0
                    ? tasks.map((task) => task.title).join(", ")
                    : "No Tasks linked"}
                </p>

                <form
                  action={updateVendorStatusAction}
                  className="status-form vendor-status-form"
                >
                  <input type="hidden" name="vendorId" value={vendor.id} />
                  <label>
                    Status
                    <select
                      name="status"
                      defaultValue={vendor.status}
                      disabled={!canEdit}
                    >
                      {vendorStatuses.map((status) => (
                        <option value={status} key={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button type="submit" disabled={!canEdit}>
                    Update Status
                  </button>
                </form>

                <form action={updateVendorAction} className="details-form compact-form">
                  <input type="hidden" name="vendorId" value={vendor.id} />
                  <label>
                    Vendor name
                    <input name="name" defaultValue={vendor.name} disabled={!canEdit} />
                  </label>
                  <label>
                    Category
                    <select
                      name="category"
                      defaultValue={vendor.category}
                      disabled={!canEdit}
                    >
                      {vendorCategories.map((category) => (
                        <option value={category} key={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Status
                    <select name="status" defaultValue={vendor.status} disabled={!canEdit}>
                      {vendorStatuses.map((status) => (
                        <option value={status} key={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Contact name
                    <input
                      name="contactName"
                      defaultValue={vendor.contactName}
                      disabled={!canEdit}
                    />
                  </label>
                  <label>
                    Contact email
                    <input
                      name="contactEmail"
                      type="email"
                      defaultValue={vendor.contactEmail}
                      disabled={!canEdit}
                    />
                  </label>
                  <label>
                    Contact phone
                    <input
                      name="contactPhone"
                      defaultValue={vendor.contactPhone}
                      disabled={!canEdit}
                    />
                  </label>
                  <fieldset className="full-width checkbox-field" disabled={!canEdit}>
                    <legend>Events</legend>
                    <div className="checkbox-grid">
                      {planningData.events.map((event) => (
                        <label className="checkbox-label" key={event.id}>
                          <input
                            name="eventIds"
                            type="checkbox"
                            value={event.id}
                            defaultChecked={vendor.eventIds.includes(event.id)}
                          />
                          {event.name}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <label className="full-width">
                    Notes
                    <textarea
                      name="notes"
                      rows={3}
                      defaultValue={vendor.notes}
                      disabled={!canEdit}
                    />
                  </label>
                  <button type="submit" disabled={!canEdit}>
                    Save Vendor
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

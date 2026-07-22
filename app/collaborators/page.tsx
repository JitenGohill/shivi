import Link from "next/link";
import { getCurrentCollaborator } from "@/app/access-session";
import {
  inviteCollaboratorAction,
  removeCollaboratorAction,
  updateCollaboratorRoleAction
} from "@/app/actions";
import {
  canPerform,
  collaboratorRoles,
  guestsCanSignIn,
  invitationCanAccessWedding
} from "@/lib/collaborators";
import { getCollaboratorRoster } from "@/lib/collaborator-store";
import { getWedding } from "@/lib/wedding-store";

export default async function CollaboratorsPage() {
  const [wedding, currentCollaborator, roster] = await Promise.all([
    getWedding(),
    getCurrentCollaborator(),
    getCollaboratorRoster()
  ]);
  const canManage = canPerform(currentCollaborator.role, "inviteCollaborator");
  const acceptedCount = roster.collaborators.filter(invitationCanAccessWedding).length;
  const invitedCount = roster.collaborators.length - acceptedCount;

  return (
    <div className="page-stack">
      <header className="page-header compact">
        <div>
          <p className="eyebrow">{wedding.name}</p>
          <h1>Collaborators</h1>
          <p className="lede">
            Invited family and friends with Owner, Planner, or Contributor access
            to the single Wedding workspace.
          </p>
        </div>
        <Link className="secondary-link" href="/">
          Back to Dashboard
        </Link>
      </header>

      <section className="summary-grid" aria-label="Collaborator access summary">
        <article className="summary-card attention">
          <span className="summary-label">Current Collaborator</span>
          <strong>{currentCollaborator.role}</strong>
          <p>{currentCollaborator.name}</p>
        </article>
        <article className="summary-card">
          <span className="summary-label">Accepted</span>
          <strong>{acceptedCount}</strong>
          <p>Collaborators with workspace access.</p>
        </article>
        <article className="summary-card">
          <span className="summary-label">Invited</span>
          <strong>{invitedCount}</strong>
          <p>Collaborators waiting to accept.</p>
        </article>
        <article className="summary-card">
          <span className="summary-label">Guest Sign-In</span>
          <strong>{guestsCanSignIn() ? "On" : "Off"}</strong>
          <p>Guests remain planning records only.</p>
        </article>
      </section>

      {canManage ? (
        <section className="section-band" aria-labelledby="invite-heading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Invited-only access</p>
              <h2 id="invite-heading">Invite Collaborator</h2>
            </div>
          </div>

          <form action={inviteCollaboratorAction} className="details-form">
            <label>
              Name
              <input name="name" placeholder="Priya Shah" />
            </label>
            <label>
              Email
              <input name="email" type="email" required placeholder="priya@example.com" />
            </label>
            <label>
              Role
              <select name="role" defaultValue="Contributor">
                {collaboratorRoles.map((role) => (
                  <option value={role} key={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit">Send Invite</button>
          </form>
        </section>
      ) : (
        <section className="empty-state" aria-label="Owner-managed access">
          <p className="eyebrow">Owner managed</p>
          <h2>Collaborator access</h2>
          <p>Only an Owner can invite, remove, or change Collaborator roles.</p>
        </section>
      )}

      <section className="section-band" aria-labelledby="roster-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Planning team</p>
            <h2 id="roster-heading">Collaborator Roster</h2>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Invite</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {roster.collaborators.map((collaborator) => (
                <tr key={collaborator.id}>
                  <td>{collaborator.name}</td>
                  <td>{collaborator.email}</td>
                  <td>
                    <form action={updateCollaboratorRoleAction} className="inline-form">
                      <input type="hidden" name="collaboratorId" value={collaborator.id} />
                      <select
                        aria-label={`Role for ${collaborator.name}`}
                        name="role"
                        defaultValue={collaborator.role}
                        disabled={!canManage}
                      >
                        {collaboratorRoles.map((role) => (
                          <option value={role} key={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      <button type="submit" disabled={!canManage}>
                        Save
                      </button>
                    </form>
                  </td>
                  <td>{collaborator.status}</td>
                  <td>
                    {collaborator.status === "Invited" && collaborator.inviteToken ? (
                      <Link href={`/invite/${collaborator.inviteToken}`}>
                        Invite link
                      </Link>
                    ) : (
                      "Accepted"
                    )}
                  </td>
                  <td>
                    <form action={removeCollaboratorAction} className="inline-form">
                      <input type="hidden" name="collaboratorId" value={collaborator.id} />
                      <button type="submit" disabled={!canManage}>
                        Remove
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

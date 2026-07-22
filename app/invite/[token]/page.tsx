import Link from "next/link";
import { notFound } from "next/navigation";
import { acceptCollaboratorInviteAction } from "@/app/actions";
import { getCollaboratorRoster } from "@/lib/collaborator-store";
import { getWedding } from "@/lib/wedding-store";

type InvitePageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function InvitePage({ params }: InvitePageProps) {
  const [{ token }, wedding, roster] = await Promise.all([
    params,
    getWedding(),
    getCollaboratorRoster()
  ]);
  const collaborator = roster.collaborators.find(
    (candidate) => candidate.inviteToken === token
  );

  if (!collaborator) {
    notFound();
  }

  const accepted = collaborator.status === "Accepted";

  return (
    <div className="page-stack">
      <header className="page-header compact">
        <div>
          <p className="eyebrow">{wedding.name}</p>
          <h1>Collaborator Invite</h1>
          <p className="lede">
            {collaborator.name} has {collaborator.role} access to this Wedding.
          </p>
        </div>
      </header>

      <section className="empty-state" aria-label="Collaborator invite">
        <p className="eyebrow">{accepted ? "Accepted" : "Invitation"}</p>
        <h2>{collaborator.email}</h2>
        <p>
          {accepted
            ? "This Collaborator can access the Wedding workspace."
            : "Accepting adds this Collaborator to the Wedding workspace."}
        </p>

        {accepted ? (
          <Link className="secondary-link stacked-action" href="/">
            Open Dashboard
          </Link>
        ) : (
          <form action={acceptCollaboratorInviteAction}>
            <input type="hidden" name="token" value={token} />
            <button className="stacked-action" type="submit">
              Accept Invite
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

import { cookies } from "next/headers";
import {
  findDefaultOwner,
  getCollaboratorRoster
} from "@/lib/collaborator-store";

const collaboratorCookie = "shivi_collaborator_id";

export async function getCurrentCollaborator() {
  const roster = await getCollaboratorRoster();
  const cookieStore = await cookies();
  const collaboratorId = cookieStore.get(collaboratorCookie)?.value;
  const collaborator = roster.collaborators.find(
    (candidate) =>
      candidate.id === collaboratorId && candidate.status === "Accepted"
  );

  return collaborator ?? findDefaultOwner(roster);
}

export async function setCurrentCollaborator(collaboratorId: string) {
  const cookieStore = await cookies();

  cookieStore.set(collaboratorCookie, collaboratorId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });
}

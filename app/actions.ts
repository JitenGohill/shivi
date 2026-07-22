"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentCollaborator, setCurrentCollaborator } from "@/app/access-session";
import {
  acceptCollaboratorInvite,
  changeCollaboratorRole,
  getCollaboratorRoster,
  inviteCollaborator,
  removeCollaborator,
  saveCollaboratorRoster
} from "@/lib/collaborator-store";
import { assertCanPerform, normalizeCollaboratorRole } from "@/lib/collaborators";
import { normalizeWedding, saveWedding } from "@/lib/wedding-store";

export async function updateWeddingDetails(formData: FormData) {
  const currentCollaborator = await getCurrentCollaborator();
  assertCanPerform(currentCollaborator.role, "editWeddingDetails");

  await saveWedding(normalizeWedding(formData));
  revalidatePath("/");
}

export async function inviteCollaboratorAction(formData: FormData) {
  const currentCollaborator = await getCurrentCollaborator();
  const roster = await getCollaboratorRoster();
  const nextRoster = inviteCollaborator(roster, currentCollaborator, {
    name: cleanFormValue(formData.get("name")),
    email: cleanFormValue(formData.get("email")),
    role: normalizeCollaboratorRole(formData.get("role"))
  });

  await saveCollaboratorRoster(nextRoster);
  revalidatePath("/collaborators");
}

export async function acceptCollaboratorInviteAction(formData: FormData) {
  const token = cleanFormValue(formData.get("token"));
  const roster = await getCollaboratorRoster();
  const result = acceptCollaboratorInvite(roster, token);

  if (!result.collaborator) {
    throw new Error("Invite token was not found.");
  }

  await saveCollaboratorRoster(result.roster);
  await setCurrentCollaborator(result.collaborator.id);
  revalidatePath("/");
  revalidatePath("/collaborators");
  redirect("/");
}

export async function updateCollaboratorRoleAction(formData: FormData) {
  const currentCollaborator = await getCurrentCollaborator();
  const roster = await getCollaboratorRoster();
  const collaboratorId = cleanFormValue(formData.get("collaboratorId"));
  const role = normalizeCollaboratorRole(formData.get("role"));

  await saveCollaboratorRoster(
    changeCollaboratorRole(roster, currentCollaborator, collaboratorId, role)
  );
  revalidatePath("/collaborators");
}

export async function removeCollaboratorAction(formData: FormData) {
  const currentCollaborator = await getCurrentCollaborator();
  const roster = await getCollaboratorRoster();
  const collaboratorId = cleanFormValue(formData.get("collaboratorId"));

  await saveCollaboratorRoster(
    removeCollaborator(roster, currentCollaborator, collaboratorId)
  );
  revalidatePath("/collaborators");
}

function cleanFormValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

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
import { normalizeTaskStatus } from "@/lib/events-and-tasks";
import {
  createEvent,
  createTask,
  getPlanningData,
  savePlanningData,
  updateEvent,
  updateTask,
  updateTaskStatus
} from "@/lib/planning-store";
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

export async function createEventAction(formData: FormData) {
  const currentCollaborator = await getCurrentCollaborator();
  const planningData = await getPlanningData();

  await savePlanningData(
    createEvent(planningData, currentCollaborator, {
      name: cleanFormValue(formData.get("name")),
      date: cleanFormValue(formData.get("date")),
      location: cleanFormValue(formData.get("location")),
      leadId: cleanFormValue(formData.get("leadId")),
      notes: cleanFormValue(formData.get("notes"))
    })
  );
  revalidatePlanningPaths();
}

export async function updateEventAction(formData: FormData) {
  const currentCollaborator = await getCurrentCollaborator();
  const planningData = await getPlanningData();

  await savePlanningData(
    updateEvent(planningData, currentCollaborator, {
      id: cleanFormValue(formData.get("eventId")),
      name: cleanFormValue(formData.get("name")),
      date: cleanFormValue(formData.get("date")),
      location: cleanFormValue(formData.get("location")),
      leadId: cleanFormValue(formData.get("leadId")),
      notes: cleanFormValue(formData.get("notes"))
    })
  );
  revalidatePlanningPaths();
}

export async function createTaskAction(formData: FormData) {
  const currentCollaborator = await getCurrentCollaborator();
  const planningData = await getPlanningData();
  const eventId = cleanFormValue(formData.get("eventId"));

  await savePlanningData(
    createTask(planningData, currentCollaborator, {
      title: cleanFormValue(formData.get("title")),
      eventId: eventId === "wedding" ? undefined : eventId,
      ownerId: cleanFormValue(formData.get("ownerId")),
      dueDate: cleanFormValue(formData.get("dueDate")),
      status: normalizeTaskStatus(formData.get("status")),
      blockedReason: cleanFormValue(formData.get("blockedReason")),
      notes: cleanFormValue(formData.get("notes"))
    })
  );
  revalidatePlanningPaths();
}

export async function updateTaskAction(formData: FormData) {
  const currentCollaborator = await getCurrentCollaborator();
  const planningData = await getPlanningData();
  const eventId = cleanFormValue(formData.get("eventId"));

  await savePlanningData(
    updateTask(planningData, currentCollaborator, {
      id: cleanFormValue(formData.get("taskId")),
      title: cleanFormValue(formData.get("title")),
      eventId: eventId === "wedding" ? undefined : eventId,
      ownerId: cleanFormValue(formData.get("ownerId")),
      dueDate: cleanFormValue(formData.get("dueDate")),
      status: normalizeTaskStatus(formData.get("status")),
      blockedReason: cleanFormValue(formData.get("blockedReason")),
      notes: cleanFormValue(formData.get("notes"))
    })
  );
  revalidatePlanningPaths();
}

export async function updateTaskStatusAction(formData: FormData) {
  const currentCollaborator = await getCurrentCollaborator();
  const planningData = await getPlanningData();

  await savePlanningData(
    updateTaskStatus(planningData, currentCollaborator, {
      taskId: cleanFormValue(formData.get("taskId")),
      status: formData.get("status"),
      blockedReason: cleanFormValue(formData.get("blockedReason"))
    })
  );
  revalidatePlanningPaths();
}

function cleanFormValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function revalidatePlanningPaths() {
  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/tasks");
}

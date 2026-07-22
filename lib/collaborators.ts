export const collaboratorRoles = ["Owner", "Planner", "Contributor"] as const;

export type CollaboratorRole = (typeof collaboratorRoles)[number];

export const collaboratorStatuses = ["Invited", "Accepted"] as const;

export type CollaboratorStatus = (typeof collaboratorStatuses)[number];

export type Collaborator = {
  id: string;
  name: string;
  email: string;
  role: CollaboratorRole;
  status: CollaboratorStatus;
  inviteToken?: string;
  invitedAt: string;
  acceptedAt?: string;
};

export type CollaboratorAction =
  | "inviteCollaborator"
  | "changeCollaboratorRole"
  | "removeCollaborator"
  | "editWeddingDetails"
  | "createPlanningRecord"
  | "editPlanningRecord"
  | "updateAnyTaskStatus"
  | "updateAssignedTaskStatus"
  | "signInAsGuest";

const permissionsByRole: Record<CollaboratorRole, Set<CollaboratorAction>> = {
  Owner: new Set([
    "inviteCollaborator",
    "changeCollaboratorRole",
    "removeCollaborator",
    "editWeddingDetails",
    "createPlanningRecord",
    "editPlanningRecord",
    "updateAnyTaskStatus",
    "updateAssignedTaskStatus"
  ]),
  Planner: new Set([
    "createPlanningRecord",
    "editPlanningRecord",
    "updateAnyTaskStatus",
    "updateAssignedTaskStatus"
  ]),
  Contributor: new Set(["updateAssignedTaskStatus"])
};

export function canPerform(
  role: CollaboratorRole,
  action: CollaboratorAction
) {
  return permissionsByRole[role].has(action);
}

export function assertCanPerform(
  role: CollaboratorRole,
  action: CollaboratorAction
) {
  if (!canPerform(role, action)) {
    throw new Error(`${role} cannot ${action}.`);
  }
}

export function normalizeCollaboratorRole(value: FormDataEntryValue | null) {
  return collaboratorRoles.find((role) => role === value) ?? "Contributor";
}

export function invitationCanAccessWedding(collaborator: Collaborator) {
  return collaborator.status === "Accepted";
}

export function guestsCanSignIn() {
  return false;
}

export function isOnlyAcceptedOwner(
  collaborators: Collaborator[],
  collaboratorId: string
) {
  const acceptedOwners = collaborators.filter(
    (collaborator) =>
      collaborator.role === "Owner" && collaborator.status === "Accepted"
  );

  return acceptedOwners.length === 1 && acceptedOwners[0]?.id === collaboratorId;
}

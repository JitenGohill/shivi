import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  assertCanPerform,
  type Collaborator,
  type CollaboratorRole,
  isOnlyAcceptedOwner
} from "@/lib/collaborators";

export type CollaboratorRoster = {
  collaborators: Collaborator[];
};

const now = "2026-07-22T00:00:00.000Z";

const defaultRoster: CollaboratorRoster = {
  collaborators: [
    {
      id: "bride-owner",
      name: "Anaya Patel",
      email: "anaya@example.com",
      role: "Owner",
      status: "Accepted",
      invitedAt: now,
      acceptedAt: now
    }
  ]
};

const dataFilePath =
  process.env.COLLABORATOR_DATA_PATH ??
  path.join(process.cwd(), "data", "collaborators.json");

export async function getCollaboratorRoster(): Promise<CollaboratorRoster> {
  try {
    const contents = await readFile(dataFilePath, "utf8");
    const parsed = JSON.parse(contents) as Partial<CollaboratorRoster>;

    return {
      collaborators:
        parsed.collaborators && parsed.collaborators.length > 0
          ? parsed.collaborators
          : defaultRoster.collaborators
    };
  } catch (error) {
    if (isMissingFileError(error)) {
      await saveCollaboratorRoster(defaultRoster);
      return defaultRoster;
    }

    throw error;
  }
}

export async function saveCollaboratorRoster(roster: CollaboratorRoster) {
  await mkdir(path.dirname(dataFilePath), { recursive: true });
  await writeFile(dataFilePath, `${JSON.stringify(roster, null, 2)}\n`, "utf8");
}

export function findDefaultOwner(roster: CollaboratorRoster) {
  return (
    roster.collaborators.find(
      (collaborator) =>
        collaborator.role === "Owner" && collaborator.status === "Accepted"
    ) ?? roster.collaborators[0]
  );
}

export function inviteCollaborator(
  roster: CollaboratorRoster,
  actor: Collaborator,
  input: {
    name: string;
    email: string;
    role: CollaboratorRole;
  }
): CollaboratorRoster {
  assertCanPerform(actor.role, "inviteCollaborator");

  const email = input.email.trim().toLowerCase();
  const name = input.name.trim() || email;
  const existing = roster.collaborators.find(
    (collaborator) => collaborator.email.toLowerCase() === email
  );

  if (existing) {
    return {
      collaborators: roster.collaborators.map((collaborator) =>
        collaborator.id === existing.id
          ? {
              ...collaborator,
              name,
              role: input.role,
              status: collaborator.status === "Accepted" ? "Accepted" : "Invited",
              inviteToken:
                collaborator.status === "Accepted"
                  ? collaborator.inviteToken
                  : collaborator.inviteToken ?? randomUUID()
            }
          : collaborator
      )
    };
  }

  return {
    collaborators: [
      ...roster.collaborators,
      {
        id: randomUUID(),
        name,
        email,
        role: input.role,
        status: "Invited",
        inviteToken: randomUUID(),
        invitedAt: new Date().toISOString()
      }
    ]
  };
}

export function acceptCollaboratorInvite(
  roster: CollaboratorRoster,
  token: string
) {
  let acceptedCollaborator: Collaborator | undefined;

  const collaborators = roster.collaborators.map((collaborator) => {
    if (collaborator.inviteToken !== token) {
      return collaborator;
    }

    acceptedCollaborator = {
      ...collaborator,
      status: "Accepted",
      acceptedAt: collaborator.acceptedAt ?? new Date().toISOString()
    };

    return acceptedCollaborator;
  });

  return {
    roster: { collaborators },
    collaborator: acceptedCollaborator
  };
}

export function changeCollaboratorRole(
  roster: CollaboratorRoster,
  actor: Collaborator,
  collaboratorId: string,
  role: CollaboratorRole
) {
  assertCanPerform(actor.role, "changeCollaboratorRole");

  if (role !== "Owner" && isOnlyAcceptedOwner(roster.collaborators, collaboratorId)) {
    throw new Error("The Wedding must keep at least one accepted Owner.");
  }

  return {
    collaborators: roster.collaborators.map((collaborator) =>
      collaborator.id === collaboratorId ? { ...collaborator, role } : collaborator
    )
  };
}

export function removeCollaborator(
  roster: CollaboratorRoster,
  actor: Collaborator,
  collaboratorId: string
) {
  assertCanPerform(actor.role, "removeCollaborator");

  if (isOnlyAcceptedOwner(roster.collaborators, collaboratorId)) {
    throw new Error("The Wedding must keep at least one accepted Owner.");
  }

  return {
    collaborators: roster.collaborators.filter(
      (collaborator) => collaborator.id !== collaboratorId
    )
  };
}

function isMissingFileError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}

import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { assertCanPerform, type Collaborator } from "@/lib/collaborators";
import {
  applyTaskStatus,
  assertCanUpdateTaskStatus,
  normalizeTaskStatus,
  type PlanningTask,
  type WeddingEvent
} from "@/lib/events-and-tasks";

export type PlanningData = {
  events: WeddingEvent[];
  tasks: PlanningTask[];
};

const defaultPlanningData: PlanningData = {
  events: [
    {
      id: "mehndi",
      name: "Mehndi",
      date: "2027-02-12",
      location: "Patel family home",
      leadId: "bride-owner",
      notes: "Starter Event for the first planning loop."
    }
  ],
  tasks: [
    {
      id: "confirm-mehndi-artist",
      title: "Confirm Mehndi artist shortlist",
      eventId: "mehndi",
      ownerId: "bride-owner",
      dueDate: "2026-07-21",
      status: "In Progress",
      notes: "Compare quotes and availability."
    },
    {
      id: "draft-mehndi-flow",
      title: "Draft Mehndi flow",
      eventId: "mehndi",
      ownerId: "bride-owner",
      dueDate: "2026-07-26",
      status: "Not Started",
      notes: "Include arrival window, music, and family photo time."
    },
    {
      id: "book-ceremony-priest",
      title: "Book ceremony priest",
      ownerId: "bride-owner",
      dueDate: "2026-07-24",
      status: "Blocked",
      blockedReason: "Waiting for family to confirm the ceremony time.",
      notes: "Wedding-level Task until ceremony Event is added."
    }
  ]
};

const dataFilePath =
  process.env.PLANNING_DATA_PATH ??
  path.join(process.cwd(), "data", "planning.json");

export async function getPlanningData(): Promise<PlanningData> {
  try {
    const contents = await readFile(dataFilePath, "utf8");
    const parsed = JSON.parse(contents) as Partial<PlanningData>;

    return {
      events: parsed.events ?? defaultPlanningData.events,
      tasks: parsed.tasks ?? defaultPlanningData.tasks
    };
  } catch (error) {
    if (isMissingFileError(error)) {
      await savePlanningData(defaultPlanningData);
      return defaultPlanningData;
    }

    throw error;
  }
}

export async function savePlanningData(planningData: PlanningData) {
  await mkdir(path.dirname(dataFilePath), { recursive: true });
  await writeFile(dataFilePath, `${JSON.stringify(planningData, null, 2)}\n`, "utf8");
}

export function createEvent(
  planningData: PlanningData,
  actor: Collaborator,
  input: Omit<WeddingEvent, "id">
): PlanningData {
  assertCanPerform(actor.role, "createPlanningRecord");

  return {
    ...planningData,
    events: [
      ...planningData.events,
      {
        ...input,
        id: randomUUID()
      }
    ]
  };
}

export function updateEvent(
  planningData: PlanningData,
  actor: Collaborator,
  event: WeddingEvent
): PlanningData {
  assertCanPerform(actor.role, "editPlanningRecord");

  return {
    ...planningData,
    events: planningData.events.map((existingEvent) =>
      existingEvent.id === event.id ? event : existingEvent
    )
  };
}

export function createTask(
  planningData: PlanningData,
  actor: Collaborator,
  input: Omit<PlanningTask, "id">
): PlanningData {
  assertCanPerform(actor.role, "createPlanningRecord");
  const task = applyTaskStatus(
    {
      ...input,
      id: randomUUID()
    },
    input.status,
    input.blockedReason
  );

  return {
    ...planningData,
    tasks: [...planningData.tasks, task]
  };
}

export function updateTask(
  planningData: PlanningData,
  actor: Collaborator,
  task: PlanningTask
): PlanningData {
  assertCanPerform(actor.role, "editPlanningRecord");
  const nextTask = applyTaskStatus(task, task.status, task.blockedReason);

  return {
    ...planningData,
    tasks: planningData.tasks.map((existingTask) =>
      existingTask.id === task.id ? nextTask : existingTask
    )
  };
}

export function updateTaskStatus(
  planningData: PlanningData,
  actor: Collaborator,
  input: {
    taskId: string;
    status: FormDataEntryValue | null;
    blockedReason?: string;
  }
): PlanningData {
  const task = planningData.tasks.find((candidate) => candidate.id === input.taskId);

  if (!task) {
    throw new Error("Task was not found.");
  }

  assertCanUpdateTaskStatus(actor, task);

  const status = normalizeTaskStatus(input.status);

  return {
    ...planningData,
    tasks: planningData.tasks.map((candidate) =>
      candidate.id === task.id
        ? applyTaskStatus(candidate, status, input.blockedReason ?? task.blockedReason)
        : candidate
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

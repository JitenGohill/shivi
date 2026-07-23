export const taskStatuses = [
  "Not Started",
  "In Progress",
  "Blocked",
  "Done"
] as const;

export type TaskStatus = (typeof taskStatuses)[number];

export type WeddingEvent = {
  id: string;
  name: string;
  date: string;
  location: string;
  leadId: string;
  notes: string;
};

export type PlanningTask = {
  id: string;
  title: string;
  eventId?: string;
  vendorId?: string;
  ownerId: string;
  dueDate: string;
  status: TaskStatus;
  blockedReason?: string;
  notes: string;
};

export type ProgressSummary = {
  total: number;
  done: number;
  percent: number;
};

type TaskStatusCollaborator = {
  id: string;
  role: "Owner" | "Planner" | "Contributor";
};

export function normalizeTaskStatus(value: FormDataEntryValue | null): TaskStatus {
  return taskStatuses.find((status) => status === value) ?? "Not Started";
}

export function calculateProgress(tasks: PlanningTask[]): ProgressSummary {
  if (tasks.length === 0) {
    return {
      total: 0,
      done: 0,
      percent: 0
    };
  }

  const done = tasks.filter((task) => task.status === "Done").length;

  return {
    total: tasks.length,
    done,
    percent: Math.round((done / tasks.length) * 100)
  };
}

export function calculateEventProgress(
  events: WeddingEvent[],
  tasks: PlanningTask[]
) {
  return events.map((event) => ({
    event,
    progress: calculateProgress(tasks.filter((task) => task.eventId === event.id))
  }));
}

export function getBlockedTasks(tasks: PlanningTask[]) {
  return tasks.filter((task) => task.status === "Blocked");
}

export function getOverdueTasks(tasks: PlanningTask[], today = new Date()) {
  const todayKey = toDateKey(today);

  return tasks.filter(
    (task) => task.status !== "Done" && task.dueDate !== "" && task.dueDate < todayKey
  );
}

export function getUpcomingTasks(
  tasks: PlanningTask[],
  today = new Date(),
  windowDays = 14
) {
  const todayKey = toDateKey(today);
  const end = new Date(today);
  end.setDate(today.getDate() + windowDays);
  const endKey = toDateKey(end);

  return tasks.filter(
    (task) =>
      task.status !== "Done" &&
      task.status !== "Blocked" &&
      task.dueDate >= todayKey &&
      task.dueDate <= endKey
  );
}

export function getCurrentUserAssignments(
  tasks: PlanningTask[],
  collaboratorId: string
) {
  return tasks.filter(
    (task) => task.ownerId === collaboratorId && task.status !== "Done"
  );
}

export function getAttentionNeeded(tasks: PlanningTask[], today = new Date()) {
  const blocked = getBlockedTasks(tasks);
  const overdue = getOverdueTasks(tasks, today);

  return uniqueTasks([...blocked, ...overdue]);
}

export function canUpdateTaskStatus(
  collaborator: TaskStatusCollaborator,
  task: PlanningTask
) {
  return (
    collaborator.role === "Owner" ||
    collaborator.role === "Planner" ||
    (collaborator.role === "Contributor" && task.ownerId === collaborator.id)
  );
}

export function assertCanUpdateTaskStatus(
  collaborator: TaskStatusCollaborator,
  task: PlanningTask
) {
  if (!canUpdateTaskStatus(collaborator, task)) {
    throw new Error("Collaborator cannot update this Task Status.");
  }
}

export function applyTaskStatus(
  task: PlanningTask,
  status: TaskStatus,
  blockedReason = ""
): PlanningTask {
  return {
    ...task,
    status,
    blockedReason: status === "Blocked" ? blockedReason.trim() : ""
  };
}

function uniqueTasks(tasks: PlanningTask[]) {
  return Array.from(new Map(tasks.map((task) => [task.id, task])).values());
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateEventProgress,
  calculateProgress,
  canUpdateTaskStatus,
  applyTaskStatus,
  getAttentionNeeded,
  getBlockedTasks,
  getCurrentUserAssignments,
  getOverdueTasks,
  getUpcomingTasks,
  type PlanningTask,
  type WeddingEvent
} from "../lib/events-and-tasks.ts";
import { type Collaborator } from "../lib/collaborators.ts";

const owner: Collaborator = {
  id: "owner",
  name: "Owner",
  email: "owner@example.com",
  role: "Owner",
  status: "Accepted",
  invitedAt: "2026-07-22T00:00:00.000Z"
};

const contributor: Collaborator = {
  id: "contributor",
  name: "Contributor",
  email: "contributor@example.com",
  role: "Contributor",
  status: "Accepted",
  invitedAt: "2026-07-22T00:00:00.000Z"
};

const events: WeddingEvent[] = [
  {
    id: "mehndi",
    name: "Mehndi",
    date: "2027-02-12",
    location: "Home",
    leadId: "owner",
    notes: ""
  }
];

const tasks: PlanningTask[] = [
  {
    id: "done",
    title: "Done task",
    eventId: "mehndi",
    ownerId: "owner",
    dueDate: "2026-07-20",
    status: "Done",
    notes: ""
  },
  {
    id: "overdue",
    title: "Overdue task",
    eventId: "mehndi",
    ownerId: "owner",
    dueDate: "2026-07-21",
    status: "In Progress",
    notes: ""
  },
  {
    id: "upcoming",
    title: "Upcoming task",
    eventId: "mehndi",
    ownerId: "contributor",
    dueDate: "2026-07-26",
    status: "Not Started",
    notes: ""
  },
  {
    id: "blocked",
    title: "Blocked task",
    ownerId: "contributor",
    dueDate: "2026-07-24",
    status: "Blocked",
    blockedReason: "Waiting on a decision.",
    notes: ""
  }
];

test("Task Status drives Wedding and Event Progress", () => {
  assert.deepEqual(calculateProgress(tasks), {
    total: 4,
    done: 1,
    percent: 25
  });

  assert.deepEqual(calculateEventProgress(events, tasks)[0]?.progress, {
    total: 3,
    done: 1,
    percent: 33
  });
});

test("Dashboard rollups separate overdue, upcoming, blocked, and assigned Tasks", () => {
  const today = new Date("2026-07-22T00:00:00.000Z");

  assert.deepEqual(
    getOverdueTasks(tasks, today).map((task) => task.id),
    ["overdue"]
  );
  assert.deepEqual(
    getUpcomingTasks(tasks, today).map((task) => task.id),
    ["upcoming"]
  );
  assert.deepEqual(
    getBlockedTasks(tasks).map((task) => task.id),
    ["blocked"]
  );
  assert.deepEqual(
    getCurrentUserAssignments(tasks, "contributor").map((task) => task.id),
    ["upcoming", "blocked"]
  );
  assert.deepEqual(
    getAttentionNeeded(tasks, today).map((task) => task.id),
    ["blocked", "overdue"]
  );
});

test("Contributors can update assigned Task statuses only", () => {
  assert.equal(canUpdateTaskStatus(contributor, tasks[2]), true);
  assert.equal(canUpdateTaskStatus(contributor, tasks[1]), false);
  assert.equal(canUpdateTaskStatus(owner, tasks[1]), true);
});

test("Task Status transitions clear stale blocked reasons", () => {
  const next = applyTaskStatus(tasks[3], "In Progress", "");

  assert.equal(next.status, "In Progress");
  assert.equal(next.blockedReason, "");
});

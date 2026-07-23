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
import {
  applyVendorStatus,
  calculateVendorPipeline,
  createVendorRecord,
  normalizeVendorCategory,
  normalizeVendorEventIds,
  type Vendor
} from "../lib/vendors.ts";

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

const vendors: Vendor[] = [
  {
    id: "lotus",
    name: "Lotus Banquet Hall",
    category: "Venue",
    status: "Shortlisted",
    eventIds: ["mehndi"],
    contactName: "Anika Shah",
    contactEmail: "events@lotus.example",
    contactPhone: "555-0101",
    notes: ""
  },
  {
    id: "raaga",
    name: "Raaga Sounds",
    category: "Music",
    status: "Contacted",
    eventIds: ["mehndi"],
    contactName: "Dev Mehta",
    contactEmail: "bookings@raaga.example",
    contactPhone: "555-0102",
    notes: ""
  },
  {
    id: "maya",
    name: "Maya Beauty",
    category: "Beauty",
    status: "Contacted",
    eventIds: [],
    contactName: "",
    contactEmail: "",
    contactPhone: "",
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

test("Vendor creation requires a Vendor Category and preserves Event assignments", () => {
  const vendor = createVendorRecord("vendor-1", {
    name: "Shagun Caterers",
    category: normalizeVendorCategory("Catering"),
    status: "Researching",
    eventIds: normalizeVendorEventIds(["mehndi", "unknown", "mehndi"], new Set(["mehndi"])),
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    notes: ""
  });

  assert.equal(vendor.category, "Catering");
  assert.deepEqual(vendor.eventIds, ["mehndi"]);
  assert.throws(
    () => normalizeVendorCategory(""),
    /Vendor Category is required/
  );
});

test("Vendor Status updates use the supported pipeline statuses", () => {
  const next = applyVendorStatus(vendors[0], "Booked");

  assert.equal(next.status, "Booked");
});

test("Tasks can link to Vendors", () => {
  const vendorTask: PlanningTask = {
    id: "contract-follow-up",
    title: "Follow up on venue contract",
    vendorId: "lotus",
    ownerId: "owner",
    dueDate: "2026-07-28",
    status: "Not Started",
    notes: ""
  };

  assert.equal(vendorTask.vendorId, "lotus");
});

test("Vendor pipeline groups Vendors by status and category", () => {
  const pipeline = calculateVendorPipeline(vendors);
  const contacted = pipeline.find((summary) => summary.status === "Contacted");
  const shortlisted = pipeline.find((summary) => summary.status === "Shortlisted");

  assert.equal(contacted?.total, 2);
  assert.deepEqual(contacted?.categories, [
    {
      category: "Music",
      total: 1
    },
    {
      category: "Beauty",
      total: 1
    }
  ]);
  assert.deepEqual(shortlisted?.categories, [
    {
      category: "Venue",
      total: 1
    }
  ]);
});

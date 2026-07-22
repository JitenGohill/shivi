import assert from "node:assert/strict";
import test from "node:test";
import {
  canPerform,
  guestsCanSignIn,
  invitationCanAccessWedding,
  type Collaborator
} from "../lib/collaborators.ts";

const invitedContributor: Collaborator = {
  id: "contributor",
  name: "Asha",
  email: "asha@example.com",
  role: "Contributor",
  status: "Invited",
  invitedAt: "2026-07-22T00:00:00.000Z",
  inviteToken: "invite-token"
};

test("Owner can manage collaborator access and planning records", () => {
  assert.equal(canPerform("Owner", "inviteCollaborator"), true);
  assert.equal(canPerform("Owner", "changeCollaboratorRole"), true);
  assert.equal(canPerform("Owner", "removeCollaborator"), true);
  assert.equal(canPerform("Owner", "editWeddingDetails"), true);
  assert.equal(canPerform("Owner", "createPlanningRecord"), true);
  assert.equal(canPerform("Owner", "updateAnyTaskStatus"), true);
});

test("Planner can manage planning data without managing collaborator access", () => {
  assert.equal(canPerform("Planner", "inviteCollaborator"), false);
  assert.equal(canPerform("Planner", "changeCollaboratorRole"), false);
  assert.equal(canPerform("Planner", "createPlanningRecord"), true);
  assert.equal(canPerform("Planner", "editPlanningRecord"), true);
  assert.equal(canPerform("Planner", "updateAnyTaskStatus"), true);
});

test("Contributor can update assigned task status only", () => {
  assert.equal(canPerform("Contributor", "inviteCollaborator"), false);
  assert.equal(canPerform("Contributor", "createPlanningRecord"), false);
  assert.equal(canPerform("Contributor", "editPlanningRecord"), false);
  assert.equal(canPerform("Contributor", "updateAnyTaskStatus"), false);
  assert.equal(canPerform("Contributor", "updateAssignedTaskStatus"), true);
});

test("invites grant access only after acceptance", () => {
  assert.equal(invitationCanAccessWedding(invitedContributor), false);
  assert.equal(
    invitationCanAccessWedding({
      ...invitedContributor,
      status: "Accepted",
      acceptedAt: "2026-07-22T00:00:00.000Z"
    }),
    true
  );
});

test("Guests are never platform users", () => {
  assert.equal(guestsCanSignIn(), false);
  assert.equal(canPerform("Contributor", "signInAsGuest"), false);
  assert.equal(canPerform("Planner", "signInAsGuest"), false);
  assert.equal(canPerform("Owner", "signInAsGuest"), false);
});

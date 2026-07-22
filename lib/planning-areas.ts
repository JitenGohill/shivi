export type PlanningArea = {
  href: string;
  label: string;
  summary: string;
};

export const accessArea: PlanningArea = {
  href: "/collaborators",
  label: "Collaborators",
  summary: "Invited Owner, Planner, and Contributor access"
};

export const planningAreas: PlanningArea[] = [
  {
    href: "/events",
    label: "Events",
    summary: "Mehndi, Haldi, ceremony, reception, and related planning"
  },
  {
    href: "/tasks",
    label: "Tasks",
    summary: "Assigned work, due dates, blocked items, and Progress"
  },
  {
    href: "/vendors",
    label: "Vendors",
    summary: "Venue, catering, decor, photography, priest, beauty, music, and transport"
  },
  {
    href: "/budget",
    label: "Budget",
    summary: "Wedding Budget, Budget Items, due Payments, and paid amounts"
  },
  {
    href: "/guests",
    label: "Guests",
    summary: "Guest Groups, Guest Segments, Invitations, RSVPs, and meal planning"
  },
  {
    href: "/rituals-items",
    label: "Rituals & Items",
    summary: "Ceremony materials, participants, packing, delivery, and setup"
  },
  {
    href: "/documents-notes",
    label: "Documents & Notes",
    summary: "Contracts, quotes, menus, receipts, references, and planning context"
  },
  {
    href: "/timeline",
    label: "Timeline",
    summary: "Events, Rituals, Tasks, Payments, Reminders, Accommodation, and Transport"
  },
  {
    href: "/planning-areas",
    label: "Planning Areas",
    summary: "Outfits, decor, food, gifts, logistics, music, beauty, and guest experience"
  }
];

export function findPlanningArea(slug: string) {
  return planningAreas.find((area) => area.href === `/${slug}`);
}

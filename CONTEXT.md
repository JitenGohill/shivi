# Wedding Planning

This context describes the language for planning a multi-event Indian/Hindu wedding with shared responsibility across family, friends, and hired providers.

## Language

**Wedding**:
The full planning context for one marriage celebration, including all related events, vendors, guests, tasks, budgets, and collaborators.
_Avoid_: Checklist, project, party

**Event**:
A planned gathering within a Wedding, such as a Mehndi, Haldi, ceremony, or reception, with its own date, location, guests, vendors, tasks, and budget.
_Avoid_: Function, party, occasion

**Guest**:
A person recorded in a Wedding's planning data as an invitee to one or more Events, but who does not access the platform.
_Avoid_: User, attendee, contact

**Guest Group**:
A set of Guests planned or invited together, such as a household, family, or shared invitation group.
_Avoid_: Household, family, invite group

**Guest Segment**:
A flexible label used to group Guests for planning, such as family side, relationship, priority, location, or community.
_Avoid_: Side, category, tag

**Collaborator**:
A person with platform access who helps plan or manage part of a Wedding.
_Avoid_: Guest, helper, member

**Owner**:
A Collaborator with full control of the Wedding, including collaborators, settings, and deletion.
_Avoid_: Admin, superuser

**Planner**:
A Collaborator who can manage most planning data for a Wedding, including events, tasks, vendors, guests, budgets, and documents.
_Avoid_: Editor, manager

**Contributor**:
A Collaborator who can view planning data and update assigned items, notes, and statuses without changing the Wedding's structure.
_Avoid_: Viewer, assistant

**Task**:
A trackable planning action within a Wedding or Event, with an owner, status, due date, and optional relationship to a vendor, guest list, budget item, or document.
_Avoid_: Todo, action item, checklist item

**Task Status**:
The current progress state of a Task: Not Started, In Progress, Blocked, or Done.
_Avoid_: Stage, phase

**Vendor**:
An external provider being considered or hired for a Wedding or Event, categorized by service type such as venue, catering, decor, photography, planning, music, beauty, priest, or transport.
_Avoid_: Supplier, contractor, provider

**Vendor Category**:
The required service type for a Vendor, such as venue, catering, decor, photography, planning, music, beauty, priest, or transport.
_Avoid_: Vendor type, service

**Vendor Status**:
The current selection state of a Vendor: Researching, Contacted, Quote Received, Shortlisted, Booked, Rejected, or Cancelled.
_Avoid_: Task status, booking stage

**Budget**:
The planned spending amount for a whole Wedding or a specific Event.
_Avoid_: Cost, estimate

**Budget Item**:
An expected or allocated cost within a Budget, such as venue, catering, outfits, decor, gifts, transport, or ceremony materials.
_Avoid_: Expense, payment, line item

**Payment**:
An actual amount paid or due for a Vendor or Budget Item, with due date, paid date, amount, and status.
_Avoid_: Budget item, cost

**Payment Status**:
The current state of a Payment: Due, Scheduled, Paid, Overdue, or Cancelled.
_Avoid_: Task status, vendor status

**Invitation**:
A planning record that tracks whether a Guest has been invited to one or more Events and the state of that invitation; the platform does not send invitations in v1.
_Avoid_: Message, email, RSVP page

**Invitation Status**:
The current state of an Invitation: Not Sent, Ready, Sent, Responded, or Follow-up Needed.
_Avoid_: Guest status, delivery status

**Collaborator Invite**:
An invitation for a person to become a Collaborator with a specific role in the Wedding planning platform.
_Avoid_: Guest invitation, signup, membership request

**Reminder**:
An in-app prompt tied to a Task, Payment, Event, or Planning Area that helps Collaborators notice upcoming or overdue work; v1 does not send external notifications.
_Avoid_: Notification, alert, email reminder

**RSVP**:
A manually recorded attendance response for a Guest or Guest Group for one or more Events.
_Avoid_: Guest status, invitation status

**RSVP Status**:
The current attendance response for an RSVP: Unknown, Invited, Accepted, Declined, Maybe, or Follow-up Needed.
_Avoid_: Invitation status, attendance status

**Meal Preference**:
Guest-level food planning information, such as vegetarian, Jain, vegan, allergies, kids meal, or other catering notes.
_Avoid_: Dietary restriction, meal choice

**Seating Plan**:
Event-specific planning information for assigning Guests or Guest Groups to tables, rows, or sections; v1 does not include a floorplan editor.
_Avoid_: Floorplan, table chart

**Item**:
A physical thing needed for a Wedding or Event, tracked for planning, ownership, packing, delivery, or setup.
_Avoid_: Product, asset, inventory

**Progress**:
A calculated completion measure based primarily on Task Status, rolled up across Events, Vendors, Budget Items, Invitations, and the Wedding.
_Avoid_: Health, score

**Attention Needed**:
A dashboard signal that highlights concrete planning problems requiring Collaborator action.
_Avoid_: Risk, health, warning

**Lead**:
A Collaborator accountable for keeping an Event, Vendor, Budget Item, or planning area moving, without necessarily owning every related Task.
_Avoid_: Owner, assignee, manager

**Template**:
A reusable starting structure that can create editable Events, Tasks, Vendor Categories, Budget Items, and planning areas for a Wedding.
_Avoid_: Preset, sample wedding

**Checklist Template**:
A reusable set of Tasks that can be applied to a Vendor, Event, Ritual, Planning Area, or Item.
_Avoid_: Task template, checklist

**Ritual**:
A ceremony-specific element within an Event that may require materials, participants, timing, notes, and related Tasks.
_Avoid_: Task, tradition, ceremony step

**Document**:
A planning file or external link attached to part of a Wedding, such as a contract, quote, receipt, menu, design, spreadsheet, checklist, or reference image.
_Avoid_: Attachment, file, asset

**Note**:
Freeform planning information attached to part of a Wedding.
_Avoid_: Comment, activity, message

**Timeline**:
A chronological planning view of Events, Rituals, Tasks, Payments, and important schedule items across a Wedding.
_Avoid_: Calendar, schedule, itinerary

**Accommodation**:
Lodging planning information for Guests or Collaborators, such as hotel blocks, room needs, assignments, and dates; the platform does not book lodging in v1.
_Avoid_: Booking, reservation, hotel

**Transport**:
Movement planning for Guests, Collaborators, Vendors, or wedding parties, such as shuttles, pickups, car assignments, arrival windows, and route notes.
_Avoid_: Travel booking, ride, transfer

**Planning Area**:
A flexible section of a Wedding used to organize related Tasks, Notes, Documents, Budget Items, Vendors, and Leads around a topic such as outfits, decor, food, gifts, rituals, logistics, music, beauty, or guest experience.
_Avoid_: Category, module, folder

# Tasklet Transcript App — Product Requirements

## 1. Product purpose

Tasklet Transcript App is a private meeting transcript management system.

The application converts cleaned meeting transcripts into searchable,
structured meeting records.

The user should be able to quickly answer questions such as:

- What happened in the latest meeting with a customer?
- Which partner is connected to a customer?
- What actions are still open?
- Who attended a meeting?
- Which customers discussed a specific topic?
- What was promised during a meeting?

## 2. Primary user

The first version is designed for one Tasklet employee managing customer,
partner, and internal meeting transcripts.

Multi-user functionality is not required for the first version.

## 3. Main navigation

The application should contain these main areas:

- Dashboard
- Meetings
- Customers
- Partners
- Participants
- Actions
- Import Transcript

## 4. Dashboard

The dashboard should show:

- Total number of meetings
- Total number of customers
- Total number of partners
- Number of open actions
- Recently added meetings
- Upcoming or overdue follow-ups

## 5. Meetings

The Meetings page should:

- Display all meetings.
- Sort meetings newest first by default.
- Allow switching to oldest first.
- Allow filtering by customer.
- Allow filtering by partner.
- Allow filtering by participant.
- Allow filtering by meeting type.
- Allow searching meeting titles, summaries, topics, and transcript text.

Each meeting card should show:

- Meeting title
- Date
- Customer
- Partner
- Meeting type
- Participants
- Duration
- Number of open actions

## 6. Meeting viewer

Selecting a meeting should open a detailed viewer.

The viewer should contain sections or tabs for:

- Overview
- Summary
- Decisions
- Actions
- Open Questions
- Commercial Notes
- Full Transcript

## 7. Customers

The Customers page should show one card per customer.

Each customer card should show:

- Customer name
- Country
- Number of meetings
- Latest meeting date
- Partner involved
- Number of open actions

Selecting a customer should show its meeting history.

## 8. Partners

The Partners page should show one card per partner.

Each partner card should show:

- Partner name
- Country
- Number of meetings
- Associated customers
- Latest meeting date
- Open actions

## 9. Participants

The Participants page should show people extracted from meetings.

Each participant record may contain:

- Full name
- Company
- Role
- Email
- Meetings attended
- Actions assigned to the person

## 10. Actions

Each action item should contain:

- Description
- Owner
- Source meeting
- Due date
- Status
- Notes

Supported statuses:

- Open
- In Progress
- Waiting for Customer
- Waiting Internally
- Completed
- Cancelled

## 11. Transcript import

The import process should eventually follow this workflow:

1. User selects a cleaned transcript file.
2. The application reads the document.
3. Recognized information is extracted.
4. A review screen is displayed.
5. The user corrects the extracted information.
6. The meeting is saved.
7. The meeting becomes visible throughout the application.

The first prototype may use manually entered sample data before real DOCX
import is implemented.

## 12. First prototype scope

The initial prototype should include:

- Responsive application layout
- Sidebar navigation
- Dashboard
- Meeting list
- Meeting viewer
- Customer cards
- Partner cards
- Participant cards
- Action-item list
- Sample meeting data
- localStorage persistence
- Search
- Basic filters
- Manual meeting creation

## 13. Features postponed until later

These features are not part of the first prototype:

- User authentication
- Cloud database
- AI extraction
- Automatic email creation
- CRM integration
- Gmail integration
- Outlook integration
- Multi-user permissions
- Automatic DOCX parsing
- Mobile application
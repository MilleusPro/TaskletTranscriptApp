const sampleData = {
  meetings: [
    {
      id: 'meeting-alteco-001',
      title: 'Alteco - Tasklet Demo',
      date: '2026-06-16',
      startTime: '07:30',
      durationMinutes: 61,
      meetingType: 'Demo',
      customerId: 'customer-alteco',
      partnerId: 'partner-axel',
      participantIds: [
        'participant-francesco',
        'participant-marco',
        'participant-massimo',
        'participant-niels'
      ],
      subject: 'Tasklet Mobile WMS demo for Alteco',
      tags: ['Mobile WMS', 'Business Central', 'On-premises', 'Manufacturing', 'Labels'],
      summary: [
        'Reviewed the warehouse flow for the pilot site and aligned on the next demo steps.',
        'Confirmed that an on-premises deployment remains a requirement for the first release.'
      ],
      decisions: [
        'Use Business Central as the master for inventory and labels.',
        'Prioritise the manufacturing warehouse for the pilot.'
      ],
      openQuestions: ['Which label format will be used for pallet and carton labels?'],
      commercialNotes: ['The customer requested a separate implementation estimate for the pilot phase.'],
      actionItemIds: ['action-1', 'action-2'],
      transcript: 'The meeting opened with a review of the pilot scope ...',
      createdAt: '2026-07-21T10:00:00.000Z',
      updatedAt: '2026-07-21T10:00:00.000Z'
    },
    {
      id: 'meeting-northstar-002',
      title: 'Northstar onboarding workshop',
      date: '2026-06-24',
      startTime: '09:00',
      durationMinutes: 45,
      meetingType: 'Workshop',
      customerId: 'customer-alteco',
      partnerId: 'partner-axel',
      participantIds: ['participant-francesco', 'participant-niels', 'participant-massimo'],
      subject: 'Prepare onboarding expectations for the implementation team',
      tags: ['Onboarding', 'Project setup', 'Roles'],
      summary: ['Reviewed the onboarding plan and aligned team responsibilities for the implementation period.'],
      decisions: ['Create a shared project plan for the first four weeks.'],
      openQuestions: ['Which internal approver should sign off on the final timeline?'],
      commercialNotes: ['The partner requested a clarified statement of work before the next call.'],
      actionItemIds: ['action-3'],
      transcript: 'The team reviewed the current onboarding material and assigned owners for each workstream.',
      createdAt: '2026-07-21T11:00:00.000Z',
      updatedAt: '2026-07-21T11:00:00.000Z'
    },
    {
      id: 'meeting-greenfield-003',
      title: 'Greenfield discovery session',
      date: '2026-05-14',
      startTime: '14:00',
      durationMinutes: 30,
      meetingType: 'Discovery',
      customerId: 'customer-greenfield',
      partnerId: 'partner-summit',
      participantIds: ['participant-marco', 'participant-francesco'],
      subject: 'Discuss the current warehouse process and urgent improvements',
      tags: ['Discovery', 'Warehouse', 'Barcode scanning'],
      summary: ['Captured the current manual processes and the priorities for the initial discovery phase.'],
      decisions: ['Focus the first review on barcode scanning and inventory visibility.'],
      openQuestions: ['What is the expected timeline for a pilot environment?'],
      commercialNotes: ['No commercial commitments were made during the discovery call.'],
      actionItemIds: ['action-4'],
      transcript: 'The discovery meeting focused on the existing workflow, current pain points, and how a future pilot could be structured.',
      createdAt: '2026-07-21T12:00:00.000Z',
      updatedAt: '2026-07-21T12:00:00.000Z'
    }
  ],
  customers: [
    {
      id: 'customer-alteco',
      name: 'Alteco',
      country: 'Sweden',
      partnerId: 'partner-axel',
      meetings: ['meeting-alteco-001', 'meeting-northstar-002'],
      openActionCount: 2
    },
    {
      id: 'customer-greenfield',
      name: 'Greenfield Foods',
      country: 'Norway',
      partnerId: 'partner-summit',
      meetings: ['meeting-greenfield-003'],
      openActionCount: 1
    }
  ],
  partners: [
    {
      id: 'partner-axel',
      name: 'Northstar IT',
      country: 'Denmark',
      associatedCustomers: ['Alteco'],
      meetings: ['meeting-alteco-001', 'meeting-northstar-002'],
      openActionCount: 1
    },
    {
      id: 'partner-summit',
      name: 'Summit Solutions',
      country: 'Germany',
      associatedCustomers: ['Greenfield Foods'],
      meetings: ['meeting-greenfield-003'],
      openActionCount: 1
    }
  ],
  participants: [
    {
      id: 'participant-francesco',
      name: 'Francesco Rossi',
      company: 'Tasklet',
      role: 'Solution Consultant',
      email: 'francesco@tasklet.com',
      meetings: ['meeting-alteco-001', 'meeting-northstar-002', 'meeting-greenfield-003'],
      actions: ['action-1', 'action-3']
    },
    {
      id: 'participant-marco',
      name: 'Marco Bianchi',
      company: 'Tasklet',
      role: 'Product Manager',
      email: 'marco@tasklet.com',
      meetings: ['meeting-alteco-001', 'meeting-greenfield-003'],
      actions: ['action-2', 'action-4']
    },
    {
      id: 'participant-massimo',
      name: 'Massimo Valli',
      company: 'Alteco',
      role: 'Operations Lead',
      email: 'massimo@alteco.se',
      meetings: ['meeting-alteco-001', 'meeting-northstar-002'],
      actions: []
    },
    {
      id: 'participant-niels',
      name: 'Niels Sorensen',
      company: 'Northstar IT',
      role: 'Integration Consultant',
      email: 'niels@northstarit.dk',
      meetings: ['meeting-alteco-001', 'meeting-northstar-002'],
      actions: []
    }
  ],
  actions: [
    {
      id: 'action-1',
      description: 'Share the revised implementation plan and pilot scope',
      owner: 'Francesco Rossi',
      sourceMeetingId: 'meeting-alteco-001',
      dueDate: '2026-06-20',
      status: 'Open',
      notes: 'Needed before the next workshop'
    },
    {
      id: 'action-2',
      description: 'Confirm label requirements for the pilot warehouse',
      owner: 'Marco Bianchi',
      sourceMeetingId: 'meeting-alteco-001',
      dueDate: '2026-06-24',
      status: 'Waiting for Customer',
      notes: 'Awaiting the customer’s final label list'
    },
    {
      id: 'action-3',
      description: 'Send the onboarding checklist to the implementation team',
      owner: 'Francesco Rossi',
      sourceMeetingId: 'meeting-northstar-002',
      dueDate: '2026-06-27',
      status: 'Open',
      notes: 'Needed before the next internal checkpoint'
    },
    {
      id: 'action-4',
      description: 'Document the current warehouse workflow and pain points',
      owner: 'Marco Bianchi',
      sourceMeetingId: 'meeting-greenfield-003',
      dueDate: '2026-05-21',
      status: 'Completed',
      notes: 'Captured in the discovery notes'
    }
  ]
};

const state = {
  activeSection: 'dashboard',
  selectedMeetingId: null,
  activeViewerTab: 'overview',
  sortOrder: 'newest',
  searchQuery: ''
};

const sectionTitles = {
  dashboard: 'Dashboard',
  meetings: 'Meetings',
  customers: 'Customers',
  partners: 'Partners',
  participants: 'Participants',
  actions: 'Actions',
  import: 'Import Transcript'
};

const mainPanelIds = ['dashboard-view', 'meetings-view', 'customers-view', 'partners-view', 'participants-view', 'actions-view', 'import-view'];
const viewerTabs = ['overview', 'summary', 'decisions', 'actions', 'questions', 'commercial', 'transcript'];

function init() {
  const navigationButtons = document.querySelectorAll('.nav-button');
  const searchInput = document.getElementById('global-search');

  navigationButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.activeSection = button.dataset.section;
      state.selectedMeetingId = null;
      state.activeViewerTab = 'overview';
      renderViews();
    });
  });

  searchInput.addEventListener('input', (event) => {
    state.searchQuery = event.target.value.trim().toLowerCase();
    renderViews();
  });

  renderViews();
}

function updateNavigation(buttons) {
  const targetSection = state.selectedMeetingId ? 'meetings' : state.activeSection;

  buttons.forEach(({ button, section }) => {
    button.classList.toggle('active', section === targetSection);
  });

  const visiblePanelId = state.selectedMeetingId ? 'meetings-view' : `${targetSection}-view`;

  mainPanelIds.forEach((panelId) => {
    const panel = document.getElementById(panelId);
    if (panel) {
      panel.hidden = panelId !== visiblePanelId;
    }
  });
}

function renderViews() {
  const viewSections = {
    dashboard: document.getElementById('dashboard-view'),
    meetings: document.getElementById('meetings-view'),
    customers: document.getElementById('customers-view'),
    partners: document.getElementById('partners-view'),
    participants: document.getElementById('participants-view'),
    actions: document.getElementById('actions-view'),
    import: document.getElementById('import-view')
  };

  viewSections.dashboard.innerHTML = renderDashboard(getVisibleMeetings());

  if (state.activeSection === 'meetings' && state.selectedMeetingId) {
    const selectedMeeting = getMeetingById(state.selectedMeetingId);
    viewSections.meetings.innerHTML = selectedMeeting ? renderMeetingDetailViewer(selectedMeeting) : renderMeetingsPage();
  } else {
    viewSections.meetings.innerHTML = renderMeetingsPage();
  }

  viewSections.customers.innerHTML = renderCustomers();
  viewSections.partners.innerHTML = renderPartners();
  viewSections.participants.innerHTML = renderParticipants();
  viewSections.actions.innerHTML = renderActions();
  viewSections.import.innerHTML = renderImport();

  updateNavigation(Array.from(document.querySelectorAll('.nav-button')).map((button) => ({
    button,
    section: button.dataset.section
  })));

  document.getElementById('page-title').textContent = getPageTitle();
  attachInteractions();
}

function getVisibleMeetings() {
  const query = state.searchQuery;
  const meetings = [...sampleData.meetings].sort((a, b) => {
    const order = state.sortOrder === 'oldest' ? 1 : -1;
    return order * (new Date(a.date) - new Date(b.date));
  });

  if (!query) {
    return meetings;
  }

  return meetings.filter((meeting) => {
    const customer = getCustomerById(meeting.customerId);
    const partner = getPartnerById(meeting.partnerId);
    const participants = meeting.participantIds
      .map((id) => getParticipantById(id))
      .filter(Boolean)
      .map((participant) => participant.name.toLowerCase())
      .join(' ');

    const haystack = [
      meeting.title,
      meeting.subject,
      meeting.meetingType,
      meeting.tags.join(' '),
      customer ? customer.name : '',
      partner ? partner.name : '',
      participants
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  });
}

function renderDashboard(meetings) {
  const totalMeetings = sampleData.meetings.length;
  const totalCustomers = sampleData.customers.length;
  const totalPartners = sampleData.partners.length;
  const openActions = sampleData.actions.filter((action) => action.status !== 'Completed' && action.status !== 'Cancelled').length;
  const recentMeetings = meetings.slice(0, 3);
  const followUps = sampleData.actions.slice(0, 3);

  return `
    <section class="hero-panel">
      <div>
        <p class="eyebrow">Overview</p>
        <h3>Keep customer, partner, and follow-up activity in one calm workspace.</h3>
      </div>
      <p>Review the latest Alteco demo, recent follow-ups, and the current action queue from one screen.</p>
    </section>

    <section class="statistics" aria-label="Overview statistics">
      <article class="stat-card">
        <p class="stat-label">Total Meetings</p>
        <p class="stat-number">${totalMeetings}</p>
      </article>
      <article class="stat-card">
        <p class="stat-label">Customers</p>
        <p class="stat-number">${totalCustomers}</p>
      </article>
      <article class="stat-card">
        <p class="stat-label">Partners</p>
        <p class="stat-number">${totalPartners}</p>
      </article>
      <article class="stat-card">
        <p class="stat-label">Open Actions</p>
        <p class="stat-number">${openActions}</p>
      </article>
    </section>

    <section class="grid-2">
      <div class="panel-card">
        <div class="section-heading">
          <h3>Recent Meetings</h3>
        </div>
        <div class="meeting-list">
          ${recentMeetings.length ? recentMeetings.map((meeting) => renderMeetingCard(meeting)).join('') : '<div class="empty-state">No meetings match the current search.</div>'}
        </div>
      </div>

      <div class="panel-card">
        <div class="section-heading">
          <h3>Open Follow-ups</h3>
        </div>
        <div class="action-list">
          ${followUps.length ? followUps.map((action) => renderActionCard(action)).join('') : '<div class="empty-state">No follow-ups available.</div>'}
        </div>
      </div>
    </section>
  `;
}

function renderMeetingsPage() {
  const meetings = getVisibleMeetings();
  const list = meetings.length
    ? meetings.map((meeting) => renderMeetingListItem(meeting)).join('')
    : '<div class="empty-state">No meetings match the current search.</div>';

  return `
    <section class="panel-card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Meeting log</p>
          <h3>All meetings</h3>
        </div>
        <div class="sort-controls">
          <label class="sort-label" for="meeting-sort-order">Sort</label>
          <select id="meeting-sort-order" class="sort-select">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>
      <div class="meeting-list">${list}</div>
    </section>
  `;
}

function renderMeetingListItem(meeting) {
  const customer = getCustomerById(meeting.customerId);
  const partner = getPartnerById(meeting.partnerId);
  const participantNames = meeting.participantIds
    .map((id) => getParticipantById(id))
    .filter(Boolean)
    .map((participant) => participant.name)
    .join(', ');
  const openActions = sampleData.actions.filter((action) => action.sourceMeetingId === meeting.id && action.status !== 'Completed' && action.status !== 'Cancelled').length;

  return `
    <button class="meeting-card meeting-card--selectable js-open-meeting" type="button" data-meeting-id="${meeting.id}">
      <div class="meeting-card-header">
        <div>
          <p class="meeting-meta">${formatDate(meeting.date)} · ${meeting.durationMinutes} min</p>
          <h4>${meeting.title}</h4>
        </div>
        <span class="meeting-status ${meeting.meetingType === 'Demo' ? '' : 'completed'}">${meeting.meetingType}</span>
      </div>
      <div class="meeting-table-details">
        <div><strong>Customer</strong><span>${customer ? customer.name : 'Unassigned'}</span></div>
        <div><strong>Partner</strong><span>${partner ? partner.name : 'Unassigned'}</span></div>
        <div><strong>Participants</strong><span>${participantNames}</span></div>
        <div><strong>Open actions</strong><span>${openActions}</span></div>
      </div>
    </button>
  `;
}

function renderMeetingDetailViewer(meeting) {
  const attendeeNames = meeting.participantIds
    .map((id) => getParticipantById(id))
    .filter(Boolean)
    .map((participant) => participant.name)
    .join(', ');
  const customer = getCustomerById(meeting.customerId);
  const partner = getPartnerById(meeting.partnerId);
  const openActions = sampleData.actions.filter((action) => action.sourceMeetingId === meeting.id && action.status !== 'Completed' && action.status !== 'Cancelled').length;

  return `
    <section class="viewer-shell">
      <div class="section-heading viewer-heading">
        <div>
          <p class="eyebrow">Meeting viewer</p>
          <h3>${meeting.title}</h3>
          <p>${meeting.subject}</p>
        </div>
        <button class="secondary-button js-back-to-meetings" type="button">← Return to meetings</button>
      </div>

      <div class="viewer-meta-grid">
        <div>
          <strong>Date</strong>
          <span>${formatDate(meeting.date)} · ${meeting.startTime}</span>
        </div>
        <div>
          <strong>Customer</strong>
          <span>${customer ? customer.name : 'Unassigned'}</span>
        </div>
        <div>
          <strong>Partner</strong>
          <span>${partner ? partner.name : 'Unassigned'}</span>
        </div>
        <div>
          <strong>Participants</strong>
          <span>${attendeeNames}</span>
        </div>
        <div>
          <strong>Duration</strong>
          <span>${meeting.durationMinutes} minutes</span>
        </div>
        <div>
          <strong>Open actions</strong>
          <span>${openActions}</span>
        </div>
      </div>

      <div class="viewer-tabs" role="tablist" aria-label="Meeting sections">
        ${viewerTabs.map((tab) => `
          <button class="viewer-tab ${tab === state.activeViewerTab ? 'active' : ''} js-viewer-tab" type="button" data-viewer-tab="${tab}">
            ${formatTabLabel(tab)}
          </button>
        `).join('')}
      </div>

      <div class="viewer-content">
        ${renderViewerContent(meeting)}
      </div>
    </section>
  `;
}

function renderViewerContent(meeting) {
  const customer = getCustomerById(meeting.customerId);
  const partner = getPartnerById(meeting.partnerId);
  const actions = sampleData.actions.filter((action) => action.sourceMeetingId === meeting.id);

  switch (state.activeViewerTab) {
    case 'summary':
      return `
        <div class="viewer-block">
          <h4>Summary</h4>
          <ul class="viewer-list">
            ${meeting.summary.map((item) => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      `;
    case 'decisions':
      return `
        <div class="viewer-block">
          <h4>Decisions</h4>
          <ul class="viewer-list">
            ${meeting.decisions.map((item) => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      `;
    case 'actions':
      return `
        <div class="viewer-block">
          <h4>Actions</h4>
          <div class="action-list">
            ${actions.length ? actions.map((action) => renderActionCard(action)).join('') : '<div class="empty-state">No actions recorded.</div>'}
          </div>
        </div>
      `;
    case 'questions':
      return `
        <div class="viewer-block">
          <h4>Open Questions</h4>
          <ul class="viewer-list">
            ${meeting.openQuestions.map((item) => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      `;
    case 'commercial':
      return `
        <div class="viewer-block">
          <h4>Commercial Notes</h4>
          <ul class="viewer-list">
            ${meeting.commercialNotes.map((item) => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      `;
    case 'transcript':
      return `
        <div class="viewer-block">
          <h4>Full Transcript</h4>
          <p>${meeting.transcript}</p>
        </div>
      `;
    default:
      return `
        <div class="viewer-block">
          <h4>Overview</h4>
          <p>${meeting.subject}</p>
          <p><strong>Customer:</strong> ${customer ? customer.name : 'Unassigned'}</p>
          <p><strong>Partner:</strong> ${partner ? partner.name : 'Unassigned'}</p>
          <p><strong>Tags:</strong> ${meeting.tags.join(', ')}</p>
        </div>
      `;
  }
}

function renderCustomers() {
  const list = sampleData.customers.map((customer) => {
    const meetingCount = customer.meetings.length;
    const partner = getPartnerById(customer.partnerId);

    return `
      <article class="entity-card">
        <h4>${customer.name}</h4>
        <p>${customer.country}</p>
        <div class="entity-meta">
          <span class="badge">${meetingCount} meetings</span>
          <span>Partner: ${partner ? partner.name : 'No partner listed'}</span>
        </div>
      </article>
    `;
  }).join('');

  return `
    <section class="panel-card">
      <div class="section-heading">
        <h3>Customers</h3>
      </div>
      <div class="entity-list">${list}</div>
    </section>
  `;
}

function renderPartners() {
  const list = sampleData.partners.map((partner) => {
    return `
      <article class="entity-card">
        <h4>${partner.name}</h4>
        <p>${partner.country}</p>
        <div class="entity-meta">
          <span class="badge">${partner.meetings.length} meetings</span>
          <span>Customers: ${partner.associatedCustomers.join(', ')}</span>
        </div>
      </article>
    `;
  }).join('');

  return `
    <section class="panel-card">
      <div class="section-heading">
        <h3>Partners</h3>
      </div>
      <div class="entity-list">${list}</div>
    </section>
  `;
}

function renderParticipants() {
  const list = sampleData.participants.map((participant) => {
    return `
      <article class="entity-card">
        <h4>${participant.name}</h4>
        <p>${participant.role} · ${participant.company}</p>
        <div class="entity-meta">
          <span class="badge">${participant.meetings.length} meetings</span>
          <span>${participant.email}</span>
        </div>
      </article>
    `;
  }).join('');

  return `
    <section class="panel-card">
      <div class="section-heading">
        <h3>Participants</h3>
      </div>
      <div class="entity-list">${list}</div>
    </section>
  `;
}

function renderActions() {
  const list = sampleData.actions.map((action) => renderActionCard(action)).join('');

  return `
    <section class="panel-card">
      <div class="section-heading">
        <h3>Actions</h3>
      </div>
      <div class="action-list">${list}</div>
    </section>
  `;
}

function renderImport() {
  return `
    <section class="import-card">
      <p class="eyebrow">Prototype</p>
      <h3>Import transcript workflow</h3>
      <p>This first shell keeps the import step visible without adding any backend or document parser yet.</p>
      <p class="entity-meta">The Alteco sample meeting is already available under Recent Meetings and Meetings.</p>
    </section>
  `;
}

function renderMeetingCard(meeting) {
  const customer = getCustomerById(meeting.customerId);
  const partner = getPartnerById(meeting.partnerId);
  const participantNames = meeting.participantIds.map((id) => getParticipantById(id)).filter(Boolean).map((participant) => participant.name).join(', ');
  const statusClass = meeting.title.includes('Alteco') ? 'meeting-status' : 'meeting-status completed';

  return `
    <article class="meeting-card">
      <div class="meeting-card-header">
        <div>
          <div class="meeting-tags">
            ${partner ? `<span class="tag partner-tag">Partner: ${partner.name}</span>` : ''}
            ${customer ? `<span class="tag customer-tag">Customer: ${customer.name}</span>` : ''}
          </div>
          <h4>${meeting.title}</h4>
          <p class="meeting-meta">${formatDate(meeting.date)} · ${meeting.durationMinutes} minutes · ${meeting.participantIds.length} participants</p>
        </div>
        <span class="${statusClass}">${meeting.title.includes('Alteco') ? 'Follow-up needed' : 'Completed'}</span>
      </div>
      <p class="meeting-summary">${meeting.summary[0]}</p>
      <div class="entity-meta">
        <span class="badge">${meeting.meetingType}</span>
        <span>Participants: ${participantNames}</span>
      </div>
      <button class="secondary-button js-open-meeting" type="button" data-meeting-id="${meeting.id}">Open details</button>
    </article>
  `;
}

function renderActionCard(action) {
  const meeting = sampleData.meetings.find((entry) => entry.id === action.sourceMeetingId);

  return `
    <article class="action-card">
      <h4>${action.description}</h4>
      <p>${action.notes}</p>
      <div class="action-meta">
        <span>${action.owner}</span>
        <span> · </span>
        <span>${action.status}</span>
        <span> · Due ${formatDate(action.dueDate)}</span>
      </div>
      <p class="entity-meta">Source: ${meeting ? meeting.title : 'Unknown meeting'}</p>
    </article>
  `;
}

function attachInteractions() {
  document.querySelectorAll('.js-open-meeting').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeSection = 'meetings';
      state.selectedMeetingId = button.dataset.meetingId;
      state.activeViewerTab = 'overview';
      renderViews();
    });
  });

  document.querySelectorAll('.js-back-to-meetings').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedMeetingId = null;
      renderViews();
    });
  });

  document.querySelectorAll('.js-viewer-tab').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeViewerTab = button.dataset.viewerTab;
      renderViews();
    });
  });

  const sortSelect = document.getElementById('meeting-sort-order');
  if (sortSelect) {
    sortSelect.value = state.sortOrder;
    sortSelect.addEventListener('change', (event) => {
      state.sortOrder = event.target.value;
      renderViews();
    });
  }
}

function getMeetingById(meetingId) {
  return sampleData.meetings.find((meeting) => meeting.id === meetingId);
}

function getCustomerById(customerId) {
  return sampleData.customers.find((customer) => customer.id === customerId);
}

function getPartnerById(partnerId) {
  return sampleData.partners.find((partner) => partner.id === partnerId);
}

function getParticipantById(participantId) {
  return sampleData.participants.find((participant) => participant.id === participantId);
}

function getPageTitle() {
  if (state.activeSection === 'meetings' && state.selectedMeetingId) {
    return 'Meeting Details';
  }

  return sectionTitles[state.activeSection] || 'Dashboard';
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function formatTabLabel(tab) {
  const labels = {
    overview: 'Overview',
    summary: 'Summary',
    decisions: 'Decisions',
    actions: 'Actions',
    questions: 'Open Questions',
    commercial: 'Commercial Notes',
    transcript: 'Full Transcript'
  };

  return labels[tab] || tab;
}

document.addEventListener('DOMContentLoaded', init);

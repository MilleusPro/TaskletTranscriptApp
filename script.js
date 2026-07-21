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

const MAX_IMPORT_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const STORAGE_KEY = 'taskletTranscriptApp.meetings';

function createEmptyImportReview() {
  return {
    meetingTitle: '',
    date: '',
    customer: '',
    partner: '',
    participants: '',
    subject: ''
  };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatFileSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readStoredMeetings() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    return [];
  }
}

function writeStoredMeetings(meetings) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings));
    return true;
  } catch (error) {
    return false;
  }
}

function createMeetingId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `meeting-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getAllMeetings() {
  return [...sampleData.meetings, ...state.savedMeetings];
}

function getMeetingDisplayCustomer(meeting) {
  if (meeting.customer) {
    return meeting.customer;
  }

  if (meeting.customerId) {
    const customer = getCustomerById(meeting.customerId);
    return customer ? customer.name : 'Unassigned';
  }

  return 'Unassigned';
}

function getMeetingDisplayPartner(meeting) {
  if (meeting.partner) {
    return meeting.partner;
  }

  if (meeting.partnerId) {
    const partner = getPartnerById(meeting.partnerId);
    return partner ? partner.name : 'Unassigned';
  }

  return 'Unassigned';
}

function getMeetingDisplayParticipants(meeting) {
  if (Array.isArray(meeting.participants) && meeting.participants.length) {
    return meeting.participants.join(', ');
  }

  if (Array.isArray(meeting.participantIds) && meeting.participantIds.length) {
    return meeting.participantIds
      .map((id) => getParticipantById(id))
      .filter(Boolean)
      .map((participant) => participant.name)
      .join(', ');
  }

  return 'No participants listed';
}

function getMeetingDurationLabel(meeting) {
  if (typeof meeting.durationMinutes === 'number' && meeting.durationMinutes > 0) {
    return `${meeting.durationMinutes} min`;
  }

  return 'Imported';
}

function getImportReviewFieldValue(reviewField) {
  const field = document.querySelector(`.js-import-review-field[data-review-field="${reviewField}"]`);
  if (field) {
    return field.value;
  }

  return state.importReview[reviewField] || '';
}

function canSaveMeeting() {
  const title = getImportReviewFieldValue('meetingTitle').trim();
  const date = getImportReviewFieldValue('date').trim();
  const selectedFile = state.importSelectedFile;
  const isValidDocx = Boolean(selectedFile && typeof selectedFile.name === 'string' && selectedFile.name.toLowerCase().endsWith('.docx'));
  return Boolean(title && date && isValidDocx);
}

function updateImportSaveButtonState() {
  const saveButton = document.querySelector('.js-save-import-meeting');
  if (!saveButton) {
    return;
  }

  const shouldDisable = state.importSaveInProgress || !canSaveMeeting();
  saveButton.disabled = shouldDisable;
  saveButton.textContent = state.importSaveInProgress ? 'Saving...' : 'Save Meeting';
}

const state = {
  activeSection: 'dashboard',
  selectedMeetingId: null,
  activeViewerTab: 'overview',
  sortOrder: 'newest',
  searchQuery: '',
  savedMeetings: readStoredMeetings(),
  importSelectedFile: null,
  importError: '',
  importSuccessMessage: '',
  importReview: createEmptyImportReview(),
  importSaveInProgress: false
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
  updateImportSaveButtonState();
}

function getVisibleMeetings() {
  const query = state.searchQuery;
  const meetings = getAllMeetings().sort((a, b) => {
    const order = state.sortOrder === 'oldest' ? 1 : -1;
    const dateA = new Date(a.date || a.createdAt || '1970-01-01').getTime();
    const dateB = new Date(b.date || b.createdAt || '1970-01-01').getTime();
    return order * (dateA - dateB);
  });

  if (!query) {
    return meetings;
  }

  return meetings.filter((meeting) => {
    const customer = getMeetingDisplayCustomer(meeting);
    const partner = getMeetingDisplayPartner(meeting);
    const participants = getMeetingDisplayParticipants(meeting).toLowerCase();
    const tags = Array.isArray(meeting.tags) ? meeting.tags.join(' ') : '';

    const haystack = [
      meeting.title,
      meeting.subject,
      meeting.meetingType,
      tags,
      customer,
      partner,
      participants
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  });
}

function renderDashboard(meetings) {
  const totalMeetings = getAllMeetings().length;
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
  const customer = getMeetingDisplayCustomer(meeting);
  const partner = getMeetingDisplayPartner(meeting);
  const participantNames = getMeetingDisplayParticipants(meeting);
  const openActions = sampleData.actions.filter((action) => action.sourceMeetingId === meeting.id && action.status !== 'Completed' && action.status !== 'Cancelled').length;

  return `
    <button class="meeting-card meeting-card--selectable js-open-meeting" type="button" data-meeting-id="${meeting.id}">
      <div class="meeting-card-header">
        <div>
          <p class="meeting-meta">${formatDate(meeting.date)} · ${getMeetingDurationLabel(meeting)}</p>
          <h4>${meeting.title}</h4>
        </div>
        <span class="meeting-status ${meeting.meetingType === 'Demo' ? '' : 'completed'}">${meeting.meetingType || 'Imported'}</span>
      </div>
      <div class="meeting-table-details">
        <div><strong>Customer</strong><span>${customer}</span></div>
        <div><strong>Partner</strong><span>${partner}</span></div>
        <div><strong>Participants</strong><span>${participantNames}</span></div>
        <div><strong>Open actions</strong><span>${openActions}</span></div>
      </div>
    </button>
  `;
}

function renderMeetingDetailViewer(meeting) {
  const attendeeNames = getMeetingDisplayParticipants(meeting);
  const customer = getMeetingDisplayCustomer(meeting);
  const partner = getMeetingDisplayPartner(meeting);
  const openActions = sampleData.actions.filter((action) => action.sourceMeetingId === meeting.id && action.status !== 'Completed' && action.status !== 'Cancelled').length;
  const durationLabel = typeof meeting.durationMinutes === 'number' && meeting.durationMinutes > 0 ? `${meeting.durationMinutes} minutes` : 'Not captured yet';
  const dateLabel = meeting.date ? `${formatDate(meeting.date)}${meeting.startTime ? ` · ${meeting.startTime}` : ''}` : 'Date not available';
  const subjectText = meeting.subject || 'No subject captured yet.';

  return `
    <section class="viewer-shell">
      <div class="section-heading viewer-heading">
        <div>
          <p class="eyebrow">Meeting viewer</p>
          <h3>${meeting.title}</h3>
          <p>${subjectText}</p>
        </div>
        <button class="secondary-button js-back-to-meetings" type="button">← Return to meetings</button>
      </div>

      <div class="viewer-meta-grid">
        <div>
          <strong>Date</strong>
          <span>${dateLabel}</span>
        </div>
        <div>
          <strong>Customer</strong>
          <span>${customer}</span>
        </div>
        <div>
          <strong>Partner</strong>
          <span>${partner}</span>
        </div>
        <div>
          <strong>Participants</strong>
          <span>${attendeeNames}</span>
        </div>
        <div>
          <strong>Duration</strong>
          <span>${durationLabel}</span>
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
  const customer = getMeetingDisplayCustomer(meeting);
  const partner = getMeetingDisplayPartner(meeting);
  const actions = sampleData.actions.filter((action) => action.sourceMeetingId === meeting.id);
  const summaryItems = Array.isArray(meeting.summary) && meeting.summary.length ? meeting.summary : [];
  const decisionsItems = Array.isArray(meeting.decisions) && meeting.decisions.length ? meeting.decisions : [];
  const questionItems = Array.isArray(meeting.openQuestions) && meeting.openQuestions.length ? meeting.openQuestions : [];
  const commercialItems = Array.isArray(meeting.commercialNotes) && meeting.commercialNotes.length ? meeting.commercialNotes : [];
  const tags = Array.isArray(meeting.tags) && meeting.tags.length ? meeting.tags.join(', ') : 'No tags captured yet.';
  const transcriptText = meeting.transcript || 'Document text extraction has not been implemented yet.';
  const fileName = meeting.originalFileName ? meeting.originalFileName : 'No file name captured yet.';

  switch (state.activeViewerTab) {
    case 'summary':
      return `
        <div class="viewer-block">
          <h4>Summary</h4>
          ${summaryItems.length ? `<ul class="viewer-list">${summaryItems.map((item) => `<li>${item}</li>`).join('')}</ul>` : '<p>No summary has been extracted yet.</p>'}
        </div>
      `;
    case 'decisions':
      return `
        <div class="viewer-block">
          <h4>Decisions</h4>
          ${decisionsItems.length ? `<ul class="viewer-list">${decisionsItems.map((item) => `<li>${item}</li>`).join('')}</ul>` : '<p>No decisions have been extracted yet.</p>'}
        </div>
      `;
    case 'actions':
      return `
        <div class="viewer-block">
          <h4>Actions</h4>
          <div class="action-list">
            ${actions.length ? actions.map((action) => renderActionCard(action)).join('') : '<div class="empty-state">No actions have been extracted yet.</div>'}
          </div>
        </div>
      `;
    case 'questions':
      return `
        <div class="viewer-block">
          <h4>Open Questions</h4>
          ${questionItems.length ? `<ul class="viewer-list">${questionItems.map((item) => `<li>${item}</li>`).join('')}</ul>` : '<p>No open questions have been extracted yet.</p>'}
        </div>
      `;
    case 'commercial':
      return `
        <div class="viewer-block">
          <h4>Commercial Notes</h4>
          ${commercialItems.length ? `<ul class="viewer-list">${commercialItems.map((item) => `<li>${item}</li>`).join('')}</ul>` : '<p>No commercial notes have been extracted yet.</p>'}
        </div>
      `;
    case 'transcript':
      return `
        <div class="viewer-block">
          <h4>Full Transcript</h4>
          <p>${transcriptText}</p>
        </div>
      `;
    default:
      return `
        <div class="viewer-block">
          <h4>Overview</h4>
          <p>${meeting.subject || 'No subject captured yet.'}</p>
          <p><strong>Customer:</strong> ${customer}</p>
          <p><strong>Partner:</strong> ${partner}</p>
          <p><strong>Participants:</strong> ${getMeetingDisplayParticipants(meeting)}</p>
          <p><strong>Date:</strong> ${meeting.date ? formatDate(meeting.date) : 'Date not available'}</p>
          <p><strong>Original file:</strong> ${fileName}</p>
          <p><strong>Tags:</strong> ${tags}</p>
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
  const selectedFile = state.importSelectedFile;
  const reviewVisible = Boolean(selectedFile);
  const errorMessage = state.importError
    ? `<p class="import-error" role="alert">${escapeHtml(state.importError)}</p>`
    : '';
  const successMessage = state.importSuccessMessage
    ? `<p class="import-success" role="status">${escapeHtml(state.importSuccessMessage)}</p>`
    : '';
  const fileSummary = selectedFile
    ? `
      <div class="import-file-summary" role="status">
        <p class="import-file-name">${escapeHtml(selectedFile.name)}</p>
        <p class="import-file-size">${escapeHtml(formatFileSize(selectedFile.size))}</p>
      </div>
    `
    : '<p class="import-hint">Choose a cleaned DOCX transcript to begin the review workflow.</p>';

  const reviewPanel = reviewVisible ? `
    <div class="import-review-panel">
      <div class="section-heading">
        <h4>Review meeting details</h4>
      </div>
      <div class="import-review-grid">
        <label class="import-field-group">
          <span>Meeting title</span>
          <input class="import-field js-import-review-field" type="text" value="${escapeHtml(state.importReview.meetingTitle)}" data-review-field="meetingTitle" placeholder="Meeting title">
        </label>
        <label class="import-field-group">
          <span>Date</span>
          <input class="import-field js-import-review-field" type="date" value="${escapeHtml(state.importReview.date)}" data-review-field="date">
        </label>
        <label class="import-field-group">
          <span>Customer</span>
          <input class="import-field js-import-review-field" type="text" value="${escapeHtml(state.importReview.customer)}" data-review-field="customer" placeholder="Customer">
        </label>
        <label class="import-field-group">
          <span>Partner</span>
          <input class="import-field js-import-review-field" type="text" value="${escapeHtml(state.importReview.partner)}" data-review-field="partner" placeholder="Partner">
        </label>
        <label class="import-field-group import-field-group--full">
          <span>Participants</span>
          <input class="import-field js-import-review-field" type="text" value="${escapeHtml(state.importReview.participants)}" data-review-field="participants" placeholder="Participants">
        </label>
        <label class="import-field-group import-field-group--full">
          <span>Subject</span>
          <textarea class="import-field import-field--textarea js-import-review-field" data-review-field="subject" placeholder="Subject">${escapeHtml(state.importReview.subject)}</textarea>
        </label>
      </div>
      <div class="import-actions">
        <button class="primary-button js-save-import-meeting" type="button">Save Meeting</button>
        <p class="import-note">A valid title, date, and DOCX file are required before saving. Real document extraction will be added later.</p>
      </div>
    </div>
  ` : '';

  return `
    <section class="import-card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Import transcript</p>
          <h3>Upload a cleaned meeting transcript</h3>
        </div>
      </div>
      <p class="import-description">Select a DOCX file to start the review step. Document parsing and automatic extraction will be added later.</p>

      <div id="import-dropzone" class="import-dropzone">
        <input id="import-file-input" class="sr-only" type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document">
        <p class="import-dropzone-title">Drag and drop your DOCX transcript here</p>
        <p class="import-dropzone-description">Only .docx files are supported for this prototype.</p>
        <button class="secondary-button import-file-trigger" type="button">Choose DOCX file</button>
      </div>

      <div class="import-notes">
        <p class="entity-meta">Supported format: .docx only</p>
        <p class="entity-meta">Maximum file size: 10 MB</p>
      </div>

      ${errorMessage}
      ${successMessage}
      ${fileSummary}
      ${reviewPanel}
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

function handleImportFileSelection(file) {
  if (!file) {
    return;
  }

  state.importSuccessMessage = '';

  if (!file.name.toLowerCase().endsWith('.docx')) {
    state.importSelectedFile = null;
    state.importError = 'Unsupported file type. Please choose a .docx file.';
    state.importReview = createEmptyImportReview();
    renderViews();
    return;
  }

  if (file.size > MAX_IMPORT_FILE_SIZE_BYTES) {
    state.importSelectedFile = null;
    state.importError = 'The selected file is too large. Please choose a file smaller than 10 MB.';
    state.importReview = createEmptyImportReview();
    renderViews();
    return;
  }

  state.importSelectedFile = {
    name: file.name,
    size: file.size
  };
  state.importError = '';
  state.importReview = state.importReview || createEmptyImportReview();
  renderViews();
  updateImportSaveButtonState();
}

function handleSaveMeeting() {
  if (state.importSaveInProgress || !canSaveMeeting()) {
    return;
  }

  state.importError = '';
  state.importSuccessMessage = '';
  state.importSaveInProgress = true;
  renderViews();
  updateImportSaveButtonState();

  const title = state.importReview.meetingTitle.trim();
  const date = state.importReview.date.trim();
  const subject = state.importReview.subject.trim();
  const customer = state.importReview.customer.trim();
  const partner = state.importReview.partner.trim();
  const participants = state.importReview.participants
    .split(',')
    .map((participant) => participant.trim())
    .filter(Boolean);

  const meeting = {
    id: createMeetingId(),
    title,
    date,
    startTime: '',
    durationMinutes: 0,
    meetingType: 'Imported',
    customerId: null,
    partnerId: null,
    participantIds: [],
    subject,
    tags: [],
    summary: [],
    decisions: [],
    openQuestions: [],
    commercialNotes: [],
    actionItemIds: [],
    transcript: '',
    originalFileName: state.importSelectedFile ? state.importSelectedFile.name : '',
    customer,
    partner,
    participants,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const updatedMeetings = [meeting, ...state.savedMeetings];
  const storedSuccessfully = writeStoredMeetings(updatedMeetings);

  if (!storedSuccessfully) {
    state.importError = 'Unable to save the meeting. Please try again.';
    state.importSaveInProgress = false;
    renderViews();
    return;
  }

  state.savedMeetings = updatedMeetings;
  state.importSelectedFile = null;
  state.importReview = createEmptyImportReview();
  state.importSuccessMessage = `Meeting saved successfully as ${meeting.title}.`;
  state.importSaveInProgress = false;
  renderViews();
  updateImportSaveButtonState();
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

  document.querySelectorAll('.js-import-review-field').forEach((field) => {
    field.addEventListener('input', () => {
      const reviewField = field.dataset.reviewField;
      if (reviewField) {
        state.importReview[reviewField] = field.value;
      }

      if (reviewField === 'meetingTitle' || reviewField === 'date') {
        updateImportSaveButtonState();
      }
    });
  });

  document.querySelectorAll('.js-save-import-meeting').forEach((button) => {
    button.addEventListener('click', () => {
      handleSaveMeeting();
    });
  });

  const importFileTrigger = document.querySelector('.import-file-trigger');
  const importFileInput = document.getElementById('import-file-input');
  const importDropzone = document.getElementById('import-dropzone');

  if (importFileTrigger && importFileInput) {
    importFileTrigger.addEventListener('click', () => {
      importFileInput.click();
    });
  }

  if (importFileInput) {
    importFileInput.addEventListener('change', (event) => {
      handleImportFileSelection(event.target.files?.[0]);
      event.target.value = '';
    });
  }

  if (importDropzone && importFileInput) {
    const addDragState = (event) => {
      event.preventDefault();
      importDropzone.classList.add('drag-over');
    };
    const removeDragState = (event) => {
      event.preventDefault();
      importDropzone.classList.remove('drag-over');
    };

    importDropzone.addEventListener('dragenter', addDragState);
    importDropzone.addEventListener('dragover', addDragState);
    importDropzone.addEventListener('dragleave', removeDragState);
    importDropzone.addEventListener('dragend', removeDragState);
    importDropzone.addEventListener('drop', (event) => {
      removeDragState(event);
      handleImportFileSelection(event.dataTransfer?.files?.[0]);
    });
  }

  const sortSelect = document.getElementById('meeting-sort-order');
  if (sortSelect) {
    sortSelect.value = state.sortOrder;
    sortSelect.addEventListener('change', (event) => {
      state.sortOrder = event.target.value;
      renderViews();
    });
  }

  const topImportButton = document.querySelector('.topbar .primary-button');
  if (topImportButton) {
    topImportButton.addEventListener('click', () => {
      state.activeSection = 'import';
      state.selectedMeetingId = null;
      state.activeViewerTab = 'overview';
      renderViews();
    });
  }
}

function getMeetingById(meetingId) {
  return getAllMeetings().find((meeting) => meeting.id === meetingId);
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

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
      createdAt: '2026-07-21T10:00:00.000Z',
      updatedAt: '2026-07-21T10:00:00.000Z'
    }
  ],
  customers: [
    {
      id: 'customer-alteco',
      name: 'Alteco',
      country: 'Sweden',
      partnerId: 'partner-axel',
      meetings: ['meeting-alteco-001'],
      openActionCount: 2
    }
  ],
  partners: [
    {
      id: 'partner-axel',
      name: 'Northstar IT',
      country: 'Denmark',
      associatedCustomers: ['Alteco'],
      meetings: ['meeting-alteco-001'],
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
      meetings: ['meeting-alteco-001'],
      actions: ['action-1']
    },
    {
      id: 'participant-marco',
      name: 'Marco Bianchi',
      company: 'Tasklet',
      role: 'Product Manager',
      email: 'marco@tasklet.com',
      meetings: ['meeting-alteco-001'],
      actions: ['action-2']
    },
    {
      id: 'participant-massimo',
      name: 'Massimo Valli',
      company: 'Alteco',
      role: 'Operations Lead',
      email: 'massimo@alteco.se',
      meetings: ['meeting-alteco-001'],
      actions: []
    },
    {
      id: 'participant-niels',
      name: 'Niels Sorensen',
      company: 'Northstar IT',
      role: 'Integration Consultant',
      email: 'niels@northstarit.dk',
      meetings: ['meeting-alteco-001'],
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
    }
  ]
};

const state = {
  activeSection: 'dashboard',
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

function init() {
  const navigationButtons = document.querySelectorAll('.nav-button');
  const searchInput = document.getElementById('global-search');
  const pageTitle = document.getElementById('page-title');

  navigationButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.activeSection = button.dataset.section;
      updateNavigation(buttonsToMap(navigationButtons));
      pageTitle.textContent = sectionTitles[state.activeSection];
      renderViews();
    });
  });

  searchInput.addEventListener('input', (event) => {
    state.searchQuery = event.target.value.trim().toLowerCase();
    renderViews();
  });

  renderViews();
}

function buttonsToMap(buttons) {
  return Array.from(buttons).map((button) => ({
    button,
    section: button.dataset.section
  }));
}

function updateNavigation(buttons) {
  buttons.forEach(({ button, section }) => {
    button.classList.toggle('active', section === state.activeSection);
  });

  Object.entries(document.querySelectorAll('.view-panel')).forEach(([key, panel]) => {
    panel.hidden = panel.id !== `${state.activeSection}-view`;
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

  const visibleMeetings = getVisibleMeetings();

  viewSections.dashboard.innerHTML = renderDashboard(visibleMeetings);
  viewSections.meetings.innerHTML = renderMeetings(visibleMeetings);
  viewSections.customers.innerHTML = renderCustomers();
  viewSections.partners.innerHTML = renderPartners();
  viewSections.participants.innerHTML = renderParticipants();
  viewSections.actions.innerHTML = renderActions();
  viewSections.import.innerHTML = renderImport();

  updateNavigation(buttonsToMap(document.querySelectorAll('.nav-button')));
  document.getElementById('page-title').textContent = sectionTitles[state.activeSection];
}

function getVisibleMeetings() {
  const query = state.searchQuery;
  if (!query) {
    return [...sampleData.meetings].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  return sampleData.meetings.filter((meeting) => {
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

function renderMeetings(meetings) {
  const list = meetings.length ? meetings.map((meeting) => renderMeetingCard(meeting)).join('') : '<div class="empty-state">No meetings match the current search.</div>';

  return `
    <section class="panel-card">
      <div class="section-heading">
        <h3>All Meetings</h3>
      </div>
      <div class="meeting-list">${list}</div>
    </section>
  `;
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

function getCustomerById(customerId) {
  return sampleData.customers.find((customer) => customer.id === customerId);
}

function getPartnerById(partnerId) {
  return sampleData.partners.find((partner) => partner.id === partnerId);
}

function getParticipantById(participantId) {
  return sampleData.participants.find((participant) => participant.id === participantId);
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

document.addEventListener('DOMContentLoaded', init);

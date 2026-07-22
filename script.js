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
    dateText: '',
    startTime: '',
    duration: '',
    customer: '',
    partner: '',
    participants: '',
    subject: ''
  };
}

function createEmptyExtractedSections() {
  return {
    summary: [],
    decisions: [],
    actions: [],
    openQuestions: [],
    commercialNotes: [],
    cleanedTranscript: '',
    extraSections: []
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

function getImportPreviewExcerpt(value, maxLength = 320) {
  if (!value) {
    return '';
  }

  const normalized = String(value).replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return '';
  }

  return normalized.length > maxLength ? `${normalized.slice(0, maxLength)}…` : normalized;
}

function normalizeExtractedDate(value) {
  const rawValue = String(value || '').trim();
  if (!rawValue) {
    return '';
  }

  const compactValue = rawValue.replace(/\s+/g, ' ');

  if (/^\d{4}-\d{2}-\d{2}$/.test(compactValue)) {
    return compactValue;
  }

  const monthMap = {
    jan: 1,
    january: 1,
    feb: 2,
    february: 2,
    mar: 3,
    march: 3,
    apr: 4,
    april: 4,
    may: 5,
    jun: 6,
    june: 6,
    jul: 7,
    july: 7,
    aug: 8,
    august: 8,
    sep: 9,
    sept: 9,
    september: 9,
    oct: 10,
    october: 10,
    nov: 11,
    november: 11,
    dec: 12,
    december: 12
  };

  const datePatterns = [
    { regex: /^(\d{4})-(\d{1,2})-(\d{1,2})$/, order: ['year', 'month', 'day'] },
    { regex: /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/, order: ['year', 'month', 'day'] },
    { regex: /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/, order: ['day', 'month', 'year'] },
    { regex: /^(\w{3,9})\s+(\d{1,2}),?\s+(\d{4})$/i, order: ['monthName', 'day', 'year'] },
    { regex: /^(\d{1,2})\s+(\w{3,9})\s+(\d{4})$/i, order: ['day', 'monthName', 'year'] }
  ];

  for (const pattern of datePatterns) {
    const match = compactValue.match(pattern.regex);
    if (!match) {
      continue;
    }

    const values = {
      day: null,
      month: null,
      year: null
    };

    pattern.order.forEach((part, index) => {
      const token = match[index + 1];
      if (!token) {
        return;
      }

      if (part === 'day') {
        values.day = Number(token);
      } else if (part === 'month') {
        values.month = Number(token);
      } else if (part === 'year') {
        values.year = Number(token);
      } else if (part === 'monthName') {
        values.month = monthMap[token.toLowerCase()];
      }
    });

    if (!values.month || !values.day || !values.year || values.month > 12 || values.day > 31) {
      continue;
    }

    const monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][values.month - 1];
    const isLeapYear = (values.year % 4 === 0 && values.year % 100 !== 0) || values.year % 400 === 0;
    const maxDay = values.month === 2 && isLeapYear ? 29 : monthLength;

    if (values.day > maxDay) {
      continue;
    }

    return `${String(values.year).padStart(4, '0')}-${String(values.month).padStart(2, '0')}-${String(values.day).padStart(2, '0')}`;
  }

  return '';
}

const metadataLabelMap = {
  'meeting title': 'meetingTitle',
  'meeting date': 'date',
  'date': 'date',
  'start time': 'startTime',
  'duration': 'duration',
  'main participants': 'participants',
  'participants': 'participants',
  'purpose': 'subject',
  'subject': 'subject',
  'customer': 'customer',
  'partner': 'partner'
};

const sectionHeadingMap = {
  'meeting summary': 'summary',
  'executive summary': 'summary',
  'key decisions': 'decisions',
  'key decisions and working assumptions': 'decisions',
  'key decisions and understandings': 'decisions',
  'follow up items': 'actions',
  'follow-up items': 'actions',
  'action items': 'actions',
  'action points': 'actions',
  'open questions': 'openQuestions',
  'open questions from the meeting': 'openQuestions',
  'open questions items to confirm': 'openQuestions',
  'commercial notes': 'commercialNotes',
  'commercial and partner notes': 'commercialNotes',
  'commercial and licensing notes from the call': 'commercialNotes',
  'cleaned transcript': 'cleanedTranscript',
  'cleaned transcript by topic': 'cleanedTranscript'
};

function normalizeHeadingText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getSectionKeyForHeading(headingText) {
  return sectionHeadingMap[normalizeHeadingText(headingText)] || null;
}

function normalizeLabel(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function parseHtmlMetadata(html) {
  if (!html || typeof DOMParser === 'undefined') {
    return {};
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const metadata = {};

  const rows = Array.from(doc.querySelectorAll('table tr'));
  rows.forEach((row) => {
    const cells = Array.from(row.querySelectorAll('th, td'));
    if (cells.length < 2) {
      return;
    }

    const labelText = normalizeLabel(cells[0].textContent);
    const valueText = cells.slice(1).map((cell) => cell.textContent.trim()).filter(Boolean).join(' ').trim();
    if (!labelText || !valueText) {
      return;
    }

    const fieldName = metadataLabelMap[labelText];
    if (!fieldName || metadata[fieldName]) {
      return;
    }

    if (fieldName === 'date') {
      metadata.dateText = valueText;
      metadata.date = normalizeExtractedDate(valueText);
      return;
    }

    metadata[fieldName] = valueText;
  });

  const paragraphs = Array.from(doc.querySelectorAll('p'));
  paragraphs.forEach((p) => {
    const strong = p.querySelector('strong, b');
    const text = p.textContent.trim();
    if (!text || !strong) {
      return;
    }

    const labelText = normalizeLabel(strong.textContent);
    const fieldName = metadataLabelMap[labelText];
    if (!fieldName || metadata[fieldName]) {
      return;
    }

    let valueText = text.replace(strong.textContent, '').trim();
    valueText = valueText.replace(/^[:\-\s]+/, '').trim();
    if (!valueText) {
      return;
    }

    if (fieldName === 'date') {
      metadata.dateText = valueText;
      metadata.date = normalizeExtractedDate(valueText);
      return;
    }

    metadata[fieldName] = valueText;
  });

  const titleCandidate = extractImplicitMeetingTitle(doc);
  if (!metadata.meetingTitle && titleCandidate) {
    metadata.meetingTitle = titleCandidate;
  }

  return metadata;
}

function extractImplicitMeetingTitle(doc) {
  const stopMarkers = ['cleaned meeting transcript and follow-up notes', 'cleaned transcript'];
  const bodyChildren = Array.from(doc.body.children);

  for (const node of bodyChildren) {
    if (!node.textContent.trim()) {
      continue;
    }

    const text = node.textContent.trim();
    const normalized = text.toLowerCase();
    if (stopMarkers.some((marker) => normalized.includes(marker))) {
      return '';
    }

    if (node.tagName.match(/^H[1-3]$/) || node.tagName === 'P') {
      if (normalized === 'cleaned meeting transcript and follow-up notes') {
        continue;
      }

      const trimmed = text.replace(/^\s*Document title\s*[:\-]\s*/i, '').trim();
      if (trimmed && trimmed.toLowerCase() !== 'cleaned meeting transcript and follow-up notes') {
        return trimmed;
      }
    }

    if (node.tagName === 'TABLE') {
      continue;
    }
  }

  return '';
}

function normalizeBlockText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function convertHtmlToBlocks(html) {
  if (!html || typeof DOMParser === 'undefined') {
    return [];
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const blocks = [];

  const pushBlock = (type, text) => {
    const normalized = normalizeBlockText(text);
    if (!normalized) {
      return;
    }
    blocks.push({ type, text: normalized });
  };

  const parseList = (list) => {
    Array.from(list.querySelectorAll('li')).forEach((li) => {
      pushBlock('listItem', li.textContent);
    });
  };

  const parseTable = (table) => {
    Array.from(table.querySelectorAll('tr')).forEach((row) => {
      const cells = Array.from(row.querySelectorAll('th, td'));
      const rowText = cells.map((cell) => normalizeBlockText(cell.textContent)).filter(Boolean).join(' | ');
      if (rowText) {
        pushBlock('tableRow', rowText);
      }
    });
  };

  const parseElement = (element) => {
    const tag = element.tagName.toLowerCase();
    if (tag.match(/^h[1-3]$/)) {
      pushBlock('heading', element.textContent);
      return;
    }

    if (tag === 'p') {
      const strong = element.querySelector('strong, b');
      if (strong && normalizeBlockText(strong.textContent) === normalizeBlockText(element.textContent)) {
        pushBlock('heading', element.textContent);
        return;
      }

      const text = normalizeBlockText(element.textContent);
      if (text) {
        pushBlock('paragraph', text);
      }
      return;
    }

    if (tag === 'ul' || tag === 'ol') {
      parseList(element);
      return;
    }

    if (tag === 'table') {
      parseTable(element);
      return;
    }

    Array.from(element.childNodes).forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        parseElement(child);
      } else if (child.nodeType === Node.TEXT_NODE) {
        const text = normalizeBlockText(child.textContent);
        if (text) {
          pushBlock('paragraph', text);
        }
      }
    });
  };

  Array.from(doc.body.childNodes).forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      parseElement(node);
    } else if (node.nodeType === Node.TEXT_NODE) {
      const text = normalizeBlockText(node.textContent);
      if (text) {
        pushBlock('paragraph', text);
      }
    }
  });

  return blocks;
}

function parseTranscriptMetadata(extractedText, extractedHtml) {
  const metadata = {
    meetingTitle: '',
    date: '',
    dateText: '',
    startTime: '',
    duration: '',
    customer: '',
    partner: '',
    participants: '',
    subject: ''
  };

  const htmlMetadata = parseHtmlMetadata(extractedHtml);
  Object.assign(metadata, htmlMetadata);

  if (metadata.meetingTitle && metadata.date) {
    return metadata;
  }

  const textLines = String(extractedText)
    .split(/\r?\n/)
    .map((line) => line.replace(/\t/g, ' ').trim());

  const labelMap = {
    'meeting title': 'meetingTitle',
    'date': 'date',
    'start time': 'startTime',
    'duration': 'duration',
    'customer': 'customer',
    'partner': 'partner',
    'participants': 'participants',
    'main participants': 'participants',
    'purpose': 'subject',
    'subject': 'subject'
  };

  for (let index = 0; index < textLines.length; index += 1) {
    const line = textLines[index];
    if (!line) {
      continue;
    }

    const match = line.match(/^([A-Za-z][A-Za-z ]+?)\s*:\s*(.*)$/);
    if (!match) {
      continue;
    }

    const rawLabel = match[1].trim().toLowerCase();
    const normalizedLabel = rawLabel.replace(/\s+/g, ' ');
    const targetField = labelMap[normalizedLabel];
    if (!targetField || metadata[targetField]) {
      continue;
    }

    let value = match[2].trim();
    if (!value) {
      let nextIndex = index + 1;
      while (nextIndex < textLines.length && !textLines[nextIndex].trim()) {
        nextIndex += 1;
      }
      if (nextIndex < textLines.length) {
        value = textLines[nextIndex].trim();
        index = nextIndex;
      }
    }

    if (!value) {
      continue;
    }

    if (targetField === 'date' && !metadata.date) {
      metadata.dateText = value;
      metadata.date = normalizeExtractedDate(value);
      continue;
    }

    metadata[targetField] = value;
  }

  return metadata;
}

function extractTranscriptSections(extractedText, extractedHtml) {
  const sections = createEmptyExtractedSections();
  const blocks = extractTextBlocks(extractedText, extractedHtml);

  state.importParserDebug.blocks = blocks;
  state.importParserDebug.headings = [];

  if (!extractedText && !extractedHtml) {
    return sections;
  }

  const appendLine = (sectionKey, line) => {
    if (!sectionKey) {
      return;
    }

    const trimmedLine = String(line || '').trim();
    if (!trimmedLine) {
      return;
    }

    if (sectionKey === 'cleanedTranscript') {
      sections.cleanedTranscript = sections.cleanedTranscript ? `${sections.cleanedTranscript}\n${trimmedLine}` : trimmedLine;
      return;
    }

    sections[sectionKey].push(trimmedLine);
  };

  let activeSection = null;
  let activeExtraSection = null;
  const debugHeadings = [];

  const closeActiveExtraSection = () => {
    if (activeExtraSection) {
      sections.extraSections.push(activeExtraSection);
      activeExtraSection = null;
    }
  };

  blocks.forEach((block) => {
    const headingKey = getSectionKeyForHeading(block.text);

    if (headingKey) {
      debugHeadings.push({ heading: block.text, section: headingKey });
      closeActiveExtraSection();
      activeSection = headingKey;
      return;
    }

    if (block.type === 'heading') {
      if (activeSection === 'cleanedTranscript') {
        debugHeadings.push({ heading: block.text, section: 'cleanedTranscript' });
        appendLine('cleanedTranscript', block.text);
        return;
      }

      debugHeadings.push({ heading: block.text, section: 'extraSections' });
      closeActiveExtraSection();
      activeExtraSection = {
        heading: block.text,
        lines: []
      };
      activeSection = null;
      return;
    }

    if (activeSection) {
      if (block.type === 'tableRow' || block.type === 'listItem' || block.type === 'paragraph' || block.type === 'heading') {
        appendLine(activeSection, block.text);
      }
      return;
    }

    if (activeExtraSection) {
      if (block.type === 'tableRow' || block.type === 'listItem' || block.type === 'paragraph' || block.type === 'heading') {
        const trimmedLine = String(block.text || '').trim();
        if (trimmedLine) {
          activeExtraSection.lines.push(trimmedLine);
        }
      }
    }
  });

  closeActiveExtraSection();
  state.importParserDebug.headings = debugHeadings;

  if (!sections.cleanedTranscript) {
    sections.cleanedTranscript = String(extractedText || extractedHtml).trim();
  }

  return sections;
}

function extractTextBlocks(extractedText, extractedHtml) {
  if (extractedHtml && typeof DOMParser !== 'undefined') {
    return convertHtmlToBlocks(extractedHtml);
  }

  if (extractedText) {
    return extractedText
      .split(/\r?\n/)
      .map((line) => ({ type: 'paragraph', text: normalizeBlockText(line) }))
      .filter((block) => block.text);
  }

  return [];
}

function applyExtractedMetadataToReview(extractedText, extractedHtml) {
  const parsedMetadata = parseTranscriptMetadata(extractedText, extractedHtml);
  let hasChanged = false;

  Object.entries(parsedMetadata).forEach(([fieldName, value]) => {
    if (value && !state.importReview[fieldName]) {
      state.importReview[fieldName] = value;
      hasChanged = true;
    }
  });

  if (hasChanged) {
    // Keep programmatic prefill behavior aligned with manual input listeners.
    updateImportSaveButtonState();
  }
}

async function extractDocumentContent(file) {
  if (typeof window === 'undefined' || !window.mammoth) {
    throw new Error('Mammoth.js could not be loaded.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const [textResult, htmlResult] = await Promise.all([
    window.mammoth.extractRawText({ arrayBuffer }),
    window.mammoth.convertToHtml({ arrayBuffer })
  ]);

  return {
    text: textResult && typeof textResult.value === 'string' ? textResult.value : '',
    html: htmlResult && typeof htmlResult.value === 'string' ? htmlResult.value : ''
  };
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
    return Array.isArray(parsedValue) ? parsedValue.map(normalizeMeetingRecord) : [];
  } catch (error) {
    return [];
  }
}

function normalizeExtraSection(section) {
  if (!section || typeof section !== 'object') {
    return null;
  }

  const heading = String(section.heading || '').trim();
  const lines = Array.isArray(section.lines)
    ? section.lines
      .filter((line) => typeof line === 'string')
      .map((line) => line.trim())
      .filter(Boolean)
    : [];

  if (!heading && !lines.length) {
    return null;
  }

  return {
    heading: heading || 'Additional Section',
    lines
  };
}

function normalizeMeetingRecord(meeting) {
  if (!meeting || typeof meeting !== 'object') {
    return meeting;
  }

  const normalizedMeeting = { ...meeting };
  normalizedMeeting.extraSections = Array.isArray(meeting.extraSections)
    ? meeting.extraSections.map(normalizeExtraSection).filter(Boolean)
    : [];

  return normalizedMeeting;
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
  return [...sampleData.meetings, ...state.savedMeetings].map(normalizeMeetingRecord);
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
  if (typeof meeting.duration === 'string' && meeting.duration.trim()) {
    return meeting.duration;
  }

  if (typeof meeting.durationMinutes === 'number' && meeting.durationMinutes > 0) {
    return `${meeting.durationMinutes} min`;
  }

  return 'Not captured yet';
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
  const dateValue = getImportReviewFieldValue('date').trim();
  const selectedFile = state.importSelectedFile;
  const hasExtractedContent = Boolean(state.importExtractedText.trim() || state.importExtractedHtml.trim());
  const isValidDocx = Boolean(selectedFile && typeof selectedFile.name === 'string' && selectedFile.name.toLowerCase().endsWith('.docx'));
  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(dateValue) && normalizeExtractedDate(dateValue) === dateValue;
  return Boolean(title && isValidDate && isValidDocx && !state.importExtracting && !state.importExtractionError && hasExtractedContent);
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
  importSaveInProgress: false,
  importExtracting: false,
  importExtractionError: '',
  importExtractedText: '',
  importExtractedHtml: '',
  importExtractedSections: createEmptyExtractedSections(),
  importParserDebug: {
    blocks: [],
    metadata: {},
    headings: []
  }
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
const viewerTabs = ['overview', 'summary', 'decisions', 'actions', 'questions', 'commercial', 'additionalSections', 'transcript'];

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
    if (selectedMeeting) {
      populateViewerContent(selectedMeeting);
    }
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
  const durationLabel = (typeof meeting.duration === 'string' && meeting.duration.trim())
    ? meeting.duration
    : (typeof meeting.durationMinutes === 'number' && meeting.durationMinutes > 0 ? `${meeting.durationMinutes} minutes` : 'Not captured yet');
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

      <div class="viewer-content" id="viewer-content"></div>
    </section>
  `;
}

function getMeetingSectionItems(meeting, propertyName) {
  const value = meeting ? meeting[propertyName] : undefined;

  if (Array.isArray(value)) {
    return value
      .filter((item) => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function getMeetingSectionText(meeting, propertyName) {
  return getMeetingSectionItems(meeting, propertyName).join('\n');
}

function createViewerList(items, fallbackText) {
  if (!items.length) {
    const paragraph = document.createElement('p');
    paragraph.textContent = fallbackText;
    return paragraph;
  }

  const list = document.createElement('ul');
  list.className = 'viewer-list';
  items.forEach((item) => {
    const listItem = document.createElement('li');
    listItem.textContent = item;
    list.appendChild(listItem);
  });
  return list;
}

function createTranscriptTextBlock(text, fallbackText) {
  const lines = String(text || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    const paragraph = document.createElement('p');
    paragraph.textContent = fallbackText;
    return paragraph;
  }

  const container = document.createElement('div');
  container.className = 'viewer-transcript-list';
  lines.forEach((line) => {
    const paragraph = document.createElement('p');
    paragraph.className = 'viewer-transcript-line';
    paragraph.textContent = line;
    container.appendChild(paragraph);
  });
  return container;
}

function appendDetailLine(container, label, value) {
  const paragraph = document.createElement('p');
  const strong = document.createElement('strong');
  strong.textContent = `${label}: `;
  paragraph.appendChild(strong);
  paragraph.appendChild(document.createTextNode(value));
  container.appendChild(paragraph);
}

function populateViewerContent(meeting) {
  const contentContainer = document.querySelector('.viewer-content');
  if (!contentContainer || !meeting) {
    return;
  }

  contentContainer.replaceChildren();
  const block = document.createElement('div');
  block.className = 'viewer-block';

  const heading = document.createElement('h4');
  heading.textContent = state.activeViewerTab === 'transcript' ? 'Full Transcript' : formatTabLabel(state.activeViewerTab);
  block.appendChild(heading);

  switch (state.activeViewerTab) {
    case 'summary': {
      const items = getMeetingSectionItems(meeting, 'summary');
      block.appendChild(createViewerList(items, 'No summary has been extracted yet.'));
      break;
    }
    case 'decisions': {
      const items = getMeetingSectionItems(meeting, 'decisions');
      block.appendChild(createViewerList(items, 'No decisions have been extracted yet.'));
      break;
    }
    case 'actions': {
      const actions = getMeetingSectionItems(meeting, 'actions');
      block.appendChild(createViewerList(actions, 'No follow-up items have been extracted yet.'));
      break;
    }
    case 'questions': {
      const items = getMeetingSectionItems(meeting, 'openQuestions');
      block.appendChild(createViewerList(items, 'No open questions have been extracted yet.'));
      break;
    }
    case 'commercial': {
      const items = getMeetingSectionItems(meeting, 'commercialNotes');
      block.appendChild(createViewerList(items, 'No commercial notes have been extracted yet.'));
      break;
    }
    case 'additionalSections': {
      const extraSections = Array.isArray(meeting.extraSections) ? meeting.extraSections : [];

      if (!extraSections.length) {
        block.appendChild(createViewerList([], 'No additional sections have been extracted yet.'));
        break;
      }

      const extraSectionContainer = document.createElement('div');
      extraSectionContainer.className = 'viewer-extra-sections';

      extraSections.forEach((section) => {
        const sectionBlock = document.createElement('div');
        sectionBlock.className = 'viewer-extra-section';

        const sectionHeading = document.createElement('h5');
        sectionHeading.textContent = section.heading || 'Additional Section';
        sectionBlock.appendChild(sectionHeading);

        const sectionLines = Array.isArray(section.lines) ? section.lines : [];
        sectionBlock.appendChild(createViewerList(sectionLines, 'No lines captured for this section.'));
        extraSectionContainer.appendChild(sectionBlock);
      });

      block.appendChild(extraSectionContainer);
      break;
    }
    case 'transcript': {
      const transcriptText = getMeetingSectionText(meeting, 'cleanedTranscript')
        || getMeetingSectionText(meeting, 'extractedText')
        || getMeetingSectionText(meeting, 'transcript')
        || '';
      block.appendChild(createTranscriptTextBlock(transcriptText, 'No transcript text was extracted for this meeting.'));
      break;
    }
    default: {
      const customer = getMeetingDisplayCustomer(meeting);
      const partner = getMeetingDisplayPartner(meeting);
      const tags = Array.isArray(meeting.tags) && meeting.tags.length ? meeting.tags.join(', ') : 'No tags captured yet.';
      const fileName = meeting.originalFileName ? meeting.originalFileName : 'No file name captured yet.';
      const content = document.createElement('div');
      appendDetailLine(content, 'Subject', meeting.subject || 'No subject captured yet.');
      appendDetailLine(content, 'Customer', customer);
      appendDetailLine(content, 'Partner', partner);
      appendDetailLine(content, 'Participants', getMeetingDisplayParticipants(meeting));
      appendDetailLine(content, 'Date', meeting.date ? formatDate(meeting.date) : 'Date not available');
      appendDetailLine(content, 'Original file', fileName);
      appendDetailLine(content, 'Tags', tags);
      block.appendChild(content);
      break;
    }
  }

  contentContainer.appendChild(block);
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

  const extractionStatus = state.importExtracting
    ? '<p class="import-hint">Extracting document content…</p>'
    : '';
  const extractionError = state.importExtractionError
    ? `<p class="import-error" role="alert">${escapeHtml(state.importExtractionError)}</p>`
    : '';
  const previewPanel = state.importExtractedText || state.importExtracting || state.importExtractionError
    ? `
      <div class="import-preview-panel">
        <div class="section-heading">
          <h4>Extracted content preview</h4>
        </div>
        <div class="import-preview-meta">
          <span>${state.importExtracting ? 'Extracting…' : `${state.importExtractedText.length} characters`}</span>
          <span>${state.importExtractedHtml ? 'HTML version available' : 'Plain text only'}</span>
        </div>
        <div class="import-preview-block">
          <h5>Plain text</h5>
          <pre class="import-preview-text">${escapeHtml(getImportPreviewExcerpt(state.importExtractedText, 900) || 'No text extracted yet.')}</pre>
        </div>
        <div class="import-preview-block">
          <h5>HTML preview</h5>
          <pre class="import-preview-html">${escapeHtml(getImportPreviewExcerpt(state.importExtractedHtml, 1200) || 'No HTML preview available yet.')}</pre>
        </div>
      </div>
    `
    : '';

  const detectedSections = Object.entries({
    summary: 'Meeting Summary',
    decisions: 'Key Decisions and Working Assumptions',
    actions: 'Follow-up Items',
    openQuestions: 'Open Questions',
    commercialNotes: 'Commercial and Partner Notes',
    cleanedTranscript: 'Cleaned Transcript'
  }).map(([key, label]) => {
    const found = key === 'cleanedTranscript'
      ? Boolean(state.importExtractedSections.cleanedTranscript)
      : state.importExtractedSections[key].length > 0;
    return `<li class="import-detected-section ${found ? 'found' : 'missing'}"><span>${escapeHtml(label)}</span><strong>${found ? 'Found' : 'Not found'}</strong></li>`;
  }).join('');

  const detectedSectionsPanel = reviewVisible ? `
    <div class="import-preview-panel">
      <div class="section-heading">
        <h4>Detected sections</h4>
      </div>
      <ul class="import-detected-list">${detectedSections}</ul>
    </div>
  ` : '';

  const debugBlocks = state.importParserDebug.blocks.map((block) => `
    <li><strong>${escapeHtml(block.type)}</strong>: ${escapeHtml(block.text)}</li>
  `).join('');

  const debugMetadata = Object.entries(state.importParserDebug.metadata).map(([key, value]) => `
    <li><strong>${escapeHtml(key)}</strong>: ${escapeHtml(value)}</li>
  `).join('');

  const debugHeadings = state.importParserDebug.headings.map((heading) => `
    <li><strong>${escapeHtml(heading.heading)}</strong> → ${escapeHtml(heading.section || 'unrecognized')}</li>
  `).join('');

  const debugPanel = reviewVisible ? `
    <details class="parser-debug">
      <summary>Parser debug</summary>
      <div class="parser-debug-block">
        <h5>Text blocks</h5>
        <ul>${debugBlocks}</ul>
      </div>
      <div class="parser-debug-block">
        <h5>Metadata</h5>
        <ul>${debugMetadata}</ul>
      </div>
      <div class="parser-debug-block">
        <h5>Recognized headings</h5>
        <ul>${debugHeadings}</ul>
      </div>
    </details>
  ` : '';

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
          <input class="import-field js-import-review-field" type="date" value="${escapeHtml(normalizeExtractedDate(state.importReview.date || state.importReview.dateText) || '')}" data-review-field="date">
        </label>
        <label class="import-field-group">
          <span>Start time</span>
          <input class="import-field js-import-review-field" type="text" value="${escapeHtml(state.importReview.startTime)}" data-review-field="startTime" placeholder="Start time">
        </label>
        <label class="import-field-group">
          <span>Duration</span>
          <input class="import-field js-import-review-field" type="text" value="${escapeHtml(state.importReview.duration)}" data-review-field="duration" placeholder="Duration">
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
        <p class="import-note">A valid title, date, and DOCX file are required before saving. The review values are prefilled from the extracted transcript whenever available.</p>
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
      <p class="import-description">Select a DOCX file to start the review step. The app extracts the text in the browser and pre-fills the review fields.</p>

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
      ${extractionStatus}
      ${extractionError}
      ${fileSummary}
      ${previewPanel}
      ${detectedSectionsPanel}
      ${debugPanel}
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

async function handleImportFileSelection(file) {
  if (!file) {
    return;
  }

  state.importSuccessMessage = '';
  state.importExtractionError = '';
  state.importExtractedText = '';
  state.importExtractedHtml = '';
  state.importExtractedSections = createEmptyExtractedSections();
  state.importReview = createEmptyImportReview();

  if (!file.name.toLowerCase().endsWith('.docx')) {
    state.importSelectedFile = null;
    state.importError = 'Unsupported file type. Please choose a .docx file.';
    renderViews();
    return;
  }

  if (file.size > MAX_IMPORT_FILE_SIZE_BYTES) {
    state.importSelectedFile = null;
    state.importError = 'The selected file is too large. Please choose a file smaller than 10 MB.';
    renderViews();
    return;
  }

  state.importSelectedFile = {
    name: file.name,
    size: file.size
  };
  state.importError = '';
  state.importExtracting = true;
  renderViews();
  updateImportSaveButtonState();

  try {
    const extractionResult = await extractDocumentContent(file);
    state.importExtractedText = extractionResult.text || '';
    state.importExtractedHtml = extractionResult.html || '';
    state.importExtractedSections = extractTranscriptSections(state.importExtractedText, state.importExtractedHtml);
    const metadata = parseTranscriptMetadata(state.importExtractedText, state.importExtractedHtml);
    state.importParserDebug.metadata = metadata;
    applyExtractedMetadataToReview(state.importExtractedText, state.importExtractedHtml);
    state.importExtracting = false;
    renderViews();
    updateImportSaveButtonState();
  } catch (error) {
    state.importExtracting = false;
    state.importExtractionError = error.message || 'The document could not be processed.';
    renderViews();
    updateImportSaveButtonState();
  }
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
  const startTime = state.importReview.startTime.trim();
  const duration = state.importReview.duration.trim();
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
    date: normalizeExtractedDate(date) || '',
    dateText: state.importReview.dateText || date,
    startTime,
    duration,
    durationMinutes: 0,
    meetingType: 'Imported',
    customerId: null,
    partnerId: null,
    participantIds: [],
    subject,
    tags: [],
    summary: state.importExtractedSections.summary,
    decisions: state.importExtractedSections.decisions,
    openQuestions: state.importExtractedSections.openQuestions,
    commercialNotes: state.importExtractedSections.commercialNotes,
    actions: state.importExtractedSections.actions,
    actionItemIds: [],
    transcript: state.importExtractedText,
    extractedText: state.importExtractedText,
    extractedHtml: state.importExtractedHtml,
    cleanedTranscript: state.importExtractedSections.cleanedTranscript,
    extraSections: state.importExtractedSections.extraSections.map((section) => ({
      heading: section.heading,
      lines: [...section.lines]
    })),
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
  state.importExtracting = false;
  state.importExtractionError = '';
  state.importExtractedText = '';
  state.importExtractedHtml = '';
  state.importExtractedSections = createEmptyExtractedSections();
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
        if (reviewField === 'date') {
          state.importReview.date = normalizeExtractedDate(field.value);
          state.importReview.dateText = field.value;
        } else {
          state.importReview[reviewField] = field.value;
        }
      }

      updateImportSaveButtonState();
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
    additionalSections: 'Additional Sections',
    transcript: 'Full Transcript'
  };

  return labels[tab] || tab;
}

document.addEventListener('DOMContentLoaded', init);

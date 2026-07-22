const sampleData = {
  meetings: [],
  customers: [],
  partners: [],
  participants: [],
  actions: []
};

const MAX_IMPORT_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const TRANSCRIPT_STORAGE_BUCKET = 'Transcript_files';
const DOCX_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream',
  'application/zip'
];
const STORAGE_KEY = 'taskletTranscriptApp.meetings';
const ACTION_OVERRIDES_STORAGE_KEY = 'taskletTranscriptApp.actionOverrides';
const SETTINGS_STORAGE_KEY = 'taskletTranscriptApp.settings';
const BACKUP_APP_NAME = 'Tasklet Transcript App';
const BACKUP_VERSION = 1;
const ACTION_STATUSES = ['Open', 'In Progress', 'Waiting for Customer', 'Waiting Internally', 'Completed', 'Cancelled'];
const ACTION_FILTERS = ['All', 'Open', 'In Progress', 'Waiting for Customer', 'Waiting Internally', 'Completed', 'Cancelled', 'Overdue', 'No due date'];
const SORT_ORDER_OPTIONS = ['newest', 'oldest'];
const SUPPORTED_APPLICATION_SETTING_KEYS = ['sortOrder', 'actionFilter'];
const APPLICATION_SETTING_LABELS = {
  sortOrder: 'Meeting sort order',
  actionFilter: 'Action filter'
};
const SEARCH_MIN_CHARS = 2;
const SEARCH_DEBOUNCE_MS = 180;
const AUTH_ERROR_MESSAGE = 'Unable to sign in. Check your email and password and try again.';
const SUPPORTED_PROFILE_ROLES = ['admin', 'user'];
const USER_SETTINGS_ROW_COLUMNS = ['user_id', 'settings', 'created_at', 'updated_at'].join(', ');
const ACTION_OVERRIDE_ROW_COLUMNS = [
  'id',
  'user_id',
  'meeting_id',
  'action_id',
  'status',
  'due_date',
  'created_at',
  'updated_at'
].join(', ');
const MEETING_ROW_COLUMNS = [
  'id',
  'user_id',
  'title',
  'meeting_date',
  'start_time',
  'duration',
  'customer',
  'partner',
  'participants',
  'subject',
  'summary',
  'decisions',
  'actions',
  'open_questions',
  'commercial_notes',
  'cleaned_transcript',
  'extracted_text',
  'extracted_html',
  'extra_sections',
  'storage_bucket',
  'storage_path',
  'original_file_name',
  'original_file_size',
  'original_file_mime_type',
  'created_at',
  'updated_at'
].join(', ');

let supabaseClient = null;
let authSubscription = null;
let appInitialized = false;
let authFormBound = false;
let authProfileLoadToken = 0;
let cloudMeetingsLoadToken = 0;
let cloudActionOverridesLoadToken = 0;
let cloudSettingsLoadToken = 0;

const authState = {
  checking: true,
  signingIn: false,
  user: null,
  profile: null,
  profileWarning: '',
  meetingsLoading: false,
  meetingsLoadError: '',
  meetingsLoaded: false,
  actionOverridesLoading: false,
  actionOverridesLoadError: '',
  actionOverridesLoaded: false,
  settingsLoading: false,
  settingsLoadError: '',
  settingsLoaded: false,
  error: '',
  status: 'Checking session...'
};

function getAuthElements() {
  return {
    authView: document.getElementById('auth-view'),
    appShell: document.getElementById('app-shell'),
    status: document.getElementById('auth-status'),
    error: document.getElementById('auth-error'),
    form: document.getElementById('login-form'),
    email: document.getElementById('login-email'),
    password: document.getElementById('login-password'),
    submit: document.getElementById('sign-in-button'),
    roleBadge: document.querySelector('.js-auth-role-badge'),
    userWarning: document.querySelector('.js-auth-user-warning')
  };
}

function getSupabaseClientInitializationResult() {
  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    return {
      client: null,
      error: 'Supabase client library is unavailable. Verify the Supabase browser script is loaded.'
    };
  }

  const url = typeof SUPABASE_URL === 'string' ? SUPABASE_URL.trim() : '';
  const publishableKey = typeof SUPABASE_PUBLISHABLE_KEY === 'string' ? SUPABASE_PUBLISHABLE_KEY.trim() : '';

  if (!url || !publishableKey) {
    return {
      client: null,
      error: 'Supabase authentication is not configured. Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in supabase-config.js.'
    };
  }

  try {
    return {
      client: window.supabase.createClient(url, publishableKey),
      error: ''
    };
  } catch (error) {
    return {
      client: null,
      error: 'Supabase client initialization failed. Check your Supabase configuration values.'
    };
  }
}

function isSessionMissingError(error) {
  if (!error || typeof error.message !== 'string') {
    return false;
  }

  const normalized = error.message.toLowerCase();
  return normalized.includes('auth session missing') || normalized.includes('session not found');
}

function setupLogoFallbacks() {
  document.querySelectorAll('.js-tasklet-logo').forEach((logo) => {
    logo.addEventListener('error', () => {
      logo.classList.add('logo-load-failed');
    });
  });
}

function clearAuthenticatedProfileState() {
  authState.profile = null;
  authState.profileWarning = '';
}

function createDefaultProfileFromUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id || '',
    email: user.email || '',
    role: 'user'
  };
}

function normalizeProfileRole(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return SUPPORTED_PROFILE_ROLES.includes(normalized) ? normalized : 'user';
}

function getRoleLabel(role) {
  return role === 'admin' ? 'Administrator' : 'User';
}

function isCurrentUserAdmin() {
  return Boolean(authState.profile && authState.profile.role === 'admin');
}

async function loadAuthenticatedProfile(user) {
  const fallbackProfile = createDefaultProfileFromUser(user);
  if (!supabaseClient || !user || !user.id) {
    return {
      profile: fallbackProfile,
      warning: 'Your profile could not be verified. Administrator access is unavailable.'
    };
  }

  const { data, error } = await supabaseClient
    .from('profiles')
    .select('id, email, role')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    return {
      profile: fallbackProfile,
      warning: 'Your profile could not be loaded. Administrator access is unavailable.'
    };
  }

  if (!data || !data.id) {
    return {
      profile: fallbackProfile,
      warning: 'No profile record was found. Administrator access is unavailable.'
    };
  }

  const normalizedRole = normalizeProfileRole(data.role);
  const warning = SUPPORTED_PROFILE_ROLES.includes(String(data.role || '').trim().toLowerCase())
    ? ''
    : 'Your profile role was invalid and was treated as User.';

  return {
    profile: {
      id: String(data.id || user.id),
      email: String(data.email || user.email || ''),
      role: normalizedRole
    },
    warning
  };
}

function setAuthFormDisabled(disabled) {
  const { form, email, password, submit } = getAuthElements();
  if (form) {
    form.querySelectorAll('input, button').forEach((field) => {
      field.disabled = disabled;
    });
  }
  if (email) {
    email.disabled = disabled;
  }
  if (password) {
    password.disabled = disabled;
  }
  if (submit) {
    submit.disabled = disabled;
    submit.textContent = authState.signingIn ? 'Signing In...' : 'Sign In';
  }
}

function updateAuthView() {
  const { authView, status, error } = getAuthElements();

  if (authView) {
    authView.hidden = Boolean(authState.user)
      && !authState.meetingsLoading
      && !authState.actionOverridesLoading
      && !authState.settingsLoading;
  }

  if (status) {
    const statusText = authState.status || '';
    status.textContent = statusText;
    status.hidden = !statusText;
  }

  if (error) {
    const errorText = authState.error || '';
    error.textContent = errorText;
    error.hidden = !errorText;
  }

  const shouldDisable = authState.checking || authState.signingIn || !supabaseClient;
  setAuthFormDisabled(shouldDisable);
}

function clearCloudMeetingState() {
  state.savedMeetings = [];
  state.cloudMeetingsError = '';
  state.cloudMeetingsLoaded = false;
  state.meetingDocumentDownloadInProgressId = '';
  state.meetingDocumentDownloadError = '';
  state.meetingDeletionWarning = '';
  authState.meetingsLoading = false;
  authState.meetingsLoadError = '';
  state.migrationInProgress = false;
  state.migrationArchiveAvailable = false;
}

function clearCloudActionOverrideState() {
  state.actionOverrides = {};
  state.actionOverridesError = '';
  authState.actionOverridesLoading = false;
  authState.actionOverridesLoadError = '';
  authState.actionOverridesLoaded = false;
  state.overrideMigrationInProgress = false;
  state.overrideMigrationArchiveAvailable = false;
}

function getDefaultApplicationSettings() {
  return {
    sortOrder: 'newest',
    actionFilter: 'All'
  };
}

function sanitizeApplicationSettings(value) {
  const source = isPlainObject(value) ? value : {};
  const defaults = getDefaultApplicationSettings();
  const sortOrder = SORT_ORDER_OPTIONS.includes(source.sortOrder) ? source.sortOrder : defaults.sortOrder;
  const actionFilter = ACTION_FILTERS.includes(source.actionFilter) ? source.actionFilter : defaults.actionFilter;

  return {
    sortOrder,
    actionFilter
  };
}

function buildCurrentApplicationSettings() {
  return sanitizeApplicationSettings({
    sortOrder: state.sortOrder,
    actionFilter: state.actionFilter
  });
}

function applyApplicationSettings(settings) {
  const sanitized = sanitizeApplicationSettings(settings);
  state.sortOrder = sanitized.sortOrder;
  state.actionFilter = sanitized.actionFilter;
  state.savedSettings = sanitized;
}

function getLocalStagedSettingsRecord() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {
      exists: false,
      raw: null,
      parseError: false
    };
  }

  const rawValue = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (typeof rawValue !== 'string') {
    return {
      exists: false,
      raw: null,
      parseError: false
    };
  }

  try {
    const parsedValue = JSON.parse(rawValue);
    return {
      exists: true,
      raw: isPlainObject(parsedValue) ? parsedValue : {},
      parseError: !isPlainObject(parsedValue)
    };
  } catch (error) {
    return {
      exists: true,
      raw: {},
      parseError: true
    };
  }
}

function getDetectedSupportedSettingKeys(rawSettings) {
  if (!isPlainObject(rawSettings)) {
    return [];
  }

  const detected = [];
  if (Object.prototype.hasOwnProperty.call(rawSettings, 'sortOrder') && SORT_ORDER_OPTIONS.includes(rawSettings.sortOrder)) {
    detected.push('sortOrder');
  }
  if (Object.prototype.hasOwnProperty.call(rawSettings, 'actionFilter') && ACTION_FILTERS.includes(rawSettings.actionFilter)) {
    detected.push('actionFilter');
  }

  return detected;
}

function getDetectedSupportedSettingLabels(rawSettings) {
  return getDetectedSupportedSettingKeys(rawSettings).map((key) => APPLICATION_SETTING_LABELS[key] || key);
}

function mapUserSettingsRowToSettings(row) {
  if (!row || typeof row !== 'object') {
    return getDefaultApplicationSettings();
  }

  return sanitizeApplicationSettings(row.settings);
}

function clearCloudSettingsState() {
  applyApplicationSettings(getDefaultApplicationSettings());
  state.cloudSettingsError = '';
  state.settingsSaveInProgress = false;
  state.settingsMigrationInProgress = false;
  state.settingsMigrationArchiveAvailable = false;
  authState.settingsLoading = false;
  authState.settingsLoadError = '';
  authState.settingsLoaded = false;
}

async function loadAuthenticatedSettings() {
  const loadToken = ++cloudSettingsLoadToken;

  if (!supabaseClient || !authState.user || !authState.user.id) {
    clearCloudSettingsState();
    return { success: false, error: 'No authenticated user is available for settings loading.' };
  }

  authState.settingsLoading = true;
  authState.settingsLoadError = '';
  authState.settingsLoaded = false;
  state.cloudSettingsError = '';

  const { data, error } = await supabaseClient
    .from('user_settings')
    .select(USER_SETTINGS_ROW_COLUMNS)
    .eq('user_id', authState.user.id)
    .maybeSingle();

  if (loadToken !== cloudSettingsLoadToken) {
    return { success: false, error: 'Settings loading was superseded by a newer session state.' };
  }

  authState.settingsLoading = false;

  if (error) {
    authState.settingsLoaded = false;
    authState.settingsLoadError = 'Unable to load cloud settings. Please try again.';
    state.cloudSettingsError = authState.settingsLoadError;
    return { success: false, error: authState.settingsLoadError };
  }

  if (!data) {
    applyApplicationSettings(getDefaultApplicationSettings());
    authState.settingsLoaded = true;
    authState.settingsLoadError = '';
    state.cloudSettingsError = '';
    return { success: true };
  }

  applyApplicationSettings(mapUserSettingsRowToSettings(data));
  authState.settingsLoaded = true;
  authState.settingsLoadError = '';
  state.cloudSettingsError = '';
  return { success: true };
}

async function loadAuthenticatedMeetings() {
  const loadToken = ++cloudMeetingsLoadToken;

  if (!supabaseClient || !authState.user || !authState.user.id) {
    clearCloudMeetingState();
    return { success: false, error: 'No authenticated user is available for meeting loading.' };
  }

  authState.meetingsLoading = true;
  authState.meetingsLoadError = '';
  state.cloudMeetingsError = '';
  state.cloudMeetingsLoaded = false;

  const { data, error } = await supabaseClient
    .from('meetings')
    .select(MEETING_ROW_COLUMNS)
    .eq('user_id', authState.user.id)
    .order('meeting_date', { ascending: false })
    .order('updated_at', { ascending: false });

  if (loadToken !== cloudMeetingsLoadToken) {
    return { success: false, error: 'Meeting loading was superseded by a newer session state.' };
  }

  authState.meetingsLoading = false;

  if (error) {
    state.savedMeetings = [];
    state.cloudMeetingsLoaded = false;
    authState.meetingsLoadError = 'Unable to load cloud meetings. Please try again.';
    state.cloudMeetingsError = authState.meetingsLoadError;
    return { success: false, error: authState.meetingsLoadError };
  }

  state.savedMeetings = Array.isArray(data)
    ? data.map((row) => mapDatabaseRowToMeeting(row)).sort(compareMeetingsNewestFirst)
    : [];
  state.cloudMeetingsLoaded = true;
  authState.meetingsLoadError = '';
  state.cloudMeetingsError = '';
  return { success: true };
}

async function loadAuthenticatedActionOverrides() {
  const loadToken = ++cloudActionOverridesLoadToken;

  if (!supabaseClient || !authState.user || !authState.user.id) {
    clearCloudActionOverrideState();
    return { success: false, error: 'No authenticated user is available for action override loading.' };
  }

  authState.actionOverridesLoading = true;
  authState.actionOverridesLoadError = '';
  state.actionOverridesError = '';
  authState.actionOverridesLoaded = false;

  const { data, error } = await supabaseClient
    .from('action_overrides')
    .select(ACTION_OVERRIDE_ROW_COLUMNS)
    .eq('user_id', authState.user.id);

  if (loadToken !== cloudActionOverridesLoadToken) {
    return { success: false, error: 'Action override loading was superseded by a newer session state.' };
  }

  authState.actionOverridesLoading = false;

  if (error) {
    state.actionOverrides = {};
    authState.actionOverridesLoaded = false;
    authState.actionOverridesLoadError = 'Unable to load cloud action updates. Please try again.';
    state.actionOverridesError = authState.actionOverridesLoadError;
    return { success: false, error: authState.actionOverridesLoadError };
  }

  state.actionOverrides = Array.isArray(data)
    ? data.reduce((accumulator, row) => {
      const override = mapActionOverrideRowToOverride(row);
      if (!override) {
        return accumulator;
      }

      accumulator[override.actionId] = override;
      return accumulator;
    }, {})
    : {};
  authState.actionOverridesLoaded = true;
  authState.actionOverridesLoadError = '';
  state.actionOverridesError = '';
  return { success: true };
}

async function loadAuthenticatedCloudData() {
  const meetingsResult = await loadAuthenticatedMeetings();
  if (!meetingsResult.success) {
    return meetingsResult;
  }

  const actionOverridesResult = await loadAuthenticatedActionOverrides();
  if (!actionOverridesResult.success) {
    return actionOverridesResult;
  }

  return loadAuthenticatedSettings();
}

async function handleRetryCloudMeetings() {
  if (!authState.user) {
    return;
  }

  authState.status = 'Retrying cloud data...';
  await loadAuthenticatedCloudData();
  authState.status = '';
  updateAuthView();
  renderViews();
}

function clearAppViewPanels() {
  mainPanelIds.forEach((panelId) => {
    const panel = document.getElementById(panelId);
    if (panel) {
      panel.innerHTML = '';
    }
  });
}

function updateSignedInUserPanel() {
  const userPanel = document.querySelector('.js-auth-user-panel');
  const userEmail = document.querySelector('.js-auth-user-email');
  const roleBadge = document.querySelector('.js-auth-role-badge');
  const userWarning = document.querySelector('.js-auth-user-warning');

  if (!userPanel || !userEmail || !roleBadge || !userWarning) {
    return;
  }

  if (!authState.user || !authState.profile || !authState.profile.email) {
    userPanel.hidden = true;
    userEmail.textContent = '';
    roleBadge.textContent = 'User';
    userWarning.textContent = '';
    userWarning.hidden = true;
    return;
  }

  userEmail.textContent = authState.profile.email;
  roleBadge.textContent = getRoleLabel(authState.profile.role);
  userWarning.textContent = authState.profileWarning;
  userWarning.hidden = !authState.profileWarning;
  userPanel.hidden = false;
}

async function setAppAuthenticated(user) {
  const { appShell } = getAuthElements();
  const profileLoadToken = ++authProfileLoadToken;
  ++cloudMeetingsLoadToken;
  ++cloudActionOverridesLoadToken;
  ++cloudSettingsLoadToken;

  if (appShell) {
    appShell.hidden = true;
  }

  authState.user = user || null;
  authState.checking = false;
  authState.signingIn = false;
  clearCloudMeetingState();
  clearCloudActionOverrideState();
  clearCloudSettingsState();

  if (!authState.user) {
    clearAuthenticatedProfileState();
  } else {
    const profileResult = await loadAuthenticatedProfile(authState.user);
    if (profileLoadToken !== authProfileLoadToken) {
      return;
    }

    authState.profile = profileResult.profile;
    authState.profileWarning = profileResult.warning;
    authState.status = 'Loading workspace...';
    updateAuthView();
    await loadAuthenticatedCloudData();
  }

  if (appShell) {
    appShell.hidden = !authState.user;
  }

  authState.status = '';
  updateSignedInUserPanel();
  updateAuthView();

  if (!authState.user) {
    clearAppViewPanels();
    return;
  }

  if (!appInitialized) {
    init();
    appInitialized = true;
    return;
  }

  renderViews();
}

async function handleLoginSubmit(event) {
  event.preventDefault();

  if (!supabaseClient || authState.signingIn || authState.checking) {
    return;
  }

  const { email, password } = getAuthElements();
  const emailValue = email ? email.value.trim() : '';
  const passwordValue = password ? password.value : '';

  if (!emailValue || !passwordValue) {
    authState.error = AUTH_ERROR_MESSAGE;
    authState.status = '';
    updateAuthView();
    return;
  }

  authState.error = '';
  authState.signingIn = true;
  authState.status = 'Signing in...';
  updateAuthView();

  const { error } = await supabaseClient.auth.signInWithPassword({
    email: emailValue,
    password: passwordValue
  });

  if (error) {
    authState.signingIn = false;
    authState.status = '';
    authState.error = AUTH_ERROR_MESSAGE;
    updateAuthView();
    return;
  }

  authState.signingIn = false;
  authState.status = 'Signed in. Loading workspace...';
  updateAuthView();
}

async function handleSignOut() {
  if (!supabaseClient) {
    return;
  }

  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    authState.error = 'Unable to sign out right now. Please try again.';
    updateAuthView();
  }
}

function ensureAuthFormBinding() {
  if (authFormBound) {
    return;
  }

  const { form } = getAuthElements();
  if (!form) {
    return;
  }

  form.addEventListener('submit', handleLoginSubmit);
  authFormBound = true;
}

function subscribeToAuthChanges() {
  if (!supabaseClient || authSubscription) {
    return;
  }

  const subscriptionResult = supabaseClient.auth.onAuthStateChange((_event, session) => {
    const nextUser = session && session.user ? session.user : null;
    authState.error = '';
    authState.status = '';
    setAppAuthenticated(nextUser);
  });

  authSubscription = subscriptionResult && subscriptionResult.data ? subscriptionResult.data.subscription : null;
}

async function bootstrapAuthentication() {
  ensureAuthFormBinding();

  const { client, error } = getSupabaseClientInitializationResult();
  supabaseClient = client;

  if (!supabaseClient) {
    authState.checking = false;
    authState.status = '';
    authState.error = error;
    setAppAuthenticated(null);
    return;
  }

  authState.checking = true;
  authState.error = '';
  authState.status = 'Checking session...';
  updateAuthView();

  const { data, error: getUserError } = await supabaseClient.auth.getUser();
  if (getUserError && !isSessionMissingError(getUserError)) {
    authState.error = 'Unable to verify the current session. Please sign in.';
    authState.status = '';
  }

  const existingUser = data && data.user ? data.user : null;
  await setAppAuthenticated(existingUser);
  subscribeToAuthChanges();
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function estimateStringBytes(value) {
  if (typeof Blob !== 'undefined') {
    return new Blob([String(value || '')]).size;
  }

  return String(value || '').length;
}

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

function sanitizeActionOverrideRecord(record) {
  if (!record || typeof record !== 'object') {
    return null;
  }

  const actionId = String(record.actionId || '').trim();
  if (!actionId) {
    return null;
  }

  const status = ACTION_STATUSES.includes(record.status) ? record.status : '';
  const dueDate = normalizeExtractedDate(record.dueDate || '');

  if (!status && !dueDate) {
    return null;
  }

  return {
    actionId,
    status,
    dueDate
  };
}

function readStoredActionOverrides() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {};
  }

  try {
    const rawValue = window.localStorage.getItem(ACTION_OVERRIDES_STORAGE_KEY);
    if (!rawValue) {
      return {};
    }

    const parsedValue = JSON.parse(rawValue);
    const records = Array.isArray(parsedValue)
      ? parsedValue
      : Object.values(parsedValue || {});

    return records.reduce((accumulator, record) => {
      const sanitizedRecord = sanitizeActionOverrideRecord(record);
      if (!sanitizedRecord) {
        return accumulator;
      }

      accumulator[sanitizedRecord.actionId] = sanitizedRecord;
      return accumulator;
    }, {});
  } catch (error) {
    return {};
  }
}

function writeStoredActionOverrides(overridesById) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    const records = Object.values(overridesById || {})
      .map((record) => sanitizeActionOverrideRecord(record))
      .filter(Boolean)
      .sort((first, second) => first.actionId.localeCompare(second.actionId));

    window.localStorage.setItem(ACTION_OVERRIDES_STORAGE_KEY, JSON.stringify(records));
    return true;
  } catch (error) {
    return false;
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
  normalizedMeeting.storageBucket = String(meeting.storageBucket || '').trim();
  normalizedMeeting.storagePath = String(meeting.storagePath || '').trim();
  normalizedMeeting.originalFileName = String(meeting.originalFileName || '').trim();
  normalizedMeeting.originalFileMimeType = String(meeting.originalFileMimeType || '').trim();

  const numericFileSize = Number(meeting.originalFileSize);
  normalizedMeeting.originalFileSize = Number.isFinite(numericFileSize) && numericFileSize >= 0
    ? Math.trunc(numericFileSize)
    : null;

  return normalizedMeeting;
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry) => typeof entry === 'string')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalizeMeetingParticipants(value) {
  if (Array.isArray(value)) {
    return value
      .filter((entry) => typeof entry === 'string')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return parseParticipantsForMeeting(value);
  }

  return [];
}

function isDocxFileName(fileName) {
  return typeof fileName === 'string' && fileName.trim().toLowerCase().endsWith('.docx');
}

function sanitizeDocxStorageFileName(fileName) {
  const fallbackName = 'transcript.docx';
  const rawName = String(fileName || '').trim();
  const basename = rawName.split(/[\\/]/).pop() || fallbackName;
  const baseWithoutExtension = basename.replace(/\.docx$/i, '');
  const safeBase = baseWithoutExtension
    .replace(/\.+/g, '.')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .slice(0, 120);
  const normalizedBase = safeBase || 'transcript';
  return `${normalizedBase}.docx`;
}

function getValidatedImportDocxFile(file) {
  const isFileInstance = typeof File !== 'undefined' && file instanceof File;
  if (!isFileInstance) {
    return {
      valid: false,
      error: 'Select a DOCX file before saving.'
    };
  }

  if (!isDocxFileName(file.name)) {
    return {
      valid: false,
      error: 'Unsupported file type. Please choose a .docx file.'
    };
  }

  if (file.size > MAX_IMPORT_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: 'The selected file is too large. Please choose a file smaller than 10 MB.'
    };
  }

  const mimeType = String(file.type || '').trim().toLowerCase();
  if (mimeType && !DOCX_MIME_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: 'Unsupported DOCX MIME type. Please choose a valid .docx file.'
    };
  }

  return {
    valid: true,
    file
  };
}

function buildTranscriptStoragePath(userId, meetingId, originalFileName) {
  const safeFileName = sanitizeDocxStorageFileName(originalFileName);
  return `${String(userId || '').trim()}/${String(meetingId || '').trim()}/${safeFileName}`;
}

function getActionOverrideDatabaseId(userId, actionId) {
  return `action-override-${Math.abs(hashTextStable(`${String(userId || '')}:${String(actionId || '')}`))}`;
}

function mapActionOverrideRowToOverride(row) {
  if (!row || typeof row !== 'object') {
    return null;
  }

  return sanitizeActionOverrideRecord({
    actionId: row.action_id,
    status: row.status,
    dueDate: row.due_date
  });
}

function mapActionOverrideToDatabaseRow(override, authenticatedUserId, meetingId) {
  const sanitizedOverride = sanitizeActionOverrideRecord(override);
  if (!sanitizedOverride || !authenticatedUserId || !meetingId) {
    return null;
  }

  const now = new Date().toISOString();
  return {
    id: getActionOverrideDatabaseId(authenticatedUserId, sanitizedOverride.actionId),
    user_id: String(authenticatedUserId),
    meeting_id: String(meetingId),
    action_id: sanitizedOverride.actionId,
    status: sanitizedOverride.status || null,
    due_date: sanitizedOverride.dueDate || null,
    created_at: now,
    updated_at: now
  };
}

function mapMeetingToDatabaseRow(meeting, authenticatedUserId) {
  const normalizedMeeting = normalizeMeetingRecord(meeting || {});
  const now = new Date().toISOString();
  const storagePath = String(normalizedMeeting.storagePath || '').trim();
  const storageBucket = String(normalizedMeeting.storageBucket || '').trim() || (storagePath ? TRANSCRIPT_STORAGE_BUCKET : '');

  return {
    id: String(normalizedMeeting.id || createMeetingId()),
    user_id: String(authenticatedUserId || ''),
    title: String(normalizedMeeting.title || '').trim(),
    meeting_date: normalizeExtractedDate(normalizedMeeting.date || ''),
    start_time: String(normalizedMeeting.startTime || '').trim(),
    duration: String(normalizedMeeting.duration || '').trim(),
    customer: String(normalizedMeeting.customer || '').trim(),
    partner: String(normalizedMeeting.partner || '').trim(),
    participants: normalizeMeetingParticipants(normalizedMeeting.participants),
    subject: String(normalizedMeeting.subject || '').trim(),
    summary: normalizeStringArray(normalizedMeeting.summary),
    decisions: normalizeStringArray(normalizedMeeting.decisions),
    actions: normalizeStringArray(normalizedMeeting.actions),
    open_questions: normalizeStringArray(normalizedMeeting.openQuestions),
    commercial_notes: normalizeStringArray(normalizedMeeting.commercialNotes),
    cleaned_transcript: String(normalizedMeeting.cleanedTranscript || '').trim(),
    extracted_text: String(normalizedMeeting.extractedText || normalizedMeeting.transcript || '').trim(),
    extracted_html: String(normalizedMeeting.extractedHtml || '').trim(),
    extra_sections: Array.isArray(normalizedMeeting.extraSections)
      ? normalizedMeeting.extraSections.map((section) => ({
        heading: String(section.heading || '').trim(),
        lines: normalizeStringArray(section.lines)
      }))
      : [],
    storage_bucket: storageBucket || null,
    storage_path: storagePath || null,
    original_file_name: String(normalizedMeeting.originalFileName || '').trim(),
    original_file_size: Number.isFinite(Number(normalizedMeeting.originalFileSize))
      ? Math.trunc(Number(normalizedMeeting.originalFileSize))
      : null,
    original_file_mime_type: String(normalizedMeeting.originalFileMimeType || '').trim() || null,
    created_at: normalizedMeeting.createdAt || now,
    updated_at: normalizedMeeting.updatedAt || now
  };
}

function mapDatabaseRowToMeeting(row) {
  if (!row || typeof row !== 'object') {
    return normalizeMeetingRecord({});
  }

  const storagePath = String(row.storage_path || '').trim();
  const storageBucket = String(row.storage_bucket || '').trim() || (storagePath ? TRANSCRIPT_STORAGE_BUCKET : '');

  return normalizeMeetingRecord({
    id: String(row.id || ''),
    userId: String(row.user_id || ''),
    title: String(row.title || '').trim(),
    date: normalizeExtractedDate(row.meeting_date || ''),
    dateText: normalizeExtractedDate(row.meeting_date || '') || '',
    startTime: String(row.start_time || '').trim(),
    duration: String(row.duration || '').trim(),
    durationMinutes: 0,
    meetingType: 'Imported',
    customerId: null,
    partnerId: null,
    participantIds: [],
    subject: String(row.subject || '').trim(),
    tags: [],
    summary: normalizeStringArray(row.summary),
    decisions: normalizeStringArray(row.decisions),
    actions: normalizeStringArray(row.actions),
    actionItemIds: [],
    openQuestions: normalizeStringArray(row.open_questions),
    commercialNotes: normalizeStringArray(row.commercial_notes),
    cleanedTranscript: String(row.cleaned_transcript || '').trim(),
    extractedText: String(row.extracted_text || '').trim(),
    extractedHtml: String(row.extracted_html || '').trim(),
    transcript: String(row.extracted_text || row.cleaned_transcript || '').trim(),
    extraSections: Array.isArray(row.extra_sections)
      ? row.extra_sections.map(normalizeExtraSection).filter(Boolean)
      : [],
    storageBucket,
    storagePath,
    originalFileName: String(row.original_file_name || '').trim(),
    originalFileSize: Number.isFinite(Number(row.original_file_size)) ? Math.trunc(Number(row.original_file_size)) : null,
    originalFileMimeType: String(row.original_file_mime_type || '').trim(),
    customer: String(row.customer || '').trim(),
    partner: String(row.partner || '').trim(),
    participants: normalizeMeetingParticipants(row.participants),
    createdAt: String(row.created_at || ''),
    updatedAt: String(row.updated_at || row.created_at || '')
  });
}

function getLocalStagedMeetings() {
  return readStoredMeetings();
}

function getLocalStagedActionOverrides() {
  return readStoredActionOverrides();
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

function readStoredSettings() {
  const stagedRecord = getLocalStagedSettingsRecord();
  if (!stagedRecord.exists) {
    return {};
  }

  return sanitizeApplicationSettings(stagedRecord.raw);
}

function getStorageSnapshot(keys) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {};
  }

  return keys.reduce((snapshot, key) => {
    snapshot[key] = window.localStorage.getItem(key);
    return snapshot;
  }, {});
}

function restoreStorageSnapshot(snapshot) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return true;
  }

  try {
    Object.entries(snapshot || {}).forEach(([key, rawValue]) => {
      if (typeof rawValue === 'string') {
        window.localStorage.setItem(key, rawValue);
      } else {
        window.localStorage.removeItem(key);
      }
    });

    return true;
  } catch (error) {
    return false;
  }
}

function applyLocalDataReplacement(nextData) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {
      success: false,
      error: 'Browser storage is not available in this environment.'
    };
  }

  const snapshot = getStorageSnapshot([STORAGE_KEY, ACTION_OVERRIDES_STORAGE_KEY, SETTINGS_STORAGE_KEY]);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData.meetings));
    window.localStorage.setItem(ACTION_OVERRIDES_STORAGE_KEY, JSON.stringify(nextData.actionOverrides));
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(nextData.settings));
  } catch (error) {
    const rollbackSucceeded = restoreStorageSnapshot(snapshot);
    return {
      success: false,
      error: rollbackSucceeded
        ? 'Failed to write backup data to local storage. Existing data was restored.'
        : 'Failed to write backup data, and rollback could not be completed safely.'
    };
  }

  return { success: true };
}

function getNormalizedActionOverridesArray(overrides) {
  const records = Array.isArray(overrides) ? overrides : Object.values(overrides || {});
  return records
    .map((record) => sanitizeActionOverrideRecord(record))
    .filter(Boolean)
    .sort((first, second) => first.actionId.localeCompare(second.actionId));
}

function buildBackupPayload() {
  return {
    app: BACKUP_APP_NAME,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      meetings: [...state.savedMeetings].map(normalizeMeetingRecord),
      actionOverrides: getNormalizedActionOverridesArray(state.actionOverrides),
      settings: buildCurrentApplicationSettings()
    }
  };
}

function validateBackupPayload(payload) {
  if (!isPlainObject(payload)) {
    return { valid: false, error: 'The selected file is not a valid backup object.' };
  }

  if (payload.app !== BACKUP_APP_NAME) {
    return { valid: false, error: `Unsupported backup app. Expected "${BACKUP_APP_NAME}".` };
  }

  if (payload.version !== BACKUP_VERSION) {
    return { valid: false, error: `Unsupported backup version: ${payload.version}.` };
  }

  if (!isPlainObject(payload.data)) {
    return { valid: false, error: 'Backup is missing a valid data object.' };
  }

  const { meetings, actionOverrides, settings } = payload.data;

  if (!Array.isArray(meetings)) {
    return { valid: false, error: 'Backup data is invalid: meetings must be an array.' };
  }

  if (!Array.isArray(actionOverrides)) {
    return { valid: false, error: 'Backup data is invalid: actionOverrides must be an array.' };
  }

  if (typeof settings !== 'undefined' && !isPlainObject(settings)) {
    return { valid: false, error: 'Backup data is invalid: settings must be an object when provided.' };
  }

  return {
    valid: true,
    data: {
      meetings: meetings.map((meeting) => normalizeMeetingRecord(meeting)),
      actionOverrides: getNormalizedActionOverridesArray(actionOverrides),
      settings: typeof settings === 'undefined' ? {} : sanitizeApplicationSettings(settings)
    }
  };
}

function createMeetingId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `meeting-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getAllMeetings() {
  return [...state.savedMeetings].map(normalizeMeetingRecord);
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
  const parsedParticipants = extractParticipantRecordsFromMeeting(meeting);
  if (parsedParticipants.length) {
    return parsedParticipants.map((participant) => participant.name).join(', ');
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
  const validation = getValidatedImportDocxFile(selectedFile);
  const isValidDocx = validation.valid;
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
  meetingEditMode: false,
  meetingEditDraft: null,
  meetingEditError: '',
  selectedCustomerKey: null,
  selectedPartnerKey: null,
  selectedParticipantKey: null,
  meetingReturnContext: null,
  actionFilter: 'All',
  actionOverrides: {},
  activeViewerTab: 'overview',
  sortOrder: 'newest',
  searchQuery: '',
  searchDebounceHandle: null,
  searchResultsOpen: false,
  searchActiveIndex: -1,
  searchHighlightedActionId: '',
  savedMeetings: [],
  savedSettings: getDefaultApplicationSettings(),
  cloudMeetingsError: '',
  cloudMeetingsLoaded: false,
  actionOverridesError: '',
  cloudSettingsError: '',
  settingsSaveInProgress: false,
  settingsMigrationInProgress: false,
  settingsMigrationArchiveAvailable: false,
  overrideMigrationInProgress: false,
  overrideMigrationArchiveAvailable: false,
  migrationInProgress: false,
  migrationArchiveAvailable: false,
  importSelectedFile: null,
  importError: '',
  importSuccessMessage: '',
  importReview: createEmptyImportReview(),
  importSaveInProgress: false,
  importSaveStatus: '',
  importExtracting: false,
  importExtractionError: '',
  importExtractedText: '',
  importExtractedHtml: '',
  importExtractedSections: createEmptyExtractedSections(),
  importParserDebug: {
    blocks: [],
    metadata: {},
    headings: []
  },
  dataManagementError: '',
  dataManagementSuccess: '',
  dataManagementLastExportAt: '',
  dataManagementSelectedBackupFile: null,
  dataManagementSelectedBackupName: '',
  meetingDocumentDownloadInProgressId: '',
  meetingDocumentDownloadError: '',
  meetingDeletionWarning: ''
};

function isSavedMeetingEditable(meetingId) {
  if (!meetingId) {
    return false;
  }

  return state.savedMeetings.some((meeting) => meeting && meeting.id === meetingId);
}

function getSavedMeetingIndex(meetingId) {
  return state.savedMeetings.findIndex((meeting) => meeting && meeting.id === meetingId);
}

function getMeetingTextForEdit(value) {
  if (Array.isArray(value)) {
    return value
      .filter((entry) => typeof entry === 'string')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .join('\n');
  }

  if (typeof value === 'string') {
    return value;
  }

  return '';
}

function getParticipantsTextForEdit(meeting) {
  if (Array.isArray(meeting.participants)) {
    return meeting.participants.join(', ');
  }

  if (typeof meeting.participants === 'string') {
    return meeting.participants;
  }

  if (Array.isArray(meeting.participantIds) && meeting.participantIds.length) {
    return meeting.participantIds
      .map((participantId) => getParticipantById(participantId))
      .filter(Boolean)
      .map((participant) => participant.name)
      .join(', ');
  }

  return '';
}

function createMeetingEditDraft(meeting) {
  return {
    title: meeting.title || '',
    date: normalizeExtractedDate(meeting.date || ''),
    startTime: meeting.startTime || '',
    duration: meeting.duration || '',
    customer: meeting.customer || '',
    partner: meeting.partner || '',
    participants: getParticipantsTextForEdit(meeting),
    subject: meeting.subject || '',
    summary: getMeetingTextForEdit(meeting.summary),
    decisions: getMeetingTextForEdit(meeting.decisions),
    actions: getMeetingTextForEdit(meeting.actions),
    openQuestions: getMeetingTextForEdit(meeting.openQuestions),
    commercialNotes: getMeetingTextForEdit(meeting.commercialNotes)
  };
}

function parseMeetingTextAreaLines(value) {
  return String(value || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseParticipantsForMeeting(value) {
  return String(value || '')
    .split(/[;,]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function getActionIdsForMeeting(meetingId) {
  if (!meetingId) {
    return [];
  }

  return getCombinedActions()
    .filter((action) => action.sourceMeetingId === meetingId)
    .map((action) => action.id);
}

function enterMeetingEditMode(meeting) {
  if (!meeting || !isSavedMeetingEditable(meeting.id)) {
    return;
  }

  state.meetingEditMode = true;
  state.meetingEditDraft = createMeetingEditDraft(meeting);
  state.meetingEditError = '';
  renderViews();
}

function cancelMeetingEditMode() {
  state.meetingEditMode = false;
  state.meetingEditDraft = null;
  state.meetingEditError = '';
  renderViews();
}

function saveMeetingEdits() {
  const meetingId = state.selectedMeetingId;
  const meetingIndex = getSavedMeetingIndex(meetingId);
  if (meetingIndex < 0) {
    state.meetingEditError = 'Only meetings loaded for this account can be edited.';
    renderViews();
    return;
  }

  if (!supabaseClient || !authState.user || !authState.user.id) {
    state.meetingEditError = 'You must be signed in to save meeting changes.';
    renderViews();
    return;
  }

  const draft = state.meetingEditDraft || {};
  const title = String(draft.title || '').trim();
  const date = String(draft.date || '').trim();
  const normalizedDate = normalizeExtractedDate(date);

  if (!title) {
    state.meetingEditError = 'Meeting title is required.';
    renderViews();
    return;
  }

  if (!normalizedDate || normalizedDate !== date) {
    state.meetingEditError = 'Date is required and must use YYYY-MM-DD.';
    renderViews();
    return;
  }

  const existingMeeting = state.savedMeetings[meetingIndex];
  const updatedMeeting = {
    ...existingMeeting,
    title,
    date: normalizedDate,
    startTime: String(draft.startTime || '').trim(),
    duration: String(draft.duration || '').trim(),
    customer: String(draft.customer || '').trim(),
    partner: String(draft.partner || '').trim(),
    participants: parseParticipantsForMeeting(draft.participants),
    subject: String(draft.subject || '').trim(),
    summary: parseMeetingTextAreaLines(draft.summary),
    decisions: parseMeetingTextAreaLines(draft.decisions),
    actions: parseMeetingTextAreaLines(draft.actions),
    openQuestions: parseMeetingTextAreaLines(draft.openQuestions),
    commercialNotes: parseMeetingTextAreaLines(draft.commercialNotes),
    updatedAt: new Date().toISOString()
  };

  const updatedMeetings = [...state.savedMeetings];
  const meetingRow = mapMeetingToDatabaseRow(updatedMeeting, authState.user.id);

  supabaseClient
    .from('meetings')
    .update(meetingRow)
    .eq('id', meetingId)
    .eq('user_id', authState.user.id)
    .select(MEETING_ROW_COLUMNS)
    .single()
    .then(({ data, error }) => {
      if (error || !data) {
        state.meetingEditError = 'Unable to save changes to Supabase right now.';
        renderViews();
        return;
      }

      updatedMeetings[meetingIndex] = mapDatabaseRowToMeeting(data);
      state.savedMeetings = updatedMeetings.sort(compareMeetingsNewestFirst);
      state.meetingEditMode = false;
      state.meetingEditDraft = null;
      state.meetingEditError = '';
      renderViews();
    });

  return;
}

async function deleteSavedMeeting() {
  const meetingId = state.selectedMeetingId;
  const meetingIndex = getSavedMeetingIndex(meetingId);
  if (meetingIndex < 0) {
    return;
  }

  if (!supabaseClient || !authState.user || !authState.user.id) {
    state.meetingEditError = 'You must be signed in to delete meetings.';
    renderViews();
    return;
  }

  const meeting = state.savedMeetings[meetingIndex];
  const storageBucket = String(meeting.storageBucket || '').trim();
  const storagePath = String(meeting.storagePath || '').trim();
  const confirmed = window.confirm(`Delete "${meeting.title}"?\n\nThis removes the meeting from your Supabase account.`);
  if (!confirmed) {
    return;
  }

  const actionIdsToRemove = new Set(getActionIdsForMeeting(meetingId));
  const nextOverrides = Object.entries(state.actionOverrides).reduce((accumulator, [actionId, record]) => {
    if (!actionIdsToRemove.has(actionId)) {
      accumulator[actionId] = record;
    }
    return accumulator;
  }, {});

  const { data, error } = await supabaseClient
    .from('meetings')
    .delete()
    .eq('id', meetingId)
    .eq('user_id', authState.user.id)
    .select('id')
    .maybeSingle();

  if (error || !data) {
    state.meetingEditError = 'Unable to delete this meeting from Supabase right now.';
    renderViews();
    return;
  }

  state.meetingDeletionWarning = '';
  if (storageBucket && storagePath) {
    const cleanupResult = await deleteStoredTranscriptFile(storageBucket, storagePath);
    if (!cleanupResult.success) {
      state.meetingDeletionWarning = 'Meeting was deleted, but original document cleanup failed in Supabase Storage.';
    }
  }

  const updatedMeetings = state.savedMeetings.filter((meetingItem) => meetingItem.id !== meetingId);

  state.actionOverrides = nextOverrides;
  state.savedMeetings = updatedMeetings;
  state.selectedMeetingId = null;
  state.meetingEditMode = false;
  state.meetingEditDraft = null;
  state.meetingEditError = '';
  state.searchHighlightedActionId = '';
  state.activeSection = 'meetings';
  state.meetingReturnContext = null;
  state.meetingDocumentDownloadInProgressId = '';
  state.meetingDocumentDownloadError = '';
  renderViews();
}

const sectionTitles = {
  dashboard: 'Dashboard',
  meetings: 'Meetings',
  customers: 'Customers',
  partners: 'Partners',
  participants: 'Participants',
  actions: 'Actions',
  dataManagement: 'Data Management',
  import: 'Import Transcript'
};

const mainPanelIds = ['dashboard-view', 'meetings-view', 'customers-view', 'partners-view', 'participants-view', 'actions-view', 'dataManagement-view', 'import-view'];
const viewerTabs = ['overview', 'summary', 'decisions', 'actions', 'questions', 'commercial', 'additionalSections', 'transcript'];

function closeSearchResults(clearQuery = false) {
  if (state.searchDebounceHandle) {
    clearTimeout(state.searchDebounceHandle);
    state.searchDebounceHandle = null;
  }

  state.searchResultsOpen = false;
  state.searchActiveIndex = -1;

  if (clearQuery) {
    state.searchQuery = '';
  }
}

function scheduleSearchRender(queryText) {
  state.searchQuery = queryText;

  if (state.searchDebounceHandle) {
    clearTimeout(state.searchDebounceHandle);
  }

  state.searchDebounceHandle = setTimeout(() => {
    const normalized = normalizeSearchQuery(state.searchQuery);
    state.searchResultsOpen = normalized.length >= SEARCH_MIN_CHARS;
    state.searchActiveIndex = -1;
    state.searchDebounceHandle = null;
    renderViews();
  }, SEARCH_DEBOUNCE_MS);
}

function getCurrentFlatSearchResults() {
  return getGlobalSearchResults().flatResults;
}

function openSearchResult(result) {
  if (!result) {
    return;
  }

  state.searchResultsOpen = false;
  state.searchActiveIndex = -1;

  if (result.type === 'meeting') {
    state.meetingReturnContext = {
      section: 'search',
      key: state.activeSection
    };
    state.activeSection = 'meetings';
    state.selectedMeetingId = result.id;
    state.meetingEditMode = false;
    state.meetingEditDraft = null;
    state.meetingEditError = '';
    state.activeViewerTab = 'overview';
    renderViews();
    return;
  }

  state.meetingReturnContext = null;
  state.selectedMeetingId = null;

  if (result.type === 'customer') {
    state.activeSection = 'customers';
    state.selectedCustomerKey = result.id;
    state.selectedPartnerKey = null;
    state.selectedParticipantKey = null;
    state.meetingEditMode = false;
    state.meetingEditDraft = null;
    state.meetingEditError = '';
    renderViews();
    return;
  }

  if (result.type === 'partner') {
    state.activeSection = 'partners';
    state.selectedPartnerKey = result.id;
    state.selectedCustomerKey = null;
    state.selectedParticipantKey = null;
    state.meetingEditMode = false;
    state.meetingEditDraft = null;
    state.meetingEditError = '';
    renderViews();
    return;
  }

  if (result.type === 'participant') {
    state.activeSection = 'participants';
    state.selectedParticipantKey = result.id;
    state.selectedCustomerKey = null;
    state.selectedPartnerKey = null;
    state.meetingEditMode = false;
    state.meetingEditDraft = null;
    state.meetingEditError = '';
    renderViews();
    return;
  }

  if (result.type === 'action') {
    state.activeSection = 'actions';
    state.actionFilter = 'All';
    state.searchHighlightedActionId = result.id;
    state.selectedCustomerKey = null;
    state.selectedPartnerKey = null;
    state.selectedParticipantKey = null;
    state.meetingEditMode = false;
    state.meetingEditDraft = null;
    state.meetingEditError = '';
    renderViews();
  }
}

function init() {
  const navigationButtons = document.querySelectorAll('.nav-button');
  const searchInput = document.getElementById('global-search');
  const signOutButton = document.querySelector('.js-auth-sign-out');

  navigationButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.activeSection = button.dataset.section;
      state.selectedMeetingId = null;
      state.meetingEditMode = false;
      state.meetingEditDraft = null;
      state.meetingEditError = '';
      state.selectedCustomerKey = null;
      state.selectedPartnerKey = null;
      state.selectedParticipantKey = null;
      state.meetingReturnContext = null;
      state.searchResultsOpen = false;
      state.searchActiveIndex = -1;
      state.activeViewerTab = 'overview';
      renderViews();
    });
  });

  if (searchInput) {
    searchInput.value = state.searchQuery;

    searchInput.addEventListener('input', (event) => {
      scheduleSearchRender(event.target.value);
    });

    searchInput.addEventListener('keydown', (event) => {
      const flatResults = getCurrentFlatSearchResults();

      if (event.key === 'Escape') {
        event.preventDefault();
        closeSearchResults(true);
        renderViews();
        return;
      }

      if (!state.searchResultsOpen || !flatResults.length) {
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        state.searchActiveIndex = (state.searchActiveIndex + 1 + flatResults.length) % flatResults.length;
        renderViews();
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        state.searchActiveIndex = (state.searchActiveIndex - 1 + flatResults.length) % flatResults.length;
        renderViews();
        return;
      }

      if (event.key === 'Enter') {
        if (state.searchActiveIndex >= 0 && state.searchActiveIndex < flatResults.length) {
          event.preventDefault();
          openSearchResult(flatResults[state.searchActiveIndex]);
        }
      }
    });

    document.addEventListener('click', (event) => {
      if (!state.searchResultsOpen) {
        return;
      }

      const searchField = document.querySelector('.search-field');
      if (searchField && !searchField.contains(event.target)) {
        state.searchResultsOpen = false;
        state.searchActiveIndex = -1;
        renderViews();
      }
    });
  }

  if (signOutButton) {
    signOutButton.addEventListener('click', () => {
      handleSignOut();
    });
  }

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

function renderCloudMeetingsState() {
  if (authState.meetingsLoading) {
    return `
      <section class="panel-card">
        ${renderEmptyState('Loading cloud meetings', 'Your meetings are being loaded from Supabase.')}
      </section>
    `;
  }

  if (authState.actionOverridesLoading) {
    return `
      <section class="panel-card">
        ${renderEmptyState('Loading cloud action updates', 'Your action statuses and due dates are being loaded from Supabase.')}
      </section>
    `;
  }

  if (authState.settingsLoading) {
    return `
      <section class="panel-card">
        ${renderEmptyState('Loading cloud settings', 'Your application settings are being loaded from Supabase.')}
      </section>
    `;
  }

  if (state.cloudMeetingsError) {
    return `
      <section class="panel-card">
        <div class="empty-state">
          <h4>Unable to load cloud meetings</h4>
          <p>${escapeHtml(state.cloudMeetingsError)}</p>
          <button class="secondary-button js-retry-cloud-meetings" type="button">Retry loading cloud data</button>
        </div>
      </section>
    `;
  }

  if (state.actionOverridesError) {
    return `
      <section class="panel-card">
        <div class="empty-state">
          <h4>Unable to load cloud action updates</h4>
          <p>${escapeHtml(state.actionOverridesError)}</p>
          <button class="secondary-button js-retry-cloud-meetings" type="button">Retry loading cloud data</button>
        </div>
      </section>
    `;
  }

  if (state.cloudSettingsError) {
    return `
      <section class="panel-card">
        <div class="empty-state">
          <h4>Unable to load cloud settings</h4>
          <p>${escapeHtml(state.cloudSettingsError)}</p>
          <button class="secondary-button js-retry-cloud-meetings" type="button">Retry loading cloud data</button>
        </div>
      </section>
    `;
  }

  return '';
}

function renderViews() {
  if (!authState.user) {
    return;
  }

  const cloudMeetingsState = renderCloudMeetingsState();

  const viewSections = {
    dashboard: document.getElementById('dashboard-view'),
    meetings: document.getElementById('meetings-view'),
    customers: document.getElementById('customers-view'),
    partners: document.getElementById('partners-view'),
    participants: document.getElementById('participants-view'),
    actions: document.getElementById('actions-view'),
    dataManagement: document.getElementById('dataManagement-view'),
    import: document.getElementById('import-view')
  };

  if (cloudMeetingsState) {
    viewSections.dashboard.innerHTML = cloudMeetingsState;
    viewSections.meetings.innerHTML = cloudMeetingsState;
    viewSections.customers.innerHTML = cloudMeetingsState;
    viewSections.partners.innerHTML = cloudMeetingsState;
    viewSections.participants.innerHTML = cloudMeetingsState;
    viewSections.actions.innerHTML = cloudMeetingsState;
    viewSections.dataManagement.innerHTML = renderDataManagement();
    viewSections.import.innerHTML = renderImport();

    updateNavigation(Array.from(document.querySelectorAll('.nav-button')).map((button) => ({
      button,
      section: button.dataset.section
    })));

    renderGlobalSearchPanel();
    document.getElementById('page-title').textContent = getPageTitle();
    attachInteractions();
    updateImportSaveButtonState();
    return;
  }

  viewSections.dashboard.innerHTML = renderDashboard(getVisibleMeetings());

  if (state.activeSection === 'meetings' && state.selectedMeetingId) {
    const selectedMeeting = getMeetingById(state.selectedMeetingId);
    if (!selectedMeeting) {
      state.selectedMeetingId = null;
      state.meetingEditMode = false;
      state.meetingEditDraft = null;
      state.meetingEditError = '';
      viewSections.meetings.innerHTML = renderMeetingsPage();
    } else {
      viewSections.meetings.innerHTML = state.meetingEditMode ? renderMeetingEditForm(selectedMeeting) : renderMeetingDetailViewer(selectedMeeting);
    }

    if (selectedMeeting && !state.meetingEditMode) {
      populateViewerContent(selectedMeeting);
    }
  } else {
    state.meetingEditMode = false;
    state.meetingEditDraft = null;
    state.meetingEditError = '';
    viewSections.meetings.innerHTML = renderMeetingsPage();
  }

  viewSections.customers.innerHTML = renderCustomers();
  viewSections.partners.innerHTML = renderPartners();
  viewSections.participants.innerHTML = renderParticipants();
  viewSections.actions.innerHTML = renderActions();
  viewSections.dataManagement.innerHTML = renderDataManagement();
  viewSections.import.innerHTML = renderImport();

  updateNavigation(Array.from(document.querySelectorAll('.nav-button')).map((button) => ({
    button,
    section: button.dataset.section
  })));

  const searchInput = document.getElementById('global-search');
  if (searchInput && searchInput.value !== state.searchQuery) {
    searchInput.value = state.searchQuery;
  }

  renderGlobalSearchPanel();
  document.getElementById('page-title').textContent = getPageTitle();
  attachInteractions();
  updateImportSaveButtonState();

  if (state.activeSection === 'actions' && state.searchHighlightedActionId) {
    const highlightedAction = document.querySelector(`.action-card[data-action-id="${state.searchHighlightedActionId}"]`);
    if (highlightedAction) {
      highlightedAction.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

function getVisibleMeetings() {
  const query = normalizeSearchQuery(state.searchQuery);
  const meetings = getAllMeetings().sort((a, b) => {
    const order = state.sortOrder === 'oldest' ? 1 : -1;
    const dateA = new Date(a.date || a.createdAt || '1970-01-01').getTime();
    const dateB = new Date(b.date || b.createdAt || '1970-01-01').getTime();
    return order * (dateA - dateB);
  });

  if (!query || query.length < SEARCH_MIN_CHARS) {
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

function normalizeCompanyName(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeSearchQuery(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeSearchText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function includesSearchText(value, normalizedQuery) {
  if (!normalizedQuery) {
    return false;
  }

  return normalizeSearchText(value).includes(normalizedQuery);
}

function getSearchExcerpt(value, normalizedQuery, maxLength = 140) {
  const text = normalizeCompanyName(value);
  if (!text) {
    return '';
  }

  const lowerText = text.toLowerCase();
  const index = lowerText.indexOf(normalizedQuery);
  if (index < 0) {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  }

  const half = Math.floor(maxLength / 2);
  const start = Math.max(0, index - half);
  const end = Math.min(text.length, start + maxLength);
  const prefix = start > 0 ? '... ' : '';
  const suffix = end < text.length ? ' ...' : '';
  return `${prefix}${text.slice(start, end)}${suffix}`;
}

function getHighlightedHtml(value, normalizedQuery) {
  const text = String(value || '');
  if (!text) {
    return '';
  }

  if (!normalizedQuery) {
    return escapeHtml(text);
  }

  const lowerText = text.toLowerCase();
  const index = lowerText.indexOf(normalizedQuery);
  if (index < 0) {
    return escapeHtml(text);
  }

  const before = text.slice(0, index);
  const match = text.slice(index, index + normalizedQuery.length);
  const after = text.slice(index + normalizedQuery.length);
  return `${escapeHtml(before)}<mark>${escapeHtml(match)}</mark>${escapeHtml(after)}`;
}

function getMeetingSearchFields(meeting) {
  const additionalSectionLines = Array.isArray(meeting.extraSections)
    ? meeting.extraSections.flatMap((section) => {
      const heading = normalizeCompanyName(section && section.heading);
      const lines = Array.isArray(section && section.lines) ? section.lines : [];
      return [heading, ...lines];
    }).filter(Boolean)
    : [];

  return [
    meeting.title,
    meeting.date,
    getMeetingDisplayCustomer(meeting),
    getMeetingDisplayPartner(meeting),
    getMeetingDisplayParticipants(meeting),
    meeting.subject,
    Array.isArray(meeting.summary) ? meeting.summary.join(' ') : meeting.summary,
    Array.isArray(meeting.decisions) ? meeting.decisions.join(' ') : meeting.decisions,
    Array.isArray(meeting.actions) ? meeting.actions.join(' ') : meeting.actions,
    Array.isArray(meeting.openQuestions) ? meeting.openQuestions.join(' ') : meeting.openQuestions,
    Array.isArray(meeting.commercialNotes) ? meeting.commercialNotes.join(' ') : meeting.commercialNotes,
    meeting.cleanedTranscript,
    meeting.extractedText,
    Array.isArray(meeting.tags) ? meeting.tags.join(' ') : meeting.tags,
    additionalSectionLines.join(' ')
  ].filter(Boolean);
}

function findMeetingMatchExcerpt(meeting, normalizedQuery) {
  const fields = getMeetingSearchFields(meeting);
  const matchedField = fields.find((field) => includesSearchText(field, normalizedQuery));
  if (!matchedField) {
    return '';
  }

  return getSearchExcerpt(matchedField, normalizedQuery, 150);
}

function getGlobalSearchResults() {
  const normalizedQuery = normalizeSearchQuery(state.searchQuery);
  if (normalizedQuery.length < SEARCH_MIN_CHARS) {
    return {
      normalizedQuery,
      totalCount: 0,
      flatResults: [],
      groups: {
        meetings: [],
        customers: [],
        partners: [],
        participants: [],
        actions: []
      },
      totalByGroup: {
        meetings: 0,
        customers: 0,
        partners: 0,
        participants: 0,
        actions: 0
      }
    };
  }

  const allMeetingMatches = getAllMeetings()
    .map((meeting) => {
      const excerpt = findMeetingMatchExcerpt(meeting, normalizedQuery);
      if (!excerpt) {
        return null;
      }

      return {
        type: 'meeting',
        id: meeting.id,
        title: meeting.title || 'Untitled meeting',
        date: meeting.date || '',
        customer: getMeetingDisplayCustomer(meeting),
        partner: getMeetingDisplayPartner(meeting),
        excerpt
      };
    })
    .filter(Boolean);

  const meetings = allMeetingMatches.slice(0, 5);

  const allCustomerMatches = getCustomersFromMeetings()
    .filter((customer) => {
      const searchBlob = [customer.name, customer.relatedNames.join(' '), customer.latestMeetingDate].join(' ');
      return includesSearchText(searchBlob, normalizedQuery);
    })
    .map((customer) => ({
      type: 'customer',
      id: customer.key,
      title: customer.name,
      detail: `${customer.meetings.length} meetings`
    }));

  const customers = allCustomerMatches.slice(0, 5);

  const allPartnerMatches = getPartnersFromMeetings()
    .filter((partner) => {
      const searchBlob = [partner.name, partner.relatedNames.join(' '), partner.latestMeetingDate].join(' ');
      return includesSearchText(searchBlob, normalizedQuery);
    })
    .map((partner) => ({
      type: 'partner',
      id: partner.key,
      title: partner.name,
      detail: `${partner.meetings.length} meetings`
    }));

  const partners = allPartnerMatches.slice(0, 5);

  const allParticipantMatches = getParticipantsFromMeetings()
    .filter((participant) => {
      const searchBlob = [participant.name, participant.companies.join(' '), participant.fallbackEntry].join(' ');
      return includesSearchText(searchBlob, normalizedQuery);
    })
    .map((participant) => ({
      type: 'participant',
      id: participant.key,
      title: participant.name,
      detail: `${participant.meetings.length} meetings`
    }));

  const participants = allParticipantMatches.slice(0, 5);

  const allActionMatches = sortCombinedActions(getCombinedActions())
    .filter((action) => {
      const searchBlob = [
        action.description,
        action.owner,
        action.notes,
        action.status,
        action.dueDate,
        action.sourceMeetingTitle,
        action.customer,
        action.partner
      ].join(' ');
      return includesSearchText(searchBlob, normalizedQuery);
    })
    .map((action) => ({
      type: 'action',
      id: action.id,
      title: action.description,
      detail: action.sourceMeetingTitle
    }));

  const actions = allActionMatches.slice(0, 5);

  const groups = { meetings, customers, partners, participants, actions };
  const flatResults = [
    ...meetings,
    ...customers,
    ...partners,
    ...participants,
    ...actions
  ];

  return {
    normalizedQuery,
    totalCount: allMeetingMatches.length + allCustomerMatches.length + allPartnerMatches.length + allParticipantMatches.length + allActionMatches.length,
    flatResults,
    groups,
    totalByGroup: {
      meetings: allMeetingMatches.length,
      customers: allCustomerMatches.length,
      partners: allPartnerMatches.length,
      participants: allParticipantMatches.length,
      actions: allActionMatches.length
    }
  };
}

function renderSearchResultGroup(groupTitle, groupKey, results, normalizedQuery, flatResults, totalInGroup) {
  if (!results.length) {
    return '';
  }

  const items = results.map((result) => {
    if (result.type === 'meeting') {
      const activeIndex = state.searchActiveIndex;
      const itemIndex = flatResults.findIndex((item) => item.type === result.type && item.id === result.id);
      const activeClass = itemIndex === activeIndex ? 'active' : '';
      return `
        <button class="search-result-item ${activeClass} js-search-result" type="button" data-result-type="meeting" data-result-id="${escapeHtml(result.id)}">
          <strong>${getHighlightedHtml(result.title, normalizedQuery)}</strong>
          <span>${escapeHtml(formatDate(result.date))} · ${getHighlightedHtml(result.customer || 'Unassigned', normalizedQuery)} · ${getHighlightedHtml(result.partner || 'Unassigned', normalizedQuery)}</span>
          <span>${getHighlightedHtml(result.excerpt, normalizedQuery)}</span>
        </button>
      `;
    }

    const activeIndex = state.searchActiveIndex;
    const itemIndex = flatResults.findIndex((item) => item.type === result.type && item.id === result.id);
    const activeClass = itemIndex === activeIndex ? 'active' : '';

    return `
      <button class="search-result-item ${activeClass} js-search-result" type="button" data-result-type="${escapeHtml(result.type)}" data-result-id="${escapeHtml(result.id)}">
        <strong>${getHighlightedHtml(result.title, normalizedQuery)}</strong>
        <span>${getHighlightedHtml(result.detail || '', normalizedQuery)}</span>
      </button>
    `;
  }).join('');

  return `
    <section class="search-result-group" data-group="${escapeHtml(groupKey)}">
      <h4>${escapeHtml(groupTitle)}${totalInGroup > results.length ? ` (${results.length}/${totalInGroup})` : ` (${totalInGroup})`}</h4>
      <div class="search-result-group-list">${items}</div>
    </section>
  `;
}

function renderGlobalSearchPanel() {
  const searchField = document.querySelector('.search-field');
  if (!searchField) {
    return;
  }

  const existingPanel = searchField.querySelector('.search-results-panel');
  if (existingPanel) {
    existingPanel.remove();
  }

  const resultModel = getGlobalSearchResults();
  if (!state.searchResultsOpen || resultModel.normalizedQuery.length < SEARCH_MIN_CHARS) {
    return;
  }

  const panel = document.createElement('div');
  panel.className = 'search-results-panel';

  const emptyState = '<p class="search-results-empty">No results found.</p>';
  const groupsHtml = [
    renderSearchResultGroup('Meetings', 'meetings', resultModel.groups.meetings, resultModel.normalizedQuery, resultModel.flatResults, resultModel.totalByGroup.meetings),
    renderSearchResultGroup('Customers', 'customers', resultModel.groups.customers, resultModel.normalizedQuery, resultModel.flatResults, resultModel.totalByGroup.customers),
    renderSearchResultGroup('Partners', 'partners', resultModel.groups.partners, resultModel.normalizedQuery, resultModel.flatResults, resultModel.totalByGroup.partners),
    renderSearchResultGroup('Participants', 'participants', resultModel.groups.participants, resultModel.normalizedQuery, resultModel.flatResults, resultModel.totalByGroup.participants),
    renderSearchResultGroup('Actions', 'actions', resultModel.groups.actions, resultModel.normalizedQuery, resultModel.flatResults, resultModel.totalByGroup.actions)
  ].join('');

  panel.innerHTML = `
    <div class="search-results-summary">${resultModel.totalCount} results</div>
    ${resultModel.totalCount ? groupsHtml : emptyState}
  `;

  searchField.appendChild(panel);
}

function getNameGroupingKey(value) {
  return normalizeCompanyName(value).toLowerCase();
}

function getMeetingCustomerName(meeting) {
  if (!meeting || typeof meeting !== 'object') {
    return '';
  }

  const directName = normalizeCompanyName(meeting.customer);
  if (directName) {
    return directName;
  }

  if (meeting.customerId) {
    const customer = getCustomerById(meeting.customerId);
    const mappedName = customer ? normalizeCompanyName(customer.name) : '';
    if (mappedName) {
      return mappedName;
    }
  }

  return '';
}

function getMeetingPartnerName(meeting) {
  if (!meeting || typeof meeting !== 'object') {
    return '';
  }

  const directName = normalizeCompanyName(meeting.partner);
  if (directName) {
    return directName;
  }

  if (meeting.partnerId) {
    const partner = getPartnerById(meeting.partnerId);
    const mappedName = partner ? normalizeCompanyName(partner.name) : '';
    if (mappedName) {
      return mappedName;
    }
  }

  return '';
}

function getMeetingTimestamp(meeting) {
  if (!meeting || typeof meeting !== 'object') {
    return 0;
  }

  if (meeting.date) {
    const dateTimestamp = new Date(`${meeting.date}T00:00:00`).getTime();
    if (Number.isFinite(dateTimestamp)) {
      return dateTimestamp;
    }
  }

  const createdTimestamp = new Date(meeting.createdAt || '').getTime();
  return Number.isFinite(createdTimestamp) ? createdTimestamp : 0;
}

function compareMeetingsNewestFirst(firstMeeting, secondMeeting) {
  return getMeetingTimestamp(secondMeeting) - getMeetingTimestamp(firstMeeting);
}

function getMeetingOpenActionCount(meeting) {
  if (!meeting || typeof meeting !== 'object') {
    return 0;
  }

  return getCombinedActions().filter((action) => action.sourceMeetingId === meeting.id && !isActionClosed(action)).length;
}

function getTodayDateString() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function hashTextStable(value) {
  let hash = 2166136261;
  const text = String(value || '');

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return (hash >>> 0).toString(16);
}

function getImportedActionId(meetingId, actionIndex, lineText) {
  const payload = `${meetingId}|${actionIndex}|${normalizeCompanyName(lineText)}`;
  return `imported-${meetingId}-${actionIndex}-${hashTextStable(payload)}`;
}

function isLikelyActionHeaderRow(lineText) {
  const normalized = String(lineText || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) {
    return false;
  }

  if (normalized === 'owner | action | notes' || normalized === 'owner | follow-up item | notes') {
    return true;
  }

  const compact = normalized.replace(/\s+/g, '');
  if (compact === 'owner|action|notes' || compact === 'owner|follow-upitem|notes') {
    return true;
  }

  return false;
}

function looksLikeActionOwner(value) {
  const normalized = normalizeCompanyName(value);
  if (!normalized) {
    return false;
  }

  const wordCount = normalized.split(' ').filter(Boolean).length;
  if (!wordCount || wordCount > 6) {
    return false;
  }

  return /[A-Za-z]/.test(normalized);
}

function parseImportedActionLine(lineText) {
  const originalLine = normalizeCompanyName(lineText);
  if (!originalLine || isLikelyActionHeaderRow(originalLine)) {
    return null;
  }

  if (originalLine.includes('|')) {
    const parts = originalLine.split('|').map((part) => normalizeCompanyName(part));
    const [ownerPart = '', actionPart = '', ...noteParts] = parts;
    const notesPart = normalizeCompanyName(noteParts.join(' | '));

    const possibleHeader = [ownerPart, actionPart, notesPart]
      .join(' | ')
      .toLowerCase();
    if (possibleHeader.includes('owner') && (possibleHeader.includes('action') || possibleHeader.includes('follow-up item')) && possibleHeader.includes('notes')) {
      return null;
    }

    if (actionPart) {
      return {
        owner: looksLikeActionOwner(ownerPart) ? ownerPart : '',
        description: actionPart,
        notes: notesPart
      };
    }
  }

  const colonMatch = originalLine.match(/^([^:]{2,80})\s*:\s*(.+)$/);
  if (colonMatch && looksLikeActionOwner(colonMatch[1])) {
    return {
      owner: normalizeCompanyName(colonMatch[1]),
      description: normalizeCompanyName(colonMatch[2]),
      notes: ''
    };
  }

  const dashMatch = originalLine.match(/^([^\-\u2013\u2014]{2,80})\s*[\-\u2013\u2014]\s+(.+)$/);
  if (dashMatch && looksLikeActionOwner(dashMatch[1])) {
    return {
      owner: normalizeCompanyName(dashMatch[1]),
      description: normalizeCompanyName(dashMatch[2]),
      notes: ''
    };
  }

  return {
    owner: '',
    description: originalLine,
    notes: ''
  };
}

function getImportedActionLinesFromMeeting(meeting) {
  if (!meeting || typeof meeting !== 'object') {
    return [];
  }

  if (Array.isArray(meeting.actions)) {
    return meeting.actions
      .filter((line) => typeof line === 'string')
      .flatMap((line) => String(line).split(/\r?\n/))
      .map((line) => normalizeCompanyName(line))
      .filter(Boolean);
  }

  if (typeof meeting.actions === 'string') {
    return meeting.actions
      .split(/\r?\n/)
      .map((line) => normalizeCompanyName(line))
      .filter(Boolean);
  }

  return [];
}

function getActionOverride(actionId) {
  return state.actionOverrides[actionId] || null;
}

function getActionById(actionId) {
  if (!actionId) {
    return null;
  }

  return getCombinedActions().find((action) => action.id === actionId) || null;
}

function isDefaultActionOverride(status, dueDate) {
  const normalizedStatus = ACTION_STATUSES.includes(status) ? status : '';
  const normalizedDueDate = normalizeExtractedDate(dueDate || '');
  return (!normalizedStatus || normalizedStatus === 'Open') && !normalizedDueDate;
}

function getEffectiveActionStatus(defaultStatus, override) {
  if (override && ACTION_STATUSES.includes(override.status)) {
    return override.status;
  }

  return ACTION_STATUSES.includes(defaultStatus) ? defaultStatus : 'Open';
}

function getEffectiveActionDueDate(defaultDueDate, override) {
  if (override && typeof override.dueDate === 'string') {
    return normalizeExtractedDate(override.dueDate || '');
  }

  return normalizeExtractedDate(defaultDueDate || '');
}

function getCombinedActions() {
  const actions = [];

  getAllMeetings().forEach((meeting) => {
    const importedLines = getImportedActionLinesFromMeeting(meeting);

    importedLines.forEach((line, lineIndex) => {
      const parsedLine = parseImportedActionLine(line);
      if (!parsedLine || !parsedLine.description) {
        return;
      }

      const actionId = getImportedActionId(meeting.id, lineIndex, line);
      const override = getActionOverride(actionId);

      actions.push({
        id: actionId,
        description: parsedLine.description,
        owner: parsedLine.owner,
        notes: parsedLine.notes,
        status: getEffectiveActionStatus('Open', override),
        dueDate: getEffectiveActionDueDate('', override),
        sourceMeetingId: meeting.id,
        sourceMeetingTitle: meeting.title || 'Imported meeting',
        customer: getMeetingDisplayCustomer(meeting),
        partner: getMeetingDisplayPartner(meeting),
        sourceType: 'imported'
      });
    });
  });

  return actions;
}

function isActionClosed(action) {
  return action.status === 'Completed' || action.status === 'Cancelled';
}

function isActionOverdue(action) {
  if (!action || !action.dueDate || isActionClosed(action)) {
    return false;
  }

  return action.dueDate < getTodayDateString();
}

function getActionSortGroup(action) {
  if (isActionClosed(action)) {
    return 3;
  }

  if (isActionOverdue(action)) {
    return 0;
  }

  if (action.dueDate) {
    return 1;
  }

  return 2;
}

function sortCombinedActions(actions) {
  return [...actions].sort((first, second) => {
    const firstGroup = getActionSortGroup(first);
    const secondGroup = getActionSortGroup(second);
    if (firstGroup !== secondGroup) {
      return firstGroup - secondGroup;
    }

    if (first.dueDate && second.dueDate) {
      if (first.dueDate !== second.dueDate) {
        return first.dueDate.localeCompare(second.dueDate);
      }
    }

    if (first.status !== second.status) {
      return ACTION_STATUSES.indexOf(first.status) - ACTION_STATUSES.indexOf(second.status);
    }

    if (first.sourceMeetingTitle !== second.sourceMeetingTitle) {
      return first.sourceMeetingTitle.localeCompare(second.sourceMeetingTitle);
    }

    return first.description.localeCompare(second.description);
  });
}

function filterCombinedActions(actions, selectedFilter) {
  if (!selectedFilter || selectedFilter === 'All') {
    return actions;
  }

  if (selectedFilter === 'Overdue') {
    return actions.filter((action) => isActionOverdue(action));
  }

  if (selectedFilter === 'No due date') {
    return actions.filter((action) => !action.dueDate);
  }

  return actions.filter((action) => action.status === selectedFilter);
}

async function saveApplicationSettingsToSupabase(nextSettings) {
  if (!supabaseClient || !authState.user || !authState.user.id) {
    return {
      success: false,
      error: 'You must be signed in to save application settings.'
    };
  }

  const sanitizedSettings = sanitizeApplicationSettings(nextSettings);
  const row = {
    user_id: authState.user.id,
    settings: sanitizedSettings,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabaseClient
    .from('user_settings')
    .upsert(row, { onConflict: 'user_id' })
    .select(USER_SETTINGS_ROW_COLUMNS)
    .single();

  if (error || !data) {
    return {
      success: false,
      error: 'Unable to save cloud settings right now. Your previous setting is still active.'
    };
  }

  return {
    success: true,
    settings: mapUserSettingsRowToSettings(data)
  };
}

async function updateSingleApplicationSetting(settingKey, nextValue) {
  if (!SUPPORTED_APPLICATION_SETTING_KEYS.includes(settingKey)) {
    return {
      success: false,
      error: 'This setting is not supported.'
    };
  }

  const currentSettings = buildCurrentApplicationSettings();
  const candidateSettings = sanitizeApplicationSettings({
    ...currentSettings,
    [settingKey]: nextValue
  });

  if (candidateSettings[settingKey] === currentSettings[settingKey]) {
    return {
      success: true,
      settings: currentSettings
    };
  }

  state.settingsSaveInProgress = true;
  const saveResult = await saveApplicationSettingsToSupabase(candidateSettings);
  state.settingsSaveInProgress = false;

  if (!saveResult.success) {
    return saveResult;
  }

  applyApplicationSettings(saveResult.settings);
  return {
    success: true,
    settings: saveResult.settings
  };
}

async function updateActionOverride(actionId, update) {
  if (!actionId) {
    return;
  }

  if (!supabaseClient || !authState.user || !authState.user.id) {
    state.actionOverridesError = 'You must be signed in to save action updates.';
    renderViews();
    return;
  }

  const sourceAction = getActionById(actionId);
  if (!sourceAction || !sourceAction.sourceMeetingId) {
    state.actionOverridesError = 'The selected action could not be matched to a cloud meeting.';
    renderViews();
    return;
  }

  const currentOverride = state.actionOverrides[actionId] || { actionId, status: '', dueDate: '' };
  const nextOverride = {
    actionId,
    status: currentOverride.status || '',
    dueDate: currentOverride.dueDate || ''
  };

  if (Object.prototype.hasOwnProperty.call(update, 'status')) {
    nextOverride.status = ACTION_STATUSES.includes(update.status) ? update.status : '';
  }

  if (Object.prototype.hasOwnProperty.call(update, 'dueDate')) {
    nextOverride.dueDate = normalizeExtractedDate(update.dueDate || '');
  }

  state.actionOverridesError = '';

  if (isDefaultActionOverride(nextOverride.status, nextOverride.dueDate)) {
    const { error } = await supabaseClient
      .from('action_overrides')
      .delete()
      .eq('id', getActionOverrideDatabaseId(authState.user.id, actionId))
      .eq('user_id', authState.user.id);

    if (error) {
      state.actionOverridesError = 'Unable to save action updates to Supabase right now.';
      renderViews();
      return;
    }

    const nextOverrides = { ...state.actionOverrides };
    delete nextOverrides[actionId];
    state.actionOverrides = nextOverrides;
    renderViews();
    return;
  }

  const row = mapActionOverrideToDatabaseRow(nextOverride, authState.user.id, sourceAction.sourceMeetingId);
  if (!row) {
    state.actionOverridesError = 'The action update was invalid and could not be saved.';
    renderViews();
    return;
  }

  const { data, error } = await supabaseClient
    .from('action_overrides')
    .upsert(row, { onConflict: 'id' })
    .select(ACTION_OVERRIDE_ROW_COLUMNS)
    .single();

  if (error || !data) {
    state.actionOverridesError = 'Unable to save action updates to Supabase right now.';
    renderViews();
    return;
  }

  const savedOverride = mapActionOverrideRowToOverride(data);
  if (!savedOverride) {
    state.actionOverridesError = 'Supabase returned an invalid action update row.';
    renderViews();
    return;
  }

  const nextOverrides = { ...state.actionOverrides };
  nextOverrides[actionId] = savedOverride;
  state.actionOverrides = nextOverrides;
  renderViews();
}

function splitParticipantEntries(value) {
  if (Array.isArray(value)) {
    return value
      .filter((entry) => typeof entry === 'string')
      .flatMap((entry) => splitParticipantEntries(entry));
  }

  if (typeof value !== 'string') {
    return [];
  }

  return value
    .split(/[\n,;]+/)
    .map((entry) => normalizeCompanyName(entry))
    .filter(Boolean);
}

function looksLikePersonName(value) {
  const normalized = normalizeCompanyName(value);
  if (!normalized) {
    return false;
  }

  if (normalized.length < 2 || normalized.length > 80) {
    return false;
  }

  const words = normalized.split(' ').filter(Boolean);
  if (!words.length || words.length > 8) {
    return false;
  }

  return /[A-Za-z]/.test(normalized);
}

function looksLikeCompanyValue(value) {
  const normalized = normalizeCompanyName(value);
  if (!normalized) {
    return false;
  }

  const words = normalized.split(' ').filter(Boolean);
  if (!words.length || words.length > 6) {
    return false;
  }

  if (!/[A-Za-z]/.test(normalized)) {
    return false;
  }

  const companyHints = /(tasklet|solutions?|consult|partner|it|geo|group|aps|a\/s|ab|as|inc|llc|ltd|gmbh|corp|company)/i;
  if (companyHints.test(normalized)) {
    return true;
  }

  return words.length <= 3;
}

function parseParticipantEntry(rawEntry) {
  const originalEntry = normalizeCompanyName(rawEntry);
  if (!originalEntry) {
    return null;
  }

  const slashParts = originalEntry
    .split('/')
    .map((part) => normalizeCompanyName(part))
    .filter(Boolean);

  if (slashParts.length === 2) {
    const [nameCandidate, companyCandidate] = slashParts;
    if (looksLikePersonName(nameCandidate) && looksLikeCompanyValue(companyCandidate)) {
      return {
        name: nameCandidate,
        company: companyCandidate,
        originalEntry
      };
    }
  }

  return {
    name: originalEntry,
    company: '',
    originalEntry
  };
}

function extractParticipantRecordsFromMeeting(meeting) {
  if (!meeting || typeof meeting !== 'object') {
    return [];
  }

  const records = [];

  if (Array.isArray(meeting.participantIds)) {
    meeting.participantIds.forEach((participantId) => {
      const participant = getParticipantById(participantId);
      if (!participant || !participant.name) {
        return;
      }

      records.push({
        name: normalizeCompanyName(participant.name),
        company: normalizeCompanyName(participant.company),
        originalEntry: normalizeCompanyName(participant.name)
      });
    });
  }

  splitParticipantEntries(meeting.participants).forEach((entry) => {
    const parsedEntry = parseParticipantEntry(entry);
    if (parsedEntry && parsedEntry.name) {
      records.push(parsedEntry);
    }
  });

  const uniqueByName = new Map();
  records.forEach((record) => {
    const groupingKey = getNameGroupingKey(record.name);
    if (!groupingKey) {
      return;
    }

    const existingRecord = uniqueByName.get(groupingKey);
    if (!existingRecord) {
      uniqueByName.set(groupingKey, { ...record });
      return;
    }

    if (!existingRecord.company && record.company) {
      existingRecord.company = record.company;
    }
  });

  return Array.from(uniqueByName.values());
}

function getMeetingStructuredActions(meeting) {
  if (!meeting || typeof meeting !== 'object' || !Array.isArray(meeting.actionItems)) {
    return [];
  }

  return meeting.actionItems.filter((action) => action && typeof action === 'object');
}

function isActionLineAssignedToParticipant(actionLine, participantName) {
  if (typeof actionLine !== 'string' || typeof participantName !== 'string') {
    return false;
  }

  const normalizedLine = actionLine.trim();
  const normalizedName = normalizeCompanyName(participantName);
  if (!normalizedLine || !normalizedName) {
    return false;
  }

  const escapedName = normalizedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const ownerPattern = new RegExp(`^\\s*(?:[-*]\\s*)?${escapedName}\\s*[:\\-\\u2013\\u2014]\\s+`, 'i');
  return ownerPattern.test(normalizedLine);
}

function getParticipantOpenActionCountForMeeting(meeting, participantName) {
  if (!meeting || typeof meeting !== 'object') {
    return 0;
  }

  const normalizedParticipantName = getNameGroupingKey(participantName);
  if (!normalizedParticipantName) {
    return 0;
  }

  const structuredActions = getMeetingStructuredActions(meeting);
  if (structuredActions.length) {
    return structuredActions.filter((action) => {
      if (!action || action.status === 'Completed' || action.status === 'Cancelled') {
        return false;
      }

      return getNameGroupingKey(action.owner) === normalizedParticipantName;
    }).length;
  }

  if (!Array.isArray(meeting.actions)) {
    return 0;
  }

  return meeting.actions.filter((actionLine) => isActionLineAssignedToParticipant(actionLine, participantName)).length;
}

function getParticipantsFromMeetings() {
  const groupsByKey = new Map();

  getAllMeetings().forEach((meeting) => {
    const meetingParticipants = extractParticipantRecordsFromMeeting(meeting);

    meetingParticipants.forEach((participantRecord) => {
      const groupingKey = getNameGroupingKey(participantRecord.name);
      if (!groupingKey) {
        return;
      }

      if (!groupsByKey.has(groupingKey)) {
        groupsByKey.set(groupingKey, {
          key: groupingKey,
          name: participantRecord.name,
          companies: new Set(),
          originalEntries: new Set(),
          meetings: [],
          meetingIds: new Set(),
          openActions: 0
        });
      }

      const group = groupsByKey.get(groupingKey);
      if (participantRecord.company) {
        group.companies.add(participantRecord.company);
      }
      if (participantRecord.originalEntry) {
        group.originalEntries.add(participantRecord.originalEntry);
      }

      if (group.meetingIds.has(meeting.id)) {
        return;
      }

      group.meetingIds.add(meeting.id);
      group.meetings.push(meeting);
      group.openActions += getParticipantOpenActionCountForMeeting(meeting, participantRecord.name);
    });
  });

  return Array.from(groupsByKey.values())
    .map((group) => {
      const sortedMeetings = [...group.meetings].sort(compareMeetingsNewestFirst);
      const companies = Array.from(group.companies).sort((a, b) => a.localeCompare(b));
      const fallbackEntry = Array.from(group.originalEntries).find(Boolean) || group.name;

      return {
        key: group.key,
        name: group.name,
        companies,
        fallbackEntry,
        meetings: sortedMeetings,
        latestMeetingDate: sortedMeetings.length && sortedMeetings[0].date ? sortedMeetings[0].date : '',
        openActions: group.openActions
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function getParticipantGroupByKey(groupKey) {
  return getParticipantsFromMeetings().find((group) => group.key === groupKey) || null;
}

function buildEntityGroupsFromMeetings(entityType) {
  const groupsByKey = new Map();

  getAllMeetings().forEach((meeting) => {
    const entityName = entityType === 'customer' ? getMeetingCustomerName(meeting) : getMeetingPartnerName(meeting);
    if (!entityName) {
      return;
    }

    const groupingKey = getNameGroupingKey(entityName);
    if (!groupingKey) {
      return;
    }

    if (!groupsByKey.has(groupingKey)) {
      groupsByKey.set(groupingKey, {
        key: groupingKey,
        name: entityName,
        meetings: [],
        relatedNames: new Set(),
        openActions: 0
      });
    }

    const group = groupsByKey.get(groupingKey);
    group.meetings.push(meeting);
    group.openActions += getMeetingOpenActionCount(meeting);

    if (entityType === 'customer') {
      const partnerName = getMeetingPartnerName(meeting);
      if (partnerName) {
        group.relatedNames.add(partnerName);
      }
    } else {
      const customerName = getMeetingCustomerName(meeting);
      if (customerName) {
        group.relatedNames.add(customerName);
      }
    }
  });

  return Array.from(groupsByKey.values())
    .map((group) => {
      const sortedMeetings = [...group.meetings].sort(compareMeetingsNewestFirst);
      return {
        ...group,
        meetings: sortedMeetings,
        relatedNames: Array.from(group.relatedNames).sort((a, b) => a.localeCompare(b)),
        latestMeetingDate: sortedMeetings.length && sortedMeetings[0].date ? sortedMeetings[0].date : ''
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function getCustomersFromMeetings() {
  return buildEntityGroupsFromMeetings('customer');
}

function getPartnersFromMeetings() {
  return buildEntityGroupsFromMeetings('partner');
}

function getCustomerGroupByKey(groupKey) {
  return getCustomersFromMeetings().find((group) => group.key === groupKey) || null;
}

function getPartnerGroupByKey(groupKey) {
  return getPartnersFromMeetings().find((group) => group.key === groupKey) || null;
}

function renderEmptyState(title, message, actionLabel = '') {
  const actionButton = actionLabel
    ? `<button class="secondary-button js-go-import" type="button">${escapeHtml(actionLabel)}</button>`
    : '';

  return `
    <div class="empty-state">
      <h4>${escapeHtml(title)}</h4>
      <p>${escapeHtml(message)}</p>
      ${actionButton}
    </div>
  `;
}

function getActionStatusClass(action) {
  if (isActionOverdue(action)) {
    return 'status-pill status-pill--overdue';
  }

  const map = {
    Open: 'status-pill status-pill--open',
    'In Progress': 'status-pill status-pill--in-progress',
    'Waiting for Customer': 'status-pill status-pill--waiting-customer',
    'Waiting Internally': 'status-pill status-pill--waiting-internal',
    Completed: 'status-pill status-pill--completed',
    Cancelled: 'status-pill status-pill--cancelled'
  };

  return map[action.status] || 'status-pill';
}

function getActionStatusLabel(action) {
  return isActionOverdue(action) ? 'Overdue' : (action.status || 'Open');
}

function renderDashboard(meetings) {
  const totalMeetings = getAllMeetings().length;
  const totalCustomers = getCustomersFromMeetings().length;
  const totalPartners = getPartnersFromMeetings().length;
  const combinedActions = sortCombinedActions(getCombinedActions());
  const openActions = combinedActions.filter((action) => !isActionClosed(action)).length;
  const recentMeetings = meetings.slice(0, 3);
  const followUps = combinedActions.filter((action) => !isActionClosed(action)).slice(0, 3);
  const hasRealData = totalMeetings > 0 || combinedActions.length > 0;
  const emptyState = hasRealData
    ? ''
    : renderEmptyState('No meeting data yet', 'Import a transcript to start building your meeting knowledge base.', 'Go to Import Transcript');

  return `
    <section class="hero-panel dashboard-banner">
      <div>
        <p class="eyebrow">Dashboard</p>
        <h3>Meeting Knowledge Base</h3>
        <p>Keep track of customer conversations, decisions, and follow-ups.</p>
      </div>
      <p class="dashboard-banner-summary">${openActions} open actions across ${totalMeetings} meetings</p>
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
          ${recentMeetings.length ? recentMeetings.map((meeting) => renderMeetingCard(meeting)).join('') : renderEmptyState('No meetings found', 'Try a different search or import a new transcript.', 'Go to Import Transcript')}
        </div>
      </div>

      <div class="panel-card">
        <div class="section-heading">
          <h3>Open Follow-ups</h3>
        </div>
        <div class="action-list">
          ${followUps.length ? followUps.map((action) => renderActionCard(action, { editable: false })).join('') : renderEmptyState('No open follow-ups', 'Action items from meetings will appear here once available.')}
        </div>
      </div>
    </section>

    ${emptyState}
  `;
}

function renderMeetingsPage() {
  const meetings = getVisibleMeetings();
  const deletionWarning = state.meetingDeletionWarning
    ? `<p class="import-error" role="status">${escapeHtml(state.meetingDeletionWarning)}</p>`
    : '';
  const list = meetings.length
    ? meetings.map((meeting) => renderMeetingListItem(meeting)).join('')
    : renderEmptyState('No meetings found', 'Adjust your search terms or import a transcript.', 'Go to Import Transcript');

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
      ${deletionWarning}
      <div class="meeting-list">${list}</div>
    </section>
  `;
}

function renderMeetingListItem(meeting, options = {}) {
  const customer = getMeetingDisplayCustomer(meeting);
  const partner = getMeetingDisplayPartner(meeting);
  const participantNames = getMeetingDisplayParticipants(meeting);
  const openActions = getMeetingOpenActionCount(meeting);
  const returnAttributes = options.returnSection && options.returnKey
    ? ` data-return-section="${escapeHtml(options.returnSection)}" data-return-key="${escapeHtml(options.returnKey)}"`
    : '';

  return `
    <button class="meeting-card meeting-card--selectable js-open-meeting" type="button" data-meeting-id="${meeting.id}"${returnAttributes}>
      <div class="meeting-card-header">
        <div>
          <p class="meeting-meta">${formatDate(meeting.date)} · ${getMeetingDurationLabel(meeting)}</p>
          <h4>${escapeHtml(meeting.title || 'Untitled meeting')}</h4>
        </div>
        <span class="meeting-status ${meeting.meetingType === 'Demo' ? '' : 'completed'}">${escapeHtml(meeting.meetingType || 'Imported')}</span>
      </div>
      <div class="meeting-table-details">
        <div><strong>Customer</strong><span>${escapeHtml(customer)}</span></div>
        <div><strong>Partner</strong><span>${escapeHtml(partner)}</span></div>
        <div><strong>Participants</strong><span>${escapeHtml(participantNames)}</span></div>
        <div><strong>Open actions</strong><span>${openActions}</span></div>
      </div>
    </button>
  `;
}

function renderMeetingDetailViewer(meeting) {
  const attendeeNames = getMeetingDisplayParticipants(meeting);
  const customer = getMeetingDisplayCustomer(meeting);
  const partner = getMeetingDisplayPartner(meeting);
  const openActions = getMeetingOpenActionCount(meeting);
  const canEdit = isSavedMeetingEditable(meeting.id);
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
          <h3>${escapeHtml(meeting.title || 'Untitled meeting')}</h3>
          <p>${escapeHtml(subjectText)}</p>
        </div>
        <div class="sort-controls">
          ${canEdit ? '<button class="secondary-button js-edit-meeting" type="button">Edit Meeting</button>' : ''}
          ${canEdit ? '<button class="secondary-button js-delete-meeting" type="button">Delete Meeting</button>' : ''}
          <button class="secondary-button js-back-to-meetings" type="button">← Return to meetings</button>
        </div>
      </div>

      <div class="viewer-meta-grid">
        <div>
          <strong>Date</strong>
          <span>${escapeHtml(dateLabel)}</span>
        </div>
        <div>
          <strong>Customer</strong>
          <span>${escapeHtml(customer)}</span>
        </div>
        <div>
          <strong>Partner</strong>
          <span>${escapeHtml(partner)}</span>
        </div>
        <div>
          <strong>Participants</strong>
          <span>${escapeHtml(attendeeNames)}</span>
        </div>
        <div>
          <strong>Duration</strong>
          <span>${escapeHtml(durationLabel)}</span>
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

function renderMeetingEditForm(meeting) {
  const draft = state.meetingEditDraft || createMeetingEditDraft(meeting);
  const errorMessage = state.meetingEditError
    ? `<p class="import-error" role="alert">${escapeHtml(state.meetingEditError)}</p>`
    : '';

  return `
    <section class="panel-card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Edit meeting</p>
          <h3>${escapeHtml(meeting.title || 'Meeting')}</h3>
        </div>
      </div>
      ${errorMessage}
      <div class="import-review-grid">
        <label class="import-field-group">
          <span>Meeting title</span>
          <input class="import-field js-meeting-edit-field" type="text" data-edit-field="title" value="${escapeHtml(draft.title)}" required>
        </label>
        <label class="import-field-group">
          <span>Date</span>
          <input class="import-field js-meeting-edit-field" type="date" data-edit-field="date" value="${escapeHtml(draft.date)}" required>
        </label>
        <label class="import-field-group">
          <span>Start time</span>
          <input class="import-field js-meeting-edit-field" type="text" data-edit-field="startTime" value="${escapeHtml(draft.startTime)}">
        </label>
        <label class="import-field-group">
          <span>Duration</span>
          <input class="import-field js-meeting-edit-field" type="text" data-edit-field="duration" value="${escapeHtml(draft.duration)}">
        </label>
        <label class="import-field-group">
          <span>Customer</span>
          <input class="import-field js-meeting-edit-field" type="text" data-edit-field="customer" value="${escapeHtml(draft.customer)}">
        </label>
        <label class="import-field-group">
          <span>Partner</span>
          <input class="import-field js-meeting-edit-field" type="text" data-edit-field="partner" value="${escapeHtml(draft.partner)}">
        </label>
        <label class="import-field-group import-field-group--full">
          <span>Participants (comma or semicolon separated)</span>
          <input class="import-field js-meeting-edit-field" type="text" data-edit-field="participants" value="${escapeHtml(draft.participants)}">
        </label>
        <label class="import-field-group import-field-group--full">
          <span>Subject</span>
          <textarea class="import-field import-field--textarea js-meeting-edit-field" data-edit-field="subject">${escapeHtml(draft.subject)}</textarea>
        </label>
        <label class="import-field-group import-field-group--full">
          <span>Summary</span>
          <textarea class="import-field import-field--textarea js-meeting-edit-field" data-edit-field="summary">${escapeHtml(draft.summary)}</textarea>
        </label>
        <label class="import-field-group import-field-group--full">
          <span>Decisions</span>
          <textarea class="import-field import-field--textarea js-meeting-edit-field" data-edit-field="decisions">${escapeHtml(draft.decisions)}</textarea>
        </label>
        <label class="import-field-group import-field-group--full">
          <span>Actions text</span>
          <textarea class="import-field import-field--textarea js-meeting-edit-field" data-edit-field="actions">${escapeHtml(draft.actions)}</textarea>
        </label>
        <label class="import-field-group import-field-group--full">
          <span>Open questions</span>
          <textarea class="import-field import-field--textarea js-meeting-edit-field" data-edit-field="openQuestions">${escapeHtml(draft.openQuestions)}</textarea>
        </label>
        <label class="import-field-group import-field-group--full">
          <span>Commercial notes</span>
          <textarea class="import-field import-field--textarea js-meeting-edit-field" data-edit-field="commercialNotes">${escapeHtml(draft.commercialNotes)}</textarea>
        </label>
      </div>
      <div class="import-actions">
        <button class="primary-button js-save-meeting-edit" type="button">Save Changes</button>
        <button class="secondary-button js-cancel-meeting-edit" type="button">Cancel</button>
      </div>
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
      const hasStoredDocument = Boolean(String(meeting.storagePath || '').trim());
      const isDownloading = state.meetingDocumentDownloadInProgressId === meeting.id;
      const content = document.createElement('div');
      appendDetailLine(content, 'Subject', meeting.subject || 'No subject captured yet.');
      appendDetailLine(content, 'Customer', customer);
      appendDetailLine(content, 'Partner', partner);
      appendDetailLine(content, 'Participants', getMeetingDisplayParticipants(meeting));
      appendDetailLine(content, 'Date', meeting.date ? formatDate(meeting.date) : 'Date not available');
      appendDetailLine(content, 'Original file', fileName);
      appendDetailLine(content, 'Tags', tags);

      const sourceDocumentPanel = document.createElement('div');
      sourceDocumentPanel.className = 'import-preview-panel';
      const sourceHeading = document.createElement('h5');
      sourceHeading.textContent = 'Source document';
      sourceDocumentPanel.appendChild(sourceHeading);

      if (!hasStoredDocument) {
        const unavailableText = document.createElement('p');
        unavailableText.className = 'entity-meta';
        unavailableText.textContent = 'No original document is stored for this meeting.';
        sourceDocumentPanel.appendChild(unavailableText);
      } else {
        const nameLine = document.createElement('p');
        nameLine.className = 'entity-meta';
        nameLine.textContent = `File name: ${meeting.originalFileName || 'transcript.docx'}`;
        sourceDocumentPanel.appendChild(nameLine);

        const sizeLine = document.createElement('p');
        sizeLine.className = 'entity-meta';
        sizeLine.textContent = `File size: ${Number.isFinite(Number(meeting.originalFileSize)) ? formatFileSize(Number(meeting.originalFileSize)) : 'Unknown'}`;
        sourceDocumentPanel.appendChild(sizeLine);

        const typeLine = document.createElement('p');
        typeLine.className = 'entity-meta';
        typeLine.textContent = `File type: ${meeting.originalFileMimeType || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}`;
        sourceDocumentPanel.appendChild(typeLine);

        const downloadButton = document.createElement('button');
        downloadButton.type = 'button';
        downloadButton.className = 'secondary-button js-download-original-docx';
        downloadButton.dataset.meetingId = meeting.id;
        downloadButton.disabled = isDownloading;
        downloadButton.textContent = isDownloading ? 'Downloading...' : 'Download Original DOCX';
        sourceDocumentPanel.appendChild(downloadButton);

        if (state.meetingDocumentDownloadError) {
          const errorLine = document.createElement('p');
          errorLine.className = 'import-error';
          errorLine.setAttribute('role', 'alert');
          errorLine.textContent = state.meetingDocumentDownloadError;
          sourceDocumentPanel.appendChild(errorLine);
        }
      }

      content.appendChild(sourceDocumentPanel);
      block.appendChild(content);
      break;
    }
  }

  contentContainer.appendChild(block);
}

function renderCustomers() {
  const customerGroups = getCustomersFromMeetings();

  if (state.selectedCustomerKey) {
    const selectedCustomer = getCustomerGroupByKey(state.selectedCustomerKey);
    if (!selectedCustomer) {
      state.selectedCustomerKey = null;
      return renderCustomers();
    }

    const partnersLabel = selectedCustomer.relatedNames.length ? selectedCustomer.relatedNames.join(', ') : 'No partners captured';
    const latestMeetingDate = selectedCustomer.latestMeetingDate ? formatDate(selectedCustomer.latestMeetingDate) : 'Date not available';
    const historyList = selectedCustomer.meetings.length
      ? selectedCustomer.meetings.map((meeting) => renderMeetingListItem(meeting, {
        returnSection: 'customers',
        returnKey: selectedCustomer.key
      })).join('')
      : renderEmptyState('No meetings for this customer', 'This customer appears in saved records but has no visible meeting history yet.');

    return `
      <section class="panel-card">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Customer detail</p>
            <h3>${escapeHtml(selectedCustomer.name)}</h3>
          </div>
          <button class="secondary-button js-back-to-customers" type="button">← Return to customers</button>
        </div>
        <div class="viewer-meta-grid">
          <div>
            <strong>Total meetings</strong>
            <span>${selectedCustomer.meetings.length}</span>
          </div>
          <div>
            <strong>Latest meeting date</strong>
            <span>${latestMeetingDate}</span>
          </div>
          <div>
            <strong>Partners involved</strong>
            <span>${escapeHtml(partnersLabel)}</span>
          </div>
          <div>
            <strong>Open actions</strong>
            <span>${selectedCustomer.openActions}</span>
          </div>
        </div>
      </section>

      <section class="panel-card">
        <div class="section-heading">
          <h3>Meeting History</h3>
        </div>
        <div class="meeting-list">${historyList}</div>
      </section>
    `;
  }

  const list = customerGroups.length
    ? customerGroups.map((customer) => {
      const meetingCount = customer.meetings.length;
      const partnersLabel = customer.relatedNames.length ? customer.relatedNames.join(', ') : 'No partners captured';
      const latestMeetingDate = customer.latestMeetingDate ? formatDate(customer.latestMeetingDate) : 'Date not available';

      return `
        <button class="entity-card meeting-card--selectable js-open-customer-detail" type="button" data-customer-key="${escapeHtml(customer.key)}">
          <h4>${escapeHtml(customer.name)}</h4>
          <p>Latest meeting: ${escapeHtml(latestMeetingDate)}</p>
          <div class="entity-meta">
            <span class="badge">${meetingCount} meetings</span>
            <span>Partners: ${escapeHtml(partnersLabel)}</span>
          </div>
          <div class="entity-meta">
            <span>Open actions: ${customer.openActions}</span>
          </div>
        </button>
      `;
    }).join('')
    : renderEmptyState('No customers found', 'Customer records are derived from saved meetings.', 'Go to Import Transcript');

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
  const partnerGroups = getPartnersFromMeetings();

  if (state.selectedPartnerKey) {
    const selectedPartner = getPartnerGroupByKey(state.selectedPartnerKey);
    if (!selectedPartner) {
      state.selectedPartnerKey = null;
      return renderPartners();
    }

    const customersLabel = selectedPartner.relatedNames.length ? selectedPartner.relatedNames.join(', ') : 'No customers captured';
    const latestMeetingDate = selectedPartner.latestMeetingDate ? formatDate(selectedPartner.latestMeetingDate) : 'Date not available';
    const historyList = selectedPartner.meetings.length
      ? selectedPartner.meetings.map((meeting) => renderMeetingListItem(meeting, {
        returnSection: 'partners',
        returnKey: selectedPartner.key
      })).join('')
      : renderEmptyState('No meetings for this partner', 'This partner has no visible meeting history yet.');

    return `
      <section class="panel-card">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Partner detail</p>
            <h3>${escapeHtml(selectedPartner.name)}</h3>
          </div>
          <button class="secondary-button js-back-to-partners" type="button">← Return to partners</button>
        </div>
        <div class="viewer-meta-grid">
          <div>
            <strong>Total meetings</strong>
            <span>${selectedPartner.meetings.length}</span>
          </div>
          <div>
            <strong>Latest meeting date</strong>
            <span>${latestMeetingDate}</span>
          </div>
          <div>
            <strong>Associated customers</strong>
            <span>${escapeHtml(customersLabel)}</span>
          </div>
          <div>
            <strong>Open actions</strong>
            <span>${selectedPartner.openActions}</span>
          </div>
        </div>
      </section>

      <section class="panel-card">
        <div class="section-heading">
          <h3>Meeting History</h3>
        </div>
        <div class="meeting-list">${historyList}</div>
      </section>
    `;
  }

  const list = partnerGroups.length
    ? partnerGroups.map((partner) => {
      const latestMeetingDate = partner.latestMeetingDate ? formatDate(partner.latestMeetingDate) : 'Date not available';
      const customersLabel = partner.relatedNames.length ? partner.relatedNames.join(', ') : 'No customers captured';

      return `
        <button class="entity-card meeting-card--selectable js-open-partner-detail" type="button" data-partner-key="${escapeHtml(partner.key)}">
          <h4>${escapeHtml(partner.name)}</h4>
          <p>Latest meeting: ${escapeHtml(latestMeetingDate)}</p>
          <div class="entity-meta">
            <span class="badge">${partner.meetings.length} meetings</span>
            <span>Customers: ${escapeHtml(customersLabel)}</span>
          </div>
          <div class="entity-meta">
            <span>Open actions: ${partner.openActions}</span>
          </div>
        </button>
      `;
    }).join('')
    : renderEmptyState('No partners found', 'Partner records are derived from saved meetings.', 'Go to Import Transcript');

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
  const participantGroups = getParticipantsFromMeetings();

  if (state.selectedParticipantKey) {
    const selectedParticipant = getParticipantGroupByKey(state.selectedParticipantKey);
    if (!selectedParticipant) {
      state.selectedParticipantKey = null;
      return renderParticipants();
    }

    const companyLabel = selectedParticipant.companies.length
      ? selectedParticipant.companies.join(', ')
      : `Not confirmed (source: ${selectedParticipant.fallbackEntry})`;
    const latestMeetingDate = selectedParticipant.latestMeetingDate ? formatDate(selectedParticipant.latestMeetingDate) : 'Date not available';
    const historyList = selectedParticipant.meetings.length
      ? selectedParticipant.meetings.map((meeting) => renderMeetingListItem(meeting, {
        returnSection: 'participants',
        returnKey: selectedParticipant.key
      })).join('')
      : renderEmptyState('No meetings for this participant', 'This participant currently has no visible meeting history.');

    return `
      <section class="panel-card">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Participant detail</p>
            <h3>${escapeHtml(selectedParticipant.name)}</h3>
          </div>
          <button class="secondary-button js-back-to-participants" type="button">← Return to participants</button>
        </div>
        <div class="viewer-meta-grid">
          <div>
            <strong>Company / companies</strong>
            <span>${escapeHtml(companyLabel)}</span>
          </div>
          <div>
            <strong>Total meetings attended</strong>
            <span>${selectedParticipant.meetings.length}</span>
          </div>
          <div>
            <strong>Latest meeting date</strong>
            <span>${latestMeetingDate}</span>
          </div>
          <div>
            <strong>Open actions assigned</strong>
            <span>${selectedParticipant.openActions}</span>
          </div>
        </div>
      </section>

      <section class="panel-card">
        <div class="section-heading">
          <h3>Meeting History</h3>
        </div>
        <div class="meeting-list">${historyList}</div>
      </section>
    `;
  }

  const list = participantGroups.length
    ? participantGroups.map((participant) => {
      const companyLabel = participant.companies.length ? participant.companies.join(', ') : 'Company not confirmed';
      const latestMeetingDate = participant.latestMeetingDate ? formatDate(participant.latestMeetingDate) : 'Date not available';

      return `
        <button class="entity-card meeting-card--selectable js-open-participant-detail" type="button" data-participant-key="${escapeHtml(participant.key)}">
          <h4>${escapeHtml(participant.name)}</h4>
          <p>${escapeHtml(companyLabel)}</p>
          <div class="entity-meta">
            <span class="badge">${participant.meetings.length} meetings</span>
            <span>Latest: ${escapeHtml(latestMeetingDate)}</span>
          </div>
          <div class="entity-meta">
            <span>Open actions: ${participant.openActions}</span>
          </div>
        </button>
      `;
    }).join('')
    : renderEmptyState('No participants found', 'Participants are extracted from saved meetings.', 'Go to Import Transcript');

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
  const combinedActions = sortCombinedActions(getCombinedActions());
  const selectedFilter = ACTION_FILTERS.includes(state.actionFilter) ? state.actionFilter : 'All';
  const visibleActions = filterCombinedActions(combinedActions, selectedFilter);
  const errorMessage = state.actionOverridesError
    ? `<p class="import-error" role="alert">${escapeHtml(state.actionOverridesError)}</p>`
    : '';
  const list = visibleActions.length
    ? visibleActions.map((action) => renderActionCard(action, { editable: true, returnSection: 'actions' })).join('')
    : renderEmptyState('No actions match this filter', 'Try a different status filter or import another meeting.', 'Go to Import Transcript');

  const filterOptions = ACTION_FILTERS.map((filter) => `
    <option value="${escapeHtml(filter)}" ${filter === selectedFilter ? 'selected' : ''}>${escapeHtml(filter)}</option>
  `).join('');

  return `
    <section class="panel-card">
      <div class="section-heading">
        <div>
          <h3>Actions</h3>
          <p class="entity-meta">${visibleActions.length} of ${combinedActions.length} actions shown</p>
        </div>
        <div class="sort-controls">
          <label class="sort-label" for="actions-filter">Filter</label>
          <select id="actions-filter" class="sort-select js-actions-filter">${filterOptions}</select>
        </div>
      </div>
        ${errorMessage}
      <div class="action-list">${list}</div>
    </section>
  `;
}

function formatDateTime(value) {
  if (!value) {
    return 'Not exported in this session';
  }

  const parsedDate = new Date(value);
  if (!Number.isFinite(parsedDate.getTime())) {
    return 'Not exported in this session';
  }

  return parsedDate.toLocaleString('en');
}

function getBackupSizeLabel() {
  const payload = buildBackupPayload();
  const serialized = JSON.stringify(payload);
  return formatFileSize(estimateStringBytes(serialized));
}

function buildBackupFileName() {
  const dateStamp = new Date().toISOString().slice(0, 10);
  return `tasklet-transcript-backup-${dateStamp}.json`;
}

function clearDataManagementMessages() {
  state.dataManagementError = '';
  state.dataManagementSuccess = '';
}

function triggerBackupDownload(payload) {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return false;
  }

  try {
    const backupJson = JSON.stringify(payload, null, 2);
    const blob = new Blob([backupJson], { type: 'application/json' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.download = buildBackupFileName();
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(downloadUrl);
    return true;
  } catch (error) {
    return false;
  }
}

function triggerBlobDownload(blob, downloadName) {
  if (typeof document === 'undefined' || typeof window === 'undefined' || !(blob instanceof Blob)) {
    return false;
  }

  try {
    const downloadUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.download = downloadName || 'download.bin';
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(downloadUrl);
    return true;
  } catch (error) {
    return false;
  }
}

async function uploadOriginalTranscriptToSupabase(file, meetingId) {
  if (!supabaseClient || !authState.user || !authState.user.id) {
    return {
      success: false,
      error: 'You must be signed in to upload the original document.'
    };
  }

  const validation = getValidatedImportDocxFile(file);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error
    };
  }

  const storagePath = buildTranscriptStoragePath(authState.user.id, meetingId, file.name);
  try {
    const { error } = await supabaseClient
      .storage
      .from(TRANSCRIPT_STORAGE_BUCKET)
      .upload(storagePath, file, {
        upsert: false,
        contentType: String(file.type || '').trim() || DOCX_MIME_TYPES[0]
      });

    if (error) {
      return {
        success: false,
        error: 'Unable to upload the original DOCX to Supabase Storage. Meeting was not saved.'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'Unable to upload the original DOCX to Supabase Storage. Meeting was not saved.'
    };
  }

  return {
    success: true,
    storageBucket: TRANSCRIPT_STORAGE_BUCKET,
    storagePath,
    originalFileName: String(file.name || '').trim(),
    originalFileSize: Number.isFinite(Number(file.size)) ? Math.trunc(Number(file.size)) : null,
    originalFileMimeType: String(file.type || '').trim() || DOCX_MIME_TYPES[0]
  };
}

async function deleteStoredTranscriptFile(storageBucket, storagePath) {
  const bucketName = String(storageBucket || '').trim();
  const objectPath = String(storagePath || '').trim();

  if (!supabaseClient || !bucketName || !objectPath) {
    return { success: true };
  }

  try {
    const { error } = await supabaseClient
      .storage
      .from(bucketName)
      .remove([objectPath]);

    if (error) {
      return {
        success: false,
        error: 'Storage cleanup failed.'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'Storage cleanup failed.'
    };
  }

  return { success: true };
}

async function downloadOriginalMeetingDocument(meetingId) {
  const meeting = getMeetingById(meetingId);
  if (!meeting) {
    return;
  }

  if (!supabaseClient || !authState.user || !authState.user.id) {
    state.meetingDocumentDownloadError = 'You must be signed in to download the original document.';
    renderViews();
    return;
  }

  const bucketName = String(meeting.storageBucket || '').trim();
  const objectPath = String(meeting.storagePath || '').trim();
  if (!bucketName || !objectPath) {
    state.meetingDocumentDownloadError = 'No original document is stored for this meeting.';
    renderViews();
    return;
  }

  state.meetingDocumentDownloadInProgressId = meetingId;
  state.meetingDocumentDownloadError = '';
  renderViews();

  try {
    const { data, error } = await supabaseClient
      .storage
      .from(bucketName)
      .download(objectPath);

    if (error || !data) {
      state.meetingDocumentDownloadInProgressId = '';
      state.meetingDocumentDownloadError = 'Unable to download the original DOCX right now.';
      renderViews();
      return;
    }

    const fileName = sanitizeDocxStorageFileName(meeting.originalFileName || 'transcript.docx');
    const downloaded = triggerBlobDownload(data, fileName);
    state.meetingDocumentDownloadInProgressId = '';
    state.meetingDocumentDownloadError = downloaded ? '' : 'The DOCX was downloaded from Supabase but could not be saved in the browser.';
    renderViews();
  } catch (error) {
    state.meetingDocumentDownloadInProgressId = '';
    state.meetingDocumentDownloadError = 'Unable to download the original DOCX right now.';
    renderViews();
  }
}

function handleExportBackup() {
  clearDataManagementMessages();
  const payload = buildBackupPayload();
  const exported = triggerBackupDownload(payload);

  if (!exported) {
    state.dataManagementError = 'Export failed. Please try again.';
    renderViews();
    return;
  }

  state.dataManagementLastExportAt = payload.exportedAt;
  state.dataManagementSuccess = `Backup exported as ${buildBackupFileName()}.`;
  renderViews();
}

function resetStateAfterDataReplacement() {
  state.migrationArchiveAvailable = false;
  state.overrideMigrationArchiveAvailable = false;
  state.settingsMigrationArchiveAvailable = false;
  state.selectedMeetingId = null;
  state.meetingEditMode = false;
  state.meetingEditDraft = null;
  state.meetingEditError = '';
  state.selectedCustomerKey = null;
  state.selectedPartnerKey = null;
  state.selectedParticipantKey = null;
  state.meetingReturnContext = null;
  state.searchHighlightedActionId = '';
  state.searchResultsOpen = normalizeSearchQuery(state.searchQuery).length >= SEARCH_MIN_CHARS;
  state.searchActiveIndex = -1;
  state.activeViewerTab = 'overview';
}

async function handleRestoreBackup() {
  clearDataManagementMessages();

  const selectedFile = state.dataManagementSelectedBackupFile;
  if (!selectedFile) {
    state.dataManagementError = 'Select a backup JSON file before restoring.';
    renderViews();
    return;
  }

  let parsedPayload;
  try {
    const rawText = await selectedFile.text();
    parsedPayload = JSON.parse(rawText);
  } catch (error) {
    state.dataManagementError = 'The selected file is not valid JSON or is damaged.';
    renderViews();
    return;
  }

  const validation = validateBackupPayload(parsedPayload);
  if (!validation.valid) {
    state.dataManagementError = validation.error;
    renderViews();
    return;
  }

  const confirmed = window.confirm(
    'Restore this backup?\\n\\n'
      + 'This will replace local migration staging data in this browser (meetings, action overrides, and settings).\\n'
      + 'Export a backup first if you need to keep the current state.'
  );

  if (!confirmed) {
    state.dataManagementSuccess = 'Restore canceled. Existing data was not changed.';
    renderViews();
    return;
  }

  const replacementResult = applyLocalDataReplacement(validation.data);
  if (!replacementResult.success) {
    state.dataManagementError = replacementResult.error;
    renderViews();
    return;
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
  }

  resetStateAfterDataReplacement();
  state.dataManagementSelectedBackupFile = null;
  state.dataManagementSelectedBackupName = '';
  state.dataManagementSuccess = 'Backup restored to local migration staging.';
  renderViews();
}

function handleClearAllLocalData() {
  clearDataManagementMessages();

  if (!isCurrentUserAdmin()) {
    state.dataManagementError = 'Only administrators can clear all local data.';
    renderViews();
    return;
  }

  const warningConfirmed = window.confirm(
    'Clear all local data?\\n\\n'
      + 'This removes only local migration staging data in this browser (meetings, action overrides, and settings).\\n'
      + 'Cloud meetings, cloud action updates, and cloud settings in Supabase are not deleted.'
  );

  if (!warningConfirmed) {
    state.dataManagementSuccess = 'Clear data canceled. Existing data was not changed.';
    renderViews();
    return;
  }

  const strongConfirmation = window.prompt('Type CLEAR to permanently remove local browser data.');
  if (strongConfirmation !== 'CLEAR') {
    state.dataManagementError = 'Clear data canceled. Confirmation text did not match.';
    renderViews();
    return;
  }

  const replacementResult = applyLocalDataReplacement({
    meetings: [],
    actionOverrides: [],
    settings: {}
  });

  if (!replacementResult.success) {
    state.dataManagementError = replacementResult.error;
    renderViews();
    return;
  }

  resetStateAfterDataReplacement();
  state.dataManagementSelectedBackupFile = null;
  state.dataManagementSelectedBackupName = '';
  state.dataManagementSuccess = 'All local migration staging data has been cleared from this browser.';
  renderViews();
}

function renderDataManagement() {
  const meetingCount = state.savedMeetings.length;
  const actionOverrideCount = Object.keys(state.actionOverrides || {}).length;
  const cloudSettings = buildCurrentApplicationSettings();
  const backupSizeLabel = getBackupSizeLabel();
  const latestExportLabel = formatDateTime(state.dataManagementLastExportAt);
  const isAdmin = isCurrentUserAdmin();
  const localStagedMeetings = getLocalStagedMeetings();
  const localStagedCount = localStagedMeetings.length;
  const localStagedActionOverrides = Object.values(getLocalStagedActionOverrides() || {});
  const localStagedActionOverrideCount = localStagedActionOverrides.length;
  const localStagedSettingsRecord = getLocalStagedSettingsRecord();
  const localStagedSettingsCount = localStagedSettingsRecord.exists ? 1 : 0;
  const detectedSettingLabels = getDetectedSupportedSettingLabels(localStagedSettingsRecord.raw);
  const errorMessage = state.dataManagementError
    ? `<p class="import-error" role="alert">${escapeHtml(state.dataManagementError)}</p>`
    : '';
  const successMessage = state.dataManagementSuccess
    ? `<p class="import-success" role="status">${escapeHtml(state.dataManagementSuccess)}</p>`
    : '';
  const selectedBackup = state.dataManagementSelectedBackupName
    ? `<p class="entity-meta">Selected file: ${escapeHtml(state.dataManagementSelectedBackupName)}</p>`
    : '<p class="entity-meta">No backup file selected.</p>';
  const roleMessage = isAdmin
    ? 'Administrators can export, restore, and clear local migration staging data.'
    : 'You can export and restore local migration staging data. Clearing all local staging data is restricted to administrators.';
  const cloudMessage = state.cloudMeetingsError
    ? `
      <div class="import-preview-panel">
        <div class="section-heading">
          <h4>Cloud meetings unavailable</h4>
        </div>
        <p class="entity-meta">${escapeHtml(state.cloudMeetingsError)}</p>
        <button class="secondary-button js-retry-cloud-meetings" type="button">Retry loading cloud data</button>
      </div>
    `
    : '';
  const cloudActionOverridesMessage = state.actionOverridesError
    ? `
      <div class="import-preview-panel">
        <div class="section-heading">
          <h4>Cloud action updates unavailable</h4>
        </div>
        <p class="entity-meta">${escapeHtml(state.actionOverridesError)}</p>
        <button class="secondary-button js-retry-cloud-meetings" type="button">Retry loading cloud data</button>
      </div>
    `
    : '';
  const cloudSettingsMessage = state.cloudSettingsError
    ? `
      <div class="import-preview-panel">
        <div class="section-heading">
          <h4>Cloud settings unavailable</h4>
        </div>
        <p class="entity-meta">${escapeHtml(state.cloudSettingsError)}</p>
        <button class="secondary-button js-retry-cloud-meetings" type="button">Retry loading cloud data</button>
      </div>
    `
    : '';
  const migrationNotice = state.cloudMeetingsLoaded && localStagedCount
    ? `
      <div class="import-preview-panel">
        <div class="section-heading">
          <h4>Local migration staging</h4>
        </div>
        <p class="entity-meta">Local meetings were found in this browser.</p>
        <p class="entity-meta">${localStagedCount} local meetings are available for migration. Existing cloud meetings will be preserved and duplicates will be skipped by meeting id.</p>
        <div class="data-management-actions">
          <button class="primary-button js-import-local-meetings" type="button" ${state.migrationInProgress ? 'disabled' : ''}>${state.migrationInProgress ? 'Importing...' : 'Import Local Meetings to Supabase'}</button>
          ${state.migrationArchiveAvailable ? '<button class="secondary-button js-archive-local-meetings" type="button">Archive Local Meeting Copy</button>' : ''}
        </div>
      </div>
    `
    : '';
  const actionOverrideMigrationNotice = authState.actionOverridesLoaded && localStagedActionOverrideCount
    ? `
      <div class="import-preview-panel">
        <div class="section-heading">
          <h4>Local action update staging</h4>
        </div>
        <p class="entity-meta">Local action updates were found in this browser.</p>
        <p class="entity-meta">${localStagedActionOverrideCount} local action updates are available for migration. Existing cloud rows will be preserved, matching action ids will be updated, and invalid or orphaned overrides will be skipped.</p>
        <div class="data-management-actions">
          <button class="primary-button js-import-local-action-overrides" type="button" ${state.overrideMigrationInProgress ? 'disabled' : ''}>${state.overrideMigrationInProgress ? 'Importing...' : 'Import Local Action Updates to Supabase'}</button>
          ${state.overrideMigrationArchiveAvailable ? '<button class="secondary-button js-archive-local-action-overrides" type="button">Archive Local Action Update Copy</button>' : ''}
        </div>
      </div>
    `
    : '';
  const settingsMigrationNotice = authState.settingsLoaded && localStagedSettingsRecord.exists
    ? `
      <div class="import-preview-panel">
        <div class="section-heading">
          <h4>Local settings staging</h4>
        </div>
        <p class="entity-meta">Local application settings were found in this browser.</p>
        <p class="entity-meta">Detected supported settings: ${escapeHtml(detectedSettingLabels.length ? detectedSettingLabels.join(', ') : 'None')}</p>
        ${localStagedSettingsRecord.parseError ? '<p class="entity-meta">The local staged settings were malformed. Unsupported fields will be ignored and defaults will be applied during migration.</p>' : ''}
        <div class="data-management-actions">
          <button class="primary-button js-import-local-settings" type="button" ${state.settingsMigrationInProgress ? 'disabled' : ''}>${state.settingsMigrationInProgress ? 'Importing...' : 'Import Local Settings to Supabase'}</button>
          ${state.settingsMigrationArchiveAvailable ? '<button class="secondary-button js-archive-local-settings" type="button">Archive Local Settings Copy</button>' : ''}
        </div>
      </div>
    `
    : '';
  const clearAllPanel = isAdmin
    ? `
      <div class="import-preview-panel data-management-danger-zone">
        <div class="section-heading">
          <h4>Clear local data</h4>
        </div>
        <p class="entity-meta">This removes only local migration staging data in this browser (meetings, action overrides, settings). Cloud data in Supabase is not deleted.</p>
        <button class="secondary-button data-management-danger-button js-clear-all-local-data" type="button">Clear All Local Data</button>
      </div>
    `
    : '';

  return `
    <section class="import-card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Data management</p>
          <h3>Backup and restore local browser data</h3>
        </div>
      </div>
      <p class="import-description">Use backup export before making large changes. Restore writes only to local migration staging in this browser.</p>
      <p class="entity-meta">${escapeHtml(roleMessage)}</p>
      ${cloudMessage}
      ${cloudActionOverridesMessage}
      ${cloudSettingsMessage}
      ${migrationNotice}
      ${actionOverrideMigrationNotice}
      ${settingsMigrationNotice}

      <div class="panel-card data-management-stats">
        <p><strong>Cloud meetings loaded:</strong> ${meetingCount}</p>
        <p><strong>Cloud action overrides:</strong> ${actionOverrideCount}</p>
        <p><strong>Cloud settings loaded:</strong> ${escapeHtml(JSON.stringify(cloudSettings))}</p>
        <p><strong>Local staged settings copies:</strong> ${localStagedSettingsCount}</p>
        <p><strong>Approximate backup size:</strong> ${escapeHtml(backupSizeLabel)}</p>
        <p><strong>Latest export this session:</strong> ${escapeHtml(latestExportLabel)}</p>
      </div>

      ${errorMessage}
      ${successMessage}

      <div class="import-preview-panel">
        <div class="section-heading">
          <h4>Export backup</h4>
        </div>
        <p class="entity-meta">Downloads currently loaded cloud meetings, current cloud action overrides, and current cloud settings as a JSON backup file.</p>
        <button class="primary-button js-export-backup" type="button">Export Backup</button>
      </div>

      <div class="import-preview-panel">
        <div class="section-heading">
          <h4>Restore to Local Migration Staging</h4>
        </div>
        <p class="entity-meta">Validate and restore a backup JSON file into browser-local staging. Restored meetings do not overwrite Supabase automatically.</p>
        <div class="data-management-actions">
          <input id="restore-backup-input" class="sr-only" type="file" accept=".json,application/json">
          <button class="secondary-button js-select-restore-file" type="button">Choose Backup File</button>
          <button class="primary-button js-restore-backup" type="button">Restore to Local Migration Staging</button>
        </div>
        ${selectedBackup}
      </div>

      ${clearAllPanel}
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
  const saveStatusMessage = state.importSaveInProgress && state.importSaveStatus
    ? `<p class="import-hint" role="status">${escapeHtml(state.importSaveStatus)}</p>`
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
      ${saveStatusMessage}
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
  const participantIds = Array.isArray(meeting.participantIds) ? meeting.participantIds : [];
  const participantNames = participantIds.map((id) => getParticipantById(id)).filter(Boolean).map((participant) => participant.name).join(', ');
  const statusClass = 'meeting-status completed';

  return `
    <article class="meeting-card">
      <div class="meeting-card-header">
        <div>
          <div class="meeting-tags">
            ${partner ? `<span class="tag partner-tag">Partner: ${escapeHtml(partner.name)}</span>` : ''}
            ${customer ? `<span class="tag customer-tag">Customer: ${escapeHtml(customer.name)}</span>` : ''}
          </div>
          <h4>${escapeHtml(meeting.title || 'Untitled meeting')}</h4>
          <p class="meeting-meta">${formatDate(meeting.date)} · ${meeting.durationMinutes} minutes · ${participantIds.length} participants</p>
        </div>
        <span class="${statusClass}">${escapeHtml(meeting.meetingType || 'Saved')}</span>
      </div>
      <p class="meeting-summary">${escapeHtml((Array.isArray(meeting.summary) && meeting.summary[0]) ? meeting.summary[0] : '')}</p>
      <div class="entity-meta">
        <span class="badge">${escapeHtml(meeting.meetingType || 'Imported')}</span>
        <span>Participants: ${escapeHtml(participantNames)}</span>
      </div>
      <button class="secondary-button meeting-card-action js-open-meeting" type="button" data-meeting-id="${meeting.id}">Open details</button>
    </article>
  `;
}

function renderActionCard(action, options = {}) {
  const editable = Boolean(options.editable);
  const returnSection = options.returnSection ? String(options.returnSection) : '';
  const ownerLabel = action.owner || 'Unassigned';
  const notesLabel = action.notes || 'No notes';
  const dueDateLabel = action.dueDate ? formatDate(action.dueDate) : 'No due date';
  const dueDateClass = isActionOverdue(action) ? 'action-due-date action-due-date--overdue' : 'action-due-date';
  const highlightedClass = state.searchHighlightedActionId === action.id ? ' action-card--highlighted' : '';
  const statusClass = getActionStatusClass(action);
  const statusLabel = getActionStatusLabel(action);
  const statusOptions = ACTION_STATUSES.map((status) => `
    <option value="${escapeHtml(status)}" ${status === action.status ? 'selected' : ''}>${escapeHtml(status)}</option>
  `).join('');

  return `
    <article class="action-card${highlightedClass}" data-action-id="${escapeHtml(action.id)}">
      <h4>${escapeHtml(action.description)}</h4>
      <p class="action-card-note">${escapeHtml(notesLabel)}</p>
      <div class="action-meta action-card-row">
        <span>${escapeHtml(ownerLabel)}</span>
        <span class="action-card-separator">·</span>
        <span class="${statusClass}">${escapeHtml(statusLabel)}</span>
        <span class="action-card-separator">·</span>
        <span class="${dueDateClass}">Due ${escapeHtml(dueDateLabel)}</span>
      </div>
      <p class="entity-meta action-card-row">Customer: ${escapeHtml(action.customer || 'Unassigned')} <span class="action-card-separator">·</span> Partner: ${escapeHtml(action.partner || 'Unassigned')}</p>
      <div class="action-meta action-card-row action-card-row--controls">
        <span>Source: ${escapeHtml(action.sourceMeetingTitle || 'Unknown meeting')}</span>
        ${action.sourceMeetingId ? `<button class="secondary-button action-card-source-button js-open-meeting" type="button" data-meeting-id="${escapeHtml(action.sourceMeetingId)}" ${returnSection ? `data-return-section="${escapeHtml(returnSection)}"` : ''}>Open source meeting</button>` : ''}
      </div>
      ${editable ? `
        <div class="sort-controls">
          <label class="sort-label" for="action-status-${escapeHtml(action.id)}">Status</label>
          <select id="action-status-${escapeHtml(action.id)}" class="sort-select js-action-status" data-action-id="${escapeHtml(action.id)}">${statusOptions}</select>
          <label class="sort-label" for="action-due-${escapeHtml(action.id)}">Due date</label>
          <input id="action-due-${escapeHtml(action.id)}" class="sort-select js-action-due-date" data-action-id="${escapeHtml(action.id)}" type="date" value="${escapeHtml(action.dueDate || '')}">
        </div>
      ` : ''}
    </article>
  `;
}

async function handleImportFileSelection(file) {
  if (!file) {
    return;
  }

  state.importSuccessMessage = '';
  state.importSaveStatus = '';
  state.importExtractionError = '';
  state.importExtractedText = '';
  state.importExtractedHtml = '';
  state.importExtractedSections = createEmptyExtractedSections();
  state.importReview = createEmptyImportReview();

  const fileValidation = getValidatedImportDocxFile(file);
  if (!fileValidation.valid) {
    state.importSelectedFile = null;
    state.importError = fileValidation.error;
    renderViews();
    return;
  }

  state.importSelectedFile = file;
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

async function handleSaveMeeting() {
  if (state.importSaveInProgress || !canSaveMeeting()) {
    return;
  }

  if (!supabaseClient || !authState.user || !authState.user.id) {
    state.importError = 'You must be signed in to save meetings.';
    state.importSuccessMessage = '';
    renderViews();
    updateImportSaveButtonState();
    return;
  }

  state.importError = '';
  state.importSuccessMessage = '';
  state.importSaveStatus = '';
  state.importSaveInProgress = true;
  renderViews();
  updateImportSaveButtonState();

  const fileValidation = getValidatedImportDocxFile(state.importSelectedFile);
  if (!fileValidation.valid) {
    state.importError = fileValidation.error;
    state.importSaveInProgress = false;
    state.importSaveStatus = '';
    renderViews();
    updateImportSaveButtonState();
    return;
  }

  const sourceFile = fileValidation.file;
  const meetingId = createMeetingId();

  state.importSaveStatus = 'Uploading original document...';
  renderViews();
  updateImportSaveButtonState();

  const uploadResult = await uploadOriginalTranscriptToSupabase(sourceFile, meetingId);
  if (!uploadResult.success) {
    state.importError = uploadResult.error;
    state.importSaveInProgress = false;
    state.importSaveStatus = '';
    renderViews();
    updateImportSaveButtonState();
    return;
  }

  state.importSaveStatus = 'Saving meeting metadata...';
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
    id: meetingId,
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
    storageBucket: uploadResult.storageBucket,
    storagePath: uploadResult.storagePath,
    originalFileName: uploadResult.originalFileName,
    originalFileSize: uploadResult.originalFileSize,
    originalFileMimeType: uploadResult.originalFileMimeType,
    customer,
    partner,
    participants,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const meetingRow = mapMeetingToDatabaseRow(meeting, authState.user.id);

  const { data, error } = await supabaseClient
    .from('meetings')
    .insert(meetingRow)
    .select(MEETING_ROW_COLUMNS)
    .single();

  if (error || !data) {
    const cleanupResult = await deleteStoredTranscriptFile(uploadResult.storageBucket, uploadResult.storagePath);
    state.importError = cleanupResult.success
      ? 'Unable to save meeting metadata to Supabase. The uploaded document was rolled back.'
      : 'Unable to save meeting metadata to Supabase, and the uploaded document could not be rolled back automatically.';
    state.importSaveInProgress = false;
    state.importSaveStatus = '';
    renderViews();
    updateImportSaveButtonState();
    return;
  }

  const savedMeeting = mapDatabaseRowToMeeting(data);
  state.savedMeetings = [savedMeeting, ...state.savedMeetings].sort(compareMeetingsNewestFirst);
  state.importSelectedFile = null;
  state.importReview = createEmptyImportReview();
  state.importExtracting = false;
  state.importExtractionError = '';
  state.importExtractedText = '';
  state.importExtractedHtml = '';
  state.importExtractedSections = createEmptyExtractedSections();
  state.importSuccessMessage = `Meeting saved successfully as ${savedMeeting.title}.`;
  state.importSaveInProgress = false;
  state.importSaveStatus = '';
  renderViews();
  updateImportSaveButtonState();
}

function getCloudMeetingMigrationReport(result) {
  return `Inserted ${result.inserted}, skipped ${result.skipped}, failed ${result.failed}.`;
}

async function handleImportLocalMeetingsToSupabase() {
  if (!supabaseClient || !authState.user || !authState.user.id) {
    state.dataManagementError = 'You must be signed in to import local meetings.';
    renderViews();
    return;
  }

  const localMeetings = getLocalStagedMeetings();
  if (!localMeetings.length) {
    state.dataManagementError = 'No local meetings were found in this browser.';
    renderViews();
    return;
  }

  const confirmationMessage = [
    `Import ${localMeetings.length} local meetings to Supabase?`,
    '',
    'Existing cloud meetings will be preserved.',
    'Duplicate meeting ids will be skipped.'
  ].join('\n');

  const confirmed = window.confirm(confirmationMessage);
  if (!confirmed) {
    return;
  }

  clearDataManagementMessages();
  state.migrationInProgress = true;
  renderViews();

  const knownIds = new Set(state.savedMeetings.map((meeting) => meeting.id));
  const report = {
    inserted: 0,
    skipped: 0,
    failed: 0
  };
  const insertedMeetings = [];

  for (const localMeeting of localMeetings) {
    const normalizedMeeting = normalizeMeetingRecord(localMeeting);
    if (!normalizedMeeting || !normalizedMeeting.id) {
      report.failed += 1;
      continue;
    }

    if (knownIds.has(normalizedMeeting.id)) {
      report.skipped += 1;
      continue;
    }

    const meetingRow = mapMeetingToDatabaseRow(normalizedMeeting, authState.user.id);
    const { data, error } = await supabaseClient
      .from('meetings')
      .insert(meetingRow)
      .select(MEETING_ROW_COLUMNS)
      .single();

    if (error || !data) {
      report.failed += 1;
      continue;
    }

    knownIds.add(normalizedMeeting.id);
    report.inserted += 1;
    insertedMeetings.push(mapDatabaseRowToMeeting(data));
  }

  if (insertedMeetings.length) {
    state.savedMeetings = [...insertedMeetings, ...state.savedMeetings].sort(compareMeetingsNewestFirst);
    state.cloudMeetingsLoaded = true;
  }

  state.migrationInProgress = false;
  state.migrationArchiveAvailable = report.failed === 0 && (report.inserted > 0 || report.skipped > 0);
  state.dataManagementSuccess = `Local migration completed. ${getCloudMeetingMigrationReport(report)}`;
  state.dataManagementError = report.failed > 0 ? 'Some local meetings could not be imported to Supabase.' : '';
  renderViews();
}

function handleArchiveLocalMeetingCopy() {
  const localMeetings = getLocalStagedMeetings();
  if (!localMeetings.length) {
    state.dataManagementError = 'No local meeting copy is available to archive.';
    renderViews();
    return;
  }

  const confirmed = window.confirm(
    'Archive the local meeting copy?\n\nA backup will be exported first. This removes only local staged meetings from this browser.'
  );
  if (!confirmed) {
    return;
  }

  const payload = buildBackupPayload();
  const exported = triggerBackupDownload(payload);
  if (!exported) {
    state.dataManagementError = 'Unable to export a backup before archiving the local meeting copy.';
    renderViews();
    return;
  }

  if (typeof window === 'undefined' || !window.localStorage) {
    state.dataManagementError = 'Browser storage is not available for archiving the local meeting copy.';
    renderViews();
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
  state.migrationArchiveAvailable = false;
  state.dataManagementLastExportAt = payload.exportedAt;
  state.dataManagementSuccess = 'The local meeting copy was archived after exporting a backup.';
  renderViews();
}

function getCloudActionOverrideMigrationReport(result) {
  return `Inserted ${result.inserted}, updated ${result.updated}, skipped ${result.skipped}, failed ${result.failed}.`;
}

async function handleImportLocalActionUpdatesToSupabase() {
  if (!supabaseClient || !authState.user || !authState.user.id) {
    state.dataManagementError = 'You must be signed in to import local action updates.';
    renderViews();
    return;
  }

  const localOverridesById = getLocalStagedActionOverrides();
  const localOverrides = Object.values(localOverridesById || {});
  if (!localOverrides.length) {
    state.dataManagementError = 'No local action updates were found in this browser.';
    renderViews();
    return;
  }

  const confirmed = window.confirm([
    `Import ${localOverrides.length} local action updates to Supabase?`,
    '',
    'Existing cloud rows will be preserved.',
    'Matching action ids will be updated.',
    'Invalid or orphaned action updates will be skipped.'
  ].join('\n'));

  if (!confirmed) {
    return;
  }

  clearDataManagementMessages();
  state.overrideMigrationInProgress = true;
  renderViews();

  const actionsById = getCombinedActions().reduce((accumulator, action) => {
    accumulator[action.id] = action;
    return accumulator;
  }, {});

  const report = {
    inserted: 0,
    updated: 0,
    skipped: 0,
    failed: 0
  };
  const nextOverrides = { ...state.actionOverrides };

  for (const localOverride of localOverrides) {
    const sanitizedOverride = sanitizeActionOverrideRecord(localOverride);
    if (!sanitizedOverride) {
      report.skipped += 1;
      continue;
    }

    const sourceAction = actionsById[sanitizedOverride.actionId];
    if (!sourceAction || !sourceAction.sourceMeetingId) {
      report.skipped += 1;
      continue;
    }

    const row = mapActionOverrideToDatabaseRow(sanitizedOverride, authState.user.id, sourceAction.sourceMeetingId);
    if (!row) {
      report.skipped += 1;
      continue;
    }

    const hadExistingOverride = Boolean(state.actionOverrides[sanitizedOverride.actionId]);
    const { data, error } = await supabaseClient
      .from('action_overrides')
      .upsert(row, { onConflict: 'id' })
      .select(ACTION_OVERRIDE_ROW_COLUMNS)
      .single();

    if (error || !data) {
      report.failed += 1;
      continue;
    }

    const savedOverride = mapActionOverrideRowToOverride(data);
    if (!savedOverride) {
      report.failed += 1;
      continue;
    }

    nextOverrides[savedOverride.actionId] = savedOverride;
    if (hadExistingOverride) {
      report.updated += 1;
    } else {
      report.inserted += 1;
    }
  }

  state.actionOverrides = nextOverrides;
  state.overrideMigrationInProgress = false;
  state.overrideMigrationArchiveAvailable = report.failed === 0 && (report.inserted > 0 || report.updated > 0 || report.skipped > 0);
  state.dataManagementSuccess = `Local action update migration completed. ${getCloudActionOverrideMigrationReport(report)}`;
  state.dataManagementError = report.failed > 0 ? 'Some local action updates could not be imported to Supabase.' : '';
  renderViews();
}

function handleArchiveLocalActionUpdateCopy() {
  const localOverrides = Object.values(getLocalStagedActionOverrides() || {});
  if (!localOverrides.length) {
    state.dataManagementError = 'No local action update copy is available to archive.';
    renderViews();
    return;
  }

  const confirmed = window.confirm(
    'Archive the local action update copy?\n\nA backup will be exported first. This removes only local staged action overrides from this browser.'
  );
  if (!confirmed) {
    return;
  }

  const payload = buildBackupPayload();
  const exported = triggerBackupDownload(payload);
  if (!exported) {
    state.dataManagementError = 'Unable to export a backup before archiving the local action update copy.';
    renderViews();
    return;
  }

  if (typeof window === 'undefined' || !window.localStorage) {
    state.dataManagementError = 'Browser storage is not available for archiving the local action update copy.';
    renderViews();
    return;
  }

  window.localStorage.removeItem(ACTION_OVERRIDES_STORAGE_KEY);
  state.overrideMigrationArchiveAvailable = false;
  state.dataManagementLastExportAt = payload.exportedAt;
  state.dataManagementSuccess = 'The local action update copy was archived after exporting a backup.';
  renderViews();
}

async function handleImportLocalSettingsToSupabase() {
  if (!supabaseClient || !authState.user || !authState.user.id) {
    state.dataManagementError = 'You must be signed in to import local settings.';
    renderViews();
    return;
  }

  const localSettingsRecord = getLocalStagedSettingsRecord();
  if (!localSettingsRecord.exists) {
    state.dataManagementError = 'No local staged settings were found in this browser.';
    renderViews();
    return;
  }

  const detectedSettingLabels = getDetectedSupportedSettingLabels(localSettingsRecord.raw);
  const sanitizedSettings = sanitizeApplicationSettings(localSettingsRecord.raw);
  const confirmed = window.confirm([
    'Import local settings to Supabase?',
    '',
    'This will replace the current cloud settings for your user with local staged settings.',
    `Detected supported settings: ${detectedSettingLabels.length ? detectedSettingLabels.join(', ') : 'None'}`,
    'Unsupported or malformed fields will be ignored and defaults will be applied.'
  ].join('\n'));

  if (!confirmed) {
    return;
  }

  clearDataManagementMessages();
  state.settingsMigrationInProgress = true;
  renderViews();

  const saveResult = await saveApplicationSettingsToSupabase(sanitizedSettings);
  state.settingsMigrationInProgress = false;

  if (!saveResult.success) {
    state.dataManagementError = `${saveResult.error} Local settings migration failed and cloud settings were not changed.`;
    renderViews();
    return;
  }

  applyApplicationSettings(saveResult.settings);
  state.settingsMigrationArchiveAvailable = true;
  state.dataManagementSuccess = 'Local settings migration completed. Cloud settings were replaced with sanitized local staged settings.';
  state.dataManagementError = '';
  renderViews();
}

function handleArchiveLocalSettingsCopy() {
  const localSettingsRecord = getLocalStagedSettingsRecord();
  if (!localSettingsRecord.exists) {
    state.dataManagementError = 'No local settings copy is available to archive.';
    renderViews();
    return;
  }

  const confirmed = window.confirm(
    'Archive the local settings copy?\n\nA backup will be exported first. This removes only taskletTranscriptApp.settings from this browser.'
  );
  if (!confirmed) {
    return;
  }

  const payload = buildBackupPayload();
  const exported = triggerBackupDownload(payload);
  if (!exported) {
    state.dataManagementError = 'Unable to export a backup before archiving the local settings copy.';
    renderViews();
    return;
  }

  if (typeof window === 'undefined' || !window.localStorage) {
    state.dataManagementError = 'Browser storage is not available for archiving the local settings copy.';
    renderViews();
    return;
  }

  window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
  state.settingsMigrationArchiveAvailable = false;
  state.dataManagementLastExportAt = payload.exportedAt;
  state.dataManagementSuccess = 'The local settings copy was archived after exporting a backup.';
  renderViews();
}

function attachInteractions() {
  document.querySelectorAll('.js-open-customer-detail').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeSection = 'customers';
      state.selectedCustomerKey = button.dataset.customerKey || null;
      state.selectedPartnerKey = null;
      state.selectedMeetingId = null;
      state.meetingEditMode = false;
      state.meetingEditDraft = null;
      state.meetingEditError = '';
      state.meetingReturnContext = null;
      renderViews();
    });
  });

  document.querySelectorAll('.js-open-partner-detail').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeSection = 'partners';
      state.selectedPartnerKey = button.dataset.partnerKey || null;
      state.selectedCustomerKey = null;
      state.selectedParticipantKey = null;
      state.selectedMeetingId = null;
      state.meetingEditMode = false;
      state.meetingEditDraft = null;
      state.meetingEditError = '';
      state.meetingReturnContext = null;
      renderViews();
    });
  });

  document.querySelectorAll('.js-open-participant-detail').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeSection = 'participants';
      state.selectedParticipantKey = button.dataset.participantKey || null;
      state.selectedCustomerKey = null;
      state.selectedPartnerKey = null;
      state.selectedMeetingId = null;
      state.meetingEditMode = false;
      state.meetingEditDraft = null;
      state.meetingEditError = '';
      state.meetingReturnContext = null;
      renderViews();
    });
  });

  document.querySelectorAll('.js-open-meeting').forEach((button) => {
    button.addEventListener('click', () => {
      const returnSection = button.dataset.returnSection;
      const returnKey = button.dataset.returnKey;

      state.meetingReturnContext = returnSection
        ? { section: returnSection, key: returnKey || null }
        : null;
      state.activeSection = 'meetings';
      state.selectedMeetingId = button.dataset.meetingId;
      state.meetingEditMode = false;
      state.meetingEditDraft = null;
      state.meetingEditError = '';
      state.meetingDocumentDownloadInProgressId = '';
      state.meetingDocumentDownloadError = '';
      state.activeViewerTab = 'overview';
      renderViews();
    });
  });

  document.querySelectorAll('.js-download-original-docx').forEach((button) => {
    button.addEventListener('click', () => {
      const meetingId = button.dataset.meetingId;
      if (!meetingId) {
        return;
      }

      downloadOriginalMeetingDocument(meetingId);
    });
  });

  document.querySelectorAll('.js-edit-meeting').forEach((button) => {
    button.addEventListener('click', () => {
      const meeting = getMeetingById(state.selectedMeetingId);
      enterMeetingEditMode(meeting);
    });
  });

  document.querySelectorAll('.js-delete-meeting').forEach((button) => {
    button.addEventListener('click', () => {
      deleteSavedMeeting();
    });
  });

  document.querySelectorAll('.js-meeting-edit-field').forEach((field) => {
    field.addEventListener('input', () => {
      const editField = field.dataset.editField;
      if (!editField) {
        return;
      }

      if (!state.meetingEditDraft) {
        const meeting = getMeetingById(state.selectedMeetingId);
        state.meetingEditDraft = meeting ? createMeetingEditDraft(meeting) : {};
      }

      state.meetingEditDraft[editField] = field.value;
      if (state.meetingEditError) {
        state.meetingEditError = '';
      }
    });
  });

  document.querySelectorAll('.js-save-meeting-edit').forEach((button) => {
    button.addEventListener('click', () => {
      saveMeetingEdits();
    });
  });

  document.querySelectorAll('.js-cancel-meeting-edit').forEach((button) => {
    button.addEventListener('click', () => {
      cancelMeetingEditMode();
    });
  });

  document.querySelectorAll('.js-back-to-meetings').forEach((button) => {
    button.addEventListener('click', () => {
      if (state.meetingReturnContext && state.meetingReturnContext.section === 'customers') {
        state.activeSection = 'customers';
        state.selectedCustomerKey = state.meetingReturnContext.key;
        state.selectedPartnerKey = null;
        state.selectedParticipantKey = null;
      } else if (state.meetingReturnContext && state.meetingReturnContext.section === 'partners') {
        state.activeSection = 'partners';
        state.selectedPartnerKey = state.meetingReturnContext.key;
        state.selectedCustomerKey = null;
        state.selectedParticipantKey = null;
      } else if (state.meetingReturnContext && state.meetingReturnContext.section === 'participants') {
        state.activeSection = 'participants';
        state.selectedParticipantKey = state.meetingReturnContext.key;
        state.selectedCustomerKey = null;
        state.selectedPartnerKey = null;
      } else if (state.meetingReturnContext && state.meetingReturnContext.section === 'actions') {
        state.activeSection = 'actions';
        state.selectedCustomerKey = null;
        state.selectedPartnerKey = null;
        state.selectedParticipantKey = null;
      } else if (state.meetingReturnContext && state.meetingReturnContext.section === 'search') {
        state.activeSection = state.meetingReturnContext.key || state.activeSection;
        state.searchResultsOpen = normalizeSearchQuery(state.searchQuery).length >= SEARCH_MIN_CHARS;
        state.searchActiveIndex = -1;
        state.selectedCustomerKey = null;
        state.selectedPartnerKey = null;
        state.selectedParticipantKey = null;
      }

      state.selectedMeetingId = null;
      state.meetingEditMode = false;
      state.meetingEditDraft = null;
      state.meetingEditError = '';
      state.meetingReturnContext = null;
      state.meetingDocumentDownloadInProgressId = '';
      state.meetingDocumentDownloadError = '';
      renderViews();
    });
  });

  document.querySelectorAll('.js-search-result').forEach((button) => {
    button.addEventListener('click', () => {
      const resultType = button.dataset.resultType;
      const resultId = button.dataset.resultId;
      if (!resultType || !resultId) {
        return;
      }

      const result = getCurrentFlatSearchResults().find((item) => item.type === resultType && item.id === resultId);
      if (!result) {
        return;
      }

      openSearchResult(result);
    });
  });

  document.querySelectorAll('.js-back-to-customers').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedCustomerKey = null;
      renderViews();
    });
  });

  document.querySelectorAll('.js-back-to-partners').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedPartnerKey = null;
      renderViews();
    });
  });

  document.querySelectorAll('.js-back-to-participants').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedParticipantKey = null;
      renderViews();
    });
  });

  document.querySelectorAll('.js-viewer-tab').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeViewerTab = button.dataset.viewerTab;
      renderViews();
    });
  });

  const actionsFilter = document.querySelector('.js-actions-filter');
  if (actionsFilter) {
    actionsFilter.value = state.actionFilter;
    actionsFilter.disabled = state.settingsSaveInProgress;
    actionsFilter.addEventListener('change', async (event) => {
      const selectedFilter = ACTION_FILTERS.includes(event.target.value) ? event.target.value : 'All';
      const previousFilter = state.actionFilter;
      event.target.disabled = true;
      const saveResult = await updateSingleApplicationSetting('actionFilter', selectedFilter);
      if (!saveResult.success) {
        event.target.value = previousFilter;
        window.alert(saveResult.error);
      }
      renderViews();
    });
  }

  document.querySelectorAll('.js-action-status').forEach((field) => {
    field.addEventListener('change', () => {
      const actionId = field.dataset.actionId;
      if (!actionId) {
        return;
      }

      updateActionOverride(actionId, { status: field.value });
    });
  });

  document.querySelectorAll('.js-action-due-date').forEach((field) => {
    field.addEventListener('change', () => {
      const actionId = field.dataset.actionId;
      if (!actionId) {
        return;
      }

      updateActionOverride(actionId, { dueDate: field.value });
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
    sortSelect.disabled = state.settingsSaveInProgress;
    sortSelect.addEventListener('change', async (event) => {
      const nextSortOrder = SORT_ORDER_OPTIONS.includes(event.target.value) ? event.target.value : 'newest';
      const previousSortOrder = state.sortOrder;
      event.target.disabled = true;
      const saveResult = await updateSingleApplicationSetting('sortOrder', nextSortOrder);
      if (!saveResult.success) {
        event.target.value = previousSortOrder;
        window.alert(saveResult.error);
      }
      renderViews();
    });
  }

  const selectRestoreFileButton = document.querySelector('.js-select-restore-file');
  const restoreBackupInput = document.getElementById('restore-backup-input');
  const restoreBackupButton = document.querySelector('.js-restore-backup');
  const exportBackupButton = document.querySelector('.js-export-backup');
  const clearAllLocalDataButton = document.querySelector('.js-clear-all-local-data');
  const retryCloudMeetingsButtons = document.querySelectorAll('.js-retry-cloud-meetings');
  const importLocalMeetingsButton = document.querySelector('.js-import-local-meetings');
  const archiveLocalMeetingsButton = document.querySelector('.js-archive-local-meetings');
  const importLocalActionOverridesButton = document.querySelector('.js-import-local-action-overrides');
  const archiveLocalActionOverridesButton = document.querySelector('.js-archive-local-action-overrides');
  const importLocalSettingsButton = document.querySelector('.js-import-local-settings');
  const archiveLocalSettingsButton = document.querySelector('.js-archive-local-settings');
  const emptyImportButtons = document.querySelectorAll('.js-go-import');

  if (selectRestoreFileButton && restoreBackupInput) {
    selectRestoreFileButton.addEventListener('click', () => {
      restoreBackupInput.click();
    });
  }

  if (restoreBackupInput) {
    restoreBackupInput.addEventListener('change', (event) => {
      const selectedFile = event.target.files && event.target.files[0] ? event.target.files[0] : null;
      state.dataManagementSelectedBackupFile = selectedFile;
      state.dataManagementSelectedBackupName = selectedFile ? selectedFile.name : '';
      clearDataManagementMessages();
      renderViews();
      event.target.value = '';
    });
  }

  if (restoreBackupButton) {
    restoreBackupButton.addEventListener('click', () => {
      handleRestoreBackup();
    });
  }

  if (exportBackupButton) {
    exportBackupButton.addEventListener('click', () => {
      handleExportBackup();
    });
  }

  if (clearAllLocalDataButton) {
    clearAllLocalDataButton.addEventListener('click', () => {
      handleClearAllLocalData();
    });
  }

  retryCloudMeetingsButtons.forEach((button) => {
    button.addEventListener('click', () => {
      handleRetryCloudMeetings();
    });
  });

  if (importLocalMeetingsButton) {
    importLocalMeetingsButton.addEventListener('click', () => {
      handleImportLocalMeetingsToSupabase();
    });
  }

  if (archiveLocalMeetingsButton) {
    archiveLocalMeetingsButton.addEventListener('click', () => {
      handleArchiveLocalMeetingCopy();
    });
  }

  if (importLocalActionOverridesButton) {
    importLocalActionOverridesButton.addEventListener('click', () => {
      handleImportLocalActionUpdatesToSupabase();
    });
  }

  if (archiveLocalActionOverridesButton) {
    archiveLocalActionOverridesButton.addEventListener('click', () => {
      handleArchiveLocalActionUpdateCopy();
    });
  }

  if (importLocalSettingsButton) {
    importLocalSettingsButton.addEventListener('click', () => {
      handleImportLocalSettingsToSupabase();
    });
  }

  if (archiveLocalSettingsButton) {
    archiveLocalSettingsButton.addEventListener('click', () => {
      handleArchiveLocalSettingsCopy();
    });
  }

  emptyImportButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.activeSection = 'import';
      state.selectedMeetingId = null;
      state.meetingEditMode = false;
      state.meetingEditDraft = null;
      state.meetingEditError = '';
      state.selectedCustomerKey = null;
      state.selectedPartnerKey = null;
      state.selectedParticipantKey = null;
      state.meetingReturnContext = null;
      state.activeViewerTab = 'overview';
      renderViews();
    });
  });

  const topImportButton = document.querySelector('.topbar .primary-button');
  if (topImportButton) {
    topImportButton.addEventListener('click', () => {
      state.activeSection = 'import';
      state.selectedMeetingId = null;
      state.meetingEditMode = false;
      state.meetingEditDraft = null;
      state.meetingEditError = '';
      state.selectedCustomerKey = null;
      state.selectedPartnerKey = null;
      state.selectedParticipantKey = null;
      state.meetingReturnContext = null;
      state.activeViewerTab = 'overview';
      renderViews();
    });
  }
}

function getMeetingById(meetingId) {
  return getAllMeetings().find((meeting) => meeting.id === meetingId);
}

function getCustomerById(customerId) {
  return getCustomersFromMeetings().find((customer) => customer.id === customerId);
}

function getPartnerById(partnerId) {
  return getPartnersFromMeetings().find((partner) => partner.id === partnerId);
}

function getParticipantById(participantId) {
  return getParticipantsFromMeetings().find((participant) => participant.id === participantId);
}

function getPageTitle() {
  if (state.activeSection === 'meetings' && state.selectedMeetingId) {
    return 'Meeting Details';
  }

  if (state.activeSection === 'customers' && state.selectedCustomerKey) {
    return 'Customer Details';
  }

  if (state.activeSection === 'partners' && state.selectedPartnerKey) {
    return 'Partner Details';
  }

  if (state.activeSection === 'participants' && state.selectedParticipantKey) {
    return 'Participant Details';
  }

  return sectionTitles[state.activeSection] || 'Dashboard';
}

function formatDate(dateString) {
  if (!dateString) {
    return 'Date not available';
  }

  const date = new Date(`${dateString}T00:00:00`);
  if (!Number.isFinite(date.getTime())) {
    return 'Date not available';
  }

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

document.addEventListener('DOMContentLoaded', () => {
  setupLogoFallbacks();
  bootstrapAuthentication();
});

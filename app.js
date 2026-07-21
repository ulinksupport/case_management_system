"use strict";

/*
  Ulink Assist Case Management System
  ----------------------------
  Change the API base URL in index.html when the n8n domain changes.
  Endpoint-specific values remain as short paths in this file.
*/

const apiBaseUrl =
  document
    .querySelector('meta[name="api-base-url"]')
    ?.content.trim()
    .replace(/\/+$/, "") ?? "";

const appConfig = {
  endpoints: {
    zohoTickets: "/webhook/zoho-tickets-feed"
  },
  zohoRefreshIntervalMs: 15000
};

function buildApiUrl(path) {
  const normalizedPath = `/${String(path ?? "").replace(/^\/+/, "")}`;
  return apiBaseUrl ? `${apiBaseUrl}${normalizedPath}` : normalizedPath;
}

const mockData = {
  cases: [
    {
      id: "UA-2026-07124",
      contactId: "CT-100238",
      patient: "Mei Lin Tan",
      phone: "+65 8759 4484",
      email: "meilin.tan@example.com",
      location: "Singapore",
      caseType: "admission",
      caseTypeLabel: "Emergency admission",
      caseDescription: "Hospital coordination",
      status: "Open",
      client: "Singlife",
      hospital: "Mount Elizabeth Hospital",
      admissionDate: "13 Jul 2026",
      matchState: "high",
      matchConfidence: 98,
      latestInteraction: "Patient WhatsApp",
      latestInteractionNote: "Requested an approval update",
      updatedAt: "2 min ago",
      updatedTime: "17:25",
      channels: ["email", "whatsapp", "document"],
      tickets: [
        { id: "ZD-24518", party: "Insurer", subject: "Emergency admission assistance request", status: "Open", createdAt: "13 Jul 2026, 14:58" },
        { id: "ZD-24521", party: "Hospital", subject: "Medical report and estimated bill", status: "Open", createdAt: "13 Jul 2026, 15:12" },
        { id: "ZD-24532", party: "Patient", subject: "Admission update", status: "Open", createdAt: "13 Jul 2026, 15:29" }
      ],
      interactions: [
        {
          id: "WA-221784",
          channel: "whatsapp",
          party: "Patient",
          time: "17:22",
          timestamp: "2026-07-13T17:22:00+08:00",
          source: "WhatsApp Business",
          title: "Patient requested an approval update",
          content: "Hi, the hospital said they are still waiting for the guarantee letter. May I know whether it has been approved?",
          confidence: 96,
          signals: "Matched by normalized phone, contact record and hospital context",
          attachments: []
        },
        {
          id: "EM-988201",
          channel: "email",
          party: "Insurer",
          time: "16:45",
          timestamp: "2026-07-13T16:45:00+08:00",
          source: "Zoho ZD-24518",
          title: "Insurer acknowledged admission documents",
          content: "The insurer confirmed that the signed admission form was received and the case remains under review.",
          confidence: 99,
          signals: "Matched by Zoho ticket ID, policy reference and patient name",
          attachments: []
        },
        {
          id: "DOC-55210",
          channel: "document",
          party: "Hospital",
          time: "16:31",
          timestamp: "2026-07-13T16:31:00+08:00",
          source: "Attachment ZD-24521",
          title: "Signed admission form added",
          content: "The file reference is linked to the hospital ticket. Document extraction will be added later.",
          confidence: 100,
          signals: "Matched by source ticket relationship",
          attachments: ["signed-admission-form.pdf"]
        },
        {
          id: "EM-988176",
          channel: "email",
          party: "Hospital",
          time: "15:46",
          timestamp: "2026-07-13T15:46:00+08:00",
          source: "Zoho ZD-24521",
          title: "Medical report and estimated bill received",
          content: "The hospital sent the preliminary medical report and estimated hospital bill for the emergency admission request.",
          confidence: 98,
          signals: "Matched by patient name, hospital, admission date and ticket relationship",
          attachments: ["medical-report.pdf", "estimated-bill.pdf"]
        },
        {
          id: "WA-221760",
          channel: "whatsapp",
          party: "Patient",
          time: "15:20",
          timestamp: "2026-07-13T15:20:00+08:00",
          source: "WhatsApp Business",
          title: "Patient confirmed hospital admission",
          content: "I have been admitted and the hospital will email the documents shortly.",
          confidence: 97,
          signals: "Matched by exact normalized phone and current admission context",
          attachments: []
        },
        {
          id: "EM-988120",
          channel: "email",
          party: "Insurer",
          time: "14:58",
          timestamp: "2026-07-13T14:58:00+08:00",
          source: "Zoho ZD-24518",
          title: "Emergency admission assistance requested",
          content: "The insurer requested Ulink to coordinate admission support and obtain the relevant hospital documents.",
          confidence: 100,
          signals: "Master Case created from strong ticket and contact identifiers",
          attachments: []
        }
      ],
      ai: {
        summary: "The patient was admitted to Mount Elizabeth Hospital. The hospital has provided a medical report, estimated bill and signed admission form. The insurer acknowledged receipt and is reviewing the request.",
        latestUpdate: "The patient asked whether the guarantee letter has been approved.",
        pendingItems: ["Insurer approval or coverage decision", "Confirmation to the patient after insurer response"],
        nextStep: "Check the insurer thread for the latest approval status and update the patient manually through the approved operational channel.",
        suggestedReply: "Thank you for your message. We have received the hospital documents and the request is currently under review. We will update you once there is confirmation from the insurer."
      },
      matchingSummary: [
        { title: "Strong identifiers", status: "Matched", copy: "Zoho ticket IDs, exact contact email and normalized phone are linked to this Master Case." },
        { title: "Supporting context", status: "Consistent", copy: "Patient name, hospital, admission date and message timing are consistent across sources." }
      ]
    },
    {
      id: "UA-2026-07119",
      contactId: "CT-100214",
      patient: "R. Ahmad",
      phone: "+62 812 4455 7712",
      email: "rahmad@example.com",
      location: "Indonesia → Singapore",
      caseType: "evacuation",
      caseTypeLabel: "Medical evacuation",
      caseDescription: "Air ambulance coordination",
      status: "Open",
      client: "Corporate Client",
      hospital: "Jakarta International Hospital",
      admissionDate: "12 Jul 2026",
      matchState: "high",
      matchConfidence: 97,
      latestInteraction: "Provider email",
      latestInteractionNote: "Quotation acknowledgement received",
      updatedAt: "6 min ago",
      updatedTime: "17:21",
      channels: ["email", "whatsapp"],
      tickets: [
        { id: "ZD-24502", party: "Client", subject: "Evacuation assessment", status: "Open", createdAt: "12 Jul 2026, 18:05" },
        { id: "ZD-24506", party: "Hospital", subject: "Medical report request", status: "Open", createdAt: "12 Jul 2026, 18:41" },
        { id: "ZD-24509", party: "Provider", subject: "Air ambulance quotation", status: "Open", createdAt: "13 Jul 2026, 09:30" }
      ],
      interactions: [
        {
          id: "EM-988250",
          channel: "email",
          party: "Air ambulance provider",
          time: "17:21",
          timestamp: "2026-07-13T17:21:00+08:00",
          source: "Zoho ZD-24509",
          title: "Quotation request acknowledged",
          content: "The provider confirmed that flight operations is reviewing aircraft availability and will revert with a quotation.",
          confidence: 99,
          signals: "Matched by linked provider ticket and Master Case ID in subject",
          attachments: []
        },
        {
          id: "WA-221700",
          channel: "whatsapp",
          party: "NOK",
          time: "16:10",
          timestamp: "2026-07-13T16:10:00+08:00",
          source: "WhatsApp Business",
          title: "NOK requested progress update",
          content: "Please let us know whether the medical team has reviewed the report.",
          confidence: 95,
          signals: "Matched by registered NOK phone and case context",
          attachments: []
        }
      ],
      ai: {
        summary: "The evacuation case is open. The provider has acknowledged the quotation request and the NOK is waiting for an update.",
        latestUpdate: "Aircraft availability and quotation are pending from the provider.",
        pendingItems: ["Provider quotation", "Medical review confirmation"],
        nextStep: "Follow up with the provider for the quotation and confirm whether the medical review has been completed.",
        suggestedReply: "We are following up on the aircraft quotation and medical review. We will provide an update once the required information is available."
      },
      matchingSummary: [
        { title: "Strong identifiers", status: "Matched", copy: "The provider ticket and email subject contain the Master Case reference." },
        { title: "Supporting context", status: "Consistent", copy: "NOK phone, provider identity and evacuation route are consistent." }
      ]
    },
    {
      id: "UA-2026-07116",
      contactId: "CT-100205",
      patient: "Lucas Wong",
      phone: "+65 8111 2290",
      email: "lucas.wong@example.com",
      location: "Japan",
      caseType: "outpatient",
      caseTypeLabel: "Outpatient assistance",
      caseDescription: "Clinic arrangement",
      status: "Open",
      client: "Singlife",
      hospital: "Tokyo Medical Clinic",
      admissionDate: "13 Jul 2026",
      matchState: "high",
      matchConfidence: 95,
      latestInteraction: "Clinic email",
      latestInteractionNote: "Appointment availability provided",
      updatedAt: "11 min ago",
      updatedTime: "17:16",
      channels: ["email", "whatsapp"],
      tickets: [
        { id: "ZD-24497", party: "Patient", subject: "Clinic recommendation request", status: "Open", createdAt: "13 Jul 2026, 13:18" },
        { id: "ZD-24504", party: "Clinic", subject: "Appointment availability", status: "Open", createdAt: "13 Jul 2026, 16:58" }
      ],
      interactions: [
        {
          id: "EM-988190",
          channel: "email",
          party: "Clinic",
          time: "17:16",
          timestamp: "2026-07-13T17:16:00+08:00",
          source: "Zoho ZD-24504",
          title: "Appointment slot available",
          content: "The clinic confirmed an available consultation slot tomorrow at 10:30 AM.",
          confidence: 98,
          signals: "Matched by linked clinic ticket and patient email",
          attachments: []
        }
      ],
      ai: {
        summary: "The clinic has offered an appointment slot for tomorrow at 10:30 AM.",
        latestUpdate: "Appointment availability was received from the clinic.",
        pendingItems: ["Patient acceptance of appointment slot"],
        nextStep: "Inform the patient of the proposed appointment time and request confirmation.",
        suggestedReply: "The clinic has an available appointment tomorrow at 10:30 AM. Please confirm whether this timing is suitable."
      },
      matchingSummary: [
        { title: "Strong identifiers", status: "Matched", copy: "Patient email and linked Zoho ticket matched exactly." },
        { title: "Supporting context", status: "Consistent", copy: "Clinic name and consultation request are consistent." }
      ]
    },
    {
      id: "UA-2026-07108",
      contactId: "CT-100171",
      patient: "Match under review",
      phone: "+60 12 882 1044",
      email: "unknown@example.com",
      location: "Malaysia",
      caseType: "admission",
      caseTypeLabel: "Admission support",
      caseDescription: "Identity conflict",
      status: "Open",
      client: "Corporate Client",
      hospital: "Kuala Lumpur Medical Centre",
      admissionDate: "13 Jul 2026",
      matchState: "flagged",
      matchConfidence: 72,
      latestInteraction: "WhatsApp message",
      latestInteractionNote: "Phone matched but patient name differed",
      updatedAt: "21 min ago",
      updatedTime: "17:06",
      channels: ["email", "whatsapp"],
      tickets: [
        { id: "ZD-24461", party: "Client", subject: "Possible admission case", status: "Open", createdAt: "13 Jul 2026, 14:02" }
      ],
      interactions: [
        {
          id: "WA-221770",
          channel: "whatsapp",
          party: "Unknown sender",
          time: "17:06",
          timestamp: "2026-07-13T17:06:00+08:00",
          source: "WhatsApp Business",
          title: "Possible case update",
          content: "The hospital will send the report tonight.",
          confidence: 72,
          signals: "Phone matched; patient name conflicted",
          attachments: []
        }
      ],
      ai: {
        summary: "An interaction may relate to this admission case, but the sender identity conflicts with the existing patient record.",
        latestUpdate: "A WhatsApp message stated that the hospital will send a report.",
        pendingItems: ["Identity verification outside the Storyboard"],
        nextStep: "Do not rely on this interaction until the match is resolved through the separate admin process.",
        suggestedReply: "No reply should be generated until the sender and case relationship are confirmed."
      },
      matchingSummary: [
        { title: "Strong identifiers", status: "Conflict", copy: "The phone number matched, but the patient name was different." },
        { title: "Backend decision", status: "Flagged", copy: "The interaction remains visible but should not be treated as confirmed." }
      ]
    }
  ],
  unmatched: [
    {
      id: "WA-221799",
      source: "WhatsApp",
      sender: "+65 9000 1122",
      preview: "The hospital asked me to contact your assistance team.",
      possibleCase: "None",
      confidence: 24,
      signals: "Phone number not found; no case reference",
      received: "17:29"
    },
    {
      id: "EM-988280",
      source: "Email",
      sender: "billing@samplehospital.com",
      preview: "Please find attached the revised estimate for the patient.",
      possibleCase: "UA-2026-07124",
      confidence: 61,
      signals: "Hospital matched; patient and case reference missing",
      received: "17:18"
    },
    {
      id: "WA-221742",
      source: "WhatsApp",
      sender: "+60 12 882 1044",
      preview: "The hospital will send the report tonight.",
      possibleCase: "UA-2026-07108",
      confidence: 72,
      signals: "Phone matched; patient name conflicted",
      received: "17:06"
    }
  ],
  ingestion: [
    {
      source: "Email / Zoho Desk",
      status: "Ready for n8n",
      statusClass: "green",
      lastEvent: "17:25:18",
      delay: "12 sec",
      reference: "EM-988201",
      method: "Webhook / API sync"
    },
    {
      source: "WhatsApp Business API",
      status: "Ready for n8n",
      statusClass: "green",
      lastEvent: "17:22:04",
      delay: "9 sec",
      reference: "WA-221784",
      method: "Webhook"
    },
    {
      source: "AI Case Suggestion",
      status: "Planned",
      statusClass: "amber",
      lastEvent: "Not connected",
      delay: "—",
      reference: "—",
      method: "n8n + AI model"
    },
    {
      source: "Velox Call Events",
      status: "Paused",
      statusClass: "grey",
      lastEvent: "Test completed",
      delay: "—",
      reference: "test-call-001",
      method: "Webhook metadata"
    }
  ]
};

function cloneDummySnapshot(reason = "") {
  return {
    mode: "dummy",
    message: reason
      ? `Live Zoho data could not be loaded (${reason}). Showing built-in dummy records.`
      : "Showing built-in dummy records while waiting for live Zoho data.",
    generatedAt: new Date().toISOString(),
    cases: structuredClone(mockData.cases).map((item) => ({
      ...item,
      isDummy: true,
      dataSource: "dummy"
    })),
    unmatched: structuredClone(mockData.unmatched).map((item) => ({
      ...item,
      isDummy: true
    })),
    ingestion: structuredClone(mockData.ingestion).map((item) => ({
      ...item,
      isDummy: true
    }))
  };
}

function formatTicketDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-SG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Singapore"
  }).format(date);
}

function formatTicketTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-SG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Singapore"
  }).format(date);
}

function normalizeChannel(channel) {
  const value = String(channel ?? "").trim().toLowerCase();

  if (value.includes("whatsapp")) return "whatsapp";
  if (value.includes("document")) return "document";
  return "email";
}

function mapZohoTicketToCase(ticket, index) {
  const ticketNumber = String(ticket.ticketNumber ?? "").trim();
  const ticketId = String(ticket.ticketId ?? "").trim();
  const subject = String(ticket.subject ?? "").trim() || "Zoho ticket";
  const patientName =
    String(ticket.patientName ?? "").trim() ||
    "Patient not identified";
  const patientPhone = String(ticket.patientPhone ?? "").trim();
  const requestorEmail = String(ticket.requestorEmail ?? "").trim();
  const status = String(ticket.status ?? "").trim() || "Unknown";
  const channel = normalizeChannel(ticket.channel);
  const createdAt = ticket.createdAt || "";
  const updatedAt = ticket.updatedAt || createdAt;
  const confidence = Math.max(
    0,
    Math.min(100, Number(ticket.confidence ?? 0) || 0)
  );
  const rawMatchState = String(ticket.matchState ?? "").toLowerCase();
  const matchState =
    rawMatchState === "matched" ||
      rawMatchState === "high" ||
      confidence >= 90
      ? "high"
      : "flagged";

  const displayTicketId =
    ticketNumber ? `ZD-${ticketNumber}` : ticketId || `ZD-${index + 1}`;

  const masterCaseId =
    String(ticket.masterCaseId ?? "").trim() ||
    `ZOHO-${ticketNumber || ticketId || index + 1}`;

  const signals =
    String(ticket.signals ?? "").trim() ||
    "No matching evidence has been generated yet.";

  return {
    id: masterCaseId,
    contactId: String(ticket.contactId ?? "").trim(),
    patient: patientName,
    phone: patientPhone,
    email: requestorEmail,
    location: "Not available",
    caseType: "zoho",
    caseTypeLabel: "Zoho ticket",
    caseDescription: subject,
    status,
    client: requestorEmail || "Not identified",
    hospital: "Not available",
    admissionDate: formatTicketDate(createdAt),
    matchState,
    matchConfidence: confidence,
    latestInteraction: "Zoho Desk ticket",
    latestInteractionNote: subject,
    updatedAt: formatTicketDate(updatedAt),
    updatedTime: formatTicketTime(updatedAt),
    channels: [channel],
    isDummy: false,
    dataSource: "live",
    tickets: [
      {
        id: displayTicketId,
        party: "Requestor",
        subject,
        status,
        createdAt: formatTicketDate(createdAt),
        webUrl: String(ticket.webUrl ?? "").trim()
      }
    ],
    interactions: [
      {
        id: displayTicketId,
        channel,
        party: "Requestor",
        time: formatTicketTime(updatedAt),
        timestamp: updatedAt || createdAt || new Date().toISOString(),
        source: "Zoho Desk",
        title: subject,
        content: `Status: ${status}. Threads: ${Number(ticket.threadCount ?? 0)}. Comments: ${Number(ticket.commentCount ?? 0)}.`,
        confidence,
        signals,
        attachments: []
      }
    ],
    ai: {
      summary: "AI guidance has not been generated for this live ticket yet.",
      latestUpdate: subject,
      pendingItems: ["Waiting for the AI case-guidance workflow"],
      nextStep: "Review the live Zoho ticket in the approved operational system.",
      suggestedReply: "No suggested reply has been generated."
    },
    matchingSummary: [
      {
        title: "Current match state",
        status: matchState === "high" ? "Matched" : "Flagged",
        copy: signals
      },
      {
        title: "Data source",
        status: "Consistent",
        copy: "This row was loaded from the live Zoho ticket feed."
      }
    ]
  };
}

function buildLiveSnapshot(payload) {
  const root = Array.isArray(payload) ? payload[0] : payload;

  if (!root || !Array.isArray(root.tickets)) {
    throw new Error("the response did not contain a tickets array");
  }

  const cases = root.tickets.map(mapZohoTicketToCase);
  const generatedAt = root.generatedAt || new Date().toISOString();

  return {
    mode: "live",
    message: cases.length
      ? `Zoho feed connected. ${cases.length} live ticket${cases.length === 1 ? "" : "s"} replaced the dummy records. Tickets are shown as temporary case rows until Master Case matching is completed.`
      : "Zoho feed connected successfully, but it returned 0 tickets. Dummy records were removed.",
    generatedAt,
    cases,
    unmatched: [],
    ingestion: [
      {
        source: "Zoho Desk",
        status: "Connected",
        statusClass: "green",
        lastEvent: formatTicketDate(generatedAt),
        delay: "Auto refresh",
        reference: `${cases.length} ticket${cases.length === 1 ? "" : "s"}`,
        method: "n8n dashboard feed"
      },
      {
        source: "WhatsApp Business API",
        status: "Not connected",
        statusClass: "grey",
        lastEvent: "—",
        delay: "—",
        reference: "—",
        method: "Webhook"
      },
      {
        source: "AI Case Suggestion",
        status: "Not connected",
        statusClass: "grey",
        lastEvent: "—",
        delay: "—",
        reference: "—",
        method: "n8n + AI model"
      },
      {
        source: "Velox Call Events",
        status: "Webhook tested",
        statusClass: "amber",
        lastEvent: "Test completed",
        delay: "—",
        reference: "—",
        method: "Webhook metadata"
      }
    ]
  };
}

async function fetchZohoSnapshot() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(
      buildApiUrl(appConfig.endpoints.zohoTickets),
      {
        method: "GET",
        headers: {
          Accept: "application/json"
        },
        cache: "no-store",
        signal: controller.signal
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    return buildLiveSnapshot(payload);
  } finally {
    clearTimeout(timeout);
  }
}

const dataRepository = {
  async getDashboardSnapshot() {
    try {
      return await fetchZohoSnapshot();
    } catch (error) {
      console.warn("Live Zoho feed unavailable. Using dummy data.", error);

      const reason =
        error?.name === "AbortError"
          ? "request timed out"
          : error?.message || "connection error";

      return cloneDummySnapshot(reason);
    }
  }
};

const state = {
  cases: [],
  unmatched: [],
  ingestion: [],
  selectedCaseId: null,
  activeTimelineChannel: "all",
  dataMode: "dummy",
  dataMessage: "Waiting for data.",
  generatedAt: null
};

const elements = {
  sidebar: document.getElementById("sidebar"),
  menuButton: document.getElementById("menuButton"),
  globalSearch: document.getElementById("globalSearch"),
  toast: document.getElementById("toast"),
  environmentBadge: document.getElementById("environmentBadge"),
  dataSourceNotice: document.getElementById("dataSourceNotice"),
  dataSourceIcon: document.getElementById("dataSourceIcon"),
  dataSourceBadge: document.getElementById("dataSourceBadge"),
  dataSourceMessage: document.getElementById("dataSourceMessage"),
  navCaseCount: document.getElementById("navCaseCount"),
  navUnmatchedCount: document.getElementById("navUnmatchedCount"),
  lastUpdatedText: document.getElementById("lastUpdatedText"),
  ingestionUpdatedText: document.getElementById("ingestionUpdatedText"),
  kpiGrid: document.getElementById("kpiGrid"),
  ingestionKpis: document.getElementById("ingestionKpis"),
  recentCases: document.getElementById("recentCases"),
  sourceHealth: document.getElementById("sourceHealth"),
  caseSearch: document.getElementById("caseSearch"),
  caseTypeFilter: document.getElementById("caseTypeFilter"),
  matchFilter: document.getElementById("matchFilter"),
  caseCount: document.getElementById("caseCount"),
  caseTableBody: document.getElementById("caseTableBody"),
  unmatchedTableBody: document.getElementById("unmatchedTableBody"),
  unmatchedSummary: document.getElementById("unmatchedSummary"),
  ingestionTableBody: document.getElementById("ingestionTableBody"),
  backButton: document.getElementById("backButton"),
  caseHero: document.getElementById("caseHero"),
  timelineContainer: document.getElementById("timelineContainer"),
  timelineCount: document.getElementById("timelineCount"),
  ticketTableBody: document.getElementById("ticketTableBody"),
  matchingTableBody: document.getElementById("matchingTableBody"),
  aiPanel: document.getElementById("aiPanel"),
  caseRecord: document.getElementById("caseRecord"),
  matchingSummary: document.getElementById("matchingSummary")
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message) {
  clearTimeout(showToast.timer);
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  showToast.timer = setTimeout(() => elements.toast.classList.remove("show"), 2600);
}

function showView(viewName) {
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("active", view.id === `view-${viewName}`);
  });

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.view === viewName);
  });

  elements.sidebar.classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function formatCurrentTime() {
  return new Intl.DateTimeFormat("en-SG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Singapore"
  }).format(new Date());
}

function renderDataSourceStatus() {
  const isLive = state.dataMode === "live";

  elements.environmentBadge.textContent = isLive
    ? "Live Zoho Data"
    : "Dummy Data";

  elements.dataSourceNotice.classList.toggle(
    "warning-notice",
    !isLive
  );

  elements.dataSourceIcon.textContent = isLive ? "✓" : "!";
  elements.dataSourceBadge.textContent = isLive
    ? "LIVE DATA"
    : "DUMMY DATA";

  elements.dataSourceMessage.textContent = ` ${state.dataMessage}`;
}

function renderKpis() {
  const openCases = state.cases.filter((item) => item.status === "Open").length;
  const interactionCount = state.cases.reduce((sum, item) => sum + item.interactions.length, 0);
  const highMatches = state.cases.filter((item) => item.matchState === "high").length;
  const ticketCount = state.cases.reduce((sum, item) => sum + item.tickets.length, 0);

  const cards = [
    { label: "Open Master Cases", value: openCases, foot: `Across ${ticketCount} linked tickets` },
    { label: "Visible Interactions", value: interactionCount, foot: "Email · WhatsApp · Documents" },
    {
      label: "High-confidence Cases",
      value: highMatches,
      foot: state.dataMode === "live"
        ? "Calculated from live Zoho ticket fields"
        : "Dummy grouping preview"
    },
    { label: "Unmatched / Uncertain", value: state.unmatched.length, foot: "Visible for separate admin resolution" }
  ];

  elements.kpiGrid.innerHTML = cards.map((card) => `
    <div class="card kpi-card">
      <div class="kpi-label">${escapeHtml(card.label)}</div>
      <div class="kpi-value">${escapeHtml(card.value)}</div>
      <div class="kpi-foot">${escapeHtml(card.foot)}</div>
    </div>
  `).join("");
}

function renderRecentCases() {
  const recent = state.cases.slice(0, 3);
  elements.recentCases.innerHTML = recent.map((item) => `
    <div class="recent-item" data-case-id="${escapeHtml(item.id)}" tabindex="0" role="button">
      <span class="recent-strip ${item.matchState === "flagged" ? "flagged" : ""}"></span>
      <div>
        <div class="recent-title">${escapeHtml(item.id)} · ${escapeHtml(item.patient)} <span class="pill ${item.isDummy ? "amber" : "green"}">${item.isDummy ? "DUMMY" : "LIVE"}</span></div>
        <div class="recent-subtitle">${escapeHtml(item.latestInteractionNote)}</div>
      </div>
      <div class="recent-side">
        <div class="recent-score">${escapeHtml(item.matchConfidence)}%</div>
        <div class="recent-score-label">match confidence</div>
      </div>
    </div>
  `).join("");
}

function renderSourceHealth() {
  elements.sourceHealth.innerHTML = state.ingestion.map((source) => {
    let dotClass = "";
    if (source.statusClass === "amber") dotClass = "warning";
    if (source.statusClass === "grey") dotClass = "planned";

    return `
      <div class="source-row">
        <span class="source-dot ${dotClass}"></span>
        <span class="source-name">${escapeHtml(source.source)}</span>
        <span class="source-status">${escapeHtml(source.status)}</span>
      </div>
    `;
  }).join("");
}

function getChannelLabel(channel) {
  const labels = {
    email: "@",
    whatsapp: "WA",
    document: "D"
  };
  return labels[channel] ?? "?";
}

function renderCaseTable() {
  const query = elements.caseSearch.value.trim().toLowerCase();
  const type = elements.caseTypeFilter.value;
  const match = elements.matchFilter.value;

  const filtered = state.cases.filter((item) => {
    const searchable = [
      item.id,
      item.patient,
      item.phone,
      item.email,
      item.location,
      item.caseTypeLabel,
      item.tickets.map((ticket) => ticket.id).join(" ")
    ].join(" ").toLowerCase();

    return searchable.includes(query)
      && (type === "all" || item.caseType === type)
      && (match === "all" || item.matchState === match);
  });

  elements.caseCount.textContent = filtered.length;

  if (!filtered.length) {
    elements.caseTableBody.innerHTML = `<tr><td colspan="7"><div class="empty-state">No cases match the current filters.</div></td></tr>`;
    return;
  }

  elements.caseTableBody.innerHTML = filtered.map((item) => `
    <tr data-case-id="${escapeHtml(item.id)}">
      <td>
        <div class="case-link">${escapeHtml(item.id)} <span class="pill ${item.isDummy ? "amber" : "green"}">${item.isDummy ? "DUMMY" : "LIVE"}</span></div>
        <div class="primary-text">${escapeHtml(item.patient)}</div>
        <div class="secondary-text">${escapeHtml(item.location)}</div>
      </td>
      <td>
        <div class="primary-text">${escapeHtml(item.caseTypeLabel)}</div>
        <div class="secondary-text">${escapeHtml(item.caseDescription)}</div>
      </td>
      <td>
        <div class="primary-text">${item.tickets.length} tickets</div>
        <div class="secondary-text">${escapeHtml(item.tickets.map((ticket) => ticket.id).join(" · "))}</div>
      </td>
      <td>
        <div class="channel-stack">
          ${item.channels.map((channel) => `<span class="channel-icon" title="${escapeHtml(channel)}">${escapeHtml(getChannelLabel(channel))}</span>`).join("")}
        </div>
      </td>
      <td>
        <div class="primary-text">${escapeHtml(item.latestInteraction)}</div>
        <div class="secondary-text">${escapeHtml(item.latestInteractionNote)}</div>
      </td>
      <td><span class="pill ${item.matchState === "high" ? "green" : "amber"}">${item.matchState === "high" ? "High" : "Flagged"} · ${escapeHtml(item.matchConfidence)}%</span></td>
      <td>
        <div class="primary-text">${escapeHtml(item.updatedAt)}</div>
        <div class="secondary-text">${escapeHtml(item.updatedTime)}</div>
      </td>
    </tr>
  `).join("");
}

function renderUnmatched() {
  elements.navUnmatchedCount.textContent = state.unmatched.length;
  elements.unmatchedSummary.textContent = `${state.unmatched.length} items`;

  elements.unmatchedTableBody.innerHTML = state.unmatched.map((item) => `
    <tr>
      <td><div class="case-link">${escapeHtml(item.id)}</div><div class="secondary-text">${escapeHtml(item.source)}</div></td>
      <td>${escapeHtml(item.sender)}</td>
      <td>${escapeHtml(item.preview)}</td>
      <td>${item.possibleCase === "None" ? "None" : `<span class="case-link">${escapeHtml(item.possibleCase)}</span>`}</td>
      <td><span class="pill ${item.confidence >= 60 ? "amber" : "grey"}">${escapeHtml(item.confidence)}%</span></td>
      <td>${escapeHtml(item.signals)}</td>
      <td>${escapeHtml(item.received)}</td>
    </tr>
  `).join("");
}

function renderIngestion() {
  const activeSources = state.ingestion.filter((item) => item.statusClass === "green").length;
  const cards = [
    { label: "Data Sources", value: state.ingestion.length, foot: "Email · WhatsApp · AI · Velox" },
    { label: "Ready Sources", value: activeSources, foot: "Email and WhatsApp" },
    { label: "Average Processing Delay", value: "11s", foot: "Target: under 1 minute" },
    { label: "Failed Events", value: 0, foot: "Current integration status" }
  ];

  elements.ingestionKpis.innerHTML = cards.map((card) => `
    <div class="card kpi-card">
      <div class="kpi-label">${escapeHtml(card.label)}</div>
      <div class="kpi-value">${escapeHtml(card.value)}</div>
      <div class="kpi-foot">${escapeHtml(card.foot)}</div>
    </div>
  `).join("");

  elements.ingestionTableBody.innerHTML = state.ingestion.map((item) => `
    <tr>
      <td><div class="primary-text">${escapeHtml(item.source)}</div></td>
      <td><span class="pill ${escapeHtml(item.statusClass)}">${escapeHtml(item.status)}</span></td>
      <td>${escapeHtml(item.lastEvent)}</td>
      <td>${escapeHtml(item.delay)}</td>
      <td>${escapeHtml(item.reference)}</td>
      <td>${escapeHtml(item.method)}</td>
    </tr>
  `).join("");
}

function sortInteractions(interactions) {
  return [...interactions].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function renderCaseDetail(caseItem) {
  state.selectedCaseId = caseItem.id;
  state.activeTimelineChannel = "all";

  elements.caseHero.innerHTML = `
    <div class="hero-top">
      <div>
        <div class="hero-title-row">
          <h1>${escapeHtml(caseItem.patient)}</h1>
          <span class="pill ${caseItem.isDummy ? "amber" : "green"}">${caseItem.isDummy ? "DUMMY DATA" : "LIVE DATA"}</span>
          <span class="pill blue">${escapeHtml(caseItem.status)}</span>
          <span class="pill ${caseItem.matchState === "high" ? "green" : "amber"}">${caseItem.matchState === "high" ? "High-confidence" : "Flagged match"}</span>
        </div>
        <div class="hero-subtitle">Master Case <strong>${escapeHtml(caseItem.id)}</strong> · ${escapeHtml(caseItem.caseTypeLabel)} · ${escapeHtml(caseItem.location)}</div>
      </div>
      <span class="pill ${caseItem.matchState === "high" ? "green" : "amber"}">Overall match ${escapeHtml(caseItem.matchConfidence)}%</span>
    </div>
    <div class="hero-grid">
      <div><div class="info-label">Client</div><div class="info-value">${escapeHtml(caseItem.client)}</div></div>
      <div><div class="info-label">Patient Phone</div><div class="info-value">${escapeHtml(caseItem.phone)}</div></div>
      <div><div class="info-label">Patient Email</div><div class="info-value">${escapeHtml(caseItem.email)}</div></div>
      <div><div class="info-label">Hospital</div><div class="info-value">${escapeHtml(caseItem.hospital)}</div></div>
      <div><div class="info-label">Admission / Visit</div><div class="info-value">${escapeHtml(caseItem.admissionDate)}</div></div>
      <div><div class="info-label">Linked Tickets</div><div class="info-value">${escapeHtml(caseItem.tickets.map((ticket) => ticket.id).join(" · "))}</div></div>
    </div>
  `;

  renderTimeline(caseItem);

  elements.ticketTableBody.innerHTML = caseItem.tickets.map((ticket) => `
    <tr>
      <td>${ticket.webUrl
      ? `<a class="case-link" href="${escapeHtml(ticket.webUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(ticket.id)}</a>`
      : `<span class="case-link">${escapeHtml(ticket.id)}</span>`
    }</td>
      <td>${escapeHtml(ticket.party)}</td>
      <td>${escapeHtml(ticket.subject)}</td>
      <td><span class="pill blue">${escapeHtml(ticket.status)}</span></td>
      <td>${escapeHtml(ticket.createdAt)}</td>
    </tr>
  `).join("");

  elements.matchingTableBody.innerHTML = sortInteractions(caseItem.interactions).map((item) => `
    <tr>
      <td>${escapeHtml(item.id)}</td>
      <td><strong>${escapeHtml(item.confidence)}%</strong></td>
      <td>${escapeHtml(getStrongIdentifiers(item, caseItem))}</td>
      <td>${escapeHtml(item.signals)}</td>
      <td><span class="pill ${item.confidence >= 90 ? "green" : "amber"}">${item.confidence >= 90 ? "Auto-linked" : "Flagged"}</span></td>
    </tr>
  `).join("");

  elements.aiPanel.innerHTML = `
    <div class="ai-section">
      <div class="ai-label">Case summary</div>
      <div class="ai-copy">${escapeHtml(caseItem.ai.summary)}</div>
    </div>
    <div class="ai-section">
      <div class="ai-label">Latest update</div>
      <div class="ai-copy emphasis">${escapeHtml(caseItem.ai.latestUpdate)}</div>
    </div>
    <div class="ai-section">
      <div class="ai-label">Pending items</div>
      <ul class="pending-list">${caseItem.ai.pendingItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </div>
    <div class="ai-section">
      <div class="ai-label">Suggested next step</div>
      <div class="ai-copy emphasis">${escapeHtml(caseItem.ai.nextStep)}</div>
    </div>
    <div class="ai-section">
      <div class="ai-label">Suggested reply</div>
      <div class="ai-copy suggested-reply">${escapeHtml(caseItem.ai.suggestedReply)}</div>
    </div>
  `;

  const recordRows = [
    ["Master Case ID", caseItem.id],
    ["Case Status", caseItem.status],
    ["Contact ID", caseItem.contactId],
    ["Phone", caseItem.phone],
    ["Email", caseItem.email],
    ["Interactions", caseItem.interactions.length],
    ["Linked Tickets", caseItem.tickets.length]
  ];

  elements.caseRecord.innerHTML = recordRows.map(([label, value]) => `
    <div class="record-row">
      <span class="record-label">${escapeHtml(label)}</span>
      <span class="record-value">${escapeHtml(value)}</span>
    </div>
  `).join("");

  elements.matchingSummary.innerHTML = caseItem.matchingSummary.map((item) => `
    <div class="match-box">
      <div class="match-box-head">
        <span class="match-box-title">${escapeHtml(item.title)}</span>
        <span class="pill ${item.status === "Matched" || item.status === "Consistent" ? "green" : "amber"}">${escapeHtml(item.status)}</span>
      </div>
      <div class="match-box-copy">${escapeHtml(item.copy)}</div>
    </div>
  `).join("");

  activateTab("timeline");
  document.querySelectorAll("#timelineFilters .segment").forEach((segment) => {
    segment.classList.toggle("active", segment.dataset.channel === "all");
  });
}

function getStrongIdentifiers(interaction, caseItem) {
  if (interaction.source.includes("Zoho")) return "Ticket ID / thread reference";
  if (interaction.channel === "whatsapp") return `Phone ${caseItem.phone}`;
  if (interaction.channel === "document") return "Parent ticket relationship";
  return "Case reference";
}

function renderTimeline(caseItem) {
  const interactions = sortInteractions(caseItem.interactions);
  const filtered = state.activeTimelineChannel === "all"
    ? interactions
    : interactions.filter((item) => item.channel === state.activeTimelineChannel);

  elements.timelineCount.textContent = filtered.length;

  if (!filtered.length) {
    elements.timelineContainer.innerHTML = `<div class="empty-state">No ${escapeHtml(state.activeTimelineChannel)} interactions found.</div>`;
    return;
  }

  elements.timelineContainer.innerHTML = filtered.map((item) => `
    <article class="timeline-entry" data-channel="${escapeHtml(item.channel)}">
      <div class="timeline-node ${escapeHtml(item.channel)}">${escapeHtml(getChannelLabel(item.channel))}</div>
      <div class="timeline-card">
        <div class="timeline-meta">
          <span class="timeline-channel">${escapeHtml(formatChannelName(item.channel))} · ${escapeHtml(item.party)}</span>
          <span class="timeline-time">${escapeHtml(item.time)}</span>
          <span class="timeline-source">${escapeHtml(item.source)} · ${escapeHtml(item.id)}</span>
        </div>
        <div class="timeline-title">${escapeHtml(item.title)}</div>
        <div class="timeline-preview">${escapeHtml(item.content)}</div>
        ${item.attachments.length ? `<div class="attachment-list">${item.attachments.map((file) => `<span class="attachment-chip">${escapeHtml(file)}</span>`).join("")}</div>` : ""}
        <div class="match-line">
          <span class="match-signals">${escapeHtml(item.signals)}</span>
          <span class="pill ${item.confidence >= 90 ? "green" : "amber"}">${escapeHtml(item.confidence)}%</span>
        </div>
      </div>
    </article>
  `).join("");
}

function formatChannelName(channel) {
  const names = {
    email: "Email",
    whatsapp: "WhatsApp",
    document: "Document"
  };
  return names[channel] ?? channel;
}

function activateTab(tabName) {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabName);
  });
  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `tab-${tabName}`);
  });
}

function openCase(caseId) {
  const selectedCase = state.cases.find((item) => item.id === caseId);
  if (!selectedCase) {
    showToast("The selected case could not be found.");
    return;
  }

  renderCaseDetail(selectedCase);
  showView("detail");
}

function handleGlobalSearch() {
  const query = elements.globalSearch.value.trim().toLowerCase();
  if (!query) return;

  const matchingCase = state.cases.find((item) => {
    const searchable = [
      item.id,
      item.patient,
      item.phone,
      item.email,
      ...item.tickets.map((ticket) => ticket.id)
    ].join(" ").toLowerCase();
    return searchable.includes(query);
  });

  if (matchingCase) {
    openCase(matchingCase.id);
    elements.globalSearch.value = "";
    return;
  }

  showToast("No Master Case matched that search.");
}

function bindEvents() {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", () => showView(item.dataset.view));
  });

  elements.menuButton.addEventListener("click", () => {
    elements.sidebar.classList.toggle("open");
  });

  elements.backButton.addEventListener("click", () => showView("cases"));

  elements.caseSearch.addEventListener("input", renderCaseTable);
  elements.caseTypeFilter.addEventListener("change", renderCaseTable);
  elements.matchFilter.addEventListener("change", renderCaseTable);

  elements.globalSearch.addEventListener("keydown", (event) => {
    if (event.key === "Enter") handleGlobalSearch();
  });

  document.addEventListener("click", (event) => {
    const caseTarget = event.target.closest("[data-case-id]");
    if (caseTarget) openCase(caseTarget.dataset.caseId);

    const tab = event.target.closest(".tab");
    if (tab) activateTab(tab.dataset.tab);

    const segment = event.target.closest("#timelineFilters .segment");
    if (segment && state.selectedCaseId) {
      document.querySelectorAll("#timelineFilters .segment").forEach((item) => item.classList.remove("active"));
      segment.classList.add("active");
      state.activeTimelineChannel = segment.dataset.channel;
      const selectedCase = state.cases.find((item) => item.id === state.selectedCaseId);
      if (selectedCase) renderTimeline(selectedCase);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") elements.sidebar.classList.remove("open");
    const target = event.target.closest?.("[data-case-id]");
    if (target && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      openCase(target.dataset.caseId);
    }
  });
}

function renderDashboard() {
  elements.navCaseCount.textContent = state.cases.length;
  elements.lastUpdatedText.textContent = state.generatedAt
    ? formatTicketDate(state.generatedAt)
    : formatCurrentTime();
  elements.ingestionUpdatedText.textContent = formatCurrentTime();

  renderDataSourceStatus();
  renderKpis();
  renderRecentCases();
  renderSourceHealth();
  renderCaseTable();
  renderUnmatched();
  renderIngestion();

  if (state.selectedCaseId) {
    const selectedCase = state.cases.find(
      (item) => item.id === state.selectedCaseId
    );

    if (selectedCase) {
      renderCaseDetail(selectedCase);
    } else {
      state.selectedCaseId = null;
      showView("cases");
    }
  }
}

async function refreshDashboardData() {
  const snapshot = await dataRepository.getDashboardSnapshot();

  state.cases = snapshot.cases;
  state.unmatched = snapshot.unmatched;
  state.ingestion = snapshot.ingestion;
  state.dataMode = snapshot.mode;
  state.dataMessage = snapshot.message;
  state.generatedAt = snapshot.generatedAt;

  renderDashboard();
}

async function initializeDashboard() {
  try {
    bindEvents();
    await refreshDashboardData();

    window.setInterval(() => {
      refreshDashboardData().catch((error) => {
        console.error("Automatic dashboard refresh failed:", error);
      });
    }, appConfig.zohoRefreshIntervalMs);
  } catch (error) {
    console.error("Dashboard initialization failed:", error);
    showToast("Unable to load the dashboard data.");
  }
}

initializeDashboard();

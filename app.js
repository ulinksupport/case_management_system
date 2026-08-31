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
    zohoTickets:
      "/webhook/zoho-tickets-feed",

    zohoTicketDetail:
      "/webhook/zoho-ticket-detail",

    aiCaseReport:
      "/webhook/ai-case-report",

    aiMasterChronology:
      "/webhook/ai-master-chronology",

    veloxTranscripts:
      "/webhook/velox-transcripts-feed",

    veloxManualLink:
      "/webhook/manually-link-case"
  },

  zohoRefreshIntervalMs: 15000
};

const authElements = {
  loginScreen:
    document.getElementById("loginScreen"),

  loginForm:
    document.getElementById("loginForm"),

  loginPassword:
    document.getElementById("loginPassword"),

  loginError:
    document.getElementById("loginError"),

  appShell:
    document.getElementById("appShell"),

  signoutButton:
    document.getElementById("signoutButton")
};

async function checkSession() {
  const response =
    await fetch("/api/session", {
      method: "GET",
      cache: "no-store"
    });

  const result =
    await response.json();

  return Boolean(
    result.authenticated
  );
}

function showLogin() {
  authElements.loginScreen.hidden =
    false;

  authElements.appShell.hidden =
    true;
}

function showApp() {
  authElements.loginScreen.hidden =
    true;

  authElements.appShell.hidden =
    false;
}

async function handleLogin(event) {
  event.preventDefault();

  authElements.loginError.textContent =
    "";

  const password =
    authElements.loginPassword.value;

  const response =
    await fetch("/api/login", {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json"
      },

      body: JSON.stringify({
        password
      })
    });

  const result =
    await response.json();

  if (
    !response.ok ||
    !result.success
  ) {
    authElements.loginError.textContent =
      result.message ||
      "Unable to sign in.";

    return;
  }

  authElements.loginPassword.value = "";

  const authenticated =
    await checkSession();

  if (!authenticated) {
    authElements.loginError.textContent =
      "Login succeeded but the session could not be created.";

    showLogin();
    return;
  }

  showApp();
  await initializeDashboard();
}

authElements.loginForm.addEventListener(
  "submit",
  handleLogin
);

async function handleSignout() {
  await fetch("/api/logout", {
    method: "POST"
  });

  showLogin();

  authElements.loginPassword.focus();
}

authElements.signoutButton.addEventListener(
  "click",
  handleSignout
);

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
  const updatedAt =
    ticket.zohoUpdatedAt ||
    ticket.updatedAt ||
    createdAt;
  const rawMatchState = String(
    ticket.matchState ?? ""
  )
    .trim()
    .toLowerCase();

  const rawMatchConfidence =
    ticket.matchConfidence;

  const hasMatchConfidence =
    rawMatchConfidence !== null &&
    rawMatchConfidence !== undefined &&
    String(rawMatchConfidence).trim() !== "" &&
    Number.isFinite(
      Number(rawMatchConfidence)
    );

  const confidence = hasMatchConfidence
    ? Math.max(
      0,
      Math.min(
        100,
        Number(rawMatchConfidence)
      )
    )
    : null;

  let matchState = "not-evaluated";

  if (
    rawMatchState === "matched" ||
    rawMatchState === "linked" ||
    rawMatchState === "high"
  ) {
    matchState = "high";
  } else if (
    rawMatchState === "flagged" ||
    rawMatchState === "needs-review" ||
    rawMatchState === "review" ||
    rawMatchState === "conflict" ||
    rawMatchState === "uncertain"
  ) {
    matchState = "flagged";
  }

  const displayTicketId =
    ticketNumber ? `ZD-${ticketNumber}` : ticketId || `ZD-${index + 1}`;

  const masterCaseId =
    String(ticket.masterCaseId ?? "").trim() ||
    `ZOHO-${ticketNumber || ticketId || index + 1}`;

  const signals =
    String(ticket.signals ?? "").trim() ||
    "No matching evidence has been generated yet.";

  const aiSuggestion =
    ticket.aiSuggestion &&
      ticket.aiSuggestion.status === "ready"
      ? ticket.aiSuggestion
      : null;

  const ai = aiSuggestion
    ? {
      status: "ready",

      summary:
        String(aiSuggestion.summary ?? "").trim() ||
        "No AI summary was returned.",

      latestUpdate:
        String(aiSuggestion.latestUpdate ?? "").trim() ||
        "No latest update was returned.",

      pendingItems:
        Array.isArray(aiSuggestion.pendingItems)
          ? aiSuggestion.pendingItems
            .map((item) => String(item ?? "").trim())
            .filter(Boolean)
          : [],

      nextStep:
        String(aiSuggestion.nextStep ?? "").trim() ||
        "No next step was returned.",

      suggestedReply:
        String(aiSuggestion.suggestedReply ?? "").trim() ||
        "No suggested reply was returned.",

      riskFlags:
        Array.isArray(aiSuggestion.riskFlags)
          ? aiSuggestion.riskFlags
            .map((item) => String(item ?? "").trim())
            .filter(Boolean)
          : [],

      confidence: Math.max(
        0,
        Math.min(
          100,
          Number(aiSuggestion.confidence ?? 0) || 0
        )
      ),

      generatedAt:
        String(aiSuggestion.generatedAt ?? "").trim(),

      model:
        String(aiSuggestion.model ?? "").trim()
    }
    : {
      status: "pending",

      summary:
        "AI guidance has not been generated for this live ticket yet.",

      latestUpdate: subject,

      pendingItems: [
        "Waiting for the AI case-guidance workflow"
      ],

      nextStep:
        "Review the live Zoho ticket in the approved operational system.",

      suggestedReply:
        "No suggested reply has been generated.",

      riskFlags: [],

      confidence: 0,

      generatedAt: "",

      model: ""
    };

  return {
    id: masterCaseId,

    // Long internal Zoho ID used by the detail API.
    zohoTicketId: ticketId,

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
    sourceUpdatedAt: updatedAt,
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
    ai,
    matchingSummary: [
      {
        title: "Master Case link status",
        status: getLinkStatusLabel(matchState),
        statusClass: getLinkStatusClass(matchState),
        copy:
          matchState === "not-evaluated"
            ? "The Master Case linking engine has not evaluated this ticket yet."
            : signals
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

  const sortedTickets = [...root.tickets].sort((a, b) => {
    const aTime = new Date(
      a.zohoUpdatedAt ||
      a.updatedAt ||
      a.createdAt ||
      0
    ).getTime();

    const bTime = new Date(
      b.zohoUpdatedAt ||
      b.updatedAt ||
      b.createdAt ||
      0
    ).getTime();

    return bTime - aTime;
  });

  const cases = sortedTickets.map(mapZohoTicketToCase);
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

async function fetchVeloxTranscripts() {
  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    30000
  );

  try {
    const response = await fetch(
      buildApiUrl(
        appConfig.endpoints.veloxTranscripts
      ),
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
      throw new Error(
        `Velox feed returned HTTP ${response.status}`
      );
    }

    const payload = await response.json();

    const root = Array.isArray(payload)
      ? payload[0]
      : payload;

    if (
      !root?.success ||
      !Array.isArray(root.transcripts)
    ) {
      throw new Error(
        "Velox response did not contain a transcripts array."
      );
    }

    return root.transcripts
      .map((item) => ({
        id:
          String(item.id ?? "").trim(),

        fileName:
          String(item.fileName ?? "").trim(),

        turboScribeZipName:
          String(
            item.turboScribeZipName ?? ""
          ).trim(),

        filePath:
          String(item.filePath ?? "").trim(),

        participant:
          String(item.participant ?? "").trim(),

        phone:
          String(item.phone ?? "").trim(),

        email:
          String(item.email ?? "").trim(),

        callDate:
          String(item.callDate ?? "").trim(),

        linkedMasterCase:
          String(
            item.linkedMasterCase ?? ""
          ).trim(),

        linkedZohoTicket:
          String(
            item.linkedZohoTicket ?? ""
          ).trim(),

        updatedAt:
          String(item.updatedAt ?? "").trim(),

        source:
          String(
            item.source ?? "TurboScribe"
          ).trim(),

        transcript:
          String(
            item.transcript ?? ""
          ).trim(),

        pdfPages:
          item.pdfPages ?? null,

        linkStatus:
          String(
            item.linkStatus ??
            "not_evaluated"
          ).trim(),

        linkMethod:
          String(
            item.linkMethod ?? ""
          ).trim(),

        linkReason:
          String(
            item.linkReason ?? ""
          ).trim()
      }))
      .filter(
        (item) =>
          item.id &&
          item.fileName
      )
      .sort((a, b) => {
        const aTime =
          new Date(
            a.callDate ||
            a.updatedAt ||
            0
          ).getTime();

        const bTime =
          new Date(
            b.callDate ||
            b.updatedAt ||
            0
          ).getTime();

        return bTime - aTime;
      });
  } finally {
    clearTimeout(timeout);
  }
}

function mapZohoDetailEventToInteraction(event) {
  const eventType = String(
    event.eventType ?? ""
  ).toLowerCase();

  const direction = String(
    event.direction ?? ""
  ).toLowerCase();

  const isComment =
    eventType === "comment" ||
    event.channel === "internal_comment";

  const channel = isComment
    ? "comment"
    : normalizeChannel(event.channel);

  let party = "Unknown";

  if (isComment) {
    party =
      String(event.from ?? "").trim() ||
      "Internal user";
  } else if (direction === "out") {
    party =
      String(event.from ?? "").trim() ||
      "Ulink Assist";
  } else {
    party =
      String(event.from ?? "").trim() ||
      "External sender";
  }

  let fallbackTitle = "Zoho activity";

  if (isComment) {
    fallbackTitle = event.isPublic
      ? "Public comment"
      : "Internal comment";
  } else if (direction === "out") {
    fallbackTitle = "Outgoing email";
  } else if (direction === "in") {
    fallbackTitle = "Incoming email";
  }

  const attachmentFiles = Array.isArray(
    event.attachments
  )
    ? event.attachments
      .map((file) => ({
        name:
          String(
            file?.name ??
            file?.fileName ??
            "Unnamed file"
          ).trim(),

        id:
          String(
            file?.id ??
            file?.attachmentId ??
            ""
          ).trim(),

        contentType:
          String(
            file?.contentType ??
            file?.mimeType ??
            ""
          ).trim(),

        size:
          file?.size ??
          file?.fileSize ??
          null,

        url:
          String(
            file?.downloadUrl ??
            file?.url ??
            file?.href ??
            ""
          ).trim()
      }))
      .filter((file) => file.name)
    : [];

  const attachmentNames =
    attachmentFiles.map(
      (file) => file.name
    );

  return {
    id: String(event.id ?? ""),

    channel,

    party,

    time: formatTicketTime(
      event.timestamp
    ),

    timestamp: String(
      event.timestamp ?? ""
    ),

    source: isComment
      ? "Zoho Desk comment"
      : "Zoho Desk email",

    title:
      String(event.title ?? "").trim() ||
      fallbackTitle,

    // Full main email or comment content.
    content:
      String(event.content ?? "").trim() ||
      "No readable content was returned.",

    aiSummary:
      String(
        event.aiSummary ?? ""
      ).trim(),

    direction,

    eventType: isComment
      ? "comment"
      : "email",

    status: String(
      event.status ?? ""
    ),

    isPublic:
      Boolean(event.isPublic),

    isDescriptionThread:
      Boolean(event.isDescriptionThread),

    // Matching confidence does not apply
    // to individual Zoho timeline events.
    confidence: null,

    signals: isComment
      ? "Internal Zoho Desk activity"
      : direction === "out"
        ? "Outgoing Zoho Desk email"
        : "Incoming Zoho Desk email",

    attachments: attachmentNames,
    attachmentFiles
  };
}

async function fetchZohoTicketDetail(
  ticketId
) {
  const normalizedTicketId =
    String(ticketId ?? "").trim();

  if (!/^\d{10,30}$/.test(
    normalizedTicketId
  )) {
    throw new Error(
      "A valid internal Zoho ticket ID is required."
    );
  }

  const controller =
    new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    45000
  );

  try {
    const endpoint =
      `${appConfig.endpoints.zohoTicketDetail}` +
      `?ticketId=${encodeURIComponent(
        normalizedTicketId
      )}`;

    const response = await fetch(
      buildApiUrl(endpoint),
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
      throw new Error(
        `Ticket history request returned HTTP ${response.status}`
      );
    }

    const payload =
      await response.json();

    const root = Array.isArray(payload)
      ? payload[0]
      : payload;

    if (
      !root?.success ||
      !Array.isArray(root.events)
    ) {
      throw new Error(
        "The ticket history response did not contain an events array."
      );
    }

    return {
      ticket: root.ticket ?? null,

      totalThreads: Number(
        root.totalThreads ?? 0
      ),

      totalComments: Number(
        root.totalComments ?? 0
      ),

      interactions: root.events
        .map(
          mapZohoDetailEventToInteraction
        )
        .filter(
          (interaction) =>
            interaction.id &&
            interaction.timestamp
        )
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchAiMasterChronology(
  ticketId
) {
  const normalizedTicketId =
    String(ticketId ?? "").trim();

  if (!/^\d{10,30}$/.test(
    normalizedTicketId
  )) {
    throw new Error(
      "A valid internal Zoho ticket ID is required."
    );
  }

  const controller =
    new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    60000
  );

  try {
    const endpoint =
      `${appConfig.endpoints.aiMasterChronology}` +
      `?ticketId=${encodeURIComponent(
        normalizedTicketId
      )}`;

    const response = await fetch(
      buildApiUrl(endpoint),
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
      throw new Error(
        `Master chronology returned HTTP ${response.status}`
      );
    }

    const payload =
      await response.json();

    const root =
      Array.isArray(payload)
        ? payload[0]
        : payload;

    if (
      !root?.success ||
      !Array.isArray(root.chronology)
    ) {
      throw new Error(
        "Master chronology response was invalid."
      );
    }

    return root;
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

  veloxTranscripts: [],
  selectedVeloxId: null,

  selectedCaseId: null,
  activeTimelineChannel: "all",
  dataMode: "dummy",
  dataMessage: "Waiting for data.",
  generatedAt: null,

  // Used for silent background updates.
  snapshotSignature: "",
  refreshInProgress: false,

  detailCache: new Map(),
  detailRequestSequence: 0,

  aiCaseReports: new Map(),
  aiCaseReportRequestSequence: 0,

  aiMasterChronologies: new Map(),
  aiMasterChronologyRequestSequence: 0,

  // Keep Ops UI choices during background refresh.
  preservedVeloxSearch: "",
  preservedVeloxSelection: "",
  expandedTimelineIds: new Set()
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
  aiSummaryTimeline:
    document.getElementById("aiSummaryTimeline"),
  timelineCount: document.getElementById("timelineCount"),
  ticketTableBody: document.getElementById("ticketTableBody"),
  matchingTableBody: document.getElementById("matchingTableBody"),
  aiPanel: document.getElementById("aiPanel"),
  caseRecord: document.getElementById("caseRecord"),

  caseMediaList:
    document.getElementById("caseMediaList"),

  caseMediaCount:
    document.getElementById("caseMediaCount"),

  matchingSummary:
    document.getElementById("matchingSummary"),
  navVeloxCount: document.getElementById("navVeloxCount"),
  veloxSummary: document.getElementById("veloxSummary"),
  veloxSearch: document.getElementById("veloxSearch"),
  veloxCount: document.getElementById("veloxCount"),
  veloxTableBody: document.getElementById("veloxTableBody"),
  veloxBackButton: document.getElementById("veloxBackButton"),
  veloxHero: document.getElementById("veloxHero"),
  veloxTranscriptContent: document.getElementById("veloxTranscriptContent"),
  veloxFileRecord: document.getElementById("veloxFileRecord")
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getVeloxValue(value) {
  const normalized =
    String(value ?? "").trim();

  return normalized || "Not available";
}

function formatVeloxDate(value) {
  const normalized =
    String(value ?? "").trim();

  if (!normalized) {
    return "Not available";
  }

  const formatted =
    formatTicketDate(normalized);

  return formatted === "—"
    ? "Not available"
    : formatted;
}

function formatVeloxCallDate(value) {
  const normalized =
    String(value ?? "").trim();

  if (!normalized) {
    return "Not available";
  }

  const date =
    new Date(`${normalized}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(
    "en-SG",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  ).format(date);
}

function formatVeloxTranscript(value) {
  const text = String(value ?? "").trim();

  if (!text) {
    return `
      <div class="velox-speaker-text">
        Transcript content is not available.
      </div>
    `;
  }

  const pattern =
    /(\[Speaker\s+\d+\])/g;

  const parts =
    text.split(pattern);

  const blocks = [];

  for (
    let i = 0;
    i < parts.length;
    i++
  ) {
    const part =
      String(parts[i] ?? "").trim();

    if (!part) {
      continue;
    }

    if (
      /^\[Speaker\s+\d+\]$/.test(part)
    ) {
      const content =
        String(
          parts[i + 1] ?? ""
        ).trim();

      blocks.push(`
        <div class="velox-speaker-block">
          <div class="velox-speaker-label">
            ${escapeHtml(part)}
          </div>

          <div class="velox-speaker-text">
            ${escapeHtml(content)}
          </div>
        </div>
      `);

      i++;
    } else {
      blocks.push(`
        <div class="velox-speaker-block">
          <div class="velox-speaker-text">
            ${escapeHtml(part)}
          </div>
        </div>
      `);
    }
  }

  return blocks.join("");
}

function getVeloxPreview(
  value,
  limit = 130
) {
  const normalized =
    String(value ?? "")
      .replace(/\s+/g, " ")
      .trim();

  if (!normalized) {
    return "Transcript content not available.";
  }

  if (normalized.length <= limit) {
    return normalized;
  }

  return `${normalized
    .slice(0, limit)
    .trim()}…`;
}

function getLinkStatusLabel(matchState) {
  if (matchState === "high") {
    return "Linked";
  }

  if (matchState === "flagged") {
    return "Needs review";
  }

  return "Not evaluated";
}

function getLinkStatusClass(matchState) {
  if (matchState === "high") {
    return "green";
  }

  if (matchState === "flagged") {
    return "amber";
  }

  return "grey";
}

function getLinkStatusText(caseItem) {
  if (
    caseItem.matchState === "not-evaluated" ||
    caseItem.matchConfidence === null
  ) {
    return "Not evaluated";
  }

  return `${getLinkStatusLabel(
    caseItem.matchState
  )} · ${caseItem.matchConfidence}%`;
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
        <div class="recent-score">
  ${escapeHtml(getLinkStatusText(item))}
</div>
<div class="recent-score-label">link status</div>
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
    velox: "V"
  };

  return labels[channel] ?? "?";
}

function renderCaseTable() {
  const query = elements.caseSearch.value.trim().toLowerCase();
  const type = elements.caseTypeFilter.value;
  const match = elements.matchFilter.value;

  const linkedMasterCaseIds =
    new Set(
      state.veloxTranscripts
        .filter(
          (transcript) =>
            String(
              transcript.linkStatus || ""
            ).toLowerCase() === "linked"
        )
        .map(
          (transcript) =>
            String(
              transcript.linkedMasterCase ||
              ""
            ).trim()
        )
        .filter(Boolean)
    );

  const filtered = state.cases.filter((item) => {
    const searchable = [
      item.id,
      item.zohoTicketId,
      item.patient,
      item.phone,
      item.email,
      item.client,
      item.location,
      item.caseTypeLabel,
      item.caseDescription,
      ...(item.tickets ?? []).map((ticket) => ticket.id),
      ...(item.tickets ?? []).map((ticket) => ticket.subject)
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchable.includes(query)
      && (type === "all" || item.caseType === type)
      && (match === "all" || item.matchState === match);
  });

  elements.caseCount.textContent = filtered.length;

  if (!filtered.length) {
    elements.caseTableBody.innerHTML = `<tr><td colspan="7"><div class="empty-state">No cases match the current filters.</div></td></tr>`;
    return;
  }

  elements.caseTableBody.innerHTML =
    filtered.map((item) => {
      const hasOperiLink =
        linkedMasterCaseIds.has(
          String(item.id || "").trim()
        );

      const displayLinkText =
        hasOperiLink
          ? "Linked"
          : getLinkStatusText(item);

      const displayLinkClass =
        hasOperiLink
          ? "green"
          : getLinkStatusClass(
            item.matchState
          );

      return `
    <tr data-case-id="${escapeHtml(item.id)}">
      <td>
        <div class="case-link">
          ${escapeHtml(item.id)}
          <span class="pill ${item.isDummy ? "amber" : "green"}">
            ${item.isDummy ? "DUMMY" : "LIVE"}
          </span>
        </div>

        <div class="primary-text">
          ${escapeHtml(item.patient)}
        </div>

        <div class="secondary-text">
          Zoho ID: ${escapeHtml(item.zohoTicketId || "—")}
        </div>

        <div class="secondary-text">
          ${escapeHtml(item.location)}
        </div>
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
      <td>
        <span class="pill ${displayLinkClass}">
        ${escapeHtml(displayLinkText)}
        </span>
      </td>
      <td>
        <div class="primary-text">${escapeHtml(item.updatedAt)}</div>
        <div class="secondary-text">${escapeHtml(item.updatedTime)}</div>
      </td>
    </tr>
  `}).join("");
}

function renderUnmatched() {
  if (elements.navUnmatchedCount) {
    elements.navUnmatchedCount.textContent =
      state.unmatched.length;
  }

  elements.unmatchedSummary.textContent =
    `${state.unmatched.length} items`;

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

function renderVeloxTable() {
  const query =
    elements.veloxSearch
      .value
      .trim()
      .toLowerCase();

  const filtered =
    state.veloxTranscripts.filter(
      (item) => {
        const searchable = [
          item.id,
          item.fileName,
          item.turboScribeZipName,
          item.participant,
          item.phone,
          item.email,
          item.callDate,
          item.linkedMasterCase,
          item.linkedZohoTicket,
          item.transcript
        ]
          .join(" ")
          .toLowerCase();

        return searchable.includes(query);
      }
    );

  elements.navVeloxCount.textContent =
    state.veloxTranscripts.length;

  elements.veloxSummary.textContent =
    `${state.veloxTranscripts.length} ` +
    `transcript${state.veloxTranscripts.length === 1
      ? ""
      : "s"
    }`;

  elements.veloxCount.textContent =
    filtered.length;

  if (!filtered.length) {
    elements.veloxTableBody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            No Velox transcripts match the current search.
          </div>
        </td>
      </tr>
    `;

    return;
  }

  elements.veloxTableBody.innerHTML =
    filtered
      .map((item) => {
        const contact = [
          String(item.phone ?? "").trim(),
          String(item.email ?? "").trim()
        ]
          .filter(Boolean)
          .join(" · ") ||
          "Not available";

        const linkedRecord = [
          String(
            item.linkedMasterCase ?? ""
          ).trim(),

          String(
            item.linkedZohoTicket ?? ""
          ).trim()
        ]
          .filter(Boolean)
          .join(" · ") ||
          "Not linked";

        return `
          <tr
            data-velox-id="${escapeHtml(
          item.id
        )}"
            tabindex="0"
            role="button"
          >
            <td>
              <div class="case-link">
                ${escapeHtml(
          getVeloxValue(
            item.turboScribeZipName
          )
        )}
              </div>

              <div class="primary-text">
                ${escapeHtml(
          getVeloxValue(
            item.fileName
          )
        )}
              </div>

              <div class="secondary-text">
                ${escapeHtml(
          getVeloxPreview(
            item.transcript
          )
        )}
              </div>
            </td>

            <td>
              <div class="primary-text">
                ${escapeHtml(
          getVeloxValue(
            item.participant
          )
        )}
              </div>

              <div class="secondary-text">
                ${escapeHtml(item.id)}
              </div>
            </td>

            <td>
              ${escapeHtml(contact)}
            </td>

            <td>
              ${escapeHtml(
          formatVeloxCallDate(
            item.callDate
          )
        )}
            </td>

            <td>
              <span class="pill ${linkedRecord ===
            "Not linked"
            ? "grey"
            : "green"
          }">
                ${escapeHtml(
            linkedRecord
          )}
              </span>
            </td>

            <td>
              ${escapeHtml(
            formatVeloxDate(
              item.updatedAt
            )
          )}
            </td>
          </tr>
        `;
      })
      .join("");
}

async function refreshVeloxData() {
  try {
    const transcripts =
      await fetchVeloxTranscripts();

    state.veloxTranscripts =
      transcripts;

    renderVeloxTable();

    if (state.selectedCaseId) {
      const selectedCase =
        state.cases.find(
          (item) =>
            item.id ===
            state.selectedCaseId
        );

      if (selectedCase) {
        renderTimeline(
          selectedCase
        );
      }
    }
  } catch (error) {
    console.error(
      "Velox transcript feed unavailable:",
      error
    );

    if (
      state.veloxTranscripts.length === 0
    ) {
      elements.navVeloxCount.textContent =
        "0";

      elements.veloxSummary.textContent =
        "Velox unavailable";

      elements.veloxCount.textContent =
        "0";

      elements.veloxTableBody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state">
              Unable to load Velox transcripts from Operi.
            </div>
          </td>
        </tr>
      `;
    }
  }
}

async function submitManualVeloxLink(
  veloxId,
  caseId
) {
  const transcript =
    state.veloxTranscripts.find(
      (item) =>
        item.id === veloxId
    );

  const caseItem =
    state.cases.find(
      (item) =>
        item.id === caseId
    );

  if (!transcript) {
    throw new Error(
      "Velox transcript not found."
    );
  }

  if (!caseItem) {
    throw new Error(
      "Master Case not found."
    );
  }

  const zohoTicketId =
    String(
      caseItem.zohoTicketId || ""
    ).trim();

  if (!zohoTicketId) {
    throw new Error(
      "Master Case has no Zoho ticket ID."
    );
  }

  const body =
    new URLSearchParams({
      action:
        "link",

      record_id:
        transcript.id,

      linked_master_case:
        caseItem.id,

      linked_zoho_ticket:
        zohoTicketId
    });

  const response =
    await fetch(
      buildApiUrl(
        appConfig.endpoints
          .veloxManualLink
      ),
      {
        method: "POST",

        headers: {
          Accept:
            "application/json"
        },

        body
      }
    );

  if (!response.ok) {
    throw new Error(
      `Manual link returned HTTP ${response.status}`
    );
  }

  transcript.linkedMasterCase =
    caseItem.id;

  transcript.linkedZohoTicket =
    zohoTicketId;

  transcript.linkStatus =
    "linked";

  transcript.linkMethod =
    "manual";

  transcript.linkReason =
    "Manually linked by Ops";

  await refreshVeloxData();
}

async function submitManualVeloxUnlink(
  veloxId
) {
  const transcript =
    state.veloxTranscripts.find(
      (item) =>
        item.id === veloxId
    );

  if (!transcript) {
    throw new Error(
      "Velox transcript not found."
    );
  }

  const body =
    new URLSearchParams({
      action:
        "unlink",

      record_id:
        transcript.id
    });

  const response =
    await fetch(
      buildApiUrl(
        appConfig.endpoints
          .veloxManualLink
      ),
      {
        method: "POST",

        headers: {
          Accept:
            "application/json"
        },

        body
      }
    );

  if (!response.ok) {
    throw new Error(
      `Manual unlink returned HTTP ${response.status}`
    );
  }

  transcript.linkedMasterCase =
    "";

  transcript.linkedZohoTicket =
    "";

  transcript.linkStatus =
    "not_linked";

  transcript.linkMethod =
    "manual";

  transcript.linkReason =
    "Manually unlinked by Ops";

  await refreshVeloxData();
}

function renderVeloxDetail(
  transcript
) {
  state.selectedVeloxId =
    transcript.id;

  const isLinked =
    Boolean(
      String(
        transcript.linkedMasterCase ??
        ""
      ).trim()
    ) ||
    Boolean(
      String(
        transcript.linkedZohoTicket ??
        ""
      ).trim()
    );

  elements.veloxHero.innerHTML = `
    <div class="hero-top">
      <div>
        <div class="hero-title-row">
          <h1>
            ${escapeHtml(
    getVeloxValue(
      transcript.turboScribeZipName
    )
  )}
          </h1>

          <span class="pill blue">
            VELOX TRANSCRIPT
          </span>

          <span class="pill grey">
            READ ONLY
          </span>
        </div>

        <div class="hero-subtitle">
  TXT file
  <strong>
          ${escapeHtml(
    getVeloxValue(
      transcript.fileName
    )
  )}
          </strong>
          · TurboScribe transcript
        </div>
      </div>

      <div
        style="
          display: flex;
          align-items: center;
          gap: 8px;
        "
      >
        <div
          style="
            display: flex;
            align-items: center;
            gap: 8px;
          "
        >
          <span class="pill ${isLinked
      ? "green"
      : "grey"
    }">
            ${isLinked
      ? "Linked"
      : "Not linked"
    }
          </span>

          ${isLinked
      ? `
              <button
                class="media-view-button"
                id="veloxManualUnlinkButton"
                type="button"
                data-velox-id="${escapeHtml(
        transcript.id
      )}"
              >
                Unlink
              </button>
            `
      : ""
    }
        </div>
      </div>
    </div>

    <div class="hero-grid">
      <div>
        <div class="info-label">
          Participant
        </div>

        <div class="info-value">
          ${escapeHtml(
      getVeloxValue(
        transcript.participant
      )
    )}
        </div>
      </div>

      <div>
        <div class="info-label">
          Phone
        </div>

        <div class="info-value">
          ${escapeHtml(
      getVeloxValue(
        transcript.phone
      )
    )}
        </div>
      </div>

      <div>
        <div class="info-label">
          Email
        </div>

        <div class="info-value">
          ${escapeHtml(
      getVeloxValue(
        transcript.email
      )
    )}
        </div>
      </div>

      <div>
        <div class="info-label">
          Call Date
        </div>

        <div class="info-value">
          ${escapeHtml(
      formatVeloxCallDate(
        transcript.callDate
      )
    )}
        </div>
      </div>

      <div>
        <div class="info-label">
          Linked Master Case
        </div>

        <div class="info-value">
          ${escapeHtml(
      getVeloxValue(
        transcript.linkedMasterCase
      )
    )}
        </div>
      </div>

      <div>
        <div class="info-label">
          Linked Zoho Ticket
        </div>

        <div class="info-value">
          ${escapeHtml(
      getVeloxValue(
        transcript.linkedZohoTicket
      )
    )}
        </div>
      </div>
    </div>
  `;

  const transcriptText =
    String(
      transcript.transcript ?? ""
    ).trim() ||
    "Transcript content is not available.";

  elements.veloxTranscriptContent.innerHTML =
    formatVeloxTranscript(
      transcriptText
    );

  const recordRows = [
    [
      "TurboScribe export",
      getVeloxValue(
        transcript.turboScribeZipName
      )
    ],
    [
      "TXT filename",
      getVeloxValue(
        transcript.fileName
      )
    ],
    [
      "Velox record ID",
      getVeloxValue(
        transcript.id
      )
    ],
    [
      "Source",
      getVeloxValue(
        transcript.source
      )
    ],
    [
      "Last updated",
      formatVeloxDate(
        transcript.updatedAt
      )
    ],
    [
      "Participant",
      getVeloxValue(
        transcript.participant
      )
    ],
    [
      "Phone",
      getVeloxValue(
        transcript.phone
      )
    ],
    [
      "Email",
      getVeloxValue(
        transcript.email
      )
    ],
    [
      "Call date",
      formatVeloxCallDate(
        transcript.callDate
      )
    ],
    [
      "Master Case",
      getVeloxValue(
        transcript.linkedMasterCase
      )
    ],
    [
      "Zoho ticket",
      getVeloxValue(
        transcript.linkedZohoTicket
      )
    ]
  ];

  const caseOptions =
    state.cases
      .filter(
        (caseItem) =>
          !caseItem.isDummy &&
          caseItem.zohoTicketId
      )
      .map((caseItem) => {
        const searchText = [
          caseItem.id,
          caseItem.patient,
          caseItem.phone,
          caseItem.email,
          caseItem.zohoTicketId,
          ...(caseItem.tickets ?? [])
            .map((ticket) => ticket.id)
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return `
        <option
          value="${escapeHtml(
          caseItem.id
        )}"
          data-search="${escapeHtml(
          searchText
        )}"
        >
          ${escapeHtml(caseItem.id)}
          ·
          ${escapeHtml(caseItem.patient)}
          ·
          ${escapeHtml(
          caseItem.tickets?.[0]?.id || ""
        )}
        </option>
      `;
      })
      .join("");

  elements.veloxFileRecord.innerHTML =
    recordRows
      .map(
        ([label, value]) => `
        <div class="record-row">
          <span class="record-label">
            ${escapeHtml(label)}
          </span>

          <span class="record-value">
            ${escapeHtml(value)}
          </span>
        </div>
      `
      )
      .join("") +
    `
    <div class="velox-manual-link">
      <div class="velox-manual-link-title">
        Manual Case Link
      </div>

     <input
        id="veloxManualCaseSearch"
        type="search"
        placeholder="Search case ID, ticket, name, phone or email..."
      />

      <select
        id="veloxManualCaseSelect"
      >
        <option value="">
          Select Master Case...
        </option>

        ${caseOptions}
      </select>

      <button
        class="media-view-button"
        id="veloxManualLinkButton"
        type="button"
        data-velox-id="${escapeHtml(
      transcript.id
    )}"
      >
        Link to Master Case
      </button>
    </div>
  `;
}

function openVeloxTranscript(
  veloxId
) {
  const transcript =
    state.veloxTranscripts.find(
      (item) =>
        item.id === veloxId
    );

  if (!transcript) {
    showToast(
      "The selected transcript could not be found."
    );

    return;
  }

  renderVeloxDetail(transcript);
  showView("velox-detail");
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

function getMediaType(fileName, contentType = "") {
  const name =
    String(fileName ?? "")
      .toLowerCase();

  const mime =
    String(contentType ?? "")
      .toLowerCase();

  if (
    mime.startsWith("image/") ||
    /\.(jpg|jpeg|png|gif|webp|bmp|heic)$/i.test(name)
  ) {
    return "Image";
  }

  if (
    mime.startsWith("video/") ||
    /\.(mp4|mov|avi|mkv|webm)$/i.test(name)
  ) {
    return "Video";
  }

  if (
    mime.startsWith("audio/") ||
    /\.(mp3|wav|m4a|aac|ogg)$/i.test(name)
  ) {
    return "Audio";
  }

  if (
    mime.includes("pdf") ||
    /\.pdf$/i.test(name)
  ) {
    return "PDF";
  }

  if (
    /\.(doc|docx)$/i.test(name)
  ) {
    return "Word";
  }

  if (
    /\.(xls|xlsx|csv)$/i.test(name)
  ) {
    return "Spreadsheet";
  }

  return "Document";
}


function collectCaseMedia(caseItem) {
  const files = [];

  for (
    const interaction of
    caseItem.interactions ?? []
  ) {
    const detailedFiles =
      Array.isArray(
        interaction.attachmentFiles
      )
        ? interaction.attachmentFiles
        : [];

    if (detailedFiles.length) {
      for (const file of detailedFiles) {
        files.push({
          name:
            String(
              file.name ??
              "Unnamed file"
            ),

          id:
            String(
              file.id ?? ""
            ),

          url:
            String(
              file.url ?? ""
            ),

          contentType:
            String(
              file.contentType ?? ""
            ),

          size:
            file.size ?? null,

          ticketId:
            String(
              caseItem.zohoTicketId ?? ""
            ),

          parentId:
            String(
              interaction.id ?? ""
            ),

          parentType:
            interaction.eventType === "comment"
              ? "comment"
              : "thread",

          type:
            getMediaType(
              file.name,
              file.contentType
            ),

          interactionId:
            interaction.id ?? "",

          source:
            interaction.source ??
            "Zoho Desk",

          timestamp:
            interaction.timestamp ??
            ""
        });
      }

      continue;
    }

    /*
      Backward compatibility for records where
      only attachment filenames are available.
    */
    const attachmentNames =
      Array.isArray(
        interaction.attachments
      )
        ? interaction.attachments
        : [];

    for (const name of attachmentNames) {
      files.push({
        name: String(name),
        id: "",
        url: "",
        contentType: "",
        size: null,

        type:
          getMediaType(name),

        interactionId:
          interaction.id ?? "",

        source:
          interaction.source ??
          "Zoho Desk",

        timestamp:
          interaction.timestamp ??
          ""
      });
    }
  }

  return files;
}

function openCaseMedia(file) {
  if (
    !file.ticketId ||
    !file.parentId ||
    !file.id
  ) {
    showToast(
      "This attachment does not have enough information to open."
    );

    return;
  }

  const params =
    new URLSearchParams({
      ticketId:
        file.ticketId,

      mode:
        "attachment",

      parentType:
        file.parentType,

      parentId:
        file.parentId,

      attachmentId:
        file.id,

      fileName:
        file.name
    });

  const url =
    buildApiUrl(
      appConfig.endpoints
        .zohoTicketDetail
    ) +
    `?${params.toString()}`;

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );
}

function renderCaseMedia(caseItem) {
  const files =
    collectCaseMedia(caseItem);

  elements.caseMediaCount.textContent =
    `${files.length} file${files.length === 1
      ? ""
      : "s"
    }`;

  if (!files.length) {
    elements.caseMediaList.innerHTML = `
      <div class="empty-state">
        No documents or media were found
        in this Master Case.
      </div>
    `;

    return;
  }

  elements.caseMediaList.innerHTML =
    files
      .map((file) => `
        <div class="media-item">
          <div class="media-file-icon">
            ${escapeHtml(
        getMediaIcon(file.type)
      )}
          </div>

          <div class="media-file-info">
            <div class="media-file-name">
              ${escapeHtml(file.name)}
            </div>

            <div class="media-file-meta">
              ${escapeHtml(file.type)}
              ·
              ${escapeHtml(
        file.source ||
        "Zoho Desk"
      )}
            </div>

            ${file.timestamp
          ? `
                  <div class="media-file-meta">
                    ${escapeHtml(
            formatTicketDate(
              file.timestamp
            )
          )}
                  </div>
                `
          : ""
        }
          </div>

          <button
  class="media-view-button"
  type="button"

  data-media-ticket-id="${escapeHtml(
          file.ticketId
        )}"

  data-media-parent-type="${escapeHtml(
          file.parentType
        )}"

  data-media-parent-id="${escapeHtml(
          file.parentId
        )}"

  data-media-attachment-id="${escapeHtml(
          file.id
        )}"

  data-media-file-name="${escapeHtml(
          file.name
        )}"
>
  View
</button>
        </div>
      `)
      .join("");
}


function getMediaIcon(type) {
  const icons = {
    PDF: "PDF",
    Image: "IMG",
    Video: "VID",
    Audio: "AUD",
    Word: "DOC",
    Spreadsheet: "XLS",
    Document: "FILE"
  };

  return icons[type] ?? "FILE";
}

function renderCaseDetail(caseItem) {
  const isRefreshingSameCase =
    state.selectedCaseId === caseItem.id;

  /*
    Preserve temporary Ops UI state only when
    the SAME case is being refreshed.

    If Ops opens another case, start clean.
  */
  if (isRefreshingSameCase) {
    const veloxSearch =
      document.getElementById(
        "caseManualVeloxSearch"
      );

    const veloxSelect =
      document.getElementById(
        "caseManualVeloxSelect"
      );

    if (veloxSearch) {
      state.preservedVeloxSearch =
        veloxSearch.value;
    }

    if (veloxSelect) {
      state.preservedVeloxSelection =
        veloxSelect.value;
    }

    state.expandedTimelineIds =
      new Set(
        Array.from(
          document.querySelectorAll(
            ".timeline-entry .timeline-preview.expanded"
          )
        )
          .map(preview =>
            preview
              .closest(".timeline-entry")
              ?.dataset.interactionId
          )
          .filter(Boolean)
      );
  } else {
    state.preservedVeloxSearch = "";
    state.preservedVeloxSelection = "";
    state.expandedTimelineIds =
      new Set();
  }

  const activeTabBeforeRender =
    isRefreshingSameCase
      ? document.querySelector(".tab.active")
        ?.dataset.tab || "timeline"
      : "timeline";

  const activeChannelBeforeRender =
    isRefreshingSameCase
      ? state.activeTimelineChannel
      : "all";

  state.selectedCaseId = caseItem.id;
  state.activeTimelineChannel =
    activeChannelBeforeRender;

  elements.caseHero.innerHTML = `
    <div class="hero-top">
      <div>
        <div class="hero-title-row">
          <h1>${escapeHtml(caseItem.patient)}</h1>
          <span class="pill ${caseItem.isDummy ? "amber" : "green"}">${caseItem.isDummy ? "DUMMY DATA" : "LIVE DATA"}</span>
          <span class="pill blue">${escapeHtml(caseItem.status)}</span>
          <span class="pill ${getLinkStatusClass(caseItem.matchState)}">
            ${escapeHtml(getLinkStatusLabel(caseItem.matchState))}
          </span>
        </div>
        <div class="hero-subtitle">Master Case <strong>${escapeHtml(caseItem.id)}</strong> · ${escapeHtml(caseItem.caseTypeLabel)} · ${escapeHtml(caseItem.location)}</div>
      </div>
      <div
        style="
          display: flex;
          align-items: center;
          gap: 8px;
        "
      >
        <span class="pill ${getLinkedVeloxInteractions(caseItem).length
      ? "green"
      : getLinkStatusClass(
        caseItem.matchState
      )
    }">
          Master Case link:
          ${escapeHtml(
      getLinkedVeloxInteractions(caseItem).length
        ? "Linked"
        : getLinkStatusText(caseItem)
    )}
        </span>

        ${getLinkedVeloxInteractions(caseItem).length
      ? `
              <button
                class="media-view-button velox-unlink-case-button"
                type="button"
                data-velox-id="${escapeHtml(
        getLinkedVeloxInteractions(
          caseItem
        )[0].veloxId
      )}"
              >
                Unlink Operi Call
              </button>
            `
      : ""
    }
      </div>
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
  renderAiSummaryTimeline(caseItem);

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
    ["Zoho Ticket ID", caseItem.zohoTicketId],
    ["Case Status", caseItem.status],
    ["Contact ID", caseItem.contactId],
    ["Phone", caseItem.phone],
    ["Email", caseItem.email],
    ["Interactions", caseItem.interactions.length],
    ["Linked Tickets", caseItem.tickets.length]
  ];

  elements.caseRecord.innerHTML =
    recordRows
      .map(([label, value]) => `
      <div class="record-row">
        <span class="record-label">
          ${escapeHtml(label)}
        </span>

        <span class="record-value">
          ${escapeHtml(value)}
        </span>
      </div>
    `)
      .join("");

  renderCaseMedia(caseItem);

  const availableVeloxOptions =
    state.veloxTranscripts
      .filter((transcript) => {
        return (
          transcript.id &&
          String(
            transcript.linkStatus || ""
          ).toLowerCase() !== "linked"
        );
      })
      .map((transcript) => {
        const searchText = [
          transcript.id,
          transcript.fileName,
          transcript.participant,
          transcript.phone,
          transcript.email,
          transcript.callDate
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return `
        <option
          value="${escapeHtml(
          transcript.id
        )}"
          data-search="${escapeHtml(
          searchText
        )}"
        >
          ${escapeHtml(
          transcript.fileName ||
          transcript.id
        )}
          ·
          ${escapeHtml(
          transcript.callDate ||
          "No date"
        )}
        </option>
      `;
      })
      .join("");

  elements.caseRecord.innerHTML += `
  <div class="velox-manual-link">
    <div class="velox-manual-link-title">
      Link Operi Call
    </div>

    <input
  id="caseManualVeloxSearch"
      type="search"
      placeholder="Search filename, date, phone or email..."
    />

    <select
      id="caseManualVeloxSelect"
    >
      <option value="">
        Select Velox transcript...
      </option>

      ${availableVeloxOptions}
    </select>

    <button
      class="media-view-button"
      id="caseManualVeloxLinkButton"
      type="button"
      data-case-id="${escapeHtml(
    caseItem.id
  )}"
    >
      Link Operi Call
    </button>
  </div>
`;

  const restoredVeloxSearch =
    document.getElementById(
      "caseManualVeloxSearch"
    );

  const restoredVeloxSelect =
    document.getElementById(
      "caseManualVeloxSelect"
    );

  /*
    Restore search text and rebuild the filtered
    dropdown exactly as it was before refresh.
  */
  if (restoredVeloxSearch) {
    restoredVeloxSearch.value =
      state.preservedVeloxSearch || "";

    if (state.preservedVeloxSearch) {
      restoredVeloxSearch.dispatchEvent(
        new Event("input", {
          bubbles: true
        })
      );
    }
  }

  /*
    Restore the actual selected transcript AFTER
    the search has rebuilt the dropdown.
  */
  if (
    restoredVeloxSelect &&
    state.preservedVeloxSelection
  ) {
    const optionStillExists =
      Array.from(
        restoredVeloxSelect.options
      ).some(
        option =>
          option.value ===
          state.preservedVeloxSelection
      );

    if (optionStillExists) {
      restoredVeloxSelect.value =
        state.preservedVeloxSelection;
    }
  }

  elements.matchingSummary.innerHTML = caseItem.matchingSummary.map((item) => `
    <div class="match-box">
      <div class="match-box-head">
        <span class="match-box-title">${escapeHtml(item.title)}</span>
        <span class="pill ${item.statusClass ||
    (
      item.status === "Matched" ||
        item.status === "Consistent" ||
        item.status === "Linked"
        ? "green"
        : item.status === "Not evaluated"
          ? "grey"
          : "amber"
    )
    }">
          ${escapeHtml(item.status)}
        </span>
      </div>
      <div class="match-box-copy">${escapeHtml(item.copy)}</div>
    </div>
  `).join("");

  activateTab(activeTabBeforeRender);

  document
    .querySelectorAll("#timelineFilters .segment")
    .forEach((segment) => {
      segment.classList.toggle(
        "active",
        segment.dataset.channel ===
        state.activeTimelineChannel
      );
    });
}

function getStrongIdentifiers(interaction, caseItem) {
  if (interaction.source.includes("Zoho")) return "Ticket ID / thread reference";
  if (interaction.channel === "whatsapp") return `Phone ${caseItem.phone}`;
  if (interaction.channel === "document") return "Parent ticket relationship";
  return "Case reference";
}

function formatTimelineContent(value) {
  let text = String(value ?? "");

  // Remove invisible / zero-width characters
  // often found in newsletters and copied HTML.
  text = text
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")
    .replace(/\u00A0/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();

  if (!text) {
    return "No readable content was returned.";
  }

  // Preserve existing line breaks where available.
  text = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]*\n[ \t]*/g, "\n");

  // Add separation around common email sections.
  text = text
    .replace(
      /\s+(?=(?:View in browser|Great news|What's On|For Enquiries|Follow us|If you wish to unsubscribe)\b)/gi,
      "\n\n"
    )
    .replace(
      /\s+(?=(?:Date|Promo code|Email|Phone|WhatsApp|Whats App|Contact Number|Company Name|Number of Participants|Preferred Activities)\s*:)/gi,
      "\n"
    )
    .replace(
      /\s+(?=Book here\b)/gi,
      "\n"
    );

  // Break long plain-text email bodies into readable paragraphs.
  if (!text.includes("\n\n")) {
    text = text.replace(
      /([.!?])\s+(?=[A-Z])/g,
      "$1\n\n"
    );
  }

  return text
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getLinkedVeloxInteractions(
  caseItem
) {
  const caseMasterId =
    String(
      caseItem.id ?? ""
    ).trim();

  const caseZohoId =
    String(
      caseItem.zohoTicketId ?? ""
    ).trim();

  const caseTicketNumbers =
    (caseItem.tickets ?? [])
      .map((ticket) =>
        String(
          ticket.id ?? ""
        )
          .replace(/^ZD-/i, "")
          .trim()
      )
      .filter(Boolean);

  return state.veloxTranscripts
    .filter((transcript) => {
      if (
        String(
          transcript.linkStatus ?? ""
        ).toLowerCase() !== "linked"
      ) {
        return false;
      }

      const linkedMasterCase =
        String(
          transcript.linkedMasterCase ?? ""
        ).trim();

      const linkedZohoTicket =
        String(
          transcript.linkedZohoTicket ?? ""
        ).trim();

      const masterCaseMatches =
        linkedMasterCase &&
        caseMasterId &&
        linkedMasterCase === caseMasterId;

      const internalZohoMatches =
        linkedZohoTicket &&
        caseZohoId &&
        linkedZohoTicket === caseZohoId;

      const ticketNumberMatches =
        linkedZohoTicket &&
        caseTicketNumbers.includes(
          linkedZohoTicket.replace(
            /^ZD-/i,
            ""
          )
        );

      return (
        masterCaseMatches ||
        internalZohoMatches ||
        ticketNumberMatches
      );
    })
    .map((transcript) => {
      const callDate =
        String(
          transcript.callDate ?? ""
        ).trim();

      const timestamp =
        callDate
          ? `${callDate}T00:00:00+08:00`
          : transcript.updatedAt ||
          new Date(0).toISOString();

      return {
        id: transcript.id,

        channel: "velox",

        party:
          transcript.participant ||
          "Caller",

        time:
          callDate
            ? formatVeloxCallDate(
              callDate
            )
            : "Not available",

        timestamp,

        source: "Operi / TurboScribe",

        title:
          transcript.fileName ||
          "Velox call transcript",

        content:
          transcript.transcript ||
          "Transcript content is not available.",

        confidence: null,

        signals:
          transcript.linkReason ||
          (
            transcript.linkMethod ===
              "manual"
              ? "Manually linked to this case"
              : "Automatically linked by exact identifier"
          ),

        attachments: [],

        veloxId:
          transcript.id
      };
    });
}

function renderMasterChronology(caseItem) {
  const ticketId =
    String(
      caseItem?.zohoTicketId || ""
    ).trim();

  if (!ticketId) {
    elements.timelineCount.textContent = "0";

    elements.timelineContainer.innerHTML = `
      <div class="empty-state">
        Master Chronology is not available because
        this case has no Zoho ticket ID.
      </div>
    `;

    return;
  }

  const cached =
    state.aiMasterChronologies.get(
      ticketId
    );

  if (!cached) {
    elements.timelineCount.textContent = "—";

    elements.timelineContainer.innerHTML = `
      <div class="ai-case-report-loading">
        <div class="ai-case-report-spinner"></div>

        <div>
          <div class="ai-case-report-loading-title">
            Building Master Chronology...
          </div>

          <div class="ai-case-report-loading-copy">
            AI is reading the complete case history
            and arranging the important developments
            in chronological order.
          </div>
        </div>
      </div>
    `;

    generateAiMasterChronology(
      caseItem
    );

    return;
  }

  if (cached.status === "loading") {
    elements.timelineCount.textContent = "—";

    elements.timelineContainer.innerHTML = `
      <div class="ai-case-report-loading">
        <div class="ai-case-report-spinner"></div>

        <div>
          <div class="ai-case-report-loading-title">
            Building Master Chronology...
          </div>

          <div class="ai-case-report-loading-copy">
            Reading emails, comments and linked
            Operi calls together.
          </div>
        </div>
      </div>
    `;

    return;
  }

  if (cached.status === "error") {
    elements.timelineCount.textContent = "0";

    elements.timelineContainer.innerHTML = `
      <div class="ai-case-report-error">
        <strong>
          Unable to generate Master Chronology.
        </strong>

        <div>
          ${escapeHtml(
      cached.message ||
      "Please try again."
    )}
        </div>

        <button
          class="media-view-button master-chronology-retry"
          type="button"
        >
          Try again
        </button>
      </div>
    `;

    return;
  }

  const chronology =
    Array.isArray(cached.chronology)
      ? cached.chronology
      : [];

  elements.timelineCount.textContent =
    chronology.length;

  const chronologyHtml =
    chronology
      .map((item) => {
        const channels =
          Array.isArray(item.channels)
            ? item.channels.join(" · ")
            : "";

        return `
          <article
            class="timeline-entry chronology-entry chronology-${escapeHtml(
          item.status || "information"
        )}"
          >
            <div class="timeline-node chronology-node">
              •
            </div>

            <div class="timeline-card chronology-card">
              <div class="timeline-meta">
                <span class="timeline-channel">
                  ${escapeHtml(
          item.actor ||
          "Not identified"
        )}
                </span>

                <span class="timeline-time">
                  ${escapeHtml(
          item.timestamp || ""
        )}
                </span>

                <span class="timeline-source">
                  ${escapeHtml(channels)}
                </span>
              </div>

              <div class="timeline-title">
                ${escapeHtml(
          item.title || ""
        )}
              </div>

              <div class="timeline-preview chronology-copy">
                ${escapeHtml(
          item.summary || ""
        )}
              </div>

              <div class="match-line">
                <span class="match-signals">
                  ${escapeHtml(
          String(
            item.status ||
            "information"
          ).toUpperCase()
        )}
                </span>
              </div>
            </div>
          </article>
        `;
      })
      .join("");

  const outstanding =
    Array.isArray(cached.outstanding)
      ? cached.outstanding
      : [];

  elements.timelineContainer.innerHTML = `
    <div class="master-chronology">

      <section class="chronology-summary-section">
        <div class="chronology-section-label">
          CASE OVERVIEW
        </div>

        <div class="chronology-summary-copy">
          ${escapeHtml(
    cached.caseOverview || ""
  )}
        </div>
      </section>

      <div class="chronology-status-grid">

        <section class="chronology-status-box current">
          <div class="chronology-section-label">
            CURRENT POSITION
          </div>

          <div class="chronology-summary-copy">
            ${escapeHtml(
    cached.currentPosition || ""
  )}
          </div>
        </section>

        <section class="chronology-status-box outstanding">
          <div class="chronology-section-label">
            OUTSTANDING
          </div>

          ${outstanding.length
      ? `
                <ul class="chronology-outstanding-list">
                  ${outstanding
        .map(
          item => `
                        <li>
                          ${escapeHtml(item)}
                        </li>
                      `
        )
        .join("")}
                </ul>
              `
      : `
                <div class="chronology-summary-copy">
                  No clearly identified outstanding items.
                </div>
              `
    }
        </section>

      </div>

      <div class="chronology-heading">
        CASE CHRONOLOGY
      </div>

      ${chronologyHtml || `
        <div class="empty-state">
          No chronology events were generated.
        </div>
      `}

    </div>
  `;
}

function renderTimeline(caseItem) {
  const veloxInteractions =
    getLinkedVeloxInteractions(
      caseItem
    );

  const interactions =
    sortInteractions([
      ...(caseItem.interactions ?? []),
      ...veloxInteractions
    ]);

  if (state.activeTimelineChannel === "all") {
    renderMasterChronology(caseItem);
    return;
  }

  const filtered =
    state.activeTimelineChannel === "email"
      ? interactions.filter(
        (item) =>
          item.channel === "email" ||
          item.channel === "comment"
      )
      : interactions.filter(
        (item) =>
          item.channel ===
          state.activeTimelineChannel
      );

  elements.timelineCount.textContent = filtered.length;

  if (!filtered.length) {
    elements.timelineContainer.innerHTML = `<div class="empty-state">No ${escapeHtml(state.activeTimelineChannel)} interactions found.</div>`;
    return;
  }

  elements.timelineContainer.innerHTML = filtered.map((item) => `
    <article class="timeline-entry" data-channel="${escapeHtml(item.channel)}" data-interaction-id="${escapeHtml(item.id)}" >
      <div class="timeline-node ${escapeHtml(item.channel)}">${escapeHtml(getChannelLabel(item.channel))}</div>
      <div class="timeline-card">
        <div class="timeline-meta">
          <span class="timeline-channel">${escapeHtml(formatChannelName(item.channel))} · ${escapeHtml(item.party)}</span>
          <span class="timeline-time">${escapeHtml(item.time)}</span>
          <span class="timeline-source">${escapeHtml(item.source)} · ${escapeHtml(item.id)}</span>
        </div>
        <div class="timeline-title">
  ${escapeHtml(item.title)}
</div>


${(
      item.channel === "email" ||
      item.channel === "comment"
    ) && item.aiSummary
      ? `
    <div class="thread-ai-summary">
      <div class="thread-ai-summary-label">
        AI SUMMARY
      </div>

      <div class="thread-ai-summary-text">
        ${escapeHtml(
        item.aiSummary
      )}
      </div>
    </div>
  `
      : ""
    }

<div
  class="timeline-preview ${item.channel === "email"
      ? "timeline-preview-collapsed"
      : ""
    }"
>
  ${escapeHtml(
      formatTimelineContent(item.content)
    )}
</div>

${item.channel === "email"
      ? `
      <button
        class="timeline-read-more"
        type="button"
      >
        Read more
      </button>
    `
      : ""
    }

${item.attachments.length
      ? `
      <div class="attachment-list">
        ${item.attachments
        .map(
          (file) => `
              <span class="attachment-chip">
                ${escapeHtml(file)}
              </span>
            `
        )
        .join("")}
      </div>
    `
      : ""
    }
        <div class="match-line">
          <span class="match-signals">
            ${escapeHtml(item.signals)}
          </span>

          ${item.confidence !== null &&
      item.confidence !== undefined &&
      String(item.confidence).trim() !== ""
      ? `
                <span class="pill ${Number(item.confidence) >= 90
        ? "green"
        : "amber"
      }">
                  ${escapeHtml(item.confidence)}%
                </span>
              `
      : ""
    }
        </div>
      </div>
    </article>
  `).join("");

  /*
  Restore emails Ops had expanded before
  the 5-second background refresh.
*/
  elements.timelineContainer
    .querySelectorAll(
      ".timeline-entry"
    )
    .forEach(entry => {
      const interactionId =
        entry.dataset.interactionId;

      if (
        !interactionId ||
        !state.expandedTimelineIds.has(
          interactionId
        )
      ) {
        return;
      }

      const preview =
        entry.querySelector(
          ".timeline-preview"
        );

      const button =
        entry.querySelector(
          ".timeline-read-more"
        );

      if (preview) {
        preview.classList.add(
          "expanded"
        );
      }

      if (button) {
        button.textContent =
          "Show less";
      }
    });

  elements.timelineContainer
    .querySelectorAll(
      ".timeline-preview-collapsed"
    )
    .forEach((preview) => {
      const button =
        preview.nextElementSibling;

      if (
        !button ||
        !button.classList.contains(
          "timeline-read-more"
        )
      ) {
        return;
      }

      /*
        Hide Read more when the email
        already fits within 3 lines.
      */
      if (
        preview.scrollHeight <=
        preview.clientHeight + 2
      ) {
        button.hidden = true;
      }
    });
}

function renderAiSummaryTimeline(caseItem) {
  if (!elements.aiSummaryTimeline) {
    return;
  }

  const ticketId =
    String(
      caseItem?.zohoTicketId || ""
    ).trim();

  if (!ticketId) {
    elements.aiSummaryTimeline.innerHTML = `
      <div class="empty-state">
        AI case report is not available because
        this case has no Zoho ticket ID.
      </div>
    `;
    return;
  }

  const cached =
    state.aiCaseReports.get(ticketId);

  /*
    Nothing generated yet.
    Do NOT generate automatically when case opens.
    AI runs only when Ops clicks AI Summary.
  */
  if (!cached) {
    elements.aiSummaryTimeline.innerHTML = `
      <div class="ai-case-report-placeholder">
        <div class="ai-case-report-placeholder-title">
          AI Case Report
        </div>

        <div class="ai-case-report-placeholder-copy">
          Open this tab to generate a current executive
          summary from the latest stored case interactions.
        </div>
      </div>
    `;
    return;
  }

  if (cached.status === "loading") {
    elements.aiSummaryTimeline.innerHTML = `
      <div class="ai-case-report-loading">
        <div class="ai-case-report-spinner"></div>

        <div>
          <div class="ai-case-report-loading-title">
            Generating case report...
          </div>

          <div class="ai-case-report-loading-copy">
            Reading the case history in chronological
            order and preparing the latest report.
          </div>
        </div>
      </div>
    `;
    return;
  }

  if (cached.status === "error") {
    elements.aiSummaryTimeline.innerHTML = `
      <div class="ai-case-report-error">
        <strong>Unable to generate case report.</strong>
        <div>
          ${escapeHtml(
      cached.message ||
      "Please try again."
    )}
        </div>

        <button
          class="media-view-button ai-case-report-retry"
          type="button"
        >
          Try again
        </button>
      </div>
    `;
    return;
  }

  const report =
    String(cached.report || "").trim();

  const generatedAt =
    cached.generatedAt
      ? formatTicketDate(cached.generatedAt)
      : "";

  /*
    Convert report headings/paragraphs into
    readable HTML while escaping model output.
  */
  const sections =
    report
      .split(/\n(?=[A-Z][A-Z /&-]{3,}\n)/)
      .map(section => section.trim())
      .filter(Boolean);

  const reportHtml =
    sections
      .map(section => {
        const lines =
          section.split("\n");

        const heading =
          String(lines.shift() || "").trim();

        const body =
          lines.join("\n").trim();

        const bodyHtml =
          escapeHtml(body)
            .replace(
              /^-\s+(.+)$/gm,
              "<li>$1</li>"
            )
            .replace(
              /(<li>.*<\/li>)/gs,
              "<ul class=\"ai-case-report-list\">$1</ul>"
            )
            .replace(/\n\n+/g, "</p><p>")
            .replace(/\n/g, "<br>");

        return `
          <section class="ai-case-report-section">
            <h3>
              ${escapeHtml(heading)}
            </h3>

            <div class="ai-case-report-copy">
              <p>${bodyHtml}</p>
            </div>
          </section>
        `;
      })
      .join("");

  elements.aiSummaryTimeline.innerHTML = `
    <div class="ai-case-report">

      <div class="ai-case-report-header">
        <div>
          <div class="ai-case-report-title">
            Executive Case Report
          </div>

          <div class="ai-case-report-subtitle">
            Generated from the current stored
            case history
          </div>
        </div>

        <button
          class="media-view-button ai-case-report-regenerate"
          type="button"
        >
          Regenerate
        </button>
      </div>

      ${reportHtml}

      ${generatedAt
      ? `
          <div class="ai-case-report-generated">
            Generated ${escapeHtml(generatedAt)}
          </div>
        `
      : ""
    }

    </div>
  `;
}

async function generateAiCaseReport(
  caseItem,
  force = false
) {
  if (
    !caseItem ||
    caseItem.isDummy ||
    !caseItem.zohoTicketId
  ) {
    return;
  }

  const ticketId =
    String(caseItem.zohoTicketId).trim();

  const existing =
    state.aiCaseReports.get(ticketId);

  if (
    existing?.status === "loading"
  ) {
    return;
  }

  /*
    If already generated and this was not
    an explicit regenerate request, keep it.
  */
  if (
    !force &&
    existing?.status === "ready"
  ) {
    renderAiSummaryTimeline(caseItem);
    return;
  }

  const requestSequence =
    ++state.aiCaseReportRequestSequence;

  state.aiCaseReports.set(
    ticketId,
    {
      status: "loading"
    }
  );

  renderAiSummaryTimeline(caseItem);

  try {
    const result =
      await fetchAiCaseReport(ticketId);

    /*
      Ignore an old response if another report
      request was started afterwards.
    */
    if (
      requestSequence !==
      state.aiCaseReportRequestSequence
    ) {
      return;
    }

    state.aiCaseReports.set(
      ticketId,
      {
        status: "ready",
        report: result.report,
        generatedAt: result.generatedAt
      }
    );

    /*
      Only render if Ops is still looking
      at the same case.
    */
    if (
      state.selectedCaseId === caseItem.id
    ) {
      renderAiSummaryTimeline(caseItem);
    }
  } catch (error) {
    console.error(
      "AI case report generation failed:",
      error
    );

    state.aiCaseReports.set(
      ticketId,
      {
        status: "error",
        message:
          error?.name === "AbortError"
            ? "The report generation timed out."
            : error?.message ||
            "The report could not be generated."
      }
    );

    if (
      state.selectedCaseId === caseItem.id
    ) {
      renderAiSummaryTimeline(caseItem);
    }
  }
}

async function generateAiMasterChronology(
  caseItem,
  force = false
) {
  if (
    !caseItem ||
    caseItem.isDummy ||
    !caseItem.zohoTicketId
  ) {
    return;
  }

  const ticketId =
    String(caseItem.zohoTicketId).trim();

  const existing =
    state.aiMasterChronologies.get(
      ticketId
    );

  if (existing?.status === "loading") {
    return;
  }

  if (
    !force &&
    existing?.status === "ready" &&
    existing.sourceUpdatedAt ===
    caseItem.sourceUpdatedAt
  ) {
    renderTimeline(caseItem);
    return;
  }

  const requestSequence =
    ++state.aiMasterChronologyRequestSequence;

  state.aiMasterChronologies.set(
    ticketId,
    {
      status: "loading"
    }
  );

  renderTimeline(caseItem);

  try {
    const result =
      await fetchAiMasterChronology(
        ticketId
      );

    if (
      requestSequence !==
      state.aiMasterChronologyRequestSequence
    ) {
      return;
    }

    state.aiMasterChronologies.set(
      ticketId,
      {
        status: "ready",

        sourceUpdatedAt:
          caseItem.sourceUpdatedAt,

        generatedAt:
          result.generatedAt || "",
        caseOverview:
          result.caseOverview || "",
        chronology:
          Array.isArray(
            result.chronology
          )
            ? result.chronology
            : [],
        currentPosition:
          result.currentPosition || "",
        outstanding:
          Array.isArray(
            result.outstanding
          )
            ? result.outstanding
            : []
      }
    );

    if (
      state.selectedCaseId ===
      caseItem.id
    ) {
      renderTimeline(caseItem);
    }
  } catch (error) {
    console.error(
      "AI master chronology generation failed:",
      error
    );

    state.aiMasterChronologies.set(
      ticketId,
      {
        status: "error",
        message:
          error?.name === "AbortError"
            ? "The chronology generation timed out."
            : error?.message ||
            "The chronology could not be generated."
      }
    );

    if (
      state.selectedCaseId ===
      caseItem.id
    ) {
      renderTimeline(caseItem);
    }
  }
}

function formatChannelName(channel) {
  const names = {
    email: "Email",
    whatsapp: "WhatsApp",
    velox: "Velox"
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

let caseDetailRefreshTimer = null;
async function refreshOpenCaseFromDatabase() {
  const caseId = state.selectedCaseId;

  if (!caseId) {
    return;
  }

  const currentCase = state.cases.find(
    item => item.id === caseId
  );

  if (
    !currentCase ||
    currentCase.isDummy ||
    !currentCase.zohoTicketId
  ) {
    return;
  }

  try {
    const detail =
      await fetchZohoTicketDetail(
        currentCase.zohoTicketId
      );

    const interactions =
      sortInteractions(
        detail.interactions || []
      );

    currentCase.interactions = interactions;
    currentCase.totalThreads =
      detail.totalThreads || 0;
    currentCase.totalComments =
      detail.totalComments || 0;
    currentCase.detailLoaded = true;

    state.detailCache.set(
      currentCase.zohoTicketId,
      {
        interactions,
        totalThreads:
          currentCase.totalThreads,
        totalComments:
          currentCase.totalComments
      }
    );

    renderCaseDetail(currentCase);
  } catch (error) {
    console.warn(
      "Background case refresh failed:",
      error
    );
  }
}


async function fetchAiCaseReport(ticketId) {
  const normalizedTicketId =
    String(ticketId ?? "").trim();

  if (!/^\d{10,30}$/.test(normalizedTicketId)) {
    throw new Error(
      "A valid internal Zoho ticket ID is required."
    );
  }

  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    60000
  );

  try {
    const endpoint =
      `${appConfig.endpoints.aiCaseReport}` +
      `?ticketId=${encodeURIComponent(
        normalizedTicketId
      )}`;

    const response = await fetch(
      buildApiUrl(endpoint),
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
      throw new Error(
        `AI case report returned HTTP ${response.status}`
      );
    }

    const payload = await response.json();

    const root =
      Array.isArray(payload)
        ? payload[0]
        : payload;

    if (
      !root?.success ||
      !String(root.report || "").trim()
    ) {
      throw new Error(
        "AI case report response did not contain a report."
      );
    }

    return {
      ticketId:
        String(
          root.ticketId ||
          normalizedTicketId
        ).trim(),

      generatedAt:
        String(root.generatedAt || "").trim(),

      report:
        String(root.report || "").trim()
    };
  } finally {
    clearTimeout(timeout);
  }
}


async function openCase(caseId) {
  const selectedCase = state.cases.find(
    (item) => item.id === caseId
  );

  if (!selectedCase) {
    showToast(
      "The selected case could not be found."
    );
    return;
  }

  // Open the detail page immediately.
  renderCaseDetail(selectedCase);
  showView("detail");
  clearInterval(caseDetailRefreshTimer);

  caseDetailRefreshTimer =
    setInterval(
      refreshOpenCaseFromDatabase,
      5000
    );

  // Dummy records do not have a real Zoho ID.
  if (
    selectedCase.isDummy ||
    !selectedCase.zohoTicketId
  ) {
    return;
  }

  const ticketId = String(
    selectedCase.zohoTicketId
  ).trim();

  // Reuse previously retrieved history.
  const cachedDetail =
    state.detailCache.get(ticketId);

  if (cachedDetail) {
    selectedCase.interactions =
      cachedDetail.interactions;

    selectedCase.totalThreads =
      cachedDetail.totalThreads;

    selectedCase.totalComments =
      cachedDetail.totalComments;

    selectedCase.detailLoaded = true;

    renderCaseDetail(selectedCase);
    return;
  }

  const requestSequence =
    ++state.detailRequestSequence;

  elements.timelineCount.textContent = "…";

  elements.timelineContainer.innerHTML = `
    <div class="empty-state">
      Loading full Zoho email history and comments…
    </div>
  `;

  try {
    const detail =
      await fetchZohoTicketDetail(ticketId);

    // Ignore this response if the user opened
    // another case while the request was running.
    if (
      requestSequence !==
      state.detailRequestSequence ||
      state.selectedCaseId !== caseId
    ) {
      return;
    }

    const currentCase = state.cases.find(
      (item) => item.id === caseId
    );

    if (!currentCase) {
      return;
    }

    const interactions =
      sortInteractions(detail.interactions);

    const cachedResult = {
      interactions,
      totalThreads: detail.totalThreads,
      totalComments: detail.totalComments
    };

    state.detailCache.set(
      ticketId,
      cachedResult
    );

    currentCase.interactions = interactions;
    currentCase.totalThreads =
      detail.totalThreads;
    currentCase.totalComments =
      detail.totalComments;
    currentCase.detailLoaded = true;

    if (detail.ticket) {
      currentCase.status =
        String(
          detail.ticket.status ??
          currentCase.status
        ).trim() || currentCase.status;

      if (currentCase.tickets[0]) {
        currentCase.tickets[0].status =
          currentCase.status;

        currentCase.tickets[0].subject =
          String(
            detail.ticket.subject ??
            currentCase.tickets[0].subject
          ).trim() ||
          currentCase.tickets[0].subject;
      }
    }

    renderCaseDetail(currentCase);
  } catch (error) {
    if (
      requestSequence !==
      state.detailRequestSequence ||
      state.selectedCaseId !== caseId
    ) {
      return;
    }

    console.error(
      "Unable to load Zoho ticket history:",
      error
    );

    const currentCase = state.cases.find(
      (item) => item.id === caseId
    );

    if (currentCase) {
      renderCaseDetail(currentCase);
    }

    showToast(
      error?.name === "AbortError"
        ? "Zoho history request timed out."
        : "Unable to load the full Zoho history."
    );
  }
}

function handleGlobalSearch() {
  const query = elements.globalSearch.value.trim().toLowerCase();
  if (!query) return;

  const matchingCase = state.cases.find((item) => {
    const searchable = [
      item.id,
      item.zohoTicketId,
      item.patient,
      item.phone,
      item.email,
      item.client,
      item.caseDescription,
      ...(item.tickets ?? []).map((ticket) => ticket.id),
      ...(item.tickets ?? []).map((ticket) => ticket.subject)
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
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
    item.addEventListener("click", () => {
      const viewName =
        item.dataset.view;

      showView(viewName);

      if (viewName === "velox") {
        refreshVeloxData();
      }
    });
  });

  elements.menuButton.addEventListener("click", () => {
    elements.sidebar.classList.toggle("open");
  });

  elements.backButton.addEventListener(
    "click",
    () => {
      clearInterval(caseDetailRefreshTimer);
      caseDetailRefreshTimer = null;

      state.selectedCaseId = null;

      showView("cases");
    }
  );

  elements.veloxBackButton
    .addEventListener(
      "click",
      () => showView("velox")
    );

  elements.veloxSearch
    .addEventListener(
      "input",
      renderVeloxTable
    );

  elements.caseSearch.addEventListener("input", renderCaseTable);
  elements.caseTypeFilter.addEventListener("change", renderCaseTable);
  elements.matchFilter.addEventListener("change", renderCaseTable);

  elements.globalSearch.addEventListener("keydown", (event) => {
    if (event.key === "Enter") handleGlobalSearch();
  });

  document.addEventListener(
    "input",
    (event) => {

      /*
        VELOX -> MASTER CASE SEARCH
      */
      if (
        event.target.id ===
        "veloxManualCaseSearch"
      ) {
        const query =
          event.target.value
            .trim()
            .toLowerCase();

        const select =
          document.getElementById(
            "veloxManualCaseSelect"
          );

        if (!select) {
          return;
        }

        const matches =
          state.cases
            .filter(
              (caseItem) =>
                !caseItem.isDummy &&
                caseItem.zohoTicketId
            )
            .filter((caseItem) => {
              if (!query) {
                return true;
              }

              const searchable = [
                caseItem.id,
                caseItem.patient,
                caseItem.phone,
                caseItem.email,
                caseItem.zohoTicketId,
                ...(caseItem.tickets ?? [])
                  .map(
                    (ticket) =>
                      ticket.id
                  )
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

              return searchable.includes(
                query
              );
            });

        select.innerHTML = `
        <option value="">
          ${matches.length
            ? `${matches.length} matching case${matches.length === 1 ? "" : "s"}`
            : "No matching cases"
          }
        </option>

        ${matches
            .map(
              (caseItem) => `
              <option
                value="${escapeHtml(
                caseItem.id
              )}"
              >
                ${escapeHtml(
                caseItem.id
              )}
                ·
                ${escapeHtml(
                caseItem.patient
              )}
                ·
                ${escapeHtml(
                caseItem
                  .tickets?.[0]
                  ?.id || ""
              )}
              </option>
            `
            )
            .join("")}
      `;

        /*
          Automatically recommend
          the first matching result.
        */
        if (
          query &&
          matches.length
        ) {
          select.selectedIndex = 1;
        }

        return;
      }


      /*
        MASTER CASE -> VELOX SEARCH
      */
      if (
        event.target.id ===
        "caseManualVeloxSearch"
      ) {
        const query =
          event.target.value
            .trim()
            .toLowerCase();

        const select =
          document.getElementById(
            "caseManualVeloxSelect"
          );

        if (!select) {
          return;
        }

        const matches =
          state.veloxTranscripts
            .filter(
              (transcript) =>
                transcript.id &&
                String(
                  transcript.linkStatus ||
                  ""
                ).toLowerCase() !==
                "linked"
            )
            .filter(
              (transcript) => {
                if (!query) {
                  return true;
                }

                const searchable = [
                  transcript.id,
                  transcript.fileName,
                  transcript.participant,
                  transcript.phone,
                  transcript.email,
                  transcript.callDate
                ]
                  .filter(Boolean)
                  .join(" ")
                  .toLowerCase();

                return searchable.includes(
                  query
                );
              }
            );

        select.innerHTML = `
        <option value="">
          ${matches.length
            ? `${matches.length} matching transcript${matches.length === 1 ? "" : "s"}`
            : "No matching transcripts"
          }
        </option>

        ${matches
            .map(
              (transcript) => `
              <option
                value="${escapeHtml(
                transcript.id
              )}"
              >
                ${escapeHtml(
                transcript.fileName ||
                transcript.id
              )}
                ·
                ${escapeHtml(
                transcript.participant ||
                "No participant"
              )}
                ·
                ${escapeHtml(
                transcript.callDate ||
                "No date"
              )}
              </option>
            `
            )
            .join("")}
      `;

        /*
          Automatically recommend
          first matching result.
        */
        if (
          query &&
          matches.length
        ) {
          select.selectedIndex = 1;
        }

        return;
      }
    }
  );

  document.addEventListener(
    "click",
    async (event) => {

      const caseVeloxLinkButton =
        event.target.closest(
          "#caseManualVeloxLinkButton"
        );

      if (caseVeloxLinkButton) {
        const select =
          document.getElementById(
            "caseManualVeloxSelect"
          );

        const veloxId =
          String(
            select?.value || ""
          ).trim();

        const caseId =
          String(
            caseVeloxLinkButton
              .dataset.caseId || ""
          ).trim();

        if (!veloxId) {
          showToast(
            "Select a Velox transcript first."
          );

          return;
        }

        caseVeloxLinkButton.disabled =
          true;

        caseVeloxLinkButton.textContent =
          "Linking...";

        try {
          await submitManualVeloxLink(
            veloxId,
            caseId
          );

          showToast(
            "Operi call linked successfully."
          );

          const selectedCase =
            state.cases.find(
              (item) =>
                item.id === caseId
            );

          if (selectedCase) {
            renderCaseDetail(
              selectedCase
            );
          }
        } catch (error) {
          console.error(
            "Manual Velox link failed:",
            error
          );

          showToast(
            "Unable to link this Operi call."
          );

          caseVeloxLinkButton.disabled =
            false;

          caseVeloxLinkButton.textContent =
            "Link Operi Call";
        }

        return;
      }

      const manualLinkButton =
        event.target.closest(
          "#veloxManualLinkButton"
        );

      if (manualLinkButton) {
        const select =
          document.getElementById(
            "veloxManualCaseSelect"
          );

        const caseId =
          String(
            select?.value || ""
          ).trim();

        if (!caseId) {
          showToast(
            "Select a Master Case first."
          );

          return;
        }

        manualLinkButton.disabled = true;
        manualLinkButton.textContent =
          "Linking...";

        try {
          const veloxId =
            manualLinkButton.dataset.veloxId;

          await submitManualVeloxLink(
            veloxId,
            caseId
          );

          showToast(
            "Transcript linked successfully."
          );

          const refreshedTranscript =
            state.veloxTranscripts.find(
              (item) =>
                item.id === veloxId
            );

          if (refreshedTranscript) {
            renderVeloxDetail(
              refreshedTranscript
            );
          }
        } catch (error) {
          console.error(
            "Manual Velox link failed:",
            error
          );

          showToast(
            "Unable to link this transcript."
          );

          manualLinkButton.disabled =
            false;

          manualLinkButton.textContent =
            "Link to Master Case";
        }

        return;
      }

      const veloxUnlinkButton =
        event.target.closest(
          "#veloxManualUnlinkButton"
        );

      if (veloxUnlinkButton) {
        veloxUnlinkButton.disabled =
          true;

        veloxUnlinkButton.textContent =
          "Unlinking...";

        try {
          await submitManualVeloxUnlink(
            veloxUnlinkButton.dataset.veloxId
          );

          showToast(
            "Transcript unlinked successfully."
          );

          const refreshedTranscript =
            state.veloxTranscripts.find(
              (item) =>
                item.id ===
                veloxUnlinkButton.dataset.veloxId
            );

          if (refreshedTranscript) {
            renderVeloxDetail(
              refreshedTranscript
            );
          }
        } catch (error) {
          console.error(
            "Manual Velox unlink failed:",
            error
          );

          showToast(
            "Unable to unlink this transcript."
          );

          veloxUnlinkButton.disabled =
            false;

          veloxUnlinkButton.textContent =
            "Unlink from Master Case";
        }

        return;
      }


      const caseVeloxUnlinkButton =
        event.target.closest(
          ".velox-unlink-case-button"
        );

      if (caseVeloxUnlinkButton) {
        caseVeloxUnlinkButton.disabled =
          true;

        caseVeloxUnlinkButton.textContent =
          "Unlinking...";

        try {
          await submitManualVeloxUnlink(
            caseVeloxUnlinkButton.dataset.veloxId
          );

          showToast(
            "Operi call unlinked successfully."
          );

          const selectedCase =
            state.cases.find(
              (item) =>
                item.id ===
                state.selectedCaseId
            );

          if (selectedCase) {
            renderCaseDetail(
              selectedCase
            );
          }
        } catch (error) {
          console.error(
            "Manual Velox unlink failed:",
            error
          );

          showToast(
            "Unable to unlink this Operi call."
          );

          caseVeloxUnlinkButton.disabled =
            false;

          caseVeloxUnlinkButton.textContent =
            "Unlink Operi Call";
        }

        return;
      }

      const readMoreButton =
        event.target.closest(
          ".timeline-read-more"
        );

      if (readMoreButton) {
        const preview =
          readMoreButton
            .previousElementSibling;

        if (
          preview &&
          preview.classList.contains(
            "timeline-preview"
          )
        ) {
          const isExpanded =
            preview.classList.toggle(
              "expanded"
            );

          readMoreButton.textContent =
            isExpanded
              ? "Show less"
              : "Read more";
        }

        return;
      }

      const mediaButton =
        event.target.closest(
          ".media-view-button[data-media-attachment-id]"
        );

      if (mediaButton) {
        openCaseMedia({
          ticketId:
            mediaButton.dataset
              .mediaTicketId,

          parentType:
            mediaButton.dataset
              .mediaParentType,

          parentId:
            mediaButton.dataset
              .mediaParentId,

          id:
            mediaButton.dataset
              .mediaAttachmentId,

          name:
            mediaButton.dataset
              .mediaFileName
        });

        return;
      }

      const veloxTarget =
        event.target.closest(
          "[data-velox-id]"
        );

      if (veloxTarget) {
        openVeloxTranscript(
          veloxTarget.dataset.veloxId
        );

        return;
      }

      const caseTarget =
        event.target.closest(
          "[data-case-id]"
        );
      if (caseTarget) openCase(caseTarget.dataset.caseId);

      const tab =
        event.target.closest(".tab");

      if (tab) {
        const tabName =
          tab.dataset.tab;

        activateTab(tabName);

        if (
          tabName === "ai-summary" &&
          state.selectedCaseId
        ) {
          const selectedCase =
            state.cases.find(
              item =>
                item.id === state.selectedCaseId
            );

          if (selectedCase) {
            generateAiCaseReport(
              selectedCase
            );
          }
        }
      }

      const segment = event.target.closest("#timelineFilters .segment");
      if (segment && state.selectedCaseId) {
        document.querySelectorAll("#timelineFilters .segment").forEach((item) => item.classList.remove("active"));
        segment.classList.add("active");
        state.activeTimelineChannel = segment.dataset.channel;
        const selectedCase = state.cases.find((item) => item.id === state.selectedCaseId);
        if (selectedCase) renderTimeline(selectedCase);
      }

      const aiRegenerateButton =
        event.target.closest(
          ".ai-case-report-regenerate, .ai-case-report-retry"
        );

      if (
        aiRegenerateButton &&
        state.selectedCaseId
      ) {
        const selectedCase =
          state.cases.find(
            item =>
              item.id === state.selectedCaseId
          );

        if (selectedCase) {
          generateAiCaseReport(
            selectedCase,
            true
          );
        }
      }

      const chronologyRetryButton =
        event.target.closest(
          ".master-chronology-retry"
        );

      if (
        chronologyRetryButton &&
        state.selectedCaseId
      ) {
        const selectedCase =
          state.cases.find(
            item =>
              item.id ===
              state.selectedCaseId
          );

        if (selectedCase) {
          generateAiMasterChronology(
            selectedCase,
            true
          );
        }

        return;
      }
    });

  document.addEventListener("keydown", (event) => {
    const veloxTarget =
      event.target.closest?.(
        "[data-velox-id]"
      );

    if (
      veloxTarget &&
      (
        event.key === "Enter" ||
        event.key === " "
      )
    ) {
      event.preventDefault();

      openVeloxTranscript(
        veloxTarget.dataset.veloxId
      );

      return;
    }
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
  renderVeloxTable();
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

function buildSnapshotSignature(snapshot) {
  return JSON.stringify({
    mode: snapshot.mode,

    cases: snapshot.cases.map((item) => ({
      id: item.id,
      status: item.status,
      updatedAt: item.updatedAt,
      updatedTime: item.updatedTime,
      matchState: item.matchState,
      matchConfidence: item.matchConfidence,
      caseDescription: item.caseDescription,

      tickets: item.tickets.map((ticket) => ({
        id: ticket.id,
        status: ticket.status,
        subject: ticket.subject
      })),

      ai: {
        status: item.ai?.status || "",
        generatedAt:
          item.ai?.generatedAt || "",
        confidence:
          Number(item.ai?.confidence || 0),
        summary: item.ai?.summary || "",
        latestUpdate:
          item.ai?.latestUpdate || "",
        nextStep: item.ai?.nextStep || ""
      }
    })),

    unmatched: snapshot.unmatched.map(
      (item) => ({
        id: item.id,
        received: item.received,
        confidence: item.confidence
      })
    )
  });
}

async function refreshDashboardData() {
  // Prevent overlapping requests when the
  // previous request is still running.
  if (state.refreshInProgress) {
    return;
  }

  state.refreshInProgress = true;

  try {
    const snapshot =
      await dataRepository.getDashboardSnapshot();

    const newSignature =
      buildSnapshotSignature(snapshot);

    const dataChanged =
      newSignature !==
      state.snapshotSignature;

    state.generatedAt =
      snapshot.generatedAt;

    // Data is unchanged. Update only the
    // refresh timestamp without rebuilding
    // the dashboard HTML.
    if (!dataChanged) {
      elements.lastUpdatedText.textContent =
        state.generatedAt
          ? formatTicketDate(
            state.generatedAt
          )
          : formatCurrentTime();

      elements.ingestionUpdatedText.textContent =
        formatCurrentTime();

      return;
    }

    const previousScrollPosition =
      window.scrollY;

    state.cases = snapshot.cases;

    // Restore any ticket details already retrieved
    // from the separate Zoho detail endpoint.
    for (const caseItem of state.cases) {
      const ticketId = String(
        caseItem.zohoTicketId ?? ""
      ).trim();

      const cachedDetail =
        state.detailCache.get(ticketId);

      if (!cachedDetail) {
        continue;
      }

      caseItem.interactions =
        cachedDetail.interactions;

      caseItem.totalThreads =
        cachedDetail.totalThreads;

      caseItem.totalComments =
        cachedDetail.totalComments;

      caseItem.detailLoaded = true;
    }

    state.unmatched = snapshot.unmatched;
    state.ingestion = snapshot.ingestion;
    state.dataMode = snapshot.mode;
    state.dataMessage = snapshot.message;
    state.snapshotSignature =
      newSignature;

    renderDashboard();

    // Preserve the user's current page position.
    window.requestAnimationFrame(() => {
      window.scrollTo({
        top: previousScrollPosition,
        behavior: "auto"
      });
    });
  } catch (error) {
    console.error(
      "Silent dashboard refresh failed:",
      error
    );

    // Keep the current screen visible.
    // Do not replace it with dummy records
    // because one background refresh failed.
  } finally {
    state.refreshInProgress = false;
  }
}

async function initializeDashboard() {
  try {
    bindEvents();

    await refreshDashboardData();
    await refreshVeloxData();

    window.setInterval(() => {
      if (document.hidden) {
        return;
      }

      refreshDashboardData().catch(
        (error) => {
          console.error(
            "Automatic dashboard refresh failed:",
            error
          );
        }
      );
    }, appConfig.zohoRefreshIntervalMs);

    document.addEventListener(
      "visibilitychange",
      () => {
        if (!document.hidden) {
          refreshDashboardData().catch(
            (error) => {
              console.error(
                "Dashboard refresh after tab activation failed:",
                error
              );
            }
          );
        }
      }
    );
  } catch (error) {
    console.error("Dashboard initialization failed:", error);
    showToast("Unable to load the dashboard data.");
  }
}

async function initializeAuth() {
  try {
    const authenticated =
      await checkSession();

    if (authenticated) {
      showApp();
      return;
    }

    showLogin();
  } catch {
    showLogin();
  }
}

initializeAuth();

async function initializeAuth() {
  try {
    const authenticated =
      await checkSession();

    if (authenticated) {
      showApp();
      await initializeDashboard();
      return;
    }

    showLogin();
  } catch {
    showLogin();
  }
}
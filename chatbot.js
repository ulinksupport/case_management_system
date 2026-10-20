"use strict";

const chatbot = {
    launcher:
        document.getElementById(
            "caseChatbotLauncher"
        ),

    panel:
        document.getElementById(
            "caseChatbotPanel"
        ),

    close:
        document.getElementById(
            "caseChatbotClose"
        ),

    form:
        document.getElementById(
            "caseChatbotForm"
        ),

    input:
        document.getElementById(
            "caseChatbotInput"
        ),

    send:
        document.getElementById(
            "caseChatbotSend"
        ),

    messages:
        document.getElementById(
            "caseChatbotMessages"
        ),

    caseLabel:
        document.getElementById(
            "caseChatbotCaseLabel"
        )
};

const chatbotState = {
    currentCase: null,

    histories:
        new Map()
};

function openCaseChatbot() {
    chatbot.panel.hidden = false;

    if (!chatbot.input.disabled) {
        setTimeout(
            () => chatbot.input.focus(),
            50
        );
    }
}

function closeCaseChatbot() {
    chatbot.panel.hidden = true;
}

function getCaseHistory(caseId) {
    if (
        !chatbotState.histories.has(caseId)
    ) {
        chatbotState.histories.set(
            caseId,
            [
                {
                    role: "assistant",
                    content:
                        "Ask me anything about this case."
                }
            ]
        );
    }

    return chatbotState.histories.get(
        caseId
    );
}

function renderChatHistory() {
    chatbot.messages.innerHTML = "";

    if (!chatbotState.currentCase) {
        const element =
            document.createElement("div");

        element.className =
            "case-chatbot-message assistant";

        element.textContent =
            "Open a case to start chatting with Case AI.";

        chatbot.messages.appendChild(
            element
        );

        return;
    }

    const history =
        getCaseHistory(
            chatbotState.currentCase.caseId
        );

    for (const message of history) {
        const element =
            document.createElement("div");

        element.className =
            `case-chatbot-message ${message.role === "user"
                ? "user"
                : "assistant"
            }`;

        element.textContent =
            message.content;

        chatbot.messages.appendChild(
            element
        );
    }

    chatbot.messages.scrollTop =
        chatbot.messages.scrollHeight;
}

function setChatbotCase(caseData) {
    chatbotState.currentCase =
        caseData || null;

    if (!caseData) {
        chatbot.caseLabel.textContent =
            "No case selected";

        chatbot.input.disabled = true;
        chatbot.send.disabled = true;

        chatbot.input.placeholder =
            "Open a case to start...";

        renderChatHistory();

        return;
    }

    chatbot.caseLabel.textContent =
        caseData.label || caseData.caseId;

    chatbot.input.disabled = false;
    chatbot.send.disabled = false;

    chatbot.input.placeholder =
        "Ask about this case...";

    renderChatHistory();
}

function addChatMessage(
    role,
    content
) {
    if (!chatbotState.currentCase) {
        return;
    }

    const history =
        getCaseHistory(
            chatbotState.currentCase.caseId
        );

    history.push({
        role,
        content:
            String(content || "")
    });

    renderChatHistory();
}

chatbot.launcher.addEventListener(
    "click",
    () => {
        if (chatbot.panel.hidden) {
            openCaseChatbot();
        } else {
            closeCaseChatbot();
        }
    }
);

chatbot.close.addEventListener(
    "click",
    closeCaseChatbot
);

chatbot.form.addEventListener(
    "submit",
    (event) => {
        event.preventDefault();

        if (!chatbotState.currentCase) {
            return;
        }

        const message =
            chatbot.input.value.trim();

        if (!message) {
            return;
        }

        addChatMessage(
            "user",
            message
        );

        chatbot.input.value = "";

        addChatMessage(
            "assistant",
            "Chatbot backend is not connected yet."
        );
    }
);

chatbot.input.addEventListener(
    "keydown",
    (event) => {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();

            chatbot.form.requestSubmit();
        }
    }
);

window.addEventListener(
    "cms-case-changed",
    (event) => {
        setChatbotCase(
            event.detail
        );
    }
);

setChatbotCase(null);
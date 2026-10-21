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

function appendFormattedInlineText(
    container,
    text
) {
    const parts =
        String(text || "")
            .split(/(\*\*.*?\*\*)/g);

    for (const part of parts) {
        if (
            part.startsWith("**") &&
            part.endsWith("**") &&
            part.length > 4
        ) {
            const strong =
                document.createElement(
                    "strong"
                );

            strong.textContent =
                part.slice(2, -2);

            container.appendChild(
                strong
            );

            continue;
        }

        container.appendChild(
            document.createTextNode(
                part
            )
        );
    }
}

function renderFormattedChatMessage(
    container,
    text
) {
    const lines =
        String(text || "")
            .replace(/\r\n/g, "\n")
            .split("\n");

    let currentList = null;
    let currentListType = "";

    function closeList() {
        currentList = null;
        currentListType = "";
    }

    for (const rawLine of lines) {
        const line =
            rawLine.trim();

        if (!line) {
            closeList();
            continue;
        }

        const bulletMatch =
            line.match(
                /^[-•]\s+(.+)$/
            );

        const numberedMatch =
            line.match(
                /^\d+[.)]\s+(.+)$/
            );

        if (bulletMatch) {
            if (
                !currentList ||
                currentListType !== "ul"
            ) {
                currentList =
                    document.createElement(
                        "ul"
                    );

                currentListType = "ul";

                container.appendChild(
                    currentList
                );
            }

            const item =
                document.createElement(
                    "li"
                );

            appendFormattedInlineText(
                item,
                bulletMatch[1]
            );

            currentList.appendChild(
                item
            );

            continue;
        }

        if (numberedMatch) {
            if (
                !currentList ||
                currentListType !== "ol"
            ) {
                currentList =
                    document.createElement(
                        "ol"
                    );

                currentListType = "ol";

                container.appendChild(
                    currentList
                );
            }

            const item =
                document.createElement(
                    "li"
                );

            appendFormattedInlineText(
                item,
                numberedMatch[1]
            );

            currentList.appendChild(
                item
            );

            continue;
        }

        closeList();

        const paragraph =
            document.createElement("p");

        appendFormattedInlineText(
            paragraph,
            line
        );

        container.appendChild(
            paragraph
        );
    }
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

        renderFormattedChatMessage(
            element,
            message.content
        );

        chatbot.messages.appendChild(
            element
        );
    }

    chatbot.messages.scrollTop =
        chatbot.messages.scrollHeight;
}

function showChatbotTypingIndicator() {
    const existing =
        document.getElementById(
            "caseChatbotTyping"
        );

    if (existing) {
        existing.remove();
    }

    const element =
        document.createElement("div");

    element.id =
        "caseChatbotTyping";

    element.className =
        "case-chatbot-message assistant case-chatbot-typing";

    element.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;

    chatbot.messages.appendChild(
        element
    );

    chatbot.messages.scrollTop =
        chatbot.messages.scrollHeight;

    return element;
}

function removeChatbotTypingIndicator() {
    document
        .getElementById(
            "caseChatbotTyping"
        )
        ?.remove();
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
    async (event) => {
        event.preventDefault();

        if (
            !chatbotState.currentCase
        ) {
            return;
        }

        const message =
            chatbot.input.value
                .trim();

        if (!message) {
            return;
        }

        chatbot.input.value = "";

        await sendCaseChatMessage(
            message
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

async function sendCaseChatMessage(
    message
) {
    const activeCase =
        chatbotState.currentCase;

    if (
        !activeCase ||
        !activeCase.ticketId
    ) {
        return;
    }

    const caseId =
        activeCase.caseId;

    const ticketId =
        activeCase.ticketId;

    const history =
        getCaseHistory(caseId);

    const requestHistory =
        history
            .filter(
                (item) =>
                    !(
                        item.role ===
                        "assistant" &&
                        item.content ===
                        "Ask me anything about this case."
                    )
            )
            .slice(-12)
            .map(
                (item) => ({
                    role:
                        item.role,

                    content:
                        item.content
                })
            );

    history.push({
        role: "user",
        content: message
    });

    if (
        chatbotState.currentCase
            ?.caseId === caseId
    ) {
        renderChatHistory();

        showChatbotTypingIndicator();

        chatbot.input.disabled =
            true;

        chatbot.send.disabled =
            true;

        chatbot.send.textContent =
            "Thinking...";
    }

    try {
        const response =
            await fetch(
                "/api/case-chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Accept:
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            ticketId,
                            message,
                            history:
                                requestHistory
                        })
                }
            );

        const result =
            await response.json();

        if (
            !response.ok ||
            !result.success ||
            !result.answer
        ) {
            throw new Error(
                result.message ||
                "Case AI request failed."
            );
        }

        history.push({
            role: "assistant",
            content:
                result.answer
        });
    } catch (error) {
        console.error(
            "Case AI request failed:",
            error
        );

        history.push({
            role: "assistant",
            content:
                "Unable to get a response from Case AI. Please try again."
        });
    } finally {
        removeChatbotTypingIndicator();

        if (
            chatbotState.currentCase
                ?.caseId === caseId
        ) {
            chatbot.input.disabled =
                false;

            chatbot.send.disabled =
                false;

            chatbot.send.textContent =
                "Send";

            renderChatHistory();

            chatbot.input.focus();
        }
    }
}

window.addEventListener(
    "cms-case-changed",
    (event) => {
        setChatbotCase(
            event.detail
        );
    }
);

setChatbotCase(null);
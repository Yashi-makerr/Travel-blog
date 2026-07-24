/**
 * 🤖 OceanBound AI Travel Companion - Frontend Widget Controller
 */

(function () {
    // 1. Inject HTML elements to the page on load
    document.addEventListener("DOMContentLoaded", () => {
        // Create Floating Button
        const chatBtn = document.createElement("button");
        chatBtn.id = "aiChatBtn";
        chatBtn.className = "ai-chat-btn";
        chatBtn.innerHTML = '<i class="fas fa-compass"></i>';
        document.body.appendChild(chatBtn);

        // Create Chat Container
        const chatContainer = document.createElement("div");
        chatContainer.id = "aiChatContainer";
        chatContainer.className = "ai-chat-container";
        chatContainer.innerHTML = `
            <div class="ai-chat-header">
                <div class="ai-chat-profile">
                    <div class="ai-chat-avatar"><i class="fas fa-brain"></i></div>
                    <div class="ai-chat-info">
                        <h3>AI Travel Companion</h3>
                        <span class="ai-chat-status">Online</span>
                    </div>
                </div>
                <button class="ai-chat-close" id="aiChatClose">&times;</button>
            </div>
            <div class="ai-chat-messages" id="aiChatMessages">
                <div class="ai-msg assistant">
                    <p>Hello! 🧭 I am your **OceanBound AI Travel Companion**.</p>
                    <p>I can help you search local blogs, plan a custom 3-day itinerary, or answer travel questions. Try asking:</p>
                    <ul style="margin-left: 15px; padding-left: 5px; list-style-type: disc;">
                        <li><em>"Show me stories about Santorini"</em></li>
                        <li><em>"What is the best time to see Northern Lights in Norway?"</em></li>
                        <li><em>"Draft a 3-day adventure trip itinerary"</em></li>
                    </ul>
                </div>
            </div>
            <div class="ai-chat-input-bar">
                <input type="text" id="aiChatInput" placeholder="Ask about destinations, blogs...">
                <button class="ai-chat-send" id="aiChatSend" disabled><i class="fas fa-paper-plane"></i></button>
            </div>
        `;
        document.body.appendChild(chatContainer);

        // 2. DOM elements and State
        const aiChatBtn = document.getElementById("aiChatBtn");
        const aiChatContainer = document.getElementById("aiChatContainer");
        const aiChatClose = document.getElementById("aiChatClose");
        const aiChatMessages = document.getElementById("aiChatMessages");
        const aiChatInput = document.getElementById("aiChatInput");
        const aiChatSend = document.getElementById("aiChatSend");

        let conversationHistory = []; // Tracks chat logs: { role: 'user'|'assistant', text: '...' }

        // 3. Open/Close Toggle Handlers
        aiChatBtn.addEventListener("click", () => {
            const isShowing = aiChatContainer.classList.toggle("show");
            aiChatBtn.classList.toggle("active", isShowing);
            if (isShowing) {
                aiChatInput.focus();
                scrollToBottom();
            }
        });

        aiChatClose.addEventListener("click", () => {
            aiChatContainer.classList.remove("show");
            aiChatBtn.classList.remove("active");
        });

        // 4. Input Validation (Enable send button only when typing)
        aiChatInput.addEventListener("input", () => {
            aiChatSend.disabled = aiChatInput.value.trim().length === 0;
        });

        aiChatInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && aiChatInput.value.trim().length > 0) {
                sendMessage();
            }
        });

        aiChatSend.addEventListener("click", sendMessage);

        // 5. Core Messaging Handlers
        async function sendMessage() {
            const text = aiChatInput.value.trim();
            if (!text) return;

            // Clear Input
            aiChatInput.value = "";
            aiChatSend.disabled = true;

            // Append User message
            appendMessageBubble(text, "user");
            scrollToBottom();

            // Store in history
            conversationHistory.push({ role: "user", text });

            // Display Typing Indicator
            const typingBubble = showTypingIndicator();
            scrollToBottom();

            try {
                // Call Backend Chat API
                const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        message: text,
                        history: conversationHistory
                    })
                });

                const data = await res.json();
                typingBubble.remove(); // Remove indicator

                if (!res.ok) {
                    appendMessageBubble(`⚠️ Failed to fetch AI response: ${data.error || 'Server error'}`, "assistant");
                } else {
                    const aiReply = data.response;
                    appendMessageBubble(aiReply, "assistant");
                    conversationHistory.push({ role: "assistant", text: aiReply });
                }
            } catch (err) {
                console.error(err);
                typingBubble.remove();
                appendMessageBubble(`❌ Connection to Travel Assistant failed. Please verify that the backend API server is running and accessible at: ${API_BASE_URL}`, "assistant");
            }

            scrollToBottom();
        }

        // Helper: Create message HTML bubble
        function appendMessageBubble(rawText, sender) {
            const bubble = document.createElement("div");
            bubble.className = `ai-msg ${sender}`;
            
            if (sender === "assistant") {
                bubble.innerHTML = formatMarkdownToHtml(rawText);
            } else {
                bubble.textContent = rawText;
            }
            
            aiChatMessages.appendChild(bubble);
        }

        // Helper: Create typing indicator markup
        function showTypingIndicator() {
            const indicator = document.createElement("div");
            indicator.className = "ai-msg assistant";
            indicator.id = "aiTypingIndicator";
            indicator.innerHTML = `
                <div class="ai-typing-indicator">
                    <div class="ai-typing-dot"></div>
                    <div class="ai-typing-dot"></div>
                    <div class="ai-typing-dot"></div>
                </div>
            `;
            aiChatMessages.appendChild(indicator);
            return indicator;
        }

        // Helper: Scroll history list to the bottom
        function scrollToBottom() {
            aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
        }

        // Helper: Markdown parser to convert bold, list items and paragraphs
        function formatMarkdownToHtml(text) {
            if (!text) return "";

            // Escape HTML characters to prevent XSS
            let safeText = text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");

            // Format Bold: **text** -> <strong>text</strong>
            safeText = safeText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

            // Format Bullet points: lines starting with * or -
            const lines = safeText.split("\n");
            let inList = false;
            const processedLines = lines.map(line => {
                const bulletMatch = line.match(/^\s*[\*\-]\s+(.*?)$/);
                if (bulletMatch) {
                    let content = bulletMatch[1];
                    let out = "";
                    if (!inList) {
                        out += '<ul style="margin-left: 20px; margin-bottom: 10px; list-style-type: disc;">';
                        inList = true;
                    }
                    out += `<li style="margin-bottom: 4px;">${content}</li>`;
                    return out;
                } else {
                    let out = "";
                    if (inList) {
                        out += "</ul>";
                        inList = false;
                    }
                    // Handle paragraph text vs empty lines
                    if (line.trim().length > 0) {
                        out += `<p style="margin-bottom: 8px;">${line}</p>`;
                    }
                    return out;
                }
            });

            if (inList) {
                processedLines.push("</ul>");
            }

            return processedLines.join("");
        }
    });
})();

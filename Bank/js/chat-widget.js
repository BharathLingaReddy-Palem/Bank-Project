function initChatWidget() {
    const chatWidget = document.createElement('div');
    chatWidget.className = 'chat-widget';
    chatWidget.innerHTML = `
        <div class="chat-button" onclick="toggleChat()">
            <i class="fas fa-comments"></i>
            <span class="notification-badge">1</span>
        </div>
        <div class="chat-box" id="chatBox">
            <div class="chat-header">
                <h5 class="mb-0">Customer Support</h5>
                <button class="btn-close" onclick="toggleChat()"></button>
            </div>
            <div class="chat-messages" id="chatMessages">
                <div class="message support">
                    <div class="message-content">
                        Hello! How can I help you today?
                    </div>
                    <small class="message-time">Just now</small>
                </div>
            </div>
            <div class="chat-input">
                <input type="text" id="messageInput" placeholder="Type your message..." 
                       onkeypress="if(event.key === 'Enter') sendMessage()">
                <button onclick="sendMessage()">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(chatWidget);
}

function toggleChat() {
    const chatBox = document.getElementById('chatBox');
    chatBox.classList.toggle('active');
    
    // Remove notification badge when opening chat
    const badge = document.querySelector('.notification-badge');
    if (badge) badge.style.display = 'none';
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    if (!message) return;

    const chatMessages = document.getElementById('chatMessages');
    
    // Add user message
    chatMessages.innerHTML += `
        <div class="message user">
            <div class="message-content">
                ${message}
            </div>
            <small class="message-time">Just now</small>
        </div>
    `;

    input.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Simulate support response
    setTimeout(() => {
        const responses = [
            "I'll help you with that right away!",
            "Let me check that for you.",
            "Thank you for your question. Our team will assist you shortly.",
            "Is there anything else you'd like to know?"
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        chatMessages.innerHTML += `
            <div class="message support">
                <div class="message-content">
                    ${randomResponse}
                </div>
                <small class="message-time">Just now</small>
            </div>
        `;
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
}

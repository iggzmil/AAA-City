/**
 * AAA City Chat Widget Initialization with Shadow DOM
 * This script initializes the chat widget with Shadow DOM for style isolation
 */

document.addEventListener('DOMContentLoaded', function() {
  // Check if we need to auto-open the chat
  const urlParams = new URLSearchParams(window.location.search);
  const shouldOpenChat = urlParams.get('openChat') === 'true';

  // Create chat container if it doesn't exist
  let chatContainer = document.getElementById('chat-container');
  if (!chatContainer) {
    chatContainer = document.createElement('div');
    chatContainer.id = 'chat-container';
    document.body.appendChild(chatContainer);
  }

  // Create a shadow root for style isolation
  const shadowRoot = chatContainer.attachShadow({ mode: 'open' });

  // Add chat widget styles to the shadow DOM
  const chatStyles = document.createElement('style');
  chatStyles.textContent = `
    /* Inject chat-widget.css here to isolate styles within shadow DOM */
    /* Base container */
    .tde-chat-container {
      position: fixed;
      bottom: 30px;
      right: 20px;
      left: auto;
      z-index: 9999;
      font-family: 'Jost', sans-serif;
      transition: all 0.3s ease;
    }

    /* Chat bubble message that appears from the right */
    .tde-chat-bubble {
      position: absolute;
      bottom: 50px;
      right: 10px;
      background-color: black;
      color: white;
      padding: 10px 15px;
      border-radius: 15px;
      border-bottom-right-radius: 0;
      font-size: 14px;
      border: 1px solid white;
      box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.15);
      max-width: 300px;
      width: max-content;
      white-space: normal;
      animation: bubble-in 0.5s ease-out forwards;
      opacity: 0;
      transform: translateX(50px);
      pointer-events: none;
      z-index: 9998;
    }

    /* Mobile adjustments */
    @media (max-width: 767px) {
      .tde-chat-container {
        bottom: 65px !important;
      }
      
      /* Hide chat bubble on mobile devices */
      .tde-chat-bubble {
        display: none !important;
      }
    }

    /* Add triangle pointer to make bubble appear from the icon */
    .tde-chat-bubble:after {
      content: '';
      position: absolute;
      bottom: -10px;
      right: 15px;
      width: 0;
      height: 0;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-top: 10px solid black;
    }

    @keyframes bubble-in {
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    /* Hide bubble when chat is expanded */
    .tde-chat-container:not(.minimized) .tde-chat-bubble {
      display: none;
    }

    /* Display bubble with delay after page load */
    .tde-chat-bubble.show {
      display: block;
    }

    /* Minimized state */
    .tde-chat-container.minimized {
      width: auto;
      height: auto;
      cursor: pointer;
    }

    .tde-chat-container.minimized .tde-chat-expanded {
      display: none;
    }

    .tde-chat-container.minimized .tde-chat-minimized {
      display: flex;
    }

    /* Expanded state */
    .tde-chat-container:not(.minimized) {
      width: 320px;
      height: 480px;
      background: black;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .tde-chat-container:not(.minimized) .tde-chat-minimized {
      display: none;
    }

    .tde-chat-container:not(.minimized) .tde-chat-expanded {
      display: flex;
    }

    /* Minimized button */
    .tde-chat-minimized {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 3rem;
      height: 3rem;
      padding: 0;
      background-color: #09aff4;
      color: white;
      border-radius: 0.25rem;
      box-shadow: 0px 3px 15px 0px rgba(0, 0, 0, 0.25);
      transition: all 0.3s ease-in-out;
    }

    .tde-chat-minimized:hover {
      background-color: rgba(9, 175, 244, 0.8);
      transform: translateY(-2px);
    }

    .tde-chat-minimized img {
      width: 2rem;
      height: 2rem;
      filter: brightness(0) invert(1);
      object-fit: contain;
    }

    .tde-chat-minimized span {
      display: none;
    }

    /* Expanded view */
    .tde-chat-expanded {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    /* Header */
    .tde-chat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 15px;
      background: #09aff4;
      color: #ffffff;
      min-height: 65px;
      border: none;
      box-shadow: none;
    }

    .tde-chat-title {
      display: flex;
      flex-direction: column;
      gap: 4px;
      border: none;
    }

    .tde-chat-title .title-main {
      font-size: 16px;
      font-weight: 600;
      border-bottom: none;
      padding-bottom: 0;
      margin-bottom: 0;
    }

    .tde-chat-title .title-main .chat-logo {
      max-height: 37.5px;
      width: auto;
      display: block;
    }

    .tde-chat-title .title-sub {
      font-size: 15px;
      opacity: 0.85;
    }

    .tde-chat-close-btn {
      background: rgba(255, 255, 255, 0.35);
      border: none;
      color: #ffffff;
      padding: 8px 12px;
      cursor: pointer;
      font-size: 14px;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .tde-chat-close-btn:hover {
      background: rgba(255, 255, 255, 0.45);
    }

    /* Messages area */
    .tde-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: #111;
    }

    .tde-chat-message {
      max-width: 85%;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 14px;
      line-height: 1.4;
      color: #fff;
    }

    .tde-chat-message.bot {
      align-self: flex-start;
      background: #333;
      border-bottom-left-radius: 4px;
    }

    .tde-chat-message.user {
      align-self: flex-end;
      background: #09aff4;
      color: white;
      border-bottom-right-radius: 4px;
    }

    /* Input area */
    .tde-chat-input-area {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border-top: 1px solid #333;
      background: #111;
      min-height: 35px;
    }

    .tde-chat-input {
      flex: 1;
      height: 28px;
      padding: 0 10px;
      border: 1px solid #333;
      border-radius: 6px;
      font-size: 13px;
      outline: none;
      background: #222;
      color: #ffffff;
    }

    .tde-chat-input:focus {
      border-color: #09aff4;
    }

    .tde-chat-send {
      height: 28px;
      padding: 0 12px;
      background: #09aff4;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s ease;
      white-space: nowrap;
    }

    .tde-chat-send:hover {
      background-color: rgba(9, 175, 244, 0.8);
    }

    /* Loading indicator */
    .tde-chat-loading {
      padding: 8px 12px;
      align-self: flex-start;
      display: flex;
      align-items: center;
    }

    .tde-chat-loading .dots {
      display: flex;
      gap: 4px;
    }

    .tde-chat-loading .dot {
      width: 8px;
      height: 8px;
      background: #09aff4;
      border-radius: 50%;
      animation: dot-pulse 1.5s infinite ease-in-out;
    }

    .tde-chat-loading .dot:nth-child(2) {
      animation-delay: 0.2s;
    }

    .tde-chat-loading .dot:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes dot-pulse {
      0%, 100% {
        transform: scale(0.7);
        opacity: 0.7;
      }
      50% {
        transform: scale(1);
        opacity: 1;
      }
    }

    /* Processing state */
    .tde-chat-container.processing .tde-chat-input,
    .tde-chat-container.processing .tde-chat-send {
      pointer-events: none;
    }

    .tde-chat-container.processing .tde-chat-input {
      opacity: 0.7;
    }
  `;
  shadowRoot.appendChild(chatStyles);

  // Create the chat widget's DOM structure within the shadow DOM
  const chatWidgetRoot = document.createElement('div');
  chatWidgetRoot.className = 'tde-chat-container minimized';
  shadowRoot.appendChild(chatWidgetRoot);

  // Create chat bubble that appears next to the icon
  const chatBubble = document.createElement('div');
  chatBubble.className = 'tde-chat-bubble';
  chatBubble.textContent = '👋 Got questions about automation?';
  chatWidgetRoot.appendChild(chatBubble);

  // Create minimized view
  const minimizedView = document.createElement('div');
  minimizedView.className = 'tde-chat-minimized';
  minimizedView.innerHTML = `
    <img src="images/chat-bot.svg" width="32" height="32" alt="Chat Bot">
  `;
  chatWidgetRoot.appendChild(minimizedView);

  // Create expanded view
  const expandedView = document.createElement('div');
  expandedView.className = 'tde-chat-expanded';
  expandedView.innerHTML = `
    <div class="tde-chat-header">
      <div class="tde-chat-title">
        <div class="title-main"><img src="images/AAA_City_logo_white_small.png" alt="AAA City" class="chat-logo"></div>
        <div class="title-sub">AI Assistant</div>
      </div>
      <button class="tde-chat-close-btn">Close Chat</button>
    </div>
    <div class="tde-chat-messages"></div>
    <div class="tde-chat-input-area">
      <input type="text" class="tde-chat-input" placeholder="Type your message...">
      <button class="tde-chat-send">Send</button>
    </div>
  `;
  chatWidgetRoot.appendChild(expandedView);

  // Load the AAACityChatWidget class from chat-widget.js
  if (typeof AAACityChatWidget === 'undefined') {
    console.error('AAACityChatWidget class not found. Make sure chat-widget.js is loaded before this script.');
    return;
  }

  // Import the font to use in Shadow DOM
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700;800&display=swap';
  shadowRoot.appendChild(fontLink);

  // Initialize the chat widget with our custom implementation
  class ShadowDOMChatWidget extends AAACityChatWidget {
    constructor(options = {}) {
      // Create a temporary element to avoid the "container not found" error
      const tempContainer = document.createElement('div');
      tempContainer.id = 'temp-chat-container';
      document.body.appendChild(tempContainer);
      
      // Override the container with the shadow DOM's container
      super({
        ...options,
        target: 'temp-chat-container' // Temporary target that exists
      });
      
      // Clean up temporary element
      document.body.removeChild(tempContainer);
      
      // Set the real container
      this.container = chatWidgetRoot;
      this.messagesContainer = shadowRoot.querySelector('.tde-chat-messages');
      this.shadowRoot = shadowRoot;

      // Re-initialize since we've changed the container
      this.initShadowDOM();
    }

    initShadowDOM() {
      // Clear old event listeners by cloning nodes
      const closeBtn = this.shadowRoot.querySelector('.tde-chat-close-btn');
      const newCloseBtn = closeBtn.cloneNode(true);
      closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
      
      const sendBtn = this.shadowRoot.querySelector('.tde-chat-send');
      const newSendBtn = sendBtn.cloneNode(true);
      sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);
      
      const inputElem = this.shadowRoot.querySelector('.tde-chat-input');
      const newInputElem = inputElem.cloneNode(true);
      inputElem.parentNode.replaceChild(newInputElem, inputElem);

      // Toggle on minimized view click
      this.shadowRoot.querySelector('.tde-chat-minimized').addEventListener('click', () => this.toggle());

      // Close button click
      newCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });

      // Send message function
      const sendMessage = () => {
        const inputElem = this.shadowRoot.querySelector('.tde-chat-input');
        const message = inputElem.value.trim();
        
        if (message && !this.isProcessing) {
          // Add user message to chat
          this.addMessage(message, 'user');
          
          // Clear input
          inputElem.value = '';
          
          // Process the message
          this.processUserMessage(message);

          // Return focus to input field
          inputElem.focus();
        }
      };

      // Send button click
      newSendBtn.addEventListener('click', sendMessage);

      // Send on Enter key
      newInputElem.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          sendMessage();
        }
      });

      // Clear any existing messages
      this.messagesContainer.innerHTML = '';
      
      // Display initial messages
      this.displayInitialMessages();
      
      // Show the bubble message after a short delay
      setTimeout(() => {
        const chatBubble = this.shadowRoot.querySelector('.tde-chat-bubble');
        if (chatBubble) {
          chatBubble.classList.add('show');
        }
      }, 2000);

      // Auto-expand chat if URL parameter is set
      if (shouldOpenChat && this.container.classList.contains('minimized')) {
        this.toggle();
      }
    }

    // Override the addMessage method to work with shadow DOM
    addMessage(text, sender) {
      const messageElem = document.createElement('div');
      messageElem.className = `tde-chat-message ${sender}`;
      messageElem.textContent = text;
      
      this.messagesContainer.appendChild(messageElem);
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
      
      // Save the message to history
      this.messageHistory.push({ text, sender });
      this.saveMessages();
      
      // Focus the input after sending a message
      if (sender === 'user') {
        setTimeout(() => {
          const inputElem = this.shadowRoot.querySelector('.tde-chat-input');
          if (inputElem) inputElem.focus();
        }, 100);
      }
    }

    // Override the toggle method
    toggle() {
      if (this.container.classList.contains('minimized')) {
        // Expanding
        this.container.classList.remove('minimized');
        
        // Focus input field when expanded
        setTimeout(() => {
          const inputElem = this.shadowRoot.querySelector('.tde-chat-input');
          if (inputElem) {
            inputElem.focus();
          }
        }, 300);
        
        // Hide bubble
        const chatBubble = this.shadowRoot.querySelector('.tde-chat-bubble');
        if (chatBubble) {
          chatBubble.style.display = 'none';
        }
      } else {
        // Minimizing
        this.container.classList.add('minimized');
      }
    }

    // Override the createLoadingIndicator method
    createLoadingIndicator() {
      if (this.loadingIndicator) {
        return;
      }
      
      const loadingElem = document.createElement('div');
      loadingElem.className = 'tde-chat-loading';
      loadingElem.innerHTML = `<div class="dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>`;
      
      this.messagesContainer.appendChild(loadingElem);
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
      
      this.loadingIndicator = loadingElem;
    }
    
    // Override the setProcessingState method
    setProcessingState(isProcessing) {
      this.isProcessing = isProcessing;
      
      if (isProcessing) {
        this.container.classList.add('processing');
        this.createLoadingIndicator();
      } else {
        this.container.classList.remove('processing');
        
        if (this.loadingIndicator) {
          this.messagesContainer.removeChild(this.loadingIndicator);
          this.loadingIndicator = null;
        }
        
        // Re-focus the input field
        const inputElem = this.shadowRoot.querySelector('.tde-chat-input');
        if (inputElem) {
          inputElem.focus();
        }
      }
    }
  }

  // Initialize the chat widget with AAA City specific configuration
  const chatWidget = new ShadowDOMChatWidget({
    webhookUrl: 'https://n8n.aaa-city.com/webhook/308218cd-67c4-41b1-a6d9-44c64924decb/chat',
    minimized: !shouldOpenChat, // Auto-expand if openChat=true
    initialMessages: [
      "👋 Hi there! I'm the AAA City AI assistant.",
      "How can I help you with automation today? Feel free to ask questions about our services or capabilities."
    ],
    metadata: {
      source: 'website',
      page: window.location.pathname.split('/').pop().split('.')[0] || 'home',
      fromChatIcon: shouldOpenChat
    },
    fallbackResponses: {
      default: "I'm sorry, I'm having trouble connecting right now. Please try again later or contact us directly at info@aaa-city.com.",
      help: "I'd be happy to help! You can ask me about our automation services, web development, or how we can help streamline your business processes. If you need immediate assistance, please email us at info@aaa-city.com.",
      pricing: "Our pricing varies depending on the specific services and solution complexity. For a personalized quote, we recommend contacting our team who can assess your needs and provide detailed pricing information.",
      services: "We offer a range of automation services including web development with automation, AI chatbots, virtual assistants, document processing, and custom workflow automation. Would you like more information about a specific service?"
    }
  });

  // Expose the chat widget to the global scope for potential later use
  window.aaaCityChat = chatWidget;
}); 
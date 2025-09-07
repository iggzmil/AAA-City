/**
 * AAA City Chat Widget with N8N Integration
 * A simplified version that focuses on essential functionality
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

      /* Hide chat bubble on mobile devices - higher specificity */
      .tde-chat-bubble,
      .tde-chat-bubble.show {
        display: none !important;
      }
    }

    /* Additional landscape-specific rule for chat bubble - more specific */
    @media (max-width: 767px) and (orientation: landscape) {
      .tde-chat-bubble,
      .tde-chat-bubble.show {
        display: none !important;
      }
    }

    /* Additional portrait-specific rule for chat bubble - more specific */
    @media (max-width: 767px) and (orientation: portrait) {
      .tde-chat-bubble,
      .tde-chat-bubble.show {
        display: none !important;
      }
    }

    /* Mobile landscape specific adjustments for better positioning */
    @media (max-width: 767px) and (orientation: landscape) {
      .tde-chat-container {
        bottom: 20px !important;
        right: 15px !important;
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

        .tde-chat-minimized i {      font-size: 2rem;      color: white !important;      display: flex;      align-items: center;      justify-content: center;      position: relative;      width: 100%;      height: 100%;    }

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

  // Create the chat widget root element
  const chatWidgetRoot = document.createElement('div');
  chatWidgetRoot.className = 'tde-chat-container minimized';
  shadowRoot.appendChild(chatWidgetRoot);

  // Create chat bubble
  const chatBubble = document.createElement('div');
  chatBubble.className = 'tde-chat-bubble';
  chatBubble.textContent = '👋 Got questions about automation?';
  chatWidgetRoot.appendChild(chatBubble);

  // Create minimized view
  const minimizedView = document.createElement('div');
  minimizedView.className = 'tde-chat-minimized';
  minimizedView.innerHTML = `
    <i class="flaticon-chat-bot"></i>
  `;
  chatWidgetRoot.appendChild(minimizedView);

  // Create expanded view
  const expandedView = document.createElement('div');
  expandedView.className = 'tde-chat-expanded';
  expandedView.innerHTML = `
    <div class="tde-chat-header">
      <div class="tde-chat-title">
        <div class="title-main"><img src="images/AAA_City_logo.webp" alt="AAA City" class="chat-logo"></div>
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

  // Import the font to use in Shadow DOM
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700;800&display=swap';
  shadowRoot.appendChild(fontLink);

  // Import Flaticon font to use in Shadow DOM
  const flaticonLink = document.createElement('link');
  flaticonLink.rel = 'stylesheet';
  flaticonLink.href = 'webfonts/vendors/flaticon/flaticon_aaa_city_website.css';
  shadowRoot.appendChild(flaticonLink);

  // Get reference to message container
  const messagesContainer = expandedView.querySelector('.tde-chat-messages');

  // Track session state
  let isProcessing = false;
  let loadingIndicator = null;
  let messageHistory = [];
  const sessionId = `${new Date().getTime()}-${Math.floor(Math.random() * 10000)}`;
  let isFirstMessage = true;

  // Add initial messages
  addMessage("👋 Hi there! I'm the AAA City AI assistant.", 'bot');
  addMessage("How can I help you with automation today? Feel free to ask questions about our services or capabilities.", 'bot');

  // Show bubble with delay
  setTimeout(() => {
    chatBubble.classList.add('show');
  }, 2000);

  // Toggle function for expanding/minimizing the chat
  function toggle() {
    console.log('Toggle function called');
    console.log('Current state:', chatWidgetRoot.classList.contains('minimized') ? 'minimized' : 'expanded');

    if (chatWidgetRoot.classList.contains('minimized')) {
      // Expanding
      console.log('Expanding chat widget');
      chatWidgetRoot.classList.remove('minimized');

      // Focus input field when expanded
      setTimeout(() => {
        const inputElem = expandedView.querySelector('.tde-chat-input');
        if (inputElem) {
          inputElem.focus();
        }
      }, 300);

      // Hide bubble
      chatBubble.style.display = 'none';
    } else {
      // Minimizing
      console.log('Minimizing chat widget');
      chatWidgetRoot.classList.add('minimized');

      // Show the bubble again when minimizing
      setTimeout(() => {
        chatBubble.style.display = 'block';
        chatBubble.classList.add('show');
      }, 300);
    }
  }

  // Add a message to the chat
  function addMessage(text, sender) {
    const messageElem = document.createElement('div');
    messageElem.className = `tde-chat-message ${sender}`;
    messageElem.textContent = text;

    messagesContainer.appendChild(messageElem);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Save the message to history
    messageHistory.push({ text, sender, timestamp: new Date().getTime() });
  }

  // Create loading indicator
  function createLoadingIndicator() {
    if (loadingIndicator) return;

    loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'tde-chat-loading';
    loadingIndicator.innerHTML = `<div class="dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>`;

    messagesContainer.appendChild(loadingIndicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Show/hide processing state
  function setProcessingState(processing) {
    isProcessing = processing;

    if (processing) {
      chatWidgetRoot.classList.add('processing');
      createLoadingIndicator();
    } else {
      chatWidgetRoot.classList.remove('processing');

      if (loadingIndicator) {
        messagesContainer.removeChild(loadingIndicator);
        loadingIndicator = null;
      }

      // Re-focus the input field
      const inputElem = expandedView.querySelector('.tde-chat-input');
      if (inputElem) {
        inputElem.focus();
      }
    }
  }

  // Get fallback response when webhook fails
  function getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();

    // Check for specific keywords
    if (lowerMessage.includes('help')) {
      return "I'd be happy to help! You can ask me about our automation services, web development, or how we can help streamline your business processes. If you need immediate assistance, please email us at info@aaa-city.com.";
    }

    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return "Our pricing varies depending on the specific services and solution complexity. For a personalized quote, we recommend contacting our team who can assess your needs and provide detailed pricing information.";
    }

    if (lowerMessage.includes('services') || lowerMessage.includes('offer')) {
      return "We offer a range of automation services including web development with automation, AI chatbots, virtual assistants, document processing, and custom workflow automation. Would you like more information about a specific service?";
    }

    // Default fallback response
    return "I'm sorry, I'm having trouble connecting right now. Please try again later or contact us directly at info@aaa-city.com.";
  }

  // Process user message
  async function processUserMessage(message) {
    try {
      setProcessingState(true);

      // Set a timeout to handle cases where the webhook doesn't respond
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout: The chat service did not respond in time.')), 15000);
      });

      // Build the payload - using the format from DKDS_Sample
      const payload = {
        sessionId: sessionId,
        chatInput: message,
        isNewSession: isFirstMessage
      };

      console.log('Sending payload to N8N:', payload);

      // After sending, mark this as no longer the first message
      if (isFirstMessage) {
        console.log('First message in session - isNewSession=true');
        isFirstMessage = false;
      }

      // Send to webhook - using the new webhook URL
      let response;
      let data;

      try {
        // Use the new webhook URL
        response = await Promise.race([
          fetch('https://n8n.aaa-city.com/webhook/d1a1f309-888c-4b4b-96fe-be3cffb92283/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          }),
          timeoutPromise
        ]);

        if (!response.ok) {
          let errorMessage = '';
          try {
            const errorText = await response.text();
            errorMessage = JSON.parse(errorText).message;
          } catch (e) {
            errorMessage = `Server error: ${response.status}`;
          }
          throw new Error(errorMessage);
        }

        data = await response.json();
      } catch (fetchError) {
        // Use unified error handler for chat API errors
        ErrorHandler.api(fetchError, {
          source: 'chat_widget_send_message',
          context: { 
            payload,
            endpoint: webhookUrl 
          },
          severity: ErrorHandler.SEVERITY.HIGH,
          showToUser: false
        });
        
        throw new Error('Failed to connect to chat service. Please try again later.');
      }

      // Log the response for debugging
      console.log('Response from N8N:', data);

      // Handle N8N Chat Trigger response format
      if (data && data.output) {
        addMessage(data.output, 'bot');
      } else if (data && data.message) {
        addMessage(data.message, 'bot');
      } else if (data && data.response) {
        addMessage(data.response, 'bot');
      } else if (data && data.error) {
        console.error("Error from N8N:", data.error);
        addMessage("Sorry, I encountered an error. Please try again.", 'bot');
      } else {
        // If we get here, we either have an empty response or an unexpected format
        console.warn("Unexpected or empty response format from N8N:", data);

        // Use the fallback response generator
        const fallbackResponse = getFallbackResponse(message);
        addMessage(fallbackResponse, 'bot');
      }
    } catch (error) {
      console.error('Chat widget error:', error);

      // For N8N specific errors, provide more helpful messages
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        console.error('N8N webhook connection error - the server might be down or unreachable');
        addMessage("I'm having trouble connecting to my knowledge base. This might be a temporary issue. Please try again in a few moments or contact us directly at info@aaa-city.com.", 'bot');
        return;
      }

      // Handle timeout errors gracefully
      if (error.message.includes('timeout') || error.message.includes('timed out')) {
        console.error('N8N webhook timeout error - the server is taking too long to respond');
        addMessage("I'm sorry, the chat service is taking too long to respond. Please try again later or contact us directly at info@aaa-city.com.", 'bot');
        return;
      }

      // Use fallback responses for other errors
      const fallbackResponse = getFallbackResponse(message);
      addMessage(fallbackResponse, 'bot');
    } finally {
      setProcessingState(false);
    }
  }

  // Send message function
  function sendMessage() {
    const inputElem = expandedView.querySelector('.tde-chat-input');
    const message = inputElem.value.trim();

    if (message && !isProcessing) {
      // Add user message to chat
      addMessage(message, 'user');

      // Clear input
      inputElem.value = '';

      // Process the message
      processUserMessage(message);

      // Return focus to input field
      inputElem.focus();
    }
  }

  // Add event listeners
  // Minimized view click
  minimizedView.addEventListener('click', function(e) {
    console.log('Minimized view clicked');
    e.preventDefault();
    e.stopPropagation();
    toggle();
  });

  // Close button click
  const closeBtn = expandedView.querySelector('.tde-chat-close-btn');
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle();
  });

  // Send button click
  const sendBtn = expandedView.querySelector('.tde-chat-send');
  sendBtn.addEventListener('click', sendMessage);

  // Input Enter key
  const inputElem = expandedView.querySelector('.tde-chat-input');
  inputElem.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  // Auto-expand chat if URL parameter is set
  if (shouldOpenChat) {
    toggle();
  }

  // Expose to global scope
  window.aaaCityChat = {
    toggle,
    addMessage,
    processUserMessage
  };
});
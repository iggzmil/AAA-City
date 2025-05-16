/**
 * AAA City Chat Widget with N8N Integration
 * A customized chat widget for AAA City website that integrates with N8N workflows
 */

class AAACityChatWidget {
  constructor(options = {}) {
    this.options = {
      target: 'chat-container',
      webhookUrl: '', // Required: N8N webhook URL
      webhookConfig: {
        method: 'POST',
        headers: {}
      },
      initialMessages: [],
      metadata: {},
      minimized: true,
      minimizedContent: '',
      chatInputKey: 'chatInput',
      chatSessionKey: 'sessionId',
      // Add fallback responses for when the webhook is unavailable
      fallbackResponses: {
        default: "I'm sorry, I'm having trouble connecting right now. Please try again later."
      },
      ...options
    };

    this.container = document.getElementById(this.options.target);
    this.sessionId = this.getSessionId();
    this.messageHistory = this.loadSavedMessages();
    this.isProcessing = false;
    this.loadingIndicator = null;
    this.isFirstMessage = true; // Flag to track if this is the first message in the session
    this.init();
  }

  /**
   * Initialize the chat widget
   */
  init() {
    if (!this.container) {
      console.error('Chat container not found');
      return;
    }

    console.log('Initializing chat widget');

    // Always clear chat history and local storage on load
    this.clearChatHistory();
    localStorage.removeItem('chat-messages');
    localStorage.removeItem(this.options.chatSessionKey);

    // Clear any other chat-related items from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('chat') || key.includes('session'))) {
        localStorage.removeItem(key);
      }
    }

    // Always generate a new session ID to ensure a fresh conversation
    this.sessionId = this.generateNewSessionId();

    // Reset the message history array
    this.messageHistory = [];

    // Set first message flag to true for a new session
    this.isFirstMessage = true;

    // Add base class
    this.container.classList.add('tde-chat-container');

    // Set initial state
    if (this.options.minimized) {
      this.container.classList.add('minimized');
    }

    this.createDOM();
    this.attachEventListeners();

    // Display initial messages
    this.displayInitialMessages();

    console.log('Chat widget initialized with new session ID:', this.sessionId);
    console.log('Memory cleared, starting with fresh conversation');
  }

  /**
   * Generate a new session ID (always creates a new one)
   */
  generateNewSessionId() {
    // Create a unique session ID with timestamp to ensure uniqueness
    const timestamp = new Date().getTime();
    const randomPart = Math.floor(Math.random() * 10000);
    const newSessionId = `${timestamp}-${randomPart}`;

    // Store in localStorage
    localStorage.setItem(this.options.chatSessionKey, newSessionId);

    return newSessionId;
  }

  /**
   * Clear chat history from localStorage and memory
   */
  clearChatHistory() {
    localStorage.removeItem('chat-messages');
    localStorage.removeItem(this.options.chatSessionKey);
    this.messageHistory = [];

    // Clear messages container if it exists
    if (this.messagesContainer) {
      this.messagesContainer.innerHTML = '';
    }
  }

  /**
   * Load saved messages from localStorage
   */
  loadSavedMessages() {
    // Always start with empty history
    console.log('Starting with empty chat history');
    return [];
  }

  /**
   * Display initial welcome messages
   */
  displayInitialMessages() {
    if (this.options.initialMessages && this.options.initialMessages.length > 0) {
      this.options.initialMessages.forEach(message => this.addMessage(message, 'bot'));
    }
  }

  /**
   * Create the DOM elements for the chat widget
   */
  createDOM() {
    // Create minimized view
    this.minimizedView = document.createElement('div');
    this.minimizedView.className = 'tde-chat-minimized';
    if (this.options.minimizedContent) {
      this.minimizedView.innerHTML = this.options.minimizedContent;
    } else {
      this.minimizedView.innerHTML = `
        <img src="images/chat-icon.svg" alt="Chat Icon">
        <span>Hey 👋 Need help? Let's chat!</span>
      `;
    }

    // Create expanded view
    this.expandedView = document.createElement('div');
    this.expandedView.className = 'tde-chat-expanded';

    // Create header with two lines
    const header = document.createElement('div');
    header.className = 'tde-chat-header';
    header.innerHTML = `
        <div class="tde-chat-title">
            <div class="title-main"><img src="images/AAA_City_logo_white_small.png" alt="AAA City" class="chat-logo"></div>
            <div class="title-sub">AI Assistant</div>
        </div>
        <button class="tde-chat-close-btn">Close Chat</button>
    `;

    // Create messages container
    this.messagesContainer = document.createElement('div');
    this.messagesContainer.className = 'tde-chat-messages';

    // Create input area
    const inputArea = document.createElement('div');
    inputArea.className = 'tde-chat-input-area';
    inputArea.innerHTML = `
        <input type="text" class="tde-chat-input" placeholder="Type your message...">
        <button class="tde-chat-send">Send</button>
    `;

    // Assemble expanded view
    this.expandedView.appendChild(header);
    this.expandedView.appendChild(this.messagesContainer);
    this.expandedView.appendChild(inputArea);

    // Add both views to container
    this.container.appendChild(this.minimizedView);
    this.container.appendChild(this.expandedView);
  }

  /**
   * Attach event listeners to chat elements
   */
  attachEventListeners() {
    // Toggle on minimized view click
    this.minimizedView.addEventListener('click', () => this.toggle());

    // Close button click
    const closeBtn = this.expandedView.querySelector('.tde-chat-close-btn');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    // Send message on button click
    const sendMessage = () => {
      const inputElem = this.expandedView.querySelector('.tde-chat-input');
      const message = inputElem.value.trim();
      
      if (message && !this.isProcessing) {
        // Add user message to chat
        this.addMessage(message, 'user');
        
        // Clear input
        inputElem.value = '';
        
        // Process the message
        this.processUserMessage(message);
      }
    };

    // Send button click
    const sendBtn = this.expandedView.querySelector('.tde-chat-send');
    sendBtn.addEventListener('click', sendMessage);

    // Send on Enter key
    const inputElem = this.expandedView.querySelector('.tde-chat-input');
    inputElem.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }

  /**
   * Toggle between minimized and expanded states
   */
  toggle() {
    if (this.container.classList.contains('minimized')) {
      // Expanding
      this.container.classList.remove('minimized');
      
      // Focus input field when expanded
      setTimeout(() => {
        const inputElem = this.expandedView.querySelector('.tde-chat-input');
        if (inputElem) {
          inputElem.focus();
        }
      }, 300);
    } else {
      // Minimizing
      this.container.classList.add('minimized');
    }
  }

  /**
   * Reset the session completely
   */
  resetSession() {
    // Clear chat history
    this.clearChatHistory();
    
    // Generate new session ID
    this.sessionId = this.generateNewSessionId();
    
    // Reset first message flag
    this.isFirstMessage = true;
    
    // Clear messages container
    if (this.messagesContainer) {
      this.messagesContainer.innerHTML = '';
    }
    
    // Display initial messages again
    this.displayInitialMessages();
    
    console.log('Chat session reset with new session ID:', this.sessionId);
  }

  /**
   * Process a user message
   */
  async processUserMessage(message) {
    try {
      this.setProcessingState(true);
      const response = await this.sendToN8N(message);
      
      if (response && (response.message || response.output)) {
        this.addMessage(response.message || response.output, 'bot');
      } else {
        // Use fallback response if no valid response
        this.addMessage(this.getFallbackResponse(message), 'bot');
      }
    } catch (error) {
      console.error('Error processing message:', error);
      this.addMessage(this.getFallbackResponse(message), 'bot');
    } finally {
      this.setProcessingState(false);
      this.isFirstMessage = false;
    }
  }

  /**
   * Add a message to the chat
   */
  addMessage(text, sender) {
    const messageElem = document.createElement('div');
    messageElem.className = `tde-chat-message ${sender}`;
    messageElem.textContent = text;
    
    this.messagesContainer.appendChild(messageElem);
    
    // Scroll to bottom
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    
    // Save to history
    this.messageHistory.push({ text, sender, timestamp: new Date().getTime() });
    this.saveMessages();
  }

  /**
   * Get the session ID from localStorage or generate a new one
   */
  getSessionId() {
    const savedId = localStorage.getItem(this.options.chatSessionKey);
    if (savedId) {
      return savedId;
    }
    return this.generateNewSessionId();
  }

  /**
   * Save messages to localStorage
   */
  saveMessages() {
    localStorage.setItem('chat-messages', JSON.stringify(this.messageHistory));
  }

  /**
   * Get fallback response when webhook fails
   */
  getFallbackResponse(message) {
    const { fallbackResponses } = this.options;
    const lowerMessage = message.toLowerCase();
    
    // Check for specific keywords
    if (lowerMessage.includes('help')) {
      return fallbackResponses.help || fallbackResponses.default;
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return fallbackResponses.pricing || fallbackResponses.default;
    }
    
    if (lowerMessage.includes('services') || lowerMessage.includes('offer')) {
      return fallbackResponses.services || fallbackResponses.default;
    }
    
    // Default fallback response
    return fallbackResponses.default;
  }

  /**
   * Create the loading indicator
   */
  createLoadingIndicator() {
    const loadingElem = document.createElement('div');
    loadingElem.className = 'tde-chat-loading';
    
    const dots = document.createElement('div');
    dots.className = 'dots';
    
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot';
      dots.appendChild(dot);
    }
    
    loadingElem.appendChild(dots);
    return loadingElem;
  }

  /**
   * Set processing state (show/hide loading indicator)
   */
  setProcessingState(isProcessing) {
    this.isProcessing = isProcessing;
    
    // Add/remove processing class
    if (isProcessing) {
      this.container.classList.add('processing');
      
      // Add loading indicator
      if (!this.loadingIndicator) {
        this.loadingIndicator = this.createLoadingIndicator();
        this.messagesContainer.appendChild(this.loadingIndicator);
        
        // Scroll to bottom
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
      }
      
      // Disable input
      const inputElem = this.expandedView.querySelector('.tde-chat-input');
      if (inputElem) {
        inputElem.disabled = true;
      }
    } else {
      this.container.classList.remove('processing');
      
      // Remove loading indicator
      if (this.loadingIndicator && this.loadingIndicator.parentNode) {
        this.loadingIndicator.parentNode.removeChild(this.loadingIndicator);
        this.loadingIndicator = null;
      }
      
      // Enable input
      const inputElem = this.expandedView.querySelector('.tde-chat-input');
      if (inputElem) {
        inputElem.disabled = false;
        inputElem.focus();
      }
    }
  }

  /**
   * Send message to N8N webhook
   */
  async sendToN8N(message, action = 'sendMessage') {
    if (!this.options.webhookUrl) {
      console.error('No webhook URL provided');
      return null;
    }

    try {
      // Add metadata about the request
      const payload = {
        sessionId: this.sessionId,
        message,
        action,
        isFirstMessage: this.isFirstMessage,
        metadata: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          referrer: document.referrer,
          ...this.options.metadata
        }
      };

      console.log('Sending to webhook:', this.options.webhookUrl);
      console.log('Payload:', JSON.stringify(payload));

      // Send to webhook
      const response = await fetch(this.options.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...this.options.webhookConfig.headers
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.error(`Webhook error (${response.status})`);
        throw new Error(`Webhook response not OK: ${response.status}`);
      }

      // Get the response text first
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      // Try to parse as JSON, but fall back to plain text if needed
      try {
        return JSON.parse(responseText);
      } catch (jsonError) {
        console.log('Response is not JSON, using as plain text message');
        return { message: responseText };
      }
    } catch (error) {
      console.error('Error sending to webhook:', error);
      return null;
    }
  }
} 
/**
 * AAA City Unified Error Handling System
 * Centralizes error logging, user messaging, and error tracking
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    // Enable console logging in development
    enableConsoleLogging: window.location.hostname === 'localhost' || window.location.hostname.includes('dev'),
    
    // Enable remote error logging (set to false for privacy)
    enableRemoteLogging: false,
    
    // Remote logging endpoint (if enabled)
    remoteLogEndpoint: '/script/log-error.php',
    
    // Maximum errors to store locally
    maxLocalErrors: 50,
    
    // Show user-friendly messages
    showUserMessages: true
  };

  // Error Types
  const ERROR_TYPES = {
    NETWORK: 'network',
    VALIDATION: 'validation', 
    JAVASCRIPT: 'javascript',
    UI: 'ui',
    API: 'api',
    SYSTEM: 'system'
  };

  // Error Severity Levels
  const SEVERITY = {
    LOW: 'low',
    MEDIUM: 'medium', 
    HIGH: 'high',
    CRITICAL: 'critical'
  };

  // Local error storage
  let errorLog = [];

  /**
   * Main error handler function
   * @param {Error|string} error - The error object or message
   * @param {Object} options - Additional options
   */
  function handleError(error, options = {}) {
    const errorData = createErrorObject(error, options);
    
    // Log to various outputs
    logToConsole(errorData);
    logToLocal(errorData);
    
    if (CONFIG.enableRemoteLogging) {
      logToRemote(errorData);
    }
    
    // Show user message if appropriate
    if (CONFIG.showUserMessages && options.showToUser !== false) {
      showUserMessage(errorData);
    }
    
    // Trigger custom callbacks
    if (options.callback && typeof options.callback === 'function') {
      options.callback(errorData);
    }
    
    return errorData;
  }

  /**
   * Create standardized error object
   */
  function createErrorObject(error, options) {
    const timestamp = new Date().toISOString();
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : null;
    
    return {
      id: generateErrorId(),
      timestamp,
      message: errorMessage,
      stack,
      type: options.type || ERROR_TYPES.JAVASCRIPT,
      severity: options.severity || SEVERITY.MEDIUM,
      source: options.source || 'unknown',
      context: options.context || {},
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: options.userId || null,
      sessionId: getSessionId()
    };
  }

  /**
   * Log to browser console with formatting
   */
  function logToConsole(errorData) {
    if (!CONFIG.enableConsoleLogging) return;
    
    const style = getConsoleStyle(errorData.severity);
    const prefix = `[${errorData.type.toUpperCase()}] ${errorData.timestamp}`;
    
    console.groupCollapsed(`%c${prefix}`, style);
    console.error('Message:', errorData.message);
    
    if (errorData.stack) {
      console.error('Stack:', errorData.stack);
    }
    
    if (Object.keys(errorData.context).length > 0) {
      console.error('Context:', errorData.context);
    }
    
    console.error('Error ID:', errorData.id);
    console.groupEnd();
  }

  /**
   * Store error locally
   */
  function logToLocal(errorData) {
    errorLog.unshift(errorData);
    
    // Keep only the most recent errors
    if (errorLog.length > CONFIG.maxLocalErrors) {
      errorLog = errorLog.slice(0, CONFIG.maxLocalErrors);
    }
    
    // Store in localStorage for persistence
    try {
      localStorage.setItem('aaa_city_errors', JSON.stringify(errorLog.slice(0, 10)));
    } catch (e) {
      // localStorage might be full or unavailable
    }
  }

  /**
   * Send error to remote logging service
   */
  function logToRemote(errorData) {
    if (!CONFIG.enableRemoteLogging) return;
    
    // Don't log to remote in development
    if (CONFIG.enableConsoleLogging) return;
    
    fetch(CONFIG.remoteLogEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(errorData)
    }).catch(err => {
      // Silently fail - don't create infinite error loops
      console.warn('Failed to log error remotely:', err);
    });
  }

  /**
   * Show user-friendly error message
   */
  function showUserMessage(errorData) {
    const userMessage = getUserFriendlyMessage(errorData);
    
    // Try to show in existing error container first
    const errorContainer = document.querySelector('.error-message, .alert-danger, .error-alert');
    
    if (errorContainer) {
      errorContainer.textContent = userMessage;
      errorContainer.classList.add('show');
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        errorContainer.classList.remove('show');
      }, 5000);
    } else {
      // Fallback to alert for critical errors
      if (errorData.severity === SEVERITY.CRITICAL) {
        alert(userMessage);
      }
    }
  }

  /**
   * Generate user-friendly error messages
   */
  function getUserFriendlyMessage(errorData) {
    const messages = {
      [ERROR_TYPES.NETWORK]: 'Network connection issue. Please check your internet connection and try again.',
      [ERROR_TYPES.VALIDATION]: 'Please check your input and try again.',
      [ERROR_TYPES.API]: 'Service temporarily unavailable. Please try again in a moment.',
      [ERROR_TYPES.JAVASCRIPT]: 'An unexpected error occurred. Please refresh the page and try again.',
      [ERROR_TYPES.UI]: 'Interface error. Please refresh the page.',
      [ERROR_TYPES.SYSTEM]: 'System error. Please contact support if the problem persists.'
    };
    
    return messages[errorData.type] || 'An unexpected error occurred. Please try again.';
  }

  /**
   * Console styling based on severity
   */
  function getConsoleStyle(severity) {
    const styles = {
      [SEVERITY.LOW]: 'color: #666; background: #f0f0f0',
      [SEVERITY.MEDIUM]: 'color: #856404; background: #fff3cd',
      [SEVERITY.HIGH]: 'color: #721c24; background: #f8d7da',
      [SEVERITY.CRITICAL]: 'color: #fff; background: #dc3545'
    };
    
    return styles[severity] || styles[SEVERITY.MEDIUM];
  }

  /**
   * Generate unique error ID
   */
  function generateErrorId() {
    return 'err_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get or create session ID
   */
  function getSessionId() {
    let sessionId = sessionStorage.getItem('aaa_city_session_id');
    
    if (!sessionId) {
      sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('aaa_city_session_id', sessionId);
    }
    
    return sessionId;
  }

  // Convenience methods for different error types
  const ErrorHandler = {
    // Main error handler
    handle: handleError,
    
    // Specific error type handlers
    network: (error, options = {}) => handleError(error, { ...options, type: ERROR_TYPES.NETWORK }),
    validation: (error, options = {}) => handleError(error, { ...options, type: ERROR_TYPES.VALIDATION }),
    api: (error, options = {}) => handleError(error, { ...options, type: ERROR_TYPES.API }),
    ui: (error, options = {}) => handleError(error, { ...options, type: ERROR_TYPES.UI }),
    system: (error, options = {}) => handleError(error, { ...options, type: ERROR_TYPES.SYSTEM }),
    
    // Severity-specific handlers
    critical: (error, options = {}) => handleError(error, { ...options, severity: SEVERITY.CRITICAL }),
    
    // Utility methods
    getErrorLog: () => [...errorLog],
    clearErrorLog: () => {
      errorLog = [];
      localStorage.removeItem('aaa_city_errors');
    },
    
    // Constants
    TYPES: ERROR_TYPES,
    SEVERITY: SEVERITY
  };

  // Global error handlers
  window.addEventListener('error', (event) => {
    handleError(event.error, {
      type: ERROR_TYPES.JAVASCRIPT,
      source: 'global_error_handler',
      context: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      },
      severity: SEVERITY.HIGH
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    handleError(event.reason, {
      type: ERROR_TYPES.JAVASCRIPT,
      source: 'unhandled_promise_rejection',
      severity: SEVERITY.HIGH
    });
  });

  // Export to global scope
  window.ErrorHandler = ErrorHandler;
  
  // Also make it available as a module if needed
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
  }

})();
//GLOBAL VARIBALES

//selector constants
var root = $("html, body");
const main_window = $(window),
  pageBody = $("body"),
  bdyOnePage = $("body.landing-page-demo "),
  toTopBtn = $(".back-to-top"),
  textInput = $("form.main-form .text-input"),
  tabLink = $(".ma-tabs .tabs-links .tab-link");

$(function () {
  ("use strict");

  // function to fire the conter plugin
  let counterShowsUp = false;

  function fireCounter() {
    if ($(".js-stats-counter").length) {
      if (jQuery().countTo && counterShowsUp === false) {
        let pos = $(".js-stats-counter").offset().top;
        if (main_window.scrollTop() + main_window.innerHeight() - 50 >= pos) {
          $(".counter").countTo();
          counterShowsUp = true;
        }
      }
    }
  }

  // Ensure buttons are positioned correctly and properly attached to the DOM
  function initBackToTopButtons() {
    // Force the back-to-top buttons to stay at top z-index
    const backToTopBtn = document.getElementById('back-to-top');
    const backToTopRightBtn = document.getElementById('back-to-top-right');

    if (backToTopBtn) {
      // Move to body to avoid any stacking context issues
      if (backToTopBtn.parentElement !== document.body) {
        document.body.appendChild(backToTopBtn);
      }
      backToTopBtn.style.zIndex = "2147483647";
    }

    if (backToTopRightBtn) {
      // Move to body to avoid any stacking context issues
      if (backToTopRightBtn.parentElement !== document.body) {
        document.body.appendChild(backToTopRightBtn);
      }
      backToTopRightBtn.style.zIndex = "2147483647";
    }
  }

  // Initialize buttons on page load
  initBackToTopButtons();

  /* ********* Dark theme is now the only theme ***********/

  const darkTheme_class = "dark-theme";

  // Ensure the body always has the dark theme class
  if (!pageBody.hasClass(darkTheme_class)) {
    pageBody.addClass(darkTheme_class);
  }

  // Function to load animation scripts after page load
  function loadAnimationScripts() {
    // Helper function to load a script
    function loadScript(src, callback) {
      var script = document.createElement('script');
      script.src = src;
      script.onload = callback || function() {};
      document.body.appendChild(script);
    }

    // Load animation scripts
    setTimeout(function() {
      loadScript('js/image-circle-effect.js');

      // Load wave.js and initialize wave effect after the script is loaded
      loadScript('js/wave.js', function() {
        // Check if we're on desktop (screen width > 767px)
        const isMobile = window.innerWidth <= 767;

        // Initialize the wave effect for the Why Choose Us section only on desktop
        if (!isMobile && document.getElementById('why-choose-us-waves')) {
          const whyChooseUsWave = WaveEffect('#why-choose-us-waves', {
            speed: 6,                // Wave animation speed (kept fast)
            size: 3,                 // Particle size (decreased from 4)
            color1: [0, 0.7, 1, 0.4],  // Start color (slightly reduced opacity)
            color2: [0, 0.5, 0.5, 0.4], // End color (slightly reduced opacity)
            density: 6,              // Point density (increased from 5 for smaller, more numerous points)
            depth: 250               // Wave depth (decreased from 300)
          });
          console.log('Wave effect initialized successfully');
        }
      });
    }, 100);
  }

  // Load animation scripts after window load
  $(window).on('load', loadAnimationScripts);

  // Apply custom styling to reCAPTCHA after it loads
  if (typeof grecaptcha !== 'undefined') {
    // Add a small delay to ensure the reCAPTCHA is fully rendered
    setTimeout(function() {
      const recaptchaIframe = document.querySelector('.g-recaptcha iframe');
      if (recaptchaIframe) {
        recaptchaIframe.style.backgroundColor = '#0d1857'; // Site accent color
      }
    }, 1000);
  } else {
    // If grecaptcha is not loaded yet, wait for it
    window.addEventListener('load', function() {
      setTimeout(function() {
        if (typeof grecaptcha !== 'undefined') {
          const recaptchaIframe = document.querySelector('.g-recaptcha iframe');
          if (recaptchaIframe) {
            recaptchaIframe.style.backgroundColor = '#0d1857'; // Site accent color
          }
        }
      }, 1500);
    });
  }

  if ($(textInput).length) {
    let inputHasText = "has-text";

    if ($(textInput).val().trim() !== "")
      $(textInput).parent().addClass(inputHasText);
    else $(textInput).parent().removeClass(inputHasText);

    /*
        check if the form input has data or not while focusing out
        from the input to set the label
        in the right place by the css rules.
        */
    $(textInput).on("focusout", function () {
      if ($(this).val().trim() !== "") {
        $(this).parent().addClass(inputHasText);
      } else {
        $(this).parent().removeClass(inputHasText);
      }
    });
  }

  // Smooth Scrolling When Clicking on Links Start
  $('a[data-scroll]').on("click", function (e) {
    //set the target to the element that has the ID set to by "data-scroll"
    const target = $("#" + $(this).data("scroll"));

    // If it's a valid target, scroll to it
    if (target.length) {
      e.preventDefault();

      root.animate({
        scrollTop: target.offset().top - 90,
      },
        800
      );
    }
  });

  // Smooth Scrolling When Clicking on Back To Top Button
  toTopBtn.on("click", function () {
    if (root.length) {
      root.animate({
        scrollTop: 0,
      },
        800
      );
    }
    return false;
  });

  // Simple scroll handler with no special tricks
  main_window.on("scroll", function () {
    const scrollPosition = $(this).scrollTop();

    // Just show/hide the back to top button based on scroll position
    if (scrollPosition > 300) {
      toTopBtn.addClass("show");
    } else {
      toTopBtn.removeClass("show");
    }

    // fire the counter
    fireCounter();
  });

  // Force initial check of scroll position on page load
  if (main_window.scrollTop() > 300) {
    toTopBtn.addClass("show");
  }

  // Reposition buttons on resize
  main_window.on("resize", initBackToTopButtons);

  // Ensure buttons stay properly positioned
  setInterval(initBackToTopButtons, 2000);

  /* *******   initialize Counter plugin ********/
  fireCounter();

  /* ********* set the Background Image path and opacity for elements that has the  a vlaue for data-bg-img attribute***********/
  const bg_img = $("*");
  bg_img.each(function () {
    if ($(this).attr("data-bg-img")) {
      $(this).css("background-image", `url(${$(this).attr("data-bg-img")})`);
    }
    if ($(this).attr("data-bg-opacity")) {
      $(this).css("opacity", `${$(this).attr("data-bg-opacity")}`);
    }
  });

  /* *******  Start skills Bars  ********/
  $(window).on("scroll", function () {
    $(".skills .skill .skill-bar .bar").each(function () {
      let barOriginalPosition = $(this).offset().top + $(this).outerHeight();
      let barCurrPosition = $(window).scrollTop() + $(window).height();
      let widthValue = $(this).attr("data-skill-val");
      if (barCurrPosition > barOriginalPosition) {
        $(this).css({
          width: widthValue + "%",
        });
      }
    });
  });

  /* ******* Start Percentage loading screen interactions ********/
  let percentage = 0;
  let LoadingCounter = setInterval(function () {
    if (percentage <= 100) {
      // $('#loading-screen ').css('opacity', (100 - percentage));
      $("#loading-screen .loading-counter").text(percentage + "%");
      $("#loading-screen .bar").css("width", (100 - percentage) / 2 + "%");
      $("#loading-screen .progress-line").css(
        "transform",
        "scale(" + percentage / 100 + ")"
      );
      percentage++;
    } else {
      $("#loading-screen").fadeOut(500);
      setTimeout(() => {
        $("#loading-screen").remove();
      }, 1500);
      clearInterval(LoadingCounter);
    }
  }, 10);

  // Function to check if an element is in viewport
  function isInViewport(element) {
    if (element.length === 0) return false;

    const rect = element[0].getBoundingClientRect();
    return (
      rect.top <= window.innerHeight &&
      rect.bottom >= 0
    );
  }

  // End Smooth Scrolling To Window Top When Clicking on Back To Top Button

  /*************Start Contact Form Functionality************/

  const contactForm = document.getElementById('contact-us-form'),
    userName = $("#user-name"),
    userEmail = $("#user-email"),
    msgSubject = $("#msg-subject"),
    msgText = $("#msg-text"),
    submitBtn = $("#submit-btn");

  let isValidInput = false,
    isValidEmail = false;

  function ValidateNotEmptyInput(input, errMsg) {
    if (input.length) {
      if (input.val().trim() === "") {
        $(input).siblings(".error-msg").text(errMsg).css("display", "block");
        isValidInput = false;
      } else {
        $(input).siblings(".error-msg").text("").css("display", "none");
        isValidInput = true;
      }
    }
  }

  function validateEmailInput(emailInput) {
    let pattern =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (pattern.test(emailInput.val()) === false) {
      $(emailInput)
        .siblings(".error-msg")
        .text("Please Enter a valid Email")
        .css("display", "block");
      isValidEmail = false;
    } else {
      $(emailInput).siblings(".error-msg").text("").css("display", "none");
      isValidEmail = true;
    }
  }

  /*************End Contact Form Functionality************/

  /* *******  loading tilt.js library ********/
  if (jQuery().tilt) {
    $("[data-tilt]").tilt({
      perspective: 1000,
    });
  }

  /* ----------------------------------
    End Vendors plugins options Area
     ---------------------------------- */

  /* ----------------------------------
    Start Contact Form Validation
     ---------------------------------- */

  // Contact Form Validation
  if (contactForm) {
    // Get form elements
    const nameInput = document.getElementById('user-name');
    const emailInput = document.getElementById('user-email');
    const subjectInput = document.getElementById('msg-subject');
    const messageInput = document.getElementById('msg-text');
    const submitBtn = document.getElementById('submit-btn');
    const allInputs = [nameInput, emailInput, subjectInput, messageInput];

    // Show styled validation message
    function showError(input, message) {
        const errorMsgSpan = input.parentElement.querySelector('.error-msg');
        errorMsgSpan.textContent = message;
        errorMsgSpan.style.display = 'block';
        input.classList.add('is-invalid');
    }

    // Clear error message
    function clearError(input) {
        const errorMsgSpan = input.parentElement.querySelector('.error-msg');
        errorMsgSpan.textContent = '';
        errorMsgSpan.style.display = 'none';
        input.classList.remove('is-invalid');
    }

    // Validate name field (letters, spaces, hyphens, apostrophes)
    function validateName(input) {
        const value = input.value.trim();
        if (value === '') {
            showError(input, 'Name is required');
            return false;
        } else if (value.length < 2) {
            showError(input, 'Name must be at least 2 characters');
            return false;
        } else if (value.length > 50) {
            showError(input, 'Name must be no more than 50 characters');
            return false;
        } else if (!/^[A-Za-z\s\-\']+$/.test(value)) {
            showError(input, 'Name can only contain letters, spaces, hyphens, and apostrophes');
            return false;
        } else {
            clearError(input);
            return true;
        }
    }

    // Validate email field
    function validateEmail(input) {
        const value = input.value.trim();
        if (value === '') {
            showError(input, 'Email is required');
            return false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            showError(input, 'Please enter a valid email address');
            return false;
        } else {
            clearError(input);
            return true;
        }
    }

    // Validate company/subject field
    function validateSubject(input) {
        const value = input.value.trim();
        if (value === '') {
            showError(input, 'Company name is required');
            return false;
        } else if (value.length < 2) {
            showError(input, 'Company name must be at least 2 characters');
            return false;
        } else if (value.length > 100) {
            showError(input, 'Company name must be no more than 100 characters');
            return false;
        } else {
            clearError(input);
            return true;
        }
    }

    // Validate message field
    function validateMessage(input) {
        const value = input.value.trim();
        if (value === '') {
            showError(input, 'Message is required');
            return false;
        } else if (value.length < 10) {
            showError(input, 'Message must be at least 10 characters');
            return false;
        } else if (value.length > 1000) {
            showError(input, 'Message must be no more than 1000 characters');
            return false;
        } else {
            clearError(input);
            return true;
        }
    }

    // Validate reCAPTCHA
    function validateReCaptcha() {
        const recaptchaResponse = grecaptcha.getResponse();
        const recaptchaErrorMsg = document.querySelector('.recaptcha-error-msg');

        if (!recaptchaResponse) {
            recaptchaErrorMsg.textContent = 'Please complete the reCAPTCHA verification';
            recaptchaErrorMsg.style.display = 'block';
            return false;
        } else {
            recaptchaErrorMsg.textContent = '';
            recaptchaErrorMsg.style.display = 'none';
            return true;
        }
    }

    // Validate all form fields
    function validateForm() {
        const isNameValid = validateName(nameInput);
        const isEmailValid = validateEmail(emailInput);
        const isSubjectValid = validateSubject(subjectInput);
        const isMessageValid = validateMessage(messageInput);
        const isRecaptchaValid = validateReCaptcha();

        return isNameValid && isEmailValid && isSubjectValid && isMessageValid && isRecaptchaValid;
    }

    // Add input event listeners for real-time validation
    nameInput.addEventListener('input', function() {
        validateName(this);
    });

    emailInput.addEventListener('input', function() {
        validateEmail(this);
    });

    subjectInput.addEventListener('input', function() {
        validateSubject(this);
    });

    messageInput.addEventListener('input', function() {
        validateMessage(this);
    });

    // Add blur event listeners for validation when leaving a field
    allInputs.forEach(input => {
        input.addEventListener('blur', function() {
            // Call appropriate validation function based on input ID
            if (this.id === 'user-name') {
                validateName(this);
            } else if (this.id === 'user-email') {
                validateEmail(this);
            } else if (this.id === 'msg-subject') {
                validateSubject(this);
            } else if (this.id === 'msg-text') {
                validateMessage(this);
            }
        });
    });

    // Form submission with enhanced validation
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault(); // Always prevent default form submission

      // First validate all fields
      const isValid = validateForm();

      if (!isValid) {
          // Focus the first input with an error
          const firstInvalidInput = document.querySelector('.is-invalid');
          if (firstInvalidInput) {
              firstInvalidInput.focus();
          }
          return false;
      }

      // Show loading state
      submitBtn.disabled = true;
      const originalButtonText = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Sending...';

      // Create FormData
      const formData = new FormData(contactForm);

      // Add reCAPTCHA response to form data
      formData.append('g-recaptcha-response', grecaptcha.getResponse());

      // Log the form data being sent (for debugging)
      console.log('Sending form data to:', contactForm.action);
      for (let pair of formData.entries()) {
          console.log(pair[0] + ': ' + pair[1]);
      }

      // Use AJAX to submit the form
      fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: {
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
              // Don't set Content-Type when using FormData - it will be set automatically with boundary
          }
      })
      .then(response => {
          console.log('Server response status:', response.status);

          if (!response.ok) {
              if (response.status === 405) {
                  throw new Error('Method Not Allowed (405): The server does not allow POST requests to this endpoint. Please check server configuration.');
              }
              throw new Error(`Server responded with status: ${response.status}`);
          }

          // First try to get response as text
          return response.text().then(text => {
              try {
                  // Try to parse as JSON
                  return JSON.parse(text);
              } catch (e) {
                  // If not valid JSON, return the text
                  console.error('Server returned non-JSON response:', text);
                  return {
                      success: false,
                      message: 'Server returned an invalid response format',
                      raw: text
                  };
              }
          });
      })
      .then(data => {
          // Reset button state
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalButtonText;

          // Handle the response
          handleFormSubmissionResponse(data);
      })
      .catch(error => {
          // Reset button state
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalButtonText;

          // Show error message
          alert('Error: ' + error.message);
          console.error('Form submission error:', error);
      });
    });

    // Handle successful form submission response
    function handleFormSubmissionResponse(response) {
        if (response.success) {
            // Show success message
            const doneMsg = contactForm.querySelector('.done-msg');
            doneMsg.textContent = response.message;
            doneMsg.classList.add('show');

            // Reset form and reCAPTCHA
            contactForm.reset();
            grecaptcha.reset();

            // Clear success message after delay
            setTimeout(function() {
                doneMsg.textContent = '';
                doneMsg.classList.remove('show');
            }, 5000);
        } else {
            // Show error message
            if (response.errors && Array.isArray(response.errors)) {
                // Display field-specific errors
                response.errors.forEach(error => {
                    // Attempt to determine which field the error is for
                    if (error.toLowerCase().includes('name')) {
                        showError(nameInput, error);
                    } else if (error.toLowerCase().includes('email')) {
                        showError(emailInput, error);
                    } else if (error.toLowerCase().includes('company')) {
                        showError(subjectInput, error);
                    } else if (error.toLowerCase().includes('message')) {
                        showError(messageInput, error);
                    }
                });
            } else {
                // Display general error message
                alert(response.message || 'An error occurred. Please try again.');
            }
        }
    }
  }
});

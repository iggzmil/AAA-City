/*===================================================
Project: flex-it - IT Solutions & Business Services Responsive HTML5 Bootstrap5  Website Template
Auther: amin-themes
Version: 2.0
Last change:22 Mar 2023
Template Description: IT Solutions & Business Services Responsive HTML5 Bootstrap5  Website Template
====================================================*/

//GLOBAL VARIBALES

//selector constants
var root = $("html, body");
const main_window = $(window),
  pageBody = $("body"),
  bdyOnePage = $("body.landing-page-demo "),
  toTopBtn = $(".back-to-top"),
  heroVegasSlider = $(".page-hero.hero-vegas-slider"),
  textInput = $("form.main-form .text-input"),
  tabLink = $(".ma-tabs .tabs-links .tab-link"),
  portfolioGroup = $(".portfolio .portfolio-group");

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
    // Move buttons to body to avoid any stacking context issues
    const backToTopBtn = document.getElementById('back-to-top');
    const backToTopRightBtn = document.getElementById('back-to-top-right');
    
    if (backToTopBtn && backToTopBtn.parentElement !== document.body) {
      document.body.appendChild(backToTopBtn);
    }
    
    if (backToTopRightBtn && backToTopRightBtn.parentElement !== document.body) {
      document.body.appendChild(backToTopRightBtn);
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

  /* Start Portfolio btns  */
  if ($(".portfolio .portfolio-btn").length) {
    $(".portfolio .portfolio-btn").on("click", function () {
      $(this).addClass("active").siblings().removeClass("active");

      const $filterValue = $(this).attr("data-filter");
      portfolioGroup.isotope({
        filter: $filterValue,
      });
    });
  }

  /* *******   initialize Counter plugin ********/
  fireCounter();

  /* ********* set the Background Image path and opacity for elements that has the  a vlaue for data-bg-img attribute***********/
  const bg_img = $("*");
  bg_img.each(function () {
    if ($(this).attr("data-bg-img")) {
      $(this).css("background-image", `url(%24%7b%24(this.html).attr("data-bg-img")}`);
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

  /* *******  loadding simpleParallax.js library ********/
  if (!(typeof window.simpleParallax === "undefined")) {
    // Select all parallax images
    let parallaxBlock = document.querySelectorAll(".parallax-img");
    if (parallaxBlock.length) {
      // Apply parallax to all images with more conservative settings
      new simpleParallax(parallaxBlock, {
        delay: 0.6,
        scale: 1.1,  // Much smaller scale to prevent layout issues
        overflow: true,
        transition: 'cubic-bezier(0,0,0,1)'
      });
    }
  }

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

  const contactForm = $("#contact-us-form"),
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

  // DISABLED: Using custom form handler in script/email/contact-form-validation.js instead
  // submitBtn.on("click", function (e) {
  //   e.preventDefault();

  //   ValidateNotEmptyInput(userName, "Please Enter Your Name");
  //   ValidateNotEmptyInput(userEmail, "Please Enter Your Email");
  //   ValidateNotEmptyInput(msgSubject, "Please Enter Your subject");
  //   ValidateNotEmptyInput(msgText, "Please Enter Your Message");
  //   validateEmailInput(userEmail);

  //   if (isValidInput && isValidEmail) {
  //     $.ajax({
  //       type: "POST",
  //       url: contactForm.attr("action"),
  //       data: contactForm.serialize(),

  //       success: function (data) {
  //         $(".done-msg")
  //           .text("Thank you, Your Message Was Received!")
  //           .toggleClass("show");
  //         setTimeout(function () {
  //           $(".done-msg").text("").toggleClass("show");
  //         }, 3000);
  //         contactForm[0].reset();
  //       },
  //     });
  //     return false;
  //   }
  // });

  /*************End Contact Form Functionality************/

  /* ----------------------------------
    Start Vendors plugins options Area
    ---------------------------------- */

  //initialize swiper [Hero Section] //fade slider
  if ($(".hero-swiper-slider.fade-effect .swiper-container").length) {
    const heroSlider = new Swiper(
      ".hero-swiper-slider.fade-effect .swiper-container",
      {
        speed: 1000,
        loop: true,
        reverseDirection: true,
        effect: "fade",
        fadeEffect: {
          crossFade: true,
        },
        on: {
          init: function () {
            let thisSlider = this;
            $(".slides-count").html("0" + (this.slides.length - 2));

            $(".slide-num").html("0" + (this.realIndex + 1));
          },
          slideChange: function () {
            $(".slide-num").html("0" + (this.realIndex + 1));
          },
        },
        autoplay: {
          delay: 5000,
          disableOnInteraction: true,
        },
        pagination: {
          el: ".hero-swiper-slider.fade-effect .swiper-pagination",
          type: "bullets",
          clickable: true,
        },
        navigation: {
          nextEl: ".hero-swiper-slider.fade-effect .swiper-button-next",
          prevEl: ".hero-swiper-slider.fade-effect .swiper-button-prev",
        },
      }
    );
  }

  /*--- landing page Hero slider ---*/
  if ($(".hero-swiper-slider.Landing-page-slider .swiper-container").length) {
    const hero_swiper_slider = new Swiper(
      ".hero-swiper-slider.Landing-page-slider .swiper-container",
      {
        // Optional parameters
        direction: "horizontal",
        loop: true,
        touchEventsTarget: "container",
        effect: "fade",
        fadeEffect: {
          crossFade: true,
        },
        speed: 1000,
        parallax: true,
        watchSlidesProgress: true,
        on: {
          init: function () {
            let thisSlider = this;
            $(".slides-count").html("0" + (this.slides.length - 2));

            $(".slide-num").html("0" + (this.realIndex + 1));
          },
          slideChange: function () {
            $(".slide-num").html("0" + (this.realIndex + 1));
          },
        },
        autoplay: {
          delay: 5000,
          disableOnInteraction: true,
        },

        // If we need pagination
        pagination: {
          el: ".hero-swiper-slider.Landing-page-slider .swiper-pagination",
          clickable: true,
          type: "bullets",
        },

        // Navigation arrows
        navigation: {
          nextEl: ".hero-swiper-slider.Landing-page-slider .swiper-button-next",
          prevEl: ".hero-swiper-slider.Landing-page-slider .swiper-button-prev",
        },
      }
    );
  }

  /*---- portfolio Slider ----*/
  if ($(".portfolio-slider  .swiper-container").length) {
    const portfolio_slider = new Swiper(".portfolio-slider .swiper-container", {
      // Optional parameters
      direction: "horizontal",
      loop: true,
      touchEventsTarget: "container",
      slidesPerView: 3,
      spaceBetween: 30,
      mousewheel: true,
      centeredSlides: true,
      speed: 1000,
      autoplay: false,

      breakpoints: {
        0: {
          slidesPerView: 1,
        },
        767: {
          slidesPerView: 1,
        },
        991: {
          slidesPerView: 2,
        },
        1199: {
          slidesPerView: 3,
        },
      },

      // Navigation arrows
      navigation: {
        nextEl: ".portfolio-slider .swiper-button-next",
        prevEl: ".portfolio-slider .swiper-button-prev",
      },
    });
  }

  /*---- testimonials Slider ----*/
  if ($(".testimonials-slider  .swiper-container").length) {
    const testimonials_slider = new Swiper(
      ".testimonials-slider .swiper-container",
      {
        // Optional parameters
        direction: "horizontal",
        loop: true,
        touchEventsTarget: "container",
        slidesPerView: 1,
        spaceBetween: 30,
        parallax: true,
        speed: 800,
        autoplay: {
          delay: 5000,
        },

        // Navigation arrows
        navigation: {
          nextEl: ".testimonials-slider .swiper-button-next",
          prevEl: ".testimonials-slider .swiper-button-prev",
        },
        pagination: {
          el: ".testimonials-slider .swiper-pagination",
          clickable: true,
          type: "bullets",
        },
      }
    );
  }

  /* *******  loading fancybox.js library ********/
  if ($("*").fancybox) {
    $().fancybox({
      selector: '[data-fancybox=".show-in-fancybox "]:visible',
      loop: true,
      buttons: ["zoom", "close"],
    });
  }

  /* *******  loading tilt.js library ********/
  if (jQuery().tilt) {
    $("[data-tilt]").tilt({
      perspective: 1000,
    });
  }

  /* *******  Loading the isotope plugin ********/
  if (jQuery().isotope) {
    portfolioGroup.isotope({
      // options
      itemSelector: ".portfolio-item",
      layoutMode: "masonry",
      percentPosition: false,
      filter: "*",
      stagger: 30,
      containerStyle: null,
    });
  }

  /* *******  Start particles.js ********/

  //get the clr-main value from the html element

  let particlesObj = {};
  const getThemeMainColor = getComputedStyle($(":root")[0]).getPropertyValue(
    "--clr-main"
  );
  const getThemeSecondaryColor = getComputedStyle(
    $(":root")[0]
  ).getPropertyValue("--clr-secondary");

  const dd = () => {
    if ($(".particles-js.dots").length) {
      particlesObj = {
        particlesClr: getThemeMainColor,
        particleNumber: 150,
        particleNumber: 150,
        particleSize: 3,
        particleOpacity: 0.5,
      };
    } else if ($(".particles-js.bubels").length) {
      particlesObj = {
        particlesClr: getThemeMainColor,
        particleNumber: 15,
        particleSize: 25,
        particleOpacity: 0.25,
      };
    } else {
      particlesObj = {};
    }
  };

  dd();
  if ($(".particles-js").length) {
    // constant to hold the particals options
    const customParticlesOptions = {
      particles: {
        number: {
          value: particlesObj.particleNumber,
          density: {
            enable: true,
            value_area: 500,
          },
        },
        color: {
          value: particlesObj.particlesClr,
        },
        shape: {
          type: "circle",
          stroke: {
            width: 0,
            color: "#000000",
          },
          polygon: {
            nb_sides: 5,
          },
          image: {
            src: "img/github.svg",
            width: 100,
            height: 100,
          },
        },
        opacity: {
          value: particlesObj.particleOpacity,
          random: true,
          anim: {
            enable: true,
            speed: 1,
            opacity_min: 0,
            sync: false,
          },
        },
        size: {
          value: particlesObj.particleSize,
          random: true,
          anim: {
            enable: true,
            speed: 5,
            size_min: 0.3,
            sync: false,
          },
        },
        line_linked: {
          enable: false,
          distance: 150,
          color: "#ffffff",
          opacity: 0.4,
          width: 1,
        },
        move: {
          enable: true,
          speed: 5,
          direction: "none",
          random: true,
          straight: false,
          out_mode: "out",
          bounce: false,
          attract: {
            enable: false,
            rotateX: 600,
            rotateY: 1200,
          },
        },
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: {
            enable: false,
            mode: "bubble",
          },
          onclick: {
            enable: false,
            mode: "repulse",
          },
          resize: true,
        },
        modes: {
          grab: {
            distance: 400,
            line_linked: {
              opacity: 1,
            },
          },
          bubble: {
            distance: 250,
            size: 0,
            duration: 2,
            opacity: 0,
            speed: 3,
          },
          repulse: {
            distance: 400,
            duration: 0.4,
          },
          push: {
            particles_nb: 4,
          },
          remove: {
            particles_nb: 2,
          },
        },
      },
      retina_detect: true,
    };
    particlesJS("particles-js", customParticlesOptions);
  }

  /* *******  loading Splitting.js library ********/
  if (!(typeof window.Splitting === "undefined")) {
    if ($("[data-splitting]").length) {
      Splitting();
    }
  }

  /* *******  loading simpleParallax.js library ********/
  if (!(typeof window.simpleParallax === "undefined")) {
    // Select all parallax images
    let parallaxBlock = document.querySelectorAll(".parallax-img");
    if (parallaxBlock.length) {
      // Apply parallax to all images with more conservative settings
      new simpleParallax(parallaxBlock, {
        delay: 0.6,
        scale: 1.1,  // Much smaller scale to prevent layout issues
        overflow: true,
        transition: 'cubic-bezier(0,0,0,1)'
      });
    }
  }
  /* ----------------------------------
    End Vendors plugins options Area
     ---------------------------------- */
});

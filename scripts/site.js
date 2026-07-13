(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");

  var navToggle = document.querySelector(".site-nav__toggle");
  var navLinks = document.querySelector(".site-nav__links");
  var profileToggle = document.querySelector(".profile-card__toggle");
  var profileLinks = document.querySelector(".profile-card__links");

  function normalizePath(pathname) {
    var normalized = pathname.replace(/index\.html$/, "");
    if (normalized.length > 1 && normalized.slice(-1) !== "/") normalized += "/";
    return normalized || "/";
  }

  var toggles = [];

  function closeToggle(toggle, returnFocus) {
    toggle.button.setAttribute("aria-expanded", "false");
    toggle.panel.classList.remove(toggle.className);
    if (returnFocus) toggle.button.focus();
  }

  function closeOtherToggles(activeToggle) {
    toggles.forEach(function (toggle) {
      if (toggle !== activeToggle) closeToggle(toggle, false);
    });
  }

  function bindToggle(button, panel, className) {
    if (!button || !panel) return null;
    var toggle = { button: button, panel: panel, className: className };
    toggles.push(toggle);
    button.addEventListener("click", function () {
      var expanded = button.getAttribute("aria-expanded") === "true";
      closeOtherToggles(toggle);
      button.setAttribute("aria-expanded", String(!expanded));
      panel.classList.toggle(className, !expanded);
    });
    panel.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeToggle(toggle, false);
    });
    return toggle;
  }

  bindToggle(navToggle, navLinks, "is-open");
  bindToggle(profileToggle, profileLinks, "is-open");

  document.querySelectorAll(".site-nav__links a").forEach(function (link) {
    if (normalizePath(link.pathname) === normalizePath(window.location.pathname)) {
      link.setAttribute("aria-current", "page");
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    toggles.forEach(function (toggle) {
      if (toggle.button.getAttribute("aria-expanded") === "true") {
        closeToggle(toggle, true);
      }
    });
  });

  document.addEventListener("click", function (event) {
    toggles.forEach(function (toggle) {
      if (!toggle.button.contains(event.target) && !toggle.panel.contains(event.target)) {
        closeToggle(toggle, false);
      }
    });
  });

  window.addEventListener("resize", function () {
    if (window.matchMedia("(min-width: 57.8125em)").matches) {
      toggles.forEach(function (toggle) { closeToggle(toggle, false); });
    }
  });
})();

(function () {
  "use strict";

  var navToggle = document.querySelector(".site-nav__toggle");
  var navLinks = document.querySelector(".site-nav__links");
  var profileToggle = document.querySelector(".profile-card__toggle");
  var profileLinks = document.querySelector(".profile-card__links");

  function normalizePath(pathname) {
    var normalized = pathname.replace(/index\.html$/, "");
    if (normalized.length > 1 && normalized.slice(-1) !== "/") normalized += "/";
    return normalized || "/";
  }

  function bindToggle(button, panel, className) {
    if (!button || !panel) return;
    button.addEventListener("click", function () {
      var expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      panel.classList.toggle(className, !expanded);
    });
  }

  bindToggle(navToggle, navLinks, "is-open");
  bindToggle(profileToggle, profileLinks, "is-open");

  document.querySelectorAll(".site-nav__links a").forEach(function (link) {
    if (normalizePath(link.pathname) === normalizePath(window.location.pathname)) {
      link.setAttribute("aria-current", "page");
    }
  });

  function closePanel(button, panel, className) {
    if (!button || !panel) return;
    button.setAttribute("aria-expanded", "false");
    panel.classList.remove(className);
  }

  document.addEventListener("click", function (event) {
    if (navToggle && navLinks && !navToggle.contains(event.target) && !navLinks.contains(event.target)) {
      closePanel(navToggle, navLinks, "is-open");
    }
    if (profileToggle && profileLinks && !profileToggle.contains(event.target) && !profileLinks.contains(event.target)) {
      closePanel(profileToggle, profileLinks, "is-open");
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    closePanel(navToggle, navLinks, "is-open");
    closePanel(profileToggle, profileLinks, "is-open");
  });
})();

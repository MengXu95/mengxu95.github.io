(function () {
  "use strict";

  var navToggle = document.querySelector(".site-nav__toggle");
  var navLinks = document.querySelector(".site-nav__links");
  var profileToggle = document.querySelector(".profile-card__toggle");
  var profileLinks = document.querySelector(".profile-card__links");

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
})();

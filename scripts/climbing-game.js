(function () {
  "use strict";

  var SVG_NAMESPACE = "http://www.w3.org/2000/svg";
  var MOVE_SUCCESS_RATE = 0.9;
  var CLIMBER_OFFSET = 10;
  var SHARED_COUNTER_URL = "https://api.counterapi.dev/v1/mengxu95-github-io/climbing-5-12a-successes/up";
  var COMPLETION_NUMBER_KEY = "mx-climb-5-12a-completion-number-v1";
  var LOCAL_COUNTER_KEY = "mx-climb-5-12a-local-counter-v1";

  var route = ["r0", "r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8"];
  var choices = [
    ["r1", "d1"],
    ["r2", "d2"],
    ["r3", "d3"],
    ["r4", "d4"],
    ["r5", "d5"],
    ["r6", "d6"],
    ["r7", "d7"],
    ["r8", "d8"]
  ];

  var holds = [
    { id: "r0", x: 146, y: 602, color: "#27877e", shape: "jug", rotation: -6, route: true, label: "deep teal starting" },
    { id: "r1", x: 202, y: 548, color: "#cf654c", shape: "horn", rotation: 18, route: true, label: "terracotta" },
    { id: "r2", x: 116, y: 482, color: "#4169a9", shape: "edge", rotation: -12, route: true, label: "cobalt" },
    { id: "r3", x: 188, y: 414, color: "#66884e", shape: "sloper", rotation: 9, route: true, label: "moss green" },
    { id: "r4", x: 92, y: 345, color: "#c76078", shape: "pinch", rotation: -20, route: true, label: "dusty rose" },
    { id: "r5", x: 160, y: 279, color: "#d2a536", shape: "pocket", rotation: 7, route: true, label: "mustard" },
    { id: "r6", x: 224, y: 211, color: "#875b91", shape: "blob", rotation: 14, route: true, label: "plum" },
    { id: "r7", x: 143, y: 142, color: "#27877e", shape: "volume", rotation: -9, route: true, label: "deep teal" },
    { id: "r8", x: 162, y: 67, color: "#66884e", shape: "jug", rotation: 3, route: true, label: "moss green finishing" },
    { id: "d1", x: 73, y: 548, color: "#875b91", shape: "pocket", rotation: -18, label: "plum" },
    { id: "d2", x: 244, y: 481, color: "#cf654c", shape: "blob", rotation: 10, label: "terracotta" },
    { id: "d3", x: 54, y: 414, color: "#27877e", shape: "edge", rotation: 15, label: "deep teal" },
    { id: "d4", x: 238, y: 345, color: "#d2a536", shape: "volume", rotation: -8, label: "mustard" },
    { id: "d5", x: 77, y: 275, color: "#4169a9", shape: "horn", rotation: 12, label: "cobalt" },
    { id: "d6", x: 247, y: 263, color: "#cf654c", shape: "crimp", rotation: -15, label: "terracotta" },
    { id: "d7", x: 61, y: 183, color: "#c76078", shape: "pinch", rotation: 22, label: "dusty rose" },
    { id: "d8", x: 235, y: 125, color: "#875b91", shape: "sloper", rotation: -12, label: "plum" },
    { id: "x1", x: 35, y: 623, color: "#d2a536", shape: "edge", rotation: 7, label: "mustard" },
    { id: "x2", x: 264, y: 586, color: "#66884e", shape: "horn", rotation: -20, label: "moss green" },
    { id: "x3", x: 44, y: 500, color: "#c76078", shape: "pocket", rotation: 16, label: "dusty rose" },
    { id: "x4", x: 274, y: 428, color: "#4169a9", shape: "volume", rotation: -10, label: "cobalt" },
    { id: "x5", x: 39, y: 329, color: "#cf654c", shape: "crimp", rotation: 8, label: "terracotta" },
    { id: "x6", x: 269, y: 315, color: "#66884e", shape: "blob", rotation: -16, label: "moss green" },
    { id: "x7", x: 34, y: 235, color: "#c76078", shape: "sloper", rotation: 11, label: "dusty rose" },
    { id: "x8", x: 275, y: 174, color: "#d2a536", shape: "pinch", rotation: -13, label: "mustard" },
    { id: "x9", x: 42, y: 104, color: "#4169a9", shape: "edge", rotation: 18, label: "cobalt" },
    { id: "x10", x: 267, y: 74, color: "#875b91", shape: "jug", rotation: -4, label: "plum" }
  ];

  var holdPaths = {
    jug: "M-14 2C-14-7-7-12 2-11C11-10 15-5 14 3C13 10 7 13-2 12C-10 12-14 9-14 2Z",
    crimp: "M-15-5Q-13-10-7-10H10Q15-9 15-4L12 7Q10 11 4 10L-9 9Q-14 8-15 3Z",
    sloper: "M-16 4Q-13-9 0-12Q13-10 16 2Q15 11 2 13Q-12 13-16 4Z",
    pinch: "M-9-14Q-2-17 6-12L12 6Q13 13 5 15L-7 12Q-13 10-12 3Z",
    pocket: "M-15 2Q-13-11-2-13Q11-14 15-4Q18 7 8 13Q-2 17-12 11Q-17 8-15 2Z",
    edge: "M-17-7L13-10L17-3L12 8L-12 10L-17 4Z",
    blob: "M-15-3Q-11-13-2-11Q5-16 11-8Q18-3 13 5Q11 14 2 12Q-7 17-10 9Q-18 6-15-3Z",
    volume: "M-18 11L-7-15L18 5L7 14Z",
    horn: "M-13 11Q-17 2-10-5Q-4-12 9-14Q4-8 12-2Q16 5 8 11Q-1 16-13 11Z"
  };

  var holdShinePaths = {
    jug: "M-7-4Q0-9 7-5",
    crimp: "M-9-5L8-7",
    sloper: "M-9-3Q0-9 9-3",
    pinch: "M-5-9Q0-12 5-8",
    pocket: "M-9-3Q-4-9 3-9",
    edge: "M-10-4L9-6",
    blob: "M-8-4Q-2-10 5-7",
    volume: "M-10 8L-6-10L10 3",
    horn: "M-8 5Q-8-5 3-9"
  };

  var holdDetailPaths = {
    pocket: "M-6 1Q-4-5 2-6Q8-5 8 1Q6 6 1 6Q-5 6-6 1Z",
    volume: "M-7-15L7 14M-18 11L18 5",
    horn: "M-3 8Q3 3 9-2"
  };

  function createSvgElement(name, attributes) {
    var element = document.createElementNS(SVG_NAMESPACE, name);
    Object.keys(attributes || {}).forEach(function (attribute) {
      element.setAttribute(attribute, attributes[attribute]);
    });
    return element;
  }

  function readStoredNumber(key) {
    try {
      var value = parseInt(window.localStorage.getItem(key), 10);
      return Number.isFinite(value) && value > 0 ? value : null;
    } catch (error) {
      return null;
    }
  }

  function storeNumber(key, value) {
    try {
      window.localStorage.setItem(key, String(value));
    } catch (error) {
      return;
    }
  }

  function localCompletionNumber() {
    var nextNumber = (readStoredNumber(LOCAL_COUNTER_KEY) || 0) + 1;
    storeNumber(LOCAL_COUNTER_KEY, nextNumber);
    return nextNumber;
  }

  function fetchCompletionNumber() {
    var existingNumber = readStoredNumber(COMPLETION_NUMBER_KEY);
    if (existingNumber) {
      return Promise.resolve(existingNumber);
    }

    var controller = typeof AbortController === "function" ? new AbortController() : null;
    var timeout = window.setTimeout(function () {
      if (controller) {
        controller.abort();
      }
    }, 1800);

    return fetch(SHARED_COUNTER_URL, controller ? { signal: controller.signal } : {})
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Counter unavailable");
        }
        return response.json();
      })
      .then(function (payload) {
        var number = Number(payload.count || payload.value);
        if (!Number.isFinite(number) || number < 1) {
          throw new Error("Invalid counter response");
        }
        storeNumber(COMPLETION_NUMBER_KEY, number);
        return number;
      })
      .catch(function () {
        var number = localCompletionNumber();
        storeNumber(COMPLETION_NUMBER_KEY, number);
        return number;
      })
      .then(function (number) {
        window.clearTimeout(timeout);
        return number;
      });
  }

  function initializeGame(game) {
    var holdsLayer = game.querySelector("[data-climb-holds]");
    var climber = game.querySelector("[data-climber]");
    var rope = game.querySelector("[data-climb-rope]");
    var wall = game.querySelector("[data-climb-wall]");
    var status = game.querySelector("[data-climb-status]");
    var progress = game.querySelector("[data-climb-progress]");
    var progressFill = progress.querySelector("span");
    var prompt = game.querySelector("[data-climb-prompt]");
    var result = game.querySelector("[data-climb-result]");
    var resultKicker = game.querySelector("[data-climb-result-kicker]");
    var resultTitle = game.querySelector("[data-climb-result-title]");
    var resultMessage = game.querySelector("[data-climb-result-message]");
    var confetti = game.querySelector("[data-climb-confetti]");
    var restartButtons = game.querySelectorAll("[data-climb-restart], [data-climb-reset]");
    var holdElements = new Map();
    var holdData = new Map();
    var currentStep = 0;
    var busy = false;
    var ended = false;
    var roundId = 0;
    var pendingTimers = new Set();

    function scheduleForCurrentRound(callback, delay) {
      var scheduledRound = roundId;
      var timer = window.setTimeout(function () {
        pendingTimers.delete(timer);
        if (scheduledRound === roundId) {
          callback();
        }
      }, delay);
      pendingTimers.add(timer);
    }

    function cancelPendingRoundWork() {
      roundId += 1;
      pendingTimers.forEach(function (timer) {
        window.clearTimeout(timer);
      });
      pendingTimers.clear();
    }

    holds.forEach(function (hold) {
      holdData.set(hold.id, hold);

      var group = createSvgElement("g", {
        "class": "climb-hold" + (hold.route ? " climb-hold--route" : ""),
        "data-hold-id": hold.id,
        "transform": "translate(" + hold.x + " " + hold.y + ") rotate(" + hold.rotation + ")",
        "role": "button",
        "tabindex": "-1",
        "aria-disabled": "true",
        "aria-label": hold.label + " climbing hold" + (hold.route ? " on the marked route" : "")
      });
      group.style.setProperty("--hold-color", hold.color);

      group.appendChild(createSvgElement("circle", { "class": "climb-hold__hit", "r": "23" }));
      if (hold.route) {
        group.appendChild(createSvgElement("path", { "class": "climb-hold__tape", "d": "M-7 17h14l-2 5H-5Z" }));
      }
      group.appendChild(createSvgElement("path", {
        "class": "climb-hold__shape",
        "d": holdPaths[hold.shape],
        "filter": "url(#climb-hold-shadow)"
      }));
      if (holdDetailPaths[hold.shape]) {
        group.appendChild(createSvgElement("path", {
          "class": "climb-hold__detail",
          "d": holdDetailPaths[hold.shape]
        }));
      }
      group.appendChild(createSvgElement("path", {
        "class": "climb-hold__shine",
        "d": holdShinePaths[hold.shape],
        "pathLength": "1"
      }));
      group.appendChild(createSvgElement("circle", { "class": "climb-hold__bolt", "r": "1.8" }));

      holdsLayer.appendChild(group);
      holdElements.set(hold.id, group);
    });

    climber.removeAttribute("transform");

    function climberTransform(hold) {
      return "translate(" + hold.x + "px, " + (hold.y + CLIMBER_OFFSET) + "px)";
    }

    function updateRope(hold) {
      var harnessY = hold.y + CLIMBER_OFFSET + 13;
      rope.setAttribute("d", "M158 28C176 142 " + (hold.x + 18) + " " + (harnessY - 68) + " " + hold.x + " " + harnessY);
    }

    function placeClimber(hold, animate) {
      var nextTransform = climberTransform(hold);
      var previousTransform = climber.style.transform || nextTransform;
      (climber.getAnimations ? climber.getAnimations() : []).forEach(function (animation) {
        animation.cancel();
      });

      if (animate && typeof climber.animate === "function") {
        climber.animate([
          { transform: previousTransform },
          { transform: nextTransform, offset: 0.78 },
          { transform: "translate(" + hold.x + "px, " + (hold.y + CLIMBER_OFFSET + 3) + "px)" },
          { transform: nextTransform }
        ], {
          duration: 560,
          easing: "cubic-bezier(.22,.78,.28,1)",
          fill: "none"
        });
      }

      climber.style.transform = nextTransform;
      updateRope(hold);
    }

    function clearChoices() {
      holdElements.forEach(function (element) {
        element.classList.remove("is-option");
        element.setAttribute("tabindex", "-1");
        element.setAttribute("aria-disabled", "true");
      });
    }

    function activateChoices() {
      clearChoices();
      choices[currentStep].forEach(function (holdId) {
        var element = holdElements.get(holdId);
        element.classList.add("is-option");
        element.setAttribute("tabindex", "0");
        element.setAttribute("aria-disabled", "false");
      });
      prompt.textContent = "Choose the next hold";
    }

    function updateProgress() {
      var totalMoves = route.length - 1;
      status.textContent = currentStep < totalMoves ? "Move " + (currentStep + 1) + " of " + totalMoves : "Route complete";
      progress.setAttribute("aria-valuenow", String(currentStep));
      progressFill.style.width = (currentStep / totalMoves * 100) + "%";
    }

    function showResult(type, kicker, title, message) {
      result.classList.remove("is-success", "is-failure");
      result.classList.add(type === "success" ? "is-success" : "is-failure");
      resultKicker.textContent = kicker;
      resultTitle.textContent = title;
      resultMessage.textContent = message;
      result.hidden = false;
    }

    function celebrate() {
      var colors = ["#cf654c", "#27877e", "#4169a9", "#d2a536", "#875b91", "#c76078", "#66884e"];
      confetti.replaceChildren();
      for (var index = 0; index < 52; index += 1) {
        var piece = document.createElement("span");
        piece.style.setProperty("--confetti-x", (Math.random() * 100) + "%");
        piece.style.setProperty("--confetti-drift", ((Math.random() - 0.5) * 90) + "px");
        piece.style.setProperty("--confetti-turn", (Math.random() * 720 - 360) + "deg");
        piece.style.setProperty("--confetti-delay", (Math.random() * 0.7) + "s");
        piece.style.setProperty("--confetti-color", colors[index % colors.length]);
        confetti.appendChild(piece);
      }
      confetti.classList.remove("is-active");
      void confetti.offsetWidth;
      confetti.classList.add("is-active");
    }

    function fail(message) {
      ended = true;
      busy = true;
      clearChoices();
      prompt.textContent = "Route lost";
      wall.classList.add("is-failed");

      var currentHold = holdData.get(route[currentStep]);
      var currentTransform = climberTransform(currentHold);
      if (typeof climber.animate === "function") {
        climber.animate([
          { transform: currentTransform },
          { transform: "translate(" + (currentHold.x + 12) + "px, " + (currentHold.y + 125) + "px) rotate(16deg)" }
        ], {
          duration: 520,
          easing: "cubic-bezier(.55,.05,.8,.52)",
          fill: "forwards"
        });
      }

      scheduleForCurrentRound(function () {
        showResult("failure", "Take a breath", "Almost!", message + " Reset and try the sequence again.");
        busy = false;
      }, 430);
    }

    function win() {
      ended = true;
      busy = true;
      clearChoices();
      prompt.textContent = "Route sent";
      wall.classList.add("is-complete");
      celebrate();
      showResult("success", "Route complete", "Top!", "正在记录你的完攀序号...");

      var winningRound = roundId;
      fetchCompletionNumber().then(function (number) {
        if (winningRound !== roundId || !ended) {
          return;
        }
        resultMessage.textContent = "你是第 " + number + " 个成功完攀的攀岩人，祝你 Paper 必中！";
        busy = false;
      });
    }

    function chooseHold(holdId) {
      if (busy || ended || choices[currentStep].indexOf(holdId) === -1) {
        return;
      }

      busy = true;
      var correctHoldId = route[currentStep + 1];
      if (holdId !== correctHoldId) {
        fail("That hold takes you off the 5.12A line.");
        return;
      }

      if (Math.random() > MOVE_SUCCESS_RATE) {
        fail("The hold spins and the grip does not settle.");
        return;
      }

      var previousHoldId = route[currentStep];
      holdElements.get(previousHoldId).classList.add("is-completed");
      holdElements.get(previousHoldId).classList.remove("is-current");
      clearChoices();

      currentStep += 1;
      var nextHold = holdData.get(route[currentStep]);
      holdElements.get(route[currentStep]).classList.add("is-current");
      placeClimber(nextHold, true);
      updateProgress();
      prompt.textContent = "Hold secured";

      scheduleForCurrentRound(function () {
        if (currentStep === route.length - 1) {
          win();
        } else {
          busy = false;
          activateChoices();
        }
      }, 570);
    }

    function resetGame() {
      cancelPendingRoundWork();
      currentStep = 0;
      busy = false;
      ended = false;
      result.hidden = true;
      result.classList.remove("is-success", "is-failure");
      wall.classList.remove("is-failed", "is-complete");
      confetti.classList.remove("is-active");
      confetti.replaceChildren();

      holdElements.forEach(function (element) {
        element.classList.remove("is-current", "is-completed", "is-option");
      });
      holdElements.get(route[0]).classList.add("is-current");
      placeClimber(holdData.get(route[0]), false);
      updateProgress();
      activateChoices();
    }

    holdsLayer.addEventListener("click", function (event) {
      var hold = event.target.closest("[data-hold-id]");
      if (hold) {
        chooseHold(hold.getAttribute("data-hold-id"));
      }
    });

    holdsLayer.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      var hold = event.target.closest("[data-hold-id]");
      if (hold) {
        event.preventDefault();
        chooseHold(hold.getAttribute("data-hold-id"));
      }
    });

    restartButtons.forEach(function (button) {
      button.addEventListener("click", resetGame);
    });

    resetGame();
  }

  document.querySelectorAll("[data-climbing-game]").forEach(initializeGame);
})();

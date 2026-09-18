(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var SVG_NAMESPACE = "http://www.w3.org/2000/svg";
  var LOCAL_COUNTER_KEY = "mx-climb-5-12c-sends-v2";
  var sessionCompletions = 0;

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
    { id: "r0", x: 174, y: 420, color: "#27877e", label: "deep teal", shape: "jug", rotation: -6, route: true },
    { id: "r1", x: 216, y: 378, color: "#cf654c", label: "terracotta", shape: "horn", rotation: 18, route: true },
    { id: "r2", x: 149, y: 333, color: "#4169a9", label: "cobalt", shape: "edge", rotation: -12, route: true },
    { id: "r3", x: 208, y: 288, color: "#66884e", label: "moss green", shape: "sloper", rotation: 9, route: true },
    { id: "r4", x: 140, y: 244, color: "#c76078", label: "dusty rose", shape: "pinch", rotation: -20, route: true },
    { id: "r5", x: 183, y: 199, color: "#d2a536", label: "mustard", shape: "pocket", rotation: 7, route: true },
    { id: "r6", x: 222, y: 153, color: "#875b91", label: "plum", shape: "blob", rotation: 14, route: true },
    { id: "r7", x: 161, y: 110, color: "#27877e", label: "deep teal", shape: "volume", rotation: -9, route: true },
    { id: "r8", x: 183, y: 62, color: "#66884e", label: "moss green", shape: "jug", rotation: 3, route: true },
    { id: "d1", x: 86, y: 382, color: "#875b91", label: "plum", shape: "pocket", rotation: -18 },
    { id: "d2", x: 273, y: 332, color: "#cf654c", label: "terracotta", shape: "blob", rotation: 10 },
    { id: "d3", x: 72, y: 286, color: "#27877e", label: "deep teal", shape: "edge", rotation: 15 },
    { id: "d4", x: 262, y: 245, color: "#d2a536", label: "mustard", shape: "volume", rotation: -8 },
    { id: "d5", x: 79, y: 198, color: "#4169a9", label: "cobalt", shape: "horn", rotation: 12 },
    { id: "d6", x: 112, y: 153, color: "#cf654c", label: "terracotta", shape: "crimp", rotation: -15 },
    { id: "d7", x: 276, y: 104, color: "#c76078", label: "dusty rose", shape: "pinch", rotation: 22 },
    { id: "d8", x: 92, y: 60, color: "#875b91", label: "plum", shape: "sloper", rotation: -12 },
    { id: "x1", x: 47, y: 465, color: "#d2a536", label: "mustard", shape: "edge", rotation: 7 },
    { id: "x2", x: 272, y: 433, color: "#66884e", label: "moss green", shape: "horn", rotation: -20 },
    { id: "x3", x: 39, y: 338, color: "#c76078", label: "dusty rose", shape: "pocket", rotation: 16 },
    { id: "x4", x: 35, y: 126, color: "#4169a9", label: "cobalt", shape: "volume", rotation: -10 }
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
      var value = Number(window.localStorage.getItem(key));
      return Number.isSafeInteger(value) && value > 0 ? value : null;
    } catch (error) {
      return null;
    }
  }

  function storeNumber(key, value) {
    try {
      window.localStorage.setItem(key, String(value));
      return true;
    } catch (error) {
      return false;
    }
  }

  function localCompletionNumber() {
    sessionCompletions += 1;
    var nextNumber = (readStoredNumber(LOCAL_COUNTER_KEY) || 0) + 1;
    var persistent = storeNumber(LOCAL_COUNTER_KEY, nextNumber);
    return { number: persistent ? nextNumber : sessionCompletions, persistent: persistent };
  }

  function recordLocalCompletion() {
    if (navigator.locks && typeof navigator.locks.request === "function") {
      return navigator.locks.request(LOCAL_COUNTER_KEY, localCompletionNumber).catch(function () {
        return localCompletionNumber();
      });
    }
    return Promise.resolve(localCompletionNumber());
  }

  function fetchCompletionNumber(sharedCounterUrl) {
    var localCompletion = recordLocalCompletion();
    if (!sharedCounterUrl) {
      return localCompletion.then(function (completion) {
        return { shared: null, local: completion.number, persistent: completion.persistent, configured: false };
      });
    }
    var controller = typeof AbortController === "function" ? new AbortController() : null;
    var timer;
    var timeout = new Promise(function (resolve) {
      timer = window.setTimeout(function () {
        resolve(null);
        if (controller) controller.abort();
      }, 1800);
    });

    var sharedCompletion = Promise.resolve().then(function () {
      return fetch(sharedCounterUrl, { cache: "no-store", signal: controller ? controller.signal : undefined });
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Counter unavailable");
        }
        return response.json();
      })
      .then(function (payload) {
        var number = Number(payload.count == null ? payload.value : payload.count);
        if (!Number.isSafeInteger(number) || number < 1) {
          throw new Error("Invalid counter response");
        }
        return number;
      })
      .catch(function () {
        return null;
      });

    return Promise.all([localCompletion, Promise.race([sharedCompletion, timeout])])
      .then(function (completions) {
        window.clearTimeout(timer);
        return { shared: completions[1], local: completions[0].number, persistent: completions[0].persistent, configured: true };
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
    var count = game.querySelector("[data-climb-count]");
    var countLabel = game.querySelector("[data-climb-count-label]");
    var trail = game.querySelector("[data-climb-trail]");
    var restartButtons = game.querySelectorAll("[data-climb-restart], [data-climb-reset]");
    var holdElements = new Map();
    var holdData = new Map();
    var currentStep = 0;
    var busy = false;
    var ended = false;
    var roundId = 0;
    var pendingTimers = new Set();
    var keyboardMove = false;

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
        "aria-label": hold.label + " " + hold.shape + " hold" + (hold.route ? ", marked route " + (hold.id === "r0" ? "start" : "move " + route.indexOf(hold.id)) : "")
      });
      group.style.setProperty("--hold-color", hold.color);

      group.appendChild(createSvgElement("circle", { "class": "climb-hold__hit", "r": "25" }));
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
      if (hold.route) {
        var number = createSvgElement("text", {
          "class": "climb-hold__number", "x": "-28", "y": "4",
          "text-anchor": "middle", "transform": "rotate(" + (-hold.rotation) + ")", "aria-hidden": "true"
        });
        number.textContent = String(route.indexOf(hold.id)).padStart(2, "0");
        group.appendChild(number);
      }

      holdsLayer.appendChild(group);
      holdElements.set(hold.id, group);
    });

    climber.removeAttribute("transform");

    function climberTransform(hold) {
      return "translate(" + hold.x + "px, " + hold.y + "px)";
    }

    function updateRope(hold, bodyX) {
      rope.setAttribute("d", "M183 24Q" + (hold.x + bodyX + 24) + " " + (hold.y * 0.55) + " " + (hold.x + bodyX) + " " + (hold.y + 61));
    }

    function updatePose(hold) {
      var previous = holdData.get(route[Math.max(0, currentStep - 1)]);
      var foothold = holdData.get(route[Math.max(0, currentStep - 2)]);
      var handX = currentStep ? previous.x - hold.x : -38;
      var handY = currentStep ? previous.y - hold.y : 28;
      var bodyX = handX * 0.36;
      var footX = currentStep > 1 ? foothold.x - hold.x : bodyX - 24;
      var footY = currentStep > 1 ? foothold.y - hold.y : 109;
      var freeFootX = bodyX + 30;
      game.querySelector("[data-climb-body]").setAttribute("transform", "translate(" + bodyX + " 0)");
      game.querySelector("[data-climb-arm-front]").setAttribute("d", "M" + (bodyX + 9) + " 35Q" + (bodyX + 18) + " 17 0 0");
      game.querySelector("[data-climb-arm-back]").setAttribute("d", "M" + (bodyX - 9) + " 35Q" + (handX - 2) + " 58 " + handX + " " + handY);
      game.querySelector("[data-climb-hand-back]").setAttribute("cx", String(handX));
      game.querySelector("[data-climb-hand-back]").setAttribute("cy", String(handY));
      game.querySelector("[data-climb-leg-back]").setAttribute("d", "M" + (bodyX - 6) + " 63Q" + (bodyX - 21) + " 84 " + footX + " " + footY);
      game.querySelector("[data-climb-leg-front]").setAttribute("d", "M" + (bodyX + 6) + " 63Q" + (bodyX + 37) + " 72 " + freeFootX + " 105");
      game.querySelector("[data-climb-shoe-back]").setAttribute("d", "M" + footX + " " + footY + "l-7 3h-4");
      game.querySelector("[data-climb-shoe-front]").setAttribute("d", "M" + freeFootX + " 105l6 3h4");
      updateRope(hold, bodyX);
      trail.setAttribute("d", route.slice(0, currentStep + 1).map(function (holdId, index) {
        var point = holdData.get(holdId);
        return (index ? "L" : "M") + point.x + " " + point.y;
      }).join(" "));
    }

    function placeClimber(hold, animate) {
      var nextTransform = climberTransform(hold);
      var previousTransform = climber.style.transform || nextTransform;
      (climber.getAnimations ? climber.getAnimations() : []).forEach(function (animation) {
        animation.cancel();
      });

      if (animate && !reduceMotion && typeof climber.animate === "function") {
        climber.animate([
          { transform: previousTransform },
          { transform: nextTransform, offset: 0.78 },
          { transform: "translate(" + hold.x + "px, " + (hold.y + 3) + "px)" },
          { transform: nextTransform }
        ], {
          duration: 560,
          easing: "cubic-bezier(.22,.78,.28,1)",
          fill: "none"
        });
      }

      climber.style.transform = nextTransform;
      updatePose(hold);
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
      prompt.textContent = currentStep < 3 ? "The opening moves" : currentStep < 6 ? "Through the crux" : "The final reach";
      if (keyboardMove) {
        holdElements.get(choices[currentStep][0]).focus({ preventScroll: true });
      }
    }

    function updateProgress() {
      var totalMoves = route.length - 1;
      status.textContent = currentStep + " / " + totalMoves + " moves";
      progress.setAttribute("aria-valuenow", String(currentStep));
      progress.setAttribute("aria-valuetext", currentStep + " of " + totalMoves + " moves completed");
      progressFill.style.width = (currentStep / totalMoves * 100) + "%";
    }

    function showResult(type, kicker, title, message) {
      result.classList.remove("is-success", "is-failure");
      result.classList.add(type === "success" ? "is-success" : "is-failure");
      resultKicker.textContent = kicker;
      resultTitle.textContent = title;
      resultMessage.textContent = message;
      result.hidden = false;
      if (keyboardMove) {
        result.querySelector("button").focus({ preventScroll: true });
      }
    }

    function celebrate() {
      if (reduceMotion) return;
      var colors = ["#d56553", "#26786c", "#e9bf63", "#fafcfb"];
      confetti.replaceChildren();
      for (var index = 0; index < 36; index += 1) {
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
      if (!reduceMotion && typeof climber.animate === "function") {
        var caughtPosition = { x: currentHold.x + 8, y: Math.min(currentHold.y + 32, 440) };
        var previousHold = holdData.get(route[Math.max(0, currentStep - 1)]);
        var bodyX = (currentStep ? previousHold.x - currentHold.x : -38) * 0.36;
        updateRope(caughtPosition, bodyX);
        climber.animate([
          { transform: currentTransform },
          { transform: climberTransform(caughtPosition) }
        ], {
          duration: 420,
          easing: "cubic-bezier(.55,.05,.8,.52)",
          fill: "forwards"
        });
      }

      scheduleForCurrentRound(function () {
        showResult("failure", "Back on the rope", "One more try.", message + " " + currentStep + " of 8 moves secured.");
        busy = false;
      }, reduceMotion ? 0 : 430);
    }

    function win() {
      ended = true;
      busy = true;
      clearChoices();
      prompt.textContent = "Route sent";
      wall.classList.add("is-complete");
      celebrate();
      showResult("success", "8 / 8 moves", "Sent.", "正在记录本次登顶...");

      var winningRound = roundId;
      var completionRequest = fetchCompletionNumber(game.getAttribute("data-climb-counter-url"));
      count.textContent = String(readStoredNumber(LOCAL_COUNTER_KEY) || sessionCompletions);
      completionRequest.then(function (completion) {
        count.textContent = String(readStoredNumber(LOCAL_COUNTER_KEY) || sessionCompletions);
        countLabel.textContent = completion.persistent ? "Sends in this browser" : "Sends this session";
        if (winningRound !== roundId || !ended) {
          return;
        }
        var localMessage = (completion.persistent ? "本浏览器" : "本次会话") + "已登顶 " + completion.local + " 次。";
        var sharedMessage = completion.shared === null
          ? (completion.configured ? "全站计数暂不可用。" : "")
          : "全站累计 " + completion.shared + " 次登顶。";
        resultMessage.textContent = sharedMessage + localMessage + "祝你 Paper 必中！";
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
        fail("That hold is off the marked route.");
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

      if (currentStep === route.length - 1) {
        win();
        return;
      }

      scheduleForCurrentRound(function () {
        busy = false;
        activateChoices();
      }, reduceMotion ? 0 : 570);
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
        keyboardMove = false;
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
        keyboardMove = true;
        chooseHold(hold.getAttribute("data-hold-id"));
      }
    });

    restartButtons.forEach(function (button) {
      button.addEventListener("click", function (event) {
        keyboardMove = event.detail === 0;
        resetGame();
      });
    });

    count.textContent = String(readStoredNumber(LOCAL_COUNTER_KEY) || 0);
    window.addEventListener("storage", function (event) {
      if (event.key === LOCAL_COUNTER_KEY || event.key === null) {
        count.textContent = String(readStoredNumber(LOCAL_COUNTER_KEY) || 0);
      }
    });
    resetGame();
  }

  document.querySelectorAll("[data-climbing-game]").forEach(initializeGame);
})();

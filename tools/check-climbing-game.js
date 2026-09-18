"use strict";

var assert = require("node:assert/strict");
var fs = require("node:fs");
var http = require("node:http");
var path = require("node:path");
var test = require("node:test");
var chromium = require("playwright").chromium;

var root = path.resolve(__dirname, "..", "site");
var browser;
var server;
var address;
var contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "application/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml"
};

test.before(async function () {
  server = http.createServer(function (request, response) {
    var pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    var file = path.resolve(root, "." + pathname + (pathname.endsWith("/") ? "index.html" : ""));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, { "Content-Type": contentTypes[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(response);
  });
  await new Promise(function (resolve) { server.listen(0, "127.0.0.1", resolve); });
  address = "http://127.0.0.1:" + server.address().port;
  browser = await chromium.launch({
    channel: process.env.PLAYWRIGHT_CHANNEL || (process.platform === "win32" ? "msedge" : undefined),
    headless: true
  });
});

test.after(async function () {
  if (browser) await browser.close();
  if (server) await new Promise(function (resolve) { server.close(resolve); });
});

async function openGame(context, options) {
  options = options || {};
  var browserContext = await browser.newContext({
    viewport: { width: 1440, height: 900 }, reducedMotion: options.motion ? "no-preference" : "reduce"
  });
  context.after(function () { return browserContext.close(); });
  var page = await browserContext.newPage();
  page.setDefaultTimeout(5000);
  var requests = [];
  var errors = [];
  page.on("pageerror", function (error) { errors.push(error.message); });
  context.after(function () { assert.deepEqual(errors, [], "No browser JavaScript errors"); });
  await browserContext.route("https://counter.example.test/**", async function (request) {
    requests.push(request);
    if (options.deferred) return;
    if (options.offline) return request.abort();
    await request.fulfill({ json: options.invalid ? { count: 1.5 } : { count: 200 + requests.length } });
  });
  await browserContext.addInitScript(function (settings) {
    Math.random = function () { return 0.1; };
    if (!settings.localOnly) {
      document.addEventListener("DOMContentLoaded", function () {
        document.querySelector("[data-climbing-game]").setAttribute("data-climb-counter-url", "https://counter.example.test/climbing/up");
      });
    }
    if (settings.blocked) {
      Object.defineProperty(window, "localStorage", { get: function () { throw new Error("Storage unavailable"); } });
    } else {
      localStorage.setItem("mx-climb-5-12c-completion-number-v1", "1");
    }
  }, options);
  await page.clock.install();
  await page.goto(address);
  await page.locator("[data-hold-id='r1']").waitFor();
  return { page: page, requests: requests };
}

async function climb(page, lastStep) {
  for (var step = 1; step <= (lastStep || 8); step += 1) {
    await page.locator("[data-hold-id='r" + step + "']").dispatchEvent("click");
    await page.clock.runFor(600);
  }
}

async function recorded(page) {
  await page.waitForFunction(function () {
    return /已登顶 \d+ 次/.test(document.querySelector("[data-climb-result-message]").textContent);
  });
  return page.locator("[data-climb-result-message]").innerText();
}

test("each ascent is counted once, including replay and reload", async function (context) {
  var game = await openGame(context);
  await climb(game.page);
  assert.match(await recorded(game.page), /全站累计 201 次登顶.*已登顶 1 次/);
  await game.page.locator("[data-hold-id='r8']").dispatchEvent("click");
  assert.equal(game.requests.length, 1);
  await game.page.locator("[data-climb-restart]").click();
  await climb(game.page);
  assert.match(await recorded(game.page), /全站累计 202 次登顶.*已登顶 2 次/);
  await game.page.reload();
  await climb(game.page);
  assert.match(await recorded(game.page), /已登顶 3 次/);
  assert.equal(game.requests.length, 3);
});

test("offline and invalid shared counts never become a global rank", async function (context) {
  for (var options of [{ offline: true }, { invalid: true }]) {
    var game = await openGame(context, options);
    await climb(game.page);
    var message = await recorded(game.page);
    assert.match(message, /本浏览器已登顶 1 次/);
    assert.match(message, /全站计数暂不可用/);
    assert.doesNotMatch(message, /全站第|你是第/);
  }
});

test("blocked storage falls back to an explicitly labelled session count", async function (context) {
  var game = await openGame(context, { blocked: true, offline: true });
  await climb(game.page);
  assert.match(await recorded(game.page), /本次会话已登顶 1 次/);
  await game.page.locator("[data-climb-restart]").click();
  await climb(game.page);
  assert.match(await recorded(game.page), /本次会话已登顶 2 次/);
});

test("failed moves and a mid-route reset do not count as ascents", async function (context) {
  var game = await openGame(context);
  await game.page.locator("[data-hold-id='d1']").dispatchEvent("click");
  await game.page.clock.runFor(600);
  assert.equal(await game.page.locator("[data-climb-result].is-failure").count(), 1);
  await game.page.locator("[data-climb-restart]").click();
  await climb(game.page, 3);
  await game.page.locator("[data-climb-reset]").click();
  await game.page.clock.runFor(2000);
  assert.equal(game.requests.length, 0);
  assert.equal(await game.page.locator("[data-climb-progress]").getAttribute("aria-valuenow"), "0");
});

test("a late response cannot overwrite a reset round", async function (context) {
  var game = await openGame(context, { deferred: true });
  var requestStarted = game.page.waitForRequest("https://counter.example.test/**");
  await climb(game.page);
  await requestStarted;
  await game.page.locator("[data-climb-reset]").click();
  assert.equal(game.requests.length, 1);
  await game.requests[0].fulfill({ json: { count: 800 } });
  await game.page.clock.runFor(100);
  assert.equal(await game.page.locator("[data-climb-result]").isHidden(), true);
  assert.equal(await game.page.locator("[data-climb-progress]").getAttribute("aria-valuenow"), "0");
});

test("reset immediately after reaching the final hold cannot lose a summit", async function (context) {
  var game = await openGame(context);
  await climb(game.page, 7);
  await game.page.locator("[data-hold-id='r8']").dispatchEvent("click");
  await game.page.locator("[data-climb-reset]").dispatchEvent("click");
  await game.page.clock.runFor(600);
  assert.equal(await game.page.evaluate(function () {
    return localStorage.getItem("mx-climb-5-12c-sends-v2");
  }), "1");
});

test("keyboard-only climbing maintains focus and never loses a correct move to chance", async function (context) {
  var game = await openGame(context);
  await game.page.evaluate(function () { Math.random = function () { return 0.999; }; });
  await game.page.locator("[data-hold-id='r1']").focus();
  for (var step = 1; step <= 8; step += 1) {
    assert.equal(await game.page.evaluate(function () { return document.activeElement.getAttribute("data-hold-id"); }), "r" + step);
    await game.page.keyboard.press(step % 2 ? "Enter" : "Space");
    await game.page.clock.runFor(600);
  }
  await recorded(game.page);
  assert.equal(await game.page.locator("[data-climb-progress]").getAttribute("aria-valuenow"), "8");
  assert.equal(await game.page.locator("[data-climb-restart]").evaluate(function (button) { return button === document.activeElement; }), true);
  await game.page.keyboard.press("Enter");
  assert.equal(await game.page.evaluate(function () { return document.activeElement.getAttribute("data-hold-id"); }), "r1");
});

test("real pointer targets allow a complete ascent on desktop and mobile", async function (context) {
  for (var viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    var game = await openGame(context);
    await game.page.setViewportSize(viewport);
    await game.page.locator("#climb-game").scrollIntoViewIfNeeded();
    for (var step = 1; step <= 8; step += 1) {
      await game.page.locator("[data-hold-id='r" + step + "']").click();
      await game.page.clock.runFor(600);
    }
    await recorded(game.page);
    assert.equal(game.requests.length, 1);
  }
});

test("counter timeout settles even when AbortController is unavailable", async function (context) {
  var game = await openGame(context, { deferred: true });
  await game.page.evaluate(function () { window.AbortController = undefined; });
  await climb(game.page);
  await game.page.clock.runFor(2200);
  assert.match(await game.page.locator("[data-climb-result-message]").innerText(), /全站计数暂不可用/);
  assert.equal(await game.page.locator("[data-climb-count]").innerText(), "1");
});

test("simultaneous tabs preserve both ascents and synchronize the local display", async function (context) {
  var game = await openGame(context);
  var second = await game.page.context().newPage();
  await second.clock.install();
  await second.goto(address);
  await climb(game.page, 7);
  await climb(second, 7);
  await Promise.all([game.page, second].map(function (page) {
    return page.locator("[data-hold-id='r8']").dispatchEvent("click");
  }));
  await Promise.all([recorded(game.page), recorded(second)]);
  for (var page of [game.page, second]) {
    assert.equal(await page.evaluate(function () { return localStorage.getItem("mx-climb-5-12c-sends-v2"); }), "2");
    await page.waitForFunction(function () { return document.querySelector("[data-climb-count]").textContent === "2"; });
  }
  assert.equal(game.requests.length, 2);
});

test("original homepage styling, responsive game, and navigation remain usable", async function (context) {
  var game = await openGame(context);
  for (var viewport of [
    { width: 320, height: 720 }, { width: 390, height: 844 },
    { width: 768, height: 1024 }, { width: 1024, height: 768 },
    { width: 1440, height: 900 }, { width: 1920, height: 1080 }
  ]) {
    await game.page.setViewportSize(viewport);
    await game.page.goto(address);
    await game.page.evaluate(function () { return document.fonts.ready; });
    assert.equal(await game.page.evaluate(function () { return document.documentElement.scrollWidth <= innerWidth; }), true);
    assert.equal(await game.page.locator(".climb-game-link").count(), 0);
    assert.equal(await game.page.evaluate(function () {
      return !getComputedStyle(document.body).fontFamily.includes("Source Sans 3") &&
        getComputedStyle(document.querySelector(".climb-game")).fontFamily.includes("Source Sans 3") &&
        getComputedStyle(document.querySelector(".profile-summary")).borderTopStyle === "solid";
    }), true);
    await game.page.locator("#climb-game").evaluate(function (game) {
      game.scrollIntoView({ block: "start", behavior: "instant" });
    });
    await game.page.clock.runFor(100);
    assert.equal(await game.page.locator("#climb-game").evaluate(function (game) {
      return game.getBoundingClientRect().top >= document.querySelector(".site-header").getBoundingClientRect().bottom - 1;
    }), true);
    assert.equal(await game.page.locator(".climb-game__header").evaluate(function (header) {
      return header.scrollWidth <= header.clientWidth;
    }), true);
  }
  await game.page.setViewportSize({ width: 390, height: 844 });
  await game.page.goto(address);
  await game.page.locator(".site-nav__toggle").click();
  assert.equal(await game.page.locator(".site-nav__toggle").getAttribute("aria-expanded"), "true");
  await game.page.keyboard.press("Escape");
  assert.equal(await game.page.locator(".site-nav__toggle").getAttribute("aria-expanded"), "false");
  await game.page.locator(".profile-card__toggle").click();
  assert.equal(await game.page.locator(".profile-card__toggle").getAttribute("aria-expanded"), "true");
  await game.page.keyboard.press("Escape");
  assert.equal(await game.page.locator(".profile-card__toggle").getAttribute("aria-expanded"), "false");
});

test("animated climber stays inside the wall and reset cancels the fall", async function (context) {
  var game = await openGame(context, { motion: true });
  var position = await game.page.locator("[data-climber]").evaluate(function (climber) { return climber.getBoundingClientRect().top; });
  await game.page.locator("[data-hold-id='r1']").click();
  assert.equal(await game.page.locator("[data-climber]").evaluate(function (climber) { return climber.getAnimations().length > 0; }), true);
  await game.page.locator("[data-climber]").evaluate(function (climber) { climber.getAnimations().forEach(function (animation) { animation.finish(); }); });
  await game.page.clock.runFor(600);
  assert.ok(await game.page.locator("[data-climber]").evaluate(function (climber) { return climber.getBoundingClientRect().top; }) < position);
  await game.page.locator("[data-climb-reset]").click();
  var ropeBefore = await game.page.locator("[data-climb-rope]").getAttribute("d");
  await game.page.locator("[data-hold-id='d1']").click();
  await game.page.locator("[data-climber]").evaluate(function (climber) { climber.getAnimations().forEach(function (animation) { animation.finish(); }); });
  assert.equal(await game.page.locator("[data-climber]").evaluate(function (climber) {
    var bounds = climber.getBoundingClientRect();
    var wall = document.querySelector("[data-climb-wall]").getBoundingClientRect();
    return bounds.bottom <= wall.bottom && bounds.top >= wall.top && bounds.left >= wall.left && bounds.right <= wall.right;
  }), true);
  assert.notEqual(await game.page.locator("[data-climb-rope]").getAttribute("d"), ropeBefore);
  await game.page.locator("[data-climb-reset]").click();
  await game.page.clock.runFor(600);
  assert.equal(await game.page.locator("[data-climb-result]").isHidden(), true);
  assert.equal(await game.page.locator("[data-climb-progress]").getAttribute("aria-valuenow"), "0");
  assert.equal(game.requests.length, 0);
});

test("default local-only mode records ascents without a remote service", async function (context) {
  var game = await openGame(context, { localOnly: true });
  var externalRequests = [];
  game.page.on("request", function (request) {
    if (!request.url().startsWith(address)) externalRequests.push(request.url());
  });
  await climb(game.page);
  var message = await recorded(game.page);
  assert.match(message, /本浏览器已登顶 1 次/);
  assert.doesNotMatch(message, /全站|第 \d+.*人/);
  assert.equal(await game.page.locator("[data-climb-count]").innerText(), "1");
  await game.page.locator("[data-climb-restart]").click();
  await climb(game.page);
  assert.match(await recorded(game.page), /本浏览器已登顶 2 次/);
  assert.deepEqual(externalRequests, []);
});

test("original hold colors coexist with the redesigned character and route markers", async function (context) {
  var game = await openGame(context);
  var expected = {
    r0: "#27877e", r1: "#cf654c", r2: "#4169a9", r3: "#66884e", r4: "#c76078",
    r5: "#d2a536", r6: "#875b91", r7: "#27877e", r8: "#66884e",
    d1: "#875b91", d2: "#cf654c", d3: "#27877e", d4: "#d2a536",
    d5: "#4169a9", d6: "#cf654c", d7: "#c76078", d8: "#875b91",
    x1: "#d2a536", x2: "#66884e", x3: "#c76078", x4: "#4169a9"
  };
  var actual = await game.page.locator("[data-hold-id]").evaluateAll(function (holds) {
    return Object.fromEntries(holds.map(function (hold) {
      return [hold.getAttribute("data-hold-id"), hold.style.getPropertyValue("--hold-color")];
    }));
  });
  assert.deepEqual(actual, expected);
  assert.equal(await game.page.locator(".climb-climber").count(), 1);
  assert.equal(await game.page.locator(".climb-hold__number").count(), 9);
  assert.equal(await game.page.locator(".climb-hold__tape").count(), 9);
});
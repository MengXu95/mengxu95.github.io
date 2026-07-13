"use strict";

var fs = require("fs");
var path = require("path");

var root = path.resolve(__dirname, "..");
var forbiddenDirectories = [
  "_data", "_drafts", "_includes", "_layouts", "_pages", "_portfolio",
  "_posts", "_publications", "_sass", "_talks", "_teaching"
];
var errors = [];
var forbiddenReferences = [
  { pattern: /\/sitemap(?:\.xml|\/)/i, message: "Sitemap reference found" },
  { pattern: /Minimal Mistakes|Academic Pages/i, message: "Inherited theme reference found" },
  { pattern: /(?:jquery|font-awesome|academicons)/i, message: "Inherited frontend dependency found" },
  {
    pattern: /(?:[.#](?:masthead|sidebar|page__[\w-]*|author__[\w-]*|home-shell|greedy-nav|icon-pad-right)\b|class=["'](?:[^"']+\s)?(?:masthead|sidebar|page__[\w-]*|author__[\w-]*|home-shell|greedy-nav|icon-pad-right)(?=\s|["']))/i,
    message: "Inherited theme class found"
  }
];

fs.readdirSync(root, { withFileTypes: true }).forEach(function (entry) {
  if (entry.isDirectory() && entry.name.startsWith("_")) {
    errors.push("Top-level directory must not start with an underscore: " + entry.name);
  }
});

forbiddenDirectories.forEach(function (name) {
  if (fs.existsSync(path.join(root, name))) {
    errors.push("Legacy directory still exists: " + name);
  }
});

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(function (entry) {
    var fullPath = path.join(directory, entry.name);
    if (entry.name === ".git" || entry.name === "site" || entry.name === "node_modules") return [];
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

walk(root).forEach(function (file) {
  if (file === __filename) return;
  if (!/\.(html|md|yml|yaml|scss|css|js|json|rb)$/i.test(file)) return;
  var text = fs.readFileSync(file, "utf8");
  var externalBlankLinks = text.match(/<a\b[^>]*target=["']_blank["'][^>]*>/gi) || [];
  externalBlankLinks.forEach(function (link) {
    if (!/\brel=["'][^"']*\bnoopener\b/i.test(link)) {
      errors.push("External link opened in a new tab without rel=noopener: " + path.relative(root, file));
    }
  });
  forbiddenReferences.forEach(function (rule) {
    if (rule.pattern.test(text)) {
      errors.push(rule.message + ": " + path.relative(root, file));
    }
  });
});

var contentDirectory = path.join(root, "content");
var routes = new Set(["/"]);
fs.readdirSync(contentDirectory).forEach(function (name) {
  var text = fs.readFileSync(path.join(contentDirectory, name), "utf8");
  var permalink = text.match(/^permalink:\s*([^\r\n]+)$/m);
  if (permalink) routes.add(permalink[1].trim());
});

walk(contentDirectory).forEach(function (file) {
  var text = fs.readFileSync(file, "utf8");
  var linkPattern = /href=["'](\/[^"'#?]*)/g;
  var match;
  while ((match = linkPattern.exec(text))) {
    var target = match[1];
    if (!routes.has(target) && !fs.existsSync(path.join(root, target))) {
      errors.push("Broken internal link " + target + " in " + path.relative(root, file));
    }
  }
});

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Site structure checks passed.");

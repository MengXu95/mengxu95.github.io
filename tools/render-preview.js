"use strict";

var fs = require("fs");
var path = require("path");

var root = path.resolve(__dirname, "..");
var output = path.join(root, "site");
var layouts = path.join(root, "components", "layouts");
var includes = path.join(root, "components", "includes");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function parseDocument(relativePath) {
  var text = read(relativePath);
  var match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) throw new Error("Missing front matter: " + relativePath);
  var data = {};
  match[1].split(/\r?\n/).forEach(function (line) {
    var pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!pair) return;
    data[pair[1]] = pair[2].replace(/^['"]|['"]$/g, "");
  });
  return { data: data, content: text.slice(match[0].length) };
}

function layoutBody(name) {
  var text = fs.readFileSync(path.join(layouts, name + ".html"), "utf8");
  var frontMatter = text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  return frontMatter ? text.slice(frontMatter[0].length) : text;
}

function processConditionals(text, page) {
  text = text.replace(/{% if page\.permalink == '([^']+)' %}([\s\S]*?){% endif %}/g, function (_, permalink, content) {
    return page.permalink === permalink ? content : "";
  });
  text = text.replace(/{% unless page\.permalink == '([^']+)' %}([\s\S]*?){% endunless %}/g, function (_, permalink, content) {
    return page.permalink === permalink ? "" : content;
  });
  return text;
}

function includeFiles(text) {
  return text.replace(/{% include ([^ %]+) %}/g, function (_, name) {
    return fs.readFileSync(path.join(includes, name), "utf8");
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderVariables(text, page, content) {
  var title = page.seo_title || (page.title ? page.title + " | Meng Xu" : "Meng Xu");
  var description = page.excerpt || "Academic homepage of Meng Xu (许萌).";
  var canonical = "https://mengxu95.github.io" + (page.permalink || "/");

  text = text.replace(/<title>{% if page\.seo_title %}[\s\S]*?{% endif %}<\/title>/, "<title>" + escapeHtml(title) + "</title>");
  text = text.replace(/{{ content }}/g, content || "");
  text = text.replace(/{{ page\.title }}/g, escapeHtml(page.title));
  text = text.replace(/{{ page\.schema_type \| default: 'WebPage' }}/g, escapeHtml(page.schema_type || "WebPage"));
  text = text.replace(/{{ page\.robots \| default: 'index, follow' }}/g, escapeHtml(page.robots || "index, follow"));
  text = text.replace(/{{ page\.url \| absolute_url }}/g, canonical);
  text = text.replace(/{{ page\.excerpt \| default: site\.description \| strip_html \| escape }}/g, escapeHtml(description));
  text = text.replace(/{{ page\.seo_title \| default: page\.title \| default: site\.title \| escape }}/g, escapeHtml(page.seo_title || page.title || "Meng Xu"));
  text = text.replace(/{{ '\/assets\/profile\.jpg' \| absolute_url }}/g, "https://mengxu95.github.io/assets/profile.jpg");
  text = text.replace(/{{ '([^']+)' \| relative_url }}/g, "$1");
  text = text.replace(/{{ site\.time \| date: '%Y' }}/g, String(new Date().getFullYear()));
  text = text.replace(/{{ page\.redirect_to \| relative_url }}/g, page.redirect_to || "/");
  text = text.replace(/{{ page\.redirect_to \| absolute_url }}/g, "https://mengxu95.github.io" + (page.redirect_to || "/"));
  text = text.replace(/{{ page\.redirect_to }}/g, page.redirect_to || "/");
  return text;
}

function renderPage(document) {
  var page = document.data;
  var pageHtml = processConditionals(layoutBody(page.layout || "page"), page);
  pageHtml = includeFiles(pageHtml);
  pageHtml = renderVariables(pageHtml, page, document.content);

  if (page.layout === "redirect") return pageHtml;

  var html = processConditionals(layoutBody("default"), page);
  html = includeFiles(html);
  html = processConditionals(html, page);
  return renderVariables(html, page, pageHtml);
}

function outputPath(permalink) {
  if (permalink === "/") return path.join(output, "index.html");
  if (permalink.endsWith(".html")) return path.join(output, permalink.slice(1));
  return path.join(output, permalink.slice(1), "index.html");
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

fs.readdirSync(path.join(root, "content"))
  .filter(function (name) { return name.endsWith(".html"); })
  .forEach(function (name) {
    var document = parseDocument(path.join("content", name));
    var destination = outputPath(document.data.permalink);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, renderPage(document), "utf8");
  });

fs.mkdirSync(path.join(output, "assets"), { recursive: true });
fs.mkdirSync(path.join(output, "scripts"), { recursive: true });
fs.copyFileSync(path.join(root, "assets", "profile.jpg"), path.join(output, "assets", "profile.jpg"));
fs.copyFileSync(path.join(root, "assets", "favicon.svg"), path.join(output, "assets", "favicon.svg"));
fs.copyFileSync(path.join(root, "scripts", "site.js"), path.join(output, "scripts", "site.js"));
fs.copyFileSync(path.join(root, "scripts", "climbing-game.js"), path.join(output, "scripts", "climbing-game.js"));
fs.writeFileSync(
  path.join(output, "assets", "site.css"),
  ["base.scss", "academic.scss", "climbing.scss"]
    .map(function (name) { return read(path.join("styles", name)); })
    .join("\n"),
  "utf8"
);

console.log("Preview pages rendered to " + output);

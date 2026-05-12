---
layout: archive
title: "Publications"
permalink: /publications/
author_profile: true
---

The complete and latest publication list is also available on <a target="_blank" href="{{site.author.googlescholar}}">my Google Scholar profile</a>.

**Journal and Conference Papers**

<ol>
{% for post in site.publications reversed %}
<li>{{ post.citation }}{% if post.paperurl %} <a target="_blank" href="{{ post.paperurl }}">[link]</a>{% endif %}</li>
{% endfor %}
</ol>
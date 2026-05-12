---
layout: archive
title: "Publications"
permalink: /publications/
author_profile: true
---

{% if site.author.googlescholar %}
  <div class="wordwrap">Below is the publication list from this website collection. You can also find the complete and latest list on <a href="{{site.author.googlescholar}}">my Google Scholar profile</a>.</div>
{% endif %}

--------------------------------------------------

{% include base_path %}

# Journal and Conference

{% for post in site.publications reversed %}

  {% include archive-single.html %}

{% endfor %}


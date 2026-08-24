#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const title = process.argv.slice(2).join(" ").trim();

if (!title) {
  console.error("Please provide a blog title. e.g. npm run new:blog \"My Story\"");
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)+/g, "");

const date = new Date().toISOString().split("T")[0];

const template = `---
title: "${title}"
date: "${date}"
author: "Your Name"
authorTitle: "Contributor"
coverImage: "/demo02.png"
excerpt: "One sentence summary that teases the story."
tags:
  - Inspiration
featured: false
---

## Intro

Share the hook for your story here. Replace this file with your own markdown/MDX content.
`;

const dir = path.join(process.cwd(), "content", "blog");
const filePath = path.join(dir, `${slug}.mdx`);

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

if (fs.existsSync(filePath)) {
  console.error(`A post with the slug "${slug}" already exists.`);
  process.exit(1);
}

fs.writeFileSync(filePath, template);
console.log(`Created ${filePath}`);


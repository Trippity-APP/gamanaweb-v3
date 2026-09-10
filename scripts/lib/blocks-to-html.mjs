/**
 * Converts website ArticleBlock[] (content/blog/articles.ts) to CMS content_html.
 * Mirrors the semantics of app/blog/[slug]/page.tsx renderBlock().
 */

/** @typedef {import('../../content/blog/articles.ts').ArticleBlock} ArticleBlock */

/**
 * @param {string} value
 */
function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * @param {string} value
 */
function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

/**
 * @param {string} text
 */
export function formatInline(text) {
  return text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

/**
 * Pass through existing HTML in paragraph/list content; only apply formatInline.
 * @param {string} html
 */
export function processRichText(html) {
  return formatInline(html);
}

/**
 * @param {ArticleBlock[]} blocks
 * @returns {string}
 */
export function blocksToHtml(blocks) {
  const parts = [];
  let dividerCount = 0;

  for (const block of blocks) {
    switch (block.type) {
      case "hero": {
        const src = escapeAttr(block.image);
        const alt = escapeAttr(block.alt);
        parts.push(
          `<figure><img src="${src}" alt="${alt}" loading="lazy" /></figure>`
        );
        break;
      }
      case "quote": {
        const content = processRichText(block.content);
        const attribution = block.attribution
          ? `<footer>${escapeHtml(block.attribution)}</footer>`
          : "";
        parts.push(`<blockquote>${content}${attribution}</blockquote>`);
        break;
      }
      case "paragraph": {
        parts.push(`<p>${processRichText(block.content)}</p>`);
        break;
      }
      case "heading": {
        const tag = `h${block.level}`;
        const content = processRichText(block.content);
        parts.push(`<${tag}>${content}</${tag}>`);
        break;
      }
      case "list": {
        const tag = block.style === "ordered" ? "ol" : "ul";
        const items = block.items
          .map((item) => `<li>${processRichText(item)}</li>`)
          .join("");
        parts.push(`<${tag}>${items}</${tag}>`);
        break;
      }
      case "divider": {
        dividerCount += 1;
        if (dividerCount % 4 === 0) {
          parts.push("<hr />");
        } else {
          parts.push("<p>&nbsp;</p>");
        }
        break;
      }
      case "meta-list": {
        const items = block.items
          .map((item) => `<li>${processRichText(item)}</li>`)
          .join("");
        parts.push(
          `<div><p><strong>Highlights</strong></p><ul>${items}</ul></div>`
        );
        break;
      }
      case "cta": {
        const heading = escapeHtml(block.heading);
        const subtitle = processRichText(block.subtitle);
        parts.push(`<div>
  <h2>${heading}</h2>
  <p>${subtitle}</p>
  <p>
    <a href="https://play.google.com/store/apps/details?id=com.agent.gamana.ai" target="_blank" rel="noopener noreferrer">
      <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Download Gamana on Google Play" height="56" />
    </a>
    <a href="https://apps.apple.com/in/app/gamana-ai/id6748155654" target="_blank" rel="noopener noreferrer">
      <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="Download Gamana on the App Store" height="56" />
    </a>
  </p>
</div>`);
        break;
      }
      default:
        break;
    }
  }

  return parts.join("\n");
}

/**
 * @param {import('../../content/blog/articles.ts').Article} article
 */
export function collectImagePaths(article) {
  /** @type {Set<string>} */
  const paths = new Set();
  if (article.coverImage?.startsWith("/")) {
    paths.add(article.coverImage);
  }
  for (const block of article.blocks) {
    if (block.type === "hero" && block.image?.startsWith("/")) {
      paths.add(block.image);
    }
  }
  return [...paths];
}

/**
 * @param {string | undefined} excerpt
 * @param {number} maxLen
 */
export function truncateExcerpt(excerpt, maxLen = 2000) {
  if (!excerpt) return "";
  if (excerpt.length <= maxLen) return excerpt;
  return `${excerpt.slice(0, maxLen - 1)}…`;
}

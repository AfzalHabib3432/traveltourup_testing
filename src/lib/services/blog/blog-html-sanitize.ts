import "server-only";

import DOMPurify from "isomorphic-dompurify";

// ---------------------------------------------------------------------------
// HTML sanitiser (write-time — marketing renders with dangerouslySetInnerHTML)
// ---------------------------------------------------------------------------

const STORED_BLOG_HTML = {
  ALLOWED_TAGS: [
    "p", "br", "strong", "b", "em", "i", "u", "a", "span",
    "ul", "ol", "li", "blockquote", "code", "pre",
    "h1", "h2", "h3", "h4", "h5", "h6",
  ],
  ALLOWED_ATTR: [
    "href", "target", "rel", "class",
    "data-user-id", "data-user-name", "data-type",
    "data-mention-id", "data-mention-label",
    "contenteditable", "style",
  ],
  ALLOW_DATA_ATTR: true,
  FORBID_TAGS: ["script", "iframe", "object", "embed", "link", "meta", "form", "input", "button"],
  FORBID_ATTR: [
    "onclick", "onload", "onerror", "onmouseover",
    "onfocus", "onblur", "onchange", "onsubmit",
  ],
  ADD_ATTR: ["target"],
  USE_PROFILES: { html: true },
};

export function sanitizeStoredBlogHtml(html: string): string {
  return DOMPurify.sanitize(html, STORED_BLOG_HTML);
}

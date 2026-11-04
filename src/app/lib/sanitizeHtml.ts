/**
 * Minimal allowlist-style HTML sanitizer for AI-generated or otherwise
 * untrusted HTML fragments that get rendered via dangerouslySetInnerHTML
 * (e.g. the worksheet builder's Gemini-generated output, which is partly
 * steered by free-text user input like topic/student name).
 *
 * This is intentionally NOT a full HTML parser - it's a conservative regex
 * strip of the constructs that actually enable script execution, which is
 * adequate for "AI occasionally emits a stray <script> tag or event handler
 * attribute, strip it before it reaches the DOM". For content with a much
 * higher trust bar (e.g. accepting arbitrary rich HTML from untrusted third
 * parties at scale) a real parser-based sanitizer (DOMPurify server-side via
 * jsdom, sanitize-html, etc.) would be the more robust long-term choice -
 * not pulled in here to avoid adding a new dependency that can't currently
 * be installed/tested in this environment.
 */
export function sanitizeHtmlFragment(html: string): string {
  if (!html) return '';

  let out = html;

  // Strip <script>...</script> blocks and bare <script> tags entirely.
  out = out.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  out = out.replace(/<script\b[^>]*\/?>/gi, '');

  // Strip other active/embedding tags that have no place in a worksheet.
  out = out.replace(/<(iframe|object|embed|link|meta|base|form)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
  out = out.replace(/<(iframe|object|embed|link|meta|base)\b[^>]*\/?>/gi, '');

  // Strip inline event handler attributes (onclick=, onerror=, onload=, ...)
  out = out.replace(/\son\w+\s*=\s*"(?:[^"\\]|\\.)*"/gi, '');
  out = out.replace(/\son\w+\s*=\s*'(?:[^'\\]|\\.)*'/gi, '');
  out = out.replace(/\son\w+\s*=\s*[^\s>]+/gi, '');

  // Neutralize javascript:/data:text/html URLs in href/src attributes.
  out = out.replace(/\s(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, ' $1="#"');
  out = out.replace(/\s(href|src)\s*=\s*(["'])\s*data:text\/html[^"']*\2/gi, ' $1="#"');

  return out;
}

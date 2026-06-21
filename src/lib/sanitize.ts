// ============================================================
// Dependency-free input sanitization.
//
// User-supplied text (event title/description/location) is stored and later
// rendered. React escapes text by default, but we strip HTML on the way in so
// markup never reaches the database — defense in depth against stored XSS if a
// field is ever rendered as HTML (e.g. dangerouslySetInnerHTML, emails, RSS).
// ============================================================

/** Remove HTML tags, comments, and script/style blocks from a string. */
export function stripHtml(input: string): string {
  return input
    .replace(/<!--[\s\S]*?-->/g, "")
    // Drop entire <script>/<style> blocks including their contents.
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, "")
    // Remove any remaining tags.
    .replace(/<\/?[a-z][^>]*>/gi, "")
    // Neutralize stray angle brackets.
    .replace(/[<>]/g, "")
    .trim();
}

/** Strip ASCII control characters (except tab/newline) and tidy blank lines. */
export function normalizeWhitespace(input: string): string {
  return (
    input
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
  );
}

/** Sanitize a single-line text field (title, location): strip HTML + newlines. */
export function sanitizeText(input?: string | null): string | undefined {
  if (input == null) return undefined;
  const cleaned = normalizeWhitespace(stripHtml(input)).replace(/\s+/g, " ").trim();
  return cleaned || undefined;
}

/** Sanitize a multi-line text field (description): strip HTML, keep line breaks. */
export function sanitizeMultiline(input?: string | null): string | undefined {
  if (input == null) return undefined;
  const cleaned = normalizeWhitespace(stripHtml(input)).trim();
  return cleaned || undefined;
}

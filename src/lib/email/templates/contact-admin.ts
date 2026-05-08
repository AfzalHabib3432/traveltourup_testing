/**
 * Admin notification HTML for the marketing contact form (static, escaped text).
 */

export function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function generateContactAdminHtml(data: {
  name: string;
  email: string;
  message: string;
  userId?: string | null;
  submissionId?: string;
}): string {
  const name = escapeHtml(data.name);
  const email = escapeHtml(data.email);
  const message = escapeHtml(data.message);
  const lines: string[] = [
    "<p><strong>Name</strong><br/>",
    name,
    "</p>",
    "<p><strong>Email</strong><br/>",
    email,
    "</p>",
    "<p><strong>Message</strong><br/></p>",
    "<p style=\"white-space:pre-wrap;\">",
    message,
    "</p>",
  ];
  if (data.userId) {
    lines.push(`<p><strong>User ID</strong><br/>${escapeHtml(data.userId)}</p>`);
  }
  if (data.submissionId) {
    lines.push(
      `<p><strong>Submission ID</strong><br/>${escapeHtml(data.submissionId)}</p>`,
    );
  }
  return `<!DOCTYPE html><html><body>${lines.join("")}</body></html>`;
}

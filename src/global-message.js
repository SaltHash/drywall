/**
 * Global message broadcaster (Durable Object).
 *
 * A single instance (obtained via idFromName("global")) stores the most recent
 * announcement so every client polls the same durable value. This is
 * deliberately separate from the player database: announcements are ephemeral
 * moderation output, not player data, so they do not belong in Neon.
 *
 * Routes (relative to the stub):
 *   GET  /  -> { message }  the current message, or null
 *   POST /  -> { message }  replace the current message
 */

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

const MAX_MESSAGE_LENGTH = 500;
const MAX_LABEL_LENGTH = 40;

export class GlobalMessage {
  constructor(state) {
    this.state = state;
  }

  async fetch(request) {
    if (request.method === "POST") {
      const body = await request.json().catch(() => null);

      const text =
        typeof body?.text === "string" ? body.text.trim().slice(0, MAX_MESSAGE_LENGTH) : "";
      if (!text) return json({ error: "empty message" }, 400);

      const label =
        typeof body?.label === "string" && body.label.trim()
          ? body.label.trim().slice(0, MAX_LABEL_LENGTH)
          : "Global";

      const message = { text, label, sentAt: Date.now() };
      await this.state.storage.put("message", message);
      return json({ message });
    }

    const message = (await this.state.storage.get("message")) ?? null;
    return json({ message });
  }
}

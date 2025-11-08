// server/services/n8nAgentService.ts
// Robustly handles JSON or text responses from n8n.

export type N8nAgentResponse =
  | Record<string, unknown>
  | { raw: string }                        // when n8n returns plain text

function isLikelyJson(contentType?: string | null) {
  return !!contentType && contentType.toLowerCase().includes("application/json");
}

export class N8nAgentService {
  private url = process.env.N8N_AGENT_URL;          // e.g. https://.../webhook/xxxx
  private token = process.env.N8N_AGENT_TOKEN || ""; // optional

  private assertEnv() {
    if (!this.url) throw new Error("N8N_AGENT_URL is not set");
  }

  async run(rows: unknown[]): Promise<N8nAgentResponse> {
    this.assertEnv();

    const res = await fetch(this.url!, {
      method: "POST",
      headers: {
        "accept": "application/json, text/plain;q=0.9, */*;q=0.8",
        "content-type": "application/json",
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      },
      body: JSON.stringify({ data: rows }), // send rows exactly as provided
    });

    const ctype = res.headers.get("content-type");
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`n8n agent error ${res.status}: ${errText}`);
    }

    // Prefer JSON if server says so, else try JSON, else return raw text
    if (isLikelyJson(ctype)) {
      return (await res.json()) as Record<string, unknown>;
    }

    const txt = await res.text();
    try {
      return JSON.parse(txt); // in case text is actually JSON
    } catch {
      return { raw: txt };    // keep plain text as-is
    }
  }
}

export const n8nAgentService = new N8nAgentService();

// client/src/lib/agent.ts
export type N8nScanOutput = any; // your agent's JSON shape, or string if text/plain

export async function runN8nScan(rows?: unknown[]): Promise<N8nScanOutput> {
  const res = await fetch("/api/agent/n8n/scan", {
    method: "POST",
    headers: { "content-type": "application/json" },
    // include credentials if your auth uses cookies
    credentials: "include",
    body: JSON.stringify({ rows: rows ?? [] }),
  });

  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    const msg = ct.includes("application/json") ? JSON.stringify(await res.json()) : await res.text();
    throw new Error(`Scan failed (${res.status}): ${msg}`);
  }

  return ct.includes("application/json") ? res.json() : res.text();
}

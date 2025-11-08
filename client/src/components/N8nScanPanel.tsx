import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Loader2 } from "lucide-react";
import { runN8nScan } from "@/lib/agent";

export default function N8nResultCard() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // Example rows — replace with your real data
      const rows = [
        {
          game_id: "f3dfb574e0a542375a480534525ee6cf",
          commence_time: "11/3/2025",
          in_play: true,
          bookmaker: "DraftKings",
          last_update: "11/3/2025",
          home_team: "Dallas Cowboys",
          away_team: "Arizona Cardinals",
          market: "h2h",
          label: "Arizona Cardinals",
          description: "",
          price: 1.18,
          point: null,
        },
      ];

      const out = await runN8nScan(rows);
      setResult(out);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-medium text-sm">n8n Arbitrage Agent</h3>
          <p className="text-xs text-muted-foreground">
            AI-powered opportunity finder • Connected via webhook
          </p>
        </div>
        <Badge
          variant="secondary"
          className="bg-blue-500/10 text-blue-500 border-blue-500/20"
        >
          {loading ? "Running..." : "Idle"}
        </Badge>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-100/40 border border-red-200 rounded p-2 mb-3">
          {error}
        </p>
      )}

      {result && (
        <div className="border rounded-md p-2 mb-3 text-xs bg-muted/40 overflow-auto max-h-48">
          <pre className="whitespace-pre-wrap break-words">
            {typeof result === "string"
              ? result
              : JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>
            {loading
              ? "Analyzing..."
              : "Ready to check for arbitrage opportunities"}
          </span>
        </div>
        <Button
          size="sm"
          onClick={handleScan}
          disabled={loading}
          data-testid="button-run-n8n-scan"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scanning
            </>
          ) : (
            "Run Agent"
          )}
        </Button>
      </div>
    </div>
  );
}

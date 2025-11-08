import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ArbitrageCard from "@/components/ArbitrageCard";
import { useToast } from "@/hooks/use-toast";
import {
  Bot,
  Search,
  Clock,
  AlertTriangle,
  Crown,
  ListOrdered,
  UploadCloud,
} from "lucide-react";
import type { ArbitrageOpportunityDisplay } from "@/types";

type AgentOut =
  | { opportunities?: ArbitrageOpportunityDisplay[]; [k: string]: any }
  | { raw: string }
  | string
  | Record<string, any>;

export default function AgentScanPage() {
  const { toast } = useToast();

  // user-editable rows sent to the agent
  const [rowsText, setRowsText] = useState<string>(`[
  {
    "game_id": "f3dfb574e0a542375a480534525ee6cf",
    "commence_time": "11/3/2025",
    "in_play": true,
    "bookmaker": "DraftKings",
    "last_update": "11/3/2025",
    "home_team": "Dallas Cowboys",
    "away_team": "Arizona Cardinals",
    "market": "h2h",
    "label": "Arizona Cardinals",
    "description": "",
    "price": 1.18,
    "point": null
  }
]`);

  const [lastRunAt, setLastRunAt] = useState<Date | null>(null);
  const [parsedRows, setParsedRows] = useState<any[] | null>(null);
  const [agentOutput, setAgentOutput] = useState<AgentOut | null>(null);

  const scanMutation = useMutation({
    mutationFn: async (rows: unknown[]) => {
      const res = await fetch("/api/agent/n8n/scan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rows }),
      });
      const ct = res.headers.get("content-type") || "";
      if (!res.ok) {
        const msg = ct.includes("application/json") ? JSON.stringify(await res.json()) : await res.text();
        throw new Error(`Scan failed (${res.status}): ${msg}`);
      }
      return ct.includes("application/json") ? res.json() : res.text();
    },
    onSuccess: (data: AgentOut) => {
      setAgentOutput(data);
      setLastRunAt(new Date());
      const opps = getOpportunities(data);
      toast({
        title: "Agent Finished",
        description: `Received ${opps.length} opportunities`,
      });
    },
    onError: (err: any) => {
      toast({
        title: "Agent Error",
        description: err?.message ?? "Failed to run agent",
        variant: "destructive",
      });
    },
  });

  function getOpportunities(out: AgentOut | null): ArbitrageOpportunityDisplay[] {
    if (!out) return [];
    if (typeof out === "string") return [];
    if ("raw" in out && typeof (out as any).raw === "string") return [];
    const maybe = (out as any)?.opportunities;
    return Array.isArray(maybe) ? (maybe as ArbitrageOpportunityDisplay[]) : [];
  }

  const opportunities = useMemo(
    () =>
      getOpportunities(agentOutput).sort(
        (a, b) => (b.profitPct ?? 0) - (a.profitPct ?? 0)
      ),
    [agentOutput]
  );

  const top5 = opportunities.slice(0, 5);

  const handleRun = () => {
    try {
      const rows = JSON.parse(rowsText);
      if (!Array.isArray(rows)) {
        toast({
          title: "Invalid Rows",
          description: "Input must be a JSON array of table rows.",
          variant: "destructive",
        });
        return;
      }
      setParsedRows(rows);
      scanMutation.mutate(rows);
    } catch (e: any) {
      toast({
        title: "Bad JSON",
        description: e?.message ?? "Could not parse rows JSON",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="w-5 h-5" />
            n8n Agent Scan
          </h1>
          <p className="text-sm text-muted-foreground">
            Send rows to your n8n workflow and review the agent’s top arbitrage picks
          </p>
        </div>
        {lastRunAt && (
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Last run: {lastRunAt.toLocaleTimeString()}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Input/Controls */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadCloud className="w-4 h-4" />
              Agent Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rows-json">Rows JSON</Label>
              <textarea
                id="rows-json"
                className="w-full min-h-[220px] p-2 border rounded-md bg-background"
                value={rowsText}
                onChange={(e) => setRowsText(e.target.value)}
                data-testid="textarea-agent-rows"
              />
              <p className="text-xs text-muted-foreground">
                Paste an array of row objects exactly as produced by your ingestion.
              </p>
            </div>

            <Separator />

            <div className="flex items-center gap-2">
              <Button
                className="w-full"
                onClick={handleRun}
                disabled={scanMutation.isPending}
                data-testid="button-run-agent"
              >
                {scanMutation.isPending ? (
                  <>
                    <Search className="w-4 h-4 mr-2 animate-spin" />
                    Running…
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Run Agent
                  </>
                )}
              </Button>
            </div>

            {!parsedRows && (
              <Alert className="border-amber-500/20 bg-amber-50 dark:bg-amber-950/20">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-700 dark:text-amber-400">
                  Paste rows to begin
                </AlertTitle>
                <AlertDescription className="text-amber-700/90 dark:text-amber-300/90">
                  Provide a JSON array of rows; the server forwards them to the n8n webhook.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Right: Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top 5 card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ListOrdered className="w-4 h-4" />
                  Top 5 Opportunities
                </CardTitle>
                <Badge variant="secondary">{opportunities.length} total</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {scanMutation.isPending ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-muted rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : top5.length > 0 ? (
                <div className="space-y-4">
                  {top5.map((op, idx) => (
                    <div key={op.id ?? idx}>
                      {idx === 0 && (
                        <div className="mb-2 flex items-center justify-between">
                          <Badge className="bg-green-600 text-white flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            Best Profit
                          </Badge>
                          <span className="text-sm text-green-600">
                            +{(op.profitPct ?? 0).toFixed(2)}%
                          </span>
                        </div>
                      )}
                      <ArbitrageCard opportunity={op} />
                    </div>
                  ))}
                </div>
              ) : agentOutput ? (
                <div className="text-center py-12">
                  <ListOrdered className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Opportunities Found</h3>
                  <p className="text-muted-foreground">
                    The agent responded but didn’t include any opportunities.
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ready to Run</h3>
                  <p className="text-muted-foreground">
                    Paste rows and click “Run Agent” to analyze arbitrage.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Raw agent output (for debugging) */}
          <Card>
            <CardHeader>
              <CardTitle>Raw Agent Output</CardTitle>
            </CardHeader>
            <CardContent>
              {scanMutation.isPending ? (
                <div className="animate-pulse h-24 bg-muted rounded-lg" />
              ) : agentOutput ? (
                <pre className="text-xs whitespace-pre-wrap border rounded p-3 bg-muted/40 max-h-80 overflow-auto">
                  {typeof agentOutput === "string"
                    ? agentOutput
                    : "raw" in (agentOutput as any) && typeof (agentOutput as any).raw === "string"
                    ? (agentOutput as any).raw
                    : JSON.stringify(agentOutput, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nothing yet — run the agent to see output.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bell,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  Command as CommandIcon,
  DoorOpen,
  Gauge,
  Layers3,
  Menu,
  MessageSquareText,
  Radio,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Waves
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartPanel } from "@/components/ui/chart";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLiveOps } from "@/hooks/use-live-ops";
import { insightFeed, metricCards, navItems, stadiumProfiles, type StadiumKey, type ZoneState } from "@/lib/stadium-data";
import { cn, formatPercent } from "@/lib/utils";

const StadiumScene = dynamic(() => import("@/components/stadium-scene").then((module) => module.StadiumScene), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full bg-white/[0.04]" />
});

function Sidebar({
  collapsed,
  onToggle,
  active
}: {
  collapsed: boolean;
  onToggle: () => void;
  active: string;
}) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 88 : 272 }}
      className="fixed left-4 top-4 z-40 hidden h-[calc(100vh-32px)] flex-col rounded-[28px] border border-white/10 bg-black/35 p-3 shadow-stadium backdrop-blur-2xl lg:flex"
    >
      <div className="flex items-center justify-between gap-2 p-2">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl border border-neon/30 bg-neon/10 shadow-glow">
            <Waves className="size-5 text-neon" />
          </div>
          {!collapsed && (
            <div>
              <p className="font-display text-sm font-bold tracking-[0.22em] text-white">CROWDOS</p>
              <p className="text-xs text-white/45">Stadium OS</p>
            </div>
          )}
        </div>
        <Button size="icon" variant="ghost" onClick={onToggle} aria-label="Toggle sidebar">
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </Button>
      </div>

      <TooltipProvider delayDuration={80}>
        <nav className="mt-7 space-y-2">
          {navItems.map((item) => {
            const isActive = active === item.label;
            const Icon = item.icon;
            return (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold text-white/56 transition",
                      "hover:bg-white/[0.08] hover:text-white",
                      isActive && "border border-neon/25 bg-neon/10 text-white shadow-glow"
                    )}
                  >
                    <Icon className={cn("size-5 shrink-0", isActive && "text-neon")} />
                    {!collapsed && <span>{item.label}</span>}
                    {!collapsed && isActive && <span className="ml-auto size-2 rounded-full bg-neon shadow-glow" />}
                  </button>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
              </Tooltip>
            );
          })}
        </nav>
      </TooltipProvider>

      <div className="mt-auto rounded-3xl border border-white/10 bg-white/[0.055] p-4">
        <div className="flex items-center gap-3">
          <span className="relative flex size-3">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-neon opacity-60" />
            <span className="relative inline-flex size-3 rounded-full bg-neon" />
          </span>
          {!collapsed && (
            <div>
              <p className="text-xs font-bold text-white">Live Ops Active</p>
              <p className="text-xs text-white/45">Websocket simulation</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}

function MetricCard({ card, index, tick }: { card: (typeof metricCards)[number]; index: number; tick: number }) {
  const Icon = card.icon;
  const glow =
    card.tone === "green"
      ? "from-neon/25"
      : card.tone === "blue"
        ? "from-cyanline/25"
        : card.tone === "amber"
          ? "from-warning/25"
          : "from-danger/25";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      whileHover={{ y: -4, scale: 1.01 }}
    >
      <Card className="group min-h-[164px]">
        <div className={cn("absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition group-hover:opacity-100", glow)} />
        <CardHeader>
          <div className="grid size-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.06]">
            <Icon className="size-5 text-white" />
          </div>
          <Badge className="border-neon/20 bg-neon/10 text-neon">{card.delta}</Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-white/50">{card.label}</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="font-display text-4xl font-black tracking-tight text-white">{card.value}</span>
            <span className="mb-1 text-xs text-white/40">T+{String(tick + index).padStart(2, "0")}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function HeatMap({ zones }: { zones: ZoneState[] }) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_center,rgba(53,255,155,0.12),transparent_34%),linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]">
      <div className="absolute inset-[13%] rounded-full border border-neon/25" />
      <div className="absolute inset-[24%] rounded-full border border-cyanline/20" />
      <div className="absolute left-1/2 top-1/2 h-[62%] w-[16%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-warning/30 bg-warning/10" />
      <div className="absolute left-1/2 top-1/2 h-px w-[86%] -translate-x-1/2 bg-white/10" />
      <div className="absolute left-1/2 top-1/2 h-[82%] w-px -translate-y-1/2 bg-white/10" />
      <div className="absolute left-1/2 top-1/2 h-[88%] w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyanline/10">
        <div className="absolute left-1/2 top-1/2 h-1/2 w-px origin-top animate-sweep bg-gradient-to-b from-cyanline/70 to-transparent" />
      </div>
      {zones.map((zone) => {
        const color = zone.density > 82 ? "bg-danger shadow-[0_0_30px_rgba(255,62,108,0.8)]" : zone.density > 64 ? "bg-warning shadow-[0_0_25px_rgba(255,207,92,0.65)]" : "bg-neon shadow-glow";
        return (
          <motion.div
            key={zone.id}
            layout
            className={cn("absolute grid size-4 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full", color)}
            style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
            animate={{ scale: [1, zone.risk === "Critical" ? 1.75 : 1.25, 1] }}
            transition={{ duration: 2.1, repeat: Infinity, delay: zone.x / 100 }}
          >
            <span className="size-1.5 rounded-full bg-white" />
          </motion.div>
        );
      })}
    </div>
  );
}

function AiAssistant({
  summary,
  stadiumName,
  zones
}: {
  summary: string[];
  stadiumName: string;
  zones: ZoneState[];
}) {
  const [response, setResponse] = useState(summary.join(" "));
  const [loading, setLoading] = useState(false);

  async function askGemini() {
    setLoading(true);
    try {
      const prompt = [
        "You are CrowdOS, an AI stadium command-center assistant for live cricket operations.",
        "Give a concise operational recommendation in 3 bullets. Mention crowd risk, route action, and safety team action.",
        `Stadium: ${stadiumName}`,
        `Zones: ${JSON.stringify(zones.map((zone) => ({ label: zone.label, density: Math.round(zone.density), wait: zone.wait, risk: zone.risk })))}`
      ].join("\n");

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.35, maxOutputTokens: 180 }
        })
      });

      if (!res.ok) throw new Error("Gemini offline");
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.map((part: { text: string }) => part.text).join(" ");
      setResponse(text || summary.join(" "));
    } catch {
      setResponse(summary.join(" "));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="h-full border-neon/20">
      <CardHeader>
        <div>
          <CardTitle>AI Insight System</CardTitle>
          <p className="mt-2 text-sm text-white/45">Predictive command terminal</p>
        </div>
        <Badge className="border-neon/20 bg-neon/10 text-neon">
          <span className="size-1.5 rounded-full bg-neon" />
          Live AI
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="rounded-2xl border border-neon/20 bg-black/45 p-4 font-mono text-sm leading-7 text-floodlight shadow-glow">
          <div className="mb-4 flex items-center gap-2 text-neon">
            <BrainCircuit className="size-4" />
            <span>CROWDOS.GEMINI.TERMINAL</span>
            <span className="ml-auto animate-pulse">ONLINE</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={response + String(loading)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="min-h-[154px] whitespace-pre-line text-white/78"
            >
              {loading ? "Analyzing live crowd telemetry, gate pressure, and routing envelope..." : response}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button variant="neon" onClick={askGemini}>
            <Sparkles className="size-4" />
            Ask Gemini
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="glass">
                <ShieldCheck className="size-4" />
                Playbook
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle className="font-display text-2xl font-bold">Emergency Routing Playbook</DialogTitle>
              <DialogDescription className="mt-2 text-white/55">
                Dispatch pattern for surge control, fan communication, and gate relief during live match spikes.
              </DialogDescription>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {["Freeze risky corridors", "Open secondary gates", "Broadcast fan guidance"].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm text-white/75">
                    {item}
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

export function PremiumOpsPlatform() {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commandOpen, setCommandOpen] = useState(false);
  const ops = useLiveOps();

  useEffect(() => {
    const timeout = window.setTimeout(() => setLoading(false), 950);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const active = ops.criticalZones.length > 0 ? "Safety" : "Command";
  const heroStats = useMemo(
    () => [
      { label: "Live Density", value: formatPercent(ops.avgDensity) },
      { label: "Predicted Queue", value: `${ops.queueAvg}m` },
      { label: "Safe Route", value: ops.safestGate.label },
      { label: "Capacity", value: `${Math.round(ops.stadium.capacity / 1000)}k` }
    ],
    [ops.avgDensity, ops.queueAvg, ops.safestGate.label, ops.stadium.capacity]
  );

  return (
    <TooltipProvider>
      <main className="min-h-screen overflow-hidden bg-stadium-radial text-white">
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="fixed inset-0 z-[100] grid place-items-center bg-graphite"
            >
              <div className="text-center">
                <div className="mx-auto mb-6 grid size-20 place-items-center rounded-[28px] border border-neon/30 bg-neon/10 shadow-glow">
                  <Radio className="size-8 animate-pulse text-neon" />
                </div>
                <p className="font-display text-sm font-bold tracking-[0.4em] text-neon">CROWDOS BOOTING</p>
                <p className="mt-3 text-sm text-white/45">Synchronizing stadium telemetry</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} active={active} />

        <div className={cn("relative transition-all duration-500 lg:pl-[304px]", collapsed && "lg:pl-[120px]")}>
          <section className="relative min-h-screen overflow-hidden">
            <div className="absolute inset-0">
              <StadiumScene zones={ops.zones} stadium={ops.stadium} hero />
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,5,10,0.88),rgba(2,5,10,0.34),rgba(2,5,10,0.78))]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_18%,rgba(216,255,242,0.16),transparent_22%)]" />
            <div className="absolute left-0 right-0 top-0 z-10 border-b border-white/10 bg-black/20 px-5 py-4 backdrop-blur-xl lg:px-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 lg:hidden">
                  <Button variant="ghost" size="icon" aria-label="Menu">
                    <Menu className="size-5" />
                  </Button>
                  <span className="font-display text-sm font-bold tracking-[0.22em]">CROWDOS</span>
                </div>
                <NavigationMenu className="hidden md:block">
                  <NavigationMenuList>
                    {["Telemetry", "Heatmap", "Routing", "AI"].map((item) => (
                      <NavigationMenuItem key={item}>
                        <NavigationMenuLink href={`#${item.toLowerCase()}`}>{item}</NavigationMenuLink>
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                </NavigationMenu>
                <div className="flex items-center gap-3">
                  <select
                    aria-label="Select stadium"
                    value={ops.stadiumKey}
                    onChange={(event) => ops.setStadiumKey(event.target.value as StadiumKey)}
                    className="h-11 rounded-xl border border-white/10 bg-white/[0.07] px-4 text-sm font-semibold text-white outline-none backdrop-blur-xl"
                  >
                    {stadiumProfiles.map((stadium) => (
                      <option key={stadium.key} value={stadium.key} className="bg-obsidian text-white">
                        {stadium.name}
                      </option>
                    ))}
                  </select>
                  <Button variant="glass" onClick={() => setCommandOpen(true)}>
                    <CommandIcon className="size-4" />
                    Command
                  </Button>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex min-h-screen items-end px-5 pb-10 pt-28 lg:px-8">
              <div className="grid w-full items-end gap-8 xl:grid-cols-[1.1fr_0.9fr]">
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                  <Badge className="mb-5 border-neon/20 bg-neon/10 text-neon">
                    <span className="size-1.5 rounded-full bg-neon" />
                    AI-powered live cricket operations
                  </Badge>
                  <h1 className="max-w-5xl font-display text-5xl font-black leading-[0.92] tracking-tight text-white md:text-7xl xl:text-8xl">
                    Smart stadium command for live cricket events.
                  </h1>
                  <p className="mt-6 max-w-2xl text-lg leading-8 text-white/62">
                    Formula-grade telemetry, predictive crowd intelligence, fan routing, and Gemini-assisted operations for IPL-scale stadium control rooms.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button variant="neon" size="lg">
                      Open Live Command
                      <ArrowUpRight className="size-5" />
                    </Button>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="glass" size="lg">
                          <Bell className="size-5" />
                          Incident Room
                        </Button>
                      </SheetTrigger>
                      <SheetContent>
                        <h2 className="font-display text-2xl font-bold">Incident Commander</h2>
                        <p className="mt-2 text-sm text-white/50">Realtime safety protocol and steward dispatch.</p>
                        <div className="mt-6 space-y-3">
                          {(ops.criticalZones.length ? ops.criticalZones : [ops.busiestZone, ops.safestGate]).map((zone) => (
                            <div key={zone.id} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold">{zone.label}</span>
                                <Badge className="border-danger/30 bg-danger/10 text-danger">{zone.risk}</Badge>
                              </div>
                              <p className="mt-2 text-sm text-white/50">Density {Math.round(zone.density)}%, queue {zone.wait}m.</p>
                            </div>
                          ))}
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  {heroStats.map((stat) => (
                    <Card key={stat.label} className="border-white/10 bg-black/30">
                      <CardContent className="p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/42">{stat.label}</p>
                        <p className="mt-2 truncate font-display text-2xl font-bold text-white">{stat.value}</p>
                      </CardContent>
                    </Card>
                  ))}
                </motion.div>
              </div>
            </div>
          </section>

          <section id="telemetry" className="relative px-5 py-8 lg:px-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-display text-sm font-bold uppercase tracking-[0.28em] text-neon">Live Crowd Intelligence</p>
                <h2 className="mt-3 font-display text-3xl font-black tracking-tight md:text-5xl">{ops.stadium.name}</h2>
                <p className="mt-2 text-white/50">{ops.stadium.city} control center, {ops.stadium.liveMatch}</p>
              </div>
              <Badge className="border-cyanline/30 bg-cyanline/10 text-cyanline">
                <Radio className="size-3 animate-pulse" />
                Live feed T+{ops.tick}
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {metricCards.map((card, index) => (
                <MetricCard key={card.label} card={card} index={index} tick={ops.tick} />
              ))}
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
              <Card id="heatmap">
                <CardHeader>
                  <div>
                    <CardTitle>Crowd Density Heatmap</CardTitle>
                    <p className="mt-2 text-sm text-white/45">Radial cricket field routing overlay</p>
                  </div>
                  <Badge className="border-warning/25 bg-warning/10 text-warning">Radar Sweep</Badge>
                </CardHeader>
                <CardContent>
                  <HeatMap zones={ops.zones} />
                </CardContent>
              </Card>

              <AiAssistant summary={ops.assistantSummary} stadiumName={ops.stadium.name} zones={ops.zones} />
            </div>
          </section>

          <section id="routing" className="grid gap-5 px-5 py-4 lg:px-8 xl:grid-cols-[0.92fr_1.08fr]">
            <Card id="3d-twin" className="min-h-[560px] overflow-hidden">
              <CardHeader className="relative z-10">
                <div>
                  <CardTitle>3D Stadium Twin</CardTitle>
                  <p className="mt-2 text-sm text-white/45">Moving crowd particles, active gates, floodlights</p>
                </div>
                <Badge className="border-neon/25 bg-neon/10 text-neon">R3F</Badge>
              </CardHeader>
              <div className="absolute inset-0 pt-16">
                <StadiumScene zones={ops.zones} stadium={ops.stadium} />
              </div>
            </Card>

            <div className="grid gap-5">
              <Tabs defaultValue="congestion">
                <div className="mb-4 flex items-center justify-between">
                  <TabsList>
                    <TabsTrigger value="congestion">Congestion</TabsTrigger>
                    <TabsTrigger value="gates">Gates</TabsTrigger>
                    <TabsTrigger value="queues">Queues</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="congestion">
                  <ChartPanel title="Predictive Congestion">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={ops.timeline}>
                        <defs>
                          <linearGradient id="density" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#35ff9b" stopOpacity={0.42} />
                            <stop offset="95%" stopColor="#35ff9b" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis dataKey="time" stroke="rgba(255,255,255,0.35)" tickLine={false} axisLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.35)" tickLine={false} axisLine={false} />
                        <RechartsTooltip contentStyle={{ background: "#05070d", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14 }} />
                        <Area type="monotone" dataKey="density" stroke="#35ff9b" fill="url(#density)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartPanel>
                </TabsContent>

                <TabsContent value="gates">
                  <ChartPanel title="Entry Gate Load Balancing">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ops.gateBalance}>
                        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.35)" tickLine={false} axisLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.35)" tickLine={false} axisLine={false} />
                        <RechartsTooltip contentStyle={{ background: "#05070d", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14 }} />
                        <Bar dataKey="load" fill="#20c7ff" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartPanel>
                </TabsContent>

                <TabsContent value="queues">
                  <ChartPanel title="Queue Wait Predictions">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={ops.gateBalance}>
                        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.35)" tickLine={false} axisLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.35)" tickLine={false} axisLine={false} />
                        <RechartsTooltip contentStyle={{ background: "#05070d", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14 }} />
                        <Line type="monotone" dataKey="wait" stroke="#ffcf5c" strokeWidth={3} dot={{ r: 4, fill: "#ffcf5c" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartPanel>
                </TabsContent>
              </Tabs>

              <Card>
                <CardHeader>
                  <CardTitle>AI Routing Recommendations</CardTitle>
                  <Badge className="border-cyanline/25 bg-cyanline/10 text-cyanline">Auto-balanced</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {insightFeed.map((item, index) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.06 }}
                      className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-4"
                    >
                      <div className="mt-1 grid size-8 shrink-0 place-items-center rounded-xl bg-neon/10 text-neon">
                        <Route className="size-4" />
                      </div>
                      <p className="text-sm leading-6 text-white/68">{item}</p>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </section>

          <section id="ai" className="px-5 pb-12 pt-4 lg:px-8">
            <Card className="overflow-hidden border-cyanline/20">
              <div className="flex animate-ticker whitespace-nowrap py-4 text-sm font-semibold uppercase tracking-[0.24em] text-white/45">
                {Array.from({ length: 2 }).map((_, repeat) => (
                  <div key={repeat} className="flex">
                    {ops.zones.slice(0, 8).map((zone) => (
                      <span key={`${repeat}-${zone.id}`} className="mx-8">
                        {zone.label}: {Math.round(zone.density)}% density / {zone.wait}m queue
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </Card>
          </section>
        </div>

        <Dialog open={commandOpen} onOpenChange={setCommandOpen}>
          <DialogContent className="p-0">
            <DialogTitle className="sr-only">Command Palette</DialogTitle>
            <Command>
              <CommandInput placeholder="Search stadium actions, gates, alerts..." />
              <CommandList>
                <CommandEmpty>No command found.</CommandEmpty>
                <CommandGroup heading="Operations">
                  {["Open Gate Relief Plan", "Trigger Fan Route Broadcast", "Dispatch Steward Team", "Review Emergency Playbook"].map((item) => (
                    <CommandItem key={item} onSelect={() => setCommandOpen(false)}>
                      <Search className="mr-3 size-4 text-white/35" />
                      {item}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </DialogContent>
        </Dialog>
      </main>
    </TooltipProvider>
  );
}

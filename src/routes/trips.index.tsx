import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/animations/interactive";
import { Chip, VButton } from "@/components/voyage/primitives";
import { TripCard } from "@/components/voyage/TripCard";
import { useAuth } from "@/auth/AuthContext";
import { tripsApi } from "@/services/api";
import { destinations } from "@/data/destinations";
import type { Trip, TripStatus } from "@/types";

const title = "My Trips — VoyageAI";
const description = "Your saved journeys, synced securely with your Voyage Weaver account.";

export const Route = createFileRoute("/trips/")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }] }),
  component: TripsPage,
});

const tabs: { key: TripStatus; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "draft", label: "Drafts" },
];

type ApiTrip = {
  id: number; trip_name: string; origin?: string | null; destination: string;
  start_date?: string | null; end_date?: string | null; travelers: number;
  budget?: number | null; currency: string; travel_style?: string | null; notes?: string | null;
};

function toTrip(item: ApiTrip): Trip {
  const city = item.destination.replace(/\s*\([^)]*\)\s*$/, "").trim();
  const destination = destinations.find((d) => d.city.toLowerCase() === city.toLowerCase()) ?? destinations[0];
  const now = new Date().toISOString().slice(0, 10);
  const status: TripStatus = !item.start_date ? "draft" : (item.end_date && item.end_date < now ? "past" : "upcoming");
  const start = item.start_date ?? "Date not set";
  const end = item.end_date ?? "Date not set";
  const duration = item.start_date && item.end_date ? Math.max(1, Math.round((new Date(item.end_date).getTime() - new Date(item.start_date).getTime()) / 86400000) + 1) : 0;
  return {
    id: String(item.id), title: item.trip_name, country: destination.country, image: destination.image,
    dates: `${start} → ${end}`, durationDays: duration, travellers: item.travelers,
    budget: item.budget ?? 0, health: 90, readiness: 60, status,
  };
}

function TripsPage() {
  const [tab, setTab] = useState<TripStatus>("upcoming");
  const { token, loading: authLoading } = useAuth();
  const [items, setItems] = useState<ApiTrip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) { setItems([]); return; }
    setLoading(true); setError("");
    tripsApi.list(token).then((data: any) => setItems(data)).catch((e: any) => setError(e?.message || "Could not load your trips.")).finally(() => setLoading(false));
  }, [token]);

  const trips = useMemo(() => items.map(toTrip), [items]);
  const visible = trips.filter((t) => t.status === tab);

  return <>
    <PageHeader eyebrow="My trips" title="Every journey, in one place." description="Your trips are now saved to your Voyage Weaver account and persist after refresh.">
      <div className="mt-8 flex flex-wrap items-center gap-3">
        {tabs.map((t) => <Chip key={t.key} active={tab === t.key} onClick={() => setTab(t.key)}>{t.label} · {trips.filter((x) => x.status === t.key).length}</Chip>)}
        <Link to="/planner" className="ml-auto"><VButton magnetic>Plan a new journey</VButton></Link>
      </div>
    </PageHeader>
    <section className="px-4 pb-24 sm:px-6"><div className="mx-auto max-w-7xl">
      {authLoading || loading ? <div className="flex justify-center py-16 text-cyan"><Loader2 className="size-7 animate-spin" /></div> : !token ? (
        <div className="rounded-4xl border border-dashed border-border p-14 text-center"><h2 className="text-xl font-semibold">Sign in to see your trips</h2><p className="mt-2 text-sm text-muted-foreground">Use the Sign in button in the navigation bar, then your saved journeys will appear here.</p></div>
      ) : error ? <div className="rounded-3xl border border-destructive/30 bg-destructive/10 p-6 text-destructive">{error}</div> : visible.length === 0 ? (
        <div className="rounded-4xl border border-dashed border-border p-14 text-center"><h2 className="text-xl font-semibold">Nothing here yet</h2><p className="mt-2 text-sm text-muted-foreground">Start a journey and it will be saved to this account.</p></div>
      ) : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{visible.map((trip, i) => <Reveal key={trip.id} delay={i * 0.06}><TripCard trip={trip} /></Reveal>)}</div>}
    </div></section>
  </>;
}

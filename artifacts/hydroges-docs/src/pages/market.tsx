import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { Search, FileText, Hash, Calendar, ChevronDown, User, MapPin } from "lucide-react";

function getToken() {
  return localStorage.getItem("hydroges_token") || "";
}

interface ProjectOffer {
  id: number;
  title: string;
  description: string;
  deadline: string;
  status: string;
  created_at: string;
}

interface OfferSubmission {
  id: number;
  first_name: string;
  last_name: string;
  wilaya: string;
  offer_id: number;
  offer_title: string;
  message: string | null;
  tracking_number: string;
  status: string;
  created_at: string;
}

interface MarchesData {
  offers: ProjectOffer[];
  submissions: OfferSubmission[];
}

const SUBMISSION_STATUS_LABELS: Record<string, string> = {
  pending:      "En attente",
  under_review: "En examen",
  accepted:     "Accepté",
  rejected:     "Rejeté",
};

const SUBMISSION_STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  pending:      { bg: "#fff8e1", color: "#b35c00", border: "#ffd580" },
  under_review: { bg: "#e8f0fe", color: "#1a56b0", border: "#a0c0f0" },
  accepted:     { bg: "#e6f4ea", color: "#1a7340", border: "#82c99a" },
  rejected:     { bg: "#fdecea", color: "#b71c1c", border: "#f4a0a0" },
};

const OFFER_STATUS_LABELS: Record<string, string> = {
  open:   "Ouvert",
  closed: "Clôturé",
};

const SUBMISSION_STATUS_OPTIONS = ["pending", "under_review", "accepted", "rejected"];

function fmt(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

export default function MarketPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<OfferSubmission | null>(null);
  const [activeTab, setActiveTab] = useState<"submissions" | "offers">("submissions");

  const { data, isLoading } = useQuery<MarchesData>({
    queryKey: ["external-marches"],
    queryFn: async () => {
      const res = await fetch("/api/external/marches", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des marchés");
      return res.json();
    },
    enabled: !!user,
    refetchInterval: 60_000,
  });

  const offers = data?.offers ?? [];
  const submissions = data?.submissions ?? [];

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/external/marches/submissions/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Erreur lors de la mise à jour du statut");
      return res.json() as Promise<OfferSubmission>;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<MarchesData>(["external-marches"], (old) => {
        if (!old) return old;
        return {
          ...old,
          submissions: old.submissions.map((s) =>
            s.id === updated.id ? { ...s, ...updated } : s
          ),
        };
      });
      setSelectedSubmission((prev) => (prev?.id === updated.id ? { ...prev, ...updated } : prev));
      toast({ title: "Statut mis à jour", description: `Soumission #${updated.tracking_number} mise à jour.` });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le statut.", variant: "destructive" });
    },
  });

  const filteredSubmissions = submissions.filter((s) => {
    const q = search.toLowerCase();
    return (
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) ||
      s.wilaya.toLowerCase().includes(q) ||
      s.offer_title.toLowerCase().includes(q) ||
      s.tracking_number.toLowerCase().includes(q)
    );
  });

  const filteredOffers = offers.filter((o) => {
    const q = search.toLowerCase();
    return o.title.toLowerCase().includes(q) || o.description.toLowerCase().includes(q);
  });

  return (
    <AppLayout>
      <div className="flex h-full w-full">
        {/* Left panel */}
        <div
          className="flex flex-col h-full shrink-0 transition-all duration-300"
          style={{ width: selectedSubmission ? "38%" : "100%", borderRight: selectedSubmission ? "2px solid #dde0f0" : "none" }}
        >
          {/* Header */}
          <div className="px-6 py-5 shrink-0" style={{ borderBottom: "1.5px solid #dde0f0", background: "rgba(255,255,255,0.55)" }}>
            <h2 className="text-xl font-black mb-0.5" style={{ color: "#1e1b6b" }}>Marché d'un projet</h2>
            <p className="text-sm" style={{ color: "#7b72b0" }}>
              Appels d'offres et soumissions reçues des entreprises
            </p>
          </div>

          {/* Tabs + Search */}
          <div className="px-5 pt-3 pb-2 shrink-0 space-y-2" style={{ background: "rgba(255,255,255,0.35)" }}>
            <div className="flex gap-2">
              {(["submissions", "offers"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setSelectedSubmission(null); }}
                  className="px-4 py-1.5 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: activeTab === tab ? "#5b4d90" : "white",
                    color: activeTab === tab ? "white" : "#5b4d90",
                    border: `1.5px solid ${activeTab === tab ? "#5b4d90" : "#dde0f0"}`,
                  }}
                >
                  {tab === "submissions" ? `Soumissions (${submissions.length})` : `Appels d'offres (${offers.length})`}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#9090b0" }} />
              <input
                type="text"
                placeholder="Rechercher…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none"
                style={{ background: "white", color: "#1e1b6b", border: "1.5px solid #dde0f0" }}
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.6)" }} />
              ))
            ) : activeTab === "submissions" ? (
              filteredSubmissions.length === 0 ? (
                <EmptyState />
              ) : (
                filteredSubmissions.map((s) => {
                  const isActive = selectedSubmission?.id === s.id;
                  const sc = SUBMISSION_STATUS_COLORS[s.status] ?? SUBMISSION_STATUS_COLORS.pending;
                  return (
                    <div
                      key={s.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedSubmission(isActive ? null : s)}
                      onKeyDown={(e) => e.key === "Enter" && setSelectedSubmission(isActive ? null : s)}
                      className="w-full text-left rounded-2xl cursor-pointer transition-all duration-200"
                      style={{
                        background: isActive ? "linear-gradient(135deg, #5b4d90, #7b65b0)" : "white",
                        boxShadow: isActive ? "0 4px 14px rgba(91,77,144,0.25)" : "0 1px 4px rgba(30,27,107,0.07)",
                        padding: "0.9rem 1rem",
                        border: isActive ? "none" : "1.5px solid #eceef8",
                      }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-bold text-sm" style={{ color: isActive ? "white" : "#1e1b6b" }}>
                          {s.first_name} {s.last_name}
                        </span>
                        <span
                          className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                          style={isActive
                            ? { background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.3)" }
                            : { background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}
                        >
                          {SUBMISSION_STATUS_LABELS[s.status] ?? s.status}
                        </span>
                      </div>
                      <p className="text-xs mb-1.5 truncate" style={{ color: isActive ? "rgba(255,255,255,0.8)" : "#7b72b0" }}>
                        {s.offer_title}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1" style={{ color: isActive ? "rgba(255,255,255,0.6)" : "#9090b0" }}>
                          <MapPin className="w-3 h-3" /> {s.wilaya}
                        </span>
                        <span className="flex items-center gap-1" style={{ color: isActive ? "rgba(255,255,255,0.55)" : "#9090b0" }}>
                          <Hash className="w-3 h-3" /> {s.tracking_number}
                        </span>
                        <span style={{ color: isActive ? "rgba(255,255,255,0.55)" : "#9090b0" }}>{fmt(s.created_at)}</span>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              filteredOffers.length === 0 ? (
                <EmptyState />
              ) : (
                filteredOffers.map((o) => (
                  <div
                    key={o.id}
                    className="w-full text-left rounded-2xl"
                    style={{ background: "white", boxShadow: "0 1px 4px rgba(30,27,107,0.07)", padding: "0.9rem 1rem", border: "1.5px solid #eceef8" }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-bold text-sm" style={{ color: "#1e1b6b" }}>{o.title}</span>
                      <span
                        className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                        style={o.status === "open"
                          ? { background: "#e6f4ea", color: "#1a7340", border: "1px solid #82c99a" }
                          : { background: "#f0eef8", color: "#5b4d90", border: "1px solid #c5b8e8" }}
                      >
                        {OFFER_STATUS_LABELS[o.status] ?? o.status}
                      </span>
                    </div>
                    <p className="text-xs mb-2 line-clamp-2" style={{ color: "#7b72b0" }}>{o.description}</p>
                    <div className="flex items-center gap-1 text-xs" style={{ color: "#9090b0" }}>
                      <Calendar className="w-3 h-3" />
                      Clôture le {fmt(o.deadline)}
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>

        {/* Detail panel — submissions only */}
        {selectedSubmission && (
          <div className="flex-1 h-full overflow-y-auto p-6">
            <div className="max-w-xl mx-auto space-y-5">
              {/* Header */}
              <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, #5b4d90, #7b65b0)", color: "white" }}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-lg font-black">{selectedSubmission.first_name} {selectedSubmission.last_name}</h3>
                    <p className="text-sm opacity-80">{selectedSubmission.wilaya}</p>
                  </div>
                  <button onClick={() => setSelectedSubmission(null)} className="text-white opacity-70 hover:opacity-100 text-xl leading-none">×</button>
                </div>
                <div className="flex items-center gap-2 text-xs opacity-70">
                  <Hash className="w-3 h-3" /> {selectedSubmission.tracking_number}
                  <span className="mx-2">·</span>
                  {fmt(selectedSubmission.created_at)}
                </div>
              </div>

              {/* Offer */}
              <div className="rounded-2xl p-5" style={{ background: "white", border: "1.5px solid #eceef8", boxShadow: "0 1px 4px rgba(30,27,107,0.07)" }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#7b72b0" }}>Appel d'offre concerné</p>
                <p className="text-sm font-semibold" style={{ color: "#1e1b6b" }}>{selectedSubmission.offer_title}</p>
              </div>

              {/* Message */}
              {selectedSubmission.message && (
                <div className="rounded-2xl p-5" style={{ background: "white", border: "1.5px solid #eceef8", boxShadow: "0 1px 4px rgba(30,27,107,0.07)" }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#7b72b0" }}>Message du soumissionnaire</p>
                  <p className="text-sm leading-relaxed" style={{ color: "#1e1b6b", whiteSpace: "pre-wrap" }}>{selectedSubmission.message}</p>
                </div>
              )}

              {/* Status update */}
              <div className="rounded-2xl p-5" style={{ background: "white", border: "1.5px solid #eceef8", boxShadow: "0 1px 4px rgba(30,27,107,0.07)" }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#7b72b0" }}>Mettre à jour le statut</p>
                <div className="relative">
                  <select
                    value={selectedSubmission.status}
                    onChange={(e) => updateStatus.mutate({ id: selectedSubmission.id, status: e.target.value })}
                    disabled={updateStatus.isPending}
                    className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold outline-none appearance-none pr-9"
                    style={{ background: "#f5f4fb", color: "#1e1b6b", border: "1.5px solid #dde0f0", cursor: "pointer" }}
                  >
                    {SUBMISSION_STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{SUBMISSION_STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#7b72b0" }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 rounded-2xl" style={{ background: "rgba(255,255,255,0.45)", border: "2px dashed #dde0f0" }}>
      <FileText className="w-12 h-12 mb-3 opacity-25" style={{ color: "#5b4d90" }} />
      <p className="font-semibold" style={{ color: "#5b4d90" }}>Aucun élément</p>
      <p className="text-sm mt-1" style={{ color: "#9090b0" }}>La liste est vide pour le moment.</p>
    </div>
  );
}

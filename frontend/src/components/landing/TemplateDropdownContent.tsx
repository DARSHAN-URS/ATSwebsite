import { useState } from "react";
import { Crown, Zap, CheckCircle, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  onSelect: () => void;
}

type Theme = "light" | "dark";
type Tier = "free" | "pro";
type Badge = "popular" | null;

interface Template {
  id: string;
  name: string;
  theme: Theme;
  tier: Tier;
  badge: Badge;
  Preview: React.FC;
}

/* ─────────────────────────────────────────────────────────────
   Mini resume previews
   Built at "real" sizes (612px wide ~ A4) and scaled down
   inside an aspect-ratio 3/4 container for pixel-accurate look.
   ───────────────────────────────────────────────────────────── */

const PreviewFrame: React.FC<{ children: React.ReactNode; bg?: string }> = ({
  children,
  bg = "bg-white",
}) => (
  <div className={cn("absolute inset-0 overflow-hidden", bg)}>
    <div
      className="origin-top-left"
      style={{
        width: "612px",
        height: "816px",
        transform: "scale(0.245)",
      }}
    >
      {children}
    </div>
  </div>
);

const ClassicPreview: React.FC = () => (
  <PreviewFrame>
    <div className="w-full h-full p-12 font-serif text-black">
      <h1 className="text-4xl font-bold text-center tracking-wide">JANE DOE</h1>
      <p className="text-center text-sm mt-2 border-b border-black pb-3">
        jane.doe@email.com · (555) 123-4567 · New York, NY
      </p>
      <h2 className="text-lg font-bold mt-5 border-b border-black">SUMMARY</h2>
      <p className="text-sm mt-2 leading-snug">
        Senior product manager with 8+ years driving cross-functional teams to deliver
        measurable revenue growth and award-winning user experiences.
      </p>
      <h2 className="text-lg font-bold mt-5 border-b border-black">EXPERIENCE</h2>
      <div className="mt-2">
        <div className="flex justify-between text-sm font-bold">
          <span>Senior PM, Acme Corp</span>
          <span>2021 – Present</span>
        </div>
        <ul className="text-sm list-disc ml-5 mt-1">
          <li>Led roadmap for $40M product line, growing revenue 32% YoY.</li>
          <li>Managed team of 12 engineers and 3 designers across 4 markets.</li>
        </ul>
      </div>
      <div className="mt-3">
        <div className="flex justify-between text-sm font-bold">
          <span>Product Manager, Globex</span>
          <span>2018 – 2021</span>
        </div>
        <ul className="text-sm list-disc ml-5 mt-1">
          <li>Shipped onboarding redesign that lifted activation by 47%.</li>
          <li>Owned analytics platform used by 200+ internal stakeholders.</li>
        </ul>
      </div>
      <h2 className="text-lg font-bold mt-5 border-b border-black">EDUCATION</h2>
      <p className="text-sm mt-1">B.S. Computer Science, Cornell University, 2016</p>
      <h2 className="text-lg font-bold mt-5 border-b border-black">SKILLS</h2>
      <p className="text-sm mt-1">
        Roadmapping · SQL · A/B Testing · Figma · Agile · Stakeholder Management
      </p>
    </div>
  </PreviewFrame>
);

const ModernPreview: React.FC = () => (
  <PreviewFrame>
    <div className="w-full h-full flex font-sans text-black">
      <aside className="w-[200px] h-full p-6 text-white" style={{ backgroundColor: "#1d42e0" }}>
        <div className="w-20 h-20 rounded-full bg-white/20 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-center leading-tight">JANE DOE</h1>
        <p className="text-xs text-center opacity-90 mt-1">Product Manager</p>
        <h3 className="text-xs font-bold mt-6 uppercase tracking-wider">Contact</h3>
        <p className="text-[11px] mt-2 leading-snug">
          jane@email.com<br />(555) 123-4567<br />New York, NY
        </p>
        <h3 className="text-xs font-bold mt-5 uppercase tracking-wider">Skills</h3>
        <ul className="text-[11px] mt-2 space-y-1">
          <li>Roadmapping</li><li>SQL & Analytics</li><li>A/B Testing</li>
          <li>Figma</li><li>Agile / Scrum</li><li>Leadership</li>
        </ul>
      </aside>
      <main className="flex-1 p-6">
        <h2 className="text-base font-bold uppercase" style={{ color: "#1d42e0" }}>Summary</h2>
        <p className="text-sm mt-1 leading-snug">
          Senior PM with 8+ years driving product strategy, growth experiments, and team
          leadership at high-scale B2B and consumer companies.
        </p>
        <h2 className="text-base font-bold uppercase mt-4" style={{ color: "#1d42e0" }}>Experience</h2>
        <div className="mt-2">
          <p className="text-sm font-bold">Senior PM — Acme Corp</p>
          <p className="text-xs text-gray-600">2021 – Present</p>
          <ul className="text-sm list-disc ml-4 mt-1">
            <li>Grew revenue 32% YoY on a $40M product line.</li>
            <li>Managed cross-functional team of 15.</li>
          </ul>
        </div>
        <div className="mt-3">
          <p className="text-sm font-bold">PM — Globex</p>
          <p className="text-xs text-gray-600">2018 – 2021</p>
          <ul className="text-sm list-disc ml-4 mt-1">
            <li>Lifted activation 47% via onboarding redesign.</li>
            <li>Owned internal analytics for 200+ users.</li>
          </ul>
        </div>
        <h2 className="text-base font-bold uppercase mt-4" style={{ color: "#1d42e0" }}>Education</h2>
        <p className="text-sm mt-1">B.S. Computer Science, Cornell, 2016</p>
      </main>
    </div>
  </PreviewFrame>
);

const MinimalPreview: React.FC = () => (
  <PreviewFrame>
    <div className="w-full h-full p-14 font-sans text-black">
      <h1 className="text-3xl font-light tracking-[0.2em]">JANE DOE</h1>
      <p className="text-xs text-gray-500 mt-2 tracking-wider">
        jane.doe@email.com  ·  (555) 123-4567  ·  New York
      </p>
      <div className="h-px bg-gray-300 my-5" />
      <h2 className="text-[11px] font-medium tracking-[0.3em] text-gray-500 uppercase">Summary</h2>
      <p className="text-sm mt-2 leading-relaxed font-light">
        Product manager focused on simplicity, data-informed decisions, and shipping
        delightful experiences with small, senior teams.
      </p>
      <h2 className="text-[11px] font-medium tracking-[0.3em] text-gray-500 uppercase mt-6">Experience</h2>
      <div className="mt-2">
        <p className="text-sm font-medium">Senior PM, Acme Corp · 2021–Present</p>
        <ul className="text-sm font-light mt-1 space-y-1">
          <li>· Drove 32% revenue growth on flagship product.</li>
          <li>· Led discovery for 4 zero-to-one launches.</li>
        </ul>
      </div>
      <div className="mt-3">
        <p className="text-sm font-medium">PM, Globex · 2018–2021</p>
        <ul className="text-sm font-light mt-1 space-y-1">
          <li>· Improved activation 47% with new onboarding.</li>
          <li>· Built analytics tooling for 200+ users.</li>
        </ul>
      </div>
      <h2 className="text-[11px] font-medium tracking-[0.3em] text-gray-500 uppercase mt-6">Education</h2>
      <p className="text-sm font-light mt-1">B.S. Computer Science, Cornell, 2016</p>
      <h2 className="text-[11px] font-medium tracking-[0.3em] text-gray-500 uppercase mt-6">Skills</h2>
      <p className="text-sm font-light mt-1">Roadmapping · SQL · Figma · A/B Testing · Agile</p>
    </div>
  </PreviewFrame>
);

const ExecutivePreview: React.FC = () => (
  <PreviewFrame bg="bg-[#0e1420]">
    <div className="w-full h-full p-12 text-white font-serif">
      <h1 className="text-4xl font-bold tracking-wide">JANE DOE</h1>
      <p className="text-sm mt-1" style={{ color: "#c9943a" }}>
        Senior Product Executive
      </p>
      <p className="text-xs text-gray-300 mt-2">
        jane.doe@email.com · (555) 123-4567 · New York, NY
      </p>
      <div className="h-px my-4" style={{ backgroundColor: "#c9943a" }} />
      <h2 className="text-sm font-bold uppercase tracking-[0.3em]" style={{ color: "#c9943a" }}>
        Profile
      </h2>
      <p className="text-sm mt-2 leading-snug text-gray-100">
        Strategic executive with 12+ years scaling product organizations from startup
        through IPO. Proven record of P&L ownership and board-level reporting.
      </p>
      <h2 className="text-sm font-bold uppercase tracking-[0.3em] mt-5" style={{ color: "#c9943a" }}>
        Experience
      </h2>
      <div className="mt-2">
        <p className="text-sm font-bold">VP Product, Acme Corp · 2021–Present</p>
        <ul className="text-sm list-disc ml-5 mt-1 text-gray-100">
          <li>Led 60-person product org, growing ARR from $80M to $210M.</li>
          <li>Established quarterly board reporting and OKR framework.</li>
        </ul>
      </div>
      <div className="mt-3">
        <p className="text-sm font-bold">Director of Product, Globex · 2017–2021</p>
        <ul className="text-sm list-disc ml-5 mt-1 text-gray-100">
          <li>Launched enterprise tier contributing $30M in year-one ARR.</li>
          <li>Hired and mentored 4 PM leads now serving as Directors.</li>
        </ul>
      </div>
      <h2 className="text-sm font-bold uppercase tracking-[0.3em] mt-5" style={{ color: "#c9943a" }}>
        Education
      </h2>
      <p className="text-sm mt-1 text-gray-100">MBA, Wharton · B.S. CS, Cornell</p>
      <h2 className="text-sm font-bold uppercase tracking-[0.3em] mt-5" style={{ color: "#c9943a" }}>
        Core Competencies
      </h2>
      <p className="text-sm mt-1 text-gray-100">
        P&L Ownership · Board Reporting · M&A · Org Design · GTM Strategy
      </p>
    </div>
  </PreviewFrame>
);

const BoldPreview: React.FC = () => (
  <PreviewFrame bg="bg-[#1a1230]">
    <div className="w-full h-full flex text-white font-sans">
      <aside className="w-[210px] h-full p-6 bg-violet-700/80">
        <div className="w-24 h-24 rounded-full bg-white/20 mx-auto flex items-center justify-center text-3xl font-bold">
          JD
        </div>
        <h1 className="text-xl font-extrabold text-center mt-3 leading-tight">JANE DOE</h1>
        <p className="text-xs text-center text-violet-200 mt-1">Product Manager</p>
        <h3 className="text-xs font-bold mt-6 uppercase tracking-wider">Contact</h3>
        <p className="text-[11px] mt-2 leading-snug">
          jane@email.com<br />(555) 123-4567<br />New York, NY
        </p>
        <h3 className="text-xs font-bold mt-5 uppercase tracking-wider">Skills</h3>
        <ul className="text-[11px] mt-2 space-y-1">
          <li>· Roadmapping</li><li>· SQL</li><li>· Figma</li>
          <li>· Leadership</li><li>· A/B Testing</li>
        </ul>
      </aside>
      <main className="flex-1 p-6">
        <h2 className="text-base font-extrabold uppercase text-violet-300">Summary</h2>
        <p className="text-sm mt-1 leading-snug">
          Bold product leader with a track record of shipping breakthrough experiences
          for millions of users at high-growth startups.
        </p>
        <h2 className="text-base font-extrabold uppercase mt-4 text-violet-300">Experience</h2>
        <div className="mt-2">
          <p className="text-sm font-bold">Senior PM — Acme Corp</p>
          <p className="text-xs text-violet-300">2021 – Present</p>
          <ul className="text-sm list-disc ml-4 mt-1">
            <li>Grew revenue 32% YoY on flagship line.</li>
            <li>Managed team of 15 across 4 markets.</li>
          </ul>
        </div>
        <div className="mt-3">
          <p className="text-sm font-bold">PM — Globex</p>
          <p className="text-xs text-violet-300">2018 – 2021</p>
          <ul className="text-sm list-disc ml-4 mt-1">
            <li>Lifted activation 47% via onboarding redesign.</li>
            <li>Built analytics tooling for 200+ users.</li>
          </ul>
        </div>
        <h2 className="text-base font-extrabold uppercase mt-4 text-violet-300">Education</h2>
        <p className="text-sm mt-1">B.S. Computer Science, Cornell, 2016</p>
      </main>
    </div>
  </PreviewFrame>
);

const SharpPreview: React.FC = () => (
  <PreviewFrame>
    <div className="w-full h-full p-12 font-sans text-black">
      <h1 className="text-4xl font-extrabold">JANE DOE</h1>
      <p className="text-sm font-semibold text-primary mt-1">Senior Product Manager</p>
      <p className="text-xs text-gray-600 mt-2">
        jane.doe@email.com · (555) 123-4567 · New York, NY · linkedin.com/in/janedoe
      </p>
      <h2 className="text-base font-extrabold uppercase mt-5 text-primary">Summary</h2>
      <p className="text-sm mt-1 leading-snug">
        Results-driven PM blending data, design, and engineering to ship products
        that customers love and that move the business forward.
      </p>
      <h2 className="text-base font-extrabold uppercase mt-5 text-primary">Experience</h2>
      <div className="mt-2 pl-4 border-l-4 border-primary">
        <p className="text-sm font-bold">Senior PM, Acme Corp · 2021–Present</p>
        <ul className="text-sm list-disc ml-5 mt-1">
          <li>Grew revenue 32% YoY on flagship $40M product line.</li>
          <li>Led roadmap across 4 squads and 15 engineers.</li>
        </ul>
      </div>
      <div className="mt-3 pl-4 border-l-4 border-primary">
        <p className="text-sm font-bold">PM, Globex · 2018–2021</p>
        <ul className="text-sm list-disc ml-5 mt-1">
          <li>Lifted activation 47% with onboarding redesign.</li>
          <li>Owned analytics platform for 200+ stakeholders.</li>
        </ul>
      </div>
      <h2 className="text-base font-extrabold uppercase mt-5 text-primary">Education</h2>
      <p className="text-sm mt-1">B.S. Computer Science, Cornell University, 2016</p>
      <h2 className="text-base font-extrabold uppercase mt-5 text-primary">Skills</h2>
      <p className="text-sm mt-1">
        Roadmapping · SQL · A/B Testing · Figma · Agile · Stakeholder Management
      </p>
    </div>
  </PreviewFrame>
);

const TEMPLATES: Template[] = [
  { id: "classic", name: "Classic", theme: "light", tier: "free", badge: null, Preview: ClassicPreview },
  { id: "modern", name: "Modern", theme: "light", tier: "free", badge: "popular", Preview: ModernPreview },
  { id: "minimal", name: "Minimal", theme: "light", tier: "free", badge: null, Preview: MinimalPreview },
  { id: "executive", name: "Executive", theme: "dark", tier: "pro", badge: null, Preview: ExecutivePreview },
  { id: "bold", name: "Bold", theme: "dark", tier: "pro", badge: null, Preview: BoldPreview },
  { id: "sharp", name: "Sharp", theme: "light", tier: "pro", badge: null, Preview: SharpPreview },
];

export default function TemplateDropdownContent({ onSelect }: Props) {
  const [filter, setFilter] = useState<"all" | Theme>("all");
  const [selectedId, setSelectedId] = useState<string>("modern");

  const filtered = TEMPLATES.filter((t) => filter === "all" || t.theme === filter);
  const selected = TEMPLATES.find((t) => t.id === selectedId) ?? TEMPLATES[0];

  const filterPills: { id: "all" | Theme; label: string }[] = [
    { id: "all", label: "All" },
    { id: "light", label: "Light" },
    { id: "dark", label: "Dark" },
  ];

  return (
    <div className="flex flex-col">
      {/* Header with filter pills */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground">
          Choose a Template
        </h3>
        <div className="flex gap-1 p-1 rounded-full border border-primary/20 bg-card">
          {filterPills.map((p) => (
            <button
              key={p.id}
              onClick={() => setFilter(p.id)}
              className={cn(
                "px-3 py-1 text-xs font-mono uppercase tracking-wider rounded-full transition-all",
                filter === p.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-3 transition-all">
        {filtered.map((tmpl) => {
          const isSelected = selectedId === tmpl.id;
          const { Preview } = tmpl;
          return (
            <button
              key={tmpl.id}
              onClick={() => setSelectedId(tmpl.id)}
              className={cn(
                "group/item relative flex flex-col rounded-lg overflow-hidden bg-card border-2 transition-all sci-fi-clip",
                isSelected
                  ? "border-primary ring-2 ring-primary/40 glow-border"
                  : "border-primary/20 hover:border-primary/50"
              )}
            >
              {/* Badges */}
              {tmpl.tier === "pro" && (
                <div className="absolute top-2 left-2 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning text-warning-foreground text-[10px] font-bold uppercase tracking-wider">
                  <Crown className="w-3 h-3" />
                  Pro
                </div>
              )}
              {tmpl.badge === "popular" && (
                <div className="absolute top-2 left-2 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                  <Zap className="w-3 h-3" />
                  Popular
                </div>
              )}
              {isSelected && (
                <div className="absolute top-2 right-2 z-20 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}

              {/* Preview area */}
              <div className="relative w-full" style={{ height: "200px" }}>
                <div className="absolute inset-0 aspect-[3/4] mx-auto">
                  <Preview />
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 z-10 bg-background/70 backdrop-blur-sm opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-mono uppercase tracking-wider">
                    Use this template
                  </div>
                </div>
              </div>

              {/* Footer label */}
              <div className="px-2 py-1.5 border-t border-primary/10 text-left">
                <span className="text-[11px] font-display font-semibold uppercase tracking-wider">
                  {tmpl.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Sticky footer CTA */}
      <div className="sticky bottom-0 mt-4 -mx-1 px-3 py-3 flex items-center justify-between border-t border-primary/20 bg-card/95 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <CheckCircle className="w-4 h-4 text-success" />
          All templates are 100% ATS-friendly
        </div>
        <Button size="sm" onClick={onSelect}>
          Use {selected.name}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

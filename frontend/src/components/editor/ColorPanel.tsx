import { useState } from "react";
import { ChevronDown, Palette, Check, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  COLOR_PRESETS,
  type ResumeColors,
  type ColorPreset,
} from "@/hooks/useResumeColors";

interface Props {
  colors: ResumeColors;
  activePresetId: string | null;
  onApplyPreset: (preset: ColorPreset) => void;
  onSetColor: (key: keyof ResumeColors, value: string) => void;
  onReset: () => void;
}

export default function ColorPanel({
  colors,
  activePresetId,
  onApplyPreset,
  onSetColor,
  onReset,
}: Props) {
  const [open, setOpen] = useState(true);

  return (
    <Card>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-2 cursor-pointer select-none">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                Resume Colors
              </CardTitle>
              <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-5">
            {/* Presets */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-mono">Presets</Label>
              <div className="flex flex-wrap gap-3">
                {COLOR_PRESETS.map((p) => (
                  <PresetSwatch
                    key={p.id}
                    preset={p}
                    active={activePresetId === p.id}
                    onClick={() => onApplyPreset(p)}
                  />
                ))}
              </div>
            </div>

            {/* Individual color inputs */}
            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-mono">Custom</Label>
              <ColorRow label="Primary Color" hint="Buttons, sidebar, borders" value={colors.primary} onChange={(v) => onSetColor("primary", v)} />
              <ColorRow label="Accent Color" hint="Icons, highlights, tags" value={colors.accent} onChange={(v) => onSetColor("accent", v)} />
              <ColorRow label="Heading Color" hint="Name, section titles" value={colors.heading} onChange={(v) => onSetColor("heading", v)} />
            </div>

            {/* Reset */}
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
            >
              <RotateCcw className="h-3 w-3" />
              Reset to default
            </button>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

function PresetSwatch({ preset, active, onClick }: { preset: ColorPreset; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={preset.name}
      aria-label={`Apply ${preset.name} preset`}
      className={cn(
        "relative h-7 w-7 rounded-full border-2 transition-all hover:scale-110",
        active ? "border-primary ring-2 ring-primary/40" : "border-border hover:border-primary/50"
      )}
      style={{
        background: `conic-gradient(${preset.colors.primary} 0 33%, ${preset.colors.accent} 33% 66%, ${preset.colors.heading} 66% 100%)`,
      }}
    >
      {active && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="rounded-full bg-background/80 backdrop-blur-sm p-0.5">
            <Check className="h-3 w-3 text-primary" />
          </span>
        </span>
      )}
    </button>
  );
}

function ColorRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="relative h-9 w-9 rounded-md border border-border overflow-hidden cursor-pointer shrink-0" style={{ background: value }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </label>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium leading-tight">{label}</div>
        <div className="text-[11px] text-muted-foreground leading-tight">{hint}</div>
      </div>
      <code className="text-[11px] font-mono text-muted-foreground tabular-nums">{value.toUpperCase()}</code>
    </div>
  );
}

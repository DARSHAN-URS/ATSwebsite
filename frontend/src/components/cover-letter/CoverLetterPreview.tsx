import { useRef, useEffect, useState } from "react";
import type { CoverLetterData } from "@/pages/CoverLetters";

interface Props {
  data: CoverLetterData;
  isLegacy: boolean;
}

// True A4 at 96dpi: 210mm x 297mm => 794 x 1123 px
const PAPER_W = 794;
const PAPER_H = 1123;

function PreviewContent({ data, isLegacy }: Props) {
  const pageStyle: React.CSSProperties = {
    width: PAPER_W,
    minHeight: PAPER_H,
    padding: 64,
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: 11,
    lineHeight: 1.6,
    color: "#222",
    background: "#fff",
    boxSizing: "border-box",
  };

  if (isLegacy) {
    return (
      <div style={pageStyle}>
        <p>{data.greeting}</p>
        <p style={{ marginTop: 14 }}>{data.opening}</p>
        <p style={{ marginTop: 14 }}>{data.body}</p>
        <p style={{ marginTop: 14 }}>{data.closing}</p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      {/* Sender */}
      <div style={{ marginBottom: 22, lineHeight: 1.5 }}>
        {data.applicant_name && (
          <p style={{ margin: 0, fontWeight: "bold", fontSize: 16 }}>{data.applicant_name}</p>
        )}
        {data.applicant_address && <p style={{ margin: 0 }}>{data.applicant_address}</p>}
        {data.applicant_phone && <p style={{ margin: 0 }}>{data.applicant_phone}</p>}
        {data.applicant_email && <p style={{ margin: 0 }}>{data.applicant_email}</p>}
        {data.applicant_linkedin && <p style={{ margin: 0 }}>{data.applicant_linkedin}</p>}
      </div>

      {data.date && <p style={{ margin: "0 0 22px 0" }}>{data.date}</p>}

      {/* Recipient */}
      <div style={{ marginBottom: 22, lineHeight: 1.5 }}>
        {data.recipient_name && (
          <p style={{ margin: 0, fontWeight: 600 }}>{data.recipient_name}</p>
        )}
        {data.recipient_title && <p style={{ margin: 0 }}>{data.recipient_title}</p>}
        {data.company_name && <p style={{ margin: 0 }}>{data.company_name}</p>}
        {data.company_address && <p style={{ margin: 0 }}>{data.company_address}</p>}
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #ccc", margin: "18px 0" }} />

      {data.subject_line && (
        <>
          <p style={{ fontWeight: "bold", fontSize: 12, margin: "0 0 14px 0" }}>
            {data.subject_line}
          </p>
          <hr style={{ border: "none", borderTop: "1px solid #ccc", margin: "18px 0" }} />
        </>
      )}

      <p style={{ margin: "0 0 16px 0" }}>{data.greeting}</p>
      <p style={{ margin: "0 0 14px 0", textAlign: "justify" }}>{data.opening}</p>
      <p style={{ margin: "0 0 14px 0", textAlign: "justify" }}>{data.value_experience}</p>
      <p style={{ margin: "0 0 14px 0", textAlign: "justify" }}>{data.why_company}</p>
      <p style={{ margin: "0 0 14px 0", textAlign: "justify" }}>{data.closing}</p>

      <div style={{ marginTop: 32 }}>
        <p style={{ margin: 0 }}>{data.sign_off || "Sincerely,"}</p>
        <p style={{ margin: "24px 0 0 0", fontWeight: "bold" }}>{data.applicant_name}</p>
      </div>
    </div>
  );
}

export default function CoverLetterPreview({ data, isLegacy }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [contentH, setContentH] = useState(PAPER_H);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setScale(Math.min(1, w / PAPER_W));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (innerRef.current) {
      setContentH(Math.max(PAPER_H, innerRef.current.scrollHeight));
    }
  }, [data, isLegacy]);

  return (
    <div
      ref={containerRef}
      className="w-full overflow-y-auto bg-muted/40 rounded-lg border border-border/60 p-2 md:p-4"
      style={{ maxHeight: "calc(100vh - 160px)" }}
    >
      <div
        style={{
          height: contentH * scale,
          width: "100%",
          position: "relative",
        }}
      >
        <div
          ref={innerRef}
          style={{
            width: PAPER_W,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            position: "absolute",
            top: 0,
            left: 0,
            background: "white",
            boxShadow: "0 2px 16px rgba(0,0,0,0.12)",
          }}
        >
          <PreviewContent data={data} isLegacy={isLegacy} />
        </div>
      </div>
    </div>
  );
}

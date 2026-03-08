import { useRef, useEffect, useState } from "react";
import type { CoverLetterData } from "@/pages/CoverLetters";

interface Props {
  data: CoverLetterData;
  isLegacy: boolean;
}

const A4_W = 595;
const A4_MIN_H = 842;

function A4Page({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(A4_MIN_H);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;

    const ro = new ResizeObserver(() => {
      const availableWidth = wrapper.getBoundingClientRect().width;
      const newScale = Math.min(1, availableWidth / A4_W);
      setScale(newScale);
      setContentHeight(Math.max(A4_MIN_H, content.scrollHeight));
    });
    ro.observe(wrapper);
    ro.observe(content);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapperRef} className="w-full overflow-hidden" style={{ height: contentHeight * scale }}>
      <div
        ref={contentRef}
        style={{
          width: A4_W,
          minHeight: A4_MIN_H,
          padding: "60px 50px",
          fontFamily: "Georgia, serif",
          fontSize: "11pt",
          lineHeight: "1.6",
          color: "#222",
          background: "#fff",
          transformOrigin: "top left",
          transform: `scale(${scale})`,
          boxShadow: "0 2px 12px rgba(0,0,0,.12)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function CoverLetterPreview({ data, isLegacy }: Props) {
  if (isLegacy) {
    return (
      <A4Page>
        <p>{data.greeting}</p>
        <p style={{ marginTop: 12 }}>{data.opening}</p>
        <p style={{ marginTop: 12 }}>{data.body}</p>
        <p style={{ marginTop: 12 }}>{data.closing}</p>
      </A4Page>
    );
  }

  return (
    <A4Page>
      {/* Sender */}
      <div style={{ marginBottom: 20, fontSize: "10pt", lineHeight: 1.5 }}>
        {data.applicant_name && <p style={{ margin: 0, fontWeight: "bold", fontSize: "13pt" }}>{data.applicant_name}</p>}
        {data.applicant_address && <p style={{ margin: 0 }}>{data.applicant_address}</p>}
        {data.applicant_phone && <p style={{ margin: 0 }}>{data.applicant_phone}</p>}
        {data.applicant_email && <p style={{ margin: 0 }}>{data.applicant_email}</p>}
        {data.applicant_linkedin && <p style={{ margin: 0 }}>{data.applicant_linkedin}</p>}
      </div>

      {data.date && <p style={{ margin: "0 0 20px 0", fontSize: "10pt" }}>{data.date}</p>}

      {/* Recipient */}
      <div style={{ marginBottom: 20, fontSize: "10pt", lineHeight: 1.5 }}>
        {data.recipient_name && <p style={{ margin: 0, fontWeight: 600 }}>{data.recipient_name}</p>}
        {data.recipient_title && <p style={{ margin: 0 }}>{data.recipient_title}</p>}
        {data.company_name && <p style={{ margin: 0 }}>{data.company_name}</p>}
        {data.company_address && <p style={{ margin: 0 }}>{data.company_address}</p>}
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #ccc", margin: "16px 0" }} />

      {data.subject_line && (
        <>
          <p style={{ fontWeight: "bold", fontSize: "10.5pt", margin: "0 0 12px 0" }}>{data.subject_line}</p>
          <hr style={{ border: "none", borderTop: "1px solid #ccc", margin: "16px 0" }} />
        </>
      )}

      <p style={{ margin: "0 0 16px 0" }}>{data.greeting}</p>
      <p style={{ margin: "0 0 14px 0", textAlign: "justify" }}>{data.opening}</p>
      <p style={{ margin: "0 0 14px 0", textAlign: "justify" }}>{data.value_experience}</p>
      <p style={{ margin: "0 0 14px 0", textAlign: "justify" }}>{data.why_company}</p>
      <p style={{ margin: "0 0 14px 0", textAlign: "justify" }}>{data.closing}</p>

      <div style={{ marginTop: 28, fontSize: "10.5pt" }}>
        <p style={{ margin: 0 }}>{data.sign_off || "Sincerely,"}</p>
        <p style={{ margin: "20px 0 0 0", fontWeight: "bold" }}>{data.applicant_name}</p>
      </div>
    </A4Page>
  );
}

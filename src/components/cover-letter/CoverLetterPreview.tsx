import { Separator } from "@/components/ui/separator";
import type { CoverLetterData } from "@/pages/CoverLetters";

interface Props {
  data: CoverLetterData;
  isLegacy: boolean;
}

export default function CoverLetterPreview({ data, isLegacy }: Props) {
  if (isLegacy) {
    return (
      <div className="bg-white text-black shadow-lg mx-auto" style={{ width: "595px", minHeight: "842px", padding: "60px 50px", fontFamily: "Georgia, serif", fontSize: "11pt", lineHeight: "1.6" }}>
        <p>{data.greeting}</p>
        <p style={{ marginTop: "12px" }}>{data.opening}</p>
        <p style={{ marginTop: "12px" }}>{data.body}</p>
        <p style={{ marginTop: "12px" }}>{data.closing}</p>
      </div>
    );
  }

  return (
    <div className="bg-white text-black shadow-lg mx-auto" style={{ width: "595px", minHeight: "842px", padding: "60px 50px", fontFamily: "Georgia, serif", fontSize: "11pt", lineHeight: "1.6", color: "#222" }}>
      {/* Sender header */}
      <div style={{ marginBottom: "20px", fontSize: "10pt", lineHeight: "1.5" }}>
        {data.applicant_name && <p style={{ margin: 0, fontWeight: "bold", fontSize: "13pt" }}>{data.applicant_name}</p>}
        {data.applicant_address && <p style={{ margin: 0 }}>{data.applicant_address}</p>}
        {data.applicant_phone && <p style={{ margin: 0 }}>{data.applicant_phone}</p>}
        {data.applicant_email && <p style={{ margin: 0 }}>{data.applicant_email}</p>}
        {data.applicant_linkedin && <p style={{ margin: 0 }}>{data.applicant_linkedin}</p>}
      </div>

      {/* Date */}
      {data.date && <p style={{ margin: "0 0 20px 0", fontSize: "10pt" }}>{data.date}</p>}

      {/* Recipient */}
      <div style={{ marginBottom: "20px", fontSize: "10pt", lineHeight: "1.5" }}>
        {data.recipient_name && <p style={{ margin: 0, fontWeight: 600 }}>{data.recipient_name}</p>}
        {data.recipient_title && <p style={{ margin: 0 }}>{data.recipient_title}</p>}
        {data.company_name && <p style={{ margin: 0 }}>{data.company_name}</p>}
        {data.company_address && <p style={{ margin: 0 }}>{data.company_address}</p>}
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #ccc", margin: "16px 0" }} />

      {/* Subject line */}
      {data.subject_line && (
        <p style={{ fontWeight: "bold", fontSize: "10.5pt", margin: "0 0 12px 0" }}>{data.subject_line}</p>
      )}

      {data.subject_line && <hr style={{ border: "none", borderTop: "1px solid #ccc", margin: "16px 0" }} />}

      {/* Greeting */}
      <p style={{ margin: "0 0 16px 0" }}>{data.greeting}</p>

      {/* Paragraphs */}
      <p style={{ margin: "0 0 14px 0", textAlign: "justify" }}>{data.opening}</p>
      <p style={{ margin: "0 0 14px 0", textAlign: "justify" }}>{data.value_experience}</p>
      <p style={{ margin: "0 0 14px 0", textAlign: "justify" }}>{data.why_company}</p>
      <p style={{ margin: "0 0 14px 0", textAlign: "justify" }}>{data.closing}</p>

      {/* Sign-off */}
      <div style={{ marginTop: "28px", fontSize: "10.5pt" }}>
        <p style={{ margin: 0 }}>{data.sign_off || "Sincerely,"}</p>
        <p style={{ margin: "20px 0 0 0", fontWeight: "bold" }}>{data.applicant_name}</p>
      </div>
    </div>
  );
}
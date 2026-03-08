import { Separator } from "@/components/ui/separator";
import type { CoverLetterData } from "@/pages/CoverLetters";

interface Props {
  data: CoverLetterData;
  isLegacy: boolean;
}

export default function CoverLetterPreview({ data, isLegacy }: Props) {
  if (isLegacy) {
    return (
      <div className="prose prose-sm max-w-none space-y-4 font-serif text-foreground">
        <p>{data.greeting}</p>
        <p>{data.opening}</p>
        <p>{data.body}</p>
        <p>{data.closing}</p>
      </div>
    );
  }

  return (
    <div className="prose prose-sm max-w-none font-serif text-foreground space-y-0 leading-relaxed">
      {/* Sender header */}
      <div className="not-prose space-y-0.5 text-sm mb-4">
        {data.applicant_name && <p className="font-bold text-base m-0">{data.applicant_name}</p>}
        {data.applicant_address && <p className="m-0">{data.applicant_address}</p>}
        {data.applicant_phone && <p className="m-0">{data.applicant_phone}</p>}
        {data.applicant_email && <p className="m-0">{data.applicant_email}</p>}
        {data.applicant_linkedin && <p className="m-0">{data.applicant_linkedin}</p>}
      </div>

      {/* Date */}
      {data.date && <p className="text-sm mb-4">{data.date}</p>}

      {/* Recipient */}
      <div className="not-prose space-y-0.5 text-sm mb-4">
        {data.recipient_name && <p className="font-semibold m-0">{data.recipient_name}</p>}
        {data.recipient_title && <p className="m-0">{data.recipient_title}</p>}
        {data.company_name && <p className="m-0">{data.company_name}</p>}
        {data.company_address && <p className="m-0">{data.company_address}</p>}
      </div>

      <Separator className="my-3" />

      {/* Subject line */}
      {data.subject_line && (
        <p className="font-bold text-sm mb-3">{data.subject_line}</p>
      )}

      <Separator className="my-3" />

      {/* Greeting */}
      <p className="mb-3">{data.greeting}</p>

      {/* Paragraphs */}
      <p className="mb-3">{data.opening}</p>
      <p className="mb-3">{data.value_experience}</p>
      <p className="mb-3">{data.why_company}</p>
      <p className="mb-3">{data.closing}</p>

      {/* Sign-off */}
      <div className="mt-6 not-prose text-sm">
        <p className="m-0">{data.sign_off || "Sincerely,"}</p>
        <p className="m-0 mt-4 font-bold">{data.applicant_name}</p>
      </div>
    </div>
  );
}

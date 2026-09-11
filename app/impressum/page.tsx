import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";
import {
  CONTACT_TELEGRAM,
  CONTACT_TELEGRAM_URL,
  SITE_OPERATOR,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Legal Notice | GTC of Neuroscience Credits",
  description: "Legal notice for GTC of Neuroscience Credits",
};

export default function ImpressumPage() {
  return (
    <LegalPageLayout title="Legal Notice">
      <section className="space-y-2">
        <h2>Information pursuant to § 5 DDG</h2>
        <p>
          {SITE_OPERATOR}
          <br />
          Germany
        </p>
        <p>
          Telegram:{" "}
          <a href={CONTACT_TELEGRAM_URL} target="_blank" rel="noopener noreferrer">
            {CONTACT_TELEGRAM}
          </a>
        </p>
        <p className="text-gray-500">
          This is a private, non-commercial hobby project.
        </p>
      </section>

      <section className="space-y-2">
        <h2>Responsible for content pursuant to § 18 (2) MStV</h2>
        <p>{SITE_OPERATOR}</p>
      </section>

      <section className="space-y-2">
        <h2>Liability for content</h2>
        <p>
          The content of this website was created with the greatest possible
          care. However, no guarantee can be given for the accuracy,
          completeness, or timeliness of the study plan and grade calculations
          provided.
        </p>
        <p>
          This tool is not officially affiliated with, endorsed by, or connected
          to the Eberhard Karls University of Tübingen and is provided for informational
          purposes only.
        </p>
      </section>

      <section className="space-y-2">
        <h2>Liability for links</h2>
        <p>
          This website contains links to external third-party websites (e.g.
          Google Slides, GitHub). The respective provider is always responsible
          for their content.
        </p>
      </section>

      <section className="space-y-2">
        <h2>Copyright</h2>
        <p>
          The content and works created by the site operator on this website are
          subject to German copyright law.
        </p>
      </section>

      <section className="space-y-2">
        <h2>Consumer dispute resolution</h2>
        <p>
          We are neither willing nor obliged to participate in dispute
          resolution proceedings before a consumer arbitration board (§ 36
          VSBG).
        </p>
      </section>
    </LegalPageLayout>
  );
}

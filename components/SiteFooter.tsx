import Link from "next/link";
import {
  CONTACT_TELEGRAM,
  CONTACT_TELEGRAM_URL,
  GITHUB_REPO_URL,
  ORIGINAL_REPO_AUTHOR,
  ORIGINAL_REPO_URL,
  SITE_OPERATOR,
} from "@/lib/site";

type SiteFooterProps = {
  actions?: React.ReactNode;
};

export function SiteFooter({ actions }: SiteFooterProps) {
  return (
    <footer className="mt-12 py-4 border-t text-center text-sm text-gray-500">
      {actions ? (
        <div className="flex flex-col items-center gap-3 mb-2">{actions}</div>
      ) : null}
      <p className="flex flex-wrap justify-center gap-x-3 gap-y-1">
        <Link href="/impressum" className="text-blue-500 hover:underline">
          Legal Notice
        </Link>
        <span aria-hidden="true">·</span>
        <Link href="/datenschutz" className="text-blue-500 hover:underline">
          Privacy Policy
        </Link>
        <span aria-hidden="true">·</span>
        <a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          GitHub
        </a>
      </p>
      <p>
        Created by {SITE_OPERATOR} • Telegram:{" "}
        <a
          href={CONTACT_TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {CONTACT_TELEGRAM}
        </a>
      </p>
      <p>
        Based on the original{" "}
        <a
          href={ORIGINAL_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          coxi-credits
        </a>{" "}
        project by {ORIGINAL_REPO_AUTHOR}.
      </p>
      <p className="mt-4 text-xs text-gray-400 max-w-2xl mx-auto">
        This tool is not affiliated with, endorsed by, or officially connected
        to the Eberhard Karls University of Tübingen. All calculations and grade estimates are
        provided for informational purposes only; no guarantee is given for
        their accuracy.
      </p>
    </footer>
  );
}

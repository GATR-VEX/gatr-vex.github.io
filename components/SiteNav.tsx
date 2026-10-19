"use client";

import Link from "next/link";
import { AuthButtons } from "@/components/AuthButtons";

export type MarketingTab = "home" | "people" | "connect";

type SiteNavProps = {
  activeTab?: MarketingTab;
  onTabChange?: (tab: MarketingTab) => void;
};

const MARKETING_TABS: { id: MarketingTab; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "people", label: "People" },
  { id: "connect", label: "Connect" },
];

function tabHref(tab: MarketingTab): string {
  return tab === "home" ? "/" : `/?tab=${tab}`;
}

export function SiteNav({ activeTab, onTabChange }: SiteNavProps) {
  const useTabs = typeof onTabChange === "function";

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-rule font-nav">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
        {useTabs ? (
          <button
            type="button"
            onClick={() => onTabChange("home")}
            className="text-left cursor-pointer shrink-0 text-[15px] font-bold text-ink tracking-tight"
          >
            GATR VEX Robotics
          </button>
        ) : (
          <Link
            href="/"
            className="shrink-0 text-[15px] font-bold text-ink tracking-tight"
          >
            GATR VEX Robotics
          </Link>
        )}

        {/* Fixed nav cluster so Sign in stays in the same spot on every page */}
        <div className="flex items-center gap-6 md:gap-8 shrink-0">
          <nav className="hidden md:flex items-center gap-8 font-sans text-[13px] font-semibold tracking-widest text-ink-muted">
            {MARKETING_TABS.map((tab) =>
              useTabs ? (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={`hover:text-ink transition-colors ${
                    activeTab === tab.id ? "text-ink" : ""
                  }`}
                >
                  {tab.label}
                </button>
              ) : (
                <Link
                  key={tab.id}
                  href={tabHref(tab.id)}
                  className="hover:text-ink transition-colors"
                >
                  {tab.label}
                </Link>
              ),
            )}
          </nav>
          <AuthButtons />
        </div>
      </div>

      {/* Mobile tabs — same links on every page */}
      <div className="md:hidden flex justify-center gap-6 h-11 items-center font-sans text-[12px] font-semibold tracking-widest text-ink-muted border-b border-rule">
        {MARKETING_TABS.map((tab) =>
          useTabs ? (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`hover:text-ink transition-colors ${
                activeTab === tab.id ? "text-ink" : ""
              }`}
            >
              {tab.label}
            </button>
          ) : (
            <Link
              key={tab.id}
              href={tabHref(tab.id)}
              className="hover:text-ink transition-colors"
            >
              {tab.label}
            </Link>
          ),
        )}
      </div>
    </header>
  );
}

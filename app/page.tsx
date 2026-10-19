"use client";

import React, { useEffect, useState } from "react";
import { ConnectSection } from "@/components/ConnectSection";
import { SiteNav, type MarketingTab } from "@/components/SiteNav";
import { btnPrimary, pageMain } from "@/lib/ui";

// ============================================================================
// ICONS & ASSETS
// ============================================================================

const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

/** Home hero banner — cycles in order; add/remove files under public/images/hero/ as needed */
const HERO_BANNER_IMAGES = [
  "/images/hero/GATRTeamPhoto.JPG",
  "/images/hero/GATRTeamPhoto1.jpg",
  "/images/hero/GATRTeamPhoto2.jpeg",
  "/images/hero/GATRTeamPhoto3.jpeg",
  "/images/hero/GATRTeamPhoto4.jpg",
  "/images/hero/GATRTeamPhoto5.jpg",
  "/images/hero/GATRTeamPhoto6.jpg",
  "/images/hero/GATRTeamPhoto7.jpeg",
];

// ============================================================================
// ORGANIZATION DATA
// ============================================================================

const NEWS_UPDATES = [
  { date: "APR 2026", title: "GATR1 takes home the Design Award at the VEX Robotics World Championship" },
  { date: "MAR 2026", title: "GATR2 receives an invite to attend the World Championship in St. Louis, Missouri" },
  { date: "FEB 2026", title: "GATR1 ranks #1 in both overall and autonomous skills in Marietta, Georgia, while GATR2 takes home the Judges Award" },
  { date: "FEB 2026", title: "GATR1 wins the Excellence Award at the Bristol Signature Event to qualify for the World Championship" },
  { date: "JAN 2026", title: "GATR2 takes home the Innovate Award at Auburn University for their custom swerve drive" },
  { date: "DEC 2025", title: "GATR1 and GATR2 take home the Judges and Design Awards, respectively, in Apopka" },
];

/** Roster line — Role / Major / Year / LinkedIn. Shown as “Major Year”. */
type RosterMember = {
  name: string;
  role: string;
  major: string;
  /** Grad year with apostrophe, e.g. '28 */
  year: string;
  image?: string;
  linkedin?: string;
};

function rosterDegreeLine(m: RosterMember): string {
  return `${m.major} ${m.year}`;
}

const ORGANIZATION_ROSTER: {
  eboard: RosterMember[];
  gatr1: RosterMember[];
  gatr2: RosterMember[];
  alumni: RosterMember[];
} = {
  eboard: [
    { name: "Cannon Spencer", role: "President & Software Lead", major: "CPE", year: "'26", image: "/images/teams/CannonSpencer.png", linkedin: "https://www.linkedin.com/in/cannon-spencer/" },
    { name: "Sarah Kim", role: "External Vice President", major: "ACT", year: "'27", image: "/images/teams/SarahKim.png", linkedin: "https://www.linkedin.com/in/sarahkimuf/" },
    { name: "Zander Dyal", role: "Internal Vice President", major: "ME", year: "'28", image: "/images/teams/ZanderDyal.jpg", linkedin: "https://www.linkedin.com/in/zander-dyal/" },
  ],
  gatr1: [
    { name: "Davis Lester", role: "GATR1 Captain", major: "EE", year: "'28", image: "/images/teams/DavisLester.jpg", linkedin: "https://www.linkedin.com/in/davis-lester/" },
    { name: "Logan Thomley", role: "Build Lead", major: "CS", year: "'28", image: "/images/teams/LoganThomley.webp", linkedin: "https://www.linkedin.com/in/loganthomley/" },
    { name: "Jason Iduyan", role: "Designer", major: "CPE", year: "'29", image: "/images/teams/JasonIduyan.png", linkedin: "https://www.linkedin.com/in/jasoniduyan/" },
    { name: "Lizzie Marchand", role: "Notebooker", major: "ARC", year: "'29", image: "/images/teams/LizzieMarchand.png", linkedin: "https://www.linkedin.com/in/elizabeth-marchand-ba8a9a2a5/" },
    { name: "Brian Lin", role: "Programmer", major: "ME", year: "'28", image: "/images/teams/BrianLin.png", linkedin: "https://www.linkedin.com/in/brian-linuf/" },
    { name: "Corina Polanco", role: "Builder", major: "ME", year: "'29", image: "/images/teams/CorinaPolanco.png", linkedin: "" },
    { name: "Sebastian Lopez", role: "Build Design and Software", major: "ME", year: "'29", image: "/images/teams/SebastianLopez.png", linkedin: "https://www.linkedin.com/in/sebaslope/" },
    { name: "Adam Westphal", role: "Notebook & Strategy", major: "PSE", year: "'29", image: "/images/teams/AdamWestphal.png", linkedin: "https://www.linkedin.com/in/adam-westphal-229v2733j/" },
    { name: "Jacob Sabelli", role: "Build & Design", major: "ME", year: "'29", image: "/images/teams/JacobSabelli.png", linkedin: "https://www.linkedin.com/in/jacob-sabelli-aa2811386/" },
  ],
  gatr2: [
    { name: "Will Schweisguth", role: "GATR2 Captain", major: "ME", year: "'28", image: "/images/teams/WillSchweisguth.png", linkedin: "https://www.linkedin.com/in/williamschw/" },
    { name: "Anastacia Delany", role: "Builder", major: "ME", year: "'29", image: "/images/teams/AnastaciaDelany.png", linkedin: "https://www.linkedin.com/in/anastacia-delany/" },
    { name: "Brady Warner", role: "Programming Lead", major: "ME", year: "'28", image: "/images/teams/BradyWarner.png", linkedin: "https://www.linkedin.com/in/bradywarner1" },
    { name: "Vennela Sadineni", role: "Programmer", major: "CPE", year: "'29", image: "/images/teams/VennelaSadineni.png", linkedin: "https://www.linkedin.com/in/vennela-sadineni-662811293/" },
    { name: "David Arceo", role: "Designer", major: "BE", year: "'27", image: "/images/teams/DavidArceo.png", linkedin: "https://www.linkedin.com/in/david-arceo-zamora/" },
    { name: "Connor Martin", role: "Programmer", major: "CPE", year: "'28", image: "/images/teams/ConnorMartin.png", linkedin: "https://www.linkedin.com/in/connor-d-martin/" },
    { name: "Edison Lara-Bojay", role: "Electronics Lead", major: "EE", year: "'28", image: "/images/teams/EdisonLara-Bojay.png", linkedin: "https://www.linkedin.com/in/edison-lara-bojay/" },
    { name: "Sagan Giardino", role: "Electronics", major: "EE", year: "'28", image: "/images/teams/SaganGiardino.png", linkedin: "https://www.linkedin.com/in/sagangiardino/" },
    { name: "Hector Nava", role: "Designer", major: "ME", year: "'29", image: "/images/teams/HectorNava.jpg", linkedin: "https://www.linkedin.com/in/hnava12/" },
    { name: "Joseph Cavnar", role: "Designer", major: "ME", year: "'28", image: "/images/teams/JosephCavnar.png", linkedin: "https://www.linkedin.com/in/joseph-cavnar/" },
    { name: "Khang Lam", role: "Builder", major: "ME", year: "'29", image: "/images/teams/KhangLam.png", linkedin: "https://www.linkedin.com/in/khang-lam-5b969b30a/" },
    { name: "Nathan Hinkle", role: "Build", major: "ME", year: "'28", image: "/images/teams/NathanHinkle.png", linkedin: "https://www.linkedin.com/in/nathan-hinkle/" },
    { name: "Sebastian Vasquez", role: "Designer", major: "ME", year: "'29", image: "/images/teams/SebastianVasquez.png", linkedin: "https://www.linkedin.com/in/sebastian-c-vasquez/" },
  ],
  // Alumni: newest graduation year first; same year alphabetically by last name
  alumni: [
    { name: "Safid Alam", role: "GATR2", major: "ME", year: "'29", image: "/images/teams/SafidAlam.png", linkedin: "" },
    { name: "Seanpaul Areas", role: "GATR2", major: "ASE", year: "'29", image: "/images/teams/SeanpaulAreas.png", linkedin: "" },
    { name: "Emanuele Cavallaro", role: "GATR2", major: "ME", year: "'29", image: "/images/teams/EmanueleCavallaro.png", linkedin: "" },
    { name: "Maxene Davis", role: "GATR2", major: "ME", year: "'29", image: "/images/teams/MaxeneDavis.png", linkedin: "https://www.linkedin.com/in/maxenedavis/" },
    { name: "Nathaniel Levine", role: "GATR2", major: "BBA", year: "'29", image: "/images/teams/NathanielLevine.png", linkedin: "https://www.linkedin.com/in/nathaniel-levine/" },
    { name: "Alec McEwen", role: "GATR1", major: "CPE", year: "'29", image: "/images/teams/AlecMcewen.png", linkedin: "https://www.linkedin.com/in/alec-mcewen-814537366/" },
    { name: "Kyle Resetar", role: "GATR2", major: "ME", year: "'29", image: "/images/teams/KyleResetar.png", linkedin: "https://www.linkedin.com/in/kyle-resetar-94b171386/" },
    { name: "Kaitlyn Campo", role: "GATR2", major: "ME", year: "'28", image: "/images/teams/KaitlynCampo.png", linkedin: "https://www.linkedin.com/in/kaitlyncampo/" },
    { name: "Ailey Smith", role: "GATR1 Captain", major: "ME", year: "'28", image: "/images/teams/AileySmith.png", linkedin: "https://www.linkedin.com/in/aileyksmith/" },
    { name: "Ryan Littler", role: "GATR2", major: "ME", year: "'27", image: "/images/teams/RyanLittler.png", linkedin: "https://www.linkedin.com/in/ryan-littler/" },
    { name: "Lucas Salas", role: "GATR2 Captain", major: "ME", year: "'27", image: "/images/teams/LucasSalas.png", linkedin: "https://www.linkedin.com/in/lucas-salas/" },
    { name: "Ivan Calderon", role: "GATR2", major: "ME", year: "'26", image: "/images/teams/IvanCalderon.png", linkedin: "https://www.linkedin.com/in/ivan-calex/" },
    { name: "Alan Gage", role: "GATR1", major: "ME", year: "'26", image: "/images/teams/AlanGage.webp", linkedin: "https://www.linkedin.com/in/alan-gage-929230292/" },
    { name: "Madison Chubb", role: "GATR1", major: "AE", year: "'25", image: "/images/teams/MadisonChubb.png", linkedin: "https://www.linkedin.com/in/madison-chubb-0338b4264/" },
    { name: "Sean Moody", role: "Captain", major: "EE", year: "'25", image: "/images/teams/SeanMoody.png", linkedin: "https://www.linkedin.com/in/smdy-89106b27b/" },
    { name: "Katelynn Shandik", role: "Captain", major: "CS", year: "'25", image: "/images/teams/KatelynnShandik.png", linkedin: "https://www.linkedin.com/in/katelynn-shandik-693998207/" },
    { name: "Eric Steyn", role: "President", major: "ME", year: "'25", image: "/images/teams/EricSteyn.png", linkedin: "https://www.linkedin.com/in/ericsteyn/" },
    { name: "Matthew Darrow", role: "GATR1", major: "CPE", year: "'24", image: "/images/teams/MatthewDarrow.png", linkedin: "https://www.linkedin.com/in/matthew-c-darrow/" },
    { name: "Thorsten Lannynd", role: "GATR1", major: "CS", year: "'24", image: "/images/teams/ThorstenLannynd.png", linkedin: "https://www.linkedin.com/in/thorstenlannynd/" },
    { name: "Christian Mosey", role: "GATR1", major: "CS", year: "'24", image: "/images/teams/ChristianMosey.png", linkedin: "https://www.linkedin.com/in/christianmosey/" },
    { name: "Carson Powers", role: "GATR1", major: "CPE", year: "'24", image: "/images/teams/CarsonPowers.png", linkedin: "https://www.linkedin.com/in/carson-alan-powers/" },
    { name: "Jack Sopotnick", role: "Captain", major: "ME", year: "'23", image: "/images/teams/JackSopotnick.png", linkedin: "https://www.linkedin.com/in/jack-sopotnick/" },
    { name: "Adam Ellenbogen", role: "GATR1", major: "ME", year: "'22", image: "/images/teams/AdamEllenbogen.png", linkedin: "https://www.linkedin.com/in/adam-ellenbogen-488478225/" },
    { name: "Cameron Soviero", role: "President", major: "CPE", year: "'22", image: "/images/teams/CameronSoviero.png", linkedin: "https://www.linkedin.com/in/cameronsoviero/" },
    { name: "Zachary Soviero", role: "Captain", major: "ECE", year: "'22", image: "/images/teams/ZacharySoviero.png", linkedin: "https://www.linkedin.com/in/zachsoviero/" },
  ],
};

// ============================================================================
// REUSABLE UI COMPONENTS
// ============================================================================

/**
 * MemberCard Component
 * Displays a clean, square profile picture with the member's details below.
 * If a 'linkedin' URL is provided in the data, it automatically wraps the entire 
 * card in a clickable link that opens in a new tab.
 */
const MemberCard = ({ m }: { m: RosterMember }) => {
  const cardContent = (
    <div className="group cursor-pointer">
      <div className="aspect-square bg-surface mb-3 overflow-hidden rounded-2xl">
        <img
          src={m.image || "/api/placeholder/300/300"}
          alt={m.name}
          className="w-full h-full rounded-2xl object-cover"
        />
      </div>
      <div className="font-heading text-[15px] font-medium text-ink group-hover:text-accent transition-colors">
        {m.name}
      </div>
      <div className="text-sm text-ink-muted mt-0.5">{m.role}</div>
      <div className="text-xs text-ink-muted/80 font-mono mt-1">
        {rosterDegreeLine(m)}
      </div>
    </div>
  );

  // Return as a link if they have a LinkedIn, otherwise return standard layout
  return m.linkedin ? (
    <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="block">
      {cardContent}
    </a>
  ) : (
    cardContent
  );
};

// ============================================================================
// MAIN APPLICATION COMPONENT
// ============================================================================

function HomeView() {
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    if (HERO_BANNER_IMAGES.length <= 1) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;
    const id = window.setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_BANNER_IMAGES.length);
    }, 5500);
    return () => window.clearInterval(id);
  }, []);

  const advanceHero = () => {
    if (HERO_BANNER_IMAGES.length <= 1) return;
    setHeroIndex((i) => (i + 1) % HERO_BANNER_IMAGES.length);
  };

  return (
    <div>
      <section className="pb-10">
        <div
          className={`group relative aspect-[21/9] w-full overflow-hidden rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
            HERO_BANNER_IMAGES.length > 1 ? "cursor-pointer" : ""
          }`}
          aria-roledescription="carousel"
          aria-label={
            HERO_BANNER_IMAGES.length > 1
              ? "Team photos — click or press Enter for next"
              : "Team photo"
          }
          tabIndex={HERO_BANNER_IMAGES.length > 1 ? 0 : undefined}
          onClick={advanceHero}
          onKeyDown={(e) => {
            if (HERO_BANNER_IMAGES.length <= 1) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              advanceHero();
            }
          }}
        >
          {HERO_BANNER_IMAGES.map((src, i) => (
            <img
              key={src}
              src={src}
              alt="GATR Robotics Team"
              className={`absolute inset-0 z-0 h-full w-full object-cover transition-opacity duration-700 ease-out motion-reduce:transition-none ${
                i === heroIndex ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          <div className="pointer-events-none absolute inset-0 z-[1] bg-ink/5" />
          {HERO_BANNER_IMAGES.length > 1 && (
            <div
              className="pointer-events-none absolute bottom-4 left-1/2 z-[2] flex -translate-x-1/2 gap-1.5"
              aria-hidden
            >
              {HERO_BANNER_IMAGES.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    i === heroIndex ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid md:grid-cols-12 gap-12 md:gap-16 py-4">
        <div className="md:col-span-8">
          <div className="page-title mb-6">
            <h2 className="title-text">GATR VEX Robotics @ UF</h2>
          </div>
          <p className="text-sm text-ink-muted leading-relaxed mb-8">
            GATR VEX is the premiere robotics competition organization at the University of Florida. 
            We focus on the intersection of mechanical and software design to compete within the VEX U robotics competition. 
            We&apos;re comprised of two teams—GATR1 and GATR2—that function as fully independent competition units. Each team conceptualizes, builds, and programs its own distinct robots, competing alongside one another throughout the season.
          </p>
          <a
            href="https://github.com/GATR-VEX"
            target="_blank"
            rel="noopener noreferrer"
            className={btnPrimary}
          >
            <GithubIcon className="w-4 h-4 mr-2" /> GitHub Organization
          </a>
        </div>

        <div className="md:col-span-4">
          <h3 className="font-heading text-sm font-medium text-ink mb-4 pb-2 border-b border-rule">
            Latest Updates
          </h3>
          <div className="space-y-5">
            {NEWS_UPDATES.map((item, i) => (
              <div key={i}>
                <div className="text-xs font-medium text-accent mb-1">
                  {item.date}
                </div>
                <div className="text-sm text-ink leading-snug">{item.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function parseTab(value: string | null): MarketingTab {
  if (value === "people" || value === "connect" || value === "home") return value;
  return "home";
}

export default function LabWebsite() {
  const [activeTab, setActiveTab] = useState<MarketingTab>("home");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setActiveTab(parseTab(params.get("tab")));
  }, []);

  const onTabChange = (tab: MarketingTab) => {
    setActiveTab(tab);
    const url = tab === "home" ? "/" : `/?tab=${tab}`;
    window.history.replaceState(null, "", url);
  };

  // --- VIEW: PEOPLE / ROSTER PAGE ---
  const People = () => (
    <div className="py-2">
      <div className="page-title mb-12">
        <h2 className="title-text">Meet the Team</h2>
      </div>

      {/* Executive Board */}
      <div className="mb-16">
        <h3 className="font-heading text-sm font-medium text-ink mb-8 pb-2 border-b border-rule">
          Executive Board
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
          {ORGANIZATION_ROSTER.eboard.map((m, i) => (
            <MemberCard key={i} m={m} />
          ))}
        </div>
      </div>

      {/* GATR1 Roster */}
      <div className="mb-16">
        <h3 className="font-heading text-sm font-medium text-ink mb-8 pb-2 border-b border-rule">
          GATR 1 Roster
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
          {ORGANIZATION_ROSTER.gatr1.map((m, i) => (
            <MemberCard key={i} m={m} />
          ))}
        </div>
      </div>

      {/* GATR2 Roster */}
      <div className="mb-16">
        <h3 className="font-heading text-sm font-medium text-ink mb-8 pb-2 border-b border-rule">
          GATR 2 Roster
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
          {ORGANIZATION_ROSTER.gatr2.map((m, i) => (
            <MemberCard key={i} m={m} />
          ))}
        </div>
      </div>

      {/* Alumni */}
      <div className="mb-8">
        <h3 className="font-heading text-sm font-medium text-ink mb-8 pb-2 border-b border-rule">
          Alumni
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
          {ORGANIZATION_ROSTER.alumni.map((m, i) => (
            <MemberCard key={`${m.name}-${i}`} m={m} />
          ))}
        </div>
      </div>
    </div>
  );

  // --- VIEW: CONNECT ---
  const Connect = () => <ConnectSection />;

  return (
    <div className="min-h-screen bg-white text-foreground w-full overflow-x-hidden">
      <SiteNav activeTab={activeTab} onTabChange={onTabChange} />

      <main className={pageMain}>
        {activeTab === "home" && <HomeView />}
        {activeTab === "people" && <People />}
        {activeTab === "connect" && <Connect />}
      </main>
    </div>
  );
}

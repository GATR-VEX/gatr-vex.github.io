"use client";

import { useEffect, useState } from "react";
import { DiscordSection } from "@/components/DiscordSection";
import { LinkedInFeed } from "@/components/LinkedInFeed";
import { SOCIABLEKIT_LINKEDIN_POSTS_SCRIPT } from "@/lib/sociablekit";


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
];

const NEWS_UPDATES = [
  { date: "MAR 2026", title: "GATR2 receives an invite to attend the World Championship in St. Louis, Missouri" },
  { date: "FEB 2026", title: "GATR1 ranks #1 in both overall and autonomous skills in Marietta, Georgia, while GATR2 takes home the Judges Award" },
  { date: "FEB 2026", title: "GATR1 wins the Excellence Award at the Bristol Signature Event to qualify for the World Championship" },
  { date: "JAN 2026", title: "GATR2 takes home the Innovate Award at Auburn University for their custom swerve drive" },
  { date: "DEC 2025", title: "GATR1 and GATR2 take home the Judges and Design Awards, respectively, in Apopka" },
];

const ORGANIZATION_ROSTER = {
  eboard: [
    { name: "Cannon Spencer", role: "President & GATR1 Software Lead", degree: "CPE '26", image: "/images/teams/gatr1/CannonSpencer.png", linkedin: "https://www.linkedin.com/in/cannon-spencer/" },
    { name: "Sarah Kim", role: "External Vice President", degree: "ACT '27", image: "/images/teams/gatr2/SarahKim_Notebooker.png", linkedin: "https://www.linkedin.com/in/sarahkimuf/" },
    { name: "Alan Gage", role: "Internal Vice President", degree: "ME '26", image: "/images/teams/gatr1/AlanGage.webp", linkedin: "https://www.linkedin.com/in/alan-gage-929230292/" },
  ],
  gatr1: [
    { name: "Davis Lester", role: "Programmer", degree: "EE '28", image: "/images/teams/gatr1/DavisLester.jpg", linkedin: "https://www.linkedin.com/in/davis-lester/" },
    { name: "Logan Thomley", role: "Programmer", degree: "CS '28", image: "/images/teams/gatr1/LoganThomley.webp", linkedin: "https://www.linkedin.com/in/loganthomley/" },
    { name: "Jason Iduyan", role: "Designer", degree: "CPE '29", image: "/images/teams/gatr1/JasonIduyan.png", linkedin: "https://www.linkedin.com/in/jasoniduyan/" },
    { name: "Lizzie Marchand", role: "Notebooker", degree: "ARC '29", image: "/images/teams/gatr1/LizzieMarchand.png", linkedin: "https://www.linkedin.com/in/elizabeth-marchand-ba8a9a2a5/" },
    { name: "Brian Lin", role: "Programmer", degree: "ME '28", image: "/images/teams/gatr1/BrianLin.png", linkedin: "https://www.linkedin.com/in/brian-linuf/" },
    { name: "Alec McEwen", role: "Software Team Member", degree: "CE '29", image: "/images/teams/gatr1/AlecMcewen.png", linkedin: "https://www.linkedin.com/in/alec-mcewen-814537366/" },
    { name: "Zander Dyal", role: "Designer", degree: "ME '28", image: "/images/teams/gatr1/ZanderDyal.jpg", linkedin: "https://www.linkedin.com/in/zander-dyal/" },
    { name: "Corina Polanco", role: "Builder", degree: "ME '29", image: "/images/teams/gatr1/CorinaPolanco.png", linkedin: "" },
    { name: "Sebastian Lopez", role: "Programmer", degree: "ME '25", image: "/images/teams/gatr1/SebastianLopez.png", linkedin: "https://www.linkedin.com/in/sebaslope/" },
  ],
  gatr2: [
    { name: "Lucas Salas", role: "Team Captain", degree: "ME '27", image: "/images/teams/gatr2/LucasSalas_Captain.png", linkedin: "https://www.linkedin.com/in/lucas-salas" },
    { name: "Ryan Littler", role: "Builder", degree: "ME '27", image: "/images/teams/gatr2/RyanLittler_DesignLead.png", linkedin: "https://www.linkedin.com/in/ryan-littler/" },
    { name: "Anastacia Delany", role: "Builder", degree: "ME '29", image: "/images/teams/gatr2/AnastaciaDelany_BuildLead.png", linkedin: "https://www.linkedin.com/in/anastacia-delany/" },
    { name: "Brady Warner", role: "Programmer", degree: "ME '28", image: "/images/teams/gatr2/BradyWarner_ProgrammingLead.png", linkedin: "https://www.linkedin.com/in/bradywarner1" },
    { name: "Vennela Sadineni", role: "Programmer", degree: "CPE '29", image: "/images/teams/gatr2/VennelaSadineni_NotebookLead.png", linkedin: "https://www.linkedin.com/in/vennela-sadineni-662811293/" },
    { name: "David Arceo", role: "Designer", degree: "BE '27", image: "/images/teams/gatr2/DavidArceo_StrategyLead.png", linkedin: "https://www.linkedin.com/in/david-arceo-zamora/" },
    { name: "Will Schweisguth", role: "Designer", degree: "ME '28", image: "/images/teams/gatr2/WillSchweisguth_Designer.png", linkedin: "https://www.linkedin.com/in/williamschw/" },
    { name: "Connor Martin", role: "Programmer", degree: "CPE '28", image: "/images/teams/gatr2/ConnorMartin_Programmer.png", linkedin: "https://www.linkedin.com/in/connor-d-martin/" },
    { name: "Emanuele Cavallaro", role: "Designer", degree: "EE '29", image: "/images/teams/gatr2/EmanueleCavallaro_Designer.png", linkedin: "" },
    { name: "Hector Nava", role: "Designer", degree: "EE '29", image: "/images/teams/gatr2/HectorNava_Builder.jpg", linkedin: "https://www.linkedin.com/in/hnava12/" },
    { name: "Joseph Cavnar", role: "Designer", degree: "EE '29", image: "/images/teams/gatr2/JosephCavnar_Designer.png", linkedin: "https://www.linkedin.com/in/joseph-cavnar/" },
    { name: "Kaitlyn Campo", role: "Designer", degree: "EE '29", image: "/images/teams/gatr2/KaitlynCampo_Designer.png", linkedin: "https://www.linkedin.com/in/kaitlyncampo/" },
    { name: "Khang Lam", role: "Builder", degree: "EE '29", image: "/images/teams/gatr2/KhangLam_Builder.png", linkedin: "https://www.linkedin.com/in/khang-lam-5b969b30a/" },
    { name: "Kyle Resetar", role: "Designer", degree: "EE '29", image: "/images/teams/gatr2/KyleResetar_Designer.png", linkedin: "https://www.linkedin.com/in/kyle-resetar-94b171386/" },
    { name: "Maxene Davis", role: "Builder", degree: "EE '29", image: "/images/teams/gatr2/MaxeneDavis_Builder.png", linkedin: "https://www.linkedin.com/in/maxenedavis/" },
    { name: "Nathan Hinkle", role: "Designer", degree: "ME '28", image: "/images/teams/gatr2/NathanHinkle_Builder.png", linkedin: "https://www.linkedin.com/in/nathan-hinkle/" },
    { name: "Nathaniel Levine", role: "Notebooker", degree: "BBA '29", image: "/images/teams/gatr2/NathanielLevine_Notebooker.png", linkedin: "https://www.linkedin.com/in/nathaniel-levine/" },
    { name: "Safid Alam", role: "Builder", degree: "EE '29", image: "/images/teams/gatr2/SafidAlam_Builder.png", linkedin: "" },
    { name: "Seanpaul Areas", role: "Notebook & strategy", degree: "ASE '29", image: "/images/teams/gatr2/SeanpaulAreas_Notebooker.png", linkedin: "" },
    { name: "Sebastian Vasquez", role: "Designer", degree: "EE '29", image: "/images/teams/gatr2/SebastianVasquez_Designer.png", linkedin: "" },
  ],
  alumni: [
    { name: "Ailey Smith", role: "GATR1 lead", image: "/images/teams/alumni/AileySmith.png", linkedin: "https://www.linkedin.com/in/aileyksmith/" },
    { name: "Adam Ellenbogen", role: "GATR1", image: "/images/teams/alumni/AdamEllenbogen.png", linkedin: "https://www.linkedin.com/in/adam-ellenbogen-488478225/" },
    { name: "Cameron Soviero", role: "President", image: "/images/teams/alumni/CameronSoviero.png", linkedin: "https://www.linkedin.com/in/cameronsoviero/" },
    { name: "Carson Powers", role: "GATR1", image: "/images/teams/alumni/CarsonPowers.png", linkedin: "https://www.linkedin.com/in/carson-alan-powers/" },
    { name: "Christian Mosey", role: "GATR1", image: "/images/teams/alumni/ChristianMosey.png", linkedin: "https://www.linkedin.com/in/christianmosey/" },
    { name: "Eric Steyn", role: "President", image: "/images/teams/alumni/EricSteyn.png", linkedin: "https://www.linkedin.com/in/ericsteyn/" },
    { name: "Ivan Calderon", role: "GATR2", image: "/images/teams/alumni/IvanCalderon.png", linkedin: "https://www.linkedin.com/in/ivan-calex/" },
    { name: "Jack Sopotnick", role: "Captain", image: "/images/teams/alumni/JackSopotnick.png", linkedin: "https://www.linkedin.com/in/jack-sopotnick/" },
    { name: "Katelynn Shandik", role: "Captain", image: "/images/teams/alumni/KatelynnShandik.png", linkedin: "https://www.linkedin.com/in/katelynn-shandik-693998207/" },
    { name: "Madison Chubb", role: "GATR1", image: "/images/teams/alumni/MadisonChubb.png", linkedin: "https://www.linkedin.com/in/madison-chubb-0338b4264/" },
    { name: "Matthew Darrow", role: "GATR1", image: "/images/teams/alumni/MatthewDarrow.png", linkedin: "https://www.linkedin.com/in/matthew-c-darrow/" },
    { name: "Sean Moody", role: "Captain", image: "/images/teams/alumni/SeanMoody.png", linkedin: "https://www.linkedin.com/in/smdy-89106b27b/" },
    { name: "Thorsten Lannynd", role: "GATR1", image: "/images/teams/alumni/ThorstenLannynd.png", linkedin: "https://www.linkedin.com/in/thorstenlannynd/" },
    { name: "Zachary Soviero", role: "Captain", image: "/images/teams/alumni/ZacharySoviero.png", linkedin: "https://www.linkedin.com/in/zachsoviero/" },
  ],
};

const MemberCard = ({
  m,
}: {
  m: { name: string; role: string; degree?: string; image?: string; linkedin?: string };
}) => {
  const cardContent = (
    <div className="group cursor-pointer">
      <div className="mb-4 aspect-square overflow-hidden rounded-2xl border border-zinc-200">
        <img
          src={m.image || "/api/placeholder/300/300"}
          alt={m.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="font-bold text-zinc-900 text-sm group-hover:text-blue-700 transition-colors">{m.name}</div>
      <div className="text-zinc-500 text-xs">{m.role}</div>
      {m.degree ? (
        <div className="mt-1 font-mono text-[10px] text-zinc-400">{m.degree}</div>
      ) : null}
    </div>
  );

  return m.linkedin ? (
    <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="block">
      {cardContent}
    </a>
  ) : (
    cardContent
  );
};

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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="py-12">
        <div
          className={`group relative aspect-[21/9] w-full overflow-hidden rounded-[2rem] border border-zinc-200 outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
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
          <div className="pointer-events-none absolute inset-0 z-[1] bg-zinc-900/10 transition-colors group-hover:bg-transparent" />
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

      <section className="grid md:grid-cols-12 gap-16 py-12">
        <div className="md:col-span-8">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 mb-6">GATR VEX Robotics @ UF</h2>
          <p className="text-lg text-zinc-600 leading-relaxed font-light mb-8">
            GATR VEX is the premiere robotics competition organization at the University of Florida.
            We focus on the intersection of mechanical and software design to compete within the VEX U robotics competition.
            We&apos;re comprised of two teams—GATR1 and GATR2—that function as fully independent competition units. Each team conceptualizes, builds, and programs its own distinct robots, competing alongside one another throughout the season.
          </p>
          <a href="https://github.com/GATR-VEX" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-6 py-3 bg-zinc-950 text-white font-semibold rounded-full text-sm hover:bg-orange-600 transition-colors">
            <GithubIcon className="w-4 h-4 mr-2" /> GitHub Organization
          </a>
        </div>

        <div className="md:col-span-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6 border-b border-zinc-100 pb-2">Latest Updates</h3>
          <div className="space-y-6">
            {NEWS_UPDATES.map((item, i) => (
              <div key={i}>
                <div className="text-[10px] font-bold text-orange-600 mb-1">{item.date}</div>
                <div className="text-sm font-semibold text-zinc-900 leading-snug">
                  {item.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function PeopleView() {
  return (
    <div className="py-12 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-zinc-900 mb-12">Meet the Team</h2>

      <div className="mb-20">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-8 border-b border-zinc-100 pb-2">Executive Board</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {ORGANIZATION_ROSTER.eboard.map((m, i) => <MemberCard key={i} m={m} />)}
        </div>
      </div>

      <div className="mb-20">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-8 border-b border-zinc-100 pb-2">GATR 1 Roster</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {ORGANIZATION_ROSTER.gatr1.map((m, i) => <MemberCard key={i} m={m} />)}
        </div>
      </div>

      <div className="mb-20">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-8 border-b border-zinc-100 pb-2">GATR 2 Roster</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {ORGANIZATION_ROSTER.gatr2.map((m, i) => <MemberCard key={i} m={m} />)}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-8 border-b border-zinc-100 pb-2">Alumni</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {ORGANIZATION_ROSTER.alumni.map((m, i) => (
            <MemberCard key={`${m.name}-${i}`} m={m} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FeedView() {
  return (
    <div className="py-4 md:py-6">
      <LinkedInFeed />
    </div>
  );
}

function DiscordView() {
  return <DiscordSection />;
}

export default function LabWebsite() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-orange-100 selection:text-orange-900 w-full overflow-x-hidden">
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div
            onClick={() => setActiveTab("home")}
            className="text-xl font-bold tracking-tight text-zinc-950 cursor-pointer flex items-center gap-2"
          >
            GATR VEX<span className="text-zinc-400 font-light">Robotics</span>
          </div>

          <div className="flex space-x-8 text-[13px] font-semibold uppercase tracking-widest text-zinc-500">
            {["home", "people", "feed", "discord"].map((tab) => (
              <button
                key={tab}
                type="button"
                onMouseEnter={() => {
                  if (tab !== "feed") return;
                  if (typeof document === "undefined") return;
                  const id = "prefetch-sociablekit-widget-js";
                  if (document.getElementById(id)) return;
                  const link = document.createElement("link");
                  link.id = id;
                  link.rel = "prefetch";
                  link.href = SOCIABLEKIT_LINKEDIN_POSTS_SCRIPT;
                  link.as = "script";
                  document.head.appendChild(link);
                }}
                onClick={() => setActiveTab(tab)}
                className={`hover:text-blue-700 transition-colors ${activeTab === tab ? "text-blue-700" : ""}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-32 pb-12 min-h-[calc(100vh-100px)]">
        {activeTab === "home" && <HomeView />}
        {activeTab === "people" && <PeopleView />}
        {activeTab === "feed" && <FeedView />}
        {activeTab === "discord" && <DiscordView />}
      </main>
    </div>
  );
}

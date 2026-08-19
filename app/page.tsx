"use client";

import React, { useState } from 'react';
import { Code2, Mail } from 'lucide-react';

// ============================================================================
// ICONS & ASSETS
// ============================================================================

const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

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
    { name: "Alan Gage", role: "Internal Vice President", major: "ME", year: "'26", image: "/images/teams/AlanGage.webp", linkedin: "https://www.linkedin.com/in/alan-gage-929230292/" },
  ],
  gatr1: [
    { name: "Davis Lester", role: "GATR1 Captain", major: "EE", year: "'28", image: "/images/teams/DavisLester.jpg", linkedin: "https://www.linkedin.com/in/davis-lester/" },
    { name: "Logan Thomley", role: "Build Lead", major: "CS", year: "'28", image: "/images/teams/LoganThomley.webp", linkedin: "https://www.linkedin.com/in/loganthomley/" },
    { name: "Jason Iduyan", role: "Designer", major: "CPE", year: "'29", image: "/images/teams/JasonIduyan.png", linkedin: "https://www.linkedin.com/in/jasoniduyan/" },
    { name: "Lizzie Marchand", role: "Notebooker", major: "ARC", year: "'29", image: "/images/teams/LizzieMarchand.png", linkedin: "https://www.linkedin.com/in/elizabeth-marchand-ba8a9a2a5/" },
    { name: "Brian Lin", role: "Programmer", major: "ME", year: "'28", image: "/images/teams/BrianLin.png", linkedin: "https://www.linkedin.com/in/brian-linuf/" },
    { name: "Zander Dyal", role: "Build & Design", major: "ME", year: "'28", image: "/images/teams/ZanderDyal.jpg", linkedin: "https://www.linkedin.com/in/zander-dyal/" },
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
      <div className="aspect-square bg-zinc-100 rounded-2xl mb-4 overflow-hidden border border-zinc-200">
        <img 
          src={m.image || "/api/placeholder/300/300"} 
          alt={m.name} 
          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105" 
        />
      </div>
      <div className="font-bold text-zinc-900 text-sm group-hover:text-blue-700 transition-colors">{m.name}</div>
      <div className="text-zinc-500 text-xs">{m.role}</div>
      <div className="text-zinc-400 text-[10px] font-mono mt-1">{rosterDegreeLine(m)}</div>
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

export default function LabWebsite() {
  // State to track which page the user is currently viewing
  const [activeTab, setActiveTab] = useState('home');

  // --- VIEW: HOME PAGE ---
  const Home = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Main Banner */}
      <section className="py-12">
        <div className="w-full aspect-[21/9] bg-zinc-100 rounded-[2rem] overflow-hidden border border-zinc-200 relative group">
          <div className="absolute inset-0 bg-zinc-900/10 group-hover:bg-transparent transition-colors"></div>
          <img 
            src="/images/hero/GATRTeamPhoto.JPG" 
            alt="GATR Robotics Team" 
            className="w-full h-full object-cover" 
          />
        </div>
      </section>

      {/* About the Organization & Live News Feed */}
      <section className="grid md:grid-cols-12 gap-16 py-12">
        
        {/* Organization Bio */}
        <div className="md:col-span-8">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 mb-6">GATR VEX Robotics @ UF</h2>
          <p className="text-lg text-zinc-600 leading-relaxed font-light mb-8">
            GATR VEX is the premiere robotics competition organization at the University of Florida. 
            We focus on the intersection of mechanical and software design to compete within the VEX U robotics competition. 
            We're comprised of two teams—GATR1 and GATR2—that function as fully independent competition units. Each team conceptualizes, builds, and programs its own distinct robots, competing alongside one another throughout the season.
          </p>
          <a href="https://github.com/GATR-VEX" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-6 py-3 bg-zinc-950 text-white font-semibold rounded-full text-sm hover:bg-orange-600 transition-colors">
            <GithubIcon className="w-4 h-4 mr-2" /> GitHub Organization
          </a>
        </div>
        
        {/* Updates Sidebar */}
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

  // --- VIEW: PEOPLE / ROSTER PAGE ---
  const People = () => (
    <div className="py-12 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-zinc-900 mb-12">Meet the Team</h2>
      
      {/* Executive Board */}
      <div className="mb-20">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-8 border-b border-zinc-100 pb-2">Executive Board</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {ORGANIZATION_ROSTER.eboard.map((m, i) => <MemberCard key={i} m={m} />)}
        </div>
      </div>

      {/* GATR1 Roster */}
      <div className="mb-20">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-8 border-b border-zinc-100 pb-2">GATR 1 Roster</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {ORGANIZATION_ROSTER.gatr1.map((m, i) => <MemberCard key={i} m={m} />)}
        </div>
      </div>

      {/* GATR2 Roster */}
      <div className="mb-20">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-8 border-b border-zinc-100 pb-2">GATR 2 Roster</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {ORGANIZATION_ROSTER.gatr2.map((m, i) => <MemberCard key={i} m={m} />)}
        </div>
      </div>

      {/* Alumni */}
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

  // --- VIEW: JOIN / RECRUITMENT PAGE ---
  const Join = () => (
    <div className="py-24 text-center max-w-2xl mx-auto animate-in fade-in duration-500">
      <h2 className="text-3xl font-bold text-zinc-900 mb-6">Join GATR Robotics</h2>
      <p className="text-zinc-500 leading-relaxed mb-10 font-light">
        Interested in robotics? Want to get involved?  
        Join our discord server and see what we're up to. Open to all majors and no VEX experience required.
      </p>
      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <a href="https://discord.gg/SWP8mvuFSs" className="px-8 py-3 bg-zinc-950 text-white font-semibold rounded-full text-sm hover:bg-orange-600 transition-colors">
          Discord Server
        </a>
      </div>
    </div>
  );

return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-orange-100 selection:text-orange-900 w-full overflow-x-hidden">
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo / Title Area */}
          <div 
            onClick={() => setActiveTab('home')}
            className="text-xl font-bold tracking-tight text-zinc-950 cursor-pointer flex items-center gap-2"
          >
            GATR VEX<span className="text-zinc-400 font-light">Robotics</span>
          </div>
          
          {/* Page Links */}
          <div className="flex space-x-8 text-[13px] font-semibold uppercase tracking-widest text-zinc-500">
            {['home', 'people', 'join'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`hover:text-blue-700 transition-colors ${activeTab === tab ? 'text-blue-700' : ''}`}
              >
                {tab}
              </button>
            ))}
          </div>

        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-32 pb-12 min-h-[calc(100vh-100px)]">
        {activeTab === 'home' && <Home />}
        {activeTab === 'people' && <People />}
        {activeTab === 'join' && <Join />}
      </main>
      
    </div>
  );
}
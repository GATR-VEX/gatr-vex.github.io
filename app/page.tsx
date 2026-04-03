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
  { date: "MAR 2026", title: "GATR2 receives an invite to attend the World Championship in St. Louis, Missouri" },
  { date: "FEB 2026", title: "GATR1 ranks #1 in both overall and autonomous skills in Marietta, Georgia, while GATR2 takes home the Judges Award" },
  { date: "FEB 2026", title: "GATR1 wins the Excellence Award at the Bristol Signature Event to qualify for the World Championship" },
  { date: "JAN 2026", title: "GATR2 takes home the Innovate Award at Auburn University for their custom swerve drive" },
  { date: "DEC 2025", title: "GATR1 and GATR2 take home the Judges and Design Awards, respectively, in Apopka" },
];

const ORGANIZATION_ROSTER = {
  eboard: [
    { name: "Cannon Spencer", role: "President", degree: "CPE '26", image: "/images/teams/gatr1/CannonSpencer.png", linkedin: "https://linkedin.com/" },
    { name: "Sarah Kim", role: "External Vice President", degree: "ACT '27", image: "/images/teams/gatr2/SarahKim_Notebooker.png", linkedin: "https://linkedin.com/" },
    { name: "Alan Gage", role: "Internal Vice President", degree: "ME '25", image: "/images/teams/gatr1/AlanGage.png", linkedin: "https://linkedin.com/" },
  ],
  gatr1: [
    { name: "Davis Lester", role: "Team Captain", degree: "EE '28", image: "/images/teams/gatr1/DavisLester.jpg", linkedin: "https://linkedin.com/" },
    { name: "Logan Thomley", role: "Research Lead", degree: "CS '28", image: "/images/teams/gatr1/LoganThomley.png", linkedin: "https://github.com/LThmly" },
    { name: "Jason Iduyan", role: "Design Lead", degree: "CPE '29", image: "/images/teams/gatr1/JasonIduyan.png", linkedin: "https://linkedin.com/" },
    { name: "Lizzie Marchand", role: "Documentation Lead", degree: "ARC '29", image: "/images/teams/gatr1/LizzieMarchand.png", linkedin: "https://linkedin.com/" },
    { name: "Brian Lin", role: "Mechanical Engineer", degree: "ME '29", image: "/images/teams/gatr1/BrianLin.png", linkedin: "https://linkedin.com/" },
    { name: "Alec McEwen", role: "Software Engineer", degree: "CE '29", image: "/images/teams/gatr1/AlecMcewen.png", linkedin: "https://linkedin.com/" },
    { name: "Zander Dyal", role: "Mechanical Engineer", degree: "CE '29", image: "/images/teams/gatr1/ZanderDyal.jpg", linkedin: "https://linkedin.com/" },
    { name: "Corina Polanco", role: "Mechanical Engineer", degree: "CE '29", image: "/images/teams/gatr1/CorinaPolanco.png", linkedin: "https://linkedin.com/" },
    { name: "Sebastian Lopez", role: "Software Engineer", degree: "CE '29", image: "/images/teams/gatr1/SebastianLopez.png", linkedin: "https://linkedin.com/" },
  ],
  gatr2: [
    { name: "Lucas Salas", role: "Team Captain", degree: "ME '27", image: "/images/teams/gatr2/LucasSalas_Captain.png", linkedin: "" },
    { name: "Ryan Littler", role: "Design Lead", degree: "CE '28", image: "/images/teams/gatr2/RyanLittler_DesignLead.png", linkedin: "" },
    { name: "Will Schweisguth", role: "Designer", degree: "ME '28", image: "/images/teams/gatr2/WillSchweisguth_Designer.png", linkedin: "" },
    { name: "Anastacia Delany", role: "Build Lead", degree: "CS '29", image: "/images/teams/gatr2/AnastaciaDelany_BuildLead.png", linkedin: "" },
    { name: "David Arceo", role: "Strategy Lead", degree: "ME '29", image: "/images/teams/gatr2/DavidArceo_StrategyLead.png", linkedin: "" },
    { name: "Brady Warner", role: "Programming Lead", degree: "EE '29", image: "/images/teams/gatr2/BradyWarner_ProgrammingLead.png", linkedin: "" },
    { name: "Connor Martin", role: "Programmer", degree: "EE '29", image: "/images/teams/gatr2/ConnorMartin_Programmer.png", linkedin: "" },
    { name: "Emanuele Cavallaro", role: "Designer", degree: "EE '29", image: "/images/teams/gatr2/EmanueleCavallaro_Designer.png", linkedin: "" },
    { name: "Hector Nava", role: "Builder", degree: "EE '29", image: "/images/teams/gatr2/HectorNava_Builder.jpg", linkedin: "" },
    { name: "Joseph Cavnar", role: "Designer", degree: "EE '29", image: "/images/teams/gatr2/JosephCavnar_Designer.png", linkedin: "" },
    { name: "Kaitlyn Campo", role: "Designer", degree: "EE '29", image: "/images/teams/gatr2/KaitlynCampo_Designer.png", linkedin: "" },
    { name: "Khang Lam", role: "Builder", degree: "EE '29", image: "/images/teams/gatr2/KhangLam_Builder.png", linkedin: "" },
    { name: "Kyle Resetar", role: "Designer", degree: "EE '29", image: "/images/teams/gatr2/KyleResetar_Designer.png", linkedin: "" },
    { name: "Maxene Davis", role: "Builder", degree: "EE '29", image: "/images/teams/gatr2/MaxeneDavis_Builder.png", linkedin: "" },
    { name: "Nathan Hinkle", role: "Builder", degree: "EE '29", image: "/images/teams/gatr2/NathanHinkle_Builder.png", linkedin: "" },
    { name: "Nathaniel Levine", role: "Notebooker", degree: "EE '29", image: "/images/teams/gatr2/NathanielLevine_Notebooker.png", linkedin: "" },
    { name: "Safid Alam", role: "Builder", degree: "EE '29", image: "/images/teams/gatr2/SafidAlam_Builder.png", linkedin: "" },
    { name: "Seanpaul Areas", role: "Notebooker", degree: "EE '29", image: "/images/teams/gatr2/SeanpaulAreas_Notebooker.png", linkedin: "" },
    { name: "Sebastian Vasquez", role: "Designer", degree: "EE '29", image: "/images/teams/gatr2/SebastianVasquez_Designer.png", linkedin: "" },
    { name: "Vennela Sadineni", role: "Notebook Lead", degree: "EE '29", image: "/images/teams/gatr2/VennelaSadineni_NotebookLead.png", linkedin: "" },
  ],
  past: [
    { name: "Ailey Smith", role: "GATR 1", degree: "ME '28" },
    { name: "Eric Steyn", role: "GATR 1", degree: "ME '25" },
    { name: "Alumni Name", role: "Former President", degree: "EE '24" },
  ]
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
const MemberCard = ({ m }: { m: { name: string, role: string, degree: string, image?: string, linkedin?: string } }) => {
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
      <div className="text-zinc-400 text-[10px] font-mono mt-1">{m.degree}</div>
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
              <div key={i} className="group cursor-pointer">
                <div className="text-[10px] font-bold text-orange-600 mb-1">{item.date}</div>
                <div className="text-sm font-semibold text-zinc-900 group-hover:text-blue-700 transition-colors leading-snug">
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

      {/* Past Members / Alumni}
      {/* <div className="mb-20">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6 border-b border-zinc-100 pb-2">Past Members</h3>
        <p className="text-sm text-zinc-500 mb-8 font-light max-w-2xl">
          We extend our gratitude to our former members for their foundational contributions to GATR Robotics.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-4">
          {ORGANIZATION_ROSTER.past.map((m, i) => (
            <div key={i} className="flex justify-between items-center border-b border-zinc-50 pb-2">
              <div>
                <div className="text-sm font-semibold text-zinc-900">{m.name}</div>
                <div className="text-xs text-zinc-500">{m.role}</div>
              </div>
              <div className="text-[10px] font-mono text-zinc-400">{m.degree}</div>
            </div>
          ))}
        </div>
      </div> */}
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
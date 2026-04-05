import Image from "next/image";
import { BadgeCheck, ExternalLink, ShieldCheck, Users } from "lucide-react";
import { DISCORD_INVITE_URL } from "@/lib/site-constants";

const SERVER_NAME = "GATR VEX";

export function DiscordSection() {
  const displayHost = DISCORD_INVITE_URL.replace(/^https?:\/\//, "");

  return (
    <div className="animate-in fade-in duration-500 py-10 md:py-14">
      <div className="mx-auto max-w-lg">
        <a
          href={DISCORD_INVITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Join ${SERVER_NAME} on Discord`}
          className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-zinc-200/90 bg-gradient-to-br from-zinc-50 via-white to-zinc-100 p-8 shadow-sm transition-shadow duration-300 hover:border-zinc-300 hover:shadow-md"
        >
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-orange-200/30 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#5865F2]/15 blur-3xl"
            aria-hidden
          />

          <div className="relative text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Server invite</p>

            <div className="mx-auto mt-5 flex h-[88px] w-[88px] items-center justify-center">
              <div className="relative h-full w-full overflow-hidden rounded-full border border-zinc-200/90 bg-white shadow-sm ring-2 ring-white transition-transform duration-300 group-hover:scale-[1.03]">
                <Image
                  src="/images/logo/GatrVexLogo.png"
                  alt=""
                  width={176}
                  height={176}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
            </div>

            <h2 className="mt-6 text-xl font-semibold tracking-tight text-zinc-900">{SERVER_NAME}</h2>
            <p className="mt-1.5 text-sm text-zinc-600">University of Florida · VEX U Robotics</p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 shadow-sm">
                <Users className="h-3 w-3" aria-hidden />
                Community
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200/80 bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-700 shadow-sm">
                <ShieldCheck className="h-3 w-3" aria-hidden />
                Team server
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/80 bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-800 shadow-sm">
                <BadgeCheck className="h-3 w-3" aria-hidden />
                Official
              </span>
            </div>

            <h3 className="mt-8 text-lg font-semibold tracking-tight text-zinc-900">Tap to open Discord</h3>
            <p className="mt-2 text-sm text-zinc-600">Opens the invite in your browser or the Discord app.</p>
          </div>

          <div className="relative mt-8 flex items-center justify-between gap-4 rounded-2xl border border-zinc-200/80 bg-white/80 px-4 py-3.5 shadow-inner backdrop-blur-sm">
            <span className="truncate font-mono text-sm text-zinc-600">{displayHost}</span>
            <ExternalLink
              className="h-5 w-5 shrink-0 text-zinc-400 transition-colors group-hover:text-orange-600"
              aria-hidden
            />
          </div>
        </a>
      </div>
    </div>
  );
}

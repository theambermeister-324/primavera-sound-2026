import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-10 pt-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          🌸 Primavera Sound 2026
        </h1>
        <p className="text-white/60 text-lg">
          Barcelona · June 4–7, 2026
        </p>
      </div>

      <p className="text-white/80 leading-relaxed max-w-lg">
        Plan the festival with your crew. Pick the sets you want to see, find
        where your group overlaps, and push a curated calendar straight to Google.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card
          href="/join"
          emoji="👋"
          title="Join the group"
          description="Set up your profile and start picking sets"
        />
        <Card
          href="/picks"
          emoji="🎵"
          title="My picks"
          description="Browse the lineup and mark what you want to see"
        />
        <Card
          href="/group"
          emoji="👥"
          title="Group view"
          description="See what overlaps and who's going to each set"
        />
        <Card
          href="/export"
          emoji="📅"
          title="Export calendar"
          description="Push your group schedule to Google Calendar"
        />
      </div>
    </div>
  );
}

function Card({
  href,
  emoji,
  title,
  description,
}: {
  href: string;
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-2 p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
    >
      <span className="text-2xl">{emoji}</span>
      <span className="font-semibold">{title}</span>
      <span className="text-sm text-white/50">{description}</span>
    </Link>
  );
}

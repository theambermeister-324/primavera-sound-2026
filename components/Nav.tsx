"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/join", label: "Join" },
  { href: "/picks", label: "My Picks" },
  { href: "/group", label: "Group" },
  { href: "/export", label: "Export" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="border-b border-white/10 px-4 py-3 flex items-center gap-6">
      <span className="font-bold text-sm tracking-widest uppercase text-pink-400 mr-2">
        🌸 PS26
      </span>
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`text-sm transition-colors ${
            pathname === href ? "text-white font-semibold" : "text-white/50 hover:text-white"
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

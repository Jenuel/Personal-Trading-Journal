import Link from "next/link";

export default function Nav() {
  return (
    <nav className="flex items-center gap-6 px-8 py-4 border-b border-black/[.08] dark:border-white/[.08] bg-white dark:bg-black">
      <Link
        href="/"
        className="text-lg font-semibold tracking-tight text-black dark:text-white"
      >
        Trading Journal
      </Link>
      <div className="flex items-center gap-4 ml-auto text-sm font-medium text-zinc-600 dark:text-zinc-400">
        <Link href="/portfolios" className="hover:text-black dark:hover:text-white transition-colors">
          Portfolios
        </Link>
        <Link href="/trades" className="hover:text-black dark:hover:text-white transition-colors">
          Trades
        </Link>
      </div>
    </nav>
  );
}

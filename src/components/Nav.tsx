import Link from "next/link";

export function Nav() {
  return (
    <header className="topbar">
      <Link href="/" className="brand">
        <div className="brand-mark">अ</div>
        <div>
          <p className="brand-title serif">AntarRamayana</p>
          <p className="brand-subtitle">Text · lineage · interpretation · evidence</p>
        </div>
      </Link>
      <nav className="nav" aria-label="Main">
        <Link href="/ask">Ask</Link>
        <Link href="/graph">Graph</Link>
        <Link href="/sources">Sources</Link>
      </nav>
    </header>
  );
}

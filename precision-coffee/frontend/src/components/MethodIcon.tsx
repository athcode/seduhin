import type { Equipment } from "../types";

const ICON_PATHS: Record<Equipment, JSX.Element> = {
  /* ── V60: cone dripper + ridge + cup ── */
  V60: (
    <>
      <path d="M6 3.5h12l-4.5 9h-3z" />
      <path d="M9 5.4l2 7.1M12 5.4v7.1M15 5.4l-2 7.1" />
      <path d="M12 12.5v2" />
      <path d="M8 15h8v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z" />
      <path d="M16 15.6h1.6a1.6 1.6 0 0 1 0 3.2H16" />
    </>
  ),
  /* ── Aeropress: chamber + plunger ── */
  Aeropress: (
    <>
      <path d="M7.5 8h9v8.5a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2z" />
      <path d="M9.5 11h5M9.5 13.5h5" />
      <path d="M12 3v5" />
      <path d="M9.6 3h4.8" />
    </>
  ),
  /* ── Chemex: flask + wooden collar ── */
  Chemex: (
    <>
      <path d="M8 3h8l-2.1 7.5h-3.8z" />
      <path d="M9.3 8h5.4" />
      <ellipse cx="12" cy="15.5" rx="5.2" ry="5" />
    </>
  ),
  /* ── French Press: beaker + handle + plunger ── */
  "French Press": (
    <>
      <path d="M7.5 7.5h9v9.5a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2z" />
      <path d="M7 7.5h10" />
      <path d="M12 4v3.5" />
      <path d="M9.8 4h4.4" />
      <path d="M9.8 12.5h4.4" />
      <path d="M16.5 9.5H18a2.4 2.4 0 0 1 0 4.8h-1.5" />
      <path d="M7.5 8.5L6 7" />
    </>
  ),
  /* ── Espresso: machine + portafilter + cup ── */
  Espresso: (
    <>
      <path d="M4.5 3.5h15v6h-15z" />
      <path d="M4.5 6.5h15" />
      <path d="M12 9.5v2.5" />
      <path d="M9.5 12h5v1.6h-5z" />
      <path d="M14.5 12.8H18" />
      <path d="M12 14.4v1" />
      <path d="M8.6 15.5h6.8v1.5a1.5 1.5 0 0 1-1.5 1.5h-3.8a1.5 1.5 0 0 1-1.5-1.5z" />
    </>
  ),
  /* ── Moka Pot: dua chamber octagonal + spout + handle ── */
  "Moka Pot": (
    <>
      <path d="M8 8h8l.9 3.2H7.1z" />
      <path d="M7.5 12.5h9l1.6 4.4a1.2 1.2 0 0 1-1.1 1.6H7a1.2 1.2 0 0 1-1.1-1.6z" />
      <path d="M8.4 16.2h7.2" />
      <path d="M16.9 9.4h2.2v1.1h-2.2" />
      <path d="M8 6.6H5.6v3.4H8" />
    </>
  ),
  /* ── Tubruk: gelas + endapan + uap ── */
  Tubruk: (
    <>
      <path d="M8.5 6h7l-1.2 11.2h-4.6z" />
      <path d="M9.3 11h5.4" />
      <path d="M10.2 15.6h1.3M13 15.9h1.2" />
      <path d="M10 4.2c.5-1 1.3-1 .8-2.2M13 4.2c.5-1 1.3-1 .8-2.2" />
    </>
  ),
  /* ── Cold Brew: gelas + es batu + sedotan ── */
  "Cold Brew": (
    <>
      <path d="M8 7h8l-1.2 11.4H9.2z" />
      <path d="M13.6 3v4" />
      <path d="M10.4 10.5l1.8-1.3 1.3 1.8-1.8 1.3z" />
      <path d="M9.6 14.2l1.2-.9.9 1.2-1.2.9z" />
    </>
  ),
  /* ── Kalita Wave: flat-bottom + wavy edge ── */
  "Kalita Wave": (
    <>
      <path d="M6.5 4h11l-1.6 7.4h-7.8z" />
      <path d="M8.9 11.4q1.55 1.5 3.1 0t3.1 0" />
      <path d="M9.6 5.6l1 5.6M12 5.6v5.6M14.4 5.6l-1 5.6" />
      <path d="M12 12.4v2.4" />
      <path d="M8.6 15h6.8v1.5a1.5 1.5 0 0 1-1.5 1.5h-3.8a1.5 1.5 0 0 1-1.5-1.5z" />
    </>
  ),
  /* ── Turkish: cezve + spout + handle panjang ── */
  Turkish: (
    <>
      <path d="M7.6 8h8.8v5.4a3.6 3.6 0 0 1-3.6 3.6h-1.6a3.6 3.6 0 0 1-3.6-3.6z" />
      <path d="M16.4 8l2.4-1.6" />
      <path d="M7.6 9.6C5 9.6 4.4 11.2 4.4 12.8c0 1.6.9 2.4 3.2 2.4" />
    </>
  ),
  /* ── Clever Dripper: cone + flat base + valve ── */
  "Clever Dripper": (
    <>
      <path d="M6.5 4h11l-1.9 6.2h-7.2z" />
      <path d="M8.4 10.2h7.2v1.5h-7.2z" />
      <path d="M12 11.7v1.6" />
      <path d="M10.4 13.3h3.2" />
      <path d="M8.6 15.4h6.8v1.5a1.5 1.5 0 0 1-1.5 1.5h-3.8a1.5 1.5 0 0 1-1.5-1.5z" />
    </>
  ),
  /* ── Siphon: dua globe vakum ── */
  Siphon: (
    <>
      <ellipse cx="12" cy="6.6" rx="3.4" ry="3.1" />
      <path d="M10.8 9.6v2.6M13.2 9.6v2.6" />
      <path d="M8 13.2h8l.9 4.6a4.2 4.2 0 0 1-8.2 0z" />
      <path d="M8.2 21.6h7.6" />
    </>
  ),
};

export function MethodIcon({
  equipment,
  className = "w-8 h-8",
}: {
  equipment: Equipment;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON_PATHS[equipment]}
    </svg>
  );
}

/* ikon cangkir untuk brand (header / hero) */
export function BrandIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 8h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
      <path d="M16 9.2h2.2a2.4 2.4 0 0 1 0 4.8H16" />
      <path d="M8 4.6c.6-1 1.4-1 .8-2.2M11.4 4.6c.6-1 1.4-1 .8-2.2" />
    </svg>
  );
}

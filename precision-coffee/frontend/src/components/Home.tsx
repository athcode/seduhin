import { useApp } from "../context/AppContext";
import { BrandIcon } from "./MethodIcon";

const STEPS = [
  {
    n: 1,
    title: "Pilih Metode",
    desc: "Ada 12 alat, dari V60 sampe Tubruk. Bingung? Ketik rasa yang kamu mau, resep baristanya yang muncul.",
  },
  {
    n: 2,
    title: "Isi Bean & Grinder",
    desc: "Asal kopi, proses, roast, grinder yang kamu punya. Semua ngaruh ke hitungan.",
  },
  {
    n: 3,
    title: "Seduh + Timer",
    desc: "Timer kasih tau kapan tuang air. Abis itu bilang asam atau pahit, resepnya kita benerin.",
  },
];

export function Home() {
  const { dispatch } = useApp();

  const mulai = () => dispatch({ type: "SET_PHASE", phase: "method" });

  return (
    <div className="w-full max-w-2xl mx-auto animate-slide-in">
      {/* ── hero ── */}
      <div className="text-center pt-6 pb-10">
        <BrandIcon className="w-16 h-16 mx-auto mb-4 text-deep-brown" />
        <h1 className="text-4xl sm:text-5xl font-extrabold text-deep-brown tracking-tight">
          Seduhin
        </h1>
        <p className="mt-4 text-xl sm:text-2xl font-bold text-deep-brown text-balance">
          Biji bagus, sayang ditebak.
          <br />
          <span className="text-soft-yellow bg-deep-brown px-3 py-0.5 rounded-lg inline-block mt-2">
            Seduhin aja.
          </span>
        </p>
        <p className="mt-5 text-muted font-medium text-sm sm:text-base text-balance">
          Sebut biji sama grinder kamu. Dapat resepnya: gram kopi, suhu air, kapan tuang.
        </p>

        <div className="mt-7 flex flex-col items-center gap-3">
          <button onClick={mulai} className="btn-primary text-lg px-10 animate-pop">
            Mulai Seduh ☕
          </button>
          <p className="text-xs text-muted">Gratis · tanpa login · tanpa download</p>
        </div>

        <div className="mt-7 flex flex-wrap justify-center gap-2">
          {["12 metode", "17 grinder", "18 preset barista", "brew timer"].map((s) => (
            <span key={s} className="chip bg-cream-2 text-muted border border-light-brown/40">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* ── cara pakai ── */}
      <div className="card p-6 sm:p-8">
        <h2 className="text-lg font-extrabold text-deep-brown mb-1">Cara Pakai</h2>
        <p className="text-sm text-muted mb-5">Tiga langkah, beres. Nggak perlu kursus barista.</p>
        <div className="space-y-4">
          {STEPS.map((s) => (
            <div key={s.n} className="flex items-start gap-4">
              <div className="phase-dot active shrink-0">{s.n}</div>
              <div>
                <div className="font-bold text-deep-brown">{s.title}</div>
                <p className="text-sm text-muted font-medium leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <button onClick={mulai} className="btn-secondary w-full mt-6">
          Pilih Metode Seduh →
        </button>
      </div>
    </div>
  );
}

import { COPY, OFFER } from "../config/offer";

export default function Hero({ scrollToUpload }) {
  return (
    <header className="text-center mb-16 mt-10">
      <h1 className="text-5xl md:text-6xl font-black text-white leading-tight">
        {COPY.heroTitleMain}
        <span className="text-emerald-400 block mt-2">
          {COPY.heroTitlePain}
        </span>
      </h1>

      <p className="text-slate-400 mt-6 text-lg max-w-2xl mx-auto leading-relaxed">
        {COPY.heroSubtitle}
      </p>

      <button
        onClick={scrollToUpload}
        className="mt-8 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-lg px-8 py-4 rounded-xl transition"
      >
        {OFFER.ctaHero}
      </button>
      <p className="text-emerald-300 mt-3 text-sm font-semibold">
        {COPY.heroOfferLine}
      </p>
    </header>
  );
}

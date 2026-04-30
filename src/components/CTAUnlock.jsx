export default function CTAUnlock({ onUnlock }) {
  return (
    <div className="text-center mt-10">
      <button
        onClick={onUnlock}
        className="bg-emerald-500 text-black px-8 py-4 rounded-xl font-bold"
      >
        Desbloquear análise completa
      </button>
    </div>
  );
}
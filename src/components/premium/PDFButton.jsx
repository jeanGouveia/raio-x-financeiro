import { Download, Loader2 } from "lucide-react";

export default function PDFButton({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full bg-white text-black py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-slate-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <Loader2 size={22} className="animate-spin" />
          Gerando PDF...
        </>
      ) : (
        <>
          <Download size={22} /> Baixar PDF Completo
        </>
      )}
    </button>
  );
}

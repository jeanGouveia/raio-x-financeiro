import UploadBox from "./UploadBox";
import { Download } from "lucide-react";

export default function UploadSection({ uploadRef, onFile }) {
  return (
    <>
      <h2 className="text-2xl font-bold text-white text-center mb-6">
        Envie sua planilha e descubra seu score financeiro
      </h2>

      <div
        ref={uploadRef}
        className="bg-slate-900/70 border border-slate-700 p-10 rounded-3xl"
      >
        <UploadBox onFile={onFile} />

        <div className="mt-8 text-center">
          <a
            href="/Planilha-modelo.xlsx"
            download
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm font-medium"
          >
            <Download size={18} />
            Baixar planilha modelo gratuita
          </a>
        </div>
      </div>
    </>
  );
}
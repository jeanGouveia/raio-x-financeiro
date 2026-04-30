import { forwardRef } from "react";
import UploadBox from "./UploadBox";

const UploadSection = forwardRef(({ onFile }, ref) => {
  return (
    <section ref={ref} className="mt-10">
      <div className="bg-slate-900 p-8 rounded-2xl">
        <UploadBox onFile={onFile} />

        <a
          href="/Planilha-modelo.xlsx"
          download
          className="block text-center mt-4 text-emerald-400"
        >
          Baixar planilha modelo
        </a>
      </div>
    </section>
  );
});

export default UploadSection;
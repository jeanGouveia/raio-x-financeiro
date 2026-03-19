import { useDropzone } from "react-dropzone";

export default function UploadBox({ onFile }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => {
      if (files && files[0]) onFile(files[0]);
    },
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/csv": [".csv"],
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-2xl p-10 text-center transition cursor-pointer
        ${isDragActive 
          ? "border-blue-500 bg-blue-50" 
          : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"}`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className="text-blue-600 font-medium">Solte a planilha aqui...</p>
      ) : (
        <>
          <p className="text-slate-600 font-medium mb-2">
            Arraste sua planilha (.xlsx ou .csv) ou clique aqui
          </p>
          <p className="text-sm text-slate-400">
            Colunas esperadas: valor, tipo (receita/despesa), categoria
          </p>
        </>
      )}
    </div>
  );
}
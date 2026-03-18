import { useDropzone } from "react-dropzone";

export default function UploadBox({ onFile }) {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (files) => onFile(files[0]),
  });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed p-10 text-center rounded-xl cursor-pointer"
    >
      <input {...getInputProps()} />
      <p>Arraste sua planilha ou clique para enviar</p>
    </div>
  );
}

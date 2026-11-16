import { useRef, useState } from "react";

const QualificationCertificateForm = ({ qualification, disabled, onUpload, onRemove }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const fileInput = useRef(null);

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0] ?? null;
    setError("");
    setFile(null);
    if (selected && (!["image/jpeg", "image/png"].includes(selected.type) || selected.size > 10 * 1024 * 1024)) {
      setError("Wybierz zdjęcie JPG lub PNG o rozmiarze do 10 MB.");
      event.target.value = "";
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (disabled || !file) return;
    if (await onUpload(qualification.id, file)) {
      setFile(null);
      fileInput.current.value = "";
    }
  };

  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <p className="text-xs font-semibold text-white/60">Zdjęcie certyfikatu (opcjonalne)</p>
      {qualification.certificateUrl && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <a href={qualification.certificateUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-xs text-[var(--gold)] underline underline-offset-4">
            <img src={qualification.certificateUrl} alt={`Certyfikat: ${qualification.title}`} className="h-16 w-20 rounded-lg bg-white object-contain" />
            Otwórz certyfikat (nowa karta)
          </a>
          <button type="button" disabled={disabled} onClick={() => onRemove(qualification)} className="cursor-pointer rounded-full border border-red-300/25 px-3 py-2 text-xs text-red-200 disabled:opacity-40">
            Usuń zdjęcie
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="mt-3 space-y-3">
        <label className="block text-xs text-white/45">
          {qualification.certificateUrl ? "Wybierz nowe zdjęcie certyfikatu" : "Wybierz zdjęcie certyfikatu"}
          <input ref={fileInput} type="file" accept="image/jpeg,image/png" disabled={disabled} onChange={handleFileChange} className="mt-2 block w-full min-w-0 text-xs text-white/60 file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-white/80 disabled:opacity-40" />
        </label>
        <p className="text-xs text-white/35">JPG lub PNG, maksymalnie 10 MB. Przesyłaj wyłącznie dokumenty przeznaczone do publicznego wyświetlania.</p>
        {error && <p role="alert" className="text-xs text-red-200">{error}</p>}
        {file && (
          <button type="submit" disabled={disabled} className="cursor-pointer rounded-full border border-[var(--gold)]/50 px-4 py-2 text-xs font-semibold text-[var(--gold)] disabled:opacity-40">
            {disabled ? "Zapisywanie…" : qualification.certificateUrl ? "Podmień certyfikat" : "Dodaj certyfikat"}
          </button>
        )}
      </form>
    </div>
  );
};

export default QualificationCertificateForm;

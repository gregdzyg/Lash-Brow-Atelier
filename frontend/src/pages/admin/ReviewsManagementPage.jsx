import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Eye,
  EyeOff,
  ImagePlus,
  LoaderCircle,
  Pencil,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  deleteReviewImage,
  getAdminReviewImages,
  moveReviewImage,
  setReviewImageVisibility,
  updateReviewImageDetails,
  uploadReviewImage,
} from "../../api/apiReviews";

const ReviewsManagementPage = () => {
  const [reviewImages, setReviewImages] = useState([]);
  const [file, setFile] = useState(null);
  const [altText, setAltText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editAltText, setEditAltText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : ""),
    [file],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    let isMounted = true;

    const fetchReviewImages = async () => {
      try {
        const response = await getAdminReviewImages();

        if (isMounted) {
          setReviewImages(Array.isArray(response) ? response : []);
        }
      } catch {
        if (isMounted) {
          setError("Nie udało się pobrać screenów opinii.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchReviewImages();

    return () => {
      isMounted = false;
    };
  }, []);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!file || busyAction) {
      return;
    }

    setBusyAction("upload");
    clearMessages();

    try {
      const created = await uploadReviewImage({ file, altText });
      setReviewImages((current) => [created, ...current]);
      setFile(null);
      setAltText("");
      setSuccess("Screen opinii został dodany na początku listy.");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch {
      setError("Nie udało się dodać screena. Sprawdź plik i spróbuj ponownie.");
    } finally {
      setBusyAction("");
    }
  };

  const handleVisibility = async (image) => {
    setBusyAction(`visibility-${image.id}`);
    clearMessages();

    try {
      const updated = await setReviewImageVisibility(image.id, !image.active);
      setReviewImages((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setSuccess(updated.active ? "Opinia jest widoczna." : "Opinia została ukryta.");
    } catch {
      setError("Nie udało się zmienić widoczności opinii.");
    } finally {
      setBusyAction("");
    }
  };

  const handleMove = async (imageId, direction) => {
    setBusyAction(`move-${imageId}`);
    clearMessages();

    try {
      const response = await moveReviewImage(imageId, direction);
      setReviewImages(Array.isArray(response) ? response : []);
    } catch {
      setError("Nie udało się zmienić kolejności opinii.");
    } finally {
      setBusyAction("");
    }
  };

  const startEditing = (image) => {
    setEditingId(image.id);
    setEditAltText(image.altText ?? "");
    clearMessages();
  };

  const handleEdit = async (event, imageId) => {
    event.preventDefault();
    setBusyAction(`edit-${imageId}`);
    clearMessages();

    try {
      const updated = await updateReviewImageDetails(imageId, editAltText);
      setReviewImages((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setEditingId(null);
      setSuccess("Opis alternatywny został zapisany.");
    } catch {
      setError("Nie udało się zapisać opisu alternatywnego.");
    } finally {
      setBusyAction("");
    }
  };

  const handleDelete = async (image) => {
    if (image.active) {
      setError("Przed trwałym usunięciem ukryj opinię.");
      return;
    }

    if (!window.confirm("Czy trwale usunąć ten screen z R2?")) {
      return;
    }

    setBusyAction(`delete-${image.id}`);
    clearMessages();

    try {
      await deleteReviewImage(image.id);
      setReviewImages((current) =>
        current.filter((item) => item.id !== image.id),
      );
      setSuccess("Screen został trwale usunięty z R2.");
    } catch {
      setError("Nie udało się trwale usunąć screena.");
    } finally {
      setBusyAction("");
    }
  };

  const isBusy = Boolean(busyAction);

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
      <div className="mb-10 max-w-2xl sm:mb-12">
        <p className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--gold)]">
          <span className="h-px w-8 bg-[var(--gold)]/70" />
          Panel administracyjny
        </p>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Opinie</h1>
        <p className="mt-3 text-sm leading-6 text-white/60 sm:text-base">
          Dodawaj i porządkuj screeny opinii wyświetlane na stronie głównej.
        </p>
      </div>

      <form
        onSubmit={handleUpload}
        className="overflow-hidden rounded-4xl border border-[var(--gold)]/30 bg-gradient-to-br from-white/[0.08] to-white/[0.025] backdrop-blur-xl"
      >
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-2 lg:p-10">
          <div>
            <h2 className="text-lg font-semibold text-white">Nowy screen opinii</h2>
            <p className="mt-1 text-sm text-white/45">JPG, JPEG lub PNG · maks. 10 MB</p>
            <label
              htmlFor="review-image-file"
              className="mt-6 flex min-h-72 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-[var(--gold)]/45 bg-black/15 text-center transition hover:border-[var(--gold)] hover:bg-[var(--gold)]/[0.06]"
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Podgląd screena opinii" className="max-h-96 w-full object-contain" />
              ) : (
                <div className="px-6 py-12">
                  <ImagePlus className="mx-auto text-[var(--gold)]" size={38} />
                  <span className="mt-4 block text-sm font-semibold text-white">Wybierz screen z komputera</span>
                  <span className="mt-2 block text-xs text-white/40">Kliknij, aby otworzyć wybór pliku</span>
                </div>
              )}
            </label>
            <input
              ref={fileInputRef}
              id="review-image-file"
              type="file"
              accept="image/jpeg,image/png"
              required
              disabled={isBusy}
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                clearMessages();
              }}
              className="sr-only"
            />
            {file && <p className="mt-3 truncate text-xs text-white/50">{file.name}</p>}
          </div>

          <div>
            <label htmlFor="review-alt-text" className="text-sm font-semibold text-white/80">
              Opis alternatywny
            </label>
            <textarea
              id="review-alt-text"
              value={altText}
              maxLength={500}
              rows={7}
              disabled={isBusy}
              onChange={(event) => setAltText(event.target.value)}
              placeholder="Opcjonalnie opisz opinię dla osób korzystających z czytników ekranu"
              className="mt-3 w-full resize-y rounded-3xl border border-white/15 bg-black/20 px-5 py-4 text-sm leading-7 text-white outline-none placeholder:text-white/25 focus:border-[var(--gold)]/70 focus:ring-2 focus:ring-[var(--gold)]/15 disabled:opacity-50"
            />
            <p className="mt-2 text-right text-xs text-white/35">{altText.length} / 500</p>
            <p className="mt-6 text-sm leading-6 text-white/45">
              Nowy screen pojawi się na początku listy i od razu będzie widoczny publicznie.
            </p>
          </div>
        </div>
        <div className="flex justify-end border-t border-[var(--gold)]/20 bg-black/10 px-6 py-5 sm:px-8 lg:px-10">
          <button
            type="submit"
            disabled={isBusy || !file}
            className="flex cursor-pointer items-center gap-2 rounded-full border-2 border-[var(--gold)] bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-black transition hover:bg-transparent hover:text-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busyAction === "upload" ? <LoaderCircle className="animate-spin" size={17} /> : <Upload size={17} />}
            {busyAction === "upload" ? "Dodawanie…" : "Dodaj opinię"}
          </button>
        </div>
      </form>

      {(error || success) && (
        <div
          role={error ? "alert" : "status"}
          className={`mt-6 flex items-center gap-3 rounded-2xl border px-5 py-4 text-sm ${error ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"}`}
        >
          {error ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          {error || success}
        </div>
      )}

      <div className="mt-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">Zapisane opinie</h2>
            <p className="mt-2 text-sm text-white/45">Przesuwaj, ukrywaj i usuwaj screeny zapisane w R2.</p>
          </div>
          {!isLoading && <span className="text-sm text-white/40">{reviewImages.length}</span>}
        </div>

        {isLoading ? (
          <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-white/45">
            <LoaderCircle className="animate-spin text-[var(--gold)]" size={20} />
            Pobieranie opinii…
          </div>
        ) : reviewImages.length === 0 ? (
          <div className="rounded-4xl border border-dashed border-white/15 px-6 py-16 text-center text-sm text-white/40">
            Nie przesłano jeszcze żadnych opinii do R2. Strona publiczna nadal pokazuje lokalne screeny.
          </div>
        ) : (
          <ol className="grid max-h-[64rem] gap-5 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
            {reviewImages.map((image, index) => (
              <li
                key={image.id}
                className={`overflow-hidden rounded-3xl border bg-white/[0.035] ${image.active ? "border-[var(--gold)]/25" : "border-white/10 opacity-60"}`}
              >
                <div className="relative flex min-h-60 items-center justify-center bg-white p-3">
                  <img
                    src={image.imageUrl}
                    alt={image.altText || `Opinia klientki ${index + 1}`}
                    className="max-h-96 w-full rounded-2xl object-contain"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-black/75 px-3 py-1 text-xs font-semibold text-white">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${image.active ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-200" : "border-white/15 text-white/40"}`}>
                      {image.active ? "Widoczna" : "Ukryta"}
                    </span>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => handleMove(image.id, "UP")} disabled={isBusy || index === 0} aria-label="Przesuń opinię w górę" className="cursor-pointer rounded-full p-2 text-white/45 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-20"><ArrowUp size={17} /></button>
                      <button type="button" onClick={() => handleMove(image.id, "DOWN")} disabled={isBusy || index === reviewImages.length - 1} aria-label="Przesuń opinię w dół" className="cursor-pointer rounded-full p-2 text-white/45 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-20"><ArrowDown size={17} /></button>
                      <button type="button" onClick={() => startEditing(image)} disabled={isBusy} aria-label="Edytuj opis opinii" className="cursor-pointer rounded-full p-2 text-white/45 hover:bg-white/10 hover:text-white disabled:opacity-20"><Pencil size={17} /></button>
                      <button type="button" onClick={() => handleVisibility(image)} disabled={isBusy} aria-label={image.active ? "Ukryj opinię" : "Pokaż opinię"} className="cursor-pointer rounded-full p-2 text-white/45 hover:bg-white/10 hover:text-white disabled:opacity-20">{image.active ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                      <button type="button" onClick={() => handleDelete(image)} disabled={isBusy || image.active} aria-label="Usuń opinię" className="cursor-pointer rounded-full p-2 text-red-300/60 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-20"><Trash2 size={17} /></button>
                    </div>
                  </div>

                  {editingId === image.id ? (
                    <form onSubmit={(event) => handleEdit(event, image.id)} className="mt-4">
                      <textarea
                        value={editAltText}
                        maxLength={500}
                        rows={4}
                        disabled={isBusy}
                        onChange={(event) => setEditAltText(event.target.value)}
                        className="w-full resize-y rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-[var(--gold)]/70"
                      />
                      <div className="mt-3 flex justify-end gap-2">
                        <button type="button" onClick={() => setEditingId(null)} disabled={isBusy} className="flex cursor-pointer items-center gap-1 rounded-full px-3 py-2 text-xs text-white/50 hover:bg-white/10 hover:text-white"><X size={14} /> Anuluj</button>
                        <button type="submit" disabled={isBusy} className="flex cursor-pointer items-center gap-1 rounded-full bg-[var(--gold)] px-3 py-2 text-xs font-semibold text-black disabled:opacity-50"><Save size={14} /> Zapisz</button>
                      </div>
                    </form>
                  ) : (
                    <p className="mt-4 min-h-12 text-sm leading-6 text-white/45">
                      {image.altText || "Brak opisu alternatywnego"}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
};

export default ReviewsManagementPage;

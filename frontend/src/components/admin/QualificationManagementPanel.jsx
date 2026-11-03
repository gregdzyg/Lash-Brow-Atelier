import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Award,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  createQualification,
  deleteQualification,
  getAdminQualifications,
  moveQualification,
  setQualificationVisibility,
  updateQualification,
  updateQualificationSection,
} from "../../api/apiAbout";

const emptyQualification = {
  title: "",
  description: "",
};

const QualificationManagementPanel = () => {
  const [section, setSection] = useState({
    eyebrow: "",
    title: "",
    description: "",
    qualifications: [],
  });
  const [qualificationForm, setQualificationForm] = useState(
    emptyQualification,
  );
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadQualifications = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setIsLoading(true);
    }

    try {
      const response = await getAdminQualifications();
      setSection(response);
      setError("");
    } catch {
      setError(
        "Nie udało się pobrać kwalifikacji. Odśwież stronę i spróbuj ponownie.",
      );
    } finally {
      if (showLoader) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadQualifications();
  }, [loadQualifications]);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleSectionSubmit = async (event) => {
    event.preventDefault();
    setBusyAction("section");
    clearMessages();

    try {
      const response = await updateQualificationSection({
        eyebrow: section.eyebrow,
        title: section.title,
        description: section.description,
      });
      setSection(response);
      setSuccess("Opis sekcji kwalifikacji został zapisany.");
    } catch {
      setError("Nie udało się zapisać opisu sekcji kwalifikacji.");
    } finally {
      setBusyAction("");
    }
  };

  const resetQualificationForm = () => {
    setEditingId(null);
    setQualificationForm(emptyQualification);
  };

  const handleQualificationSubmit = async (event) => {
    event.preventDefault();
    setBusyAction("qualification-form");
    clearMessages();

    try {
      if (editingId) {
        await updateQualification(editingId, qualificationForm);
        setSuccess("Kwalifikacja została zaktualizowana.");
      } else {
        await createQualification(qualificationForm);
        setSuccess("Nowa kwalifikacja została dodana.");
      }

      resetQualificationForm();
      await loadQualifications(false);
    } catch {
      setError(
        editingId
          ? "Nie udało się zaktualizować kwalifikacji."
          : "Nie udało się dodać kwalifikacji.",
      );
    } finally {
      setBusyAction("");
    }
  };

  const startEditing = (qualification) => {
    setEditingId(qualification.id);
    setQualificationForm({
      title: qualification.title,
      description: qualification.description,
    });
    clearMessages();
  };

  const handleVisibility = async (qualification) => {
    setBusyAction(`visibility-${qualification.id}`);
    clearMessages();

    try {
      const updated = await setQualificationVisibility(
        qualification.id,
        !qualification.active,
      );
      setSection((current) => ({
        ...current,
        qualifications: current.qualifications.map((item) =>
          item.id === updated.id ? updated : item,
        ),
      }));
      setSuccess(
        updated.active
          ? "Kwalifikacja jest ponownie widoczna."
          : "Kwalifikacja została ukryta.",
      );
    } catch {
      setError("Nie udało się zmienić widoczności kwalifikacji.");
    } finally {
      setBusyAction("");
    }
  };

  const handleMove = async (qualificationId, direction) => {
    setBusyAction(`move-${qualificationId}`);
    clearMessages();

    try {
      await moveQualification(qualificationId, direction);
      await loadQualifications(false);
    } catch {
      setError("Nie udało się zmienić kolejności kwalifikacji.");
    } finally {
      setBusyAction("");
    }
  };

  const handleDelete = async (qualification) => {
    const confirmed = window.confirm(
      `Czy na pewno usunąć kwalifikację „${qualification.title}”?`,
    );

    if (!confirmed) {
      return;
    }

    setBusyAction(`delete-${qualification.id}`);
    clearMessages();

    try {
      await deleteQualification(qualification.id);

      if (editingId === qualification.id) {
        resetQualificationForm();
      }

      await loadQualifications(false);
      setSuccess("Kwalifikacja została usunięta.");
    } catch {
      setError("Nie udało się usunąć kwalifikacji.");
    } finally {
      setBusyAction("");
    }
  };

  const isBusy = Boolean(busyAction);

  return (
    <div className="mt-8 overflow-hidden rounded-4xl border border-[var(--gold)]/30 bg-gradient-to-br from-white/[0.08] to-white/[0.025] backdrop-blur-xl">
      <div className="border-b border-[var(--gold)]/20 px-6 py-6 sm:px-8 lg:px-10">
        <div className="flex items-start gap-4">
          <span className="rounded-2xl bg-[var(--gold)]/10 p-3 text-[var(--gold)]">
            <Award aria-hidden="true" size={22} />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Sekcja kwalifikacji
            </h2>
            <p className="mt-1 text-sm leading-6 text-white/45">
              Edytuj opis sekcji oraz zarządzaj szkoleniami i certyfikatami.
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-72 items-center justify-center gap-3 text-sm text-white/45">
          <LoaderCircle
            aria-hidden="true"
            size={20}
            className="animate-spin text-[var(--gold)]"
          />
          Pobieranie kwalifikacji…
        </div>
      ) : (
        <>
          <form
            onSubmit={handleSectionSubmit}
            className="border-b border-[var(--gold)]/20 p-6 sm:p-8 lg:p-10"
          >
            <h3 className="text-base font-semibold text-white">
              Opis po lewej stronie
            </h3>
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                  Mały nagłówek
                </span>
                <input
                  value={section.eyebrow}
                  maxLength={100}
                  required
                  disabled={isBusy}
                  onChange={(event) =>
                    setSection((current) => ({
                      ...current,
                      eyebrow: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[var(--gold)]/70 focus:ring-2 focus:ring-[var(--gold)]/15 disabled:opacity-50"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                  Tytuł
                </span>
                <input
                  value={section.title}
                  maxLength={255}
                  required
                  disabled={isBusy}
                  onChange={(event) =>
                    setSection((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[var(--gold)]/70 focus:ring-2 focus:ring-[var(--gold)]/15 disabled:opacity-50"
                />
              </label>
              <label className="block lg:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                  Opis
                </span>
                <textarea
                  value={section.description}
                  maxLength={1000}
                  required
                  rows={4}
                  disabled={isBusy}
                  onChange={(event) =>
                    setSection((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className="mt-2 w-full resize-y rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-sm leading-7 text-white outline-none focus:border-[var(--gold)]/70 focus:ring-2 focus:ring-[var(--gold)]/15 disabled:opacity-50"
                />
                <span className="mt-2 block text-right text-xs text-white/35">
                  {section.description.length} / 1000
                </span>
              </label>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                disabled={isBusy}
                className="flex cursor-pointer items-center gap-2 rounded-full border border-[var(--gold)] bg-[var(--gold)] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-transparent hover:text-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busyAction === "section" ? (
                  <LoaderCircle className="animate-spin" size={16} />
                ) : (
                  <Save size={16} />
                )}
                Zapisz opis sekcji
              </button>
            </div>
          </form>

          <div className="grid gap-8 p-6 sm:p-8 xl:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.2fr)] lg:p-10">
            <form
              onSubmit={handleQualificationSubmit}
              className="h-fit rounded-3xl border border-white/10 bg-black/15 p-5 sm:p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-base font-semibold text-white">
                  {editingId ? "Edytuj kwalifikację" : "Dodaj kwalifikację"}
                </h3>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetQualificationForm}
                    disabled={isBusy}
                    className="cursor-pointer rounded-full p-2 text-white/45 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                    aria-label="Anuluj edycję"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              <label className="mt-5 block">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                  Nazwa
                </span>
                <input
                  value={qualificationForm.title}
                  maxLength={255}
                  required
                  disabled={isBusy}
                  onChange={(event) =>
                    setQualificationForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[var(--gold)]/70 focus:ring-2 focus:ring-[var(--gold)]/15 disabled:opacity-50"
                />
              </label>
              <label className="mt-5 block">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                  Opis
                </span>
                <textarea
                  value={qualificationForm.description}
                  maxLength={1000}
                  required
                  rows={6}
                  disabled={isBusy}
                  onChange={(event) =>
                    setQualificationForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className="mt-2 w-full resize-y rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-sm leading-7 text-white outline-none focus:border-[var(--gold)]/70 focus:ring-2 focus:ring-[var(--gold)]/15 disabled:opacity-50"
                />
                <span className="mt-2 block text-right text-xs text-white/35">
                  {qualificationForm.description.length} / 1000
                </span>
              </label>
              <button
                type="submit"
                disabled={
                  isBusy ||
                  !qualificationForm.title.trim() ||
                  !qualificationForm.description.trim()
                }
                className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--gold)] bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-black transition hover:bg-transparent hover:text-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busyAction === "qualification-form" ? (
                  <LoaderCircle className="animate-spin" size={16} />
                ) : editingId ? (
                  <Save size={16} />
                ) : (
                  <Plus size={16} />
                )}
                {editingId ? "Zapisz zmiany" : "Dodaj kwalifikację"}
              </button>
            </form>

            <div>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Lista kwalifikacji
                  </h3>
                  <p className="mt-1 text-xs text-white/35">
                    Łącznie: {section.qualifications.length}
                  </p>
                </div>
                <p className="text-xs text-white/35">
                  Widoczne: {section.qualifications.filter((item) => item.active).length}
                </p>
              </div>

              <ol className="max-h-[42rem] space-y-3 overflow-y-auto pr-1">
                {section.qualifications.map((qualification, index) => (
                  <li
                    key={qualification.id}
                    className={`rounded-3xl border p-4 transition sm:p-5 ${qualification.active ? "border-white/10 bg-white/[0.035]" : "border-white/[0.06] bg-black/15 opacity-60"}`}
                  >
                    <div className="flex gap-4">
                      <span className="mt-0.5 text-sm font-semibold tracking-[0.14em] text-[var(--gold)]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h4 className="font-semibold leading-6 text-white">
                              {qualification.title}
                            </h4>
                            <span className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold ${qualification.active ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-200" : "border-white/15 bg-white/[0.04] text-white/45"}`}>
                              {qualification.active ? "Widoczna" : "Ukryta"}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            <button
                              type="button"
                              onClick={() => handleMove(qualification.id, "UP")}
                              disabled={isBusy || index === 0}
                              className="cursor-pointer rounded-full p-2 text-white/45 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                              aria-label={`Przesuń w górę: ${qualification.title}`}
                            >
                              <ArrowUp size={17} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMove(qualification.id, "DOWN")}
                              disabled={
                                isBusy ||
                                index === section.qualifications.length - 1
                              }
                              className="cursor-pointer rounded-full p-2 text-white/45 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                              aria-label={`Przesuń w dół: ${qualification.title}`}
                            >
                              <ArrowDown size={17} />
                            </button>
                            <button
                              type="button"
                              onClick={() => startEditing(qualification)}
                              disabled={isBusy}
                              className="cursor-pointer rounded-full p-2 text-white/45 transition hover:bg-white/10 hover:text-white disabled:opacity-25"
                              aria-label={`Edytuj: ${qualification.title}`}
                            >
                              <Pencil size={17} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleVisibility(qualification)}
                              disabled={isBusy}
                              className="cursor-pointer rounded-full p-2 text-white/45 transition hover:bg-white/10 hover:text-white disabled:opacity-25"
                              aria-label={`${qualification.active ? "Ukryj" : "Pokaż"}: ${qualification.title}`}
                            >
                              {qualification.active ? (
                                <EyeOff size={17} />
                              ) : (
                                <Eye size={17} />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(qualification)}
                              disabled={isBusy}
                              className="cursor-pointer rounded-full p-2 text-red-300/55 transition hover:bg-red-500/10 hover:text-red-300 disabled:opacity-25"
                              aria-label={`Usuń: ${qualification.title}`}
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-white/45">
                          {qualification.description}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>

              {section.qualifications.length === 0 && (
                <div className="rounded-3xl border border-dashed border-white/15 px-6 py-12 text-center text-sm text-white/40">
                  Nie dodano jeszcze żadnych kwalifikacji.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {(error || success) && (
        <div className="border-t border-[var(--gold)]/20 px-6 py-5 sm:px-8 lg:px-10">
          <div
            role={error ? "alert" : "status"}
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${error ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"}`}
          >
            {error ? (
              <AlertCircle aria-hidden="true" size={18} />
            ) : (
              <CheckCircle2 aria-hidden="true" size={18} />
            )}
            {error || success}
          </div>
        </div>
      )}
    </div>
  );
};

export default QualificationManagementPanel;

import { AlertCircle, LoaderCircle, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    getAppointment,
    updateAppointment,
} from "../../api/apiAppointments";
import AppointmentForm from "../../components/admin/appointments/AppointmentForm";
import { formatLocalTime } from "../../utils/dateTime";

const EditAppointmentPage = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let isMounted = true;

        const fetchAppointment = async () => {
            setIsLoading(true);
            setError("");

            try {
                const response = await getAppointment(appointmentId);
                if (isMounted) {
                    setAppointment(response);
                }
            } catch {
                if (isMounted) {
                    setError("Nie udało się pobrać danych wizyty.");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchAppointment();

        return () => {
            isMounted = false;
        };
    }, [appointmentId, reloadKey]);

    const handleSubmit = async (request) => {
        await updateAppointment(appointmentId, request);
        navigate(`/admin/appointments/${appointmentId}`, {
            replace: true,
            state: {
                successMessage: "Dane wizyty zostały zaktualizowane.",
            },
        });
    };

    const initialValues = appointment
        ? {
            clientId: String(appointment.clientId),
            offerItemId: String(appointment.offerItemId),
            appointmentDate: appointment.appointmentDate,
            startTime: formatLocalTime(appointment.startTime),
            durationMinutes: String(appointment.durationMinutes),
            price: String(appointment.price),
            note: appointment.note || "",
        }
        : null;

    return (
        <section className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
            <div className="mb-10 max-w-2xl">
                <p className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--gold)]">
                    <span className="h-px w-8 bg-[var(--gold)]/70" />
                    Kalendarz wizyt
                </p>
                <h1 className="text-3xl font-bold text-white sm:text-4xl">Edytuj wizytę</h1>
                <p className="mt-3 text-sm leading-6 text-white/60 sm:text-base">
                    Zmień dane wizyty i zapisz aktualizację.
                </p>
            </div>

            {isLoading && (
                <div role="status" className="flex min-h-64 max-w-4xl flex-col items-center justify-center rounded-4xl border border-[var(--gold)]/25 bg-white/[0.025]">
                    <LoaderCircle aria-hidden="true" size={32} className="animate-spin text-[var(--gold)]" />
                    <p className="mt-4 text-sm text-white/60">Pobieranie danych wizyty…</p>
                </div>
            )}

            {!isLoading && error && (
                <div role="alert" className="flex min-h-64 max-w-4xl flex-col items-center justify-center rounded-4xl border border-red-500/30 bg-red-500/[0.08] px-6 text-center">
                    <AlertCircle aria-hidden="true" size={32} className="text-red-300" />
                    <p className="mt-4 text-sm text-red-200/80">{error}</p>
                    <button
                        type="button"
                        onClick={() => setReloadKey((current) => current + 1)}
                        className="mt-5 flex cursor-pointer items-center gap-2 rounded-full border border-red-300/40 px-4 py-2 text-sm font-semibold text-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                    >
                        <RotateCcw aria-hidden="true" size={16} />
                        Spróbuj ponownie
                    </button>
                </div>
            )}

            {!isLoading && !error && initialValues && (
                <AppointmentForm
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate(`/admin/appointments/${appointmentId}`)}
                    submitLabel="Zapisz zmiany"
                />
            )}
        </section>
    );
};

export default EditAppointmentPage;

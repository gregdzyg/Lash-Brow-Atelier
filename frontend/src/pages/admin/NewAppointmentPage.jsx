import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createAppointment } from "../../api/apiAppointments";
import AppointmentForm from "../../components/admin/appointments/AppointmentForm";

const isValidDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || "");
const isValidTime = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value || "");
const isValidId = (value) => /^\d+$/.test(value || "") && Number(value) > 0;

const NewAppointmentPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialValues = useMemo(() => {
        const clientId = searchParams.get("clientId");
        const offerItemId = searchParams.get("offerItemId");
        const appointmentDate = searchParams.get("date");
        const startTime = searchParams.get("startTime");

        return {
            clientId: isValidId(clientId) ? clientId : "",
            offerItemId: isValidId(offerItemId) ? offerItemId : "",
            appointmentDate: isValidDate(appointmentDate) ? appointmentDate : "",
            startTime: isValidTime(startTime) ? startTime : "",
        };
    }, [searchParams]);

    const handleSubmit = async (request) => {
        const appointment = await createAppointment(request);
        const destination = appointment?.id
            ? `/admin/appointments/${appointment.id}`
            : "/admin/appointments";

        navigate(destination, {
            replace: true,
            state: {
                successMessage: "Wizyta została dodana.",
            },
        });
    };

    return (
        <section className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
            <div className="mb-10 max-w-2xl">
                <p className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--gold)]">
                    <span className="h-px w-8 bg-[var(--gold)]/70" />
                    Kalendarz wizyt
                </p>
                <h1 className="text-3xl font-bold text-white sm:text-4xl">Nowa wizyta</h1>
                <p className="mt-3 text-sm leading-6 text-white/60 sm:text-base">
                    Wybierz klientkę, usługę i termin spotkania.
                </p>
            </div>

            <AppointmentForm
                initialValues={initialValues}
                onSubmit={handleSubmit}
                onCancel={() => navigate("/admin/appointments")}
                submitLabel="Dodaj wizytę"
            />
        </section>
    );
};

export default NewAppointmentPage;

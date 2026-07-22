export const getAppointmentDisplayStatus = (appointment) => (
    appointment.status === "SCHEDULED" && appointment.hasEnded
        ? "ENDED"
        : appointment.status
);

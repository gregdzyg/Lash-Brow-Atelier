import { Clock3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAppointmentDisplayStatus } from "../../../utils/appointmentStatus";
import { addMinutesToTime, formatLocalTime } from "../../../utils/dateTime";

const appointmentStatusLabels = {
    SCHEDULED: "Zaplanowana",
    ENDED: "Odbyta",
    CANCELLED: "Anulowana",
    NO_SHOW: "Nieobecność",
};

const statusClassNames = {
    SCHEDULED: "border-[var(--gold)]/70 bg-[#75662f] text-white shadow-lg shadow-black/20",
    ENDED: "border-white/15 bg-[#3b3933]/95 text-white/65",
    CANCELLED: "border-white/20 bg-[#353535]/95 text-white/60",
    NO_SHOW: "border-orange-300/25 bg-[#49382f]/95 text-orange-100/65",
};

const AppointmentCard = ({ appointment, style, compact = false }) => {
    const navigate = useNavigate();
    const clientName = [appointment.clientFirstName, appointment.clientLastName]
        .filter(Boolean)
        .join(" ");
    const displayStatus = getAppointmentDisplayStatus(appointment);
    const statusLabel = appointmentStatusLabels[displayStatus] || displayStatus;
    const isMuted = displayStatus !== "SCHEDULED";

    return (
        <button
            type="button"
            style={style}
            onClick={(event) => {
                event.stopPropagation();
                navigate(`/admin/appointments/${appointment.id}`);
            }}
            aria-label={`${formatLocalTime(appointment.startTime)}, ${clientName}, ${appointment.offerItemName}, ${statusLabel}`}
            className={`
                z-20 overflow-hidden rounded-lg border p-2 text-left transition
                hover:z-30 hover:brightness-110 focus-visible:z-30 focus-visible:outline-none
                focus-visible:ring-2 focus-visible:ring-white
                ${style ? "absolute inset-x-1" : "relative w-full"}
                ${compact ? "p-1.5" : "p-2.5"}
                ${statusClassNames[displayStatus] || statusClassNames.SCHEDULED}
                ${isMuted ? "opacity-75" : ""}
            `}
        >
            <span className="flex items-center gap-1 text-[11px] font-semibold leading-none">
                <Clock3 aria-hidden="true" size={11} />
                {formatLocalTime(appointment.startTime)}–{addMinutesToTime(
                    appointment.startTime,
                    appointment.durationMinutes,
                )}
            </span>
            <span className="mt-1 block truncate text-xs font-bold leading-tight">
                {clientName || "Klientka"}
            </span>
            {!compact && (
                <span className="mt-0.5 block truncate text-[11px] leading-tight opacity-80">
                    {appointment.offerItemName}
                </span>
            )}
            <span className="mt-1 block truncate text-[9px] font-semibold uppercase tracking-wide opacity-75">
                {statusLabel}
            </span>
        </button>
    );
};

export default AppointmentCard;

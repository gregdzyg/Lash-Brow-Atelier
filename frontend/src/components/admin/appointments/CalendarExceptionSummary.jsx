import { CircleAlert, Sparkles } from "lucide-react";
import { formatLocalTime } from "../../../utils/dateTime";

const CalendarExceptionSummary = ({ exception }) => {
    const isExtraOpen = exception.type === "EXTRA_OPEN";
    const label = exception.type === "CLOSED_DAY"
        ? "Dzień zamknięty"
        : `${isExtraOpen ? "Dodatkowo otwarte" : "Blokada"} ${formatLocalTime(exception.startTime)}–${formatLocalTime(exception.endTime)}`;

    return (
        <div className={`min-w-0 rounded-xl border px-3 py-2 text-left text-[11px] ${
            isExtraOpen
                ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-100"
                : "border-red-300/25 bg-red-500/10 text-red-100/80"
        }`}>
            <p className="flex items-start gap-1.5 font-medium">
                {isExtraOpen ? (
                    <Sparkles aria-hidden="true" size={12} className="mt-0.5 shrink-0" />
                ) : (
                    <CircleAlert aria-hidden="true" size={12} className="mt-0.5 shrink-0" />
                )}
                <span>{label}</span>
            </p>
            {exception.note?.trim() && (
                <p className="mt-1.5 whitespace-pre-wrap break-words leading-5 [overflow-wrap:anywhere]">
                    {exception.note}
                </p>
            )}
        </div>
    );
};

export default CalendarExceptionSummary;

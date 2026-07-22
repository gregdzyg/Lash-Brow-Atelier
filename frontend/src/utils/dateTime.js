const polishDateFormatter = new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Warsaw",
});

const polishShortDateFormatter = new Intl.DateTimeFormat("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Warsaw",
});

export const formatDateForApi = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

export const parseLocalDate = (value) => {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
};

export const formatLocalDate = (value, short = false) => {
    if (!value) {
        return "—";
    }

    const date = typeof value === "string" ? parseLocalDate(value) : value;
    return short ? polishShortDateFormatter.format(date) : polishDateFormatter.format(date);
};

export const formatLocalTime = (value) => value?.slice(0, 5) || "—";

export const addDays = (date, amount) => {
    const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    result.setDate(result.getDate() + amount);
    return result;
};

export const getWeekRange = (date) => {
    const day = date.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const start = addDays(date, mondayOffset);

    return {
        start,
        end: addDays(start, 6),
    };
};

export const getWeekDays = (weekStart) => Array.from(
    { length: 7 },
    (_, index) => addDays(weekStart, index),
);

export const getMonthName = (date) => new Intl.DateTimeFormat("pl-PL", {
    month: "long",
    timeZone: "Europe/Warsaw",
}).format(date);

export const timeToMinutes = (value) => {
    if (!value) {
        return 0;
    }

    const [hours, minutes] = value.slice(0, 5).split(":").map(Number);
    return (hours * 60) + minutes;
};

export const minutesToTime = (minutes) => {
    const normalized = Math.max(0, Math.min(minutes, (24 * 60) - 1));
    const hours = String(Math.floor(normalized / 60)).padStart(2, "0");
    const remainingMinutes = String(normalized % 60).padStart(2, "0");
    return `${hours}:${remainingMinutes}`;
};

export const addMinutesToTime = (value, amount) => minutesToTime(
    timeToMinutes(value) + Number(amount || 0),
);

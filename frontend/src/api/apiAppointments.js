import apiClient from "./apiClient";

export const getAppointments = async (start, end) => {
    const response = await apiClient.get("/api/admin/appointments", {
        params: {
            start,
            end,
        },
    });

    return response.data;
};

export const getAppointment = async (appointmentId) => {
    const response = await apiClient.get(`/api/admin/appointments/${appointmentId}`);
    return response.data;
};

export const createAppointment = async (appointmentRequest) => {
    const response = await apiClient.post(
        "/api/admin/appointments",
        appointmentRequest,
    );
    return response.data;
};

export const updateAppointment = async (appointmentId, appointmentRequest) => {
    const response = await apiClient.put(
        `/api/admin/appointments/${appointmentId}`,
        appointmentRequest,
    );
    return response.data;
};

export const updateAppointmentStatus = async (appointmentId, appointmentStatus) => {
    const response = await apiClient.patch(
        `/api/admin/appointments/${appointmentId}`,
        {
            appointmentStatus,
        },
    );
    return response.data;
};

export const archiveAppointment = async (appointmentId) => {
    await apiClient.delete(`/api/admin/appointments/${appointmentId}`);
};

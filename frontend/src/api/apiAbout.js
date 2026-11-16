import apiClient from "./apiClient";

export const getAboutPortrait = async () => {
    const response = await apiClient.get("/api/public/about-portrait");
    return response.data;
};

export const replaceAboutPortrait = async (image) => {
    const formData = new FormData();
    formData.append("image", image);
    const response = await apiClient.put(
        "/api/admin/about-portrait",
        formData,
    );
    return response.data;
};

export const getAboutContent = async () => {
    const response = await apiClient.get("/api/admin/about-content");
    return response.data;
};

export const updateAboutContent = async (aboutContent) => {
    const response = await apiClient.put(
        "/api/admin/about-content",
        aboutContent,
    );
    return response.data;
};

export const getAdminQualifications = async () => {
    const response = await apiClient.get("/api/admin/qualifications");
    return response.data;
};

export const updateQualificationSection = async (section) => {
    const response = await apiClient.put(
        "/api/admin/qualifications/section",
        section,
    );
    return response.data;
};

export const createQualification = async (qualification) => {
    const response = await apiClient.post(
        "/api/admin/qualifications",
        qualification,
    );
    return response.data;
};

export const updateQualification = async (qualificationId, qualification) => {
    const response = await apiClient.put(
        `/api/admin/qualifications/${qualificationId}`,
        qualification,
    );
    return response.data;
};

export const setQualificationVisibility = async (
    qualificationId,
    active,
) => {
    const response = await apiClient.patch(
        `/api/admin/qualifications/${qualificationId}/visibility`,
        { active },
    );
    return response.data;
};

export const moveQualification = async (qualificationId, direction) => {
    await apiClient.patch(
        `/api/admin/qualifications/${qualificationId}/position`,
        { direction },
    );
};

export const deleteQualification = async (qualificationId) => {
    await apiClient.delete(`/api/admin/qualifications/${qualificationId}`);
};

export const replaceQualificationCertificate = async (qualificationId, image) => {
    const formData = new FormData();
    formData.append("image", image);
    const response = await apiClient.put(
        `/api/admin/qualifications/${qualificationId}/certificate`,
        formData,
    );
    return response.data;
};

export const removeQualificationCertificate = async (qualificationId) => {
    const response = await apiClient.delete(
        `/api/admin/qualifications/${qualificationId}/certificate`,
    );
    return response.data;
};

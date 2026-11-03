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

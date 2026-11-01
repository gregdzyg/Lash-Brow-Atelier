import apiClient from "./apiClient";

export const getAdminGalleryImages = async () => {
    const response = await apiClient.get("/api/admin/gallery-images");
    return response.data;
};

export const setGalleryImageVisibility = async (imageId, active) => {
    const response = await apiClient.patch(
        `/api/admin/gallery-images/${imageId}/visibility`,
        { active },
    );
    return response.data;
};

export const updateGalleryImageDetails = async (imageId, details) => {
    const response = await apiClient.patch(
        `/api/admin/gallery-images/${imageId}`,
        details,
    );
    return response.data;
};

export const moveGalleryImage = async (imageId, direction) => {
    const response = await apiClient.patch(
        `/api/admin/gallery-images/${imageId}/position`,
        { direction },
    );
    return response.data;
};

export const uploadGalleryImage = async ({ file, title, altText }) => {
    const formData = new FormData();
    formData.append("file", file);

    if (title.trim()) {
        formData.append("title", title.trim());
    }

    if (altText.trim()) {
        formData.append("altText", altText.trim());
    }

    const response = await apiClient.post(
        "/api/admin/gallery-images",
        formData,
    );
    return response.data;
};

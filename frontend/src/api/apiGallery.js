import apiClient from "./apiClient";

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

import apiClient from "./apiClient";

export const getAdminNewsPosts = async () => {
    const response = await apiClient.get("/api/admin/news-posts");
    return response.data;
};

export const createNewsPost = async ({
    title,
    content,
    category,
    image,
    imageAltText,
}) => {
    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("content", content.trim());
    formData.append("category", category);

    if (image) {
        formData.append("image", image);

        if (imageAltText.trim()) {
            formData.append("imageAltText", imageAltText.trim());
        }
    }

    const response = await apiClient.post("/api/admin/news-posts", formData);
    return response.data;
};

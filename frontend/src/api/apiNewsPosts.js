import apiClient from "./apiClient";

export const getAdminNewsPosts = async () => {
    const response = await apiClient.get("/api/admin/news-posts");
    return response.data;
};

export const setNewsPostVisibility = async (newsPostId, active) => {
    const response = await apiClient.patch(
        `/api/admin/news-posts/${newsPostId}/visibility`,
        { active },
    );
    return response.data;
};

export const updateNewsPostDetails = async (newsPostId, details) => {
    const response = await apiClient.patch(
        `/api/admin/news-posts/${newsPostId}`,
        details,
    );
    return response.data;
};

export const createNewsPost = async ({
    title,
    content,
    category,
    image,
}) => {
    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("content", content.trim());
    formData.append("category", category);

    if (image) {
        formData.append("image", image);
    }

    const response = await apiClient.post("/api/admin/news-posts", formData);
    return response.data;
};

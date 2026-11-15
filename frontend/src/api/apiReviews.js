import apiClient from "./apiClient";

export const getAdminReviewImages = async () => {
  const response = await apiClient.get("/api/admin/review-images");
  return response.data;
};

export const uploadReviewImage = async ({ file, altText }) => {
  const formData = new FormData();
  formData.append("file", file);

  if (altText.trim()) {
    formData.append("altText", altText.trim());
  }

  const response = await apiClient.post(
    "/api/admin/review-images",
    formData,
  );
  return response.data;
};

export const updateReviewImageDetails = async (imageId, altText) => {
  const response = await apiClient.patch(
    `/api/admin/review-images/${imageId}`,
    { altText: altText.trim() || null },
  );
  return response.data;
};

export const setReviewImageVisibility = async (imageId, active) => {
  const response = await apiClient.patch(
    `/api/admin/review-images/${imageId}/visibility`,
    { active },
  );
  return response.data;
};

export const moveReviewImage = async (imageId, direction) => {
  const response = await apiClient.patch(
    `/api/admin/review-images/${imageId}/position`,
    { direction },
  );
  return response.data;
};

export const deleteReviewImage = async (imageId) => {
  await apiClient.delete(`/api/admin/review-images/${imageId}`);
};

import apiClient from "./apiClient";

export const getPublicOfferItems = async () => {
  const response = await apiClient.get("/api/public/offer-items");
  return response.data;
};

export const getPublicWorkingHours = async () => {
  const response = await apiClient.get("/api/public/working-hours");
  return response.data;
};

export const getPublicGalleryImages = async () => {
  const response = await apiClient.get("/api/public/gallery-images");
  return response.data;
};

export const getPublicNewsPosts = async () => {
  const response = await apiClient.get("/api/public/news-posts");
  return response.data;
};

export const getPublicAboutPortrait = async () => {
  const response = await apiClient.get("/api/public/about-portrait");
  return response.data;
};

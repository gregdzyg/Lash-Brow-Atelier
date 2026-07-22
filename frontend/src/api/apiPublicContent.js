import apiClient from "./apiClient";

export const getPublicOfferItems = async () => {
  const response = await apiClient.get("/api/public/offer-items");
  return response.data;
};

export const getPublicWorkingHours = async () => {
  const response = await apiClient.get("/api/public/working-hours");
  return response.data;
};

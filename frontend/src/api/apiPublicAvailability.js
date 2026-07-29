import apiClient from "./apiClient";

export const getPublicAvailability = async (start, end, offerItemId) => {
  const response = await apiClient.get("/api/public/availability", {
    params: {
      start,
      end,
      offerItemId,
    },
  });

  return response.data;
};

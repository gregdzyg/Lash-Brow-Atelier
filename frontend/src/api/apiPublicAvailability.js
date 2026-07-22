import apiClient from "./apiClient";

export const getPublicAvailability = async (start, end) => {
  const response = await apiClient.get("/api/public/availability", {
    params: {
      start,
      end,
    },
  });

  return response.data;
};

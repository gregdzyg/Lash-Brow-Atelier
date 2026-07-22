import apiClient from "./apiClient";

export const getOfferItems = async (category) => {
    const response = await apiClient.get("/api/admin/offer-items", {
        params: category
            ? {
                category,
            }
            : undefined,
    });
    return response.data;
};

export const getOfferItem = async (offerItemId) => {
    const response = await apiClient.get(`/api/admin/offer-items/${offerItemId}`);
    return response.data;
};

export const createOfferItem = async (offerItemRequest) => {
    const response = await apiClient.post(
        "/api/admin/offer-items",
        offerItemRequest
    );
    return response.data;
};

export const updateOfferItem = async (offerItemId, offerItemRequest) => {
    const response = await apiClient.put(
        `/api/admin/offer-items/${offerItemId}`,
        offerItemRequest
    );
    return response.data;
};

export const archiveOfferItem = async (offerItemId) => {
    await apiClient.delete(`/api/admin/offer-items/${offerItemId}`);
};

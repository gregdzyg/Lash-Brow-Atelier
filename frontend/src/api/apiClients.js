import apiClient from "./apiClient"


export const getClients = async () => {
    const respone = await apiClient.get("/api/admin/clients");
    return respone.data;
};

export const createClient = async (clientRequest) => {
    const response = await apiClient.post("/api/admin/clients", clientRequest);
    return response.data;
};

export const getClient = async (clientId) => {
    const response = await apiClient.get(`/api/admin/clients/${clientId}`);
    return response.data;
};

export const updateClient = async (clientId, clientRequest) => {
    const response = await apiClient.put(`/api/admin/clients/${clientId}`, clientRequest);
    return response.data;
};

export const deleteClient = async (clientId) => {
  await apiClient.delete(`/api/admin/clients/${clientId}`);
};
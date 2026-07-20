import apiClient from "./apiClient";

export const login = async (username, password) => {
    const response = await apiClient.post("/api/auth/login", {
        username, password
    });

    return response.data;
}

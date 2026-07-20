import { useEffect, useState } from "react"
import { AuthContext } from "./AuthContext";
import { login as loginRequest } from "../api/apiAuth";
import { getToken, removeToken, saveToken } from "./tokenStorage";
import { jwtDecode } from "jwt-decode";

const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        const token = getToken();

        if(!token) {
            setIsInitializing(false);
            return;
        }

        try {
            const decodedToken = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            if(decodedToken.exp <= currentTime) {
                removeToken();
                setIsInitializing(false);
                return;
            }

            setUser({
                username: decodedToken.sub,
                role: decodedToken.role.replace("ROLE_", "")
            });
        } catch {
            removeToken();
        } finally {
            setIsInitializing(false);
        }
    }, []);

    const login = async (username, password) => {
        const response = await loginRequest(username, password);
        saveToken(response.token);

        setUser({
            username: response.username,
            role: response.role
        });
        
        return response;
    }

    const logout = () => {
        removeToken();
        setUser(null);
    }
    
    return (
        <AuthContext.Provider
            value={{
                user,
                isInitializing,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;
import { createContext, useState } from "react";
import api from "../lib/axios";

export const AuthContext = createContext();

function AuthProvider({ children }) {

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");

        return savedUser ? JSON.parse(savedUser) : null;
    });

    async function login(email, password) {

        const response = await api.post("/auth/login", {
            email,
            password
        });

        const { user, token } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        setUser(user);
    }

    async function register(name, email, password) {

        const response = await api.post("/auth/register", {
            name,
            email,
            password
        });

        return response.data;
    }

    function logout() {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                register,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;
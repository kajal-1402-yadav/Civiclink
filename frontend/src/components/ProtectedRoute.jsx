import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react";

function ProtectedRoute({ children, adminOnly = false }) {
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        auth().catch(() => setIsAuthorized(false));
    }, []);

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        try {
            const res = await api.post("/api/token/refresh/", { refresh: refreshToken });
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                return true;
            }
        } catch {
            return false;
        }
    };

    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) return setIsAuthorized(false);

        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;

        if (decoded.exp < now) {
            const refreshed = await refreshToken();
            if (!refreshed) return setIsAuthorized(false);
        }

        if (adminOnly) {
            try {
                const userRes = await api.get("/api/user/info/");
                if (userRes.data.role !== "admin") {
                    return setIsAuthorized(false);
                }
            } catch {
                return setIsAuthorized(false);
            }
        }

        setIsAuthorized(true);
    };

    if (isAuthorized === null) return <div>Loading...</div>;

    return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;

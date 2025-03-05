import { jwtDecode } from "jwt-decode"; // Use jwt-decode instead of jsonwebtoken

export async function getUserRole() {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/get-token`, {
            method: "GET",
            credentials: "include" // Ensures cookies are sent
        });

        const data = await response.json();

        if (data && data.accessToken) {
            const decoded = jwtDecode(data.accessToken); // Use jwt-decode
            return decoded?.role || null;
        }

        return null;
    } catch (error) {
        console.error("Error fetching user role:", error);
        return null;
    }
}

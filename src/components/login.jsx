import { FaGoogle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import React, { useEffect } from "react";
import { message } from "antd";

const Login = () => {
    const navigate = useNavigate();
    const startAuthFlow = async () => {
        // Adjust the URL as needed (e.g., your backend endpoint)
        const popupUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
        // Set the popup dimensions and position as desired
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.innerWidth - width) / 2;
        const top = window.screenY + (window.innerHeight - height) / 2;
        window.open(
            popupUrl,
            'GoogleAuthPopup',
            `width=${width},height=${height},left=${left},top=${top}`
        );
    }

    // Listen for messages from the popup window
    useEffect(() => {
        const handleMessage = async (event) => {
            if (event.data && event.data.tokenData == "success") {
                message.success("Login Successfully!");
                navigate("/dashboard");
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    return (
        <div className="login-google">
            <h2>Login with Google</h2>

            <button onClick={startAuthFlow}  style={{ cursor: "pointer" }}>
                <FaGoogle style={{ marginLeft: "10px", textAlign: "center" }} />
                <span style={{ marginLeft: "10px", textAlign: "center" }}>Sign in with Google</span>
            </button>

        </div>
    );
};

export default Login;

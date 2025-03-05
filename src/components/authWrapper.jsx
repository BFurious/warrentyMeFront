import React, { useEffect, useState } from "react";
import axios from "axios";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

const AuthWrapper = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if the user is authenticated
        await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/check-auth`, {
          withCredentials: true,
        });
        setIsAuthenticated(true);
      } catch (error) {
        message.error("Unauthorized. Please log in.");
        navigate("/"); // Redirect to login page
    } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>; // Show a loading spinner
  }

  if (!isAuthenticated) {
    return <div>Unauthorized. Please log in.</div>; // Show unauthorized message
  }

  return children; // Render the protected content
};

export default AuthWrapper;
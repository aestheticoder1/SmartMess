// src/components/RequireGuest.jsx
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

// ❌ Block access to login/register if user is already logged in
const RequireGuest = ({ children }) => {
    const { user } = useSelector((state) => state.auth);

    if (user) {
        // ✅ Redirect to dashboard if logged in
        return <Navigate to="/dashboard" replace />;
    }

    // ✅ Otherwise, show the login/register page
    return children;
};

export default RequireGuest;
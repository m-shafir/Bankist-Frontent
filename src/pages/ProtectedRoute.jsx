import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("loggedInEmail");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      toast.warning("Please log in first");
      navigate("/", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  return isLoggedIn ? children : null;
};

export default ProtectedRoute;

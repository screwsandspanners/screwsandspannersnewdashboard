import { useEffect, useState } from "react";
import SnSlogo from '../../assets/icon/SnSlogo.png';
import { useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import type { LoginResponse } from "@/types/auth";
import { AxiosError } from "axios";
import Alert from "@/components/ui/Alert";
import { hasToken } from "@/api/auth";
import { DASH_BOARD_PAGE, LOGIN_ENDPOINT_PATH } from "@/constants";

const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(()=>{
    if(hasToken()){
      navigate(DASH_BOARD_PAGE);
    }
  }, []);

  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleLogin = async (e:any) => {
    e.preventDefault();

    if (!phoneNumber.trim()) {
      setAlert({
          type: "error",
          message: "Phone number is required.",
      });
      return;
    }
    
    if (!password) {
        setAlert({
            type: "error",
            message: "Password is required.",
        });
        return;
    }
  
    try {
      const formData = new FormData();
      formData.append("phone_code", "+234");
      formData.append("phone_number", phoneNumber.trim());
      formData.append("password", password.trim());
      formData.append("device_type", "web");
      formData.append("device_id", "1");

      setLoading(true);
      await api.post<LoginResponse>(LOGIN_ENDPOINT_PATH, formData);
      setLoading(false);
      setTimeout(() => {
        navigate(DASH_BOARD_PAGE);
    }, 1200);
    } catch (error) {
      setLoading(false);
      let message = "Something went wrong.";
      if (error instanceof AxiosError) {
          message = error.response?.data?.message ?? message;
      }
      setAlert({
          type: "error",
          message,
      });
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundColor: "#000000" }}>
            {alert && (
              <Alert
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert(null)}
              />
            )}
      <div className="bg- dark:bg- p- sm:p- rounded shadow-md w-full max-w-sm sm:max-w-md text-black dark:text-white">
        {/* Logo */}
        <div className="flex justify-start mb-4">
          <img
            src={SnSlogo}
            alt="Admin"
            className="w-12 h-12 sm:w-16 sm:h-16"
          />
        </div>

        {/* Heading */}
        <div className="mb-6 text-white ">
          <h2 className="text-lg sm:text-xl font-bold ">
            Sign In to your account
          </h2>
          <p className="text-xs sm:text-sm mt-2 ">
            Welcome back, enter your details to sign in as an admin
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          {/* Phone Number */}
          <div className="mb-4">
            <label
              htmlFor="phoneNumber"
              className="block text-sm text-white font-medium mb-1">
              Phone Number
            </label>
            <input
              id="phoneNumber"
              disabled={loading}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Enter phone number"
              className="w-full px-4 py-2 border rounded bg-gray-700 text-white"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div> 

          {/* Password */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <label
                htmlFor="password"
                className="text-sm text-white font-medium"
              >
                Password
              </label>
            </div>
            <input
              id="password"
              autoFocus
              disabled={loading}
              type="password"
              placeholder="Enter Password"
              className="w-full px-4 py-2 border rounded bg-gray-700 dark:text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button
            disabled={loading}
            type="submit"
            className={`
              w-full
              rounded-lg
              py-3
              font-semibold
              transition-all
              bg-red-600
              hover:bg-red-700
              disabled:bg-gray-500
              disabled:cursor-not-allowed
              `}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
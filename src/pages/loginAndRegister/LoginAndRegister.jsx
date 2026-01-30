import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {Axiosinstance} from "../../utilites/AxiosInstance.js";

// Register
const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phno: "",
    email: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [otpError, setOtpError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("form"); // 'form' or 'otp'

  const validatePhone = (phone) => {
    const phoneRegex = /^([6-9]{1}[0-9]{9})$/;
    return phoneRegex.test(phone);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
    if (otpError) {
      setOtpError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validate phone
    if (!validatePhone(formData.phno)) {
      newErrors.phno =
        "Please enter a valid 10-digit Indian mobile number starting with 6-9.";
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match!";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    console.log("Submitting form data:", formData); // Debug: Check form data
    try {
      // Call backend /auth/register
      const response = await AxiosInstance.post("/auth/register", formData);
      console.log("Backend response:", response.data); // Debug: Log full response
      // Flexible check: Success if status 200 or message contains "OTP sent"
      if (
        response.status === 200 ||
        response.data.message?.includes("OTP sent")
      ) {
        console.log("OTP sent - switching to OTP step"); // Debug
        setStep("otp");
      } else {
        console.warn("Unexpected response:", response.data); // Debug
      }
    } catch (error) {
      console.error("Register error:", error.response?.data || error.message); // Debug
      const errMsg =
        error.response?.data?.error || "Registration failed. Please try again.";
      setErrors({ general: errMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);
    console.log("Verifying OTP:", otp, "for email:", formData.email); // Debug
    try {
      const response = await AxiosInstance.post("/auth/verify-otp", {
        email: formData.email,
        otp,
      });
      console.log("Verify response:", response.data); // Debug
      if (response.data.message === "Registration successful") {
        sessionStorage.setItem("token", response.data.token);
        navigate("/login"); // Or dashboard
      }
    } catch (error) {
      console.error("Verify error:", error.response?.data || error.message); // Debug
      const errMsg = error.response?.data?.error || "OTP verification failed.";
      setOtpError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const inputFields = [
    { name: "name", type: "text", placeholder: "Full Name", required: true },
    { name: "phno", type: "tel", placeholder: "Phone Number", required: true },
    {
      name: "email",
      type: "email",
      placeholder: "Email Address",
      required: true,
    },
    { name: "address", type: "text", placeholder: "Address", required: true },
    {
      name: "password",
      type: "password",
      placeholder: "Password",
      required: true,
    },
    {
      name: "confirmPassword",
      type: "password",
      placeholder: "Confirm Password",
      required: true,
    },
  ];

  if (step === "otp") {
    return (
      <div className="min-h-screen min-w-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-center mb-6">Verify OTP</h2>
          <p className="text-center text-gray-600 mb-4">
            Enter the 6-digit OTP sent to <strong>{formData.email}</strong>
          </p>
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <input
                name="otp"
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={handleOtpChange}
                maxLength={6}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  otpError
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {otpError && (
                <p className="text-red-500 text-sm mt-1">{otpError}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
          <p className="text-center mt-4 text-sm text-gray-600">
            <button
              onClick={() => setStep("form")}
              className="text-blue-500 underline"
              disabled={loading}
            >
              Back to Form
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {inputFields.map((field) => (
            <div key={field.name}>
              <input
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                value={formData[field.name]}
                onChange={handleChange}
                required={field.required}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors[field.name]
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {errors[field.name] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors[field.name]}
                </p>
              )}
            </div>
          ))}
          {errors.general && (
            <p className="text-red-500 text-sm mt-1">{errors.general}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Sending OTP..." : "Register"}
          </button>
        </form>
        <p className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

// login
const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    credential: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validatePhone = (phone) => {
    const phoneRegex = /^([6-9]{1}[0-9]{9})$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const credential = formData.credential.trim();

    const isEmail = validateEmail(credential);
    const isPhone = validatePhone(credential);

    if (!isEmail && !isPhone) {
      newErrors.credential =
        "Please enter a valid email address or 10-digit Indian mobile number starting with 6-9.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // Call backend /auth/login
      const response = await Axiosinstance.post("/auth/login", formData);
      console.log(response.data.user, "data");

      if (response.data.message === "Login successful") {
        // Store JWT token
        sessionStorage.setItem("token", response.data.token);
        sessionStorage.setItem(
          "user",
          JSON.stringify({
            id: response.data.user.id,
            name: response.data.user.name,
            email: response.data.user.email,
            phno: response.data.user.phno,
          })
        );
        const stage = localStorage.getItem("stage");
        console.log(stage);

        if (stage) {
          navigate(stage);
          localStorage.clear();
        } else {
          navigate("/starter");
        } // Or to protected route, e.g., /doctors
      }
    } catch (error) {
      const errMsg =
        error.response?.data?.error || "Login failed. Please try again.";
      setErrors({ general: errMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              name="credential"
              type="text"
              placeholder="Email or Phone Number"
              value={formData.credential}
              onChange={handleChange}
              required={true}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.credential
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {errors.credential && (
              <p className="text-red-500 text-sm mt-1">{errors.credential}</p>
            )}
          </div>
          <div>
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required={true}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.password
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>
          {errors.general && (
            <p className="text-red-500 text-sm mt-1">{errors.general}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="text-center mt-4 text-sm text-gray-600">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-500">
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export { Register, Login };

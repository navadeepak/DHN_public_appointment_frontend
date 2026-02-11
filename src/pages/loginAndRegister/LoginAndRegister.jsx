import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Axiosinstance } from "../../utilites/AxiosInstance.js";
import { Icon } from "@iconify/react";

// Shared Layout Component
const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen w-full flex bg-white overflow-hidden">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-1/2 bg-teal-900 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-linear-to-br from-teal-900/90 to-blue-900/90"></div>

        <div className="relative z-10 text-center px-10 text-white max-w-lg">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/20">
            <Icon icon="fluent:tooth-24-filled" width="40" height="40" />
          </div>
          <h1 className="text-5xl font-bold mb-6 tracking-tight">Dental Health Net</h1>
          <p className="text-lg text-teal-100 leading-relaxed font-light">
            Your smile deserves the best. Join thousands of patients who trust us with their dental care journey.
          </p>
        </div>

        {/* Decorative circles */}
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50/50">
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-gray-200/50 border border-white">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-500">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

// Input Component
const InputField = ({ icon, ...props }) => (
  <div className="relative group">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors">
      <Icon icon={icon} width="20" height="20" />
    </div>
    <input
      {...props}
      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all outline-none text-gray-700 placeholder:text-gray-400 font-medium"
    />
  </div>
);

// Register Component
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

  const validatePhone = (phone) => /^([6-9]{1}[0-9]{9})$/.test(phone);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name) newErrors.name = "Full name is required";
    if (!validatePhone(formData.phno)) newErrors.phno = "Invalid 10-digit number";
    if (!formData.email) newErrors.email = "Email is required";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords mismatch";
    if (!formData.password) newErrors.password = "Password required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await Axiosinstance.post("/auth/register", formData);
      if (response.status === 200 || response.data.message?.includes("OTP sent")) {
        setStep("otp");
      }
    } catch (error) {
      setErrors({ general: error.response?.data?.error || "Registration failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setOtpError("Enter 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const response = await Axiosinstance.post("/auth/verify-otp", {
        email: formData.email,
        otp,
      });
      if (response.data.message === "Registration successful") {
        sessionStorage.setItem("token", response.data.token);
        navigate("/login");
      }
    } catch (error) {
      setOtpError(error.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  if (step === "otp") {
    return (
      <AuthLayout title="Verify OTP" subtitle={`Sent to ${formData.email}`}>
        <form onSubmit={handleVerifyOTP} className="space-y-6">
          <div className="space-y-2">
            <InputField
              name="otp"
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => { setOtp(e.target.value); setOtpError("") }}
              maxLength={6}
              icon="tabler:lock-code"
            />
            {otpError && <p className="text-red-500 text-sm ml-1 font-medium">{otpError}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-200 hover:bg-teal-700 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading && <Icon icon="svg-spinners:ring-resize" />}
            {loading ? "Verifying..." : "Confirm & Register"}
          </button>

          <button
            type="button"
            onClick={() => setStep("form")}
            className="w-full text-center text-sm text-gray-500 hover:text-teal-600 font-medium"
          >
            ← Back to details
          </button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create Account" subtitle="Start your journey to better oral health">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <InputField name="name" type="text" placeholder="Full Name" value={formData.name} onChange={handleChange} icon="tabler:user" />
          {errors.name && <p className="text-red-500 text-xs ml-1">{errors.name}</p>}

          <InputField name="phno" type="tel" placeholder="Phone Number" value={formData.phno} onChange={handleChange} icon="tabler:phone" />
          {errors.phno && <p className="text-red-500 text-xs ml-1">{errors.phno}</p>}

          <InputField name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} icon="tabler:mail" />
          {errors.email && <p className="text-red-500 text-xs ml-1">{errors.email}</p>}

          <InputField name="address" type="text" placeholder="Address" value={formData.address} onChange={handleChange} icon="tabler:map-pin" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <InputField name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} icon="tabler:lock" />
              {errors.password && <p className="text-red-500 text-xs ml-1 mt-1">{errors.password}</p>}
            </div>
            <div>
              <InputField name="confirmPassword" type="password" placeholder="Confirm" value={formData.confirmPassword} onChange={handleChange} icon="tabler:lock-check" />
              {errors.confirmPassword && <p className="text-red-500 text-xs ml-1 mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>
        </div>

        {errors.general && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium text-center">{errors.general}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-200 hover:bg-teal-700 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {loading && <Icon icon="svg-spinners:ring-resize" />}
          {loading ? "Processing..." : "Create Account"}
        </button>

        <p className="text-center text-gray-500 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-teal-600 font-bold hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

// Login Component
const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ credential: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validatePhone = (phone) => /^([6-9]{1}[0-9]{9})$/.test(phone);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const credential = formData.credential.trim();

    if (!validateEmail(credential) && !validatePhone(credential)) {
      newErrors.credential = "Enter valid email or 10-digit phone";
    }
    if (!formData.password) newErrors.password = "Password required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await Axiosinstance.post("/auth/login", formData);
      if (response.data.message === "Login successful") {
        sessionStorage.setItem("token", response.data.token);
        sessionStorage.setItem("user", JSON.stringify(response.data.user));

        const stage = localStorage.getItem("stage");
        localStorage.removeItem("stage"); // Clear stage regardless

        navigate(stage || "/starter");
      }
    } catch (error) {
      setErrors({ general: error.response?.data?.error || "Login failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Please enter your details to sign in">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <InputField
              name="credential"
              type="text"
              placeholder="Email or Phone Number"
              value={formData.credential}
              onChange={handleChange}
              icon="tabler:user"
              autoFocus
            />
            {errors.credential && <p className="text-red-500 text-xs ml-1 mt-1">{errors.credential}</p>}
          </div>

          <div>
            <InputField
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              icon="tabler:lock"
            />
            {errors.password && <p className="text-red-500 text-xs ml-1 mt-1">{errors.password}</p>}
          </div>
        </div>

        {errors.general && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium text-center flex items-center justify-center gap-2">
            <Icon icon="tabler:alert-circle" />
            {errors.general}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-teal-200 hover:bg-teal-700 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {loading && <Icon icon="svg-spinners:ring-resize" />}
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-center text-gray-500 text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-teal-600 font-bold hover:underline">
            Create account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export { Register, Login };

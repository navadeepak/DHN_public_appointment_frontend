import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function StarterPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const userData = JSON.parse(sessionStorage.getItem("user"));
      setUser(userData);
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <div className="w-full h-full overflow-y-auto bg-gray-50/50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center">

        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mt-10 mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Trusted by 500+ Patients
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 leading-tight">
            Seamless Dental Care <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-teal-500 to-blue-600">
              at Your Fingertips
            </span>
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Experience the future of dental appointments. Book verified doctors, track your history, and manage your oral health with Dental Health Net.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <button
              onClick={() => navigate("/doctors")}
              className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white text-lg font-semibold rounded-2xl shadow-xl shadow-teal-200 transition-all transform hover:-translate-y-1 overflow-hidden"
            >
              <span className="relative z-10">Find a Doctor</span>
              <Icon icon="tabler:arrow-right" className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 transform origin-bottom"></div>
            </button>

            {user && (
              <button
                onClick={() => navigate(`/user/${user.id}`)}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-gray-700 hover:text-blue-600 border border-gray-200 hover:border-blue-200 hover:bg-blue-50 text-lg font-medium rounded-2xl transition-all"
              >
                <Icon icon="mdi:calendar-clock" className="w-6 h-6" />
                <span>My Appointments</span>
              </button>
            )}
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-8">
          <FeatureCard
            icon="mdi:shield-check"
            color="text-emerald-500"
            bg="bg-emerald-50"
            title="Verified Clinics"
            desc="Book with confidence. All clinics are verified for quality and safety standards."
          />
          <FeatureCard
            icon="mdi:clock-fast"
            color="text-blue-500"
            bg="bg-blue-50"
            title="Instant Booking"
            desc="No more waiting on calls. View real-time availability and book slots instantly."
          />
          <FeatureCard
            icon="mdi:history"
            color="text-purple-500"
            bg="bg-purple-50"
            title="Digital Records"
            desc="Keep track of your dental history and upcoming appointments in one place."
          />
        </div>

      </div>
    </div>
  );
}

function FeatureCard({ icon, color, bg, title, desc }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-14 h-14 ${bg} ${color} rounded-2xl flex items-center justify-center mb-6`}>
        <Icon icon={icon} width="28" height="28" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

export default StarterPage;

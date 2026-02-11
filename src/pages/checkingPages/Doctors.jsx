import React, { useState, useMemo, useEffect } from "react";
import { Icon } from "@iconify/react";
import profile from "../../assets/profile.png";
import BackButton from "../../components/buttons/BackButton";
import { useNavigate } from "react-router-dom";
// import { Axiosinstance } from "../../utilites/AxiosInstance";

function Doctors() {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAllClinics = async () => {
    try {
      // Using fetch for external URL if it differs from Axios baseURL, or just fixing the logic
      const response = await fetch(
        "https://dependencyfordhn.dentalhealthnet.com/api/clinic-registration/get-enabled-clinic-list"
      );
      const data = await response.json();
      // Assuming data.data is the array based on typical API structure, or just data if it returns array directly
      // checking previous file didn't show structure, but usually it's res.data or just res. 
      // Let's assume the API returns the list directly or in a standard wrapper.
      // If previous code was `setDoctors(res)` and it was broken, I'll assume standard behavior.
      console.log("Doctors data:", data);

      if (data.data) {
        setDoctors(data.data);
      } else if (Array.isArray(data)) {
        setDoctors(data);
      } else {
        setDoctors([]);
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllClinics();
  }, []);

  const uniqueLocations = useMemo(() => {
    return [...new Set(doctors.map((d) => d.clinicLocation).filter(Boolean))].sort();
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    let filtered = doctors;
    if (selectedLocation) {
      filtered = filtered.filter((d) => d.clinicLocation === selectedLocation);
    }
    if (searchTerm) {
      filtered = filtered.filter(
        (d) =>
          d.docName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.clinicName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [doctors, selectedLocation, searchTerm]);

  return (
    <div className="h-full w-full bg-gray-50/50 flex flex-col overflow-hidden">
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col h-full">

        {/* Header */}
        <div className="flex flex-col gap-6 mb-8 shrink-0">
          <div className="flex items-center gap-4">
            <BackButton path={-1} />
            <div>
              <h1 className="font-bold text-3xl text-gray-900">Find Your Doctor</h1>
              <p className="text-gray-500 text-sm mt-1">Book appointments with top dental specialists</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex-1 relative group">
              <Icon icon="tabler:map-pin" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" width="20" height="20" />
              <input
                list="locationList"
                type="text"
                placeholder="Select Location"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-gray-700 placeholder:text-gray-400"
              />
              <datalist id="locationList">
                {uniqueLocations.map((loc) => (
                  <option key={loc} value={loc} />
                ))}
              </datalist>
            </div>

            <div className="flex-2 relative group">
              <Icon icon="tabler:search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" width="20" height="20" />
              <input
                type="text"
                placeholder="Search by doctor or clinic name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-gray-700 placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Icon icon="svg-spinners:3-dots-fade" width="40" height="40" className="text-gray-400" />
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Icon icon="tabler:stethoscope-off" width="32" height="32" className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No doctors found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
              {filteredDoctors.map((data, index) => (
                <DoctorCard key={index} data={data} navigate={navigate} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DoctorCard({ data, navigate }) {
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 flex flex-col gap-5">
      <div className="flex gap-4 items-start">
        <div className="relative shrink-0">
          <img
            className="w-20 h-20 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform duration-300"
            src={profile}
            alt={data.docName}
          />
          {data.dhnDr && (
            <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1 rounded-full border-2 border-white" title="DHN Verified">
              <Icon icon="mdi:check-decagram" width="14" height="14" />
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <h2 className="font-bold text-lg text-gray-900 leading-tight mb-1">{data.docName}</h2>
          <p className="text-sm font-medium text-blue-600 mb-2">{data.clinicName}</p>

          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Icon icon="tabler:map-pin" className="shrink-0" />
            <span className="truncate max-w-[150px]">{data.clinicLocation}</span>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-dashed border-gray-100 flex items-center justify-between">
        <div className="text-xs text-gray-400 font-medium">
          {data.dhnDr ? "Verified Partner" : "External Clinic"}
        </div>

        {data.dhnDr ? (
          <button
            onClick={() => navigate(`/dentist/${data.cid || data.docId}`)} // Ensure ID field
            className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg shadow-lg shadow-gray-200 group-hover:bg-blue-600 group-hover:shadow-blue-200 transition-all transform group-hover:-translate-y-0.5"
          >
            Book Visit
          </button>
        ) : (
          <button disabled className="px-4 py-2 bg-gray-100 text-gray-400 text-sm font-semibold rounded-lg cursor-not-allowed">
            Unavailable
          </button>
        )}
      </div>
    </div>
  )
}

export default Doctors;

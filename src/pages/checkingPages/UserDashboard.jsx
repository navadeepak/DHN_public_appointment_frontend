import { Icon } from "@iconify/react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UserProfileView from "./UserProfileView";
import UserProfileForm from "./UserProfileForm";
import { Axiosinstance } from "../../utilites/AxiosInstance.js";
import { useEffect } from "react";

function UserDashboard() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [appointmentData, setAppointmentData] = useState([]);

  const getAppointments = async () => {
    try {
      const res = await Axiosinstance.get(`/user-appointment/get/${id}`);
      console.log(res.data.data);
      setAppointmentData(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getAppointments();
  }, [id]);

  const [selectedData, setSelectedData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClinics, setSelectedClinics] = useState([]);
  const [userProfileViewMode, setUserProfileViewMode] = useState(false);
  const [userProfileEditMode, setUserProfileEditMode] = useState(false);
  // Extract unique clinics
  const uniqueClinics = [
    ...new Set(appointmentData.map((item) => item.clinicName)),
  ];

  const filteredData = appointmentData.filter((item) => {
    const clinicMatch =
      selectedClinics.length === 0 || selectedClinics.includes(item.clinicName);
    return clinicMatch;
  });

  const handleClinicToggle = (clinicName) => {
    setSelectedClinics((prev) =>
      prev.includes(clinicName)
        ? prev.filter((c) => c !== clinicName)
        : [...prev, clinicName]
    );
  };

  const applyFilters = () => {
    setIsModalOpen(false);
  };

  const clearFilters = () => {
    setSelectedClinics([]);
    setIsModalOpen(false);
  };

  console.log(selectedData);

  return (
    <div className="w-screen h-full flex flex-row bg-white/80 p-4 gap-4">
      <div className="max-w-96 bg-white h-full p-4 flex flex-col gap-3 rounded shadow-md">
        <h1 className="font-bold text-lg text-gray-700">
          Upcomming Appointments
        </h1>
        <p className="text-gray-500 text-xs font-bold">
          upcoming appointment count: {filteredData.length}
        </p>
        <button
          onClick={() => navigate(`/user-appointment/${id}`)}
          className="text-white cursor-pointer bg-linear-90 from-pink-700 to-indigo-700 rounded p-2 font-bold"
        >
          Calender View
        </button>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 rounded border border-gray-300 p-2"
            placeholder="search"
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            title="Filter Appointments"
          >
            <Icon
              icon="mdi:filter"
              width="20"
              height="20"
              className="text-gray-600"
            />
          </button>
        </div>
        <div className="max-h-full overflow-auto">
          <ul className="list-disc pl-6 space-y-2">
            {filteredData.map((data, index) => (
              <li
                key={index}
                onClick={() => setSelectedData(data)}
                className="cursor-pointer hover:bg-gray-100 hover:shadow hover:border-gray-200 border border-transparent rounded p-2 ease-in-out duration-150"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-gray-700">{`${data.appointmentDate}-${data.selectedSlot}`}</span>{" "}
                  <span className="font-bold text-amber-600">
                    {data.clinicName}
                  </span>
                  <span className="font-bold text-gray-700">{`${data.docName}`}</span>{" "}
                  <span className="font-bold text-gray-700">{`${data.clinicNumber}`}</span>{" "}
                  <span className="font-bold text-gray-700">{`${data.clinicLocation}`}</span>{" "}
                  <span
                    className={`font-bold text-white ${
                      data.status === "pending"
                        ? "bg-orange-400"
                        : data.status === "approve"
                        ? "bg-green-400"
                        : "bg-red-500"
                    } rounded capitalize w-fit p-2`}
                  >{`${data.status}`}</span>{" "}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Filter Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                Filter Appointments
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Clinic Filters */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Clinics</h3>
                <div className="space-y-2">
                  {uniqueClinics.map((clinic) => (
                    <label
                      key={clinic}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedClinics.includes(clinic)}
                        onChange={() => handleClinicToggle(clinic)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">{clinic}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full relative bg-white rounded shadow-md">
        {!userProfileEditMode && !userProfileViewMode && (
          <button
            onClick={() => setUserProfileViewMode(true)}
            className="absolute right-0 top-0 hover:bg-teal-500 hover:text-white ease-in-out duration-150 cursor-pointer w-16 h-16 flex items-center justify-center bg-gray-200 rounded-bl-full rounded-rb-full"
          >
            <Icon
              icon="tabler:settings"
              width="28"
              height="28"
              className="right-3 top-3 absolute"
            />
          </button>
        )}
        {userProfileViewMode && (
          <UserProfileView
            setUserProfileEditMode={setUserProfileEditMode}
            userProfileEditMode={userProfileEditMode}
            setUserProfileViewMode={setUserProfileViewMode}
            userProfileViewMode={userProfileViewMode}
          />
        )}
        {userProfileEditMode && (
          <UserProfileForm
            setUserProfileEditMode={setUserProfileEditMode}
            userProfileEditMode={userProfileEditMode}
            setUserProfileViewMode={setUserProfileViewMode}
            userProfileViewMode={userProfileViewMode}
          />
        )}
      </div>
    </div>
  );
}

export default UserDashboard;

import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UserProfileView from "./UserProfileView";
import UserProfileForm from "./UserProfileForm";
import RescheduleModal from "../../components/RescheduleModal";
import ChatWindow from "../../components/chat/ChatWindow";
import { Axiosinstance } from "../../utilites/AxiosInstance.js";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

function UserDashboard() {
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const [appointmentData, setAppointmentData] = useState([]);
  console.log(appointmentData);

  const [selectedClinic, setSelectedClinic] = useState("all");
  const [userProfileViewMode, setUserProfileViewMode] = useState(false);
  const [userProfileEditMode, setUserProfileEditMode] = useState(false);
  const [dateFilter, setDateFilter] = useState("this_week"); // 'all', 'today', 'tomorrow', 'this_week', 'this_month', 'next_month'
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'pending', 'approved', 'cancelled'

  const statusTabs = [
    { label: "All Status", value: "all", icon: "tabler:list" },
    { label: "Pending", value: "pending", icon: "tabler:clock" },
    { label: "Approved", value: "approved", icon: "tabler:circle-check" },
    { label: "Cancelled", value: "cancelled", icon: "tabler:circle-x" },
  ];

  const dateTabs = [
    { label: "All", value: "all", icon: "tabler:calendar-event" },
    { label: "Yesterday", value: "yesterday", icon: "tabler:arrow-narrow-left" },
    { label: "Today", value: "today", icon: "tabler:calendar-check" },
    { label: "Tomorrow", value: "tomorrow", icon: "tabler:arrow-narrow-right" },
    { label: "This Week", value: "this_week", icon: "tabler:calendar-stats" },
    { label: "This Month", value: "this_month", icon: "tabler:calendar-month" },
    { label: "Next Month", value: "next_month", icon: "tabler:calendar-plus" },
  ];
  const [showReschedule, setShowReschedule] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);
  const [showChat, setShowChat] = useState(false);

  const handleApprove = async (apt) => {
    try {
      await Axiosinstance.patch(`/user-appointment/${apt._id || apt.id}/approve`);
      alert("Appointment approved successfully");
      setAppointmentData((prev) =>
        prev.map((a) =>
          (a._id === apt._id || a.id === apt.id) ? { ...a, status: "approve" } : a
        )
      );
    } catch (error) {
      console.error("Approval failed", error);
      alert("Failed to approve appointment");
    }
  };

  const handleReject = async (apt) => {
    if (!window.confirm("Are you sure you want to reject this rescheduled appointment?")) return;
    try {
      await Axiosinstance.patch(`/user-appointment/${apt._id || apt.id}/cancel`);
      alert("Appointment rejected successfully");
      setAppointmentData((prev) =>
        prev.map((a) =>
          (a._id === apt._id || a.id === apt.id) ? { ...a, status: "cancel" } : a
        )
      );
    } catch (error) {
      console.error("Rejection failed", error);
      alert("Failed to reject appointment");
    }
  };

  const handleReschedule = (apt) => {
    setSelectedApt(apt);
    setShowReschedule(true);
  };

  const handleRescheduleSuccess = (updatedApt) => {
    setAppointmentData((prev) =>
      prev.map((a) =>
        (a._id === updatedApt._id || a.id === updatedApt.id) ? updatedApt : a
      )
    );
    setShowReschedule(false);
    setSelectedApt(null);
  };

  const getAppointments = async () => {
    try {
      const res = await Axiosinstance.get(`/user-appointment/get/${id}`);
      setAppointmentData(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getAppointments();
  }, [id]);

  const uniqueClinics = [
    ...new Set(appointmentData.map((item) => item.clinicName)),
  ];

  const filterByDate = (dateStr) => {
    if (dateFilter === "all") return true;

    // Normalize date string (assuming YYYY-MM-DD or similar standard format)
    const appointmentDate = dayjs(dateStr);
    const today = dayjs();

    if (!appointmentDate.isValid()) return true;

    if (dateFilter === "today") {
      return appointmentDate.isSame(today, 'day');
    }
    if (dateFilter === "tomorrow") {
      return appointmentDate.isSame(today.add(1, 'day'), 'day');
    }
    if (dateFilter === "this_week") {
      return appointmentDate.isSame(today, 'week');
    }
    if (dateFilter === "this_month") {
      return appointmentDate.isSame(today, 'month');
    }
    if (dateFilter === "next_month") {
      return appointmentDate.isSame(today.add(1, 'month'), 'month');
    }
    return true;
  };

  const filteredData = appointmentData.filter((item) => {
    const isClinicMatch = selectedClinic === "all" || item.clinicName === selectedClinic;
    const isDateMatch = filterByDate(item.appointmentDate);

    let isStatusMatch = true;
    if (statusFilter !== "all") {
      const status = item.status?.toLowerCase() || "";
      if (statusFilter === "approved") {
        isStatusMatch = status === "approve" || status === "approved";
      } else if (statusFilter === "pending") {
        isStatusMatch = status === "pending";
      } else if (statusFilter === "cancelled") {
        isStatusMatch = status === "reject" || status === "cancelled" || status === "rejected";
      }
    }

    return isClinicMatch && isDateMatch && isStatusMatch;
  });

  return (
    <div className="w-screen h-screen flex flex-row bg-gray-50/50 p-6 gap-6 font-sans">
      {/* Left Sidebar - Clinic List */}
      <div className="w-[300px] shrink-0 bg-white h-full flex flex-col rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-white">
          <h1 className="font-bold text-xl text-gray-800">My Clinics</h1>
          <p className="text-gray-500 text-xs mt-1">Select a clinic to view appointments</p>
        </div>

        {/* Clinic List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <button
            key="all-clinics"
            onClick={() => {
              setSelectedClinic("all");
              setUserProfileViewMode(false);
              setUserProfileEditMode(false);
            }}
            className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex items-center justify-between group
                            ${selectedClinic === "all"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedClinic === "all" ? "bg-white/20 text-white" : "bg-white text-indigo-600"}`}>
                <Icon icon="mdi:hospital-building" width="18" />
              </div>
              <span className="font-semibold text-sm truncate">All Clinics</span>
            </div>
            {selectedClinic === "all" && <Icon icon="tabler:chevron-right" />}
          </button>

          {uniqueClinics.length > 0 ? (
            uniqueClinics.map((clinic) => (
              <div
                key={clinic}
                className={`w-full p-1 rounded-xl transition-all duration-200 flex flex-col gap-1
                            ${selectedClinic === clinic
                    ? "bg-indigo-600/10 border border-indigo-100"
                    : "bg-transparent border border-transparent"
                  }`}
              >
                <button
                  onClick={() => {
                    setSelectedClinic(clinic);
                    setUserProfileViewMode(false);
                    setUserProfileEditMode(false);
                  }}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex items-center justify-between group
                            ${selectedClinic === clinic
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  <span className="font-semibold text-sm truncate">{clinic}</span>
                  {selectedClinic === clinic && <Icon icon="tabler:chevron-right" />}
                </button>

                {/* Chat and Other Clinic-specific actions */}
                {selectedClinic === clinic && (
                  <div className="flex px-2 pb-2 gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <button
                      onClick={() => setShowChat(!showChat)}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2
                                ${showChat
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-white text-gray-600 shadow-sm hover:shadow-md border border-gray-100"
                        }`}
                    >
                      <Icon icon={showChat ? "tabler:message-off" : "solar:chat-round-dots-bold"} width="16" />
                      {showChat ? "Close Chat" : "Open Chat"}
                    </button>

                    {showChat && (
                      <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-10 duration-500">
                        <ChatWindow
                          clinicId={appointmentData.find(a => a.clinicName === selectedClinic)?.cid}
                          clinicName={selectedClinic}
                          onClose={() => setShowChat(false)}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-400 text-sm">
              No clinics found
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => navigate(`/user-appointment/${id}`)}
            className="w-full flex items-center justify-center gap-2 text-indigo-600 bg-indigo-50 p-3 rounded-xl hover:bg-indigo-100 transition-colors text-sm font-bold"
          >
            <Icon icon="mdi:calendar-month" width="20" />
            <span>Full Calendar</span>
          </button>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden flex flex-col">
        {/* Top Bar */}
        <div className="h-16 border-b border-gray-100 flex items-center justify-between px-8 bg-white shrink-0">
          <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            {userProfileViewMode || userProfileEditMode ? "My Profile" : (
              <>
                <span className="text-gray-400 font-normal">Appointments at</span>
                <span className="text-indigo-600">{selectedClinic === "all" ? "All Clinics" : selectedClinic}</span>
              </>
            )}
          </h2>

          <button
            onClick={() => {
              if (userProfileViewMode || userProfileEditMode) {
                setUserProfileViewMode(false);
                setUserProfileEditMode(false);
              } else {
                setUserProfileViewMode(true);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium
                    ${userProfileViewMode || userProfileEditMode
                ? "bg-gray-100 text-gray-800"
                : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
              }`}
          >
            <Icon icon={userProfileViewMode || userProfileEditMode ? "tabler:arrow-left" : "mdi:account-circle"} width="20" />
            <span>{userProfileViewMode || userProfileEditMode ? "Back to Appointments" : "My Profile"}</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden bg-gray-50/30 p-8 flex flex-col">
          {userProfileViewMode ? (
            <div className="flex-1 overflow-y-auto">
              <UserProfileView
                setUserProfileEditMode={setUserProfileEditMode}
                setUserProfileViewMode={setUserProfileViewMode}
              />
            </div>
          ) : userProfileEditMode ? (
            <div className="flex-1 overflow-y-auto">
              <UserProfileForm
                setUserProfileEditMode={setUserProfileEditMode}
                userProfileEditMode={userProfileEditMode}
                setUserProfileViewMode={setUserProfileViewMode}
                userProfileViewMode={userProfileViewMode}
              />
            </div>
          ) : (
            <div className="flex flex-col h-full gap-6 min-h-0">
              {/* Refactored Filters Row */}
              <div className="flex flex-col gap-6">
                {/* Date Filter Tabs */}
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Time Horizon</span>
                  <div className="flex flex-wrap items-center p-1 bg-gray-100/50 rounded-2xl w-fit border border-gray-100">
                    {dateTabs.map((tab) => {
                      const isActive = dateFilter === tab.value;
                      return (
                        <button
                          key={tab.value}
                          onClick={() => setDateFilter(tab.value)}
                          className={`
                            relative flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black transition-all duration-300 uppercase tracking-widest
                            ${isActive
                              ? "text-white bg-indigo-600 shadow-lg shadow-indigo-500/20"
                              : "text-gray-400 hover:text-gray-600"
                            }
                          `}
                        >
                          {isActive && (
                            <div className="absolute inset-0 bg-linear-90 from-indigo-500 to-indigo-700 rounded-xl -z-10" />
                          )}
                          <Icon icon={tab.icon} className="text-sm" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Status Filter Tabs */}
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Appointment Status</span>
                  <div className="flex flex-wrap items-center p-1 bg-gray-100/50 rounded-2xl w-fit border border-gray-100">
                    {statusTabs.map((tab) => {
                      const isActive = statusFilter === tab.value;
                      return (
                        <button
                          key={tab.value}
                          onClick={() => setStatusFilter(tab.value)}
                          className={`
                            relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all duration-300 uppercase tracking-widest
                            ${isActive
                              ? "text-white bg-indigo-600 shadow-lg shadow-indigo-500/20"
                              : "text-gray-500 hover:text-gray-700"
                            }
                          `}
                        >
                          {isActive && (
                            <div className="absolute inset-0 bg-linear-90 from-indigo-600 to-violet-600 rounded-xl -z-10" />
                          )}
                          <Icon icon={tab.icon} className="text-base" />
                          {tab.label}
                          {tab.value !== 'all' && (
                            <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] ${isActive ? "bg-white/20" : "bg-gray-200 text-gray-500"}`}>
                              {appointmentData.filter(a => {
                                const status = a.status?.toLowerCase() || "";
                                const isDateMatch = filterByDate(a.appointmentDate);
                                if (!isDateMatch) return false;
                                if (tab.value === "approved") return status === "approve" || status === "approved";
                                if (tab.value === "pending") return status === "pending";
                                if (tab.value === "cancelled") return status === "reject" || status === "cancelled" || status === "rejected";
                                return false;
                              }).length}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>


              </div>

              {/* Data Table */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
                <div className="overflow-auto flex-1">
                  <table className="relative w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10 bg-white shadow-sm">
                      <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-400 font-bold tracking-wider">
                        <th className="p-4 whitespace-nowrap">Doctor Name</th>
                        <th className="p-4 whitespace-nowrap">Clinic Name</th>
                        <th className="p-4 whitespace-nowrap">Date & Time</th>
                        <th className="p-4 whitespace-nowrap">Location</th>
                        <th className="p-4 text-center whitespace-nowrap">Status</th>
                        <th className="p-4 text-center whitespace-nowrap">Actions</th>
                        <th className="p-4 text-right whitespace-nowrap">Contact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredData.length > 0 ? (
                        filteredData.map((data, index) => (
                          <tr key={index} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="p-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                  {data.docName ? data.docName.charAt(0) : "D"}
                                </div>
                                <span className="font-semibold text-gray-700 text-sm">Dr. {data.docName}</span>
                              </div>
                            </td>
                            <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                              {data.clinicName}
                            </td>
                            <td className="p-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-800">{data.appointmentDate}</span>
                                <span className="text-xs text-gray-400">{data.selectedSlot}</span>
                              </div>
                            </td>
                            <td className="p-4 text-sm text-gray-600 max-w-[200px] truncate" title={data.clinicLocation}>
                              {data.clinicLocation}
                            </td>
                            <td className="p-4 text-center whitespace-nowrap">
                              <span
                                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide inline-block ${data.status === "pending"
                                  ? "bg-orange-100 text-orange-600"
                                  : data.status === "approve" || data.status === "approved"
                                    ? "bg-emerald-100 text-emerald-600"
                                    : data.status === "doctor_rescheduled"
                                      ? "bg-purple-100 text-purple-600"
                                      : "bg-red-100 text-red-600"
                                  }`}
                              >
                                {(() => {
                                  if (data.status === "doctor_rescheduled") return "Doctor Rescheduled";
                                  if (data.status === "reject") return "Doctor Cancelled";
                                  if (data.status === "cancelled") return "Patient Cancelled";
                                  if (data.status === "pending") {
                                    if (data.reschedules?.length > 0 && data.reschedules[data.reschedules.length - 1].rescheduledBy === "Patient") {
                                      return "Patient Rescheduled";
                                    }
                                    return "Pending";
                                  }
                                  return data.status;
                                })()}
                              </span>
                            </td>
                            <td className="p-4 text-center whitespace-nowrap">
                              {data.status === "doctor_rescheduled" && (
                                <div className="flex justify-center gap-2">
                                  <button
                                    onClick={() => handleApprove(data)}
                                    className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded hover:bg-purple-700 transition"
                                    title="Approve Reschedule"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleReschedule(data)}
                                    className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition"
                                    title="Reschedule Appointment"
                                  >
                                    Reschedule
                                  </button>
                                  <button
                                    onClick={() => handleReject(data)}
                                    className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded hover:bg-red-100 transition"
                                    title="Reject Reschedule"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="p-4 text-right whitespace-nowrap">
                              <div className="flex flex-col items-end gap-1">
                                <span className="text-xs text-gray-400 font-mono">{data.clinicNumber}</span>
                                <span className="text-[10px] text-gray-300">ID: {data.clinicId?.slice(-6) || "N/A"}</span>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="p-12 text-center text-gray-400">
                            <div className="flex flex-col items-center gap-2">
                              <Icon icon="mdi:calendar-remove-outline" width="32" className="opacity-40" />
                              <p className="text-sm">No appointments found matching your filters.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {
        showReschedule && selectedApt && (
          <RescheduleModal
            appointment={selectedApt}
            onClose={() => setShowReschedule(false)}
            onSuccess={handleRescheduleSuccess}
          />
        )
      }


    </div>
  );
}

export default UserDashboard;

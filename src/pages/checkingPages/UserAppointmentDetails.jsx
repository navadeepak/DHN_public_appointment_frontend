import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import BackButton from "../../components/buttons/BackButton";
import { Axiosinstance } from "../../utilites/AxiosInstance.js";
import { useParams } from "react-router-dom";
import RescheduleModal from "../../components/RescheduleModal";

const UserAppointmentDetails = () => {
  const { id } = useParams();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReschedule, setShowReschedule] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);

  const handleReschedule = (apt) => {
    setSelectedApt(apt);
    setShowReschedule(true);
  };

  const handleCancel = async (apt) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await Axiosinstance.patch(`/user-appointment/${apt._id}/cancel`);
      alert("Appointment cancelled successfully");
      // Update local state to reflect change immediately
      setAppointments((prev) =>
        prev.map((a) =>
          a._id === apt._id ? { ...a, status: "cancelled" } : a
        )
      );
    } catch (error) {
      console.error("Cancellation failed", error);
      alert("Failed to cancel appointment");
    }
  };

  const handleApprove = async (apt) => {
    try {
      await Axiosinstance.patch(`/user-appointment/${apt._id}/approve`);
      alert("Appointment approved successfully");
      setAppointments((prev) =>
        prev.map((a) =>
          a._id === apt._id ? { ...a, status: "approve" } : a
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
      await Axiosinstance.patch(`/user-appointment/${apt._id}/reject`);
      alert("Appointment rejected successfully");
      setAppointments((prev) =>
        prev.map((a) =>
          a._id === apt._id ? { ...a, status: "reject" } : a
        )
      );
    } catch (error) {
      console.error("Rejection failed", error);
      alert("Failed to reject appointment");
    }
  };

  const handleRescheduleSuccess = (updatedApt) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a._id === updatedApt._id ? updatedApt : a
      )
    );
    setShowReschedule(false);
    setSelectedApt(null);
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await Axiosinstance.get(
          `/user-appointment/get-appointment-by-patient-id/${id}`
        );
        if (res.data && res.data.data) {
          setAppointments(res.data.data);
        } else if (Array.isArray(res.data)) {
          setAppointments(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch appointments", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchAppointments();
  }, [id]);

  const upcomingAppointments = appointments
    .filter(
      (app) => new Date(app.appointmentDate) >= new Date().setHours(0, 0, 0, 0)
    )
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

  const pastAppointments = appointments
    .filter(
      (app) => new Date(app.appointmentDate) < new Date().setHours(0, 0, 0, 0)
    )
    .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

  return (
    <div className="w-full h-full bg-gray-50/50 overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              My Appointments
            </h1>
            <p className="text-gray-500 text-sm">
              Track your dental visits and history
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Icon icon="svg-spinners:3-dots-fade" width="40" height="40" />
            <p className="mt-4 text-sm font-medium">Loading records...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* UPCOMING */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                <h2 className="text-sm font-bold uppercase text-gray-500 tracking-wider">
                  Upcoming
                </h2>
              </div>

              {upcomingAppointments.length > 0 ? (
                <div className="grid gap-4">
                  {upcomingAppointments.map((apt) => (
                    <AppointmentCard
                      key={apt._id || apt.id}
                      apt={apt}
                      type="upcoming"
                      onReschedule={() => handleReschedule(apt)}
                      onCancel={() => handleCancel(apt)}
                      onApprove={() => handleApprove(apt)}
                      onReject={() => handleReject(apt)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                    <Icon icon="mdi:calendar-clock" width="24" />
                  </div>
                  <p className="text-gray-500 text-sm">
                    No upcoming appointments scheduled.
                  </p>
                </div>
              )}
            </section>

            {/* PAST */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                <h2 className="text-sm font-bold uppercase text-gray-400 tracking-wider">
                  Past History
                </h2>
              </div>

              {pastAppointments.length > 0 ? (
                <div className="grid gap-4 opacity-80 hover:opacity-100 transition-opacity">
                  {pastAppointments.map((apt) => (
                    <AppointmentCard
                      key={apt._id || apt.id}
                      apt={apt}
                      type="past"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No past appointments found.
                </div>
              )}
            </section>
          </div>
        )}
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
    </div >
  );
};

const AppointmentCard = ({ apt, type, onReschedule, onCancel, onApprove, onReject }) => {
  const isUpcoming = type === "upcoming";

  return (
    <div
      className={`bg-white rounded-2xl p-5 border transition-all duration-300 flex flex-col md:flex-row gap-5 items-start md:items-center
            ${isUpcoming
          ? "border-blue-100 shadow-lg shadow-blue-50 hover:shadow-blue-100 hover:border-blue-200"
          : "border-gray-200 shadow-sm hover:border-gray-300"
        }`}
    >
      {/* Date Badge */}
      <div
        className={`shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-xl border
                 ${isUpcoming
            ? "bg-blue-50 border-blue-100 text-blue-700"
            : "bg-gray-50 border-gray-100 text-gray-500"
          }
            `}
      >
        <span className="text-xs font-bold uppercase">
          {new Date(apt.appointmentDate).toLocaleDateString("en-US", {
            month: "short",
          })}
        </span>
        <span className="text-xl font-bold leading-none">
          {new Date(apt.appointmentDate).getDate()}
        </span>
      </div>

      <div className="flex-1">
        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
          <h3 className="font-bold text-gray-900 line-clamp-1">
            {apt.docName || "Doctor"}
          </h3>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit
                         ${apt.status === "cancelled" || apt.status === "reject"
                ? "bg-red-100 text-red-700"
                : apt.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : apt.status === "doctor_rescheduled"
                    ? "bg-purple-100 text-purple-700"
                    : isUpcoming
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
              }
                     `}
          >
            {apt.status === "doctor_rescheduled" ? "Rescheduled by Doctor" : (apt.status || "Pending")}
          </span>
        </div>

        <p className="text-sm font-medium text-blue-600 mb-2">
          {apt.clinicName}
        </p>

        <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Icon icon="tabler:clock" className="text-gray-400" />
            <span>{apt.selectedSlot}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Icon icon="tabler:map-pin" className="text-gray-400" />
            <span className="truncate max-w-[150px]">{apt.clinicLocation}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Icon icon="tabler:phone" className="text-gray-400" />
            <span>{apt.clinicNumber}</span>
          </div>
        </div>
      </div>

      {isUpcoming && apt.status !== "cancelled" && apt.status !== "reject" && (
        <div className="md:ml-auto flex gap-2 w-full md:w-auto mt-2 md:mt-0">
          {apt.status === "doctor_rescheduled" && (
            <>
              <button
                onClick={onApprove}
                className="flex-1 md:flex-none px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
              >
                Approve Reschedule
              </button>
              <button
                onClick={onReject}
                className="flex-1 md:flex-none px-4 py-2 bg-red-50 text-red-600 border border-red-100 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors shadow-sm"
              >
                Reject
              </button>
            </>
          )}

          <button
            onClick={onCancel}
            className="flex-1 md:flex-none px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 hover:text-red-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onReschedule}
            className="flex-1 md:flex-none px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Reschedule
          </button>
        </div>
      )}
    </div>
  );
};

export default UserAppointmentDetails;

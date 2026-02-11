import React, { useEffect, useState, useRef, useMemo } from "react";
import BackButton from "../../components/buttons/BackButton";
import { useNavigate, useParams } from "react-router-dom";
import {
  Axiosinstance,
  AxiosinstanceseconderyBackend,
} from "../../utilites/AxiosInstance.js";
import profileImg from "../../assets/profile.png";
import { Icon } from "@iconify/react";

function TargetedDentist() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [doctor, setDoctor] = useState({});

  const MAX_WEEKS = 8;

  const [weekOffset, setWeekOffset] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const sliderRef = useRef(null);

  // Image upload preview states
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Scrollable date picker states
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const generateDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(today);
    startDate.setDate(today.getDate() + weekOffset * 7);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const maxDate = new Date(today);
      maxDate.setDate(today.getDate() + MAX_WEEKS * 7);

      dates.push({
        full: date.toISOString().split("T")[0],
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        dateNum: date.getDate(),
        month: date.toLocaleDateString("en-US", { month: "short" }),
        isToday: weekOffset === 0 && i === 0,
        isPast: date < today,
        isDisabled: date > maxDate,
      });
    }

    return dates;
  }, [weekOffset]);

  const getTargetedClinicDetails = async () => {
    try {
      const res = await AxiosinstanceseconderyBackend.get(
        `clinic-registration/get/${id}`
      );
      if (res.data && res.data.data) {
        setDoctor(res.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getTargetedClinicDetails();
  }, [id]);

  const data = {
    clinicId: doctor.cid,
    clinicLocation: doctor.address,
    clinicName: doctor.clinicName,
    clinicNumber: doctor.phno,
    dhnDr: true,
    docImg: "https://example.com/images/dentist1.jpg",
    docName: doctor.doctorName,
    subdomainName: doctor.subdomainName, // preserved from original code logic usage
  };

  const generateSlots = (
    startHour,
    startMin,
    startPeriod,
    endHour,
    endMin,
    endPeriod
  ) => {
    const slots = [];
    let currentHour = startHour;
    let currentMin = startMin;
    let currentPeriod = startPeriod;

    while (true) {
      let displayHour = currentHour;
      if (currentHour === 12) {
        displayHour = 12;
      } else if (currentHour > 12) {
        displayHour = currentHour - 12;
      }
      const startTime = `${displayHour.toString().padStart(2, "0")}:${currentMin
        .toString()
        .padStart(2, "0")} ${currentPeriod}`;

      slots.push(startTime);

      currentMin += 15;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour += 1;
        if (currentHour > 12) {
          currentHour = 1;
          currentPeriod = currentPeriod === "AM" ? "PM" : "AM";
        }
      }

      let endDisplayHour = endHour;
      if (endHour === 12) {
        endDisplayHour = 12;
      } else if (endHour > 12) {
        endDisplayHour = endHour - 12;
      }
      const isPastEnd =
        (currentPeriod === endPeriod && currentHour > endHour) ||
        (currentPeriod === endPeriod &&
          currentHour === endHour &&
          currentMin >= endMin) ||
        (currentPeriod !== endPeriod &&
          ((currentPeriod === "PM" && endPeriod === "AM") ||
            (currentPeriod === "AM" &&
              endPeriod === "PM" &&
              currentHour >= endHour)));

      if (isPastEnd) break;
    }
    return slots;
  };

  const periods = [
    {
      name: "morning",
      start: { hour: 9, min: 0, period: "AM" },
      end: { hour: 12, min: 0, period: "PM" },
    },
    {
      name: "afternoon",
      start: { hour: 12, min: 0, period: "PM" },
      end: { hour: 4, min: 0, period: "PM" },
    },
    {
      name: "evening",
      start: { hour: 4, min: 0, period: "PM" },
      end: { hour: 7, min: 0, period: "PM" },
    },
    {
      name: "night",
      start: { hour: 7, min: 0, period: "PM" },
      end: { hour: 9, min: 0, period: "PM" },
    },
  ];

  const timeSlots = periods.reduce((acc, period) => {
    acc[period.name] = generateSlots(
      period.start.hour,
      period.start.min,
      period.start.period,
      period.end.hour,
      period.end.min,
      period.end.period
    );
    return acc;
  }, {});

  const patientData = JSON.parse(sessionStorage.getItem("user"));
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [patientName, setPatientName] = useState(patientData?.name);
  const [patientId, setPatientId] = useState(patientData?.id);
  const [patientPhone, setPatientPhone] = useState(patientData?.phno);
  const [patientEmail, setPatientEmail] = useState(patientData?.email);
  const [appointmentDate, setAppointmentDate] = useState("");

  useEffect(() => {
    setPatientName(patientData?.name || "");
    setPatientId(patientData?.id || "");
    setPatientPhone(patientData?.phno || "");
    setPatientEmail(patientData?.email || "");
  }, [patientData]);

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isLoggedIn = !!sessionStorage.getItem("user");
    if (!isLoggedIn) {
      localStorage.setItem("stage", location.pathname);
      navigate("/");
      return;
    }

    if (
      !selectedSlot ||
      !selectedDate ||
      !patientName ||
      !patientPhone ||
      !patientEmail
    ) {
      alert(
        "Please select date, time slot and ensure all patient details are filled."
      );
      return;
    }

    const payload = {
      selectedSlot,
      appointmentDate: selectedDate, // scrollable date
      patientId,
      patientName,
      patientPhno: patientPhone,
      patientEmail,
      subdomainName: data.subdomainName, // Use data object for consistency
      clinicLocation: data.clinicLocation,
      clinicName: data.clinicName,
      clinicNumber: data.clinicNumber,
      docName: data.docName,
      cid: id,
    };

    console.log("Booking payload:", payload);

    try {
      const res = await Axiosinstance.post("/user-appointment/create", payload);
      console.log("Booking response:", res);
      alert("Appointment booked successfully!");
      navigate(`/user/${patientId}`)
    } catch (error) {
      console.error("Booking error:", error);
      alert("Failed to book appointment. Please try again.");
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleCalendarPick = (e) => {
    const selected = new Date(e.target.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((selected - today) / (1000 * 60 * 60 * 24));
    const targetWeek = Math.floor(diffDays / 7);

    if (targetWeek >= 0 && targetWeek <= MAX_WEEKS) {
      setWeekOffset(targetWeek);
      setSelectedDate(e.target.value);
      setAppointmentDate(e.target.value);
    }

    setShowCalendar(false);
  };

  return (
    <div className="w-full h-full bg-gray-50/50 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 md:p-8">

        {/* Breadcrumb / Back */}
        <div className="mb-6">
          <BackButton path={-1} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

          {/* LEFT — DOCTOR / CLINIC PROFILE */}
          <div className="md:col-span-4 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 p-6 flex flex-col gap-6 sticky top-6 h-fit">

            <div className="flex flex-col items-center text-center">
              {/* Profile Image with subtle upload hint */}
              <div
                className={`relative w-32 h-32 rounded-3xl overflow-hidden shadow-lg mb-4 group transition-all duration-300
                ${dragActive
                    ? "ring-4 ring-blue-500/50 scale-105"
                    : "ring-1 ring-gray-100 group-hover:ring-blue-200"
                  }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <img
                  src={preview || profileImg}
                  alt="Doctor"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                <label className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-300">
                  <Icon icon="mdi:camera" className="text-white w-8 h-8 drop-shadow-md" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleChange}
                  />
                </label>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {data.docName || "Doctor Name"}
              </h2>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                <Icon icon="mdi:tooth" />
                <span>Dentist</span>
              </div>

              <p className="text-gray-500 text-sm font-medium">
                {data.clinicName || "Clinic Name"}
              </p>
            </div>


            <div className="space-y-4 pt-4 border-t border-gray-100">
              <InfoRow icon="tabler:map-pin" label="Location" value={data.clinicLocation} />
              <InfoRow icon="tabler:phone" label="Contact" value={data.clinicNumber} />
              {data.dhnDr && (
                <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-xl text-sm font-medium">
                  <Icon icon="mdi:check-decagram" className="w-5 h-5 shrink-0" />
                  <span>DHN Verified Partner</span>
                </div>
              )}
            </div>

            <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl leading-relaxed">
              <p>
                Professional dental care with modern techniques and a patient-first approach. Expert in implants and cosmetic dentistry.
              </p>
            </div>
          </div>

          {/* RIGHT — BOOKING PANEL */}
          <div className="md:col-span-8 space-y-8">

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Icon icon="mdi:calendar-check" className="text-blue-600" />
                  Select Date & Time
                </h2>

                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className={`w-2 h-2 rounded-full ${selectedDate ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  {selectedDate ? new Date(selectedDate).toLocaleDateString() : 'No date selected'}
                </div>
              </div>


              <form onSubmit={handleSubmit} className="space-y-8">
                {/* DATE PICKER */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      August 2024 {/* Dynamic month would be better, but simplified for now */}
                    </label>

                    <button
                      type="button"
                      onClick={() => setShowCalendar(!showCalendar)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Icon icon="mdi:calendar-month-outline" />
                      Select via Calendar
                    </button>
                  </div>

                  {showCalendar && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                      <input
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        max={
                          new Date(Date.now() + MAX_WEEKS * 7 * 86400000)
                            .toISOString()
                            .split("T")[0]
                        }
                        onChange={handleCalendarPick}
                        className="border border-gray-200 rounded-xl px-4 py-3 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm"
                      />
                    </div>
                  )}

                  {/* Slider */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={weekOffset === 0}
                      onClick={() => setWeekOffset((prev) => Math.max(prev - 1, 0))}
                      className="w-10 h-10 border border-gray-200 rounded-xl flex justify-center items-center hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                      <Icon icon="tabler:chevron-left" />
                    </button>

                    <div
                      ref={sliderRef}
                      className="flex-1 overflow-x-auto no-scrollbar"
                    >
                      <div className="flex gap-2">
                        {generateDates.map((d) => (
                          <button
                            key={d.full}
                            type="button"
                            disabled={d.isPast || d.isDisabled}
                            onClick={() => {
                              setSelectedDate(d.full);
                              setAppointmentDate(d.full);
                            }}
                            className={`min-w-18 h-20 rounded-2xl border flex flex-col items-center justify-center transition-all duration-200
                          ${d.isPast || d.isDisabled
                                ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                                : selectedDate === d.full
                                  ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105"
                                  : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50"
                              }`}
                          >
                            <span className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${selectedDate === d.full ? 'text-blue-200' : 'text-gray-400'}`}>{d.day}</span>
                            <span className="text-xl font-bold">{d.dateNum}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={weekOffset >= MAX_WEEKS}
                      onClick={() =>
                        setWeekOffset((prev) => Math.min(prev + 1, MAX_WEEKS))
                      }
                      className="w-10 h-10 border border-gray-200 rounded-xl flex justify-center items-center hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                      <Icon icon="tabler:chevron-right" />
                    </button>
                  </div>
                </div>

                {/* TIME SLOTS */}
                <div className="space-y-6">
                  {Object.entries(timeSlots).map(([section, slots]) => (
                    <div
                      key={section}
                      className=""
                    >
                      <h3 className="text-sm font-semibold uppercase text-gray-500 tracking-wider mb-3 flex items-center gap-2">
                        {section === 'morning' && <Icon icon="mdi:weather-sunset-up" />}
                        {section === 'afternoon' && <Icon icon="mdi:weather-sunny" />}
                        {section === 'evening' && <Icon icon="mdi:weather-sunset-down" />}
                        {section === 'night' && <Icon icon="mdi:weather-night" />}
                        {section}
                      </h3>

                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {slots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => handleSlotSelect(slot)}
                            className={`py-2 px-1 rounded-lg text-sm font-medium border transition-all duration-200
                          ${selectedSlot === slot
                                ? "bg-blue-600 text-white border-blue-600 shadow-md"
                                : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600"
                              }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* CONFIRM CTA */}
                <div className="pt-6 border-t border-gray-100 sticky bottom-0 bg-white z-10">
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {selectedSlot && selectedDate ? (
                        <span>
                          Booking for <strong className="text-gray-900">{selectedDate}</strong> at <strong className="text-gray-900">{selectedSlot}</strong>
                        </span>
                      ) : (
                        <span>Select date and time to proceed</span>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={!selectedSlot || !selectedDate}
                      className="w-full sm:w-auto px-8 py-3.5 bg-gray-900 text-white font-bold rounded-2xl shadow-xl hover:bg-blue-600 hover:shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <span>Confirm Booking</span>
                      <Icon icon="tabler:arrow-right" />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
        <Icon icon={icon} width="18" />
      </div>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</p>
        <p className="text-sm font-medium text-gray-800 wrap-break-word">{value || "—"}</p>
      </div>
    </div>
  )
}

export default TargetedDentist;

import React, { useEffect, useState, useRef, useMemo } from "react";
import BackButton from "../../components/buttons/BackButton";
import { useNavigate, useParams } from "react-router-dom";
import {
  Axiosinstance,
  AxiosinstanceseconderyBackend,
} from "../../utilites/AxiosInstance.js";
import profileImg from "../../assets/profile.png";

function TargetedDentist() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [doctor, setDoctor] = useState({});

  const MAX_WEEKS = 8; // Change limit here (8 weeks = 56 days)

  const [weekOffset, setWeekOffset] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const sliderRef = useRef(null);

  // Image upload preview states
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // ────────────────────────────────────────────────
  //   Scrollable date picker states
  // ────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  // Generate next 90 days (≈ 3 months)
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
        `/clinic-registration/get/${id}`
      );
      console.log(data);
      setDoctor(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getTargetedClinicDetails();
  }, []);

  const data = {
    clinicId: doctor.cid,
    clinicLocation: doctor.address,
    clinicName: doctor.clinicName,
    clinicNumber: doctor.phno,
    dhnDr: true,
    docImg: "https://example.com/images/dentist1.jpg",
    docName: doctor.doctorName,
  };

  // Your original slot generator (unchanged)
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
    // Note: there was a typo — setPatientPhone was called twice
    setPatientName(patientData?.name || "");
    setPatientId(patientData?.id || "");
    setPatientPhone(patientData?.phno || "");
    setPatientEmail(patientData?.email || "");
  }, [patientData]);

  console.log(patientData);

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
      appointmentDate: selectedDate, // ← using the scrollable date
      patientId,
      patientName,
      patientPhno: patientPhone,
      patientEmail,
      subdomainName: doctor.subdomainName,
      clinicLocation: doctor.address,
      clinicName: doctor.clinicName,
      clinicNumber: doctor.phno,
      docName: doctor.doctorName,
      cid: id,
    };

    console.log("Booking payload:", payload);

    try {
      const res = await Axiosinstance.post("/user-appointment/create", payload);
      console.log("Booking response:", res);
      alert("Appointment booked successfully!");
      // Optional: reset form or navigate
    } catch (error) {
      console.error("Booking error:", error);
      alert("Failed to book appointment. Please try again.");
    }
  };

  // Image upload handlers
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

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let startX = 0;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;

      if (diff > 60) {
        setWeekOffset((prev) => Math.min(prev + 1, MAX_WEEKS));
      } else if (diff < -60) {
        setWeekOffset((prev) => Math.max(0, prev - 1));
      }
    };

    slider.addEventListener("touchstart", handleTouchStart);
    slider.addEventListener("touchend", handleTouchEnd);

    return () => {
      slider.removeEventListener("touchstart", handleTouchStart);
      slider.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

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
    <div className="w-screen overflow-auto h-full bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT — DOCTOR / CLINIC PROFILE */}
        <div className="md:col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col gap-5">
          <BackButton path={-1} />

          <div className="flex gap-5 items-start">
            {/* Profile Image */}
            <div
              className={`relative w-28 h-28 rounded-xl overflow-hidden border transition
            ${
              dragActive
                ? "border-blue-500"
                : "border-gray-300 hover:border-blue-400"
            }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <img
                src={preview || profileImg}
                alt="Doctor"
                className="w-full h-full object-cover"
              />

              <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 cursor-pointer transition">
                <span className="text-white text-xs font-medium">
                  Change Photo
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleChange}
                />
              </label>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {data.docName || "Doctor Name"}
              </h2>

              <p className="text-blue-700 font-medium">
                {data.clinicName || "Clinic Name"}
              </p>

              <p className="text-sm text-gray-600">
                Dental Surgeon • Implantologist
              </p>

              <p className="text-sm text-gray-500">
                {data.clinicLocation || "Chennai"}
              </p>

              <p className="text-sm text-gray-500">
                📞 {data.clinicNumber || "—"}
              </p>

              {data.dhnDr && (
                <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                  DHN Verified
                </span>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-600 leading-relaxed border-t pt-4">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit.
            Professional dental care with modern techniques and patient-first
            approach.
          </div>
        </div>

        {/* RIGHT — BOOKING PANEL */}
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            📅 Book Appointment
          </h1>

          <form onSubmit={handleSubmit} className="space-y-7">
            {/* DATE PICKER */}
            <div className="space-y-3">
              <label className="font-medium text-gray-800">
                Select Appointment Date
              </label>

              <div className="flex justify-between text-sm text-gray-600">
                <span>Week {weekOffset + 1}</span>
                <button
                  type="button"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="text-blue-600 hover:underline"
                >
                  Calendar
                </button>
              </div>

              {showCalendar && (
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  max={
                    new Date(Date.now() + MAX_WEEKS * 7 * 86400000)
                      .toISOString()
                      .split("T")[0]
                  }
                  onChange={handleCalendarPick}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-200"
                />
              )}

              {/* Slider */}
              <div className="flex items-center gap-2">
                {/* Left */}
                <button
                  type="button"
                  disabled={weekOffset === 0}
                  onClick={() => setWeekOffset((prev) => Math.max(prev - 1, 0))}
                  className="w-9 h-9 border border-gray-200 rounded-full flex justify-center items-center hover:bg-gray-100 disabled:opacity-40"
                >
                  ‹
                </button>

                {/* Dates */}
                <div
                  ref={sliderRef}
                  className="flex-1 overflow-hidden border border-gray-200 rounded-lg"
                >
                  <div className="flex justify-between px-3 py-2">
                    {generateDates.map((d) => (
                      <button
                        key={d.full}
                        type="button"
                        disabled={d.isPast || d.isDisabled}
                        onClick={() => {
                          setSelectedDate(d.full);
                          setAppointmentDate(d.full);
                        }}
                        className={`w-16 h-20 rounded-lg border text-sm flex flex-col items-center justify-center transition
                      ${
                        d.isPast || d.isDisabled
                          ? "text-gray-300 border-gray-200 cursor-not-allowed"
                          : selectedDate === d.full
                          ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                          : "border-gray-200 hover:border-blue-400 hover:bg-blue-50"
                      }`}
                      >
                        <span className="text-xs text-gray-500">{d.day}</span>
                        <span className="text-lg font-semibold">
                          {d.dateNum}
                        </span>
                        <span className="text-xs text-gray-400">{d.month}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right */}
                <button
                  type="button"
                  disabled={weekOffset >= MAX_WEEKS}
                  onClick={() =>
                    setWeekOffset((prev) => Math.min(prev + 1, MAX_WEEKS))
                  }
                  className="w-9 h-9 border border-gray-200 rounded-full flex justify-center items-center hover:bg-gray-100 disabled:opacity-40"
                >
                  ›
                </button>
              </div>

              {/* Selected Date */}
              {selectedDate && (
                <p className="text-sm text-gray-600">
                  Selected:{" "}
                  <span className="font-medium text-gray-900">
                    {new Date(selectedDate).toLocaleDateString("en-IN", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </span>
                </p>
              )}
            </div>

            {/* TIME SLOTS */}
            <div className="space-y-5">
              <label className="font-medium text-gray-800 text-lg">
                Select Time Slot
              </label>

              {Object.entries(timeSlots).map(([section, slots]) => (
                <div
                  key={section}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-5"
                >
                  <h3 className="font-semibold capitalize text-gray-800 mb-3">
                    {section}
                  </h3>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => handleSlotSelect(slot)}
                        className={`py-2.5 px-3 rounded-lg text-sm font-medium border transition
                      ${
                        selectedSlot === slot
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300"
                      }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* CONFIRM */}
            {selectedSlot && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                Selected slot: <strong>{selectedSlot}</strong>
              </div>
            )}

            <button
              type="submit"
              disabled={!selectedSlot || !selectedDate}
              className="w-full py-3.5 bg-blue-600 text-white font-semibold text-lg rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              Confirm Appointment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TargetedDentist;

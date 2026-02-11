import React, { useState, useMemo, useRef } from "react";
import { Icon } from "@iconify/react";
import { Axiosinstance } from "../utilites/AxiosInstance";

const RescheduleModal = ({ appointment, onClose, onSuccess }) => {
    const MAX_WEEKS = 4;
    const [weekOffset, setWeekOffset] = useState(0);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(false);
    const sliderRef = useRef(null);

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

    const generateSlots = (startHour, startMin, startPeriod, endHour, endMin, endPeriod) => {
        const slots = [];
        let currentHour = startHour;
        let currentMin = startMin;
        let currentPeriod = startPeriod;

        while (true) {
            let displayHour = currentHour;
            if (currentHour === 12) displayHour = 12;
            else if (currentHour > 12) displayHour = currentHour - 12;

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

            const isPastEnd =
                (currentPeriod === endPeriod && currentHour > endHour) ||
                (currentPeriod === endPeriod && currentHour === endHour && currentMin >= endMin) ||
                (currentPeriod !== endPeriod &&
                    ((currentPeriod === "PM" && endPeriod === "AM") ||
                        (currentPeriod === "AM" && endPeriod === "PM" && currentHour >= endHour)));

            if (isPastEnd) break;
        }
        return slots;
    };

    const periods = [
        { name: "morning", start: { hour: 9, min: 0, period: "AM" }, end: { hour: 12, min: 0, period: "PM" } },
        { name: "afternoon", start: { hour: 12, min: 0, period: "PM" }, end: { hour: 4, min: 0, period: "PM" } },
        { name: "evening", start: { hour: 4, min: 0, period: "PM" }, end: { hour: 7, min: 0, period: "PM" } },
        { name: "night", start: { hour: 7, min: 0, period: "PM" }, end: { hour: 9, min: 0, period: "PM" } },
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

    const handleConfirm = async () => {
        if (!selectedDate || !selectedSlot) return;

        setLoading(true);
        try {
            const id = appointment._id || appointment.id;
            // Correct endpoint: /user-appointment/:id/reschedule
            // Based on route: userAppointmentRoute.patch("/:id/reschedule", rescheduleAppointment);
            // Prefix is usually /user-appointment (implied from typical usage, need to verify main server.js or usage)
            // Checking UserAppointmentDetails usage: /user-appointment/get-appointment-by-patient-id
            // So prefix is /user-appointment

            const res = await Axiosinstance.patch(`/user-appointment/${id}/reschedule`, {
                appointmentDate: selectedDate,
                selectedSlot: selectedSlot
            });

            if (res.status === 200) {
                onSuccess(res.data.data);
                onClose();
            }
        } catch (error) {
            console.error("Reschedule failed", error);
            alert("Failed to reschedule. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">

                {/* Header */}
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Reschedule Appointment</h2>
                        <p className="text-sm text-gray-500">Pick a new date and time for your visit</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <Icon icon="mdi:close" width="24" className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Date Slider */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <button
                                type="button"
                                disabled={weekOffset === 0}
                                onClick={() => setWeekOffset((prev) => Math.max(prev - 1, 0))}
                                className="w-10 h-10 border border-gray-200 rounded-xl flex justify-center items-center hover:bg-gray-50 disabled:opacity-30 transition-colors"
                            >
                                <Icon icon="tabler:chevron-left" />
                            </button>

                            <div ref={sliderRef} className="flex-1 overflow-x-auto no-scrollbar">
                                <div className="flex gap-2">
                                    {generateDates.map((d) => (
                                        <button
                                            key={d.full}
                                            type="button"
                                            disabled={d.isPast || d.isDisabled}
                                            onClick={() => setSelectedDate(d.full)}
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
                                onClick={() => setWeekOffset((prev) => Math.min(prev + 1, MAX_WEEKS))}
                                className="w-10 h-10 border border-gray-200 rounded-xl flex justify-center items-center hover:bg-gray-50 disabled:opacity-30 transition-colors"
                            >
                                <Icon icon="tabler:chevron-right" />
                            </button>
                        </div>
                    </div>

                    {/* Time Slots */}
                    <div className="space-y-6">
                        {Object.entries(timeSlots).map(([section, slots]) => (
                            <div key={section}>
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
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`py-2 px-1 rounded-lg text-xs md:text-sm font-medium border transition-all duration-200
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
                </div>

                {/* Footer */}
                <div className="p-6 border-t bg-gray-50 rounded-b-3xl">
                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            {selectedDate && selectedSlot ? (
                                <span className="text-gray-700">
                                    New: <span className="font-bold text-gray-900">{selectedDate}</span> at <span className="font-bold text-gray-900">{selectedSlot}</span>
                                </span>
                            ) : (
                                <span className="text-gray-400">Select date & time</span>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button onClick={onClose} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={loading || !selectedDate || !selectedSlot}
                                className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2"
                            >
                                {loading ? <Icon icon="svg-spinners:ring-resize" /> : <Icon icon="mdi:check" />}
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RescheduleModal;

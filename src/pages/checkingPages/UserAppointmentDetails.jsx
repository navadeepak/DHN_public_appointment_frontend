import { Calendar, Badge } from "antd";
import BackButton from "../../components/buttons/BackButton";

const UserAppointmentDetails = () => {
  const appointments = [
    {
      date: "2026-01-08",
      type: "success",
      content: "Dentist Appointment - Sai Dental Clinic",
    },
    {
      date: "2026-01-10",
      type: "warning",
      content: "Follow-up Checkup Reminder",
    },
    // Add more...
  ];

  const appointmentsByDate = appointments.reduce((acc, appt) => {
    const dateKey = appt.date; // Assuming date is in format like '2026-01-08' or just day number; adjust as needed
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push({
      type: appt.type || "default", // e.g., 'success', 'warning', 'error'
      content: appt.content || "Appointment Details",
    });
    return acc;
  }, {});

  const getMonthData = (value) => {
    // Count total appointments in the month from props data
    const monthKey = value.format("YYYY-MM");
    const monthCount = appointments.filter((appt) => {
      const apptMonth = appt.date
        ? new Date(appt.date).toISOString().slice(0, 7)
        : null;
      return apptMonth === monthKey;
    }).length;
    return monthCount > 0 ? monthCount : null;
  };

  const getListData = (value) => {
    const dateKey = value.format("YYYY-MM-DD"); // Adjust format to match your date prop format
    return appointmentsByDate[dateKey] || [];
  };

  const monthCellRender = (value) => {
    const num = getMonthData(value);
    return num ? (
      <div className="notes-month">
        <section>{num}</section>
        <span>Total Appointments</span>
      </div>
    ) : null;
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul className="events">
        {listData.map((item, index) => (
          <li key={index}>
            <Badge status={item.type} text={item.content} />
          </li>
        ))}
      </ul>
    );
  };

  const cellRender = (current, info) => {
    if (info.type === "date") {
      return dateCellRender(current);
    }
    if (info.type === "month") {
      return monthCellRender(current);
    }
    return info.originNode;
  };

  return (
    <div className=" p-6 w-full h-full bg-white">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 flex flex-row gap-2 items-center">
        <BackButton /> Your Appointment Details
      </h2>
      <div className="overflow-auto max-h-[80vh]">
        <Calendar cellRender={cellRender} />
      </div>
    </div>
  );
};

export default UserAppointmentDetails;

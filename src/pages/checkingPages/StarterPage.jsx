import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

function StarterPage() {
  const navigate = useNavigate();
  return (
    <div className="bg-white/80 w-full h-full p-10 flex flex-col items-center justify-center gap-20 max-sm:gap-10">
      <div className="flex flex-col w-full items-center justify-center">
        <h1 className="font-bold text-8xl max-lg:text-6xl max-md:text-4xl max-sm:text-6xl text-transparent bg-linear-to-br from-teal-400 to-blue-400 bg-clip-text">
          Dental Health Net
        </h1>
        <p className="font-medium text-2xl text-zinc-500 max-md:text-xl max-sm:text-sm max-sm:text-left max-sm:w-full">
          Book Your Dental Appointment Easily
        </p>
      </div>
      <button onClick={()=>navigate("/doctors")} className="flex flex-row gap-2 bg-gray-500 hover:bg-blue-500 duration-200 ease-in-out cursor-pointer hover:scale-105 text-white text-2xl max-sm:text-sm max-sm:font-bold max-sm:px-5 max-sm:py-3 p-7 py-5 rounded-full">
        Book a Appointment{" "}
        <span>
          <Icon icon="tabler:arrow-narrow-right" className="text-[35px] max-sm:text-xl" />
        </span>
      </button>
      <p className="font-bold max-sm:text-sm text-transparent bg-linear-to-br from-gray-500 to-gray-500 bg-clip-text not-italic text-center ">
        Welcome to{" "}
        <span className="cursor-pointer text-blue-500">Dental Health Net</span>,
        your trusted platform for quick, easy, and reliable dental appointment
        booking. <br />
        We connect patients with certified dental clinics to ensure quality oral
        care without long waiting times.
      </p>
    </div>
  );
}

export default StarterPage;

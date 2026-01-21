import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

function NextButton({ path }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(path)}
      className="bg-teal-500 text-white hover:bg-white hover:text-teal-500 rounded-full ease-in-out duration-200 p-2 cursor-pointer"
    >
      <Icon icon="tabler:arrow-narrow-right" className="text-6xl max-lg:text-3xl" />
    </button>
  );
}

export default NextButton;

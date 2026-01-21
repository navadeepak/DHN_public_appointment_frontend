import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

function BackButton({ path }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(path)}
      className="bg-gray-100 text-gray-500 rounded ease-in-out duration-200 flex flex-row items-center cursor-pointer"
    >
      <Icon icon="ic:twotone-keyboard-arrow-left" className="text-4xl" /> 
      <p className="text-xl font-semibold pr-3">Back</p>
    </button>
  );
}

export default BackButton;

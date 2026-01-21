import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
function Navbar() {
  return (
    <div className="w-full h-[8vh] flex flex-row items-center justify-between p-5">
      <h1 className="font-bold text-2xl text-white max-lg:hidden">Dental Health Net</h1>
      <h1 className="font-bold text-2xl text-white hidden max-lg:flex">DHN</h1>
      <button className="h-full w-fit flex flex-row items-center gap-5 rounded-md p-2 text-white">
        <p className="text-xl cursor-default ">
          Hello, <span className="font-bold">Name</span>
        </p>
        <button
          onClick={() => window.close()}
          className="rounded-full bg-white text-teal-500 p-2 hover:text-red-500 cursor-pointer"
        >
          <Icon icon="tabler:logout" width="30" height="30" />{" "}
        </button>
      </button>
    </div>
  );
}

export default Navbar;

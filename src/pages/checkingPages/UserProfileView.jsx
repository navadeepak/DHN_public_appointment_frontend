import React from "react";
import { Icon } from "@iconify/react";
import { useParams } from "react-router-dom";
import { useState } from "react";
import {Axiosinstance} from "../../utilites/AxiosInstance.js";
import { useEffect } from "react";

function UserProfileView({
  setUserProfileEditMode,
  userProfileEditMode,
  setUserProfileViewMode,
  userProfileViewMode,
}) {
  const { id } = useParams();
  const [userData, setUserData] = useState({});
  const handleGetUserData = async () => {
    try {
      const response = await Axiosinstance.get(`/user/get/${id}`);
      console.log(response.data.data);
      setUserData(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    handleGetUserData();
  }, [id]);
  return (
    <div className="flex flex-col p-4">
      <div className="flex flex-row justify-between">
        <button
          className="cursor-pointer flex flex-row gap-2 bg-gray-300 p-3 pl-1 py-1 rounded font-bold text-gray-800"
          onClick={() => {
            setUserProfileEditMode(false);
            setUserProfileViewMode(false);
          }}
        >
          <Icon icon="tabler:chevron-left" width="24" height="24" />
          Back
        </button>
        <button
          className="cursor-pointer flex flex-row gap-2 bg-gray-300 p-3 pr-1 py-1 rounded font-bold text-gray-800"
          onClick={() => {
            setUserProfileEditMode(!userProfileEditMode);
            setUserProfileViewMode(!userProfileViewMode);
          }}
        >
          Edit
          <Icon icon="tabler:chevron-right" width="24" height="24" />
        </button>
      </div>
      <div>
        {[
          { lable: "Name", data: userData?.name },
          { lable: "Age", data: userData?.age },
          { lable: "Gender", data: userData?.gender },
          { lable: "Address", data: userData?.address },
          { lable: "Email", data: userData?.email },
          { lable: "Phone no", data: userData?.phno },
          { lable: "DHN Dr", data: userData?.isVerified },
        ].map(
          (data, index) =>
            data.data && (
              <div key={index} className="flex flex-row gap-2">
                <label className="">{data.lable}:</label>
                {data.lable === "DHN Dr" ? (
                  <p className="text-green-500 font-bold">
                    {data.data ? "DHN Dr" : "Non DHN Dr"}
                  </p>
                ) : (
                  <p className="text-grey-500">{data.data}</p>
                )}
              </div>
            )
        )}
      </div>
    </div>
  );
}

export default UserProfileView;

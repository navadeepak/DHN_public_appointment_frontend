import React, { useState, useMemo } from "react";
import NextButton from "../../components/buttons/NextButton";
import { Icon } from "@iconify/react";
import doctors from "../../sample_json_data/doctors_and_clinic_data.json";
import profile from "../../assets/profile.png";
import BackButton from "../../components/buttons/BackButton";

function Doctors() {
  const [selectedLocation, setSelectedLocation] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const uniqueLocations = useMemo(() => {
    return [...new Set(doctors.map((d) => d.clinicLocation))].sort();
  }, []);

  const filteredDoctors = useMemo(() => {
    let filtered = doctors;
    if (selectedLocation) {
      filtered = filtered.filter((d) => d.clinicLocation === selectedLocation);
    } else {
      filtered = [];
    }
    if (searchTerm) {
      filtered = filtered.filter(
        (d) =>
          d.docName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.clinicName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [selectedLocation, searchTerm]);

  return (
    <div className="h-full w-full flex flex-row overflow-auto">
      <div className="h-full w-full flex flex-col">
        <div className="w-full h-full bg-white p-5 flex flex-col gap-5">
          <div className="flex flex-row items-center gap-3 w-full">
            <BackButton path={-1} />
            <h1 className="font-bold text-4xl text-white">Doctors</h1>
          </div>
          <div className="flex flex-row items-center border-2 border-gray-300 rounded pl-2">
            <Icon icon="tabler:map-pin" className="text-gray-400 h-8 w-8" />
            <input
              list="locationList"
              type="text"
              placeholder="Search location..."
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="h-10 w-full outline-0 pl-2 text-lg"
            />
          </div>
          <datalist id="locationList">
            {uniqueLocations.map((loc) => (
              <option key={loc} value={loc} />
            ))}
          </datalist>
          <div className="flex flex-row items-center border-2 border-gray-300 rounded pl-2">
            <Icon icon="tabler:search" className="text-gray-400 h-8 w-8" />
            <input
              type="text"
              placeholder="Search dentists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full outline-0 pl-2 text-lg"
            />
          </div>
          <div className="w-full h-[70vh] overflow-auto flex flex-col gap-5">
            {filteredDoctors.length === 0 ? (
              <p className="text-gray-500 text-center py-10">
                {selectedLocation
                  ? "No dentists found matching the search."
                  : "Please select a location to view dentists."}
              </p>
            ) : (
              filteredDoctors.map((data, index) => (
                <div
                  key={index}
                  className="flex flex-row max-md:flex-col max-md:gap-2 justify-between shadow-md border border-gray-200 rounded-md p-4 w-full text-nowrap max-lg:text-wrap"
                >
                  <div className="flex flex-row max-md:flex-col gap-3">
                    <div className="">
                      <img
                        className="ring-2 ring-blue-500 h-28 w-28 rounded-md object-cover"
                        src={profile}
                        alt={data.docName}
                      />
                    </div>
                    <div className="flex flex-col">
                      <h1 className="font-semibold text-lg">{data.docName}</h1>
                      <p className="font-bold">{data.clinicName}</p>
                      <p className="text-sm text-gray-600">
                        {data.clinicLocation}
                      </p>
                      <p className="text-sm text-gray-600">
                        {data.clinicNumber}
                      </p>
                      <p className="text-sm">
                        DHN Doctor: {data.dhnDr ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                  <div>
                    {data.dhnDr && (
                      <button className="cursor-pointer bg-cyan-500 hover:bg-cyan-100 hover:text-cyan-500 ease-in-out duration-200 shadow-md font-bold text-white p-2 rounded-md">
                        Book Clinic Visit
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Doctors;

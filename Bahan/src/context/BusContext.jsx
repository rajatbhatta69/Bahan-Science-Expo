import { createContext, useState, useContext } from "react";

const BusContext = createContext();

export const BusProvider = ({ children }) => {

  const [buses, setBuses] = useState([
    {
      id: 1,
      name: "Sajha Yatayat - Bus A",
      lat: 27.7007,
      lng: 85.3001,
      eta: "12 mins",
      status: "On Time",
    },
    {
      id: 2,
      name: "Sajha Yatayat - Bus B",
      lat: 27.7172,
      lng: 85.3240,
      eta: "5 mins",
      status: "Delayed",
    }
  ]);

  const updateBusLocation = (id, newLat, newLng) => {
    setBuses((prevBuses) =>
      prevBuses.map((bus) =>
        bus.id === id ? { ...bus, lat: newLat, lng: newLng } : bus
      )
    );
  };

  return (
    <BusContext.Provider value={{ buses, updateBusLocation }}>
      {children}
    </BusContext.Provider>
  );
};

export const useBuses = () => useContext(BusContext);
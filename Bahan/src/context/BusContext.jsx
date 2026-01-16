import { createContext, useState, useEffect, useContext } from "react";

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

  // --- START OF MOCK DATA SECTION ---
  // When you get real data, you will replace this useEffect with your API call
  useEffect(() => {
    const simulator = setInterval(() => {
      setBuses((currentBuses) =>
        currentBuses.map((bus) => ({
          ...bus,
          // Moves the bus by a small random amount (approx 5-10 meters)
          lat: bus.lat + (Math.random() - 0.5) * 0.0004,
          lng: bus.lng + (Math.random() - 0.5) * 0.0004,
        }))
      );
    }, 3000); // 3-second heartbeat

    return () => clearInterval(simulator);
  }, []);
  // --- END OF MOCK DATA SECTION ---

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
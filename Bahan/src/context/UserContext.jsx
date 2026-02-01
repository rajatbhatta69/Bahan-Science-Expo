import React, { createContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onValue, update } from "firebase/database";
import { gamificationEngine } from '../utils/gamificationEngine';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState({
        uid: "user_demo_01", // For the Expo, we can hardcode a demo ID
        name: "Rajat",
        points: 0,
        reports: 12,
        rank: "Elite Scout"
    });

    // Function to handle the point increase logic
    const awardPoints = (baseAmount) => {
        const actualPoints = gamificationEngine.getPointValue(baseAmount);

        setUser(prev => {
            const newPoints = prev.points + actualPoints;
            const newReports = prev.reports + 1;
            const newRank = gamificationEngine.getRank(newPoints);

            return {
                ...prev,
                points: newPoints,
                reports: newReports,
                rank: newRank.name // Rank updates automatically!
            };
        });
    };

    return (
        <UserContext.Provider value={{ user, awardPoints }}>
            {children}
        </UserContext.Provider>
    );
};
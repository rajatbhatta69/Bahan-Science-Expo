import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BusProvider } from './context/BusContext';
import { UserProvider } from './context/UserContext'; 
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import MapDisplay from './components/MapDisplay';
import DriverPortal from './pages/DriverPortal';
import OperatorDashboard from './pages/OperatorDashboard'; 
import './App.css';

function App() {
  return (
    <Router>
      <UserProvider>
        <BusProvider>
          <Routes>
            {/* 1. DRIVER PORTAL */}
            <Route path="/driver" element={<DriverPortal />} />

            {/* 2. OPERATOR DASHBOARD */}
            <Route path="/operator" element={<OperatorDashboard />} />

            {/* 3. PASSENGER APP (Main Interface) */}
            <Route path="/" element={
              <div className="relative h-screen w-full bg-[#050505] overflow-hidden lg:flex">
                
                {/* SIDEBAR: Passenger Menu */}
                {/* We removed the aside wrapper that had the CrowdsourcingModule */}
                <Sidebar />

                {/* MAIN CONTENT AREA */}
                <main className="flex-1 relative flex flex-col h-full w-full">
                  {/* Navbar now handles the User Identity and Reporting Hub */}
                  <div className="hidden lg:block">
                    <Navbar />
                  </div>
                  
                  {/* MAP VIEW */}
                  <div className="flex-1 relative bg-[#0a0a0a]">
                    <MapDisplay />
                  </div>
                </main>

              </div>
            } />
          </Routes>
        </BusProvider>
      </UserProvider>
    </Router>
  );
}

export default App;
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BusProvider } from './context/BusContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import MapDisplay from './components/MapDisplay';
import DriverPortal from './pages/DriverPortal';
import './App.css';
import { Analytics } from "@vercel/analytics/react"


function App() {
  return (
    <Router>
      <BusProvider>
        <Routes>
          {/* DRIVER ROUTE */}
          <Route path="/driver" element={<DriverPortal />} />

          {/* MAIN APP ROUTE */}
          <Route path="/" element={
            /* Changed from 'flex' to 'relative block' on mobile 
               so the sidebar can float over the map.
            */
            <div className="relative h-screen w-full bg-slate-950 overflow-hidden lg:flex">

              {/* Sidebar: Now handles its own positioning via Tailwind */}
              <Sidebar />

              <main className="flex-1 relative flex flex-col h-full w-full">
                {/* Navbar: Usually hidden on mobile to save space, visible on LG screens */}
                <div className="hidden lg:block">
                  <Navbar />
                </div>

                {/* Map Container: Full screen on mobile */}
                <div className="flex-1 bg-slate-900 relative">
                  <MapDisplay />
                </div>
              </main>
            </div>
          } />
        </Routes>
      </BusProvider>
    </Router>
  );
}

export default App;
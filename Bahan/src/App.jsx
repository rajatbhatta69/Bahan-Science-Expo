import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BusProvider } from './context/BusContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import MapDisplay from './components/MapDisplay';
import DriverPortal from './pages/DriverPortal'; // Import your new page
import './App.css';

function App() {
  return (
    <Router>
      <BusProvider>
        <Routes>
          {/* DRIVER ROUTE: A clean, simple page for the phone */}
          <Route path="/driver" element={<DriverPortal />} />

          {/* MAIN APP ROUTE: The full dashboard for users */}
          <Route path="/" element={
            <div className="flex h-screen w-full bg-slate-950 overflow-hidden">
              <Sidebar />
              <main className="flex-1 relative flex flex-col">
                <Navbar />
                <div className="flex-1 bg-slate-900 flex items-center justify-center">
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
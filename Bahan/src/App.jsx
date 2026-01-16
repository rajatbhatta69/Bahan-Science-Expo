import { useState } from 'react'
import { BusProvider } from './context/BusContext'
import './App.css'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import MapDisplay from './components/MapDisplay'
 

function App() {

  return (
    <>
      <BusProvider>
        <div className="flex h-screen w-full bg-slate-950 overflow-hidden">
          {/* Sidebar stays on the left */}
          <Sidebar />

          {/* This main area is where the Map will go next! */}
          <main className="flex-1 relative flex flex-col">
            <Navbar/>

            <div className="flex-1 bg-slate-900 flex items-center justify-center">
              <MapDisplay/>
            </div>
          </main>
        </div>
      </BusProvider>
    </>
  )
}

export default App

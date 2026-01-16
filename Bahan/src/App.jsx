import { useState } from 'react'
import { BusProvider } from './context/BusContext'
import './App.css'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
 

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
              <p className="text-slate-500 italic">The Map will be initialized here...</p>
            </div>
          </main>
        </div>
      </BusProvider>
    </>
  )
}

export default App

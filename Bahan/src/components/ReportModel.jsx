const ReportModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const reportOptions = [
    { icon: '🚦', label: 'Heavy Traffic', color: 'text-amber-500' },
    { icon: '🚐', label: 'Bus Full', color: 'text-blue-500' },
    { icon: '🚧', label: 'Road Block', color: 'text-red-500' },
    { icon: '⏳', label: 'Long Wait', color: 'text-emerald-500' },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#121212] border border-zinc-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <div>
            <h3 className="text-xl font-bold text-white">Report Delay</h3>
            <p className="text-xs text-zinc-500 mt-1">Help others by sharing live updates</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors text-2xl">×</button>
        </div>

        {/* Content */}
        <div className="p-6">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 block">Select Issue</label>
          <div className="grid grid-cols-2 gap-3">
            {reportOptions.map((opt) => (
              <button 
                key={opt.label}
                className="flex flex-col items-center justify-center p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-[#C05621] hover:bg-[#C05621]/5 transition-all group"
              >
                <span className="text-2xl mb-2">{opt.icon}</span>
                <span className="text-sm font-medium text-zinc-300 group-hover:text-white">{opt.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-6">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 block">Optional Note</label>
            <textarea 
              placeholder="e.g. Traffic is stuck near Balkumari..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 focus:outline-none focus:border-[#C05621] h-24 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-zinc-900/50 border-t border-zinc-800">
          <button 
            onClick={() => {
              alert("Report submitted! You've earned 10 Bahan Points.");
              onClose();
            }}
            className="w-full bg-[#C05621] hover:bg-[#a3491c] text-white py-3 rounded-xl font-bold transition-all"
          >
            SUBMIT LIVE REPORT
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
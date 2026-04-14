export default function ManagerPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[100px] mix-blend-multiply animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[100px] mix-blend-multiply delay-500 animate-pulse" />
      
      <div className="text-center bg-white/70 backdrop-blur-xl border border-white p-8 sm:p-12 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-lg w-full relative z-10 animate-fade-in mx-4 sm:mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] sm:rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-xl shadow-teal-500/30 mb-6 sm:mb-8 transform hover:scale-110 transition-transform duration-300">
          <span className="text-3xl sm:text-4xl">👷</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2 sm:mb-3">Manager Dashboard</h1>
        <p className="text-slate-500 font-medium text-sm sm:text-base">Coming soon — allocating inventory and managing staff workflows will be available in the next update.</p>
        
        <div className="mt-8 sm:mt-10 inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-teal-600 bg-teal-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-teal-100">
          <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-teal-500"></span>
          </span>
          Under Construction
        </div>
      </div>
    </div>
  );
}

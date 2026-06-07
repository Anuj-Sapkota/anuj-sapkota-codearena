'use client'
export default function PaymentFailure() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-red-50">
      <h1 className="text-4xl font-black text-red-600 uppercase italic">Access Denied</h1>
      <p className="text-slate-500 mt-4 uppercase tracking-widest text-xs font-bold">
        The transaction was terminated by the gateway.
      </p>
      <button 
        onClick={() => window.location.href = '/'} 
        className="mt-8 px-8 py-3 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full"
      >
        Return to Terminal
      </button>
    </div>
  );
}
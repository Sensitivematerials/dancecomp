export default function Offline() {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center px-8"
      style={{ background: "var(--black)" }}>
      <div className="text-5xl mb-6">📡</div>
      <h1 className="font-display text-4xl tracking-widest mb-3">
        Dance<span className="text-pink-500">Comp</span>
      </h1>
      <p className="text-gray-400 text-base mb-2">You're offline right now.</p>
      <p className="text-gray-600 text-sm">
        Connect to Wi-Fi or mobile data to sync with the competition.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-8 px-6 py-3 rounded-xl border border-pink-400/30 bg-pink-400/10 text-pink-400 text-sm font-semibold"
      >
        Try Again
      </button>
    </div>
  );
}

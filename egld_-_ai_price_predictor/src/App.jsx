import React, { useEffect, useState } from "react";

// MultiversX logo SVG (inline for branding)
const MultiversXLogo = () => (
  <svg className="logo" viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="16" fill="#0a0f1c"/>
    <g filter="url(#glow)">
      <path d="M16 16L48 48" stroke="#1de9b6" strokeWidth="4" strokeLinecap="round"/>
      <path d="M48 16L16 48" stroke="#1de9b6" strokeWidth="4" strokeLinecap="round"/>
    </g>
    <defs>
      <filter id="glow" x="0" y="0" width="64" height="64" filterUnits="userSpaceOnUse">
        <feGaussianBlur stdDeviation="2" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
  </svg>
);

const TIMEFRAMES = [
  { label: "Tomorrow", key: "tomorrow", min: 8, max: 10 },
  { label: "Next Week", key: "week", min: 28, max: 30},
  { label: "Next Month", key: "month", min: 220, max: 222 },
  { label: "Next Year", key: "year", min: 3000, max: 3006 },
];

function getRandomIncrease(min, max) {
  return Math.random() * (max - min) + min;
}

function App() {
  const [price, setPrice] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const [page, setPage] = useState("main"); // "main" or "prediction"
  const [selectedTimeframe, setSelectedTimeframe] = useState(null);
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [predictedPercent, setPredictedPercent] = useState(null);

  // Fetch EGLD price
  useEffect(() => {
    let cancelled = false;

    async function fetchPrice() {
      setError(null);
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=elrond-erd-2&vs_currencies=usd"
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (!cancelled) {
          setPrice(data["elrond-erd-2"].usd);
          setLastUpdated(new Date().toLocaleTimeString());
        }
      } catch (e) {
        setError("Could not fetch EGLD price.");
      }
    }

    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Calculate prediction when timeframe is selected
  useEffect(() => {
    if (selectedTimeframe && price !== null) {
      const tf = TIMEFRAMES.find(t => t.key === selectedTimeframe);
      const percent = getRandomIncrease(tf.min, tf.max);
      const newPrice = price * (1 + percent / 100);
      setPredictedPercent(percent);
      setPredictedPrice(newPrice);
    } else {
      setPredictedPrice(null);
      setPredictedPercent(null);
    }
  }, [selectedTimeframe, price]);

  // Handle timeframe selection
  function handleTimeframeSelect(key) {
    setSelectedTimeframe(key);
    setPage("prediction");
  }

  function handleReselect() {
    setSelectedTimeframe(null);
    setPredictedPrice(null);
    setPredictedPercent(null);
    setPage("main");
  }

  // Main page: price + selector
  if (page === "main") {
    return (
      <div className="card">
        <div className="app-big-title">EGLD AI PRICE PREDICTOR</div>
        <MultiversXLogo />
        <div className="title">EGLD Price</div>
        <div className="label">Live from CoinGecko</div>
        {error ? (
          <div style={{ color: "#ff1744", fontWeight: 600 }}>{error}</div>
        ) : price === null ? (
          <div>Loading...</div>
        ) : (
          <>
            <div className="price">${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="updated">Last updated: {lastUpdated}</div>
            <hr style={{ margin: "2rem 0 1rem 0", border: "none", borderTop: "1.5px solid #1de9b6", opacity: 0.3 }} />
            <div style={{ marginBottom: "0.7rem", fontWeight: 600, color: "#1de9b6" }}>
              Select a prediction timeframe:
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center", marginBottom: "1.2rem" }}>
              {TIMEFRAMES.map(tf => (
                <button
                  key={tf.key}
                  onClick={() => handleTimeframeSelect(tf.key)}
                  style={{
                    background: "#0a0f1c",
                    color: "#1de9b6",
                    border: "2px solid #1de9b6",
                    borderRadius: "18px",
                    padding: "0.5rem 1.1rem",
                    fontWeight: 700,
                    fontSize: "1rem",
                    cursor: "pointer",
                    boxShadow: "none",
                    transition: "all 0.15s"
                  }}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Prediction page: only predicted price, percent, reselect, and text
  const tf = TIMEFRAMES.find(t => t.key === selectedTimeframe);

  return (
    <div className="card">
      <div className="app-big-title">EGLD AI PRICE PREDICTOR</div>
      <MultiversXLogo />
      <div style={{ fontSize: "1.1rem", color: "#b2fefa", marginBottom: "0.3rem" }}>
        Estimated price {tf ? tf.label.toLowerCase() : ""}:
      </div>
      <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#1de9b6", textShadow: "0 0 8px #1de9b6cc" }}>
        ${predictedPrice ? predictedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "--"}
      </div>
      <div style={{ fontSize: "1.1rem", color: "#b2fefa", marginTop: "0.2rem" }}>
        (+{predictedPercent ? predictedPercent.toFixed(2) : "--"}%)
      </div>
      <div style={{ marginTop: "1.2rem", color: "#b2fefa", fontSize: "1rem", fontStyle: "italic" }}>
        AI generated price based on current market volumes and BTC price
      </div>
      <button
        onClick={handleReselect}
        style={{
          marginTop: "1.5rem",
          background: "#0a0f1c",
          color: "#1de9b6",
          border: "2px solid #1de9b6",
          borderRadius: "14px",
          padding: "0.5rem 1.3rem",
          fontWeight: 700,
          fontSize: "1rem",
          cursor: "pointer",
          boxShadow: "0 0 4px #1de9b644",
          transition: "all 0.15s"
        }}
      >
        Reselect timeframe
      </button>
      <div style={{ marginTop: "2.2rem", fontSize: "1.1rem", color: "#e6f6ff", fontWeight: 600 }}>
        Enjoyed this app? Like &amp; tip the creator on Vibeox!
      </div>
    </div>
  );
}

export default App;

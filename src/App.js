import React, { useState } from "react";

function App() {
  const initialState = {
    Clay: "",
    Silt: "",
    LL: "",
    PL: "",
    PI: "",
    DryDensity: "",
    SiO2: "",
    Al2O3: "",
    CaOlime: "",
    Mixing: 1,
    CuringDays: "",
    WaterContent: ""
  };

  const [inputs, setInputs] = useState(initialState);
  const [ucs, setUcs] = useState(null);
  const [loading, setLoading] = useState(false);

  // =====================
  // Input Change
  // =====================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setInputs((prev) => {
      const updated = { ...prev, [name]: value };

      // auto PI
      if (name === "LL" || name === "PL") {
        const ll = parseFloat(updated.LL);
        const pl = parseFloat(updated.PL);
        updated.PI = !isNaN(ll) && !isNaN(pl) ? ll - pl : "";
      }

      // limit Mixing to 12
      if (name === "Mixing") {
        const mix = parseFloat(value);
        updated.Mixing = !isNaN(mix) ? Math.min(mix, 12) : "";
      }

      return updated;
    });
  };

  // =====================
  // Predict UCS
  // =====================
  const predictUCS = async () => {
    if (parseFloat(inputs.Clay) + parseFloat(inputs.Silt) < 50) {
      alert("Clay + Silt must be ≥ 50%");
      return;
    }

    // check empty inputs
    for (let key in inputs) {
      if (inputs[key] === "" && key !== "PI") {
        alert(`${key} is required`);
        return;
      }
    }

    setLoading(true);

    try {
      const numericInputs = {};
      Object.keys(inputs).forEach((key) => {
        numericInputs[key] = parseFloat(inputs[key]);
      });

      // ✅ Call Replit backend
      const res = await fetch(
        "https://ucs-backend-gullmaryam00.repl.co/predict",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(numericInputs)
        }
      );

      const data = await res.json();

      if (data.ucs !== undefined) {
        setUcs(data.ucs.toFixed(2));
      } else {
        alert("Invalid response from backend");
      }
    } catch (e) {
      alert("Backend not reachable");
    } finally {
      setLoading(false);
    }
  };

  // =====================
  // Reset
  // =====================
  const handleReset = () => {
    setInputs(initialState);
    setUcs(null);
  };

  // =====================
  // UI
  // =====================
  return (
    <div style={styles.container}>
      <h1 style={styles.header}>UCS PREDICTOR</h1>

      <div style={styles.card}>
        <h2>Material Properties</h2>
        <div style={styles.grid}>
          {["Clay", "Silt", "LL", "PL", "PI", "DryDensity"].map((key) => (
            <div key={key}>
              <label>{key}</label>
              <input
                type="number"
                name={key}
                value={inputs[key]}
                onChange={handleChange}
                disabled={key === "PI"}
                style={styles.input}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={styles.card}>
        <h2>Chemical Properties</h2>
        <div style={styles.grid}>
          {["SiO2", "Al2O3", "CaOlime"].map((key) => (
            <div key={key}>
              <label>{key}</label>
              <input
                type="number"
                name={key}
                value={inputs[key]}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={styles.card}>
        <h2>Process Parameters</h2>
        <div style={styles.grid}>
          {["Mixing", "CuringDays", "WaterContent"].map((key) => (
            <div key={key}>
              <label>{key}</label>
              <input
                type="number"
                name={key}
                value={inputs[key]}
                onChange={handleChange}
                max={key === "Mixing" ? 12 : undefined}
                step="0.01"
                style={styles.input}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={styles.buttonRow}>
        <button onClick={predictUCS} disabled={loading}>
          {loading ? "Predicting..." : "Predict UCS"}
        </button>
        <button onClick={handleReset}>Reset</button>
      </div>

      {ucs && (
        <div style={styles.resultCard}>
          <h2>Predicted UCS</h2>
          <p>{ucs} MPa</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: 20, fontFamily: "Arial" },
  header: { textAlign: "center" },
  card: { background: "#f7f7f7", padding: 15, marginBottom: 20 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
    gap: 10
  },
  input: { padding: 6 },
  buttonRow: { display: "flex", gap: 10, justifyContent: "center" },
  resultCard: { textAlign: "center", border: "1px solid #ccc", padding: 15 }
};

export default App;
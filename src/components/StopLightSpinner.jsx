import React, { useState, useRef } from "react";
import styles from "./StoplightSpinner.module.css";

export default function StoplightSpinner() {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null); // 'green' | 'yellow' | 'red'
  const [description, setDescription] = useState(null); // 'green' | 'yellow' | 'red'
  const [selectedFood, setSelectedFood] = useState(null);
  const wheelRef = useRef(null);

  const foods = {
    green: ["Apple", "Salad", "Broccoli", "Green Beans"],
    yellow: ["Rice", "Banana", "Corn", "Pasta"],
    red: ["Spin Again"],
  };

  // Define explicit wheel sections: 2 greens, 3 yellows, 1 small red (~45deg)
  const sections = [
    {
      key: "green",
      type: "veggie",
      description: "Choose a Green Stop Light Veggie",
      color: "#22C55E",
      angle: 63,
    },
    {
      key: "yellow",
      type: "veggie",
      description: "Choose a Yellow Stop Light Veggie",
      color: "#FCD34D",
      angle: 63,
    },
    {
      key: "green",
      type: "fruit",
      description: "Choose a Green Stop Light Fruit",
      color: "#22C55E",
      angle: 63,
    },
    {
      key: "yellow",
      type: "protein",
      description: "Choose a Yellow Stop Light Protein",
      color: "#FCD34D",
      angle: 63,
    },
    {
      key: "red",
      type: "",
      description: "Spin Again",
      color: "#DC2626",
      angle: 45,
    },
    {
      key: "yellow",
      type: "grain",
      description: "Choose a Yellow Stop Light Grain",
      color: "#FCD34D",
      angle: 63,
    },
  ];

  // Build cumulative ranges (degrees) for picking
  // These should match the actual wheel positions (starting at -90°)
  const cumulative = [];
  (function buildCumulative() {
    let acc = -90; // Start at -90 to match the wheel drawing
    for (let i = 0; i < sections.length; i++) {
      const start = acc;
      const end = acc + sections[i].angle;
      // Normalize to 0-360 range
      const normalizedStart = ((start % 360) + 360) % 360;
      const normalizedEnd = ((end % 360) + 360) % 360;

      cumulative.push({
        start: normalizedStart,
        end: normalizedEnd,
        index: i,
        wraps: normalizedEnd < normalizedStart, // handles wraparound at 0°
      });
      acc = end;
    }
  })();
  const spinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSelectedFood(null);
    setResult(null);

    // Pick a random degree (0-360)
    const r = Math.random() * 360;

    // Find which section this degree falls into
    let picked = cumulative.find((c) => {
      if (c.wraps) {
        return r >= c.start || r < c.end;
      } else {
        return r >= c.start && r < c.end;
      }
    });

    if (!picked) picked = cumulative[0];

    const pickedIndex = picked.index;
    const pickedSection = sections[pickedIndex];

    // Calculate the actual center of the picked section on the wheel
    let sectionCenter;
    if (picked.wraps) {
      const range = 360 - picked.start + picked.end;
      sectionCenter = (picked.start + range / 2) % 360;
    } else {
      sectionCenter = (picked.start + picked.end) / 2;
    }

    // Normalize current rotation to 0-360 range
    const currentNormalized = ((rotation % 360) + 360) % 360;

    // The pointer is at 270° (top of wheel)
    const pointerPosition = 270;

    // Calculate how much MORE we need to rotate from current position
    // We want sectionCenter to align with pointer at 270°
    const targetPosition = (pointerPosition - sectionCenter + 360) % 360;
    let additionalRotation = (targetPosition - currentNormalized + 360) % 360;

    const jitter = (Math.random() - 0.5) * 2;

    const spins = 4 + Math.floor(Math.random() * 3);
    const totalRotation = rotation + spins * 360 + additionalRotation + jitter;

    setRotation(totalRotation);

    const duration = 2600;
    setTimeout(() => {
      setIsSpinning(false);
      setResult(pickedSection.key);
      setDescription(pickedSection.description);
    }, duration);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Stoplight Plate Spinner</h1>
      </div>
      <div className={styles.subtitle}>
        <p>Spin the wheel to choose foods from different groups.</p>
        <p>Green: Go!; Yellow: Choose one; Red: Spin again.</p>
      </div>
      <div className={styles.wheelContainer}>
        <svg
          ref={wheelRef}
          width="300"
          height="300"
          viewBox="0 0 300 300"
          className={styles.wheelSvg}
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Generated sections from `sections` array */}
          <circle
            cx="150"
            cy="150"
            r="145"
            fill="none"
            stroke="#111827"
            strokeWidth="5"
          />
          {(() => {
            let current = -90; // start at top
            return sections.map((s, i) => {
              const start = current;
              const end = current + s.angle;
              const largeArc = s.angle > 180 ? 1 : 0;
              const startRad = (start * Math.PI) / 180;
              const endRad = (end * Math.PI) / 180;
              const x1 = 150 + 145 * Math.cos(startRad);
              const y1 = 150 + 145 * Math.sin(startRad);
              const x2 = 150 + 145 * Math.cos(endRad);
              const y2 = 150 + 145 * Math.sin(endRad);
              const d = `M150 150 L ${x1} ${y1} A 145 145 0 ${largeArc} 1 ${x2} ${y2} Z`;
              const mid = start + s.angle / 2;
              current = end;
              return (
                <g key={i}>
                  <path d={d} fill={s.color} stroke="#0b1220" strokeWidth="1" />
                  <text
                    x={150 + 95 * Math.cos((mid * Math.PI) / 180)}
                    y={150 + 95 * Math.sin((mid * Math.PI) / 180)}
                    fill="#07203a"
                    fontSize="12"
                    fontWeight="700"
                    textAnchor="middle"
                    transform={`rotate(${mid + 90}, ${
                      150 + 95 * Math.cos((mid * Math.PI) / 180)
                    }, ${150 + 95 * Math.sin((mid * Math.PI) / 180)})`}
                  >
                    {s.key.toUpperCase()}
                  </text>
                  <text
                    x={150 + 95 * Math.cos((mid * Math.PI) / 180)}
                    y={170 + 95 * Math.sin((mid * Math.PI) / 180)}
                    fill="#07203a"
                    fontSize="12"
                    fontWeight="700"
                    textAnchor="middle"
                    transform={`rotate(${mid + 90}, ${
                      150 + 95 * Math.cos((mid * Math.PI) / 180)
                    }, ${150 + 95 * Math.sin((mid * Math.PI) / 180)})`}
                  >
                    {s.type.toUpperCase()}
                  </text>
                </g>
              );
            });
          })()}
          <circle cx="150" cy="150" r="36" fill="#111827" />
        </svg>

        <div className={styles.pointer} aria-hidden>
          <svg width="40" height="40" viewBox="0 0 24 24">
            <path d="M12 2 L8 10 H16 L12 2 Z" fill="#111827" />
          </svg>
        </div>
      </div>

      <button
        onClick={spinWheel}
        disabled={isSpinning}
        className={styles.spinButton}
      >
        {isSpinning ? "Spinning..." : "Spin!"}
      </button>

      {result && (
        <div className={styles.resultBox}>
          <p className={styles.resultText}>
            Result:{" "}
            <strong className={styles[result]}>{result.toUpperCase()}</strong>
          </p>

          {result !== "red" ? (
            <div className={styles.foodList}>
              <p className={styles.chooseText}>{description}</p>
              <div className={styles.foodButtons}>
                {foods[result].map((food) => (
                  <button
                    key={food}
                    className={styles.foodButton}
                    onClick={() => setSelectedFood(food)}
                  >
                    {food}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.spinAgain}>
              <p>Hit spin again to try for a food.</p>
            </div>
          )}
          {selectedFood && (
            <div className={styles.selection}>
              <p>
                You selected <strong>{selectedFood}</strong> — great choice!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

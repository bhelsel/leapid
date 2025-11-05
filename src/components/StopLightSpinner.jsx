import { useState, useRef } from "react";
import styles from "./StoplightSpinner.module.css";
import foods from "../data/foods.json";
import sections from "../data/stopLightSections.json";

export default function StoplightSpinner() {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null); // 'green' | 'yellow' | 'red'
  const [description, setDescription] = useState(null); // 'green' | 'yellow' | 'red'
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedTip, setSelectedTip] = useState(null);
  const [displayedFoods, setDisplayedFoods] = useState([]); // Random selection of up to 5 foods
  const wheelRef = useRef(null);

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

  // Helper function to randomly select up to 5 foods from a category
  const getRandomFoods = (category) => {
    const allFoods = foods[category];
    const maxToShow = Math.min(5, allFoods.length);

    // Shuffle and take first maxToShow items
    const shuffled = [...allFoods].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, maxToShow);
  };

  const spinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSelectedFood(null);
    setResult(null);
    setDisplayedFoods([]);

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
      // Select random foods from the category
      setDisplayedFoods(getRandomFoods(pickedSection.foodCategory));
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
                {displayedFoods.map((food) => (
                  <button
                    key={food.name}
                    className={styles.foodButton}
                    onClick={() => {
                      setSelectedFood(food.name);
                      setSelectedImage(food.image);
                      setSelectedTip(food.tip);
                    }}
                  >
                    {food.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.spinAgain}>
              <p>
                No food this time.
                <br />
                Spin again for another try!
              </p>
            </div>
          )}
          {selectedFood && (
            <div className={styles.selection}>
              <p>{selectedTip}</p>
              <img src={selectedImage} width="100%" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

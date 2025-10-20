import React, { useState, useEffect } from "react";
import "./SplashScreen.css";
import logo from "../../assets/images/logo.png";

function SplashScreen({ onFinish }) {
  const [isFinishing, setIsFinishing] = useState(false);
  const appName = "Vuelanding";

  useEffect(() => {
    const splashDuration = 1700; // 3 segundos
    const finishTimer = setTimeout(() => {
      setIsFinishing(true);
      setTimeout(() => {
        if (onFinish) {
          onFinish();
        }
      }, 400);
    }, splashDuration);

    return () => clearTimeout(finishTimer);
  }, [onFinish]);

  return (
    <div className={`splash-screen ${isFinishing ? "finished" : ""}`}>
      <div className="splash-content">
        {/* Logo PNG más grande */}
        <img src={logo} alt="Logo Vuelanding" className="splash-logo" />

        {/* Texto animado */}
        <h1 className="splash-title">
          {appName.split("").map((char, index) => (
            <span
              key={index}
              className="splash-char"
              style={{ animationDelay: `${100 * index}ms` }}
            >
              {char}
            </span>
          ))}
        </h1>

        {/* Loader */}
        <div className="loader-container">
          <div className="loader-bar"></div>
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;

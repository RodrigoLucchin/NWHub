import React, { useEffect, useState } from "react";

export default function FloatingDrone({ position, delay = 0, size = "medium", variant = "quad", sidebarCollapsed = false }) {
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const droneId = `drone-${variant}-${size}-${delay}`;

  const sizeMap = {
    small: { width: 80, height: 70, scale: 0.7 },
    medium: { width: 120, height: 100, scale: 1 },
    large: { width: 160, height: 140, scale: 1.3 },
  };

  const dimensions = sizeMap[size] || sizeMap.medium;

  useEffect(() => {
    const handleMouseMove = (e) => {
      const drone = document.getElementById(droneId);
      if (!drone) return;

      const rect = drone.getBoundingClientRect();
      const droneCenterX = rect.left + rect.width / 2;
      const droneCenterY = rect.top + rect.height / 2;

      const angle = Math.atan2(e.clientY - droneCenterY, e.clientX - droneCenterX);
      const distance = Math.min(3, Math.sqrt(Math.pow(e.clientX - droneCenterX, 2) + Math.pow(e.clientY - droneCenterY, 2)) / 100);

      import React, { useEffect, useState } from "react";

      export default function FloatingDrone({ position = {}, delay = 0, size = "medium", variant = "quad", sidebarCollapsed = false }) {
        const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
        const droneId = `drone-${variant}-${size}-${delay}`;

        const sizeMap = {
          small: { width: 80, height: 70, scale: 0.7 },
          medium: { width: 120, height: 100, scale: 1 },
          large: { width: 160, height: 140, scale: 1.3 },
        };

        const dimensions = sizeMap[size] || sizeMap.medium;

        useEffect(() => {
          const handleMouseMove = (e) => {
            const drone = document.getElementById(droneId);
            if (!drone) return;

            const rect = drone.getBoundingClientRect();
            const droneCenterX = rect.left + rect.width / 2;
            const droneCenterY = rect.top + rect.height / 2;

            const angle = Math.atan2(e.clientY - droneCenterY, e.clientX - droneCenterX);
            const distance = Math.min(3, Math.sqrt(Math.pow(e.clientX - droneCenterX, 2) + Math.pow(e.clientY - droneCenterY, 2)) / 100);

            setEyePosition({ x: Math.cos(angle) * distance, y: Math.sin(angle) * distance });
          };

          window.addEventListener("mousemove", handleMouseMove);
          return () => window.removeEventListener("mousemove", handleMouseMove);
        }, [droneId]);

        const renderQuadDrone = () => (
          <svg width={dimensions.width} height={dimensions.height} viewBox="0 0 120 100" style={{ animation: `drone-float 6s ease-in-out infinite`, animationDelay: `${delay}s` }}>
            <line x1="30" y1="40" x2="10" y2="30" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round" />
            <line x1="90" y1="40" x2="110" y2="30" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round" />
            <line x1="30" y1="60" x2="10" y2="70" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round" />
            <line x1="90" y1="60" x2="110" y2="70" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round" />

            <g style={{ animation: `rotor-spin 2s linear infinite`, transformOrigin: `10px 30px` }}>
              <ellipse cx="10" cy="30" rx="8" ry="3" fill="#9ca3af" opacity="0.6" />
              <ellipse cx="10" cy="30" rx="3" ry="8" fill="#9ca3af" opacity="0.6" />
            </g>
            <g style={{ animation: `rotor-spin 2.2s linear infinite`, transformOrigin: `110px 30px` }}>
              <ellipse cx="110" cy="30" rx="8" ry="3" fill="#9ca3af" opacity="0.6" />
              <ellipse cx="110" cy="30" rx="3" ry="8" fill="#9ca3af" opacity="0.6" />
            </g>
            <g style={{ animation: `rotor-spin 1.9s linear infinite`, transformOrigin: `10px 70px` }}>
              <ellipse cx="10" cy="70" rx="8" ry="3" fill="#9ca3af" opacity="0.6" />
              <ellipse cx="10" cy="70" rx="3" ry="8" fill="#9ca3af" opacity="0.6" />
            </g>
            <g style={{ animation: `rotor-spin 2.1s linear infinite`, transformOrigin: `110px 70px` }}>
              <ellipse cx="110" cy="70" rx="8" ry="3" fill="#9ca3af" opacity="0.6" />
              <ellipse cx="110" cy="70" rx="3" ry="8" fill="#9ca3af" opacity="0.6" />
            </g>

            <rect x="35" y="35" width="50" height="30" rx="8" fill="#d1d5db" />

            <line x1="45" y1="65" x2="45" y2="75" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
            <line x1="75" y1="65" x2="75" y2="75" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
            <circle cx="45" cy="76" r="2" fill="#9ca3af" />
            <circle cx="75" cy="76" r="2" fill="#9ca3af" />

            <circle cx="60" cy="65" r="4" fill="#9ca3af" opacity="0.8" />
            <circle cx="60" cy="65" r="2" fill="#6b7280" />

            <g>
              <ellipse cx="50" cy="48" rx="6" ry="7" fill="white" />
              <circle cx={50 + eyePosition.x} cy={48 + eyePosition.y} r="3" fill="#374151" />
              <circle cx={50 + eyePosition.x + 1} cy={48 + eyePosition.y - 1} r="1.5" fill="white" />

              <ellipse cx="70" cy="48" rx="6" ry="7" fill="white" />
              <circle cx={70 + eyePosition.x} cy={48 + eyePosition.y} r="3" fill="#374151" />
              <circle cx={70 + eyePosition.x + 1} cy={48 + eyePosition.y - 1} r="1.5" fill="white" />
            </g>

            <path d="M 52 54 Q 60 58 68 54" stroke="#9ca3af" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        );

        const renderRacingDrone = () => (
          <svg width={dimensions.width} height={dimensions.height} viewBox="0 0 120 100" style={{ animation: `drone-float 6s ease-in-out infinite`, animationDelay: `${delay}s` }}>
            <line x1="60" y1="45" x2="20" y2="25" stroke="#9ca3af" strokeWidth="4" strokeLinecap="round" />
            <line x1="60" y1="45" x2="100" y2="25" stroke="#9ca3af" strokeWidth="4" strokeLinecap="round" />
            <line x1="60" y1="55" x2="20" y2="75" stroke="#9ca3af" strokeWidth="4" strokeLinecap="round" />
            <line x1="60" y1="55" x2="100" y2="75" stroke="#9ca3af" strokeWidth="4" strokeLinecap="round" />

            <g style={{ animation: `rotor-spin 1.5s linear infinite`, transformOrigin: `20px 25px` }}>
              <ellipse cx="20" cy="25" rx="10" ry="3" fill="#9ca3af" opacity="0.7" />
              <ellipse cx="20" cy="25" rx="3" ry="10" fill="#9ca3af" opacity="0.7" />
            </g>
            <g style={{ animation: `rotor-spin 1.6s linear infinite`, transformOrigin: `100px 25px` }}>
              <ellipse cx="100" cy="25" rx="10" ry="3" fill="#9ca3af" opacity="0.7" />
              <ellipse cx="100" cy="25" rx="3" ry="10" fill="#9ca3af" opacity="0.7" />
            </g>
            <g style={{ animation: `rotor-spin 1.4s linear infinite`, transformOrigin: `20px 75px` }}>
              <ellipse cx="20" cy="75" rx="10" ry="3" fill="#9ca3af" opacity="0.7" />
              <ellipse cx="20" cy="75" rx="3" ry="10" fill="#9ca3af" opacity="0.7" />
            </g>
            <g style={{ animation: `rotor-spin 1.55s linear infinite`, transformOrigin: `100px 75px` }}>
              <ellipse cx="100" cy="75" rx="10" ry="3" fill="#9ca3af" opacity="0.7" />
              <ellipse cx="100" cy="75" rx="3" ry="10" fill="#9ca3af" opacity="0.7" />
            </g>

            <ellipse cx="60" cy="50" rx="25" ry="15" fill="#d1d5db" />
            <rect x="50" y="40" width="20" height="20" rx="3" fill="#b9bdc4" />

            <circle cx="60" cy="62" r="5" fill="#9ca3af" opacity="0.8" />
            <circle cx="60" cy="62" r="3" fill="#6b7280" />

            <g>
              <ellipse cx="53" cy="48" rx="5" ry="6" fill="white" transform="rotate(-10 53 48)" />
              <circle cx={53 + eyePosition.x * 0.8} cy={48 + eyePosition.y * 0.8} r="2.5" fill="#374151" />
              <circle cx={53 + eyePosition.x * 0.8 + 0.8} cy={48 + eyePosition.y * 0.8 - 0.8} r="1" fill="white" />

              <ellipse cx="67" cy="48" rx="5" ry="6" fill="white" transform="rotate(10 67 48)" />
              <circle cx={67 + eyePosition.x * 0.8} cy={48 + eyePosition.y * 0.8} r="2.5" fill="#374151" />
              <circle cx={67 + eyePosition.x * 0.8 + 0.8} cy={48 + eyePosition.y * 0.8 - 0.8} r="1" fill="white" />
            </g>

            <line x1="60" y1="35" x2="60" y2="25" stroke="#9ca3af" strokeWidth="2" />
            <circle cx="60" cy="23" r="2" fill="#d1d5db" />
          </svg>
        );

        const renderMiniDrone = () => (
          <svg width={dimensions.width} height={dimensions.height} viewBox="0 0 120 100" style={{ animation: `drone-float 6s ease-in-out infinite`, animationDelay: `${delay}s` }}>
            <line x1="45" y1="45" x2="25" y2="35" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round" />
            <line x1="75" y1="45" x2="95" y2="35" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round" />
            <line x1="45" y1="55" x2="25" y2="65" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round" />
            <line x1="75" y1="55" x2="95" y2="65" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round" />

            <g style={{ animation: `rotor-spin 1.8s linear infinite`, transformOrigin: `25px 35px` }}>
              <ellipse cx="25" cy="35" rx="7" ry="2.5" fill="#9ca3af" opacity="0.6" />
              <ellipse cx="25" cy="35" rx="2.5" ry="7" fill="#9ca3af" opacity="0.6" />
            </g>
            <g style={{ animation: `rotor-spin 1.9s linear infinite`, transformOrigin: `95px 35px` }}>
              <ellipse cx="95" cy="35" rx="7" ry="2.5" fill="#9ca3af" opacity="0.6" />
              <ellipse cx="95" cy="35" rx="2.5" ry="7" fill="#9ca3af" opacity="0.6" />
            </g>
            <g style={{ animation: `rotor-spin 1.7s linear infinite`, transformOrigin: `25px 65px` }}>
              <ellipse cx="25" cy="65" rx="7" ry="2.5" fill="#9ca3af" opacity="0.6" />
              <ellipse cx="25" cy="65" rx="2.5" ry="7" fill="#9ca3af" opacity="0.6" />
            </g>
            <g style={{ animation: `rotor-spin 1.85s linear infinite`, transformOrigin: `95px 65px` }}>
              <ellipse cx="95" cy="65" rx="7" ry="2.5" fill="#9ca3af" opacity="0.6" />
              <ellipse cx="95" cy="65" rx="2.5" ry="7" fill="#9ca3af" opacity="0.6" />
            </g>

            <circle cx="60" cy="50" r="18" fill="#d1d5db" />
            <circle cx="60" cy="50" r="12" fill="#b9bdc4" />

            <circle cx="60" cy="62" r="3" fill="#9ca3af" opacity="0.8" />
            <circle cx="60" cy="62" r="1.5" fill="#6b7280" />

            <g>
              <ellipse cx="54" cy="48" rx="5" ry="6" fill="white" />
              <circle cx={54 + eyePosition.x} cy={48 + eyePosition.y} r="2.5" fill="#374151" />
              <circle cx={54 + eyePosition.x + 1} cy={48 + eyePosition.y - 1} r="1.2" fill="white" />

              <ellipse cx="66" cy="48" rx="5" ry="6" fill="white" />
              <circle cx={66 + eyePosition.x} cy={48 + eyePosition.y} r="2.5" fill="#374151" />
              <circle cx={66 + eyePosition.x + 1} cy={48 + eyePosition.y - 1} r="1.2" fill="white" />
            </g>

            <path d="M 52 54 Q 60 57 68 54" stroke="#9ca3af" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
        );

        const droneVariants = { quad: renderQuadDrone, racing: renderRacingDrone, mini: renderMiniDrone };

        const getAdjustedPosition = () => {
          const adjustedPos = { animationDelay: `${delay}s` };
          if (position && position.bottom) adjustedPos.bottom = position.bottom;
          if (position && position.top) adjustedPos.top = position.top;
          if (position && position.left) {
            const leftValue = parseInt(position.left, 10);
            const sidebarWidth = sidebarCollapsed ? 56 : 240;
            adjustedPos.left = `${leftValue + sidebarWidth}px`;
            adjustedPos.transition = "left 0.3s ease-in-out";
          }
          if (position && position.right) adjustedPos.right = position.right;
          return adjustedPos;
        };

        return (
          <div id={droneId} style={{ ...getAdjustedPosition(), zIndex: 0, pointerEvents: "none" }}>
            {droneVariants[variant]()}
          </div>
        );
      }
          const getAdjustedPosition = () => {
            const adjustedPos = { animationDelay: `${delay}s` };
            if (position && position.bottom) adjustedPos.bottom = position.bottom;
            if (position && position.top) adjustedPos.top = position.top;
            if (position && position.left) {
              const leftValue = parseInt(position.left, 10);
              const sidebarWidth = sidebarCollapsed ? 56 : 240;
              adjustedPos.left = `${leftValue + sidebarWidth}px`;
              adjustedPos.transition = "left 0.3s ease-in-out";
            }
            if (position && position.right) adjustedPos.right = position.right;
            return adjustedPos;
          };

          return (
            <div id={droneId} style={{ ...getAdjustedPosition(), zIndex: 0, pointerEvents: "none" }}>
              {droneVariants[variant]()}
            </div>
          );
        }
                <ellipse cx="25" cy="35" rx="2.5" ry="7" fill="#9ca3af" opacity="0.6" />

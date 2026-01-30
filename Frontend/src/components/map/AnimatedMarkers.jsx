import React, { useState } from "react";
import { motion } from "framer-motion";

const ASPECT_RATIO = 261.2 / 212.31;

const lightenColor = (hex, amount = 0.2) => {
  const num = parseInt(hex.replace("#", ""), 16);
  let r = (num >> 16) + 255 * amount;
  let g = ((num >> 8) & 0x00ff) + 255 * amount;
  let b = (num & 0x0000ff) + 255 * amount;

  r = Math.min(255, Math.round(r));
  g = Math.min(255, Math.round(g));
  b = Math.min(255, Math.round(b));

  return `rgb(${r}, ${g}, ${b})`;
};

export const CustomMarker = ({
  number,
  width = 35,
  color = "#2e2e2e",
  textColor = "white",
  strokeColor = "#262626",
  onClick,
}) => {
  const height = width * ASPECT_RATIO;
  const [isHover, setIsHover] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className="relative select-none flex justify-center items-center drop-shadow-lg transition-all duration-150 ease-in-out cursor-pointer"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transform: isHover ? "scale(1.15)" : "scale(1)",
        transformOrigin: "bottom center",
      }}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      onClick={handleClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 212.31 261.2"
        width={width}
        height={height}
        className="absolute top-0 left-0 transition-all duration-150 ease-in-out"
      >
        <path
          d="M184.36,172.48c-15.51,22.12-34.45,40.65-53.47,59.11-7.29,7.08-14.59,14.16-21.79,21.34-2,1.99-3.6,2.55-5.85.37-22.46-21.81-46.06-42.52-65.99-66.83-15.82-19.29-27.07-40.71-30.02-65.92C.6,63.66,38.74,15.89,90.77,7.72c55.45-8.71,107.31,30.21,114.23,87.01,3.45,28.29-4.23,54.11-20.64,77.75"
          fill={isHover ? lightenColor(color, 0.1) : color}
          stroke={isHover ? lightenColor(strokeColor, 0.1) : strokeColor}
          strokeWidth="13"
          strokeMiterlimit="10"
        />
      </svg>

      <span
        className="relative pointer-events-none"
        style={{
          fontSize: `${width / 2}px`,
          color: textColor,
          textShadow: "0 1px 2px rgba(0, 0, 0, 0.6)",
          lineHeight: 1,
          marginBottom: `${height / 8}px`,
          fontWeight: "bold",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        {number}
      </span>
    </div>
  );
};

export const AnimatedMarker = ({ place, index, onClick }) => {
  return (
    <motion.div
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        delay: index * 0.15,
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
    >
      <CustomMarker number={index + 1} onClick={() => onClick(place)} />
    </motion.div>
  );
};

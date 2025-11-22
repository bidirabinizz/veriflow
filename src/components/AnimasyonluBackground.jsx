import React, { useEffect, useState } from "react";

const AnimatedBackground = ({ count = 12 }) => {
  const [orbs, setOrbs] = useState([]);

  // Buraya istediğin renkleri ekle
  const colors = [
    "rgba(101, 232, 255, 0.3)",   // cyan
    "rgba(115, 169, 255, 0.3)",  // blue
    "rgba(173, 85, 255, 0.48)",  // deep purple
    "rgba(0, 255, 242, 0.58)"   // light indigo
  ];

  useEffect(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        x: Math.random() * 90,
        y: Math.random() * 90,
        size: Math.random() * 60 + 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
      });
    }
    setOrbs(temp);
  }, [count]);

  useEffect(() => {
    const interval = setInterval(() => {
      setOrbs((prev) =>
        prev.map((orb) => {
          let newX = orb.x + orb.dx;
          let newY = orb.y + orb.dy;

          if (newX > 95 || newX < 0) orb.dx = -orb.dx;
          if (newY > 95 || newY < 0) orb.dy = -orb.dy;

          return { ...orb, x: newX, y: newY };
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {orbs.map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full blur-xl"
          style={{
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            top: `${orb.y}%`,
            left: `${orb.x}%`,
            background: orb.color,
            transition: "top 0.05s linear, left 0.05s linear",
          }}
        ></div>
      ))}
    </div>
  );
};

export default AnimatedBackground;

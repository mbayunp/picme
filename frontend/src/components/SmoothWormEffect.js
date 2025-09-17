import React, { useState, useEffect } from "react";

const SmoothWormEffect = () => {
  const [wormElements, setWormElements] = useState([]);

  useEffect(() => {
    // Inisialisasi posisi cacing di tengah layar
    const initialWorm = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    }));
    setWormElements(initialWorm);
  }, []);

  useEffect(() => {
    // Tangani pergerakan mouse untuk kepala cacing
    const handleMouseMove = (e) => {
      setWormElements((prevWorm) => {
        const newWorm = [...prevWorm];
        newWorm[0] = { ...newWorm[0], x: e.clientX, y: e.pageY };
        return newWorm;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    // Animasi tubuh cacing menggunakan requestAnimationFrame
    const animate = () => {
      setWormElements((prevWorm) => {
        const newWorm = [...prevWorm];
        for (let i = 1; i < newWorm.length; i++) {
          const prevX = newWorm[i - 1].x;
          const prevY = newWorm[i - 1].y;
          const currentX = newWorm[i].x;
          const currentY = newWorm[i].y;

          const dx = prevX - currentX;
          const dy = prevY - currentY;

          // Menggunakan lerp (linear interpolation) untuk pergerakan yang mulus
          const newX = currentX + dx * 0.15;
          const newY = currentY + dy * 0.15;

          newWorm[i] = { ...newWorm[i], x: newX, y: newY };
        }
        return newWorm;
      });
      requestAnimationFrame(animate);
    };

    const animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <>
      {wormElements.map((el) => (
        <div
          key={el.id}
          className="absolute w-3 h-3 bg-gray-500 rounded-full pointer-events-none z-50 transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${el.x}px, ${el.y}px)`,
          }}
        />
      ))}
    </>
  );
};

export default SmoothWormEffect;

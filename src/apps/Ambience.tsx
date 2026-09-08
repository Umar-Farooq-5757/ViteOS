import React, { useState } from "react";
import { Rnd } from "react-rnd";
import AmbienceMixer from "../components/AmbienceMixer";

interface AmbienceProps {
  onClose: () => void;
}

const Ambience: React.FC<AmbienceProps> = ({ onClose }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [prevSize, setPrevSize] = useState<{
    width: number | string;
    height: number | string;
    x: number;
    y: number;
  }>({
    width: 400,
    height: 300,
    x: 100,
    y: 100,
  });
  const [currentSize, setCurrentSize] = useState<{
    width: number | string;
    height: number | string;
    x: number;
    y: number;
  }>({
    width: 400,
    height: 300,
    x: 100,
    y: 100,
  });

  const toggleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMaximized) {
      setCurrentSize(prevSize);
      setIsMaximized(false);
    } else {
      setPrevSize({
        width: currentSize.width,
        height: currentSize.height,
        x: currentSize.x,
        y: currentSize.y,
      });
      setIsMaximized(true);
    }
  };

  return (
    <Rnd
      size={
        isMaximized
          ? { width: "100%", height: "100%" }
          : { width: currentSize.width, height: currentSize.height }
      }
      position={
        isMaximized ? { x: 0, y: 0 } : { x: currentSize.x, y: currentSize.y }
      }
      onDragStop={(_e, d) => {
        if (!isMaximized) {
          setCurrentSize((prev) => ({ ...prev, x: d.x, y: d.y }));
        }
      }}
      onResizeStop={(_e, _direction, ref, _delta, position) => {
        if (!isMaximized) {
          setCurrentSize({
            width: ref.style.width,
            height: ref.style.height,
            ...position,
          });
        }
      }}
      disableDragging={isMaximized}
      enableResizing={!isMaximized}
      bounds="parent"
      dragHandleClassName="handle">
      <section
        className={`flex overflow-hidden flex-col ${isMaximized ? "w-full h-full" : "h-120 w-150"} bg-black text-white select-none border border-white/15 rounded-lg shadow-xl`}>
        {/* Title Bar */}
        <div className="handle cursor-grab flex items-center justify-between px-4 py-2 bg-white/4">
          <div className="flex items-center gap-2">
            <img className="size-5" src="/apps/ambience.png" alt="clock" />
            <span className="text-sm font-medium">Ambience</span>
          </div>
          <div className="flex items-center gap-2 cursor-default">
            <button
              onClick={(e) => e.stopPropagation()}
              className="size-4 bg-yellow-500 rounded-full hover:opacity-80"
            />
            <button
              onClick={toggleMaximize}
              className="size-4 bg-green-500 rounded-full hover:opacity-80"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="size-4 bg-red-500 rounded-full hover:opacity-80"
            />
          </div>
        </div>

        <div className="h-0.5 w-full bg-white/15" />
        <div className="bg-white/8 h-full w-full">
          <AmbienceMixer />
        </div>
      </section>
    </Rnd>
  );
};

export default Ambience;

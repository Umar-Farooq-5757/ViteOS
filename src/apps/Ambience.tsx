import React, { useState } from "react";
import { Rnd } from "react-rnd";
import AmbienceMixer from "../components/AmbienceMixer";
import { FaRegWindowRestore, FaWindowMinimize } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { cn } from "../lib/utils";

interface AmbienceProps {
  onClose: () => void;
  style: string;
  onFocus: () => void;
  zIndex: number;
}

const Ambience: React.FC<AmbienceProps> = ({
  onClose,
  style,
  onFocus,
  zIndex,
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [prevSize, setPrevSize] = useState<{
    width: number | string;
    height: number | string;
    x: number;
    y: number;
  }>({
    width: "50vw",
    height: "50vh",
    x: 100,
    y: 50,
  });

  const [currentSize, setCurrentSize] = useState<{
    width: number | string;
    height: number | string;
    x: number;
    y: number;
  }>({
    width: "50vw",
    height: "50vh",
    x: 100,
    y: 50,
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
      onMouseDown={onFocus}
      style={{ zIndex }}
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
      dragHandleClassName="handle"
      minWidth={560}
      minHeight={380}>
      <section
        className={cn(
          "flex flex-col w-full h-full select-none border border-white/15 shadow-xl overflow-hidden",
          style === "vite" && "rounded-lg bg-black",
        )}>
        {/* Title Bar */}
        <div
          className={cn(
            "handle cursor-grab flex items-center justify-between px-4 py-1",
            style === "vite" && "bg-white/4",
            style === "98" && "bg-linear-to-r from-[#020D88] to-[#107FCD]",
          )}>
          {style === "vite" && (
            <>
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
            </>
          )}
          {style === "98" && (
            <>
              <div className="flex items-center gap-2">
                <img className="size-5" src="/apps/ambience.png" alt="clock" />
                <span className="text-sm font-medium text-white">Ambience</span>
              </div>
              <div className="flex items-center gap-2 cursor-default">
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#C0C0C0] size-4.5 flex items-center justify-center">
                  <FaWindowMinimize className="text-black size-3" />
                </button>
                <button
                  onClick={toggleMaximize}
                  className="bg-[#C0C0C0] size-4.5 flex items-center justify-center">
                  <FaRegWindowRestore className="text-black size-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="bg-[#C0C0C0] size-4.5 flex items-center justify-center">
                  <IoClose className="text-black size-3" />
                </button>
              </div>
            </>
          )}
        </div>

        {style === "vite" && <div className="h-0.5 w-full bg-white/15" />}

        {/* Component Content Container */}
        <div
          className={cn(
            "h-full w-full flex-1 min-h-0 overflow-hidden",
            style === "vite" && "bg-white/8",
            style === "98" && "bg-[#C0C0C0] text-black pt-1",
          )}>
          <AmbienceMixer style={style} />
        </div>
      </section>
    </Rnd>
  );
};

export default Ambience;

import type React from "react";
import { useState, useEffect } from "react";
import {
  IoArrowBackSharp,
  IoArrowForwardSharp,
  IoClose,
} from "react-icons/io5";
import { Rnd } from "react-rnd";
import { cn } from "../lib/utils";
import { FaRegWindowRestore, FaWindowMinimize } from "react-icons/fa";
import { MdOutlineNavigateBefore, MdOutlineNavigateNext } from "react-icons/md";

interface PhotosProps {
  onClose: () => void;
  style: string;
}

const Photos: React.FC<PhotosProps> = ({ onClose, style }) => {
  const images = ["/gallery/1.jpg", "/gallery/2.jpg", "/gallery/3.jpg"];
  const [currentImage, setCurrentImage] = useState<number | null>(null);

  // Window maximize/minimize controls
  const [isMaximized, setIsMaximized] = useState(false);
  const [prevSize, setPrevSize] = useState<{
    width: number | string;
    height: number | string;
    x: number;
    y: number;
  }>({
    width: 400,
    height: 300,
    x: 200,
    y: 200,
  });
  const [currentSize, setCurrentSize] = useState<{
    width: number | string;
    height: number | string;
    x: number;
    y: number;
  }>({
    width: 400,
    height: 300,
    x: 200,
    y: 200,
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

  // Preload images into the browser cache on mount
  useEffect(() => {
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [images]);

  const changeImage = (direction: string) => {
    setCurrentImage((prev) => {
      if (prev === null) return null;

      if (direction === "back") {
        return prev === 0 ? images.length - 1 : prev - 1;
      } else if (direction === "forward") {
        return prev === images.length - 1 ? 0 : prev + 1;
      }
      return prev;
    });
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
        className={cn(
          `flex flex-col ${isMaximized ? "w-full h-full" : "h-120 w-150"} select-none border border-white/15 shadow-xl overflow-hidden`,
          style === "vite" && "rounded-lg bg-black",
        )}>
        {/* Title Bar */}
        <div
          className={cn(
            "handle cursor-grab flex items-center justify-between px-4 py-1",
            style === "vite" && "bg-white/4",
            style === "98" && "bg-[#0844AA]",
          )}>
          {style === "vite" && (
            <>
              <div className="flex items-center gap-2">
                <img className="size-5" src="/apps/photos.png" alt="clock" />
                <span className="text-sm font-medium">Photos</span>
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
                <img className="size-5" src="/apps/photos.png" alt="clock" />
                <span className="text-sm font-medium text-white">Photos</span>
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
        {/* Content Area */}
        {currentImage === null && (
          <div
            className={cn(
              "flex-1 flex overflow-hidden p-4",
              style === "vite" && "bg-white/8",
              style === "98" && "bg-[#c0c0c0]",
            )}>
            <div className="flex gap-4">
              {images.map((img, idx) => (
                <img
                  onClick={() => setCurrentImage(idx)}
                  className={cn(
                    "hover:opacity-50",
                    style === "vite" && "rounded-md size-40 transition-all",
                    style === "98" && "size-20",
                  )}
                  src={img}
                  alt=""
                />
              ))}
            </div>
          </div>
        )}
        {currentImage !== null && (
          <div
            className={cn(
              "relative flex-1 flex items-center justify-center overflow-hidden p-4 gap-1",
              style === "vite" && "bg-white/8",
              style === "98" && "bg-[#c0c0c0]",
            )}>
            <>
              <button
                onClick={() => setCurrentImage(null)}
                className={cn(
                  "absolute top-6 right-11 p-0.5",
                  style === "vite" && "rounded-full bg-white/15",
                  style === "98" &&
                    "bg-[#d9d9d9] shadow-[1px_1px_1px_1px_black] active:shadow-[-1px_-1px_1px_1px_black]",
                )}>
                <IoClose />
              </button>
              <button
                className={cn(
                  "z-10",
                  style === "vite" &&
                    "p-2 bg-gray-700/80 hover:bg-gray-700 rounded-full",
                  style === "98" &&
                    "p-1 bg-[#d9d9d9] shadow-[1px_1px_1px_1px_black] active:shadow-[-1px_-1px_1px_1px_black]",
                )}
                onClick={() => changeImage("back")}>
                {style === "vite" ? (
                  <IoArrowBackSharp />
                ) : (
                  <MdOutlineNavigateBefore />
                )}
              </button>
              <img
                className="w-9/10 h-full object-contain pointer-events-none"
                src={images[currentImage]}
                alt="Gallery item"
              />
              <button
                className={cn(
                  "z-10",
                  style === "vite" &&
                    "p-2 bg-gray-700/80 hover:bg-gray-700 rounded-full",
                  style === "98" &&
                    "p-1 bg-[#d9d9d9] shadow-[1px_1px_1px_1px_black] active:shadow-[-1px_-1px_1px_1px_black]",
                )}
                onClick={() => changeImage("forward")}>
                {style === "vite" ? (
                  <IoArrowForwardSharp />
                ) : (
                  <MdOutlineNavigateNext />
                )}
              </button>
            </>
          </div>
        )}
      </section>
    </Rnd>
  );
};

export default Photos;

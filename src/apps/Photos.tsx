import type React from "react";
import { useState, useEffect } from "react";
import { IoArrowBackSharp, IoArrowForwardSharp } from "react-icons/io5";
import { Rnd } from "react-rnd";

interface PhotosProps {
  onClose: () => void;
}

const Photos: React.FC<PhotosProps> = ({ onClose }) => {
  const images = [
    "/gallery/1.jpg",
    "/gallery/2.jpg",
    "/gallery/3.jpg",
  ];
  const [currentImage, setCurrentImage] = useState<number>(0);
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
    if (direction === "back") {
      setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    } else if (direction === "forward") {
      setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
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
        className={`flex flex-col bg-black text-white select-none ${isMaximized ? "w-full h-full" : "w-150 h-120"} border border-white/15 rounded-lg shadow-xl overflow-hidden`}>
        {/* Title Bar */}
        <div className="handle cursor-grab flex items-center justify-between px-4 py-2 bg-white/4 shrink-0">
          <div className="flex items-center gap-2">
            <img className="size-5" src="/apps/photos.png" alt="photos" />
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
        </div>
        <div className="h-0.5 w-full bg-white/15 shrink-0"></div>
        {/* Content Area */}
        <div className="relative flex-1 bg-white/8 flex items-center justify-center overflow-hidden p-4">
          <button
            className="absolute top-1/2 -translate-y-1/2 p-2 bg-gray-700/80 hover:bg-gray-700 rounded-full left-3 z-10"
            onClick={() => changeImage("back")}>
            <IoArrowBackSharp />
          </button>
          <img
            className="w-full h-full object-contain pointer-events-none"
            src={images[currentImage]}
            alt="Gallery item"
          />
          <button
            className="absolute top-1/2 -translate-y-1/2 p-2 bg-gray-700/80 hover:bg-gray-700 rounded-full right-3 z-10"
            onClick={() => changeImage("forward")}>
            <IoArrowForwardSharp />
          </button>
        </div>
      </section>
    </Rnd>
  );
};

export default Photos;

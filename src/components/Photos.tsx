import type React from "react";
import { useState } from "react";
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
    "/gallery/4.jfif",
  ];
  const [currentImage, setCurrentImage] = useState<number>(0);

  const changeImage = (direction: string) => {
    if (direction === "back") {
      setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    } else if (direction === "forward") {
      setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }
  };

  return (
    <Rnd
      default={{
        x: 300,
        y: 300,
        width: 400,
        height: 300,
      }}
      bounds="parent"
      dragHandleClassName="handle">
      <section className="flex flex-col bg-slate-700 text-white select-none w-150 h-120 border border-slate-700 rounded-lg shadow-xl">
        {/* Title Bar */}
        <div className="handle cursor-grab flex items-center justify-between px-4 py-2 bg-slate-900 shrink-0">
          <div className="flex items-center gap-2">
            <img className="size-5" src="/img/photos.png" alt="photos" />
            <span className="text-sm font-medium">Photos</span>
          </div>
          <div className="flex items-center gap-2 cursor-default">
            <button className="size-4 bg-yellow-500 rounded-full hover:opacity-80" />
            <button className="size-4 bg-green-500 rounded-full hover:opacity-80" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="size-4 bg-red-500 rounded-full hover:opacity-80"
            />
          </div>
        </div>
        <div className="h-0.5 w-full bg-slate-700 shrink-0"></div>
        {/* Content Area */}
        <div className="relative flex-1 bg-slate-800 flex items-center justify-center overflow-hidden p-4">
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

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
  const [currentImage, setCurrentImage] = useState<number>(1);

  const changeImage = (direction: string) => {
    if (direction === "back" && currentImage > 0) {
      setCurrentImage((prevNumber) => prevNumber - 1);
    } else if (direction === "forward" && currentImage < images.length-1) {
      setCurrentImage((prevNumber) => prevNumber + 1);
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
      dragHandleClassName="handle"
      className={`bg-slate-900 border border-slate-700 rounded-lg shadow-xl`}>
      <section className="border border-gray-500 min-h-80 w-120 bg-slate-800">
        <div className="handle cursor-grab flex items-center justify-between px-2 py-1">
          <p>Photos</p>
          <div className="flex items-center gap-2">
            <button className="size-4 text-xs bg-yellow-500 rounded-full"></button>
            <button className="size-4 text-xs bg-green-500 rounded-full"></button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="size-4 text-xs bg-red-500 rounded-full flex items-center justify-center"></button>
          </div>
        </div>
        <div className="h-0.5 w-full bg-slate-700"></div>
        <div className="relative">
          <button className="absolute top-1/2 -translate-y-1/2 p-2 bg-gray-400 rounded-full left-0" onClick={() => changeImage("back")}>
            <IoArrowBackSharp />
          </button>
          <img
            className="w-full h-full object-contain max-h-full"
            src={images[currentImage]}
            alt=""
          />
          <button className="absolute top-1/2 -translate-y-1/2 p-2 bg-gray-400 rounded-full right-0" onClick={() => changeImage("forward")}>
            <IoArrowForwardSharp />
          </button>
        </div>
      </section>
    </Rnd>
  );
};

export default Photos;

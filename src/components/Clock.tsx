import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Rnd } from "react-rnd";

interface ClockProps {
  onClose: () => void;
}

const Clock: React.FC<ClockProps> = ({ onClose }) => {
  const [now, setNow] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const time = format(now, "h:mm:ss");
  const amPm = format(now, "a");
  const date = format(now, "EEEE, d MMM");

  // Calculate angles (in degrees)
  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  const hours = now.getHours();

  const secondDeg = (seconds / 60) * 360;
  const minuteDeg = ((minutes + seconds / 60) / 60) * 360;
  const hourDeg = (((hours % 12) + minutes / 60) / 12) * 360;

  return (
    <Rnd
      default={{
        x: 200,
        y: 200,
        width: 400,
        height: 300,
      }}
      bounds="parent"
      dragHandleClassName="handle">
      <section className="flex flex-col h-120 bg-slate-700 text-white select-none w-150 border border-slate-700 rounded-lg shadow-xl">
        {/* Title Bar */}
        <div className="handle cursor-grab flex items-center justify-between px-4 py-2 bg-slate-900">
          <div className="flex items-center gap-2">
            <img className="size-5" src="/img/clock.png" alt="clock" />
            <span className="text-sm font-medium">Clock</span>
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

        <div className="h-0.5 w-full bg-slate-700" />

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-around p-4 bg-slate-800 rounded-b-lg">
          {/* Container holding image + overlapping hands */}
          <div className="relative size-80 flex items-center justify-center">
            {/* Clock Face Image */}
            <img
              className="size-full object-contain pointer-events-none"
              src="/clock2.png"
              alt="Clock Face"
            />
            {/* Center Pin */}
            <div className="absolute size-3 bg-slate-900 rounded-full z-40 border-2 border-white" />
            {/* Hour Hand */}
            <div
              className="absolute w-1.5 h-14 bg-slate-900 rounded-full z-10 border border-white"
              style={{
                transformOrigin: "bottom center",
                transform: `translateY(-50%) rotate(${hourDeg}deg)`,
              }}
            />
            {/* Minute Hand */}
            <div
              className="absolute w-1 h-20 bg-slate-800 rounded-full z-20 border border-white"
              style={{
                transformOrigin: "bottom center",
                transform: `translateY(-50%) rotate(${minuteDeg}deg)`,
              }}
            />
            {/* Second Hand */}
            <div
              className="absolute w-0.5 h-22 bg-red-500 rounded-full z-30"
              style={{
                transformOrigin: "bottom center",
                transform: `translateY(-50%) rotate(${secondDeg}deg)`,
              }}
            />
          </div>
          {/* Digital Time & Date */}
          <div className="flex flex-col items-center justify-center mt-2">
            <div className="flex items-baseline gap-2">
              <p className="font-extrabold text-3xl tracking-wider">{time}</p>
              <p className="text-sm font-medium text-slate-400">{amPm}</p>
            </div>
            <div className="text-sm text-slate-400">{date}</div>
          </div>
        </div>
      </section>
    </Rnd>
  );
};

export default Clock;

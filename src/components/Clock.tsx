import type React from "react";
import { format } from "date-fns";
import { Rnd } from "react-rnd";

interface NotesProps {
  onClose: () => void;
}

const Clock: React.FC<NotesProps> = ({ onClose }) => {
  const now = new Date();
  const time = format(now, "h:mm");
  const amPm = format(now, "a");
  const date = format(now, "EEEE, d MMM");
  return (
    <Rnd
      default={{
        x: 200,
        y: 200,
        width: 400,
        height: 300,
      }}
      bounds="parent"
      dragHandleClassName="handle"
      className={`bg-slate-900 border border-slate-700 rounded-lg shadow-xl`}>
      <section className="border border-gray-500 min-h-80 w-120 bg-slate-800">
        <div className="handle cursor-grab flex items-center justify-between px-2 py-1">
          <p>Clock</p>
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
        <div className="bg-white/10 backdrop-blur-md border border-white/20 px-8 py-4 rounded-xl">
          <div className="flex items-end gap-2">
            <p className="font-extrabold text-4xl">{time}</p>
            <p>{amPm}</p>
          </div>
          <div className="opacity-70">{date}</div>
        </div>
      </section>
    </Rnd>
  );
};

export default Clock;

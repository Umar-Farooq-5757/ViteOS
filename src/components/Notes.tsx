import type React from "react";
import { useState } from "react";
import { Rnd } from "react-rnd";

interface NotesProps {
  onClose: () => void;
}

const Notes: React.FC<NotesProps> = ({ onClose }) => {
  const [text, setText] = useState<string>("Write your notes here...");
  return (
    <Rnd
      default={{
        x: 100,
        y: 100,
        width: 400,
        height: 300,
      }}
      bounds="parent"
      dragHandleClassName="handle"
      className={`bg-slate-900 border border-slate-700 rounded-lg shadow-xl`}>
      <section className="border border-gray-500 min-h-80 w-120 bg-slate-800">
        <div className="handle cursor-grab flex items-center justify-between px-2 py-1">
          <p>Notes</p>
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
        <div className="p-2">
          <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-70 outline-none"
          name=""
          id=""></textarea>
        </div>
      </section>
    </Rnd>
  );
};

export default Notes;

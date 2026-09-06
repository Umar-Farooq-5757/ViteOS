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
        x: 400,
        y: 400,
        width: 400,
        height: 300,
      }}
      bounds="parent"
      dragHandleClassName="handle">
      <section className="flex flex-col h-120 bg-slate-700 text-white select-none w-150 border border-slate-700 rounded-lg shadow-xl">
        <div className="handle cursor-grab flex items-center justify-between px-4 py-2 bg-slate-900">
          <div className="flex items-center gap-2">
            <img className="size-5" src="/img/notes.png" alt="clock" />
            <span className="text-sm font-medium">Notes</span>
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
        <div className="h-0.5 w-full bg-slate-700"></div>
        <div className="p-2 bg-slate-800 rounded-b-lg">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-105 outline-none"
            name=""
            id=""></textarea>
        </div>
      </section>
    </Rnd>
  );
};

export default Notes;

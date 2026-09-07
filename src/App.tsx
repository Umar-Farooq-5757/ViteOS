import { useState } from "react";
import "./App.css";
import Notes from "./components/Notes";
import Clock from "./components/Clock";
import Photos from "./components/Photos";

function App() {
  const [isNotesOpen, setIsNotesOpen] = useState<boolean>(true);
  const [isClockOpen, setIsClockOpen] = useState<boolean>(false);
  const [isPhotosOpen, setIsPhotosOpen] = useState<boolean>(false);
  return (
    <main className="bg-slate-900 text-white min-h-screen p-6">
      <div className="flex justify-start flex-col items-start gap-6">
        <div
          onClick={() => setIsNotesOpen(true)}
          onDoubleClick={() => setIsNotesOpen(true)}
          className="flex flex-col items-center">
          <img className="size-14" src="/img/notes.png" alt="" />
          <p className="text-sm">Notes</p>
        </div>
        <div
          onClick={() => setIsClockOpen(true)}
          onDoubleClick={() => setIsClockOpen(true)}
          className="flex flex-col items-center">
          <img className="size-14" src="/img/clock.png" alt="" />
          <p className="text-sm">Clock</p>
        </div>
        <div
          onClick={() => setIsPhotosOpen(true)}
          onDoubleClick={() => setIsPhotosOpen(true)}
          className="flex flex-col items-center">
          <img className="size-14" src="/img/photos.png" alt="" />
          <p className="text-sm">Photos</p>
        </div>
      </div>
      {isNotesOpen && <Notes onClose={() => setIsNotesOpen(false)} />}
      {isPhotosOpen && <Photos onClose={() => setIsPhotosOpen(false)} />}
      {isClockOpen && <Clock onClose={() => setIsClockOpen(false)} />}
    </main>
  );
}

export default App;
import { useState } from "react";
import "./App.css";
import Notes from "./apps/Notes";
import Photos from "./apps/Photos";
import Clock from "./apps/Clock";
import Ambience from "./apps/Ambience";
import ViteOSRelay from "./apps/ViteOSRelay";
import UniqueClock from "./components/UniqueClock";

function App() {
  const [isNotesOpen, setIsNotesOpen] = useState<boolean>(false);
  const [isClockOpen, setIsClockOpen] = useState<boolean>(false);
  const [isPhotosOpen, setIsPhotosOpen] = useState<boolean>(false);
  const [isAmbienceOpen, setIsAmbienceOpen] = useState<boolean>(false);
  const [isViteOSRelayOpen, setIsViteOSRelayOpen] = useState<boolean>(false);
  return (
    <main className="text-white min-h-screen p-2">
      <div className="flex justify-start flex-col items-center max-w-26 gap-6">
        <div
          onClick={() => setIsNotesOpen(true)}
          onDoubleClick={() => setIsNotesOpen(true)}
          className="flex flex-col items-center gap-2">
          <img className="size-14" src="/apps/notes.png" alt="" />
          <p className="text-xs">Notes</p>
        </div>
        <div
          onClick={() => setIsClockOpen(true)}
          onDoubleClick={() => setIsClockOpen(true)}
          className="flex flex-col items-center gap-2">
          <img className="size-14" src="/apps/clock.png" alt="" />
          <p className="text-xs">Clock</p>
        </div>
        <div
          onClick={() => setIsPhotosOpen(true)}
          onDoubleClick={() => setIsPhotosOpen(true)}
          className="flex flex-col items-center gap-2">
          <img className="size-14" src="/apps/photos.png" alt="" />
          <p className="text-xs">Photos</p>
        </div>
        <div
          onClick={() => setIsAmbienceOpen(true)}
          onDoubleClick={() => setIsAmbienceOpen(true)}
          className="flex flex-col items-center gap-2">
          <img className="size-14" src="/apps/ambience.png" alt="" />
          <p className="text-xs">Ambience</p>
        </div>
        <div
          onClick={() => setIsViteOSRelayOpen(true)}
          onDoubleClick={() => setIsViteOSRelayOpen(true)}
          className="flex flex-col items-center gap-2">
          <img className="size-14" src="/apps/viteosrelay.png" alt="" />
          <p className="text-xs">ViteOS Relay</p>
        </div>
      </div>
      <UniqueClock />
      {isNotesOpen && <Notes onClose={() => setIsNotesOpen(false)} />}
      {isPhotosOpen && <Photos onClose={() => setIsPhotosOpen(false)} />}
      {isClockOpen && <Clock onClose={() => setIsClockOpen(false)} />}
      {isAmbienceOpen && <Ambience onClose={() => setIsAmbienceOpen(false)} />}
      {isViteOSRelayOpen && (
        <ViteOSRelay onClose={() => setIsViteOSRelayOpen(false)} />
      )}
    </main>
  );
}

export default App;

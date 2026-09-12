import { useState } from "react";
import "./App.css";
import Notes from "./apps/Notes";
import Photos from "./apps/Photos";
import Clock from "./apps/Clock";
import Ambience from "./apps/Ambience";
import ViteOSRelay from "./apps/ViteOSRelay";
import UniqueClock from "./components/UniqueClock";
import NpmExplorer from "./apps/NpmExplorer";
import Compiler from "./apps/Compiler";
import { cn } from "./lib/utils";

function App() {
  const [isNotesOpen, setIsNotesOpen] = useState<boolean>(false);
  const [isClockOpen, setIsClockOpen] = useState<boolean>(false);
  const [isPhotosOpen, setIsPhotosOpen] = useState<boolean>(false);
  const [isAmbienceOpen, setIsAmbienceOpen] = useState<boolean>(false);
  const [isViteOSRelayOpen, setIsViteOSRelayOpen] = useState<boolean>(false);
  const [isNpmExplorerOpen, setIsNpmExplorerOpen] = useState<boolean>(false);
  const [isCompilerOpen, setIsCompilerOpen] = useState<boolean>(false);

  const [style, setStyle] = useState("98");
  return (
    <main
      className={cn(
        "min-h-screen p-2",
        style === "vite" && "bg-[#090E1B] text-white vite-font",
        style === "98" && "bg-[#098387] old-font text-black",
      )}>
      <div className="flex justify-start flex-col items-center max-w-26 gap-6">
        <div
          onClick={() => setIsNpmExplorerOpen(true)}
          onDoubleClick={() => setIsNpmExplorerOpen(true)}
          className="flex flex-col items-center gap-2">
          <img className="size-14" src="/apps/npmexplorer.png" alt="" />
          <p className="text-xs">Npm Explorer</p>
        </div>
        <div
          onClick={() => setIsViteOSRelayOpen(true)}
          onDoubleClick={() => setIsViteOSRelayOpen(true)}
          className="flex flex-col items-center gap-2">
          <img className="size-14" src="/apps/viteosrelay.png" alt="" />
          <p className="text-xs">ViteOS Relay</p>
        </div>
        <div
          onClick={() => setIsAmbienceOpen(true)}
          onDoubleClick={() => setIsAmbienceOpen(true)}
          className="flex flex-col items-center gap-2">
          <img className="size-14" src="/apps/ambience.png" alt="" />
          <p className="text-xs">Ambience</p>
        </div>
        <div
          onClick={() => setIsCompilerOpen(true)}
          onDoubleClick={() => setIsCompilerOpen(true)}
          className="flex flex-col items-center gap-2">
          <img className="size-14" src="/apps/compiler.png" alt="" />
          <p className="text-xs">Compiler</p>
        </div>
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
      </div>
      {style === "vite" && <UniqueClock />}
      <div className="fixed bottom-4 left-4 flex flex-col items-center">
        <div className="bg-white/20 backdrop-blur-md overflow-hidden rounded-md flex items-center transition-all duration-500">
          <button
            onClick={() => setStyle("vite")}
            className={`${style === "vite" && "bg-white/35"} p-3 transition-all duration-500`}>
            <img className="size-7" src="/favicon.svg" alt="" />
          </button>
          <button
            onClick={() => setStyle("98")}
            className={`${style === "98" && "bg-white/35"} p-3 transition-all duration-500`}>
            {" "}
            <img className="size-7" src="/w98.png" alt="" />
          </button>
        </div>
          <p className="text-sm opacity-60">Change style</p>
      </div>
      {isNotesOpen && <Notes onClose={() => setIsNotesOpen(false)} />}
      {isPhotosOpen && (
        <Photos style={style} onClose={() => setIsPhotosOpen(false)} />
      )}
      {isClockOpen && (
        <Clock style={style} onClose={() => setIsClockOpen(false)} />
      )}
      {isAmbienceOpen && <Ambience onClose={() => setIsAmbienceOpen(false)} />}
      {isViteOSRelayOpen && (
        <ViteOSRelay onClose={() => setIsViteOSRelayOpen(false)} />
      )}
      {isNpmExplorerOpen && (
        <NpmExplorer onClose={() => setIsNpmExplorerOpen(false)} />
      )}
      {isCompilerOpen && <Compiler onClose={() => setIsCompilerOpen(false)} />}
    </main>
  );
}

export default App;

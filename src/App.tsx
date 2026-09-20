import { useRef, useState } from "react";
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
import Browser from "./apps/Browser";
import StorageLab from "./apps/StorageLab";

function App() {
  const [isNotesOpen, setIsNotesOpen] = useState<boolean>(false);
  const [isClockOpen, setIsClockOpen] = useState<boolean>(false);
  const [isPhotosOpen, setIsPhotosOpen] = useState<boolean>(false);
  const [isAmbienceOpen, setIsAmbienceOpen] = useState<boolean>(false);
  const [isViteOSRelayOpen, setIsViteOSRelayOpen] = useState<boolean>(false);
  const [isNpmExplorerOpen, setIsNpmExplorerOpen] = useState<boolean>(false);
  const [isCompilerOpen, setIsCompilerOpen] = useState<boolean>(false);
  const [isBrowserOpen, setIsBrowserOpen] = useState<boolean>(false);
  const [isStorageLabOpen, setIsStorageLabOpen] = useState<boolean>(false);

  const [style, setStyle] = useState<string>(
    localStorage.getItem("uiStyle") || "vite",
  );

  const [windowZIndexes, setWindowZIndexes] = useState<Record<string, number>>(
    {},
  );
  const nextZIndex = useRef(100);
  const bringToFront = (windowId: string) => {
    nextZIndex.current += 1;
    setWindowZIndexes((prev) => ({ ...prev, [windowId]: nextZIndex.current }));
  };
  return (
    <main
      className={cn(
        "min-h-screen p-2",
        style === "vite" && "bg-[#090E1B] text-white vite-font",
        style === "98" && "bg-[#098387] old-font text-black",
      )}>
      <div className="flex justify-start flex-col items-center max-w-26 gap-6 max-h-[90vh] flex-wrap">
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
        <div
          onClick={() => setIsBrowserOpen(true)}
          onDoubleClick={() => setIsBrowserOpen(true)}
          className="flex flex-col items-center gap-2">
          <img className="size-14" src="/apps/browser.png" alt="" />
          <p className="text-xs">Browser</p>
        </div>
        <div
          onClick={() => setIsStorageLabOpen(true)}
          onDoubleClick={() => setIsStorageLabOpen(true)}
          className="flex flex-col items-center gap-2">
          <img className="size-14" src="/apps/storagelab.png" alt="" />
          <p className="text-xs">Storage Lab</p>
        </div>
      </div>
      {style === "vite" && <UniqueClock />}
      <div className="fixed bottom-4 left-4 flex flex-col gap-1 items-center">
        <div className="bg-white/20 backdrop-blur-md overflow-hidden rounded-md flex items-center transition-all duration-500">
          <button
            onClick={() => {
              setStyle("vite");
              localStorage.setItem("uiStyle", "vite");
            }}
            className={`${style === "vite" && "bg-white/35"} p-2 transition-all duration-500`}>
            <img className="size-6" src="/favicon.svg" alt="" />
          </button>
          <button
            onClick={() => {
              setStyle("98");
              localStorage.setItem("uiStyle", "98");
            }}
            className={`${style === "98" && "bg-white/35"} p-2 transition-all duration-500`}>
            <img className="size-6" src="/w98.png" alt="" />
          </button>
        </div>
        <p className="text-xs opacity-60">Change style</p>
      </div>
      {isNotesOpen && (
        <Notes
          onClose={() => setIsNotesOpen(false)}
          style={style}
          onFocus={() => bringToFront("notes")}
          zIndex={windowZIndexes.notes ?? 100}
        />
      )}
      {isPhotosOpen && (
        <Photos
          onClose={() => setIsPhotosOpen(false)}
          style={style}
          onFocus={() => bringToFront("photos")}
          zIndex={windowZIndexes.photos ?? 100}
        />
      )}
      {isClockOpen && (
        <Clock
          onClose={() => setIsClockOpen(false)}
          style={style}
          onFocus={() => bringToFront("clock")}
          zIndex={windowZIndexes.clock ?? 100}
        />
      )}
      {isAmbienceOpen && (
        <Ambience
          style={style}
          onClose={() => setIsAmbienceOpen(false)}
          onFocus={() => bringToFront("ambience")}
          zIndex={windowZIndexes.ambience ?? 100}
        />
      )}
      {isViteOSRelayOpen && (
        <ViteOSRelay
          style={style}
          onClose={() => setIsViteOSRelayOpen(false)}
          onFocus={() => bringToFront("viteosrelay")}
          zIndex={windowZIndexes.viteosrelay ?? 100}
        />
      )}
      {isNpmExplorerOpen && (
        <NpmExplorer
          style={style}
          onClose={() => setIsNpmExplorerOpen(false)}
          onFocus={() => bringToFront("npmexplorer")}
          zIndex={windowZIndexes.npmexplorer ?? 100}
        />
      )}
      {isCompilerOpen && (
        <Compiler
          style={style}
          onClose={() => setIsCompilerOpen(false)}
          onFocus={() => bringToFront("compiler")}
          zIndex={windowZIndexes.compiler ?? 100}
        />
      )}
      {isBrowserOpen && (
        <Browser
          style={style}
          onClose={() => setIsBrowserOpen(false)}
          onFocus={() => bringToFront("browser")}
          zIndex={windowZIndexes.browser ?? 100}
        />
      )}
      {isStorageLabOpen && (
        <StorageLab
          style={style}
          onClose={() => setIsStorageLabOpen(false)}
          onFocus={() => bringToFront("storagelab")}
          zIndex={windowZIndexes.storagelab ?? 100}
        />
      )}
    </main>
  );
}

export default App;

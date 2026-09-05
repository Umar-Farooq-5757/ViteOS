import { useState } from "react";
import "./App.css";
import Notes from "./components/Notes";

function App() {
  const [isNotesOpen, setIsNotesOpen] = useState<boolean>(false);
  return (
    <main className="bg-slate-900 text-white min-h-screen p-4">
      <div className="flex justify-start flex-col items-start gap-4">
        <div
          onClick={() => setIsNotesOpen(true)}
          onDoubleClick={() => setIsNotesOpen(true)}
          className="flex flex-col items-center">
          <img className="size-14" src="/img/notes.png" alt="" />
          <p className="text-sm">Notes</p>
        </div>
      </div>
      {isNotesOpen && <Notes onClose={() => setIsNotesOpen(false)} />}
    </main>
  );
}

export default App;

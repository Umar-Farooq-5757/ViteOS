import type React from "react";
import { useState, useEffect } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { Rnd } from "react-rnd";

interface NotesProps {
  onClose: () => void;
}
interface Note {
  title: string;
  content: string;
}

const Notes: React.FC<NotesProps> = ({ onClose }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [prevSize, setPrevSize] = useState<{
    width: number | string;
    height: number | string;
    x: number;
    y: number;
  }>({
    width: 400,
    height: 300,
    x: 250,
    y: 250,
  });
  const [currentSize, setCurrentSize] = useState<{
    width: number | string;
    height: number | string;
    x: number;
    y: number;
  }>({
    width: 400,
    height: 300,
    x: 250,
    y: 250,
  });

  const toggleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMaximized) {
      setCurrentSize(prevSize);
      setIsMaximized(false);
    } else {
      setPrevSize({
        width: currentSize.width,
        height: currentSize.height,
        x: currentSize.x,
        y: currentSize.y,
      });
      setIsMaximized(true);
    }
  };

  const [notes, setNotes] = useState<Note[]>(() => {
    const savedNotes = localStorage.getItem("my_app_notes");
    if (savedNotes) {
      try {
        return JSON.parse(savedNotes);
      } catch (e) {
        console.error("Failed to parse notes from localStorage", e);
      }
    }
    return [
      { title: "note1", content: "this is content of note 1" },
      { title: "note2", content: "this is content of note 2" },
    ];
  });

  const [currentNote, setCurrentNote] = useState<string>(
    notes.length > 0 ? notes[0].title : "",
  );

  const activeNote = notes.find((n) => n.title === currentNote) || notes[0];

  const [titleInput, setTitleInput] = useState<string>(activeNote?.title || "");
  const [contentInput, setContentInput] = useState<string>(
    activeNote?.content || "",
  );

  useEffect(() => {
    localStorage.setItem("my_app_notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (activeNote) {
      setTitleInput(activeNote.title);
      setContentInput(activeNote.content);
    }
  }, [currentNote, notes]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitleInput(newTitle);
    setNotes(
      notes.map((n) =>
        n.title === currentNote ? { ...n, title: newTitle } : n,
      ),
    );
    setCurrentNote(newTitle);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContentInput(newContent);
    setNotes(
      notes.map((n) =>
        n.title === currentNote ? { ...n, content: newContent } : n,
      ),
    );
  };

  const createNewNote = () => {
    let newTitle = `Note ${notes.length + 1}`;
    while (notes.some((n) => n.title === newTitle)) {
      newTitle += " (1)";
    }
    const newContent = "";
    setNotes((prev) => [...prev, { title: newTitle, content: newContent }]);
    setCurrentNote(newTitle);
    setTitleInput(newTitle);
    setContentInput(newContent);
  };

  const deleteNote = (e: React.MouseEvent, titleToDelete: string) => {
    e.stopPropagation();
    const updatedNotes = notes.filter((n) => n.title !== titleToDelete);
    setNotes(updatedNotes);
    if (currentNote === titleToDelete) {
      setCurrentNote(updatedNotes.length > 0 ? updatedNotes[0].title : "");
    }
  };

  return (
    <Rnd
      size={
        isMaximized
          ? { width: "100%", height: "100%" }
          : { width: currentSize.width, height: currentSize.height }
      }
      position={
        isMaximized ? { x: 0, y: 0 } : { x: currentSize.x, y: currentSize.y }
      }
      onDragStop={(_e, d) => {
        if (!isMaximized) {
          setCurrentSize((prev) => ({ ...prev, x: d.x, y: d.y }));
        }
      }}
      onResizeStop={(_e, _direction, ref, _delta, position) => {
        if (!isMaximized) {
          setCurrentSize({
            width: ref.style.width,
            height: ref.style.height,
            ...position,
          });
        }
      }}
      disableDragging={isMaximized}
      enableResizing={!isMaximized}
      bounds="parent"
      dragHandleClassName="handle">
      <section
        className={`flex flex-col ${isMaximized ? "w-full h-full" : "h-120 w-170"} bg-black text-white border border-slate-700 rounded-lg shadow-xl overflow-hidden select-none`}>
        <div className="handle cursor-grab flex items-center justify-between px-4 py-2 bg-white/4">
          <div className="flex items-center gap-2">
            <img className="size-5" src="/apps/notes.png" alt="clock" />
            <span className="text-sm font-medium">Notes</span>
          </div>
          <div className="flex items-center gap-2 cursor-default">
            <button
              onClick={(e) => e.stopPropagation()}
              className="size-4 bg-yellow-500 rounded-full hover:opacity-80"
            />
            <button
              onClick={toggleMaximize}
              className="size-4 bg-green-500 rounded-full hover:opacity-80"
            />
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
        <div className="rounded-b-lg flex gap-2 p-0.5 h-full overflow-y-auto">
          <div className="bg-white/8 w-40 px-2 py-2 rounded-md overflow-y-auto">
            {notes.map((note) => (
              <div
                key={note.title}
                className={`group flex items-center justify-between hover:bg-white/15 px-2 py-2 rounded-md cursor-pointer ${
                  currentNote === note.title && "bg-white/15"
                }`}
                onClick={() => setCurrentNote(note.title)}>
                <span className="truncate pr-2">{note.title}</span>
                <button
                  onClick={(e) => deleteNote(e, note.title)}
                  className="text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                  <FaTrash className="size-3" />
                </button>
              </div>
            ))}
            <div
              onClick={createNewNote}
              className="hover:bg-slate-700 px-2 py-2 rounded-md border border-dashed border-slate-400 mt-2 cursor-pointer">
              <FaPlus className="size-4 mx-auto" />
            </div>
          </div>
          <div className="bg-white/8 grow px-2 py-1 rounded-md overflow-y-auto">
            {notes.length > 0 ? (
              <div>
                <input
                  type="text"
                  value={titleInput}
                  onChange={handleTitleChange}
                  className="bg-transparent border-b border-slate-600 outline-none w-full mb-2 px-1"
                />
                <textarea
                  value={contentInput}
                  onChange={handleContentChange}
                  className="w-full h-105 outline-none bg-transparent resize-none"
                />
              </div>
            ) : (
              <div className="text-slate-400 text-center mt-20">
                No notes found. Click + to create one.
              </div>
            )}
          </div>
        </div>
      </section>
    </Rnd>
  );
};

export default Notes;

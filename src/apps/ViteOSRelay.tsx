import React, { useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import { supabase } from "../lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { IoClose, IoSendOutline } from "react-icons/io5";
import { FaRegWindowRestore, FaWindowMinimize } from "react-icons/fa";
import { cn } from "../lib/utils";

interface ViteOSRelayProps {
  onClose: () => void;
  style: string;
  onFocus: () => void;
  zIndex: number;
}
interface Message {
  id: string;
  username: string;
  content: string;
  user_color: string;
  created_at: string;
  user_passcode?: string;
}

interface UserProfile {
  username: string;
  color: string;
  passcode: string;
}

const ViteOSRelay: React.FC<ViteOSRelayProps> = ({
  onClose,
  style,
  onFocus,
  zIndex,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");

  // Profile state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [inputUsername, setInputUsername] = useState<string>("");
  const [inputPasscode, setInputPasscode] = useState<string>("");
  const [inputColor, setInputColor] = useState<string>("purple");

  // Validation and UX states
  const [usernameError, setUsernameError] = useState<string>("");
  const [isCheckingUsername, setIsCheckingUsername] = useState<boolean>(false);
  const [isExistingUser, setIsExistingUser] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load existing profile from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("viteos_relay_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.username) {
          setCurrentUser(parsed);
        }
      } catch (e) {
        console.error("Failed to parse stored user profile", e);
      }
    }
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = inputUsername.trim();
    const cleanPasscode = inputPasscode.trim();

    if (!cleanUsername || !cleanPasscode) return;

    setUsernameError("");
    setIsCheckingUsername(true);

    try {
      // Check if username exists
      const { data, error } = await supabase
        .from("messages")
        .select("username, user_color, user_passcode")
        .ilike("username", cleanUsername)
        .limit(1);

      if (error) {
        setUsernameError("Failed to verify username availability.");
        setIsCheckingUsername(false);
        return;
      }

      if (data && data.length > 0) {
        const existingRecord = data[0];

        // Case 1: Restoring an existing account with Passcode
        if (isExistingUser) {
          if (existingRecord.user_passcode === cleanPasscode) {
            const restoredProfile: UserProfile = {
              username: existingRecord.username,
              color: existingRecord.user_color || inputColor,
              passcode: cleanPasscode,
            };
            localStorage.setItem(
              "viteos_relay_user",
              JSON.stringify(restoredProfile),
            );
            setCurrentUser(restoredProfile);
          } else {
            setUsernameError("Incorrect passcode for this username.");
          }
        } else {
          // Case 2: User tried to register an existing name -> Prompt passcode check
          setIsExistingUser(true);
          setUsernameError(
            "This username is claimed! Enter your passcode to claim/restore it.",
          );
        }
        setIsCheckingUsername(false);
        return;
      }

      // Case 3: Brand new username registration
      const profile: UserProfile = {
        username: cleanUsername,
        color: inputColor,
        passcode: cleanPasscode,
      };

      localStorage.setItem("viteos_relay_user", JSON.stringify(profile));
      setCurrentUser(profile);
    } catch (err) {
      console.error(err);
      setUsernameError("An unexpected error occurred.");
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // Fetch initial messages & subscribe to real-time updates
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(50);

      if (!error && data) {
        setMessages(data as Message[]);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const messageText = newMessage;
    setNewMessage("");

    const { error } = await supabase.from("messages").insert([
      {
        username: currentUser.username,
        content: messageText,
        user_color: currentUser.color,
        user_passcode: currentUser.passcode, // Save passcode with messages for context
      },
    ]);

    if (error) {
      console.error("Failed to send message:", error.message);
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case "yellow":
        return {
          text: "text-yellow-400",
          bg: "bg-yellow-500/20 border-yellow-500/30",
        };
      case "blue":
        return { text: "text-sky-400", bg: "bg-sky-500/20 border-sky-500/30" };
      case "emerald":
        return {
          text: "text-emerald-400",
          bg: "bg-emerald-500/20 border-emerald-500/30",
        };
      default:
        return {
          text: "text-purple-400",
          bg: "bg-purple-500/20 border-purple-500/30",
        };
    }
  };

  // Window Resize & Maximize controls
  const [isMaximized, setIsMaximized] = useState(false);
  const [prevSize, setPrevSize] = useState<{
    width: number | string;
    height: number | string;
    x: number;
    y: number;
  }>({
    width: "75vw",
    height: "75vh",
    x: 100,
    y: 50,
  });

  const [currentSize, setCurrentSize] = useState<{
    width: number | string;
    height: number | string;
    x: number;
    y: number;
  }>({
    width: "75vw",
    height: "75vh",
    x: 100,
    y: 50,
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

  return (
    <Rnd
      onMouseDown={onFocus}
      style={{ zIndex }}
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
      dragHandleClassName="handle"
      minWidth={560}
      minHeight={380}>
      <section
        className={cn(
          "flex flex-col w-full h-full select-none border border-white/15 shadow-xl overflow-hidden",
          style === "vite" && "rounded-lg bg-black",
        )}>
        {/* Title Bar */}
        <div
          className={cn(
            "handle cursor-grab flex items-center justify-between px-4 py-1",
            style === "vite" && "bg-white/4",
            style === "98" && "bg-linear-to-r from-[#020D88] to-[#107FCD]",
          )}>
          {style === "vite" && (
            <>
              <div className="flex items-center gap-2">
                <img
                  className="size-5"
                  src="/apps/viteosrelay.png"
                  alt="clock"
                />
                <span className="text-sm font-medium">ViteOS Relay</span>
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
            </>
          )}
          {style === "98" && (
            <>
              <div className="flex items-center gap-2">
                <img
                  className="size-5"
                  src="/apps/viteosrelay.png"
                  alt="clock"
                />
                <span className="text-sm font-medium text-white">
                  ViteOS Relay
                </span>
              </div>
              <div className="flex items-center gap-2 cursor-default">
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#C0C0C0] size-4.5 flex items-center justify-center">
                  <FaWindowMinimize className="text-black size-3" />
                </button>
                <button
                  onClick={toggleMaximize}
                  className="bg-[#C0C0C0] size-4.5 flex items-center justify-center">
                  <FaRegWindowRestore className="text-black size-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="bg-[#C0C0C0] size-4.5 flex items-center justify-center">
                  <IoClose className="text-black size-3" />
                </button>
              </div>
            </>
          )}
        </div>
        {style === "vite" && <div className="h-0.5 w-full bg-white/15" />}
        <div
          className={cn(
            "relative flex-1 min-h-0 flex flex-col",
            style === "vite" && "bg-white/8",
            style === "98" && "bg-[#c0c0c0]",
          )}>
          {/* Compulsory Username Modal Overlay */}
          {!currentUser && (
            <div className="absolute inset-0 z-50 bg-white/4 backdrop-blur-[2px] flex items-center justify-center p-4">
              <form
                onSubmit={handleSaveProfile}
                className={cn(
                  "border p-6 shadow-2xl max-w-sm w-full space-y-4",
                  style === "vite" && "bg-black/90 rounded-xl border-slate-700",
                  style === "98" && "bg-[#c0c0c0] border-[#8a8a8a]",
                )}>
                <div className="space-y-1 text-center">
                  <h3
                    className={cn(
                      "text-lg font-bold",
                      style === "vite" && "text-slate-100",
                      style === "98" && "text-black",
                    )}>
                    {isExistingUser ? "Restore Account" : "Welcome to Relay"}
                  </h3>
                  <p
                    className={cn(
                      "text-sm",
                      style === "vite" && "text-slate-400",
                      style === "98" && "text-black/50",
                    )}>
                    {isExistingUser
                      ? "Enter your passcode to restore your profile"
                      : "Choose a username and secret passcode to continue"}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label
                      className={cn(
                        "block text-sm mb-1",
                        style === "vite" && "text-slate-300 font-semibold",
                        style === "98" && "text-black",
                      )}>
                      Username <span className="text-red-400">*</span>
                    </label>
                    <input
                      required
                      value={inputUsername}
                      onChange={(e) => {
                        setInputUsername(e.target.value);
                        if (usernameError) setUsernameError("");
                        if (isExistingUser) setIsExistingUser(false);
                      }}
                      type="text"
                      placeholder="e.g. alex_dev"
                      className={cn(
                        `w-full border ${
                          usernameError
                            ? "border-red-500 focus:border-red-500"
                            : style === "vite"
                              ? "border-slate-700 focus:border-purple-500"
                              : "border-[#8a8a8a]"
                        } px-3 py-2 text-sm focus:outline-none`,
                        style === "vite" &&
                          "bg-slate-950 text-slate-100 rounded-md",
                        style === "98" && "bg-[#b0b0b0]",
                      )}
                    />
                    {usernameError && (
                      <p className="mt-1 text-[11px] text-red-400">
                        {usernameError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className={cn(
                        "block text-sm mb-1",
                        style === "vite" && "text-slate-300 font-semibold",
                        style === "98" && "text-black",
                      )}>
                      Secret Passcode / PIN{" "}
                      <span className="text-red-400">*</span>
                    </label>
                    <input
                      required
                      value={inputPasscode}
                      onChange={(e) => {
                        setInputPasscode(e.target.value);
                        if (usernameError) setUsernameError("");
                      }}
                      type="password"
                      placeholder="4-digit PIN or password"
                      className={cn(
                        "w-full border px-3 py-2 text-sm focus:outline-none",
                        style === "vite" &&
                          "bg-slate-950 border-slate-700 rounded-md text-slate-100 focus:border-purple-500",
                        style === "98" && "bg-[#b0b0b0] border-[#8a8a8a]",
                      )}
                    />
                  </div>

                  {!isExistingUser && (
                    <div>
                      <label
                        className={cn(
                          "block text-sm mb-1",
                          style === "vite" && "text-slate-300 font-semibold",
                          style === "98" && "text-black",
                        )}>
                        Badge Color
                      </label>
                      <select
                        value={inputColor}
                        onChange={(e) => setInputColor(e.target.value)}
                        className={cn(
                          "w-full border px-3 py-2 text-sm focus:outline-none",
                          style === "vite" &&
                            "bg-slate-950 rounded-md border-slate-700 text-slate-100 focus:border-purple-500",
                          style === "98" && "bg-[#b0b0b0] border-[#8a8a8a]",
                        )}>
                        <option value="purple">Purple</option>
                        <option value="yellow">Yellow</option>
                        <option value="blue">Blue</option>
                        <option value="emerald">Emerald</option>
                      </select>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={
                    !inputUsername.trim() ||
                    !inputPasscode.trim() ||
                    isCheckingUsername
                  }
                  className={cn(
                    "w-full font-semibold py-2 text-sm",
                    style === "vite" &&
                      "bg-purple-600 hover:bg-purple-500 rounded-md text-white disabled:opacity-50",
                    style === "98" &&
                      "bg-[#8a8a8a] text-black disabled:opacity-75 shadow-[1px_1px_1px_1px_black,-1px_-1px_1px_1px_white] active:shadow-[-1px_-1px_1px_1px_black,1px_1px_1px_1px_white]",
                  )}>
                  {isCheckingUsername
                    ? "Verifying..."
                    : isExistingUser
                      ? "Restore Profile"
                      : "Join Channel"}
                </button>
              </form>
            </div>
          )}

          {/* Slack-like Chat Feed */}
          <div className="flex-1 min-h-0 p-4 overflow-y-auto space-y-3">
            {messages.map((msg) => {
              const colorStyle = getColorClasses(msg.user_color);
              const avatarChar = msg.username
                ? msg.username.charAt(0).toUpperCase()
                : "?";

              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex items-start gap-3 group p-1.5",
                    style === "vite" && "hover:bg-white/8 rounded-md",
                    style === "98" && "bg-[#a9a9a9] text-black px-4",
                  )}>
                  {style === "98" && (
                    <div
                      className={`${msg.user_color === "purple" ? "bg-purple-500" : msg.user_color === "yellow" ? "bg-yellow-400" : msg.user_color === "blue" ? "bg-blue-500" : msg.user_color === "emerald" && "bg-emerald-400"} size-2`}></div>
                  )}
                  {/* User Avatar */}
                  {style === "vite" && (
                    <div
                      className={`size-8 rounded-lg flex items-center justify-center font-bold text-sm border ${colorStyle.bg} ${colorStyle.text} shrink-0`}>
                      {avatarChar}
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-baseline gap-2">
                      <span
                        className={cn(
                          `text-sm font-bold`,
                          style === "vite" && `${colorStyle.text}`,
                          style === "98" && "text-black",
                        )}>
                        {msg.username}
                      </span>
                      <span
                        className={cn(
                          "text-[10px]",
                          style === "vite" && "text-slate-500",
                          style === "98" && "text-black",
                        )}>
                        {msg.created_at &&
                          formatDistanceToNow(new Date(msg.created_at), {
                            addSuffix: true,
                          })}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "text-sm leading-relaxed wrap-break-word",
                        style === "vite" && "text-slate-200",
                        style === "98" && "text-black",
                      )}>
                      {msg.content}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className={cn(
              "p-3 border-t border-slate-800",
              style === "vite" && "bg-black/50",
              style === "98" && "bg-[#a9a9a9]",
            )}>
            <div
              className={cn(
                "border border-slate-700/80 p-2",
                style === "vite" &&
                  "bg-white/4 focus-within:border-white rounded-lg",
              )}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={
                  currentUser
                    ? `Message #global as ${currentUser.username}...`
                    : "Type a message..."
                }
                className={cn(
                  "w-full bg-transparent text-sm focus:outline-none",
                  style === "vite" && "text-slate-100 placeholder-slate-500",
                )}
              />
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-800">
                <div
                  className={cn(
                    "text-[10px] font-mono flex items-center gap-1",
                    style === "vite" && "text-slate-400",
                  )}>
                  <span>Posting as</span>
                  {currentUser && (
                    <span
                      className={cn(
                        `font-semibold`,
                        style === "vite" &&
                          `${getColorClasses(currentUser.color).text}`,
                      )}>
                      @{currentUser.username}
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={cn(
                    "px-2.5 py-1 text-sm flex items-center gap-1",
                    style === "vite" &&
                      "text-white bg-purple-600 hover:bg-purple-500 font-semibold cursor-pointer disabled:opacity-40 rounded",
                    style === "98" &&
                      "text-black bg-[#a9a9a9] shadow-[1px_1px_1px_1px_black,-1px_-1px_1px_1px_white] active:shadow-[-1px_-1px_1px_1px_black,1px_1px_1px_1px_white]",
                  )}>
                  Send {style === "vite" && <IoSendOutline size={12} />}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </Rnd>
  );
};

export default ViteOSRelay;

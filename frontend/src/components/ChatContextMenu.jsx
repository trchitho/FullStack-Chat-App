import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";

const ChatContextMenu = ({ position, items, onClose }) => {
  const menuRef = useRef(null);
  useEffect(() => {
    if (!position) return undefined;
    const close = (event) => {
      if (event.key === "Escape" || !menuRef.current?.contains(event.target)) onClose();
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [onClose, position]);
  if (!position) return null;
  return createPortal(
    <div ref={menuRef} role="menu" className="fixed z-[250] min-w-64 rounded-xl border border-base-300 bg-base-100 p-1 shadow-2xl" style={{ left: position.x, top: position.y }}>
      {items.map((item) => (
        <button key={item.label} type="button" role="menuitem" disabled={item.disabled} className="flex min-h-10 w-full items-center justify-between rounded-lg px-3 text-left text-sm hover:bg-base-200 disabled:opacity-40" onClick={() => { item.action(); onClose(); }}>
          <span>{item.label}</span><span className="text-xs opacity-55">{item.shortcut}</span>
        </button>
      ))}
    </div>,
    document.body
  );
};

export default ChatContextMenu;

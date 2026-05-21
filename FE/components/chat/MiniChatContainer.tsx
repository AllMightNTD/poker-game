"use client";
import { useMiniChat } from "./MiniChatContext";
import MiniChatWindow from "./MiniChatWindow";

interface MiniChatContainerProps {
  currentUser?: any;
}

export default function MiniChatContainer({ currentUser }: MiniChatContainerProps) {
  const { activePopups } = useMiniChat();

  if (activePopups.length === 0) return null;

  return (
    <>
      {activePopups.map((contact, i) => {
        // index 0 = rightmost, last = farthest left
        const reversedIndex = activePopups.length - 1 - i;
        return (
          <MiniChatWindow
            key={contact.id}
            contact={contact}
            currentUser={currentUser}
            index={reversedIndex}
          />
        );
      })}
    </>
  );
}

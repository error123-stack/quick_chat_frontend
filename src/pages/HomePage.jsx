import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import { useContext } from "react";
import { ChatContext } from "../context/chatContext";

const HomePage = () => {
  const { selectedUser } = useContext(ChatContext); // ✅ Check if a chat user is selected

  return (
    <div className="app-shell w-full flex bg-[var(--bg-app)] overflow-hidden">
      <div
        className={`h-full w-full grid grid-cols-1 min-w-0 ${
          selectedUser
            ? "md:grid-cols-[minmax(260px,36%)_1fr] lg:grid-cols-[minmax(280px,32%)_1fr xl:grid-cols-[minmax(320px,30%)_1fr]"
            : "md:grid-cols-[minmax(280px,38%)_1fr] lg:grid-cols-[minmax(320px,35%)_1fr]"
        }`}
      >
        <Sidebar />
        <ChatContainer />
      </div>
    </div>
  );
};

export default HomePage;

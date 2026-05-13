import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../dashboard/components/Sidebar";
import TopBar from "../../dashboard/components/TopBar";
import ChatConversationList from "../components/ChatConversationList";
import ChatWindow from "../components/ChatWindow";
import ChatCustomerInfo from "../components/ChatCustomerInfo";
import PageWrapper from "../../../App/Components/ui/PageWrapper";
import { useChat } from "../hooks/useChat";

const ChatScreen = () => {
  const [activeConversation, setActiveConversation] = useState(null);
  const [showInfo, setShowInfo] = useState(true);

  const { getChats, createChat, chats } = useChat();
  const role = useSelector((s) => s.auth.role);

  // Load chats on mount; customers without an active chat get one created
  useEffect(() => {
    getChats({}).catch(() => {});
  }, [getChats]);

  useEffect(() => {
    if (role === "customer" && chats.length === 0) {
      createChat()
        .then((res) => {
          if (res?.data) setActiveConversation(res.data);
        })
        .catch(() => {});
    } else if (!activeConversation && chats.length > 0) {
      setActiveConversation(chats[0]);
    }
  }, [role, chats, activeConversation, createChat]);

  return (
    <PageWrapper>
      <div className="bg-white dark:bg-[#111] text-on-surface min-h-screen font-['Poppins'] flex">
        <Sidebar />

        <div className="ml-64 flex-1 flex flex-col min-h-screen overflow-hidden">
          <TopBar />

          <div
            className="flex flex-1 overflow-hidden"
            style={{ height: "calc(100vh - 64px)" }}
          >
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-[300px] shrink-0 border-r border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#1a1a1a] flex flex-col overflow-hidden"
            >
              <ChatConversationList
                conversations={chats}
                activeId={activeConversation?._id}
                onSelect={(conv) => {
                  setActiveConversation(conv);
                  setShowInfo(true);
                }}
              />
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeConversation?._id || "empty"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="flex-1 flex overflow-hidden"
              >
                <ChatWindow
                  conversation={activeConversation}
                  onClose={() => setActiveConversation(null)}
                />
              </motion.div>
            </AnimatePresence>

            <AnimatePresence>
              {activeConversation && showInfo && role !== "customer" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="w-[260px] shrink-0 border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden flex flex-col"
                >
                  <div className="flex items-center justify-between px-[20px] py-[14px] border-b border-neutral-100">
                    <span className="text-[12px] font-bold uppercase tracking-widest text-neutral-500">
                      Customer
                    </span>
                    <button
                      onClick={() => setShowInfo(false)}
                      className="p-[4px] rounded-lg hover:bg-neutral-100 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px] text-neutral-400">
                        chevron_right
                      </span>
                    </button>
                  </div>
                  <ChatCustomerInfo conversation={activeConversation} />
                </motion.div>
              )}
            </AnimatePresence>

            {activeConversation && !showInfo && role !== "customer" && (
              <button
                onClick={() => setShowInfo(true)}
                className="w-[36px] border-l border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors shrink-0"
                title="Show customer info"
              >
                <span className="material-symbols-outlined text-[18px] text-neutral-400">
                  chevron_left
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ChatScreen;

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
<<<<<<< HEAD
import { useSearchParams } from "react-router-dom";
=======
import { useNavigate, useSearchParams } from "react-router-dom";
>>>>>>> aae7b5cb8fd64ce2fd9c76e4a3b10a264c39f62f
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../dashboard/components/Sidebar";
import TopBar from "../../dashboard/components/TopBar";
import ChatConversationList from "../components/ChatConversationList";
import ChatWindow from "../components/ChatWindow";
import ChatCustomerInfo from "../components/ChatCustomerInfo";
import PageWrapper from "../../../App/Components/ui/PageWrapper";
import { useChat } from "../hooks/useChat";

// Customer landing when they have no conversation open yet.
const CustomerEmpty = ({ onCreate }) => (
  <div className="flex-1 flex flex-col items-center justify-center bg-neutral-50 dark:bg-[#111] gap-[14px] px-6 text-center">
    <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
      <span className="material-symbols-outlined text-[32px] text-neutral-300 dark:text-neutral-600">
        support_agent
      </span>
    </div>
    <div>
      <p className="text-[15px] font-semibold text-neutral-700 dark:text-neutral-200">
        No conversations yet
      </p>
      <p className="text-[12px] text-neutral-400 mt-[2px] max-w-[320px]">
        Create a support ticket and our AI assistant will start helping you right away.
      </p>
    </div>
    <button
      onClick={onCreate}
      className="mt-[4px] flex items-center gap-[8px] bg-black dark:bg-white text-white dark:text-black px-[20px] py-[10px] rounded-xl font-medium text-[13px] transition-transform active:scale-95 hover:opacity-90"
    >
      <span className="material-symbols-outlined text-[18px]">add</span>
      Create a Ticket
    </button>
  </div>
);

const ChatScreen = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chatParam = searchParams.get("chat");

  const [activeConversation, setActiveConversation] = useState(null);
  const [showInfo, setShowInfo] = useState(true);

  const { getChats, getChat, chats } = useChat();
  const role = useSelector((s) => s.auth.role);
  const isCustomer = role === "customer";

<<<<<<< HEAD
  // Deep link from a ticket row: /dashboard/chat?chat=<chatId>
  const [searchParams] = useSearchParams();
  const requestedChatId = searchParams.get("chat");

  // Load chats on mount; customers without an active chat get one created
=======
>>>>>>> aae7b5cb8fd64ce2fd9c76e4a3b10a264c39f62f
  useEffect(() => {
    getChats({}).catch(() => {});
  }, [getChats]);

<<<<<<< HEAD
  // Honour the deep link first, then fall back to the default selection.
  useEffect(() => {
    if (requestedChatId) {
      if (activeConversation?._id === requestedChatId) return;
      const target = chats.find((c) => c._id === requestedChatId);
      if (target) {
        setActiveConversation(target);
        return;
      }
      // Chats not loaded yet — wait rather than selecting the wrong thread.
      if (chats.length === 0) return;
    }

    if (role === "customer" && chats.length === 0) {
      createChat()
        .then((res) => {
          if (res?.data) setActiveConversation(res.data);
        })
        .catch(() => {});
    } else if (!activeConversation && chats.length > 0) {
      setActiveConversation(chats[0]);
    }
  }, [role, chats, activeConversation, createChat, requestedChatId]);
=======
  // Open the deep-linked chat (from a ticket row), else the most recent one.
  useEffect(() => {
    if (chatParam) {
      if (activeConversation?._id === chatParam) return;
      const found = chats.find((c) => c._id === chatParam);
      if (found) {
        setActiveConversation(found);
      } else {
        getChat(chatParam)
          .then((res) => {
            if (res?.data?.chat) setActiveConversation(res.data.chat);
          })
          .catch(() => {});
      }
      return;
    }
    if (!activeConversation && chats.length > 0) setActiveConversation(chats[0]);
  }, [chatParam, chats, activeConversation, getChat]);
>>>>>>> aae7b5cb8fd64ce2fd9c76e4a3b10a264c39f62f

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
            {/* Conversation list — hidden for customers (single support thread) */}
            {!isCustomer && (
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
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={activeConversation?._id || "empty"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="flex-1 flex overflow-hidden"
              >
                {isCustomer && !activeConversation ? (
                  <CustomerEmpty onCreate={() => navigate("/dashboard/tickets")} />
                ) : (
                  <ChatWindow
                    conversation={activeConversation}
                    onClose={
                      isCustomer ? undefined : () => setActiveConversation(null)
                    }
                  />
                )}
              </motion.div>
            </AnimatePresence>

            <AnimatePresence>
              {activeConversation && showInfo && !isCustomer && (
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

            {activeConversation && !showInfo && !isCustomer && (
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

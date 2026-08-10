import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../dashboard/components/Sidebar";
import TopBar from "../../dashboard/components/TopBar";
import ChatConversationList from "../components/ChatConversationList";
import ChatCustomerList from "../components/ChatCustomerList";
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
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  const {
    getChats,
    clearChatList,
    getChatCustomers,
    getChat,
    chats,
    customers,
    customersLoading,
  } = useChat();
  const role = useSelector((s) => s.auth.role);
  const isCustomer = role === "customer";

  // Staff browse by customer first; the conversation list is scoped to whoever
  // is selected. Customers only ever have their own thread, so they skip both
  // the customer column and the scoping.
  useEffect(() => {
    if (isCustomer) {
      getChats({}).catch(() => {});
      return;
    }
    // A deep link (?chat=…) needs the full list to resolve the conversation, so
    // don't scope until the operator has actually picked somebody.
    if (selectedCustomerId) {
      getChats({ customerId: selectedCustomerId }).catch(() => {});
    } else if (chatParam) {
      getChats({}).catch(() => {});
    }
  }, [getChats, isCustomer, selectedCustomerId, chatParam]);

  useEffect(() => {
    if (!isCustomer) getChatCustomers({}).catch(() => {});
  }, [getChatCustomers, isCustomer]);

  // Single entry point for opening a thread. Staff arriving via a deep link
  // (?chat=… from a ticket row) also get that customer lit up in the column,
  // so the three panes never disagree about who is being looked at.
  const openConversation = useCallback(
    (conv) => {
      if (!conv) return;
      setActiveConversation(conv);
      if (!isCustomer) {
        const ownerId = conv.user?._id || conv.user || null;
        if (ownerId) setSelectedCustomerId(String(ownerId));
      }
    },
    [isCustomer]
  );

  // Open the deep-linked chat (from a ticket row), else the most recent one.
  useEffect(() => {
    if (chatParam) {
      if (activeConversation?._id === chatParam) return;
      const found = chats.find((c) => c._id === chatParam);
      if (found) {
        openConversation(found);
      } else {
        getChat(chatParam)
          .then((res) => {
            if (res?.data?.chat) openConversation(res.data.chat);
          })
          .catch(() => {});
      }
      return;
    }
    // Staff only get an auto-selected conversation once they have picked a
    // customer — otherwise the page would open somebody's thread at random.
    if (!isCustomer && !selectedCustomerId) return;
    // Guard against opening a stale chat left over from a previous customer
    // while the newly selected customer's list is still loading.
    if (!isCustomer && selectedCustomerId) {
      const owner = chats[0]?.user?._id || chats[0]?.user;
      if (owner && String(owner) !== String(selectedCustomerId)) return;
    }
    if (!activeConversation && chats.length > 0) openConversation(chats[0]);
  }, [
    chatParam,
    chats,
    activeConversation,
    getChat,
    openConversation,
    isCustomer,
    selectedCustomerId,
  ]);

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
            {/* Customer column — staff pick a person before seeing threads */}
            {!isCustomer && (
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="w-[240px] shrink-0 border-r border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#1a1a1a] flex flex-col overflow-hidden"
              >
                <ChatCustomerList
                  customers={customers}
                  loading={customersLoading}
                  selectedId={selectedCustomerId}
                  onSelect={(customer) => {
                    setSelectedCustomerId(customer._id);
                    // The previously open thread belongs to somebody else —
                    // drop the stale chat list too, so the auto-select effect
                    // can't open the previous customer's first chat while the
                    // new customer's list is still loading.
                    clearChatList();
                    setActiveConversation(null);
                    setShowInfo(true);
                  }}
                />
              </motion.div>
            )}

            {/* Conversation list — hidden for customers (single support thread) */}
            {!isCustomer && (
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, ease: "easeOut", delay: 0.05 }}
                className="w-[300px] shrink-0 border-r border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#1a1a1a] flex flex-col overflow-hidden"
              >
                <ChatConversationList
                  // Empty until a customer is chosen, rather than every
                  // conversation in the company at once.
                  conversations={selectedCustomerId ? chats : []}
                  activeId={activeConversation?._id}
                  emptyLabel={
                    selectedCustomerId
                      ? "This customer has no conversations yet."
                      : "Select a customer to see their conversations."
                  }
                  onSelect={(conv) => {
                    openConversation(conv);
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
                  <div className="flex items-center justify-between px-[20px] py-[14px] border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-[12px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      Customer
                    </span>
                    <button
                      onClick={() => setShowInfo(false)}
                      className="p-[4px] rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
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
                className="w-[36px] border-l border-neutral-200 dark:border-neutral-800 flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shrink-0"
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

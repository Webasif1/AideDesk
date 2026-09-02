import { useCallback, useEffect, useMemo, useState } from "react";
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

// Header strip inside an expanded left panel, carrying its collapse control.
const PanelCollapseBar = ({ label, onCollapse }) => (
  <div className="flex items-center justify-between px-[16px] pt-[14px] pb-[6px] shrink-0">
    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
      {label}
    </span>
    <button
      onClick={onCollapse}
      title={`Collapse ${label}`}
      className="p-[4px] rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
    >
      <span className="material-symbols-outlined text-[16px] text-neutral-400">
        chevron_left
      </span>
    </button>
  </div>
);

// The 36px stub a collapsed panel leaves behind, mirroring the info panel's rail.
const CollapsedRail = ({ label, icon, onExpand }) => (
  <button
    onClick={onExpand}
    title={`Show ${label}`}
    className="w-[36px] shrink-0 border-r border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#1a1a1a] flex flex-col items-center gap-[10px] pt-[14px] hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
  >
    <span className="material-symbols-outlined text-[18px] text-neutral-400">
      chevron_right
    </span>
    <span className="material-symbols-outlined text-[18px] text-neutral-400">
      {icon}
    </span>
    <span
      className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 whitespace-nowrap"
      style={{ writingMode: "vertical-rl" }}
    >
      {label}
    </span>
  </button>
);

const ChatScreen = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const chatParam = searchParams.get("chat");
  // A ticket row whose chat was never created deep-links by customer instead.
  const customerParam = searchParams.get("customer");

  const [activeConversation, setActiveConversation] = useState(null);
  const [showInfo, setShowInfo] = useState(true);
  // Seeded from ?customer= so a ticket with no thread lands on its customer.
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    customerParam || null
  );
  const [customersOpen, setCustomersOpen] = useState(true);
  const [conversationsOpen, setConversationsOpen] = useState(true);

  const {
    getChats,
    clearChatList,
    getChatCustomers,
    ensureCustomerChats,
    getChat,
    chats,
    customers,
    customersLoading,
    customersError,
  } = useChat();
  const role = useSelector((s) => s.auth.role);
  const isCustomer = role === "customer";

  // Staff browse by customer first; the conversation list is scoped to whoever
  // is selected — the company-wide list is never fetched here. Customers only
  // ever have their own threads, so they skip both the column and the scoping.
  useEffect(() => {
    if (isCustomer) {
      getChats({}).catch(() => {});
      return;
    }
    if (!selectedCustomerId) return;

    // Open any thread this customer's tickets are missing before listing, so a
    // ticket that never got a chat still shows up as a conversation instead of
    // counting in the badge and rendering nothing. Idempotent, and a failure
    // here must not stop the existing threads from loading.
    let cancelled = false;
    ensureCustomerChats(selectedCustomerId)
      .catch(() => {})
      .finally(() => {
        if (!cancelled) getChats({ customerId: selectedCustomerId }).catch(() => {});
      });

    return () => {
      cancelled = true;
    };
  }, [getChats, ensureCustomerChats, isCustomer, selectedCustomerId]);

  useEffect(() => {
    if (!isCustomer) getChatCustomers({}).catch(() => {});
  }, [getChatCustomers, isCustomer]);

  // Arriving from a ticket that has no thread yet (?customer=…): the param seeds
  // the selection above, which runs the ensure-then-list effect. Drop it from the
  // URL once consumed, so a later customer click isn't snapped back to this one.
  useEffect(() => {
    if (customerParam) setSearchParams({}, { replace: true });
  }, [customerParam, setSearchParams]);

  // What the middle column is allowed to render. A scoped fetch can still be in
  // flight (or have landed out of order after a fast customer switch), and
  // anything belonging to somebody else would otherwise show up under the
  // selected customer's name.
  const visibleConversations = useMemo(() => {
    if (isCustomer) return chats;
    if (!selectedCustomerId) return [];
    return chats.filter(
      (conv) =>
        String(conv.user?._id || conv.user || "") === String(selectedCustomerId)
    );
  }, [chats, isCustomer, selectedCustomerId]);

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

  // A ticket row deep-links straight to its conversation (?chat=…). Fetch that
  // one chat rather than pulling the whole company list down to search it — the
  // response also tells us who the customer is, which is what scopes the other
  // panels. The param is dropped as soon as it is consumed: leaving it in the
  // URL made every later customer click snap back to this same thread.
  useEffect(() => {
    if (!chatParam) return;
    let cancelled = false;
    getChat(chatParam)
      .then((res) => {
        if (!cancelled && res?.data?.chat) openConversation(res.data.chat);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setSearchParams({}, { replace: true });
      });
    return () => {
      cancelled = true;
    };
  }, [chatParam, getChat, openConversation, setSearchParams]);

  // Otherwise open the most recent conversation. Staff only get one once they
  // have picked a customer — before that the page would open a thread at random.
  useEffect(() => {
    if (chatParam || activeConversation) return;
    if (!isCustomer && !selectedCustomerId) return;
    if (visibleConversations.length > 0)
      openConversation(visibleConversations[0]);
  }, [
    chatParam,
    activeConversation,
    visibleConversations,
    openConversation,
    isCustomer,
    selectedCustomerId,
  ]);

  return (
    <PageWrapper>
      <div className="bg-white dark:bg-[#111] text-on-surface h-screen overflow-hidden font-['Poppins'] flex">
        <Sidebar />

        <div className="ml-64 flex-1 flex flex-col min-h-0 overflow-hidden">
          <TopBar />

          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Customer column — staff pick a person before seeing threads */}
            {!isCustomer && !customersOpen && (
              <CollapsedRail
                label="Customers"
                icon="group"
                onExpand={() => setCustomersOpen(true)}
              />
            )}
            {!isCustomer && customersOpen && (
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="w-[240px] shrink-0 border-r border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#1a1a1a] flex flex-col overflow-hidden"
              >
                <PanelCollapseBar
                  label="Customers"
                  onCollapse={() => setCustomersOpen(false)}
                />
                <ChatCustomerList
                  customers={customers}
                  loading={customersLoading}
                  error={customersError}
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
            {!isCustomer && !conversationsOpen && (
              <CollapsedRail
                label="Conversations"
                icon="forum"
                onExpand={() => setConversationsOpen(true)}
              />
            )}
            {!isCustomer && conversationsOpen && (
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, ease: "easeOut", delay: 0.05 }}
                className="w-[300px] shrink-0 border-r border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#1a1a1a] flex flex-col overflow-hidden"
              >
                <PanelCollapseBar
                  label="Conversations"
                  onCollapse={() => setConversationsOpen(false)}
                />
                <ChatConversationList
                  // Empty until a customer is chosen, rather than every
                  // conversation in the company at once.
                  conversations={visibleConversations}
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

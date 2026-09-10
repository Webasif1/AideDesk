import { useLocation } from "react-router-dom";
import PageWrapper from "../../../App/Components/ui/PageWrapper";
import VerifyEmailCard from "../components/VerifyEmailCard";
import { motion } from "framer-motion";

const VerifyEmail = () => {
  const location = useLocation();
  // No fallback address. This defaulted to "user@example.com", so anyone who
  // reloaded this page or reached it directly was told a verification link had
  // been sent to an address that does not exist.
  const email = location.state?.email || null;

  return (
    <PageWrapper>
      <div className="min-h-screen flex items-center justify-center p-[16px] bg-surface-container-lowest">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <VerifyEmailCard email={email} />
        </motion.div>
      </div>
    </PageWrapper>
  );
};

export default VerifyEmail;

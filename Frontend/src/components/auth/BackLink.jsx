import { Link } from "react-router-dom";

const BackLink = ({ to = "/" }) => {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors w-fit mb-[48px] group"
    >
      <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-1 transition-transform">
        arrow_back
      </span>
      <span className="text-[13px]">Back</span>
    </Link>
  );
};

export default BackLink;

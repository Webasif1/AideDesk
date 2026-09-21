import { Link } from "react-router-dom";

// The mark is three stacked capsules in the brand greens. `onDark` swaps the
// bottom capsule and wordmark to mint for use on forest backgrounds (the app
// sidebar, auth panels, the marketing hero).
export const LogoMark = ({ size = 32, onDark = false }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <rect x="3" y="3" width="26" height="11" rx="5.5" fill="#235347" />
    <rect x="3" y="10.5" width="26" height="11" rx="5.5" fill="#8EB69B" />
    <rect x="3" y="18" width="26" height="11" rx="5.5" fill={onDark ? "#DAF1DE" : "#0B2B26"} />
  </svg>
);

const Logo = ({ size = "md", linkTo = "/", onDark = false }) => {
  const sizes = {
    sm: { mark: 20, text: "text-sm" },
    md: { mark: 30, text: "text-[19px]" },
    lg: { mark: 34, text: "text-[21px]" },
  };

  const s = sizes[size];

  return (
    <Link to={linkTo} className="flex items-center gap-2.5 w-fit" aria-label="AideDesk home">
      <LogoMark size={s.mark} onDark={onDark} />
      <span
        className={`font-display font-extrabold tracking-[-0.02em] ${s.text} ${
          onDark ? "text-mint" : "text-on-surface"
        }`}
      >
        AideDesk
      </span>
    </Link>
  );
};

export default Logo;

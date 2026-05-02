import { Link } from "react-router-dom";

const Logo = ({ size = "md", linkTo = "/" }) => {
  const sizes = {
    sm: { box: "w-5 h-5", icon: "text-[14px]", text: "text-sm" },
    md: { box: "w-8 h-8", icon: "text-[20px]", text: "text-[18px]" },
    lg: { box: "w-9 h-9", icon: "text-[22px]", text: "text-[20px]" },
  };

  const s = sizes[size];

  return (
    <Link to={linkTo} className="flex items-center gap-2 w-fit">
      <div
        className={`${s.box} bg-primary rounded-lg flex items-center justify-center`}
      >
        <span className={`material-symbols-outlined text-on-primary ${s.icon}`}>
          support_agent
        </span>
      </div>
      <span className={`font-bold tracking-tight text-on-surface ${s.text}`}>
        AideDesk
      </span>
    </Link>
  );
};

export default Logo;

import { Link, NavLink } from "react-router-dom";
import Logo from "../ui/Logo";

const Navbar = () => {
  return (
    <nav className="sticky top-0 w-full border-b border-surface-container-highest bg-surface-container-lowest/90 backdrop-blur-md z-50">
      <div className="flex items-center justify-between px-6 py-4 max-w-[1280px] mx-auto">
        <Logo size="md" linkTo="/" />

        <div className="hidden md:flex items-center gap-8 font-body-sm tracking-tight">
          <NavLink
            to="/platform"
            className={({ isActive }) =>
              isActive
                ? "text-on-surface font-medium border-b-2 border-primary pb-1"
                : "text-on-surface-variant hover:text-on-surface transition-colors"
            }
          >
            Platform
          </NavLink>
          <NavLink
            to="/solutions"
            className={({ isActive }) =>
              isActive
                ? "text-on-surface font-medium border-b-2 border-primary pb-1"
                : "text-on-surface-variant hover:text-on-surface transition-colors"
            }
          >
            Solutions
          </NavLink>
          <NavLink
            to="/integrations"
            className={({ isActive }) =>
              isActive
                ? "text-on-surface font-medium border-b-2 border-primary pb-1"
                : "text-on-surface-variant hover:text-on-surface transition-colors"
            }
          >
            Integrations
          </NavLink>
          <NavLink
            to="/pricing"
            className={({ isActive }) =>
              isActive
                ? "text-on-surface font-medium border-b-2 border-primary pb-1"
                : "text-on-surface-variant hover:text-on-surface transition-colors"
            }
          >
            Pricing
          </NavLink>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="hidden md:block font-button text-button text-on-surface hover:text-on-surface-variant transition-colors"
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="bg-primary text-on-primary font-button text-button px-5 py-2.5 rounded hover:bg-primary/90 transition-colors active:scale-95 duration-150"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

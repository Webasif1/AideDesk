const Navbar = () => {
  return (
    <nav className="sticky top-0 w-full border-b border-surface-container-highest bg-surface-container-lowest/90 backdrop-blur-md z-50">
      <div className="flex items-center justify-between px-6 py-4 max-w-[1280px] mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
            <span
              className="material-symbols-outlined text-on-primary text-[16px] font-bold"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              graphic_eq
            </span>
          </div>
          <span className="text-lg font-bold tracking-tighter text-on-surface">AideDesk</span>
        </div>

        <div className="hidden md:flex items-center gap-8 font-body-sm tracking-tight">
          <a className="text-on-surface font-medium border-b-2 border-primary pb-1" href="#">Platform</a>
          <a className="text-on-surface-variant hover:text-on-surface transition-colors" href="#">Solutions</a>
          <a className="text-on-surface-variant hover:text-on-surface transition-colors" href="#">Integrations</a>
          <a className="text-on-surface-variant hover:text-on-surface transition-colors" href="#">Pricing</a>
        </div>

        <div className="flex items-center gap-4">
          <a className="hidden md:block font-button text-button text-on-surface hover:text-on-surface-variant transition-colors" href="#">Log In</a>
          <a className="bg-primary text-on-primary font-button text-button px-5 py-2.5 rounded hover:bg-primary/90 transition-colors active:scale-95 duration-150" href="#">Get Started</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

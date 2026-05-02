const Footer = () => {
  const links = ['Product', 'Company', 'Support', 'Privacy'];

  return (
    <footer className="w-full border-t border-surface-container-highest bg-surface-container-lowest">
      <div className="flex flex-col md:flex-row justify-between items-center px-6 py-12 max-w-[1280px] mx-auto gap-8">
        <div className="flex items-center gap-2 text-sm font-bold text-on-surface">
          <div className="w-5 h-5 bg-primary rounded-sm flex items-center justify-center">
            <span
              className="material-symbols-outlined text-on-primary text-[14px] font-bold"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              graphic_eq
            </span>
          </div>
          AideDesk
        </div>
        <div className="flex items-center gap-6">
          {links.map((link) => (
            <a key={link} className="font-poppins text-xs uppercase tracking-widest text-on-surface-variant hover:text-on-surface opacity-80 hover:opacity-100 transition-opacity" href="#">
              {link}
            </a>
          ))}
        </div>
        <div className="font-poppins text-xs uppercase tracking-widest text-on-surface-variant opacity-80">
          © 2026 AideDesk. Defined by precision.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

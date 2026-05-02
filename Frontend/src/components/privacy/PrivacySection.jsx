const PrivacySection = ({ id, title, children }) => (
  <section className="scroll-mt-[80px]" id={id}>
    <h2 className="text-[30px] font-semibold text-on-surface mb-[24px]">
      {title}
    </h2>
    {children}
  </section>
);
export default PrivacySection;

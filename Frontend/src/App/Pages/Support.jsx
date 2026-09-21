import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "../Components/landing/Navbar";
import Footer from "../Components/landing/Footer";
import PageWrapper from "../Components/ui/PageWrapper";
import { HELP_ARTICLES, HELP_CATEGORIES } from "../Components/support/help.data";

const Article = ({ article, open, onToggle, id }) => (
  <div className={`rounded-[18px] border border-neutral-200 dark:border-neutral-800 transition-colors ${open ? "bg-white dark:bg-neutral-900" : "bg-neutral-50 dark:bg-neutral-950"}`}>
    <h3 className="m-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
        className="w-full min-h-[60px] px-5 flex items-center gap-3 text-left text-[16px] font-semibold text-on-surface"
      >
        <span className="flex-1">{article.q}</span>
        <span className={`material-symbols-outlined text-[20px] text-neutral-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>expand_more</span>
      </button>
    </h3>
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          id={id}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
          className="overflow-hidden"
        >
          <div className="px-5 pb-5 flex flex-col gap-2.5 text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">
            {article.a.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const Support = () => {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [open, setOpen] = useState(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return HELP_ARTICLES.filter(
      (a) => (cat === "all" || a.cat === cat) && (!q || (a.q + " " + a.a.join(" ")).toLowerCase().includes(q)),
    );
  }, [query, cat]);

  return (
    <PageWrapper>
      <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-grow w-full">
          <section className="bg-forest-900 text-mint bg-[radial-gradient(700px_300px_at_50%_100%,rgba(142,182,155,0.22),rgba(11,43,38,0)_70%)]">
            <div className="max-w-[1280px] mx-auto px-6 py-16 md:py-20 flex flex-col items-center gap-6 text-center">
              <span className="text-[13px] font-semibold tracking-[0.1em] uppercase text-sage">Help center</span>
              <h1 className="font-display text-[40px] md:text-[52px] font-extrabold tracking-[-0.04em]">How can we help?</h1>
              <label className="w-full max-w-[680px] flex items-center gap-3 h-[58px] px-5 rounded-full bg-mint text-forest-700 shadow-[0_24px_48px_rgba(0,0,0,0.3)]">
                <span className="material-symbols-outlined text-[22px]">search</span>
                <span className="sr-only">Search help articles</span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(null);
                  }}
                  placeholder="Search, e.g. password, attachments, AI"
                  className="flex-1 min-w-0 bg-transparent border-0 outline-none text-[16px] text-forest-950 placeholder:text-forest-700/70"
                />
              </label>
            </div>
          </section>

          <section className="max-w-[1000px] mx-auto px-6 py-14 flex flex-col gap-8">
            <div role="group" aria-label="Filter by topic" className="flex flex-wrap gap-2">
              {[{ id: "all", label: "All topics", icon: "apps" }, ...HELP_CATEGORIES].map((c) => {
                const on = cat === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      setCat(c.id);
                      setOpen(null);
                    }}
                    className={`h-10 px-4 rounded-full border text-[14px] font-medium flex items-center gap-2 transition-colors ${
                      on
                        ? "bg-forest-900 text-mint border-forest-900"
                        : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-on-surface hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{c.icon}</span>
                    {c.label}
                  </button>
                );
              })}
            </div>

            <p role="status" className="text-[13px] text-neutral-500">
              {results.length} {results.length === 1 ? "article" : "articles"}
              {query.trim() ? ` matching “${query.trim()}”` : ""}
            </p>

            {results.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {results.map((a) => {
                  const key = a.q;
                  return (
                    <Article
                      key={key}
                      id={`help-${HELP_ARTICLES.indexOf(a)}`}
                      article={a}
                      open={open === key}
                      onToggle={() => setOpen(open === key ? null : key)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <span className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-forest-700 dark:text-sage flex items-center justify-center">
                  <span className="material-symbols-outlined text-[28px]">search_off</span>
                </span>
                <h2 className="font-display text-[20px] font-bold text-on-surface">No articles match that</h2>
                <p className="text-[15px] text-neutral-600 dark:text-neutral-400">Try a different word, or get in touch and we'll help directly.</p>
              </div>
            )}

            <div className="mt-6 flex flex-col md:flex-row md:items-center gap-5 p-7 md:p-8 rounded-[28px] bg-mint dark:bg-forest-900">
              <div className="flex-1 flex flex-col gap-1.5">
                <h2 className="font-display text-[22px] font-bold text-on-surface">Still need help?</h2>
                <p className="text-[15px] text-neutral-700 dark:text-neutral-300">Tell us what's going on and a person will get back to you.</p>
              </div>
              <Link
                to="/demo"
                className="self-start md:self-auto h-12 px-6 rounded-full bg-brand text-white dark:text-black text-[15px] font-semibold flex items-center hover:bg-brand-hover transition-colors"
              >
                Contact us
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </PageWrapper>
  );
};

export default Support;

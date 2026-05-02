const articles = [
  {
    title: "How to securely store API keys in production",
    meta: "Integrations • 4 min read",
  },
  {
    title: "Understanding token usage and rate limits",
    meta: "Billing • 3 min read",
  },
  {
    title: "Best practices for structuring training data",
    meta: "AI Training • 8 min read",
  },
  {
    title: "Inviting team members and setting RBAC roles",
    meta: "Getting Started • 2 min read",
  },
];

const ArticleList = () => (
  <div className="lg:col-span-2 flex flex-col">
    <h2 className="text-[30px] font-semibold text-on-surface mb-[32px]">
      Frequently Read
    </h2>
    <div className="flex flex-col border-t border-surface-container-highest">
      {articles.map((a) => (
        <a
          key={a.title}
          href="#"
          className="py-[16px] border-b border-surface-container-highest flex justify-between items-center group"
        >
          <div className="flex flex-col gap-[4px]">
            <span className="text-[18px] font-medium text-on-surface group-hover:text-primary transition-colors">
              {a.title}
            </span>
            <span className="text-[13px] text-on-surface-variant">
              {a.meta}
            </span>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors flex-shrink-0 ml-[16px]">
            arrow_forward
          </span>
        </a>
      ))}
    </div>
    <div className="mt-[24px]">
      <a
        href="#"
        className="inline-flex items-center gap-[4px] text-[14px] text-primary hover:opacity-80 transition-opacity"
      >
        View all articles
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "18px" }}
        >
          chevron_right
        </span>
      </a>
    </div>
  </div>
);
export default ArticleList;

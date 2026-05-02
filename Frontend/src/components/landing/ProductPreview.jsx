import PreviewStatCard from './PreviewStatCard';

const ProductPreview = () => {
  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-xl border border-surface-container-highest bg-surface-container-lowest p-2 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
      <div className="rounded-lg overflow-hidden border border-surface-container-highest bg-surface-container-low aspect-[16/9] relative flex items-center justify-center">
        <img
          alt="Minimalist dashboard UI with charts, data tables, and AI chat interface in strict monochrome"
          className="absolute inset-0 w-full h-full object-cover opacity-90"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAq8U4pVTo8ffl4Sr7nZ-VSEi8HjyuYQCXvxdPtit9-o5F66vzW3OrHI-9345_aJj94McL_ffi0PgEHj_H-6PE_PeRAijtvuLXmXx8OHUQTBm7ioH1_mBYnq1U_Dd2jBGiroF7vtPea-fD2YMmFYi-KPTJLDzw6ltRXG9sRwoKPb9Ab3pvCcRVHQOXd6RwKLxCUjqapvOmVK30fZEHEQgNKUdVlTwDx-_Ln_zo8FsI6-OxznnfkN3DbBmQo9GGWMgREExwNUC1HTJFK"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 to-transparent"></div>
        <div className="absolute bottom-6 left-6 right-6 flex gap-4">
          <PreviewStatCard icon="smart_toy" label="AI Agent Active" value="Resolving 42 tickets/min" filled={true} />
          <div className="hidden sm:flex flex-1">
            <PreviewStatCard icon="speed" label="Avg. Resolution Time" value="12 seconds" filled={false} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPreview;

import PreviewStatCard from './PreviewStatCard';

const ProductPreview = () => {
  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-xl border border-surface-container-highest bg-surface-container-lowest p-2 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
      <div className="rounded-lg overflow-hidden border border-surface-container-highest bg-surface-container-low aspect-[16/9] relative flex items-center justify-center">
        <img
          alt="Minimalist dashboard UI in monochrome"
          className="absolute inset-0 w-full h-full object-cover opacity-90 grayscale"
          src="https://images.unsplash.com/photo-1573868396123-ef72a7f7b94f?q=80&w=2370&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&fit=crop"
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
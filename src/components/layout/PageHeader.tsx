type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function PageHeader({ eyebrow = "Administration", title, description }: PageHeaderProps) {
  return (
    <div className="mb-8 sm:mb-10">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#036eb6]">{eyebrow}</p>
      <h1 className="mt-2 text-2xl font-bold text-[#092151] sm:text-3xl lg:text-4xl">{title}</h1>
      {description ? (
        <p className="mt-3 max-w-2xl text-sm text-[#858c93] sm:text-base">{description}</p>
      ) : null}
    </div>
  );
}

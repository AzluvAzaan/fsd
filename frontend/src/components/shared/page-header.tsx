export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2.5">
        {eyebrow ? <p className="text-sm font-medium tracking-[0.08em] text-muted-foreground">{eyebrow}</p> : null}
        <h1 className="text-3xl font-semibold tracking-tight sm:text-[2.1rem]">{title}</h1>
        {description ? <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3 sm:justify-end">{actions}</div> : null}
    </div>
  );
}

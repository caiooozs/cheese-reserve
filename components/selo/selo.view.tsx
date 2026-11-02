import { cn } from "@/lib/utils";

export function Selo({
  valor,
  rotulo,
  className,
}: {
  valor: string;
  rotulo: string;
  className?: string;
}) {
  return (
    <div className={cn("selo-picote w-28 rotate-2", className)}>
      <div className="selo-miolo bg-selo p-2 text-center text-primary-foreground">
        <div className="flex flex-col items-center justify-center rounded-[2px] py-3 ring-1 ring-ouro">
          <span className="text-lg leading-tight font-bold tracking-tight whitespace-nowrap tabular-nums">
            {valor}
          </span>
          <span className="text-sm leading-tight">{rotulo}</span>
        </div>
      </div>
    </div>
  );
}

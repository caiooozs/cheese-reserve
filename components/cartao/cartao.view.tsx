import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Cartao({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-md rounded-[11px] bg-card p-[5px] text-card-foreground shadow-[0_14px_32px_-14px] shadow-foreground/60",
        className,
      )}
    >
      <div className="folha-correio relative rounded-md">{children}</div>
    </div>
  );
}

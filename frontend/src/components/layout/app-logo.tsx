import Image from "next/image";

import { cn } from "@/lib/utils";

type AppLogoProps = {
  size?: number;
  className?: string;
  priority?: boolean;
};

export function AppLogo({ size = 40, className, priority = false }: AppLogoProps) {
  return (
    <div
      className={cn("relative shrink-0 bg-transparent", className)}
      style={{ width: size, height: size }}
    >
      <Image
        src="/rabbit.png"
        alt="FSD logo"
        width={size}
        height={size}
        priority={priority}
        sizes={`${size}px`}
        className="h-full w-full object-contain"
      />
    </div>
  );
}
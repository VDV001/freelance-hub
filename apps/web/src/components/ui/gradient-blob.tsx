"use client";

import { useRef } from "react";
import { useGSAP, gsap } from "@/lib/gsap/plugins";
import { cn } from "@/lib/utils";

type GradientBlobProps = {
  className?: string;
};

export function GradientBlob({ className }: GradientBlobProps) {
  const blobRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!blobRef.current) return;
    gsap.to(blobRef.current, {
      x: "random(-50, 50)",
      y: "random(-50, 50)",
      scale: "random(0.8, 1.2)",
      duration: 8,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });
  });

  return (
    <div
      ref={blobRef}
      className={cn(
        "absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-20",
        "bg-gradient-to-br from-accent to-accent-secondary",
        className
      )}
    />
  );
}

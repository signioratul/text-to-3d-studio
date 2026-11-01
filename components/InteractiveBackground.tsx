"use client";

import { useEffect, useRef } from "react";
import { mountSharkBackground } from "./ascii-sharks/background";

export default function InteractiveBackground() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parent = rootRef.current;
    if (!parent) return;

    const background = mountSharkBackground({
      theme: "auto",
      parent,
    });

    return () => background.destroy();
  }, []);

  return <div ref={rootRef} aria-hidden="true" className="shark-background-root" />;
}

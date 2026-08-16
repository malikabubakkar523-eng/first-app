import React from "react";
import { Loader } from "@/components/ui/Loader";

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-sm text-white select-none pointer-events-none transition-opacity duration-200">
      <Loader />
    </div>
  );
}


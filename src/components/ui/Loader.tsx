import React from "react";

export function Loader({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="veloce-bars-loader">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

export default Loader;

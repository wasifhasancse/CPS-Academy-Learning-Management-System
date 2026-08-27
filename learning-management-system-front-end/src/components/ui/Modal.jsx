"use client";

import React, { useEffect } from "react";

export function Modal({ isOpen, onClose, title, description, children, maxWidth = "max-w-xl" }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`relative w-full ${maxWidth} rounded-xl bg-card border border-border p-6 shadow-xl`}>
      {children}
    </div>
  );
}

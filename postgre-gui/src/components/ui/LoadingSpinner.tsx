"use client";

import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export default function LoadingSpinner({
  size = 16,
  className = "",
}: LoadingSpinnerProps) {
  return (
    <Loader2
      className={`animate-spin text-orange-500 ${className}`}
      size={size}
    />
  );
}

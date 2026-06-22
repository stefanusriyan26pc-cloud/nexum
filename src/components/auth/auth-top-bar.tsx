"use client";

import { HeaderControls } from "@/components/layout/header-controls";

export function AuthTopBar() {
  return (
    <div className="absolute right-4 top-4 z-20 lg:right-6 lg:top-6">
      <HeaderControls />
    </div>
  );
}

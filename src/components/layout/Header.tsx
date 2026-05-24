"use client";

import { ViewToggle } from "./ViewToggle";

interface HeaderProps {
  title: string;
  description?: string;
  showViewToggle?: boolean;
}

export function Header({
  title,
  description,
  showViewToggle = false,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b bg-white px-8 py-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      {showViewToggle && <ViewToggle />}
    </header>
  );
}

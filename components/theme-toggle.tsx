"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { HiSun, HiMoon } from "react-icons/hi2";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = resolvedTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="h-9 w-9 px-0" disabled>
        <HiSun className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="h-9 w-9 px-0 hover:bg-accent" 
      onClick={toggleTheme}
    >
      <div className="relative flex items-center justify-center">
        {isDark ? (
          <HiMoon className="h-[1.2rem] w-[1.2rem] transition-opacity duration-150" />
        ) : (
          <HiSun className="h-[1.2rem] w-[1.2rem] transition-opacity duration-150" />
        )}
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
} 
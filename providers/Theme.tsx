"use client";
import { ThemeProvider } from "next-themes";
const NextThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      {children}
    </ThemeProvider>
  );
};
export default NextThemeProvider;

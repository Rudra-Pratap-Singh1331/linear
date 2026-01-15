"use client";



export default function WelcomeLayout({ children }) {
  return (
    <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center transition-colors duration-300">
      <div className="w-full max-w-2xl px-8 flex flex-col items-center">
        {children}
      </div>
    </div>
  );
}

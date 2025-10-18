// src/app/layout.tsx
import "./globals.css"; // assume Tailwind is configured
export const metadata = { title: "Dashboard" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-800">
        {children}
      </body>
    </html>
  );
}

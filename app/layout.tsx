import type { Metadata } from 'next';
import './globals.css'; // 🚀 CRITICAL: This link forces Tailwind to load on Vercel!

export const metadata: Metadata = {
  title: 'CameraStream',
  description: 'Industrial Conveyor Tracking System Terminal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-950">
      <body className="h-full bg-slate-950 text-slate-100 antialiased overflow-hidden">
        {children}
      </body>
    </html>
  );
}
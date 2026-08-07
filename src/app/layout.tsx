import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agrawal House | Homestay',
  description: 'Experience a comfortable modern stay at Agrawal House, Ujjain. Newly built homestay located in the main city near Shri Mahakaleshwar Temple.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

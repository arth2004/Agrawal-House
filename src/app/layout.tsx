import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agrawal House | Heritage Homestay',
  description: 'Experience premium heritage stay at Agrawal House, Ujjain. Book beautiful rooms and cottages surrounded by nature.',
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

import type {Metadata} from 'next';
import { Cinzel, Exo_2 } from 'next/font/google';
import './globals.css'; // Global styles

const headingFont = Cinzel({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-heading',
});

const uiFont = Exo_2({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ui',
});

export const metadata: Metadata = {
  title: 'RPG UI Studio',
  description: 'Retro RPG interface prototype with normalized visual system.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className={`${headingFont.variable} ${uiFont.variable} ui-text`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

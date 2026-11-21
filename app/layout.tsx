import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import './globals.css';
import { LanguageProvider, LanguageSwitch } from './language';
import { Navigation } from './navigation';
import { ResumeProvider } from './resume/provider';

export const metadata: Metadata = { title: { default: 'Pondroot — A stronger start. A clearer path.', template: '%s | Pondroot' }, description: 'Start with your strengths. Prepare for your next step into work.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><ResumeProvider><LanguageProvider><a className="skip" href="#main">Skip to main content</a><header className="header"><div className="brand-row"><Link href="/" aria-label="Pondroot home"><Image src="/brand/pondroot-wordmark.png" width={2172} height={724} alt="Pondroot" className="wordmark" priority /></Link><LanguageSwitch /></div><Navigation /></header>{children}<footer><Link href="/" aria-label="Pondroot home"><Image src="/brand/pondroot-wordmark.png" width={2172} height={724} alt="Pondroot" className="wordmark" /></Link><p>Rooted Network</p></footer></LanguageProvider></ResumeProvider></body></html>;
}

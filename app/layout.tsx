import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from './language';
import { SiteChrome } from './chrome';
import { ResumeProvider } from './resume/provider';

export const metadata: Metadata = { title: { default: 'Pondroot — A stronger start. A clearer path.', template: '%s | Pondroot' }, description: 'Start with your strengths. Prepare for your next step into work.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><LanguageProvider><ResumeProvider><SiteChrome>{children}</SiteChrome></ResumeProvider></LanguageProvider></body></html>;
}

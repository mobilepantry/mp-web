import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function Layout({ children, hideNav = false }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {!hideNav && <Header />}
      <main className="flex-1">{children}</main>
      {!hideNav && <Footer />}
    </div>
  );
}

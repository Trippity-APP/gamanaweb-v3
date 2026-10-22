import type { Metadata } from 'next';
import { AccountShell } from '@/components/account/AccountShell';

export const metadata: Metadata = {
  title: 'Account',
  alternates: { canonical: 'https://www.gamana.app/account/' },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AccountShell>{children}</AccountShell>;
}

import TerminalLayout from '@/components/terminal/TerminalLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <TerminalLayout>{children}</TerminalLayout>;
}

import Link from 'next/link';
import Logo from '../icons/logo';

const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container flex flex-col items-center justify-between gap-6 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Logo className="h-6 w-auto" />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built for a cleaner tomorrow. © {new Date().getFullYear()} SafaiSetu.
          </p>
        </div>
        <nav className="flex gap-4 sm:gap-6">
          <Link href="#" className="text-sm hover:underline text-muted-foreground hover:text-foreground transition-colors">
            Terms of Service
          </Link>
          <Link href="#" className="text-sm hover:underline text-muted-foreground hover:text-foreground transition-colors">
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;

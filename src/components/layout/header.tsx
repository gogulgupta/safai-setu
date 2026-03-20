
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Logo from '../icons/logo';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Sprout } from 'lucide-react';
import LanguageSwitcher from './language-switcher';

const Header = () => {
  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#about', label: 'About' },
    { href: '/community', label: 'Community' },
    { href: '/dashboard/crop-recycle', label: 'Crop Recycle' },
    { href: '/dashboard', label: 'Dashboard' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo className="h-6 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-2"
              >
                {link.label === 'Crop Recycle' && <Sprout className="w-4 h-4 text-primary" />}
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            <Button asChild>
                <Link href="/login">Login</Link>
            </Button>
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/" className="flex items-center space-x-2 mb-4">
                  <Logo className="h-6 w-auto" />
                </Link>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="transition-colors hover:text-foreground/80 text-foreground/60 py-2 text-lg flex items-center gap-2"
                  >
                     {link.label === 'Crop Recycle' && <Sprout className="w-5 h-5 text-primary" />}
                    {link.label}
                  </Link>
                ))}
                 <div className="pt-4 border-t">
                    <LanguageSwitcher />
                </div>
                <div className="pt-2">
                    <Button asChild className="w-full">
                        <Link href="/login">Login</Link>
                    </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;

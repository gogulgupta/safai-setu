
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Logo from '@/components/icons/logo';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  QrCode,
  History,
  Gift,
  Trash2,
  Users,
  LogOut,
  Menu,
  Recycle,
  ShoppingBag,
  Box,
  Share2,
  Sprout,
  MessageCircleQuestion,
  ShieldAlert,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AppProvider } from '@/context/app-context';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Wallet', icon: LayoutDashboard, exact: true },
    { href: '/dashboard/scan', label: 'Scan Product', icon: QrCode },
    { href: '/dashboard/recycle', label: 'Recycle Waste', icon: Recycle },
    { href: '/dashboard/crop-recycle', label: 'Crop Recycle', icon: Sprout },
    { href: '/dashboard/returns', label: 'My Activity', icon: History },
    { href: '/dashboard/rewards', label: 'Rewards', icon: Gift },
    { href: '/dashboard/bins', label: 'My Bins', icon: Trash2 },
    { href: '/dashboard/generate-qr', label: 'Generate QR', icon: Share2 },
    { href: '/dashboard/marketplace', label: 'Marketplace', icon: ShoppingBag },
    { href: '/dashboard/plastic-bricks', label: 'Plastic Bricks', icon: Box },
    { href: '/community', label: 'Community Hub', icon: Users },
    { href: '/dashboard/ai-assistant', label: 'AI Assistant', icon: MessageCircleQuestion },
    { href: '/dashboard/complaints', label: 'All Complaints', icon: ShieldAlert },
  ];
  
  const getActiveLabel = () => {
    // First, try to find an exact match
    let activeItem = navItems.find(item => item.href === pathname);
    if (activeItem) return activeItem.label;
    
    // If no exact match, find the best-starting match
    activeItem = navItems
        .filter(item => pathname.startsWith(item.href))
        .sort((a,b) => b.href.length - a.href.length)[0];

    return activeItem ? activeItem.label : 'Dashboard';
  }


  const NavContent = () => (
    <>
    <nav className="grid gap-1 p-2">
      <TooltipProvider>
      {navItems.map((item) => (
        <Tooltip key={item.label}>
          <TooltipTrigger asChild>
            <Link href={item.href}>
              <Button
                variant={pathname.startsWith(item.href) && !(item.href === '/dashboard' && pathname !== '/dashboard') ? 'secondary' : 'ghost'}
                size="icon"
                className="rounded-lg justify-start"
                aria-label={item.label}
              >
                <item.icon className="size-5" />
                 <span className="ml-4 md:hidden">{item.label}</span>
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={5} className="hidden md:block">
            {item.label}
          </TooltipContent>
        </Tooltip>
      ))}
      </TooltipProvider>
    </nav>
    <nav className="mt-auto grid gap-1 p-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/login">
            <Button
              variant="ghost"
              size="icon"
              className="mt-auto rounded-lg"
              aria-label="Logout"
            >
              <LogOut className="size-5" />
            </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={5} className="hidden md:block">
            Logout
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </nav>
    </>
  );

  return (
    <AppProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
          <Link href="/" className="flex h-14 items-center justify-center border-b">
              <Logo className="h-6 w-auto" />
          </Link>
          <NavContent />
        </aside>
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="sm:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="sm:max-w-xs pt-14">
                <NavContent />
              </SheetContent>
            </Sheet>
            <div className="flex-1">
               <h1 className="text-xl font-semibold">{getActiveLabel()}</h1>
            </div>
            <UserDropdownMenu />
          </header>
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
          </main>
        </div>
      </div>
    </AppProvider>
  );
}

function UserDropdownMenu() {
    return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="overflow-hidden rounded-full"
            >
              <Avatar>
                <AvatarImage src="https://picsum.photos/100" alt="User Avatar" data-ai-hint="person avatar" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href="/login">Logout</Link></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
    )
}

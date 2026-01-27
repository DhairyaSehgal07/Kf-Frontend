import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Link, useNavigate } from '@tanstack/react-router';
import { Menu } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate({ to: '/login/store-admin' });
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/faq', label: 'FAQ' },
    { to: '/case-studies', label: 'Case Studies' },
    { to: '/support', label: 'Support' },
  ];

  return (
    <>
      {/* Mobile/Tablet Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between px-6 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm lg:hidden">
        <Link
          to="/"
          className="flex items-center transition-transform hover:scale-105"
        >
          <img src="/coldop-logo.webp" alt="Coldop Logo" className="w-10" />
        </Link>

        <Sheet>
          <SheetTrigger className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Menu size={24} />
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader className="mt-20">
              <SheetDescription asChild>
                <nav className="font-custom">
                  <ul className="flex list-none flex-col items-center gap-8">
                    {navLinks.map((link) => (
                      <li key={link.to}>
                        <SheetClose asChild>
                          <Link
                            to={link.to}
                            className="text-xl font-medium text-gray-700 hover:text-primary transition-colors"
                          >
                            {link.label}
                          </Link>
                        </SheetClose>
                      </li>
                    ))}
                    <li>
                      <SheetClose asChild>
                        <button
                          onClick={handleSignIn}
                          className="font-custom rounded-lg bg-primary px-8 py-3 text-xl font-bold text-secondary transition-all hover:bg-primary/90 hover:shadow-lg active:scale-95"
                        >
                          Sign In
                        </button>
                      </SheetClose>
                    </li>
                  </ul>
                </nav>
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 hidden h-20 items-center justify-between px-16 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm lg:flex">
        <Link
          to="/"
          className="flex items-center transition-transform hover:scale-105"
        >
          <img src="/coldop-logo.webp" alt="Coldop Logo" className="w-16" />
        </Link>

        <nav className="flex items-center">
          <ul className="flex list-none items-center gap-12">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="font-custom text-xl font-medium text-gray-700 hover:text-primary transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                </Link>
              </li>
            ))}
            <li>
              <button
                onClick={handleSignIn}
                className="font-custom rounded-lg bg-primary px-8 py-3 text-xl font-bold text-secondary transition-all hover:bg-primary/90 hover:shadow-lg active:scale-95"
              >
                Sign In
              </button>
            </li>
          </ul>
        </nav>
      </header>

      {/* Spacer to prevent content from jumping */}
      <div className="h-16 lg:h-20" />
    </>
  );
};

export default Navbar;

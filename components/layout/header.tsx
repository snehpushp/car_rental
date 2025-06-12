"use client";

import Link from "next/link";
import { useState } from "react";
import { Car, Menu, X, User, Heart, Calendar, Settings, LogOut, UserCircle, Loader2 } from "lucide-react";
import { HiUserCircle, HiLogin } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuthContext } from "@/lib/context/auth-context";
import { useRouter } from "next/navigation";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading, logout } = useAuthContext();
  const router = useRouter();

  const mainNavigation = [
    { name: "Browse Cars", href: "/cars", description: "Discover amazing vehicles" },
    { name: "How It Works", href: "/how-it-works", description: "Learn about our platform" },
    { name: "Become a Host", href: "/host", description: "List your car and earn" },
    { name: "About", href: "/about", description: "Our story and mission" },
  ];

  const getNavigationForRole = () => {
    if (!user) return [];
    
    if (user.role === 'owner') {
      return [
        { name: "Dashboard", href: "/owner/dashboard", icon: Settings, description: "Owner dashboard" },
        { name: "My Cars", href: "/owner/cars", icon: Car, description: "Manage your cars" },
        { name: "Bookings", href: "/owner/bookings", icon: Calendar, description: "Manage bookings" },
        { name: "Profile", href: "/dashboard/profile", icon: UserCircle, description: "Account settings" },
      ];
    } else {
      return [
        { name: "Dashboard", href: "/dashboard", icon: Settings, description: "Manage your account" },
        { name: "My Bookings", href: "/dashboard/bookings", icon: Calendar, description: "View your reservations" },
        { name: "Wishlist", href: "/dashboard/wishlist", icon: Heart, description: "Saved cars" },
        { name: "Profile", href: "/dashboard/profile", icon: UserCircle, description: "Account settings" },
      ];
    }
  };

  const userNavigation = getNavigationForRole();

  const handleSignOut = async () => {
    try {
      await logout();
      setIsOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const renderAuthSection = () => {
    if (loading) {
      return (
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      );
    }

    if (user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-ring hover:ring-offset-2 transition-all duration-200">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatarUrl || undefined} alt={`${user.fullName} avatar`} />
                <AvatarFallback className="bg-primary text-primary-foreground theme-transition">
                  {user.avatarUrl ? (
                    <HiUserCircle className="h-6 w-6" />
                  ) : (
                    getUserInitials(user.fullName)
                  )}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 theme-transition" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.fullName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
                <p className="text-xs leading-none text-muted-foreground capitalize">
                  {user.role}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {userNavigation.map((item) => (
              <DropdownMenuItem key={item.name} asChild>
                <Link href={item.href} className="w-full cursor-pointer">
                  <item.icon className="mr-3 h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 cursor-pointer"
              onClick={handleSignOut}
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Button size="sm" asChild className="font-medium transition-all duration-200">
        <Link href="/auth/login" className="flex items-center space-x-2">
          <HiLogin className="h-4 w-4" />
          <span>Login</span>
        </Link>
      </Button>
    );
  };

  const renderMobileAuthSection = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center space-x-2 py-4">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      );
    }

    if (user) {
      return (
        <div className="space-y-2">
          <div className="flex items-center space-x-3 px-3 py-3 rounded-md bg-muted/50 theme-transition">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatarUrl || undefined} alt={`${user.fullName} avatar`} />
              <AvatarFallback className="bg-primary text-primary-foreground theme-transition">
                {user.avatarUrl ? (
                  <HiUserCircle className="h-6 w-6" />
                ) : (
                  getUserInitials(user.fullName)
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user.fullName}</span>
              <span className="text-xs text-muted-foreground">
                {user.email}
              </span>
              <span className="text-xs text-muted-foreground capitalize">
                {user.role}
              </span>
            </div>
          </div>
          {userNavigation.map((item) => (
            <SheetClose asChild key={item.name}>
              <Link
                href={item.href}
                className="flex items-center space-x-3 rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <item.icon className="h-4 w-4" />
                <div className="flex flex-col">
                  <span>{item.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.description}
                  </span>
                </div>
              </Link>
            </SheetClose>
          ))}
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 px-3 py-3"
            onClick={handleSignOut}
          >
            <LogOut className="mr-3 h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      );
    }

    return (
      <SheetClose asChild>
        <Button asChild className="w-full font-medium">
          <Link href="/auth/login" className="flex items-center justify-center space-x-2">
            <HiLogin className="h-4 w-4" />
            <span>Login</span>
          </Link>
        </Button>
      </SheetClose>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 theme-transition">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary theme-transition">
                <Car className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight">
                CarGopher
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {mainNavigation.map((item) => (
                <NavigationMenuItem key={item.name}>
                  <NavigationMenuTrigger className="font-medium">
                    {item.name}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-[400px] theme-transition">
                      <NavigationMenuLink asChild>
                        <Link
                          href={item.href}
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">{item.name}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {item.description}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {renderAuthSection()}
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] theme-transition">
              <div className="flex flex-col space-y-4">
                {/* Mobile Logo */}
                <div className="flex items-center justify-between pb-4 border-b">
                  <div className="flex items-center space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary theme-transition">
                      <Car className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="font-display text-xl font-bold tracking-tight">
                      CarGopher
                    </span>
                  </div>
                  <ThemeToggle />
                </div>

                {/* Mobile Navigation Links */}
                <nav className="flex flex-col space-y-2">
                  {mainNavigation.map((item) => (
                    <SheetClose asChild key={item.name}>
                      <Link
                        href={item.href}
                        className="flex flex-col space-y-1 rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <span>{item.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      </Link>
                    </SheetClose>
                  ))}
                </nav>

                {/* Mobile User Section */}
                <div className="pt-4 border-t">
                  {renderMobileAuthSection()}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export { Header }; 
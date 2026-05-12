"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { signOut } from "@/lib/actions/auth.action";

interface NavbarProps {
  userName: string;
  isAdmin?: boolean;
}

const Navbar = ({ userName, isAdmin }: NavbarProps) => {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  // Get user initials for avatar
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav className="flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/logo.svg" alt="PrepVerse Logo" width={38} height={32} />
        <h2 className="text-primary-100 text-2xl font-semibold">PrepVerse</h2>
      </Link>

      <div className="flex items-center gap-4">
        {isAdmin && (
          <Link
            href="/admin"
            className="text-xs bg-primary-200/15 text-primary-200 px-3 py-1.5 rounded-full hover:bg-primary-200/25 transition-colors font-medium"
          >
            ⚙️ Admin
          </Link>
        )}

        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-gradient-to-br from-primary-200 to-primary-100 flex items-center justify-center text-dark-100 text-xs font-bold">
            {initials}
          </div>
          <span className="text-light-100 text-sm max-sm:hidden">
            {userName}
          </span>
        </div>

        <button
          onClick={handleSignOut}
          className="text-sm text-light-400 hover:text-white transition-colors cursor-pointer px-3 py-1.5 rounded-full hover:bg-white/5"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

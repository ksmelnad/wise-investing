import Link from "next/link";
import React from "react";
import SignIn from "./signIn";
import { auth, signOut } from "@/auth";
import { Button } from "./ui/button";
import SignOut from "./signOut";

const Navbar = async () => {
  const session = await auth();

  const navItems = [
    {
      name: "Home",
      href: "/",
    },
  ];

  return (
    <div className=" bg-slate-200">
      <nav className="container mx-auto py-4 px-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Wise Investing</h1>
        <ul className="flex items-center gap-4">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link href={item.href}>{item.name}</Link>
            </li>
          ))}
          <li>
            {session !== null ? (
              <div className="flex gap-x-2 items-center">
                <Link href="/dashboard">Dashboard</Link>
                <SignOut />
              </div>
            ) : (
              <Link href="/api/auth/signin">
                <Button>Sign In</Button>
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;

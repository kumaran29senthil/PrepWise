import { ReactNode } from "react";
import { redirect } from "next/navigation";

import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Layout = async ({ children }: { children: ReactNode }) => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="root-layout">
      <Navbar userName={user.name} isAdmin={user.isAdmin} />
      {children}
    </div>
  );
};

export default Layout;
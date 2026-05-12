import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/actions/auth.action";

const AdminLayout = async ({ children }: { children: ReactNode }) => {
  const user = await getCurrentUser();

  // Must be authenticated AND admin
  if (!user) redirect("/sign-in");
  if (!user.isAdmin) redirect("/");

  return (
    <div className="admin-layout">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-200 to-primary-100 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-light-400 text-sm mt-1">
            Manage users, interviews, and platform analytics
          </p>
        </div>
      </div>
      {children}
    </div>
  );
};

export default AdminLayout;

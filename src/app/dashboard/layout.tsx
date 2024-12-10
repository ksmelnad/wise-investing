import { cookies } from "next/headers";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/dashboardSidebar";
import Navbar from "@/components/dashboard/navbar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <DashboardSidebar />
      <main className=" bg-sidebar">
        <Navbar title="Dashboard" />
        <div className="p-4">{children}</div>
      </main>
    </SidebarProvider>
  );
}

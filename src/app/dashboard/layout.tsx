import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container flex flex-1 gap-0">
        <Sidebar />
        <main id="main-content" className="flex-1 py-8 md:pl-8">{children}</main>
      </div>
    </div>
  );
}

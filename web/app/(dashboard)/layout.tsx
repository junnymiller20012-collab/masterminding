import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/features/dashboard/DashboardShell";
import { InitUser } from "@/components/features/dashboard/InitUser";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <>
      <InitUser />
      <DashboardShell>{children}</DashboardShell>
    </>
  );
}

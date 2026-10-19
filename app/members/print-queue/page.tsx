import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MembersShell } from "@/components/MembersShell";
import { PrintQueue } from "@/components/PrintQueue";

export default async function PrintQueuePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin?callbackUrl=/members/print-queue");
  }

  return (
    <MembersShell
      title="Print queue"
      backHref="/members"
      backLabel="Member portal"
    >
      <PrintQueue />
    </MembersShell>
  );
}

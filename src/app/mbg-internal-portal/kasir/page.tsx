import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import KasirPOSClient from "./KasirPOSClient";

export default async function KasirPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <KasirPOSClient
      cashierName={session.nama_lengkap}
      branchName={session.asal_cabang}
    />
  );
}

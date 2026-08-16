import React from "react";
import { db } from "@/lib/db";
import { AdminEmailComposerClient } from "@/components/admin/AdminEmailComposerClient";

export const revalidate = 0;

export default async function AdminEmailsPage() {
  const [customers, logs] = await Promise.all([
    db.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    db.emailLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-brand-500">
          COMMUNICATION HUB
        </span>
        <h1 className="text-2xl font-display font-black text-white tracking-tight mt-1">
          Customer Emailing & Resend Logs
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Dispatch bespoke updates, private invitations, or bulk marketing emails with delivery verification.
        </p>
      </div>

      <AdminEmailComposerClient customers={customers} initialLogs={logs} />
    </div>
  );
}

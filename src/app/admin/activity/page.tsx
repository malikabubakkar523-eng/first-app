import React from "react";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Activity, ShieldCheck, ShieldAlert, Monitor, Smartphone, Tablet } from "lucide-react";

export const revalidate = 0;

export default async function AdminActivityPage() {
  const activities = await db.userActivity.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: {
        select: { name: true, role: true, avatar: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-brand-500">
          SECURITY AUDIT TRAIL
        </span>
        <h1 className="text-2xl font-display font-black text-white tracking-tight mt-1">
          User Logins & Security Activity ({activities.length})
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Live monitoring of successful and failed authentication attempts, device signatures, and account changes.
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-500">
                <th className="pb-3 font-semibold">User</th>
                <th className="pb-3 font-semibold">Action</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Device</th>
                <th className="pb-3 font-semibold">IP Address</th>
                <th className="pb-3 font-semibold">Details</th>
                <th className="pb-3 font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">
                    No activity logs recorded yet.
                  </td>
                </tr>
              ) : (
                activities.map((act) => (
                  <tr key={act.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5">
                      <p className="font-bold text-white">{act.user?.name || "Visitor"}</p>
                      <p className="text-[10px] text-zinc-400 font-mono">{act.email}</p>
                    </td>
                    <td className="py-3.5 font-mono font-semibold text-zinc-300">
                      {act.action}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          act.status === "SUCCESS"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {act.status === "SUCCESS" ? (
                          <ShieldCheck className="w-3 h-3" />
                        ) : (
                          <ShieldAlert className="w-3 h-3" />
                        )}
                        <span>{act.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 text-zinc-300">
                      <span className="inline-flex items-center gap-1.5">
                        {act.device === "Mobile Device" ? (
                          <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
                        ) : (
                          <Monitor className="w-3.5 h-3.5 text-zinc-400" />
                        )}
                        <span>{act.device || "Desktop"}</span>
                      </span>
                    </td>
                    <td className="py-3.5 font-mono text-zinc-400">
                      {act.ipAddress || "127.0.0.1"}
                    </td>
                    <td className="py-3.5 text-zinc-400 max-w-xs truncate">
                      {act.details || "—"}
                    </td>
                    <td className="py-3.5 text-zinc-400 whitespace-nowrap">
                      {formatDate(act.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

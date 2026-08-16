"use client";

import React, { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { Mail, Send, Users, Sparkles, Check, AlertCircle, RefreshCw, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface CustomerOption {
  id: string;
  name: string;
  email: string;
}

interface EmailLogItem {
  id: string;
  recipientEmail: string;
  subject: string;
  message: string | null;
  status: string;
  resendId: string | null;
  createdAt: string | Date;
}

interface AdminEmailComposerClientProps {
  customers: CustomerOption[];
  initialLogs: EmailLogItem[];
}

export function AdminEmailComposerClient({
  customers,
  initialLogs,
}: AdminEmailComposerClientProps) {
  const { toast } = useToast();
  const [logs, setLogs] = useState<EmailLogItem[]>(initialLogs);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [customEmail, setCustomEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const templates = [
    {
      name: "VIP Private Flash Drop",
      subject: "Exclusive VIP Allocation: SS26 Carbon Marathon Silhouettes",
      message:
        "Dear Patron,\n\nWe are pleased to invite you to an advance allocation of our upcoming Spring/Summer 2026 carbon-plated road racing series.\n\nUse your private VIP access code VELOCE20 at checkout for preferential allocation priority.\n\nWarm regards,\nVELOCE Atelier Concierge",
    },
    {
      name: "Order Tracking & Fulfillment Check",
      subject: "Update Regarding Your VELOCE Footwear Allocation",
      message:
        "Dear Customer,\n\nOur master craftsmen have concluded the final inspection on your footwear. Your allocation is en route via global express courier.\n\nPlease log into your VELOCE account to view real-time dispatch milestones.\n\nRespectfully,\nVELOCE Logistics Team",
    },
    {
      name: "Private Fit Consultation",
      subject: "Complimentary Biomechanical Fit Review for Your Order",
      message:
        "Dear Patron,\n\nThank you for choosing VELOCE. To ensure your footwear delivers maximum energy return and optimal anatomical support, we invite you to schedule a 1-on-1 virtual consultation with our biomechanics specialists.\n\nSincerely,\nVELOCE Performance Lab",
    },
  ];

  const handleApplyTemplate = (tmpl: { subject: string; message: string }) => {
    setSubject(tmpl.subject);
    setMessage(tmpl.message);
    toast({ title: "Template Applied", description: tmpl.subject, type: "info" });
  };

  const handleToggleCustomer = (email: string) => {
    if (selectedRecipients.includes(email)) {
      setSelectedRecipients(selectedRecipients.filter((e) => e !== email));
    } else {
      setSelectedRecipients([...selectedRecipients, email]);
    }
  };

  const handleSelectAll = () => {
    if (selectedRecipients.length === customers.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(customers.map((c) => c.email));
    }
  };

  const handleAddCustomEmail = () => {
    const trimmed = customEmail.trim();
    if (trimmed && !selectedRecipients.includes(trimmed)) {
      setSelectedRecipients([...selectedRecipients, trimmed]);
      setCustomEmail("");
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRecipients.length === 0) {
      toast({ title: "Please select at least one recipient", type: "error" });
      return;
    }

    if (!subject || !message) {
      toast({ title: "Subject and message are required", type: "error" });
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/admin/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: selectedRecipients,
          subject,
          message,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast({
          title: "Emails Dispatched via Resend!",
          description: `Successfully sent to ${data.sentCount} recipient(s).`,
          type: "success",
        });

        // Add to live log list
        const newLogEntries: EmailLogItem[] = selectedRecipients.map((r) => ({
          id: Math.random().toString(),
          recipientEmail: r,
          subject,
          message,
          status: "SENT",
          resendId: "resend_live",
          createdAt: new Date(),
        }));
        setLogs([...newLogEntries, ...logs]);

        // Reset form
        setSelectedRecipients([]);
        setSubject("");
        setMessage("");
      } else {
        toast({
          title: "Email Dispatch Error",
          description: data.error || "Failed to dispatch emails via Resend.",
          type: "error",
        });
      }
    } catch (err) {
      toast({ title: "Network Error", type: "error" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Email Composer */}
      <form
        onSubmit={handleSend}
        className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-6 shadow-xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-500">
              RESEND DISPATCH SUITE
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Direct & Bulk Customer Email Composer
            </h3>
          </div>

          {/* Preset templates */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-zinc-400 font-semibold flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-zinc-500" /> Templates:
            </span>
            {templates.map((tmpl) => (
              <button
                key={tmpl.name}
                type="button"
                onClick={() => handleApplyTemplate(tmpl)}
                className="px-3 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold whitespace-nowrap transition-colors"
              >
                {tmpl.name}
              </button>
            ))}
          </div>
        </div>

        {/* Recipients Picker */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-zinc-300">
              Recipients ({selectedRecipients.length} selected)
            </label>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs font-semibold text-brand-500 hover:text-brand-400"
            >
              {selectedRecipients.length === customers.length
                ? "Deselect All"
                : "Select All Registered Customers"}
            </button>
          </div>

          {/* Quick select chips */}
          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
            {customers.map((c) => {
              const isSelected = selectedRecipients.includes(c.email);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleToggleCustomer(c.email)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? "bg-brand-500 text-white shadow-sm shadow-brand-500/30"
                      : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                  }`}
                >
                  <span>{c.name}</span>
                  <span className="text-[10px] opacity-70 font-mono">({c.email})</span>
                  {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                </button>
              );
            })}
          </div>

          {/* Add custom email address */}
          <div className="flex gap-2 pt-1">
            <input
              type="email"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              placeholder="Or enter any specific email address (e.g. malikabubakkar523@gmail.com)..."
              className="flex-1 px-4 py-2 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <button
              type="button"
              onClick={handleAddCustomEmail}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors"
            >
              + Add Email
            </button>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Email Subject
          </label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. VIP Invitation: Spring 2026 Footwear Archive Access"
            className="w-full px-4 py-3 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* Message Body */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Message Body (Formatted in VELOCE luxury HTML email frame)
          </label>
          <textarea
            rows={6}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your email announcement or customer support update..."
            className="w-full px-4 py-3 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white leading-relaxed focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Dispatched through active Resend server pipeline with verified delivery.</span>
          </div>

          <button
            type="submit"
            disabled={sending || selectedRecipients.length === 0}
            className="px-6 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-lg shadow-brand-500/20 hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{sending ? "Dispatching via Resend..." : `Send Email (${selectedRecipients.length})`}</span>
          </button>
        </div>
      </form>

      {/* Email History Logs Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Email Dispatch History ({logs.length})
            </h4>
            <p className="text-xs text-zinc-500">
              Live records of all automated and admin-dispatched customer emails.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-500">
                <th className="pb-3 font-semibold">Recipient</th>
                <th className="pb-3 font-semibold">Subject</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Date Dispatched</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-zinc-500">
                    No emails logged yet.
                  </td>
                </tr>
              ) : (
                logs.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 font-mono text-zinc-300 font-semibold">
                      {item.recipientEmail}
                    </td>
                    <td className="py-3.5 text-white font-medium max-w-xs truncate">
                      {item.subject}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          item.status === "SENT"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-zinc-400">
                      {formatDate(item.createdAt)}
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

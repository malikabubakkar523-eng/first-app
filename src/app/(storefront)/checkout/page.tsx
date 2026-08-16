import React from "react";
import { getSession } from "@/lib/auth";
import { CheckoutWizard } from "@/components/checkout/CheckoutWizard";

export const revalidate = 0;

export default async function CheckoutPage() {
  const session = await getSession();

  return (
    <div className="bg-zinc-50/50 dark:bg-zinc-950 min-h-screen">
      <CheckoutWizard user={session} />
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddReparationRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the device step when accessing the base add-reparation path
    router.push("/add-reparation/device");
  }, [router]);

  return null; // Don't render anything since we're redirecting immediately
}
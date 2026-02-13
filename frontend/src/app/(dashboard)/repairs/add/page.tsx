"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddReparationRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the device step when accessing the base repairs/add path
    router.push("/repairs/add/device");
  }, [router]);

  return null; // Don't render anything since we're redirecting immediately
}
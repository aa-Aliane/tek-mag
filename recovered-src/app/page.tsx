"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to repairs page (inside dashboard group)
    router.push("/repairs");
  }, [router]);

  return null; // Render nothing while redirecting
}


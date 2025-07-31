"use client";

import Image from "next/image";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";

export default function Home() {
  const [user] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      router.push("/dashboard");
    }
  }, [user, router]);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-center text-center">
        <h1 className="text-4xl font-bold">
          Welcome to the Mining Expo Portal
        </h1>
        <p className="text-lg text-gray-600">
          Please sign in to continue or explore the portal.
        </p>
        <Image
          src="/largeminingexpologo.jpg"
          alt="Company Logo"
          width={512}
          height={512}
          className="w-auto h-64 object-cover"
          priority
        />
        <button
          onClick={() => router.push("/login")}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Go to Login Page
        </button>
      </main>
    </div>
  );
}

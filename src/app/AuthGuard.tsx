"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import LOGO from "../../public/com-logo.png";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center w-screen h-screen">
        <Image
          src={LOGO}
          alt="Company Logo"
          height={512}
          width={512}
          priority
          className="object-cover w-auto h-24"
        />
        <span className="text-lg font-regular animate-pulse">Loading...</span>
      </div>
    );
  }

  return <>{children}</>;
}

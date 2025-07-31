import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p>This feature is not available yet.</p>
      <Link href="/dashboard">
        <Button className="mt-4">Go to Dashboard</Button>
      </Link>
    </div>
  );
}

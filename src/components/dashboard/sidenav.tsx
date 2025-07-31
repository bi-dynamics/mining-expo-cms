import Link from "next/link";
import NavLinks from "@/components/dashboard/nav-links";
import LOGO from "../../../public/largeminingexpologo.jpg";
import { Power } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/app/firebase/config";
import Image from "next/image";

export default function SideNav() {
  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <Link
        className="mb-2 flex h-20 items-end justify-start rounded-md bg-gray-100 p-4 md:h-40"
        href="/"
      >
        <div className="w-32 relative flex items-center justify-center text-white md:w-full">
          <Image
            src={LOGO}
            alt="Company Logo"
            height={256}
            width={256}
            priority
            className="object-cover w-full h-full"
          />
        </div>
      </Link>
      <div className="flex grow flex-row overflow-y-scroll justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-100 md:block"></div>
        <form
          action={async () => {
            await signOut(auth);
          }}
        >
          <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-100 p-3 text-sm font-medium hover:bg-yellow-100 hover:text-yellow-500 md:flex-none md:justify-start md:p-2 md:px-3">
            <Power className="w-6" />
            <div className="hidden md:block">Sign Out</div>
          </button>
        </form>
      </div>
    </div>
  );
}

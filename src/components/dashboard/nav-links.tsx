"use client";

import { Home, UsersRound, CalendarArrowUp, XOctagonIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  {
    section: "Mining Expo",

    pages: [
      {
        name: "Main Event Program",
        href: "/dashboard/coming-soon",
        icon: XOctagonIcon,
      },
      {
        name: "Exhibitors",
        href: "/dashboard/exhibitors",
        icon: UsersRound,
      },
      {
        name: "Floor Plans",
        href: "/dashboard/coming-soon",
        icon: XOctagonIcon,
      },
    ],
  },
  {
    section: "Conference",

    pages: [
      {
        name: "Conference Program",
        href: "/dashboard/coming-soon",
        icon: XOctagonIcon,
      },
      {
        name: "Presentations",
        href: "/dashboard/coming-soon",
        icon: XOctagonIcon,
      },
      {
        name: "Speakers",
        href: "/dashboard/coming-soon",
        icon: XOctagonIcon,
      },
    ],
  },
  {
    section: "Marketing Opportunities",

    pages: [
      {
        name: "Suppliers Platform",
        href: "/dashboard/coming-soon",
        icon: XOctagonIcon,
      },
      { name: "B2B", href: "/dashboard/coming-soon", icon: XOctagonIcon },
    ],
  },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      <Link
        href="/dashboard"
        className={clsx(
          "flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-100 p-3 text-sm font-medium hover:bg-blue-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3",
          {
            "bg-blue-100 text-blue-600": pathname === "/dashboard",
          }
        )}
      >
        <Home className="w-6" />
        <p className="hidden md:block">Dashboard</p>
      </Link>

      <div className="flex flex-col items-start justify-start gap-2 w-full pt-4">
        <p className="text-xs text-gray-500">Pages</p>
        {links.map((link, index) => {
          return (
            <Accordion key={index} type="single" collapsible className="w-full">
              <AccordionItem value={index.toString()}>
                <AccordionTrigger
                  className={clsx(
                    "font-bold bg-gray-100 text-black rounded-md p-3",
                    {
                      "bg-blue-100 text-blue-600": links.some(
                        (l) =>
                          l.section === link.section &&
                          l.pages.some(
                            (p) =>
                              p.href === pathname || pathname.startsWith(p.href)
                          )
                      ),
                    }
                  )}
                >
                  {link.section}
                </AccordionTrigger>
                <AccordionContent className="mt-2 px-2">
                  {link.pages.map((page, index) => {
                    const LinkIcon = page.icon;

                    return (
                      <Link
                        key={index}
                        href={page.href}
                        className={clsx(
                          "flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 text-sm font-medium hover:bg-blue-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3",
                          {
                            "bg-blue-100 text-blue-600":
                              pathname === page.href ||
                              pathname.startsWith(page.href),
                          }
                        )}
                      >
                        <LinkIcon className="w-6" />
                        <p className="hidden md:block">{page.name}</p>
                      </Link>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          );
        })}
      </div>
    </>
  );
}

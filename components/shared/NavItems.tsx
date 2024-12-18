'use client'
import { headerLinks } from "@/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Search from "./Search";

const NavItems = () => {
  const pathname = usePathname();
  return (
    <ul className="my-2 md:flex-between flex h-full flex-col items-start gap-5 md:flex-row">
      {headerLinks.map((item) => {
        const isActive = pathname === item.route;
        return (
          <li key={item.route} className={`${isActive && 'text-primary-500'} flex-center p-medium-16 whitespace-nowrap`}>
            <Link href={item.route}> {item.label}</Link>
          </li>
        )
      })}
    </ul>
  )
}

export default NavItems;


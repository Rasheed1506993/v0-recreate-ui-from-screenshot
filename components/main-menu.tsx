"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function MainMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const menuItems = [
    { title: "عن بلدي", href: "#" },
    { title: "مركز المعرفة", href: "#" },
    { title: "الخدمات", href: "#" },
    { title: "الاستعلامات", href: "#" },
    { title: "المنصات", href: "#" },
    { title: "تواصل معنا", href: "#" },
  ]

  return (
    <div>
      {/* زر القائمة */}
      <button onClick={toggleMenu} className="text-white p-2">
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* القائمة المنسدلة */}
      <div
        className={cn(
          "fixed left-0 right-0 bg-[#006e63] text-white overflow-hidden transition-all duration-300 ease-in-out z-40",
          isOpen ? "max-h-[400px] border-b border-[#005a52]" : "max-h-0",
        )}
      >
        <div className="container mx-auto px-4">
          <ul className="py-2">
            {menuItems.map((item, index) => (
              <li key={index} className="py-2 border-b border-[#005a52] last:border-0">
                <Link href={item.href} className="block text-right pr-4 py-2 hover:bg-[#005a52] rounded-md">
                  {item.title} ←
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* طبقة شفافة تظهر خلف القائمة عند فتحها */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={toggleMenu} aria-hidden="true"></div>
      )}
    </div>
  )
}

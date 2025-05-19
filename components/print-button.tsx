"use client"

import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

export function PrintButton() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <Button onClick={handlePrint} className="bg-teal-700 hover:bg-teal-800 shadow-md print:hidden">
      <Printer className="mr-2 h-4 w-4" /> طباعة الشهادة
    </Button>
  )
}

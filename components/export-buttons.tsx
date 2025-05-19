"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Printer, FileDown, Loader2 } from "lucide-react"

export function ExportButtons() {
  const [isExporting, setIsExporting] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const handleExportPDF = async () => {
    setIsExporting(true)

    try {
      // Dynamically import html2pdf to avoid SSR issues
      const html2pdfModule = await import("html2pdf.js")
      const html2pdf = html2pdfModule.default || html2pdfModule

      // Get the certificate element
      const element = document.getElementById("certificate-container")

      if (!element) {
        throw new Error("Certificate element not found")
      }

      // Configure html2pdf options
      const opt = {
        margin: 10,
        filename: "الشهادة_الصحية_الموحدة.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
      }

      // Generate PDF
      await html2pdf().set(opt).from(element).save()
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("حدث خطأ أثناء تصدير ملف PDF. يرجى المحاولة مرة أخرى.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex justify-center gap-4 mt-6 mb-10">
      <Button onClick={handlePrint} className="bg-teal-700 hover:bg-teal-800 shadow-md print:hidden">
        <Printer className="mr-2 h-4 w-4" /> طباعة الشهادة
      </Button>

      <Button
        onClick={handleExportPDF}
        disabled={isExporting}
        className="bg-blue-600 hover:bg-blue-700 shadow-md print:hidden"
      >
        {isExporting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> جاري التصدير...
          </>
        ) : (
          <>
            <FileDown className="mr-2 h-4 w-4" /> تصدير PDF
          </>
        )}
      </Button>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileDown, Loader2 } from "lucide-react"

export function PdfExportButton() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExportPDF = async () => {
    setIsExporting(true)

    try {
      // Use a simpler approach with jspdf and html2canvas
      const [jsPDFModule, html2canvasModule] = await Promise.all([import("jspdf"), import("html2canvas")])

      const jsPDF = jsPDFModule.default
      const html2canvas = html2canvasModule.default

      const element = document.getElementById("certificate-container")
      if (!element) {
        throw new Error("Certificate element not found")
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
      })

      const imgData = canvas.toDataURL("image/jpeg", 1.0)

      // Create PDF with correct dimensions
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight)
      pdf.save("الشهادة_الصحية_الموحدة.pdf")
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("حدث خطأ أثناء تصدير ملف PDF. يرجى المحاولة مرة أخرى.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button onClick={handleExportPDF} disabled={isExporting} className="bg-blue-600 hover:bg-blue-700 shadow-md">
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
  )
}

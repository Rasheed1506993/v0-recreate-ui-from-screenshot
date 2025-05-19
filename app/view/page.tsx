"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Phone, MapPin, AtSign, ArrowLeft, FileDown, Loader2 } from "lucide-react"

interface CertificateData {
  id: string
  name: string
  idNumber: string
  nationality: string
  profession: string
  certificateNumber: string
  issueDate: string
  expiryDate: string
  programType: string
  programEndDate: string
  photo: string | null
  qrCode: string | null
}

export default function ViewCertificate() {
  const router = useRouter()
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    // Get certificate data from localStorage
    const storedData = localStorage.getItem("certificateData")
    if (storedData) {
      const parsedData = JSON.parse(storedData)
      setCertificateData(parsedData)
    }
    setIsLoading(false)
  }, [])

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    )
  }

  if (!certificateData) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">لم يتم العثور على بيانات الشهادة</h1>
        <p className="mb-6">يرجى إنشاء شهادة جديدة أولاً</p>
        <Button onClick={() => router.push("/create")} className="bg-teal-700 hover:bg-teal-800">
          إنشاء شهادة جديدة
        </Button>
      </div>
    )
  }

  // Create verification URL for the QR code
  const verificationUrl = typeof window !== "undefined" ? `${window.location.origin}/verify/${certificateData.id}` : ""

  return (
    <div className="max-w-2xl mx-auto bg-gray-100 p-4" dir="rtl">
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" onClick={() => router.push("/create")} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          العودة للنموذج
        </Button>

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
      </div>

      {/* Certificate Card */}
      <div id="certificate-container" className="bg-white rounded-md overflow-hidden shadow-sm">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b">
          <div className="w-full md:w-auto order-2 md:order-1 px-4 py-2">
            <Image
              src="/images/ministries-logos.png"
              alt="الشعارات الرسمية"
              width={200}
              height={60}
              className="object-contain"
            />
          </div>
          <div className="w-full md:w-auto order-1 md:order-2 bg-teal-700 text-white py-3 px-6">
            <h1 className="text-xl font-bold text-center md:text-right">الشهادة الصحية الموحدة</h1>
          </div>
        </div>

        {/* Name Section */}
        <div className="px-6 py-3 border-b">
          <h2 className="text-xl text-center md:text-right text-teal-700 font-bold">{certificateData.name}</h2>
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row-reverse">
          {/* Right Column - Photo and QR */}
          <div className="w-full md:w-1/3 p-4 flex flex-col items-center gap-4">
            <div className="border border-gray-300 p-1 max-w-[160px]">
              {certificateData.photo ? (
                <Image
                  src={certificateData.photo || "/placeholder.svg"}
                  alt="صورة شخصية"
                  width={130}
                  height={160}
                  className="object-cover"
                />
              ) : (
                <Image src="/images/photo.png" alt="صورة شخصية" width={130} height={160} className="object-cover" />
              )}
            </div>
            <div className="border border-gray-300 p-1 max-w-[160px]">
              {certificateData.qrCode ? (
                <Image
                  src={certificateData.qrCode || "/placeholder.svg"}
                  alt="رمز QR"
                  width={130}
                  height={130}
                  className="object-contain"
                />
              ) : (
                <Image src="/images/qr-code.png" alt="رمز QR" width={130} height={130} className="object-contain" />
              )}
            </div>
            {verificationUrl && <p className="text-xs text-gray-500 text-center">امسح رمز QR للتحقق من صحة الشهادة</p>}
          </div>

          {/* Left Column - Information */}
          <div className="w-full md:w-2/3 p-0 overflow-x-auto">
            <table className="w-full border-collapse">
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 text-center bg-white">
                    <div className="text-gray-600 text-sm">الجنسية</div>
                    <div className="font-semibold">{certificateData.nationality}</div>
                  </td>
                  <td className="py-3 px-4 text-center bg-white border-l">
                    <div className="text-gray-600 text-sm">رقم الهوية</div>
                    <div className="font-semibold">{certificateData.idNumber}</div>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 text-center bg-white">
                    <div className="text-gray-600 text-sm">المهنة</div>
                    <div className="font-semibold">{certificateData.profession}</div>
                  </td>
                  <td className="py-3 px-4 text-center bg-white border-l">
                    <div className="text-gray-600 text-sm">رقم الشهادة الصحية</div>
                    <div className="font-semibold">{certificateData.certificateNumber}</div>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 text-center bg-white">
                    <div className="text-gray-600 text-sm">تاريخ نهاية الشهادة الصحية</div>
                    <div className="font-semibold">{certificateData.expiryDate}</div>
                  </td>
                  <td className="py-3 px-4 text-center bg-white border-l">
                    <div className="text-gray-600 text-sm">تاريخ إصدار الشهادة الصحية</div>
                    <div className="font-semibold">{certificateData.issueDate}</div>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 text-center bg-white">
                    <div className="text-gray-600 text-sm">تاريخ انتهاء البرنامج التفتيش</div>
                    <div className="font-semibold">{certificateData.programEndDate}</div>
                  </td>
                  <td className="py-3 px-4 text-center bg-white border-l">
                    <div className="text-gray-600 text-sm">نوع البرنامج التفتيش</div>
                    <div className="font-semibold">{certificateData.programType}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-gray-600">199040</span>
              <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <Phone className="w-3 h-3 text-green-600" />
              </span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="text-gray-600">Balady_cs</span>
              <MapPin className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-600">saudimomra</span>
              <AtSign className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-600">www.balady.gov.sa</span>
              <AtSign className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Instructions Section */}
      <div className="mt-4 bg-teal-700 text-white rounded-md p-6">
        {/* Header with logos and title */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-right">تعليمات وإرشادات</h2>

          <div className="flex items-center gap-4">
            <Image src="/images/palm-logo.png" alt="شعار النخلة" width={80} height={80} className="object-contain" />

            <Image
              src="/images/footer-logo.png"
              alt="شعار الوزارة"
              width={150}
              height={50}
              className="object-contain"
            />
          </div>
        </div>

        {/* Instructions content */}
        <div className="space-y-6 text-right">
          <div className="flex items-start justify-end gap-3">
            <p className="text-base">شهادة صحية تجدد سنويا.</p>
            <div className="mt-1 w-6 h-6 min-w-[1.5rem] rounded-full bg-white text-teal-700 flex items-center justify-center">
              ✦
            </div>
          </div>

          <div className="flex items-start justify-end gap-3">
            <p className="text-base">
              يسمح لحامل الشهادة الصحية بالعمل في منشآت الغذاء أو الصحة العامة وفق المهنة المسموح بها نظاما.
            </p>
            <div className="mt-1 w-6 h-6 min-w-[1.5rem] rounded-full bg-white text-teal-700 flex items-center justify-center">
              ✦
            </div>
          </div>

          <div className="flex items-start justify-end gap-3">
            <p className="text-base">
              يلزم حامل هذه الشهادة بإجراء فحص طبي عند عودته من الخارج قبل البدء بممارسة العمل.
            </p>
            <div className="mt-1 w-6 h-6 min-w-[1.5rem] rounded-full bg-white text-teal-700 flex items-center justify-center">
              ✦
            </div>
          </div>

          <div className="flex items-start justify-end gap-3">
            <p className="text-base">لا تعتبر الشهادة إثبات هوية.</p>
            <div className="mt-1 w-6 h-6 min-w-[1.5rem] rounded-full bg-white text-teal-700 flex items-center justify-center">
              ✦
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

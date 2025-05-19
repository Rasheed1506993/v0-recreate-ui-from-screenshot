"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getCertificateById, type Certificate } from "@/lib/supabase"
import { MainMenu } from "@/components/main-menu"

export default function VerifyCertificate({ params }: { params: { id: string } }) {
  const [certificateData, setCertificateData] = useState<Certificate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCertificate() {
      try {
        setIsLoading(true)
        const certificate = await getCertificateById(params.id)

        if (!certificate) {
          setError("لم يتم العثور على الشهادة المطلوبة")
          return
        }

        setCertificateData(certificate)
        setIsValid(true)
      } catch (err) {
        console.error("Error fetching certificate:", err)
        setError("حدث خطأ أثناء جلب بيانات الشهادة")
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchCertificate()
    }
  }, [params.id])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
      </div>
    )
  }

  if (!isValid || !certificateData) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>خطأ</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <h1 className="text-2xl font-bold mb-4">الشهادة غير صالحة</h1>
        <p className="mb-6">لم يتم العثور على بيانات الشهادة أو أنها غير صالحة</p>
        <Link href="/" passHref>
          <Button className="bg-teal-700 hover:bg-teal-800">العودة للصفحة الرئيسية</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f0f4f5]" dir="rtl">
      {/* Header - تصميم مطابق للصورة مع الشعار الجديد */}
      <header className="bg-[#006e63] text-white py-3 px-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center">
          <Image src="/images/balady-logo.png" alt="شعار بلدي" width={150} height={50} className="object-contain" />
        </div>
        <MainMenu />
      </header>

      {/* محتوى الصفحة الرئيسي - تصميم مطابق للصورة الجديدة */}
      <div className="max-w-md mx-auto bg-white shadow-sm p-6 my-4 rounded-md">
        {/* عنوان الشهادة */}
        <h1 className="text-xl font-bold text-center mb-4">الشهادة الصحية الموحدة</h1>

        {/* صورة الشهادة المصغرة */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-32 bg-gray-100 border border-gray-200 flex items-center justify-center">
            {certificateData.photo_url ? (
              <Image
                src={certificateData.photo_url || "/placeholder.svg"}
                alt="صورة شخصية"
                width={80}
                height={100}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Image src="/images/photo.png" alt="صورة شهادة" width={80} height={100} className="object-contain" />
              </div>
            )}
          </div>
        </div>

        {/* بيانات الشهادة - تصميم مطابق للصورة الجديدة */}
        <div className="grid grid-cols-2 gap-px bg-gray-200">
          <div className="bg-[#f5f5f5] p-3">
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">المهنة</div>
              <div className="text-sm">{certificateData.profession || "سائق خاص"}</div>
            </div>
          </div>
          <div className="bg-[#f5f5f5] p-3">
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">البلدية</div>
              <div className="text-sm">{certificateData.municipality || "بلدية مشيرفة"}</div>
            </div>
          </div>

          <div className="bg-[#f5f5f5] p-3">
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">الاسم</div>
              <div className="text-sm">{certificateData.name}</div>
            </div>
          </div>
          <div className="bg-[#f5f5f5] p-3">
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">رقم الهوية</div>
              <div className="text-sm">{certificateData.id_number}</div>
            </div>
          </div>

          <div className="bg-[#f5f5f5] p-3">
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">الجنس</div>
              <div className="text-sm">{certificateData.gender || "ذكر"}</div>
            </div>
          </div>
          <div className="bg-[#f5f5f5] p-3">
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">الجنسية</div>
              <div className="text-sm">{certificateData.nationality}</div>
            </div>
          </div>

          <div className="bg-[#f5f5f5] p-3">
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">رقم الشهادة الصحية</div>
              <div className="text-sm">{certificateData.certificate_number}</div>
            </div>
          </div>
          <div className="bg-[#f5f5f5] p-3">
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">المهنة</div>
              <div className="text-sm">{certificateData.profession}</div>
            </div>
          </div>

          <div className="bg-[#f5f5f5] p-3">
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">تاريخ إصدار الشهادة الصحية (ميلادي)</div>
              <div className="text-sm">2023/05/08</div>
            </div>
          </div>
          <div className="bg-[#f5f5f5] p-3">
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">تاريخ إصدار الشهادة الصحية (هجري)</div>
              <div className="text-sm">{certificateData.issue_date}</div>
            </div>
          </div>

          <div className="bg-[#f5f5f5] p-3">
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">تاريخ انتهاء الشهادة الصحية (ميلادي)</div>
              <div className="text-sm">2026/05/08</div>
            </div>
          </div>
          <div className="bg-[#f5f5f5] p-3">
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">تاريخ انتهاء الشهادة الصحية (هجري)</div>
              <div className="text-sm">{certificateData.expiry_date}</div>
            </div>
          </div>

          <div className="bg-[#f5f5f5] p-3">
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">نوع البرنامج التفتيش</div>
              <div className="text-sm">{certificateData.program_type}</div>
            </div>
          </div>
          <div className="bg-[#f5f5f5] p-3">
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">تاريخ انتهاء البرنامج التفتيش</div>
              <div className="text-sm">{certificateData.program_end_date}</div>
            </div>
          </div>

          <div className="bg-[#f5f5f5] p-3">
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">رقم الرخصة</div>
              <div className="text-sm">{certificateData.license_number || "4100671520174"}</div>
            </div>
          </div>
          <div className="bg-[#f5f5f5] p-3">
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">اسم المنشأة</div>
              <div className="text-sm">
                {certificateData.facility_name || "أسواق نوريم غالب بن شافي الشمس التجارية"}
              </div>
            </div>
          </div>

          <div className="bg-[#f5f5f5] p-3 col-span-2">
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">رقم المنشأة</div>
              <div className="text-sm">{certificateData.facility_number || "7041726855"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* زر الوصول */}
      <div className="fixed bottom-6 right-6">
        <button className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
          <span className="text-white text-2xl">♿</span>
        </button>
      </div>
    </div>
  )
}

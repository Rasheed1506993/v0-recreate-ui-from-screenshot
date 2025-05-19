"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSupabaseClient } from "@/lib/supabase"
import { MainMenu } from "@/components/main-menu"

export default function PublicVerifyPage({
  searchParams,
}: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [certificateData, setCertificateData] = useState<any>(null)
  const [supabaseAvailable, setSupabaseAvailable] = useState(false)

  // استخراج المعلومات من معلمات البحث
  const id = searchParams.id as string
  const name = searchParams.name as string
  const id_number = searchParams.id_number as string
  const certificate_number = searchParams.certificate_number as string
  const nationality = (searchParams.nationality as string) || "يمني"
  const profession = (searchParams.profession as string) || "سائق خاص"
  const issue_date = (searchParams.issue_date as string) || "1446/11/08"
  const expiry_date = (searchParams.expiry_date as string) || "1447/11/08"
  const program_type = (searchParams.program_type as string) || "متطلبات الغذاء"
  const program_end_date = (searchParams.program_end_date as string) || "1449/11/03"
  const facility_name = (searchParams.facility_name as string) || "أسواق نوريم غالب بن شافي الشمس التجارية"
  const facility_number = (searchParams.facility_number as string) || "7041726855"
  const license_number = (searchParams.license_number as string) || "4100671520174"
  const gender = (searchParams.gender as string) || "ذكر"
  const municipality = (searchParams.municipality as string) || "بلدية مشيرفة"

  useEffect(() => {
    async function verifyData() {
      try {
        setIsLoading(true)

        // التحقق من وجود المعلومات الأساسية
        if (!id || !name || !id_number || !certificate_number) {
          setError("معلومات الشهادة غير مكتملة")
          setIsValid(false)
          return
        }

        // التحقق من توفر عميل Supabase
        const client = getSupabaseClient()
        if (client) {
          setSupabaseAvailable(true)

          // محاولة البحث عن الشهادة في قاعدة البيانات
          try {
            const { data, error: dbError } = await client.from("certificates").select("*").eq("id", id).single()

            if (data) {
              // إذا وجدنا الشهادة في قاعدة البيانات، نستخدم بياناتها
              setCertificateData(data)
              setIsValid(true)
              return
            }
          } catch (dbError) {
            console.log("لا يمكن الاتصال بقاعدة البيانات، سنستخدم البيانات المضمنة في الرابط")
          }
        }

        // إذا لم نتمكن من الاتصال بقاعدة البيانات، نستخدم البيانات المضمنة في الرابط
        setCertificateData({
          id,
          name,
          id_number,
          certificate_number,
          nationality,
          profession,
          issue_date,
          expiry_date,
          program_type,
          program_end_date,
          facility_name,
          facility_number,
          license_number,
          gender,
          municipality,
        })
        setIsValid(true)
      } catch (err) {
        console.error("Error verifying certificate:", err)
        setError("حدث خطأ أثناء التحقق من الشهادة")
        setIsValid(false)
      } finally {
        setIsLoading(false)
      }
    }

    verifyData()
  }, [
    id,
    name,
    id_number,
    certificate_number,
    nationality,
    profession,
    issue_date,
    expiry_date,
    program_type,
    program_end_date,
    facility_name,
    facility_number,
    license_number,
    gender,
    municipality,
  ])

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
      <NavbarSimple />
    </header>
  </div>

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
              <div className="text-sm">{certificateData.name || "أمجد أحمد هزاع أحمد أحمد الصيادي"}</div>
            </div>
          </div>
          <div className="bg-[#f5f5f5] p-3">
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">رقم الهوية</div>
              <div className="text-sm">{certificateData.id_number || "2603052582"}</div>
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
              <div className="text-sm">{certificateData.nationality || "يمني"}</div>
            </div>
          </div>

          <div className="bg-[#f5f5f5] p-3">
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">رقم الشهادة الصحية</div>
              <div className="text-sm">{certificateData.certificate_number || "4609275972185"}</div>
            </div>
          </div>
          <div className="bg-[#f5f5f5] p-3">
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">المهنة</div>
              <div className="text-sm">{certificateData.profession || "سائق خاص"}</div>
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
              <div className="text-sm">{certificateData.issue_date || "1446/11/08"}</div>
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
              <div className="text-sm">{certificateData.expiry_date || "1447/11/08"}</div>
            </div>
          </div>

          <div className="bg-[#f5f5f5] p-3">
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">نوع البرنامج التفتيش</div>
              <div className="text-sm">{certificateData.program_type || "متطلبات الغذاء"}</div>
            </div>
          </div>
          <div className="bg-[#f5f5f5] p-3">
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">تاريخ انتهاء البرنامج التفتيش</div>
              <div className="text-sm">{certificateData.program_end_date || "1449/11/03"}</div>
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

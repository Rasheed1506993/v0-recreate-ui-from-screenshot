"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { PlusCircle, FileText, Search, BarChart2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getSupabaseClient } from "@/lib/supabase"

export default function Home() {
  const [showEnvWarning, setShowEnvWarning] = useState(false)

  useEffect(() => {
    // التحقق من توفر متغيرات البيئة
    const client = getSupabaseClient()
    if (!client) {
      setShowEnvWarning(true)
    }
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-4" dir="rtl">
      {showEnvWarning && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>تنبيه: متغيرات البيئة غير متوفرة</AlertTitle>
          <AlertDescription>
            <p>متغيرات البيئة الخاصة بـ Supabase غير متوفرة. بعض الوظائف قد لا تعمل بشكل صحيح.</p>
            <p className="mt-2">للاستخدام الكامل للتطبيق، يرجى التأكد من إضافة متغيرات البيئة التالية:</p>
            <ul className="list-disc list-inside mt-2">
              <li>NEXT_PUBLIC_SUPABASE_URL</li>
              <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
            </ul>
            <p className="mt-2">يمكنك استخدام صفحة التحقق العامة من خلال مسح رمز QR.</p>
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <Image
            src="/images/ministries-logos.png"
            alt="الشعارات الرسمية"
            width={300}
            height={90}
            className="mx-auto"
          />
        </div>

        <h1 className="text-3xl font-bold text-teal-700 mb-4">نظام الشهادة الصحية الموحدة</h1>

        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          مرحباً بك في نظام الشهادة الصحية الموحدة. يمكنك إنشاء شهادة صحية جديدة أو البحث عن شهادة موجودة.
        </p>

        <div className="flex flex-col md:flex-row justify-center gap-4 flex-wrap">
          <Link href="/create" passHref>
            <Button className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-2 rounded-md flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              إنشاء شهادة جديدة
            </Button>
          </Link>

          <Link href="/certificates" passHref>
            <Button
              variant="outline"
              className="border-teal-700 text-teal-700 hover:bg-teal-50 px-6 py-2 rounded-md flex items-center gap-2"
            >
              <FileText className="h-5 w-5" />
              عرض جميع الشهادات
            </Button>
          </Link>

          <Link href="/search" passHref>
            <Button
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-md flex items-center gap-2"
            >
              <Search className="h-5 w-5" />
              البحث عن شهادة
            </Button>
          </Link>

          <Link href="/dashboard" passHref>
            <Button
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50 px-6 py-2 rounded-md flex items-center gap-2"
            >
              <BarChart2 className="h-5 w-5" />
              لوحة التحكم
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-teal-700 mb-4">معلومات عن الشهادة الصحية الموحدة</h2>

        <div className="space-y-4 text-gray-600">
          <p>الشهادة الصحية الموحدة هي وثيقة رسمية تصدر للعاملين في منشآت الغذاء والصحة العامة.</p>

          <p>تهدف الشهادة إلى ضمان سلامة العاملين صحياً وخلوهم من الأمراض المعدية التي قد تنتقل عن طريق الغذاء.</p>

          <p>يجب تجديد الشهادة سنوياً وإجراء الفحوصات الطبية اللازمة للحصول عليها.</p>
        </div>
      </div>
    </div>
  )
}

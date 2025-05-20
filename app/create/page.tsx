"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, ArrowLeft, Upload, AlertCircle } from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"
import { v4 as uuidv4 } from "uuid"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createCertificate, uploadImage, getSupabaseClient } from "@/lib/supabase"

export default function CreateCertificate() {
  const router = useRouter()
  const qrRef = useRef<HTMLDivElement>(null)
  const [certificateId, setCertificateId] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    id_number: "",
    nationality: "",
    profession: "",
    certificate_number: "",
    issue_date: "",
    expiry_date: "",
    program_type: "",
    program_end_date: "",
    facility_name: "أسواق نوريم غالب بن شافي الشمس التجارية",
    facility_number: "7041726855",
    license_number: "4100671520174",
    gender: "ذكر",
    municipality: "بلدية مشيرفة",
  })

  const [photo, setPhoto] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [qrGenerated, setQrGenerated] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [storageError, setStorageError] = useState<boolean>(false)
  const [supabaseAvailable, setSupabaseAvailable] = useState(true)

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true)

    // التحقق من توفر عميل Supabase
    const client = getSupabaseClient()
    if (!client) {
      setSupabaseAvailable(false)
    }
  }, [])

  // Generate a unique ID for the certificate when the component mounts
  useEffect(() => {
    setCertificateId(uuidv4())
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhoto(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Function to convert QR code canvas to image data URL
  const generateQRCodeImage = () => {
    if (qrRef.current) {
      // Get the canvas element from the QR code component
      const canvas = qrRef.current.querySelector("canvas")
      if (canvas) {
        // Convert canvas to data URL
        const dataURL = canvas.toDataURL("image/png")
        setQrCode(dataURL)
        setQrGenerated(true)
        return dataURL
      }
    }
    return null
  }

  // تعديل دالة handleSubmit لتحسين معالجة الأخطاء
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setStorageError(false)

    try {
      // Generate QR code image if not already generated
      const qrCodeDataUrl = qrGenerated ? qrCode : generateQRCodeImage()

      // إنشاء كائن الشهادة الأساسي
      const certificateData = {
        ...formData,
        photo_url: null,
        qr_code_url: null,
      }

      // التحقق من توفر عميل Supabase
      const client = getSupabaseClient()
      if (!client) {
        setError("متغيرات البيئة الخاصة بـ Supabase غير متوفرة. لا يمكن حفظ الشهادة في قاعدة البيانات.")
        setIsSubmitting(false)
        return
      }

      // محاولة تحميل الصور إذا كانت متوفرة
      try {
        // Upload photo to Supabase Storage if available
        if (photo) {
          const photoUrl = await uploadImage(photo, `photo_${certificateId}`)
          if (photoUrl) {
            certificateData.photo_url = photoUrl
          }
        }

        // Upload QR code to Supabase Storage if available
        if (qrCodeDataUrl) {
          const qrCodeUrl = await uploadImage(qrCodeDataUrl, `qrcode_${certificateId}`)
          if (qrCodeUrl) {
            certificateData.qr_code_url = qrCodeUrl
          }
        }
      } catch (uploadError) {
        console.error("Error uploading images:", uploadError)
        setStorageError(true)
        // نستمر في إنشاء الشهادة حتى لو فشل تحميل الصور
      }

      // Create certificate in Supabase
      const newCertificate = await createCertificate(certificateData)

      if (!newCertificate) {
        throw new Error("فشل في إنشاء الشهادة. يرجى المحاولة مرة أخرى.")
      }

      // Redirect to the certificate view page
      router.push(`/view/${newCertificate.id}`)
    } catch (err) {
      console.error("Error creating certificate:", err)
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء إنشاء الشهادة. يرجى المحاولة مرة أخرى.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // تعديل رابط التحقق ليتضمن جميع معلومات الشهادة
  const verificationUrl = isClient
  ? `${window.location.origin}/verify/${certificateId}`
  : ""

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-50" dir="rtl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold text-teal-700">إنشاء شهادة صحية جديدة</h1>
          <Button variant="outline" onClick={() => router.push("/")} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            العودة
          </Button>
        </div>

        {!supabaseAvailable && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>تنبيه: متغيرات البيئة غير متوفرة</AlertTitle>
            <AlertDescription>
              متغيرات البيئة الخاصة بـ Supabase غير متوفرة. لا يمكن حفظ الشهادة في قاعدة البيانات. يمكنك استخدام رمز QR
              للتحقق من الشهادة، ولكن لن يتم حفظ البيانات.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>خطأ</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {storageError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>تنبيه</AlertTitle>
            <AlertDescription>
              هناك مشكلة في تخزين الصور. يرجى التأكد من إنشاء bucket بإسم "certificates" في لوحة تحكم Supabase وجعله
              عاماً (public).
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4 text-teal-700">البيانات الشخصية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم الكامل</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="أدخل الاسم الكامل"
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_number">رقم الهوية</Label>
                <Input
                  id="id_number"
                  name="id_number"
                  value={formData.id_number}
                  onChange={handleInputChange}
                  required
                  placeholder="أدخل رقم الهوية"
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">الجنسية</Label>
                <Input
                  id="nationality"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  required
                  placeholder="أدخل الجنسية"
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profession">المهنة</Label>
                <Input
                  id="profession"
                  name="profession"
                  value={formData.profession}
                  onChange={handleInputChange}
                  required
                  placeholder="أدخل المهنة"
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">الجنس</Label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange as any}
                  required
                  className="w-full p-2 border rounded-md text-right"
                >
                  <option value="ذكر">ذكر</option>
                  <option value="أنثى">أنثى</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="municipality">البلدية</Label>
                <Input
                  id="municipality"
                  name="municipality"
                  value={formData.municipality}
                  onChange={handleInputChange}
                  placeholder="أدخل اسم البلدية"
                  className="text-right"
                />
              </div>
            </div>
          </div>

          {/* Certificate Information Section */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4 text-teal-700">بيانات الشهادة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="certificate_number">رقم الشهادة الصحية</Label>
                <Input
                  id="certificate_number"
                  name="certificate_number"
                  value={formData.certificate_number}
                  onChange={handleInputChange}
                  required
                  placeholder="أدخل رقم الشهادة"
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="issue_date">تاريخ إصدار الشهادة</Label>
                <Input
                  id="issue_date"
                  name="issue_date"
                  value={formData.issue_date || ""}
                  onChange={handleInputChange}
                  placeholder="مثال: 1445/05/15"
                  className="text-right"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiry_date">تاريخ نهاية الشهادة</Label>
                <Input
                  id="expiry_date"
                  name="expiry_date"
                  value={formData.expiry_date || ""}
                  onChange={handleInputChange}
                  placeholder="مثال: 1446/05/15"
                  className="text-right"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="program_type">نوع البرنامج التفتيش</Label>
                <Input
                  id="program_type"
                  name="program_type"
                  value={formData.program_type}
                  onChange={handleInputChange}
                  required
                  placeholder="أدخل نوع البرنامج"
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="program_end_date">تاريخ انتهاء البرنامج</Label>
                <Input
                  id="program_end_date"
                  name="program_end_date"
                  value={formData.program_end_date || ""}
                  onChange={handleInputChange}
                  placeholder="مثال: 1447/05/15"
                  className="text-right"
                  required
                />
              </div>
            </div>
          </div>

          {/* Facility Information Section */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4 text-teal-700">بيانات المنشأة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facility_name">اسم المنشأة</Label>
                <Input
                  id="facility_name"
                  name="facility_name"
                  value={formData.facility_name}
                  onChange={handleInputChange}
                  placeholder="أدخل اسم المنشأة"
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facility_number">رقم المنشأة</Label>
                <Input
                  id="facility_number"
                  name="facility_number"
                  value={formData.facility_number}
                  onChange={handleInputChange}
                  placeholder="أدخل رقم المنشأة"
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="license_number">رقم الرخصة</Label>
                <Input
                  id="license_number"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleInputChange}
                  placeholder="أدخل رقم الرخصة"
                  className="text-right"
                />
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4 text-teal-700">الصور</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="photo">الصورة الشخصية</Label>
                <div className="flex flex-col items-center gap-4">
                  <div className="border border-gray-300 p-1 w-40 h-48 relative">
                    {photo ? (
                      <Image src={photo || "/placeholder.svg"} alt="الصورة الشخصية" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <Upload className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="w-full">
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="text-right"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qrCode">رمز QR (يتم توليده تلقائياً)</Label>
                <div className="flex flex-col items-center gap-4">
                  <div className="border border-gray-300 p-1 w-40 h-40 relative flex items-center justify-center">
                    <div ref={qrRef} className="w-full h-full flex items-center justify-center">
                      {isClient && (
                        <QRCodeCanvas
                          value={verificationUrl}
                          size={150}
                          level="H"
                          includeMargin={true}
                          // تم إزالة خاصية imageSettings لاستبعاد الشعارات من QR
                        />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 text-center">
                    سيتم توليد رمز QR تلقائياً يحتوي على رابط للتحقق من صحة الشهادة
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              className="bg-teal-700 hover:bg-teal-800 text-white px-8 py-2 rounded-md"
              disabled={isSubmitting || !supabaseAvailable}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span> جاري الإنشاء...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> إنشاء الشهادة
                </>
              )}
            </Button>
          </div>

          {!supabaseAvailable && (
            <div className="text-center text-red-500 mt-4">
              لا يمكن إنشاء الشهادة بسبب عدم توفر متغيرات البيئة الخاصة بـ Supabase.
            </div>
          )}
        </form>
      </div>
    </div>
  )
}



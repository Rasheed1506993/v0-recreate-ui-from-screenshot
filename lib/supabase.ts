import { createClient } from "@supabase/supabase-js"

// تعريف عميل Supabase مع التعامل مع حالات عدم توفر متغيرات البيئة
let supabaseClient: ReturnType<typeof createClient> | null = null

// دالة للحصول على عميل Supabase مع التعامل مع الأخطاء
export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient

  // تأكد من أن متغيرات البيئة متوفرة
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // إذا لم تكن متغيرات البيئة متوفرة، أرجع null
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Missing Supabase environment variables")
    return null
  }

  // إنشاء عميل Supabase
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseClient
}

// إنشاء عميل Supabase للاستخدام في جانب العميل (مع التعامل مع الأخطاء)
export const supabase = getSupabaseClient()

// نوع بيانات الشهادة
export interface Certificate {
  id: string
  name: string
  id_number: string
  nationality: string
  profession: string
  certificate_number: string
  issue_date: string
  expiry_date: string
  program_type: string
  program_end_date: string
  photo_url?: string | null
  qr_code_url?: string | null
  created_at?: string
  updated_at?: string
  facility_name?: string
  facility_number?: string
  license_number?: string
  gender?: string
  municipality?: string
}

// دالة لتحميل الصورة إلى Supabase Storage
export async function uploadImage(
  file: string, // Base64 encoded image
  path: string,
): Promise<string | null> {
  try {
    const client = getSupabaseClient()
    if (!client) {
      throw new Error("Supabase client not available")
    }

    // تحويل Base64 إلى Blob
    const base64Data = file.split(",")[1]
    const blob = await fetch(`data:image/png;base64,${base64Data}`).then((res) => res.blob())

    // تحميل الملف - نفترض أن bucket "certificates" موجود مسبقاً
    const fileName = `${path}_${Date.now()}.png`
    const { data, error } = await client.storage.from("certificates").upload(fileName, blob, {
      contentType: "image/png",
      upsert: true,
    })

    if (error) {
      console.error("Error uploading image:", error)
      return null
    }

    // إنشاء URL للصورة
    const { data: urlData } = client.storage.from("certificates").getPublicUrl(fileName)
    return urlData.publicUrl
  } catch (error) {
    console.error("Error in uploadImage:", error)
    return null
  }
}

// دالة لإنشاء شهادة جديدة
export async function createCertificate(
  certificate: Omit<Certificate, "id" | "created_at" | "updated_at">,
): Promise<Certificate | null> {
  try {
    const client = getSupabaseClient()
    if (!client) {
      throw new Error("Supabase client not available")
    }

    const { data, error } = await client.from("certificates").insert([certificate]).select().single()

    if (error) {
      console.error("Error creating certificate:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in createCertificate:", error)
    return null
  }
}

// تحديث دالة جلب الصورة من Supabase
export async function getCertificateById(id: string): Promise<Certificate | null> {
  try {
    const client = getSupabaseClient()
    if (!client) {
      throw new Error("Supabase client not available")
    }

    const { data, error } = await client.from("certificates").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching certificate:", error)
      return null
    }

    // التحقق من وجود روابط الصور وإضافة معلومات الوصول العام إذا لزم الأمر
    if (data) {
      // التأكد من أن روابط الصور تحتوي على معلومات الوصول العام
      if (data.photo_url && !data.photo_url.includes("?")) {
        try {
          const { data: publicUrlData } = client.storage
            .from("certificates")
            .getPublicUrl(data.photo_url.split("/").pop() || "")
          data.photo_url = publicUrlData.publicUrl
        } catch (e) {
          console.error("Error getting public URL for photo:", e)
        }
      }

      if (data.qr_code_url && !data.qr_code_url.includes("?")) {
        try {
          const { data: publicUrlData } = client.storage
            .from("certificates")
            .getPublicUrl(data.qr_code_url.split("/").pop() || "")
          data.qr_code_url = publicUrlData.publicUrl
        } catch (e) {
          console.error("Error getting public URL for QR code:", e)
        }
      }
    }

    return data
  } catch (error) {
    console.error("Error in getCertificateById:", error)
    return null
  }
}

// دالة للحصول على جميع الشهادات
export async function getAllCertificates(): Promise<Certificate[]> {
  try {
    const client = getSupabaseClient()
    if (!client) {
      throw new Error("Supabase client not available")
      return []
    }

    const { data, error } = await client.from("certificates").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching certificates:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getAllCertificates:", error)
    return []
  }
}

// دالة لحذف شهادة بواسطة المعرف
export async function deleteCertificate(id: string): Promise<boolean> {
  try {
    const client = getSupabaseClient()
    if (!client) {
      throw new Error("Supabase client not available")
    }

    // حذف الشهادة من قاعدة البيانات
    const { error } = await client.from("certificates").delete().eq("id", id)

    if (error) {
      console.error("Error deleting certificate:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in deleteCertificate:", error)
    return false
  }
}

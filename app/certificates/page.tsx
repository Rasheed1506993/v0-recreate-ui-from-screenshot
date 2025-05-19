"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, FileDown, ArrowLeft, AlertCircle, Loader2, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getAllCertificates, deleteCertificate, type Certificate } from "@/lib/supabase"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"

export default function CertificatesPage() {
  const router = useRouter()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [certificateToDelete, setCertificateToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const fetchCertificates = async () => {
    try {
      setIsLoading(true)
      const data = await getAllCertificates()
      setCertificates(data)
    } catch (err) {
      console.error("Error fetching certificates:", err)
      setError("حدث خطأ أثناء جلب بيانات الشهادات")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCertificates()
  }, [])

  const handleDeleteCertificate = async () => {
    if (!certificateToDelete) return

    try {
      setIsDeleting(true)
      const success = await deleteCertificate(certificateToDelete)

      if (success) {
        // تحديث قائمة الشهادات بعد الحذف
        setCertificates((prev) => prev.filter((cert) => cert.id !== certificateToDelete))
      } else {
        setError("فشل في حذف الشهادة. يرجى المحاولة مرة أخرى.")
      }
    } catch (err) {
      console.error("Error deleting certificate:", err)
      setError("حدث خطأ أثناء حذف الشهادة")
    } finally {
      setIsDeleting(false)
      setCertificateToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-teal-700">جميع الشهادات الصحية</h1>
        <Button variant="outline" onClick={() => router.push("/")} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          العودة للصفحة الرئيسية
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>خطأ</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {certificates.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold mb-4">لا توجد شهادات</h2>
          <p className="text-gray-600 mb-6">لم يتم العثور على أي شهادات صحية في النظام</p>
          <Link href="/create" passHref>
            <Button className="bg-teal-700 hover:bg-teal-800">إنشاء شهادة جديدة</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((certificate) => (
            <Card key={certificate.id} className="overflow-hidden">
              <CardHeader className="bg-teal-700 text-white p-4">
                <CardTitle className="text-lg">{certificate.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">رقم الهوية:</span> {certificate.id_number}
                  </p>
                  <p>
                    <span className="font-medium">المهنة:</span> {certificate.profession}
                  </p>
                  <p>
                    <span className="font-medium">تاريخ الإصدار:</span> {certificate.issue_date}
                  </p>
                  <p>
                    <span className="font-medium">تاريخ الانتهاء:</span> {certificate.expiry_date}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 p-4 flex justify-between">
                <div className="flex gap-2">
                  <Link href={`/view/${certificate.id}`} passHref>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" /> عرض الشهادة
                    </Button>
                  </Link>
                  <Link href={`/verify/${certificate.id}`} passHref>
                    <Button variant="outline" className="flex items-center gap-2 border-green-600 text-green-600">
                      <FileDown className="h-4 w-4" /> التحقق
                    </Button>
                  </Link>
                </div>
                <Dialog
                  open={deleteDialogOpen && certificateToDelete === certificate.id}
                  onOpenChange={(open) => {
                    setDeleteDialogOpen(open)
                    if (!open) setCertificateToDelete(null)
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                      onClick={() => setCertificateToDelete(certificate.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>تأكيد حذف الشهادة</DialogTitle>
                      <DialogDescription>
                        هل أنت متأكد من رغبتك في حذف شهادة {certificate.name}؟ هذا الإجراء لا يمكن التراجع عنه.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex justify-between sm:justify-between">
                      <DialogClose asChild>
                        <Button variant="outline">إلغاء</Button>
                      </DialogClose>
                      <Button variant="destructive" onClick={handleDeleteCertificate} disabled={isDeleting}>
                        {isDeleting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin ml-2" /> جاري الحذف...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 ml-2" /> تأكيد الحذف
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

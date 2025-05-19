"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Users, Calendar, FileCheck, AlertCircle, Loader2, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { supabase, deleteCertificate } from "@/lib/supabase"
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

interface DashboardStats {
  totalCertificates: number
  certificatesThisMonth: number
  expiringCertificates: number
  uniqueProfessions: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalCertificates: 0,
    certificatesThisMonth: 0,
    expiringCertificates: 0,
    uniqueProfessions: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recentCertificates, setRecentCertificates] = useState<any[]>([])
  const [certificateToDelete, setCertificateToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // الحصول على إجمالي عدد الشهادات
      const { count: totalCount, error: countError } = await supabase
        .from("certificates")
        .select("*", { count: "exact", head: true })

      if (countError) throw countError

      // الحصول على الشهادات المضافة هذا الشهر
      const currentDate = new Date()
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

      const { count: monthlyCount, error: monthlyError } = await supabase
        .from("certificates")
        .select("*", { count: "exact", head: true })
        .gte("created_at", firstDayOfMonth.toISOString())

      if (monthlyError) throw monthlyError

      // الحصول على عدد المهن الفريدة
      const { data: professionsData, error: professionsError } = await supabase
        .from("certificates")
        .select("profession")
        .limit(1000)

      if (professionsError) throw professionsError

      const uniqueProfessions = new Set(professionsData.map((item) => item.profession)).size

      // الحصول على الشهادات التي ستنتهي قريباً (تقريبي - نظراً لأن التواريخ مخزنة كنصوص)
      // في تطبيق حقيقي، يجب تخزين التواريخ بتنسيق مناسب للمقارنة
      const { count: expiringCount, error: expiringError } = await supabase
        .from("certificates")
        .select("*", { count: "exact", head: true })
        .ilike("expiry_date", `%${currentDate.getFullYear()}%`)

      if (expiringError) throw expiringError

      // الحصول على أحدث الشهادات
      const { data: recentData, error: recentError } = await supabase
        .from("certificates")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)

      if (recentError) throw recentError

      setStats({
        totalCertificates: totalCount || 0,
        certificatesThisMonth: monthlyCount || 0,
        expiringCertificates: expiringCount || 0,
        uniqueProfessions: uniqueProfessions,
      })

      setRecentCertificates(recentData || [])
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      setError("حدث خطأ أثناء جلب بيانات لوحة التحكم")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleDeleteCertificate = async () => {
    if (!certificateToDelete) return

    try {
      setIsDeleting(true)
      const success = await deleteCertificate(certificateToDelete)

      if (success) {
        // تحديث قائمة الشهادات بعد الحذف
        setRecentCertificates((prev) => prev.filter((cert) => cert.id !== certificateToDelete))

        // تحديث الإحصائيات
        setStats((prev) => ({
          ...prev,
          totalCertificates: Math.max(0, prev.totalCertificates - 1),
          certificatesThisMonth: Math.max(0, prev.certificatesThisMonth - 1),
        }))
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
    <div className="max-w-6xl mx-auto p-4" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-teal-700">لوحة التحكم</h1>
          <p className="text-gray-600">نظرة عامة على الشهادات الصحية</p>
        </div>
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

      {/* إحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">إجمالي الشهادات</CardTitle>
            <Users className="h-4 w-4 text-teal-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCertificates}</div>
            <p className="text-xs text-gray-500">شهادة صحية مسجلة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">الشهادات هذا الشهر</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.certificatesThisMonth}</div>
            <p className="text-xs text-gray-500">شهادة جديدة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">الشهادات المنتهية قريباً</CardTitle>
            <FileCheck className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expiringCertificates}</div>
            <p className="text-xs text-gray-500">شهادة تنتهي هذا العام</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">المهن المسجلة</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueProfessions}</div>
            <p className="text-xs text-gray-500">مهنة مختلفة</p>
          </CardContent>
        </Card>
      </div>

      {/* أحدث الشهادات */}
      <h2 className="text-xl font-semibold text-teal-700 mb-4">أحدث الشهادات</h2>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الاسم
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  رقم الهوية
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المهنة
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تاريخ الإصدار
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تاريخ الانتهاء
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentCertificates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                    لا توجد شهادات مسجلة بعد
                  </td>
                </tr>
              ) : (
                recentCertificates.map((certificate) => (
                  <tr key={certificate.id}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{certificate.name}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{certificate.id_number}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{certificate.profession}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{certificate.issue_date}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{certificate.expiry_date}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-left">
                      <div className="flex gap-2 justify-end">
                        <Link href={`/view/${certificate.id}`} passHref>
                          <Button variant="outline" size="sm" className="ml-2">
                            عرض
                          </Button>
                        </Link>
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
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* رابط لعرض جميع الشهادات */}
      <div className="mt-4 text-center">
        <Link href="/certificates" passHref>
          <Button variant="link" className="text-teal-700">
            عرض جميع الشهادات
          </Button>
        </Link>
      </div>
    </div>
  )
}

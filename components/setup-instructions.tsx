import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function SetupInstructions() {
  return (
    <Alert className="mb-6 bg-amber-50 border-amber-200">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">تعليمات الإعداد</AlertTitle>
      <AlertDescription className="text-amber-700">
        <p className="mb-2">لاستخدام ميزة تخزين الصور، يجب إنشاء bucket في Supabase Storage باتباع الخطوات التالية:</p>
        <ol className="list-decimal list-inside space-y-1 mr-4">
          <li>قم بتسجيل الدخول إلى لوحة تحكم Supabase</li>
          <li>انتقل إلى قسم "Storage" من القائمة الجانبية</li>
          <li>انقر على زر "New Bucket"</li>
          <li>أدخل اسم الـ bucket: "certificates"</li>
          <li>تأكد من تحديد خيار "Public bucket" لجعل الملفات قابلة للوصول العام</li>
          <li>انقر على "Create bucket" لإنشاء الـ bucket</li>
          <li>بعد إنشاء الـ bucket، انتقل إلى تبويب "Policies"</li>
          <li>أضف سياسة جديدة تسمح بالقراءة والكتابة للمستخدمين المجهولين</li>
        </ol>
      </AlertDescription>
    </Alert>
  )
}

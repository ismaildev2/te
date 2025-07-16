// Server-side Supabase client with service role key for file uploads and admin operations
import { createClient } from '@supabase/supabase-js'

// استيراد المفاتيح من ملف البيئة
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// التحقق من وجود المتغيرات
if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseServiceKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// إنشاء العميل مع مفتاح الخدمة للعمليات الإدارية
// إذا لم يكن مفتاح الخدمة متوفراً، استخدم مفتاح anon كبديل
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// دالة لإنشاء عميل Supabase للخادم
export function createServerSupabaseClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

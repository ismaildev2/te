// فحص اتصال قاعدة البيانات في الإنتاج
const { createClient } = require('@supabase/supabase-js');

// استخدام نفس المفاتيح المرفوعة على Vercel
const SUPABASE_URL = 'https://xfxpwbqgtuhbkeksdbqn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZnB3YnFndHVoYmtla3NkYnFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAxNTgsImV4cCI6MjA2ODE1NjE1OH0.YQQcmfSpyEqJRO_83kzMeSrOsxt-SIJptVq0FZFPt-I';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugProductionDatabase() {
  try {
    console.log('🔍 فحص اتصال قاعدة البيانات في الإنتاج...');
    console.log(`📍 URL: ${SUPABASE_URL}`);
    console.log('='.repeat(70));

    // اختبار 1: فحص أدوات الذكاء الاصطناعي
    console.log('\n1️⃣ فحص أدوات الذكاء الاصطناعي:');
    const { data: aiTools, error: aiError, count: aiCount } = await supabase
      .from('ai_tools')
      .select('id, name, slug, logo_url', { count: 'exact' })
      .limit(5);

    if (aiError) {
      console.log(`❌ خطأ في ai_tools: ${aiError.message}`);
      console.log(`📋 تفاصيل الخطأ:`, aiError);
    } else {
      console.log(`✅ ai_tools: ${aiCount} أداة موجودة`);
      console.log('📋 عينة من الأدوات:');
      aiTools?.forEach(tool => {
        console.log(`   - ${tool.name} (${tool.slug})`);
        console.log(`     Logo: ${tool.logo_url ? '✅' : '❌'}`);
      });
    }

    // اختبار 2: فحص المقالات
    console.log('\n2️⃣ فحص المقالات:');
    const { data: articles, error: articlesError, count: articlesCount } = await supabase
      .from('articles')
      .select('id, title, slug', { count: 'exact' })
      .limit(3);

    if (articlesError) {
      console.log(`❌ خطأ في articles: ${articlesError.message}`);
      console.log(`📋 تفاصيل الخطأ:`, articlesError);
    } else {
      console.log(`✅ articles: ${articlesCount} مقال موجود`);
      articles?.forEach(article => {
        console.log(`   - ${article.title} (${article.slug})`);
      });
    }

    // اختبار 3: فحص الخدمات
    console.log('\n3️⃣ فحص الخدمات:');
    const { data: services, error: servicesError, count: servicesCount } = await supabase
      .from('services')
      .select('id, name, slug', { count: 'exact' })
      .limit(3);

    if (servicesError) {
      console.log(`❌ خطأ في services: ${servicesError.message}`);
      console.log(`📋 تفاصيل الخطأ:`, servicesError);
    } else {
      console.log(`✅ services: ${servicesCount} خدمة موجودة`);
      services?.forEach(service => {
        console.log(`   - ${service.name} (${service.slug})`);
      });
    }

    // اختبار 4: فحص صفحات الموقع
    console.log('\n4️⃣ فحص صفحات الموقع:');
    const { data: pages, error: pagesError, count: pagesCount } = await supabase
      .from('site_pages')
      .select('id, slug', { count: 'exact' })
      .limit(3);

    if (pagesError) {
      console.log(`❌ خطأ في site_pages: ${pagesError.message}`);
      console.log(`📋 تفاصيل الخطأ:`, pagesError);
    } else {
      console.log(`✅ site_pages: ${pagesCount} صفحة موجودة`);
      pages?.forEach(page => {
        console.log(`   - ${page.slug}`);
      });
    }

    // اختبار 5: فحص RLS policies
    console.log('\n5️⃣ فحص سياسات الأمان (RLS):');
    try {
      // محاولة الوصول بدون مصادقة
      const { data: testData, error: testError } = await supabase
        .from('ai_tools')
        .select('name')
        .limit(1);

      if (testError) {
        console.log(`❌ مشكلة في RLS: ${testError.message}`);
        console.log('🔧 قد تحتاج إلى تحديث سياسات الأمان');
      } else {
        console.log('✅ RLS يعمل بشكل صحيح');
      }
    } catch (rlsError) {
      console.log(`❌ خطأ في RLS: ${rlsError.message}`);
    }

    console.log('\n🎯 النتيجة النهائية:');
    console.log('='.repeat(50));
    
    if (!aiError && !articlesError) {
      console.log('✅ قاعدة البيانات تعمل بشكل صحيح');
      console.log('🔍 المشكلة قد تكون في:');
      console.log('   - متغيرات البيئة في Vercel');
      console.log('   - مشاكل في SSR/SSG');
      console.log('   - مشاكل في الكود');
    } else {
      console.log('❌ هناك مشاكل في قاعدة البيانات');
      console.log('🔧 تحتاج إصلاح سياسات الأمان أو المفاتيح');
    }

  } catch (error) {
    console.error('💥 خطأ عام:', error.message);
    console.error('📋 تفاصيل:', error);
  }
}

debugProductionDatabase().then(() => {
  console.log('\n🎊 انتهى فحص قاعدة البيانات!');
});

// اختبار جلب البيانات للصفحة الرئيسية
const { createClient } = require('@supabase/supabase-js');

// استخدام نفس الإعدادات من SSG
const supabaseUrl = 'https://xfxpwbqgtuhbkeksdbqn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeHB3YnFndHVoYmtla3NkYnFuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4MDE1OCwiZXhwIjoyMDY4MTU2MTU4fQ.Ykpxe-yq1n-lxlESe9R0mg7ZADGcY3mMIu5uYhLt0zs';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testHomepageData() {
  try {
    console.log('🏠 اختبار بيانات الصفحة الرئيسية...');
    console.log('='.repeat(60));

    // اختبار 1: المقالات
    console.log('\n1️⃣ اختبار المقالات:');
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(8);

    if (articlesError) {
      console.log(`❌ خطأ في المقالات: ${articlesError.message}`);
    } else {
      console.log(`✅ المقالات: ${articles.length} مقال`);
      articles.slice(0, 3).forEach(article => {
        console.log(`   - ${article.title}`);
      });
    }

    // اختبار 2: أدوات الذكاء الاصطناعي
    console.log('\n2️⃣ اختبار أدوات الذكاء الاصطناعي:');
    const { data: aiTools, error: aiToolsError } = await supabase
      .from('ai_tools')
      .select('*')
      .in('status', ['published', 'active'])
      .order('rating', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(8);

    if (aiToolsError) {
      console.log(`❌ خطأ في أدوات AI: ${aiToolsError.message}`);
    } else {
      console.log(`✅ أدوات AI: ${aiTools.length} أداة`);
      aiTools.slice(0, 3).forEach(tool => {
        console.log(`   - ${tool.name} (${tool.rating}/5)`);
      });
    }

    // اختبار 3: الخدمات
    console.log('\n3️⃣ اختبار الخدمات:');
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .eq('status', 'active')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(3);

    if (servicesError) {
      console.log(`❌ خطأ في الخدمات: ${servicesError.message}`);
    } else {
      console.log(`✅ الخدمات: ${services.length} خدمة`);
      services.forEach(service => {
        console.log(`   - ${service.name}`);
      });
    }

    console.log('\n🎯 النتيجة النهائية:');
    console.log('='.repeat(50));
    
    if (!articlesError && !aiToolsError && !servicesError) {
      console.log('✅ جميع البيانات تُحمل بشكل صحيح!');
      console.log('🚀 الصفحة الرئيسية ستعمل في الإنتاج');
      console.log(`📊 الإجمالي: ${articles.length} مقال، ${aiTools.length} أداة، ${services.length} خدمة`);
      return true;
    } else {
      console.log('❌ بعض البيانات لا تُحمل بشكل صحيح');
      return false;
    }

  } catch (error) {
    console.error('💥 خطأ عام:', error.message);
    return false;
  }
}

testHomepageData().then(success => {
  if (success) {
    console.log('\n🎊 الصفحة الرئيسية جاهزة للعمل في الإنتاج!');
  } else {
    console.log('\n❌ تحتاج إصلاحات إضافية');
  }
});

// فحص شامل لجميع مكونات النظام
const { createClient } = require('@supabase/supabase-js');

// إعدادات قاعدة البيانات
const SUPABASE_URL = 'https://xfxpwbqgtuhbkeksdbqn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeHB3YnFndHVoYmtla3NkYnFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAxNTgsImV4cCI6MjA2ODE1NjE1OH0.YQQcmfSpyEqJRO_83kzMeSrOsxt-SIJptVq0FZFPt-I';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeHB3YnFndHVoYmtla3NkYnFuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4MDE1OCwiZXhwIjoyMDY4MTU2MTU4fQ.Ykpxe-yq1n-lxlESe9R0mg7ZADGcY3mMIu5uYhLt0zs';

const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseService = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function comprehensiveSystemTest() {
  console.log('🔍 بدء الفحص الشامل للنظام...');
  console.log('='.repeat(80));

  const results = {
    database: {},
    website: {},
    admin: {},
    production: {}
  };

  // 1. فحص قاعدة البيانات
  console.log('\n📊 1. فحص قاعدة البيانات:');
  console.log('-'.repeat(50));

  // أ) اختبار الاتصال بـ anon key
  try {
    const { data: testAnon, error: anonError } = await supabaseAnon
      .from('ai_tools')
      .select('name')
      .limit(1);

    if (anonError) {
      console.log('❌ Anon Key: فشل الاتصال -', anonError.message);
      results.database.anonConnection = false;
    } else {
      console.log('✅ Anon Key: يعمل بشكل صحيح');
      results.database.anonConnection = true;
    }
  } catch (e) {
    console.log('❌ Anon Key: خطأ في الاتصال -', e.message);
    results.database.anonConnection = false;
  }

  // ب) اختبار الاتصال بـ service key
  try {
    const { data: testService, error: serviceError } = await supabaseService
      .from('ai_tools')
      .select('name')
      .limit(1);

    if (serviceError) {
      console.log('❌ Service Key: فشل الاتصال -', serviceError.message);
      results.database.serviceConnection = false;
    } else {
      console.log('✅ Service Key: يعمل بشكل صحيح');
      results.database.serviceConnection = true;
    }
  } catch (e) {
    console.log('❌ Service Key: خطأ في الاتصال -', e.message);
    results.database.serviceConnection = false;
  }

  // ج) فحص البيانات في كل جدول
  const tables = [
    { name: 'ai_tools', expectedMin: 200, statusField: 'status', activeValue: 'active' },
    { name: 'articles', expectedMin: 20, statusField: 'status', activeValue: 'published' },
    { name: 'services', expectedMin: 3, statusField: 'status', activeValue: 'active' },
    { name: 'site_pages', expectedMin: 5, statusField: 'is_active', activeValue: true }
  ];

  for (const table of tables) {
    try {
      const { count, error } = await supabaseAnon
        .from(table.name)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table.name}: خطأ في الوصول - ${error.message}`);
        results.database[table.name] = { accessible: false, count: 0 };
      } else {
        const status = count >= table.expectedMin ? '✅' : '⚠️';
        console.log(`${status} ${table.name}: ${count} سجل (متوقع: ${table.expectedMin}+)`);
        results.database[table.name] = { accessible: true, count: count };
      }
    } catch (e) {
      console.log(`❌ ${table.name}: خطأ - ${e.message}`);
      results.database[table.name] = { accessible: false, count: 0 };
    }
  }

  // 2. فحص أيقونات SVG
  console.log('\n🎨 2. فحص أيقونات SVG:');
  console.log('-'.repeat(50));

  try {
    const { data: toolsWithLogos, error: logoError } = await supabaseAnon
      .from('ai_tools')
      .select('name, logo_url')
      .not('logo_url', 'is', null)
      .limit(10);

    if (logoError) {
      console.log('❌ فشل في جلب الأيقونات:', logoError.message);
      results.website.svgIcons = false;
    } else {
      const jsDelivrCount = toolsWithLogos.filter(tool => 
        tool.logo_url && tool.logo_url.includes('cdn.jsdelivr.net')
      ).length;
      
      const svgCount = toolsWithLogos.filter(tool => 
        tool.logo_url && tool.logo_url.endsWith('.svg')
      ).length;

      console.log(`✅ أيقونات SVG: ${svgCount}/${toolsWithLogos.length} أداة`);
      console.log(`✅ jsDelivr CDN: ${jsDelivrCount}/${toolsWithLogos.length} أداة`);
      
      results.website.svgIcons = svgCount > 0;
      results.website.jsDelivrCDN = jsDelivrCount > 0;

      // عرض عينة من الأيقونات
      console.log('📋 عينة من الأيقونات:');
      toolsWithLogos.slice(0, 3).forEach(tool => {
        const isJsDelivr = tool.logo_url.includes('cdn.jsdelivr.net');
        const isSVG = tool.logo_url.endsWith('.svg');
        console.log(`   ${tool.name}: ${isJsDelivr ? '✅ jsDelivr' : '❌'} ${isSVG ? '✅ SVG' : '❌'}`);
      });
    }
  } catch (e) {
    console.log('❌ خطأ في فحص الأيقونات:', e.message);
    results.website.svgIcons = false;
  }

  // 3. فحص تحميل البيانات للصفحة الرئيسية
  console.log('\n🏠 3. فحص تحميل البيانات للصفحة الرئيسية:');
  console.log('-'.repeat(50));

  // أ) المقالات للصفحة الرئيسية
  try {
    const { data: homeArticles, error: articlesError } = await supabaseAnon
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(8);

    if (articlesError) {
      console.log('❌ مقالات الصفحة الرئيسية: فشل التحميل -', articlesError.message);
      results.website.homeArticles = false;
    } else {
      console.log(`✅ مقالات الصفحة الرئيسية: ${homeArticles.length} مقال`);
      results.website.homeArticles = homeArticles.length > 0;
    }
  } catch (e) {
    console.log('❌ مقالات الصفحة الرئيسية: خطأ -', e.message);
    results.website.homeArticles = false;
  }

  // ب) أدوات الذكاء الاصطناعي للصفحة الرئيسية
  try {
    const { data: homeAITools, error: aiToolsError } = await supabaseAnon
      .from('ai_tools')
      .select('*')
      .order('rating', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(8);

    if (aiToolsError) {
      console.log('❌ أدوات AI للصفحة الرئيسية: فشل التحميل -', aiToolsError.message);
      results.website.homeAITools = false;
    } else {
      console.log(`✅ أدوات AI للصفحة الرئيسية: ${homeAITools.length} أداة`);
      results.website.homeAITools = homeAITools.length > 0;
    }
  } catch (e) {
    console.log('❌ أدوات AI للصفحة الرئيسية: خطأ -', e.message);
    results.website.homeAITools = false;
  }

  // ج) الخدمات للصفحة الرئيسية
  try {
    const { data: homeServices, error: servicesError } = await supabaseAnon
      .from('services')
      .select('*')
      .eq('status', 'active')
      .order('display_order', { ascending: true })
      .limit(3);

    if (servicesError) {
      console.log('❌ خدمات الصفحة الرئيسية: فشل التحميل -', servicesError.message);
      results.website.homeServices = false;
    } else {
      console.log(`✅ خدمات الصفحة الرئيسية: ${homeServices.length} خدمة`);
      results.website.homeServices = homeServices.length > 0;
    }
  } catch (e) {
    console.log('❌ خدمات الصفحة الرئيسية: خطأ -', e.message);
    results.website.homeServices = false;
  }

  // 4. فحص لوحة التحكم
  console.log('\n⚙️ 4. فحص لوحة التحكم:');
  console.log('-'.repeat(50));

  // اختبار إمكانية الكتابة بـ service key
  try {
    // محاولة إنشاء سجل اختبار
    const testData = {
      name: 'Test Tool - DELETE ME',
      slug: 'test-tool-delete-me',
      description: 'This is a test tool for system check',
      category: 'test',
      status: 'inactive'
    };

    const { data: insertResult, error: insertError } = await supabaseService
      .from('ai_tools')
      .insert([testData])
      .select();

    if (insertError) {
      console.log('❌ إمكانية الكتابة: فشل الإدراج -', insertError.message);
      results.admin.writeAccess = false;
    } else {
      console.log('✅ إمكانية الكتابة: تعمل بشكل صحيح');
      results.admin.writeAccess = true;

      // حذف السجل الاختباري
      await supabaseService
        .from('ai_tools')
        .delete()
        .eq('slug', 'test-tool-delete-me');
      
      console.log('✅ تم حذف السجل الاختباري');
    }
  } catch (e) {
    console.log('❌ إمكانية الكتابة: خطأ -', e.message);
    results.admin.writeAccess = false;
  }

  // 5. تقرير النتائج النهائية
  console.log('\n📋 5. تقرير النتائج النهائية:');
  console.log('='.repeat(80));

  const dbScore = Object.values(results.database).filter(Boolean).length;
  const websiteScore = Object.values(results.website).filter(Boolean).length;
  const adminScore = Object.values(results.admin).filter(Boolean).length;

  console.log(`📊 قاعدة البيانات: ${dbScore}/6 اختبار نجح`);
  console.log(`🌐 الموقع: ${websiteScore}/6 اختبار نجح`);
  console.log(`⚙️ لوحة التحكم: ${adminScore}/1 اختبار نجح`);

  const totalScore = dbScore + websiteScore + adminScore;
  const maxScore = 13;
  const percentage = Math.round((totalScore / maxScore) * 100);

  console.log(`\n🎯 النتيجة الإجمالية: ${totalScore}/${maxScore} (${percentage}%)`);

  if (percentage >= 90) {
    console.log('🎉 ممتاز! النظام يعمل بشكل مثالي');
  } else if (percentage >= 75) {
    console.log('✅ جيد! النظام يعمل مع بعض المشاكل البسيطة');
  } else if (percentage >= 50) {
    console.log('⚠️ متوسط! النظام يحتاج إصلاحات');
  } else {
    console.log('❌ ضعيف! النظام يحتاج إصلاحات جذرية');
  }

  return results;
}

// تشغيل الفحص الشامل
comprehensiveSystemTest().then(results => {
  console.log('\n🎊 انتهى الفحص الشامل للنظام!');
});

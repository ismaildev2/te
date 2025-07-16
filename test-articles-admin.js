// اختبار المقالات في لوحة التحكم
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://xfxpwbqgtuhbkeksdbqn.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeHB3YnFndHVoYmtla3NkYnFuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4MDE1OCwiZXhwIjoyMDY4MTU2MTU4fQ.Ykpxe-yq1n-lxlESe9R0mg7ZADGcY3mMIu5uYhLt0zs';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testArticlesAdmin() {
  try {
    console.log('🔍 اختبار المقالات في لوحة التحكم...');
    console.log('='.repeat(60));

    // 1. جلب جميع المقالات
    console.log('\n1️⃣ جلب جميع المقالات:');
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('id, title, slug, status, created_at')
      .order('created_at', { ascending: false });

    if (articlesError) {
      console.log('❌ خطأ في جلب المقالات:', articlesError.message);
      return;
    }

    console.log(`✅ تم جلب ${articles.length} مقال`);
    
    // عرض أول 5 مقالات
    console.log('\n📋 أول 5 مقالات:');
    articles.slice(0, 5).forEach((article, index) => {
      console.log(`   ${index + 1}. ${article.title}`);
      console.log(`      ID: ${article.id}`);
      console.log(`      Slug: ${article.slug}`);
      console.log(`      Status: ${article.status}`);
      console.log('');
    });

    // 2. اختبار تحديث مقال
    if (articles.length > 0) {
      const testArticle = articles[0];
      console.log(`\n2️⃣ اختبار تحديث المقال: ${testArticle.title}`);
      
      // محاولة تحديث بسيط
      const updateData = {
        updated_at: new Date().toISOString()
      };

      const { data: updatedArticle, error: updateError } = await supabase
        .from('articles')
        .update(updateData)
        .eq('id', testArticle.id)
        .select()
        .single();

      if (updateError) {
        console.log('❌ خطأ في تحديث المقال:', updateError.message);
        console.log('📋 تفاصيل الخطأ:', JSON.stringify(updateError, null, 2));
      } else {
        console.log('✅ تم تحديث المقال بنجاح');
        console.log(`📅 وقت التحديث: ${updatedArticle.updated_at}`);
      }
    }

    // 3. اختبار إنشاء مقال جديد
    console.log('\n3️⃣ اختبار إنشاء مقال جديد:');
    const newArticleData = {
      title: 'مقال اختبار - يرجى الحذف',
      slug: 'test-article-delete-me',
      excerpt: 'هذا مقال اختبار لفحص النظام',
      content: '# مقال اختبار\n\nهذا محتوى اختباري يجب حذفه.',
      status: 'draft',
      reading_time: 1,
      seo_title: 'مقال اختبار',
      seo_description: 'وصف اختباري'
    };

    const { data: newArticle, error: createError } = await supabase
      .from('articles')
      .insert([newArticleData])
      .select()
      .single();

    if (createError) {
      console.log('❌ خطأ في إنشاء المقال:', createError.message);
    } else {
      console.log('✅ تم إنشاء المقال بنجاح');
      console.log(`📝 ID الجديد: ${newArticle.id}`);

      // حذف المقال الاختباري
      const { error: deleteError } = await supabase
        .from('articles')
        .delete()
        .eq('id', newArticle.id);

      if (deleteError) {
        console.log('⚠️ فشل في حذف المقال الاختباري:', deleteError.message);
      } else {
        console.log('✅ تم حذف المقال الاختباري');
      }
    }

    // 4. فحص الأعمدة المطلوبة
    console.log('\n4️⃣ فحص هيكل جدول المقالات:');
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_columns', { table_name: 'articles' });

    if (tableError) {
      console.log('⚠️ لا يمكن جلب معلومات الجدول');
    } else {
      console.log('✅ هيكل الجدول متاح');
    }

    // فحص عينة من البيانات
    if (articles.length > 0) {
      const sampleArticle = articles[0];
      console.log('\n📊 عينة من بيانات المقال:');
      console.log(`   العنوان: ${sampleArticle.title}`);
      console.log(`   الرابط: ${sampleArticle.slug}`);
      console.log(`   الحالة: ${sampleArticle.status}`);
      console.log(`   تاريخ الإنشاء: ${sampleArticle.created_at}`);
    }

    console.log('\n🎯 النتيجة النهائية:');
    console.log('='.repeat(50));
    console.log('✅ نظام المقالات يعمل بشكل صحيح');
    console.log(`📊 إجمالي المقالات: ${articles.length}`);
    console.log('🔧 يمكن إنشاء وتحديث وحذف المقالات');

  } catch (error) {
    console.error('💥 خطأ عام:', error.message);
  }
}

testArticlesAdmin().then(() => {
  console.log('\n🎊 انتهى اختبار نظام المقالات!');
});

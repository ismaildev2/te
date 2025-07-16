// صفحة تعديل المقال - نظام متقدم مع إدارة الصور
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import MarkdownEditor from '@/components/MarkdownEditor';
import MarkdownPreview from '@/components/MarkdownPreview';
import ImageManager from '@/components/ImageManager';
import { calculateReadingTime, getCurrentISOString } from '@/utils/dateUtils';
import Link from 'next/link';

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

function EditArticlePage({ params }: EditArticlePageProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [articleId, setArticleId] = useState<string>('');
  
  // بيانات المقال
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    category: '',
    tags: '',
    status: 'draft' as 'draft' | 'published',
    seo_title: '',
    seo_description: '',
    seo_keywords: ''
  });

  // صور المقال
  const [articleImages, setArticleImages] = useState<Array<{
    id: string;
    image_url: string;
    image_path: string;
    alt_text?: string;
    caption?: string;
    file_size?: number;
    mime_type?: string;
    width?: number;
    height?: number;
    display_order: number;
  }>>([]);

  // تحميل بيانات المقال
  useEffect(() => {
    const loadArticle = async () => {
      try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        setArticleId(id);

        console.log('Loading article with ID:', id);

        // تحميل بيانات المقال
        const { data: article, error: articleError } = await supabase
          .from('articles')
          .select('*')
          .eq('id', id)
          .single();

        if (articleError) {
          console.error('Error loading article:', articleError);
          toast.error('فشل في تحميل المقال');
          router.push('/admin/articles');
          return;
        }

        if (article) {
          console.log('Article loaded:', article);
          
          // تحويل المحتوى إذا كان بصيغة Editor.js
          let content = article.content || '';
          if (typeof content === 'object' && content.blocks) {
            // تحويل من Editor.js إلى Markdown
            content = convertEditorJSToMarkdown(content);
          }

          setFormData({
            title: article.title || '',
            slug: article.slug || '',
            excerpt: article.excerpt || '',
            content: content,
            featured_image: article.featured_image_url || '',
            category: article.category || '',
            tags: Array.isArray(article.tags) ? article.tags.join(', ') : (article.tags || ''),
            status: article.status || 'draft',
            seo_title: article.seo_title || '',
            seo_description: article.seo_description || '',
            seo_keywords: Array.isArray(article.seo_keywords) ? article.seo_keywords.join(', ') : (article.seo_keywords || '')
          });
        }

        // تحميل صور المقال
        const { data: images, error: imagesError } = await supabase
          .from('article_images')
          .select('*')
          .eq('article_id', id)
          .order('display_order', { ascending: true });

        if (imagesError) {
          console.error('Error loading images:', imagesError);
        } else {
          console.log('Images loaded:', images);
          setArticleImages(images || []);
        }

      } catch (error) {
        console.error('Error loading article:', error);
        toast.error('حدث خطأ أثناء تحميل المقال');
        router.push('/admin/articles');
      } finally {
        setIsLoading(false);
      }
    };

    loadArticle();
  }, [params, router]);

  // تحويل Editor.js إلى Markdown
  const convertEditorJSToMarkdown = (editorData: any): string => {
    if (!editorData.blocks || !Array.isArray(editorData.blocks)) {
      return '';
    }

    return editorData.blocks.map((block: any) => {
      switch (block.type) {
        case 'paragraph':
          return block.data.text || '';
        
        case 'header':
          const level = block.data.level || 1;
          const hashes = '#'.repeat(level);
          return `${hashes} ${block.data.text || ''}`;
        
        case 'list':
          if (block.data.style === 'ordered') {
            return block.data.items.map((item: string, index: number) => `${index + 1}. ${item}`).join('\n');
          } else {
            return block.data.items.map((item: string) => `- ${item}`).join('\n');
          }
        
        case 'quote':
          return `> ${block.data.text || ''}`;
        
        case 'code':
          return `\`\`\`\n${block.data.code || ''}\n\`\`\``;
        
        case 'image':
          const url = block.data.file?.url || block.data.url || '';
          const caption = block.data.caption || '';
          return caption ? `![${caption}](${url})` : `![صورة](${url})`;
        
        default:
          return block.data.text || '';
      }
    }).join('\n\n');
  };

  // دالة لإدراج صورة في المحرر
  const handleImageInsert = (imageUrl: string, caption?: string) => {
    const imageMarkdown = caption 
      ? `![${caption}](${imageUrl})\n*${caption}*\n\n`
      : `![صورة](${imageUrl})\n\n`;
    
    setFormData(prev => ({
      ...prev,
      content: prev.content + imageMarkdown
    }));
  };

  // دالة الحفظ
  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!formData.title.trim()) {
      toast.error('يرجى إدخال عنوان المقال');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('يرجى إدخال محتوى المقال');
      return;
    }

    setIsSubmitting(true);

    try {
      // التحقق من صحة البيانات
      const trimmedSlug = formData.slug.trim();
      if (!trimmedSlug) {
        toast.error('يرجى إدخال رابط (slug) صحيح');
        return;
      }

      // التحقق من صحة الـ slug (يجب أن يحتوي على أحرف وأرقام وشرطات فقط)
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(trimmedSlug)) {
        toast.error('الرابط يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط');
        return;
      }

      const readingTime = calculateReadingTime(formData.content);
      const tagsArray = formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];
      const seoKeywordsArray = formData.seo_keywords ? formData.seo_keywords.split(',').map(keyword => keyword.trim()).filter(keyword => keyword.length > 0) : [];

      const articleData = {
        title: formData.title.trim(),
        slug: trimmedSlug,
        excerpt: formData.excerpt.trim(),
        content: formData.content,
        featured_image_url: formData.featured_image || null,
        category: formData.category || null,
        tags: tagsArray.length > 0 ? tagsArray : null,
        status,
        reading_time: readingTime,
        seo_title: formData.seo_title?.trim() || formData.title.trim(),
        seo_description: formData.seo_description?.trim() || formData.excerpt.trim(),
        seo_keywords: seoKeywordsArray.length > 0 ? seoKeywordsArray : null,
        updated_at: getCurrentISOString()
      };

      // التحقق من فرادة الـ slug (إذا تم تغييره)
      const { data: existingArticle } = await supabase
        .from('articles')
        .select('slug')
        .eq('id', articleId)
        .single();

      if (existingArticle && existingArticle.slug !== trimmedSlug) {
        // تم تغيير الـ slug، نحتاج للتحقق من فرادته
        const { data: duplicateCheck } = await supabase
          .from('articles')
          .select('id')
          .eq('slug', trimmedSlug)
          .neq('id', articleId)
          .limit(1);

        if (duplicateCheck && duplicateCheck.length > 0) {
          toast.error('هذا الرابط مستخدم مسبقاً. يرجى اختيار رابط آخر');
          return;
        }
      }

      console.log('Updating article with data:', articleData);
      console.log('Article ID:', articleId);

      // التحقق من وجود المقال أولاً
      const { data: existingArticle, error: checkError } = await supabase
        .from('articles')
        .select('id, title')
        .eq('id', articleId)
        .single();

      if (checkError || !existingArticle) {
        console.error('Article not found:', checkError);
        toast.error('المقال غير موجود أو تم حذفه');
        router.push('/admin/articles');
        return;
      }

      console.log('Article exists, proceeding with update:', existingArticle);

      const { data, error } = await supabase
        .from('articles')
        .update(articleData)
        .eq('id', articleId)
        .select()
        .single();

      if (error) {
        console.error('Error updating article:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));

        // معالجة أخطاء محددة
        if (error.code === '23505') {
          toast.error('الـ slug مستخدم مسبقاً. يرجى تغيير الرابط');
        } else if (error.code === 'PGRST116') {
          toast.error('المقال غير موجود أو تم حذفه');
          router.push('/admin/articles');
          return;
        } else if (error.message?.includes('duplicate')) {
          toast.error('هناك مقال بنفس الرابط موجود مسبقاً');
        } else if (error.message?.includes('invalid')) {
          toast.error('البيانات المدخلة غير صحيحة');
        } else if (error.message?.includes('no rows')) {
          toast.error('المقال غير موجود');
          router.push('/admin/articles');
          return;
        } else {
          toast.error(`حدث خطأ في تحديث المقال: ${error.message || 'خطأ غير معروف'}`);
        }
        return;
      }

      console.log('Article updated successfully:', data);

      // تحديث صور المقال
      if (articleImages.length > 0) {
        // حذف الصور القديمة
        await supabase
          .from('article_images')
          .delete()
          .eq('article_id', articleId);

        // إضافة الصور الجديدة
        const imageRecords = articleImages.map(img => ({
          article_id: articleId,
          image_url: img.image_url,
          image_path: img.image_path,
          alt_text: img.alt_text,
          caption: img.caption,
          file_size: img.file_size,
          mime_type: img.mime_type,
          width: img.width,
          height: img.height,
          display_order: img.display_order
        }));

        const { error: imageError } = await supabase
          .from('article_images')
          .insert(imageRecords);

        if (imageError) {
          console.error('Error updating article images:', imageError);
          toast.error('تم تحديث المقال لكن حدث خطأ في حفظ الصور');
        }
      }

      toast.success('تم تحديث المقال بنجاح');
      router.push('/admin/articles');

    } catch (error) {
      console.error('Error updating article:', error);
      toast.error('حدث خطأ أثناء تحديث المقال');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-white text-xl">جاري تحميل المقال...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* رأس الصفحة */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">تعديل المقال</h1>
              <p className="text-dark-text-secondary mt-2">قم بتعديل المقال وحفظ التغييرات</p>
            </div>
            <Link
              href="/admin/articles"
              className="text-dark-text-secondary hover:text-white transition-colors"
            >
              ← العودة للمقالات
            </Link>
          </div>

          <div className="space-y-8">
            {/* معلومات أساسية */}
            <div className="bg-dark-card rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-6">المعلومات الأساسية</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-dark-text mb-2">
                    عنوان المقال *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-dark-background border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="أدخل عنوان المقال"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-text mb-2">
                    الرابط (Slug)
                  </label>
                  <div className="flex space-x-2 space-x-reverse">
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      className="flex-1 px-4 py-3 bg-dark-background border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="article-slug"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (formData.title) {
                          const baseSlug = formData.title
                            .toLowerCase()
                            .replace(/[^\w\s-]/g, '')
                            .replace(/\s+/g, '-')
                            .trim();
                          const timestamp = Date.now();
                          const uniqueSlug = `${baseSlug}-${timestamp}`;
                          setFormData(prev => ({ ...prev, slug: uniqueSlug }));
                          toast.success('تم توليد slug جديد');
                        } else {
                          toast.error('يرجى إدخال العنوان أولاً');
                        }
                      }}
                      className="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors whitespace-nowrap"
                    >
                      توليد جديد
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-dark-text mb-2">
                    ملخص المقال
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-dark-background border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="ملخص قصير عن المقال"
                  />
                </div>
              </div>
            </div>

            {/* إدارة الصور */}
            <div className="bg-dark-card rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-4">إدارة صور المقال</h2>
              <ImageManager
                articleId={articleId}
                images={articleImages}
                onImagesChange={setArticleImages}
                onImageInsert={handleImageInsert}
                maxImages={20}
              />
            </div>

            {/* محرر المحتوى */}
            <div className="bg-dark-card rounded-xl p-6 border border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">محتوى المقال</h2>
                <button
                  type="button"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  {previewMode ? 'تحرير' : 'معاينة'}
                </button>
              </div>

              {previewMode ? (
                <div className="min-h-[400px] p-4 bg-dark-background rounded-lg border border-gray-700">
                  <MarkdownPreview 
                    content={formData.content} 
                    articleImages={articleImages}
                  />
                </div>
              ) : (
                <MarkdownEditor
                  value={formData.content}
                  onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                  placeholder="اكتب محتوى المقال هنا باستخدام Markdown..."
                />
              )}
            </div>

            {/* أزرار الحفظ */}
            <div className="flex justify-end space-x-4 space-x-reverse">
              <button
                type="button"
                onClick={() => handleSubmit('draft')}
                disabled={isSubmitting}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'جاري الحفظ...' : 'حفظ كمسودة'}
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('published')}
                disabled={isSubmitting}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'جاري النشر...' : 'نشر المقال'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditArticlePage;

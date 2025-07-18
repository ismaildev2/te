'use client';

import { AITool } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { AIToolLink } from './AIToolLink';

// إنشاء structured data للمقارنة
const generateComparisonStructuredData = (tools: AITool[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "ComparisonTable",
    "name": `مقارنة أدوات الذكاء الاصطناعي - ${tools.map(t => t.name).join(' مقابل ')}`,
    "description": `مقارنة تفصيلية بين ${tools.map(t => t.name).join(' و ')} من حيث المميزات والتسعير والتقييمات`,
    "comparedItems": tools.map(tool => ({
      "@type": "SoftwareApplication",
      "name": tool.name,
      "description": tool.description,
      "applicationCategory": tool.category,
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": tool.rating,
        "bestRating": 5
      },
      "offers": {
        "@type": "Offer",
        "price": tool.pricing === 'free' ? '0' : 'varies',
        "priceCurrency": "USD"
      },
      "url": tool.website_url
    }))
  };
};

interface IndividualToolComparisonProps {
  currentTool: AITool;
  comparisonTools: AITool[];
  className?: string;
}

export function IndividualToolComparison({
  currentTool,
  comparisonTools,
  className = ''
}: IndividualToolComparisonProps) {
  const allTools = [currentTool, ...comparisonTools];

  // استخراج المميزات المشتركة للمقارنة
  const getFeatureComparison = () => {
    const features = [
      { key: 'pricing', label: 'التسعير', getValue: (tool: AITool) => tool.pricing },
      { key: 'rating', label: 'التقييم', getValue: (tool: AITool) => tool.rating },
      { key: 'category', label: 'الفئة', getValue: (tool: AITool) => tool.category },
      { key: 'website', label: 'الموقع الرسمي', getValue: (tool: AITool) => tool.website_url }
    ];

    return features;
  };

  // تحويل نوع التسعير إلى نص عربي
  const getPricingText = (pricing: string) => {
    switch (pricing) {
      case 'free': return 'مجاني';
      case 'paid': return 'مدفوع';
      case 'freemium': return 'مجاني مع خطط مدفوعة';
      default: return pricing;
    }
  };

  // الحصول على لون التسعير
  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case 'free': return 'text-green-400';
      case 'paid': return 'text-red-400';
      case 'freemium': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  if (comparisonTools.length === 0) {
    return null;
  }

  return (
    <div className={`bg-dark-card rounded-xl border border-gray-800 overflow-hidden ${className}`}>
        {/* رأس المقارنة */}
        <div className="p-6 border-b border-gray-800">
          <h3 className="text-2xl font-bold text-white mb-2">مقارنة الأدوات</h3>
          <p className="text-dark-text-secondary">
            مقارنة تفصيلية بين {currentTool.name} والأدوات المحددة
          </p>
        </div>

      {/* جدول المقارنة */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* رأس الجدول - أسماء الأدوات */}
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-right p-4 text-dark-text-secondary font-medium w-32">
                المعايير
              </th>
              {allTools.map((tool, index) => (
                <th key={tool.id} className="p-4 text-center min-w-48">
                  <div className="flex flex-col items-center">
                    {/* صورة الأداة */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden mb-3">
                      {tool.logo_url ? (
                        <Image
                          src={tool.logo_url}
                          alt={tool.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                          <span className="text-white font-bold text-xl">
                            {tool.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* اسم الأداة */}
                    <h4 className={`font-bold text-center ${
                      index === 0 ? 'text-primary' : 'text-white'
                    }`}>
                      {tool.name}
                    </h4>
                    {index === 0 && (
                      <span className="text-xs text-primary bg-primary/20 px-2 py-1 rounded-full mt-1">
                        الأداة الحالية
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* محتوى الجدول */}
          <tbody>
            {/* التقييم */}
            <tr className="border-b border-gray-800">
              <td className="p-4 text-dark-text-secondary font-medium">التقييم</td>
              {allTools.map((tool) => (
                <td key={`rating-${tool.id}`} className="p-4 text-center">
                  <div className="flex items-center justify-center">
                    <span className="text-yellow-400 mr-1">★</span>
                    <span className="text-white font-semibold">{tool.rating}</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* التسعير */}
            <tr className="border-b border-gray-800">
              <td className="p-4 text-dark-text-secondary font-medium">التسعير</td>
              {allTools.map((tool) => (
                <td key={`pricing-${tool.id}`} className="p-4 text-center">
                  <span className={`font-semibold ${getPricingColor(tool.pricing)}`}>
                    {getPricingText(tool.pricing)}
                  </span>
                </td>
              ))}
            </tr>

            {/* الفئة */}
            <tr className="border-b border-gray-800">
              <td className="p-4 text-dark-text-secondary font-medium">الفئة</td>
              {allTools.map((tool) => (
                <td key={`category-${tool.id}`} className="p-4 text-center">
                  <span className="text-white">{tool.category}</span>
                </td>
              ))}
            </tr>

            {/* الوصف */}
            <tr className="border-b border-gray-800">
              <td className="p-4 text-dark-text-secondary font-medium">الوصف</td>
              {allTools.map((tool) => (
                <td key={`description-${tool.id}`} className="p-4 text-center">
                  <p className="text-dark-text-secondary text-sm leading-relaxed max-w-xs mx-auto">
                    {(tool.description || '').length > 100
                      ? `${(tool.description || '').substring(0, 100)}...`
                      : (tool.description || 'لا يوجد وصف متاح')
                    }
                  </p>
                </td>
              ))}
            </tr>

            {/* المميزات الرئيسية */}
            <tr className="border-b border-gray-800">
              <td className="p-4 text-dark-text-secondary font-medium">المميزات</td>
              {allTools.map((tool) => (
                <td key={`features-${tool.id}`} className="p-4 text-center">
                  <div className="space-y-1">
                    {tool.features && tool.features.length > 0 ? (
                      tool.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="text-sm text-white bg-gray-700 rounded px-2 py-1">
                          {feature}
                        </div>
                      ))
                    ) : (
                      <span className="text-dark-text-secondary text-sm">غير محدد</span>
                    )}
                  </div>
                </td>
              ))}
            </tr>

            {/* أزرار العمل */}
            <tr>
              <td className="p-4 text-dark-text-secondary font-medium">الإجراءات</td>
              {allTools.map((tool, index) => (
                <td key={`actions-${tool.id}`} className="p-4 text-center">
                  <div className="space-y-2">
                    {index === 0 ? (
                      <div className="text-primary text-sm font-medium">
                        الصفحة الحالية
                      </div>
                    ) : (
                      <AIToolLink
                        href={`/ai-tools/${tool.slug}`}
                        className="block bg-primary hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-300 text-sm"
                      >
                        عرض التفاصيل
                      </AIToolLink>
                    )}
                    <Link
                      href={tool.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block border border-gray-600 hover:border-primary text-gray-300 hover:text-primary py-2 px-4 rounded-lg font-medium transition-colors duration-300 text-sm"
                    >
                      زيارة الموقع
                    </Link>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* ملاحظات المقارنة */}
      <div className="p-6 border-t border-gray-800 bg-dark-background/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* نصائح الاختيار */}
          <div>
            <h4 className="font-semibold text-white mb-3">💡 نصائح للاختيار</h4>
            <ul className="space-y-2 text-sm text-dark-text-secondary">
              <li>• قارن التسعير مع ميزانيتك المتاحة</li>
              <li>• تحقق من التقييمات وآراء المستخدمين</li>
              <li>• اختبر النسخة المجانية إن وجدت</li>
              <li>• تأكد من توافق الأداة مع احتياجاتك</li>
            </ul>
          </div>

          {/* روابط مفيدة */}
          <div>
            <h4 className="font-semibold text-white mb-3">🔗 روابط مفيدة</h4>
            <div className="space-y-2">
              <Link
                href="/ai-tools/compare"
                className="block text-primary hover:text-blue-400 transition-colors text-sm"
              >
                → مقارنة شاملة لجميع الأدوات
              </Link>
              <Link
                href="/ai-tools/categories"
                className="block text-primary hover:text-blue-400 transition-colors text-sm"
              >
                → تصفح الأدوات حسب الفئة
              </Link>
              <Link
                href="/ai-tools"
                className="block text-primary hover:text-blue-400 transition-colors text-sm"
              >
                → عرض جميع الأدوات
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

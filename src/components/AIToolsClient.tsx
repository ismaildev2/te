'use client';

import { useState, useCallback } from 'react';
import { AITool } from '@/types';
import { AIToolCard } from '@/components/AIToolCard';
import { AIToolsFilter } from '@/components/AIToolsFilter';

interface AIToolsClientProps {
  initialTools: AITool[];
  stats: {
    total: number;
    categories: number;
    avgRating: string | number;
    freeTools: number;
  };
}

export function AIToolsClient({ initialTools, stats }: AIToolsClientProps) {
  const [filteredTools, setFilteredTools] = useState<AITool[]>(initialTools);

  // تجميع الأدوات حسب الفئة
  const categories = filteredTools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, AITool[]>);

  const handleFilterChange = useCallback((tools: AITool[]) => {
    setFilteredTools(tools);
  }, []);

  return (
    <>
      {/* إحصائيات شاملة - محسنة للأجهزة المحمولة */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 md:mb-12">
        <div className="bg-dark-card rounded-lg md:rounded-xl p-3 sm:p-4 md:p-6 border border-gray-800 text-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
            <span className="text-white text-sm sm:text-lg md:text-xl font-bold">🤖</span>
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">{stats.total}</h3>
          <p className="text-dark-text-secondary text-xs sm:text-sm">أداة متاحة</p>
        </div>

        <div className="bg-dark-card rounded-lg md:rounded-xl p-3 sm:p-4 md:p-6 border border-gray-800 text-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
            <span className="text-white text-sm sm:text-lg md:text-xl font-bold">📂</span>
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">{stats.categories}</h3>
          <p className="text-dark-text-secondary text-xs sm:text-sm">فئة مختلفة</p>
        </div>

        <div className="bg-dark-card rounded-lg md:rounded-xl p-3 sm:p-4 md:p-6 border border-gray-800 text-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
            <span className="text-white text-sm sm:text-lg md:text-xl font-bold">⭐</span>
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">{stats.avgRating}</h3>
          <p className="text-dark-text-secondary text-xs sm:text-sm">متوسط التقييم</p>
        </div>

        <div className="bg-dark-card rounded-lg md:rounded-xl p-3 sm:p-4 md:p-6 border border-gray-800 text-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
            <span className="text-white text-sm sm:text-lg md:text-xl font-bold">🆓</span>
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">{stats.freeTools}</h3>
          <p className="text-dark-text-secondary text-xs sm:text-sm">أداة مجانية</p>
        </div>
      </div>

      {/* شريط البحث والفلاتر */}
      <AIToolsFilter tools={initialTools} onFilterChange={handleFilterChange} />

      {/* الأدوات المميزة */}
      {filteredTools.filter(tool => tool.featured).length > 0 && (
        <div className="mb-16">
          <div className="flex items-center mb-8">
            <h2 className="text-3xl font-bold text-white">الأدوات المميزة</h2>
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-sm font-bold mr-4">
              ⭐ مميز
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {filteredTools.filter(tool => tool.featured).map((tool) => (
              <AIToolCard key={tool.id} tool={tool} featured={true} />
            ))}
          </div>
        </div>
      )}

      {/* عرض النتائج */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {filteredTools.length === initialTools.length ? 'جميع الأدوات' : 'نتائج البحث'}
          </h2>
          <span className="bg-dark-card border border-gray-700 text-dark-text-secondary px-3 py-1 rounded-full text-sm">
            {filteredTools.length} أداة
          </span>
        </div>

        {filteredTools.length > 0 ? (
          <div>
            {/* عرض حسب الفئات إذا لم يكن هناك فلترة */}
            {Object.keys(categories).length > 1 && filteredTools.length === initialTools.length ? (
              Object.entries(categories).map(([category, categoryTools]) => (
                <div key={category} className="mb-16">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold text-white border-r-4 border-primary pr-4">
                      {category}
                    </h3>
                    <span className="bg-dark-card border border-gray-700 text-dark-text-secondary px-3 py-1 rounded-full text-sm">
                      {categoryTools.length} أداة
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                    {categoryTools.map((tool) => (
                      <AIToolCard key={tool.id} tool={tool} />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              // عرض عادي للنتائج المفلترة - محسن للأجهزة المحمولة
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                {filteredTools.map((tool) => (
                  <AIToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            )}
          </div>
        ) : (
          // رسالة عدم وجود نتائج
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-dark-card rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-16 h-16 text-dark-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">لا توجد نتائج</h3>
            <p className="text-dark-text-secondary text-lg mb-8">
              لم نجد أي أدوات تطابق معايير البحث الخاصة بك. جرب تعديل الفلاتر أو البحث بكلمات مختلفة.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300"
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        )}
      </div>
    </>
  );
}

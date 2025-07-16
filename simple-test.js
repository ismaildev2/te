// اختبار بسيط للاتصال
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://xfxpwbqgtuhbkeksdbqn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmeHB3YnFndHVoYmtla3NkYnFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAxNTgsImV4cCI6MjA2ODE1NjE1OH0.YQQcmfSpyEqJRO_83kzMeSrOsxt-SIJptVq0FZFPt-I'
);

async function simpleTest() {
  try {
    console.log('🔍 اختبار بسيط...');
    
    const { data, error } = await supabase
      .from('ai_tools')
      .select('name')
      .limit(1);

    if (error) {
      console.log('❌ خطأ:', error);
    } else {
      console.log('✅ نجح:', data);
    }
  } catch (e) {
    console.log('💥 استثناء:', e);
  }
}

simpleTest();

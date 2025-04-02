import { createClient } from '@supabase/supabase-js';

// 환경 변수 또는 하드코딩된 값 사용
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vkxkukmzahicgbgfuxcw.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZreGt1a216YWhpY2diZ2Z1eGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0ODkxNjMsImV4cCI6MjA1OTA2NTE2M30.2nsj7FkLKuxbdxSsvVDZlLcHYgsEUiZlqS_nPmh0n-Y';

// 디버그 정보 출력
console.log('[Supabase] 초기화:', {
  url: supabaseUrl,
  keyFirstChars: supabaseKey.substring(0, 10) + '...',
  timestamp: new Date().toISOString()
});

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Supabase API 응답 테스트 함수
export async function testSupabaseConnection() {
  try {
    console.log('[Supabase] 연결 테스트 시작...');
    const start = Date.now();
    
    // 간단한 쿼리로 연결 테스트
    const { data, error } = await supabase.from('users').select('id').limit(1);
    
    const end = Date.now();
    const responseTime = end - start;
    
    console.log('[Supabase] 연결 테스트 결과:', {
      success: !error,
      responseTimeMs: responseTime,
      error: error ? {
        message: error.message,
        code: error.code,
        details: error.details
      } : null,
      hasData: !!data,
      dataLength: data?.length
    });
    
    return { success: !error, responseTime, error, data };
  } catch (err) {
    console.error('[Supabase] 연결 테스트 예외 발생:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : '알 수 없는 오류',
      exception: true
    };
  }
}

// API 오류 발생 시에도 실제 오류 반환하는 함수 (모킹 데이터 사용 안 함)
export async function safeSupabaseQuery<T>(
  query: () => Promise<any>,
  mockData: T
): Promise<{ data: T | null; error: any; debug?: any }> {
  try {
    const queryId = Math.random().toString(36).substring(2, 8);
    console.log(`[Supabase:${queryId}] 쿼리 시작:`, new Date().toISOString());
    
    const start = Date.now();
    const result = await query();
    const end = Date.now();
    
    const debugInfo = {
      queryId,
      executionTimeMs: end - start,
      timestamp: new Date().toISOString(),
      hasError: !!result.error,
      errorDetails: result.error ? {
        message: result.error.message,
        code: result.error.code,
        details: result.error.details
      } : null,
      resultDetails: !result.error ? {
        hasData: !!result.data,
        dataType: result.data ? (Array.isArray(result.data) ? 'array' : typeof result.data) : null,
        dataLength: Array.isArray(result.data) ? result.data.length : null
      } : null
    };
    
    console.log(`[Supabase:${queryId}] 쿼리 결과:`, JSON.stringify(debugInfo));
    
    if (result.error) {
      console.warn(`[Supabase:${queryId}] 쿼리 오류:`, result.error);
      return { 
        data: null, 
        error: result.error,
        debug: {
          ...debugInfo,
          usedMockData: false,
          reason: "API 오류"
        }
      };
    }
    
    // 실제 데이터에 내용이 없는 경우에도 빈 배열 반환 (모킹 데이터 사용 안 함)
    if (!result.data || (Array.isArray(result.data) && result.data.length === 0)) {
      console.warn(`[Supabase:${queryId}] 쿼리 결과가 비어있습니다.`);
      return { 
        data: Array.isArray(result.data) ? [] as unknown as T : null, 
        error: null,
        debug: {
          ...debugInfo,
          usedMockData: false,
          reason: "빈 결과"
        }
      };
    }
    
    return { 
      data: result.data, 
      error: null,
      debug: {
        ...debugInfo,
        usedMockData: false
      }
    };
  } catch (err) {
    const queryId = Math.random().toString(36).substring(2, 8);
    console.error(`[Supabase:${queryId}] 연결 오류:`, err);
    
    return { 
      data: null, 
      error: {
        message: err instanceof Error ? err.message : String(err),
        name: err instanceof Error ? err.name : 'UnknownError',
        stack: err instanceof Error ? err.stack : undefined
      },
      debug: {
        queryId,
        timestamp: new Date().toISOString(),
        usedMockData: false,
        reason: "연결 예외",
        errorMessage: err instanceof Error ? err.message : String(err),
        errorName: err instanceof Error ? err.name : 'UnknownError',
        errorStack: err instanceof Error ? err.stack : undefined
      }
    };
  }
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          nickname?: string;
          full_name: string;
          first_name?: string;
          last_name?: string;
          created_at: string;
          role: string;
          marketing_consent?: boolean;
          password_reset_required?: boolean;
        };
        Insert: {
          id?: string;
          email: string;
          username: string;
          nickname?: string;
          full_name?: string;
          first_name?: string;
          last_name?: string;
          created_at?: string;
          role?: string;
          marketing_consent?: boolean;
          password_reset_required?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          nickname?: string;
          full_name?: string;
          first_name?: string;
          last_name?: string;
          created_at?: string;
          role?: string;
          marketing_consent?: boolean;
          password_reset_required?: boolean;
        };
      };
      inventory: {
        Row: {
          id: string;
          name: string;
          description: string;
          quantity: number;
          unit_price: number;
          category: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          quantity: number;
          unit_price: number;
          category?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          quantity?: number;
          unit_price?: number;
          category?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}; 
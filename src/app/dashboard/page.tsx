'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase, testSupabaseConnection } from "@/lib/supabase";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totalProducts: number;
    lowStockProducts: number;
    pendingOrders: number;
    completedOrders: number;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    console.log('대시보드 페이지 마운트됨');
    
    try {
      // localStorage에서 사용자 정보 가져오기
      if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('user');
        const isAuthenticated = localStorage.getItem('is_authenticated');
        
        console.log('대시보드 페이지 - 로컬 스토리지 확인:', {
          isAuthenticated,
          userStr: userStr ? userStr.substring(0, 50) + '...' : null
        });
        
        if (isAuthenticated === 'true' && userStr) {
          const userData = JSON.parse(userStr);
          setUser(userData);
          console.log('대시보드 페이지 - 사용자 정보 로드됨:', userData);
        } else {
          console.log('대시보드 페이지 - 로그인 정보가 없음');
          setError('로그인 정보가 없습니다. 로그인 페이지로 이동합니다.');
        }
      }
    } catch (error) {
      console.error('대시보드 페이지 - 오류 발생:', error);
      setError('오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (!data.session) {
          router.push("/login");
          return;
        }
        
        setUser(data.session.user);
        
        // Supabase 연결 테스트
        const connectionTest = await testSupabaseConnection();
        
        if (!connectionTest.success) {
          setError(`Supabase 연결 실패: ${connectionTest.error || '알 수 없는 오류'}`);
          setLoading(false);
          return;
        }
        
        // 연결 성공 시에만 대시보드 데이터 로드
        await fetchDashboardData();
      } catch (err) {
        console.error('인증 또는 연결 체크 오류:', err);
        setError(`서버 연결 오류: ${err instanceof Error ? err.message : String(err)}`);
        setLoading(false);
      }
    }
    
    checkAuth();
  }, [router]);

  async function fetchDashboardData() {
    setLoading(true);
    
    try {
      // 실제 API 데이터 로드 시도
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select('*');
      
      if (inventoryError) {
        throw new Error(`자재 데이터 로드 실패: ${inventoryError.message}`);
      }
      
      // 실제 데이터를 기반으로 대시보드 통계 계산
      setStats({
        totalProducts: inventoryData?.length || 0,
        lowStockProducts: inventoryData?.filter(item => item.quantity < 30)?.length || 0,
        pendingOrders: 0, // 아직 주문 데이터가 없음
        completedOrders: 0, // 아직 주문 데이터가 없음
      });
    } catch (err) {
      console.error('대시보드 데이터 로드 오류:', err);
      setError(`데이터 로드 실패: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-lg">
          <p className="font-bold">오류가 발생했습니다</p>
          <p className="mt-2">{error}</p>
          <div className="flex justify-between mt-4">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              새로고침
            </button>
            <button 
              onClick={() => window.location.href = '/login'} 
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              로그인 페이지로 이동
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-3xl font-bold leading-tight text-gray-900">대시보드</h1>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          ERP 시스템에 오신 것을 환영합니다. 이 대시보드에서 모든 업무를 관리할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* 자재 관리 카드 */}
        <Link href="/dashboard/inventory">
          <div className="p-6 bg-white rounded-lg shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">자재 관리</h2>
              <span className="text-2xl">📦</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">재고 현황 및 자재 관리를 확인하세요</p>
          </div>
        </Link>

        {/* 구매 요청 카드 */}
        <Link href="/dashboard/purchase">
          <div className="p-6 bg-white rounded-lg shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">구매 요청</h2>
              <span className="text-2xl">🛒</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">구매 요청 현황 및 신규 요청을 관리하세요</p>
          </div>
        </Link>

        {/* 생산 계획 카드 */}
        <Link href="/dashboard/production">
          <div className="p-6 bg-white rounded-lg shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">생산 계획</h2>
              <span className="text-2xl">🏭</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">생산 계획 및 진행 상황을 확인하세요</p>
          </div>
        </Link>

        {/* 배송 계획 카드 */}
        <Link href="/dashboard/shipping">
          <div className="p-6 bg-white rounded-lg shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">배송 계획</h2>
              <span className="text-2xl">🚚</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">배송 계획 및 진행 상황을 확인하세요</p>
          </div>
        </Link>

        {/* 사용자 관리 카드 */}
        <Link href="/dashboard/users">
          <div className="p-6 bg-white rounded-lg shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">사용자 관리</h2>
              <span className="text-2xl">👥</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">시스템 사용자 관리 및 권한을 설정하세요</p>
          </div>
        </Link>

        {/* 설정 카드 */}
        <Link href="/dashboard/settings">
          <div className="p-6 bg-white rounded-lg shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">설정</h2>
              <span className="text-2xl">⚙️</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">시스템 설정 및 환경 설정을 관리하세요</p>
          </div>
        </Link>
      </div>
    </div>
  );
} 
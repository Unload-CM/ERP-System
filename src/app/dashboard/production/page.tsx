'use client';

import { useState, useEffect } from 'react';
import { supabase, safeSupabaseQuery } from '@/lib/supabase';
import Link from 'next/link';

// 모킹 데이터 - API 연결 실패 시 사용
const MOCK_PRODUCTION_PLANS = [
  {
    id: '1',
    title: '알루미늄 프레임 조립 생산',
    description: '신규 프로젝트를 위한 알루미늄 프레임 300개 조립',
    start_date: '2023-11-10',
    end_date: '2023-11-20',
    status: 'planned',
    created_by: '00000000-0000-0000-0000-000000000001',
    created_at: '2023-11-01T08:30:00Z',
    updated_at: '2023-11-01T08:30:00Z',
    user_full_name: '관리자',
    materials_count: 5
  },
  {
    id: '2',
    title: '회로기판 PCB 생산',
    description: '10x15cm 전자회로 PCB 500개 생산',
    start_date: '2023-11-05',
    end_date: '2023-11-25',
    status: 'in_progress',
    created_by: '00000000-0000-0000-0000-000000000001',
    created_at: '2023-10-20T14:20:00Z',
    updated_at: '2023-11-05T09:15:00Z',
    user_full_name: '관리자',
    materials_count: 8
  },
  {
    id: '3',
    title: '유압 실린더 조립',
    description: '하이드로릭 시스템용 실린더 50개 조립',
    start_date: '2023-10-15',
    end_date: '2023-10-30',
    status: 'completed',
    created_by: '00000000-0000-0000-0000-000000000001',
    created_at: '2023-10-10T11:45:00Z',
    updated_at: '2023-10-30T13:30:00Z',
    user_full_name: '관리자',
    materials_count: 6
  },
  {
    id: '4',
    title: '광섬유 케이블 제작',
    description: '신규 통신 장비용 광섬유 케이블 200m 제작',
    start_date: '2023-12-01',
    end_date: '2023-12-15',
    status: 'planned',
    created_by: '00000000-0000-0000-0000-000000000001',
    created_at: '2023-11-02T09:30:00Z',
    updated_at: '2023-11-02T09:30:00Z',
    user_full_name: '관리자',
    materials_count: 3
  }
];

type ProductionPlan = {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  user_full_name: string;
  materials_count: number;
};

export default function ProductionPage() {
  const [productionPlans, setProductionPlans] = useState<ProductionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProductionPlans() {
      setLoading(true);
      
      try {
        // Supabase API 사용 시도 (오류 발생 시 모킹 데이터 사용)
        const { data, error } = await safeSupabaseQuery(
          async () => {
            // 생산 계획 가져오기
            const { data: productionData, error: productionError } = await supabase
              .from('production_plan')
              .select(`
                *,
                users:created_by(full_name)
              `)
              .order('start_date', { ascending: false });
            
            if (productionError) throw productionError;
            
            // 자재 수 가져오기 및 데이터 가공
            const enrichedData = await Promise.all(
              (productionData || []).map(async (plan) => {
                const { count, error: countError } = await supabase
                  .from('production_plan_materials')
                  .select('*', { count: 'exact', head: true })
                  .eq('production_plan_id', plan.id);
                
                if (countError) throw countError;
                
                return {
                  ...plan,
                  user_full_name: plan.users?.full_name || '알 수 없음',
                  materials_count: count || 0
                };
              })
            );
            
            return { data: enrichedData, error: null };
          },
          MOCK_PRODUCTION_PLANS
        );
        
        if (error) {
          setError('생산 계획 목록을 불러오는 데 실패했습니다.');
        } else if (data) {
          setProductionPlans(data);
        }
      } catch (err) {
        console.error('생산 계획 데이터 불러오기 오류:', err);
        setError('데이터 로딩 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchProductionPlans();
  }, []);

  // 날짜 형식 변환 함수
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 상태에 따른 배지 스타일
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 상태 텍스트
  const getStatusText = (status: string) => {
    switch (status) {
      case 'planned':
        return '계획됨';
      case 'in_progress':
        return '진행중';
      case 'completed':
        return '완료됨';
      case 'cancelled':
        return '취소됨';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
        <p className="font-bold">오류</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">생산 계획</h1>
        <button
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
        >
          새 생산 계획
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {productionPlans.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            등록된 생산 계획이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    생산명
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    기간
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    생성자
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    자재 항목
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productionPlans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{plan.title}</div>
                          <div className="text-sm text-gray-500">{plan.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(plan.status)}`}>
                        {getStatusText(plan.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(plan.start_date)} ~ {formatDate(plan.end_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {plan.user_full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {plan.materials_count}개
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 mr-3">
                        상세
                      </button>
                      {plan.status !== 'completed' && (
                        <button className="text-primary-600 hover:text-primary-900">
                          {plan.status === 'planned' ? '시작' : (plan.status === 'in_progress' ? '완료' : '관리')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 
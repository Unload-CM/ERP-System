'use client';

import { useState, useEffect } from 'react';
import { supabase, safeSupabaseQuery } from '@/lib/supabase';
import Link from 'next/link';

// 모킹 데이터 - API 연결 실패 시 사용
const MOCK_SHIPPING_PLANS = [
  {
    id: '1',
    title: '전자부품 세트 배송',
    description: '전자부품 PCB 300개 배송',
    shipping_date: '2023-11-15',
    destination: '서울시 강남구 역삼동',
    status: 'planned',
    created_by: '00000000-0000-0000-0000-000000000001',
    created_at: '2023-11-01T08:30:00Z',
    updated_at: '2023-11-01T08:30:00Z',
    user_full_name: '관리자',
    items_count: 2
  },
  {
    id: '2',
    title: '알루미늄 프레임 배송',
    description: '신규 고객사에 알루미늄 프레임 150개 배송',
    shipping_date: '2023-11-10',
    destination: '인천시 남동구 남동공단',
    status: 'in_transit',
    created_by: '00000000-0000-0000-0000-000000000001',
    created_at: '2023-10-25T14:20:00Z',
    updated_at: '2023-11-10T09:15:00Z',
    user_full_name: '관리자',
    items_count: 1
  },
  {
    id: '3',
    title: '광섬유 케이블 배송',
    description: '광섬유 케이블 100m 배송',
    shipping_date: '2023-10-20',
    destination: '경기도 화성시 동탄',
    status: 'delivered',
    created_by: '00000000-0000-0000-0000-000000000001',
    created_at: '2023-10-15T11:45:00Z',
    updated_at: '2023-10-20T13:30:00Z',
    user_full_name: '관리자',
    items_count: 3
  },
  {
    id: '4',
    title: '철제 부품 긴급 배송',
    description: '긴급 요청에 따른 철제 부품 배송',
    shipping_date: '2023-11-05',
    destination: '부산광역시 해운대구',
    status: 'delayed',
    created_by: '00000000-0000-0000-0000-000000000001',
    created_at: '2023-11-01T09:30:00Z',
    updated_at: '2023-11-05T10:45:00Z',
    user_full_name: '관리자',
    items_count: 5
  }
];

type ShippingPlan = {
  id: string;
  title: string;
  description: string;
  shipping_date: string;
  destination: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  user_full_name: string;
  items_count: number;
};

export default function ShippingPage() {
  const [shippingPlans, setShippingPlans] = useState<ShippingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchShippingPlans() {
      setLoading(true);
      
      try {
        // Supabase API 사용 시도 (오류 발생 시 모킹 데이터 사용)
        const { data, error } = await safeSupabaseQuery(
          async () => {
            // 배송 계획 가져오기
            const { data: shippingData, error: shippingError } = await supabase
              .from('shipping_plan')
              .select(`
                *,
                users:created_by(full_name)
              `)
              .order('shipping_date', { ascending: false });
            
            if (shippingError) throw shippingError;
            
            // 배송 항목 수 가져오기 및 데이터 가공
            const enrichedData = await Promise.all(
              (shippingData || []).map(async (plan) => {
                const { count, error: countError } = await supabase
                  .from('shipping_plan_items')
                  .select('*', { count: 'exact', head: true })
                  .eq('shipping_plan_id', plan.id);
                
                if (countError) throw countError;
                
                return {
                  ...plan,
                  user_full_name: plan.users?.full_name || '알 수 없음',
                  items_count: count || 0
                };
              })
            );
            
            return { data: enrichedData, error: null };
          },
          MOCK_SHIPPING_PLANS
        );
        
        if (error) {
          setError('배송 계획 목록을 불러오는 데 실패했습니다.');
        } else if (data) {
          setShippingPlans(data);
        }
      } catch (err) {
        console.error('배송 계획 데이터 불러오기 오류:', err);
        setError('데이터 로딩 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchShippingPlans();
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
      case 'in_transit':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'delayed':
        return 'bg-yellow-100 text-yellow-800';
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
      case 'in_transit':
        return '배송중';
      case 'delivered':
        return '배송완료';
      case 'delayed':
        return '지연';
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
        <h1 className="text-2xl font-bold">배송 계획</h1>
        <button
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
        >
          새 배송 계획
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {shippingPlans.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            등록된 배송 계획이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    배송명
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    배송 날짜
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    배송지
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    담당자
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    항목 수
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shippingPlans.map((plan) => (
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
                      {formatDate(plan.shipping_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {plan.destination}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {plan.user_full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {plan.items_count}개
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 mr-3">
                        상세
                      </button>
                      {plan.status !== 'delivered' && plan.status !== 'cancelled' && (
                        <button className="text-primary-600 hover:text-primary-900">
                          {plan.status === 'planned' ? '출발' : (plan.status === 'in_transit' ? '완료' : '관리')}
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
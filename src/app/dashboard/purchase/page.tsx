'use client';

import { useState, useEffect } from 'react';
import { supabase, safeSupabaseQuery } from '@/lib/supabase';
import Link from 'next/link';

// 모킹 데이터 - API 연결 실패 시 사용
const MOCK_PURCHASE_REQUESTS = [
  {
    id: '1',
    title: '알루미늄 프레임 200개 구매 요청',
    description: '생산라인 확장을 위한 알루미늄 프레임 추가 구매',
    status: 'pending',
    created_at: '2023-11-05T08:30:00Z',
    updated_at: '2023-11-05T08:30:00Z',
    user_id: '00000000-0000-0000-0000-000000000001',
    users: {
      email: 'admin@example.com',
      full_name: '관리자'
    }
  },
  {
    id: '2',
    title: '전자부품 대량 구매 요청',
    description: '신규 프로젝트를 위한 전자부품 일괄 구매',
    status: 'approved',
    created_at: '2023-10-28T14:20:00Z',
    updated_at: '2023-10-29T09:15:00Z',
    user_id: '00000000-0000-0000-0000-000000000001',
    users: {
      email: 'admin@example.com',
      full_name: '관리자'
    }
  },
  {
    id: '3',
    title: '유압장치 부품 구매 요청',
    description: '유압 시스템 유지보수를 위한 부품 구매',
    status: 'rejected',
    created_at: '2023-10-20T11:45:00Z',
    updated_at: '2023-10-25T13:30:00Z',
    user_id: '00000000-0000-0000-0000-000000000001',
    users: {
      email: 'admin@example.com',
      full_name: '관리자'
    }
  },
  {
    id: '4',
    title: '철제 부품 구매 요청',
    description: '생산라인 B의 기계 수리를 위한 철제 부품 구매',
    status: 'completed',
    created_at: '2023-09-15T09:30:00Z',
    updated_at: '2023-09-20T10:45:00Z',
    user_id: '00000000-0000-0000-0000-000000000001',
    users: {
      email: 'admin@example.com',
      full_name: '관리자'
    }
  }
];

type PurchaseRequest = {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  users: any;
};

export default function PurchasePage() {
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPurchaseRequests() {
      setLoading(true);
      
      try {
        // Supabase API 사용 시도 (오류 발생 시 모킹 데이터 사용)
        const { data, error } = await safeSupabaseQuery(
          async () => {
            return await supabase
              .from('purchase_request')
              .select(`
                *,
                users:user_id(email, full_name)
              `)
              .order('created_at', { ascending: false });
          },
          MOCK_PURCHASE_REQUESTS
        );
        
        if (error) {
          setError('구매 요청 목록을 불러오는 데 실패했습니다.');
        } else if (data) {
          setPurchaseRequests(data);
        }
      } catch (err) {
        console.error('구매 요청 데이터 불러오기 오류:', err);
        setError('데이터 로딩 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchPurchaseRequests();
  }, []);

  // 날짜 형식 변환 함수
  const formatDate = (dateString: string) => {
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
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 상태 텍스트
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '대기중';
      case 'approved':
        return '승인됨';
      case 'rejected':
        return '거부됨';
      case 'completed':
        return '완료됨';
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
        <h1 className="text-2xl font-bold">구매 요청</h1>
        <button
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
        >
          새 구매 요청
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {purchaseRequests.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            등록된 구매 요청이 없습니다.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {purchaseRequests.map((request) => (
              <li key={request.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{request.description}</p>
                    <div className="mt-2 flex items-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        신청자: {request.users.full_name || request.users.email}
                      </span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-sm text-gray-500">
                        신청일: {formatDate(request.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-primary-600 hover:text-primary-900 text-sm font-medium">
                      상세 보기
                    </button>
                    {request.status === 'pending' && (
                      <>
                        <span className="text-gray-300">|</span>
                        <button className="text-green-600 hover:text-green-900 text-sm font-medium">
                          승인
                        </button>
                        <span className="text-gray-300">|</span>
                        <button className="text-red-600 hover:text-red-900 text-sm font-medium">
                          거부
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 
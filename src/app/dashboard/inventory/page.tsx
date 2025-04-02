'use client';

import { useState, useEffect } from 'react';
import { supabase, safeSupabaseQuery, testSupabaseConnection } from '@/lib/supabase';
import Link from 'next/link';
import AddItemModal from '@/components/modals/AddItemModal';

// 모킹 데이터 - API 연결 실패 시 사용
const MOCK_INVENTORY_DATA = [
  {
    id: '1',
    name: '알루미늄 프레임',
    description: '표준 알루미늄 프레임, 1000x500mm',
    quantity: 250,
    unit_price: 75000,
    category: '프레임',
    created_at: '2023-09-15T10:30:00Z',
    updated_at: '2023-10-25T14:45:00Z'
  },
  {
    id: '2',
    name: '스틸 볼트 세트',
    description: '고강도 스틸 볼트 10개 세트, M8',
    quantity: 1500,
    unit_price: 12000,
    category: '고정장치',
    created_at: '2023-08-20T09:15:00Z',
    updated_at: '2023-10-20T11:30:00Z'
  },
  {
    id: '3',
    name: '전자회로 PCB',
    description: '기본 전자회로 PCB, 10x15cm',
    quantity: 800,
    unit_price: 35000,
    category: '전자부품',
    created_at: '2023-09-05T13:45:00Z',
    updated_at: '2023-10-18T16:20:00Z'
  },
  {
    id: '4',
    name: '하이드로릭 실린더',
    description: '산업용 하이드로릭 실린더, 25cm',
    quantity: 120,
    unit_price: 450000,
    category: '유압장치',
    created_at: '2023-07-12T08:00:00Z',
    updated_at: '2023-10-10T09:15:00Z'
  },
  {
    id: '5',
    name: '광섬유 케이블',
    description: '고속 데이터 전송용 광섬유 케이블, 100m',
    quantity: 300,
    unit_price: 85000,
    category: '전선/케이블',
    created_at: '2023-09-25T11:20:00Z',
    updated_at: '2023-10-15T13:30:00Z'
  }
];

// 자재 항목 타입 정의
type InventoryItem = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
  category: string;
  created_at: string;
  updated_at: string;
};

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddItem = () => {
    setIsModalOpen(true);
  };
  
  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  
  const handleModalSuccess = () => {
    // 자재 목록 다시 불러오기
    fetchInventory();
  };

  const fetchInventory = async () => {
    setLoading(true);
    
    try {
      // 먼저 Supabase 연결 테스트
      const connectionTest = await testSupabaseConnection();
      
      if (!connectionTest.success) {
        setError('Supabase 연결에 실패했습니다. API 키를 확인하세요: ' + 
          (connectionTest.error ? JSON.stringify(connectionTest.error) : '알 수 없는 오류'));
        setLoading(false);
        return;
      }
      
      // 직접 API 호출을 시도해서 응답을 확인
      const directResponse = await supabase.from('inventory').select('*');
      
      if (directResponse.error) {
        setError('자재 목록을 불러오는 데 실패했습니다: ' + directResponse.error.message);
        setLoading(false);
        return;
      }
      
      if (!directResponse.data || directResponse.data.length === 0) {
        setError('자재 목록이 비어 있습니다.');
        setInventory([]);
        setLoading(false);
        return;
      }
      
      setInventory(directResponse.data);
      
      // 카테고리 목록 추출
      const uniqueCategories = Array.from(new Set(directResponse.data.map((item: InventoryItem) => item.category)));
      setCategories(uniqueCategories as string[]);
    } catch (err) {
      console.error('자재 데이터 불러오기 오류:', err);
      setError('데이터 로딩 중 오류가 발생했습니다: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
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

  // 금액 형식 변환 함수
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  // 검색 및 필터링된 재고 항목
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = selectedCategory === null || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        <p className="ml-3 text-gray-500">데이터 로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">자재 관리</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">오류</p>
          <p>{error}</p>
        </div>
      )}
      
      <div className="space-y-6">
        <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold leading-tight text-gray-900">자재 관리</h1>
          <div className="mt-3 sm:mt-0 sm:ml-4">
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              자재 추가
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between">
            {/* 검색 입력 필드 */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="자재명 또는 설명 검색..."
                className="w-full p-2 border border-gray-300 rounded-md pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute left-3 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
            </div>

            {/* 카테고리 필터 드롭다운 */}
            <div className="flex-shrink-0 w-full md:w-auto">
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedCategory ?? ''}
                onChange={(e) => setSelectedCategory(e.target.value === '' ? null : e.target.value)}
              >
                <option value="">모든 카테고리</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 자재 목록 테이블 */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    자재명
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    카테고리
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    재고 수량
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    단가
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    최근 업데이트
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">{item.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity} 개
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(item.updated_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/dashboard/inventory/${item.id}`} className="text-primary-600 hover:text-primary-900 mr-3">
                          상세보기
                        </Link>
                        <Link href={`/dashboard/inventory/${item.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                          편집
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {searchTerm || selectedCategory ? '검색 조건에 맞는 자재가 없습니다.' : '등록된 자재가 없습니다.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* 모달 컴포넌트 */}
      <AddItemModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        onSuccess={handleModalSuccess}
        type="inventory"
        categories={categories}
      />
    </div>
  );
} 
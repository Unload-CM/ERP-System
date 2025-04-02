'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

type AddItemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type: 'inventory' | 'purchase' | 'production' | 'shipping' | 'user';
  categories: string[];
};

export default function AddItemModal({ isOpen, onClose, onSuccess, type, categories }: AddItemModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: 0,
    unit_price: 0,
    category: '',
    email: '',
    username: '',
    role: 'user',
    full_name: '',
    status: '대기중',
    priority: '보통',
    expected_date: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'unit_price' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      let data, error;
      
      switch (type) {
        case 'inventory':
          ({ data, error } = await supabase.from('inventory').insert([{
            name: formData.name,
            description: formData.description,
            quantity: formData.quantity,
            unit_price: formData.unit_price,
            category: formData.category,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]));
          break;
          
        case 'purchase':
          ({ data, error } = await supabase.from('purchase_requests').insert([{
            name: formData.name,
            description: formData.description,
            quantity: formData.quantity,
            unit_price: formData.unit_price,
            category: formData.category,
            status: formData.status,
            priority: formData.priority,
            expected_date: formData.expected_date,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]));
          break;
          
        case 'production':
          ({ data, error } = await supabase.from('production_plans').insert([{
            name: formData.name,
            description: formData.description,
            quantity: formData.quantity,
            status: formData.status,
            priority: formData.priority,
            expected_date: formData.expected_date,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]));
          break;
          
        case 'shipping':
          ({ data, error } = await supabase.from('shipping_plans').insert([{
            name: formData.name,
            description: formData.description,
            quantity: formData.quantity,
            status: formData.status,
            priority: formData.priority,
            expected_date: formData.expected_date,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]));
          break;
          
        case 'user':
          // 사용자 추가는 Supabase Auth와 함께 사용해야 합니다
          // 여기서는 간단한 예시만 보여줍니다
          ({ data, error } = await supabase.from('users').insert([{
            email: formData.email,
            username: formData.username,
            full_name: formData.full_name,
            role: formData.role,
            created_at: new Date().toISOString()
          }]));
          break;
      }
      
      if (error) throw error;
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('항목 추가 오류:', err);
      setError(err.message || '항목을 추가하는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  const getTitle = () => {
    switch (type) {
      case 'inventory': return '자재 추가';
      case 'purchase': return '구매 요청 추가';
      case 'production': return '생산 계획 추가';
      case 'shipping': return '배송 계획 추가';
      case 'user': return '사용자 추가';
      default: return '항목 추가';
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{getTitle()}</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* 자재, 구매, 생산, 배송 공통 필드 */}
            {['inventory', 'purchase', 'production', 'shipping'].includes(type) && (
              <>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    이름
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="항목 이름을 입력하세요"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    설명
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="설명을 입력하세요"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    수량
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    required
                    min="0"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </>
            )}
            
            {/* 자재, 구매 전용 필드 */}
            {['inventory', 'purchase'].includes(type) && (
              <>
                <div className="mb-4">
                  <label htmlFor="unit_price" className="block text-sm font-medium text-gray-700 mb-1">
                    단가
                  </label>
                  <input
                    type="number"
                    id="unit_price"
                    name="unit_price"
                    required
                    min="0"
                    value={formData.unit_price}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    카테고리
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">카테고리 선택</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            
            {/* 구매, 생산, 배송 전용 필드 */}
            {['purchase', 'production', 'shipping'].includes(type) && (
              <>
                <div className="mb-4">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    상태
                  </label>
                  <select
                    id="status"
                    name="status"
                    required
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="대기중">대기중</option>
                    <option value="진행중">진행중</option>
                    <option value="완료">완료</option>
                    <option value="취소됨">취소됨</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                    우선순위
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    required
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="낮음">낮음</option>
                    <option value="보통">보통</option>
                    <option value="높음">높음</option>
                    <option value="긴급">긴급</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="expected_date" className="block text-sm font-medium text-gray-700 mb-1">
                    예상 일자
                  </label>
                  <input
                    type="date"
                    id="expected_date"
                    name="expected_date"
                    required
                    value={formData.expected_date}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </>
            )}
            
            {/* 사용자 전용 필드 */}
            {type === 'user' && (
              <>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    이메일
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    사용자명
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                    이름
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    required
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    역할
                  </label>
                  <select
                    id="role"
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="user">일반 사용자</option>
                    <option value="admin">관리자</option>
                    <option value="manager">매니저</option>
                  </select>
                </div>
              </>
            )}
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="bg-white border border-gray-300 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`bg-primary-600 px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-primary-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? '저장 중...' : '저장'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
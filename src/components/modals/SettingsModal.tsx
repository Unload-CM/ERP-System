'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

type SettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type: 'siteInfo' | 'category' | 'employee' | 'priority' | 'status';
};

export default function SettingsModal({ isOpen, onClose, onSuccess, type }: SettingsModalProps) {
  const [formData, setFormData] = useState({
    // 사이트 정보
    company_name: '',
    company_address: '',
    company_phone: '',
    company_email: '',
    tax_id: '',
    
    // 카테고리
    category_name: '',
    category_description: '',
    
    // 직원
    employee_name: '',
    employee_position: '',
    employee_department: '',
    employee_phone: '',
    employee_email: '',
    
    // 우선순위
    priority_name: '',
    priority_value: 0,
    priority_color: '#3B82F6',
    
    // 상태
    status_name: '',
    status_description: '',
    status_color: '#3B82F6'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'priority_value' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      let data, error;
      
      switch (type) {
        case 'siteInfo':
          ({ data, error } = await supabase.from('company_settings').update({
            company_name: formData.company_name,
            company_address: formData.company_address,
            company_phone: formData.company_phone,
            company_email: formData.company_email,
            tax_id: formData.tax_id,
            updated_at: new Date().toISOString()
          }).eq('id', '1'));
          break;
          
        case 'category':
          ({ data, error } = await supabase.from('categories').insert([{
            name: formData.category_name,
            description: formData.category_description,
            created_at: new Date().toISOString()
          }]));
          break;
          
        case 'employee':
          ({ data, error } = await supabase.from('employees').insert([{
            name: formData.employee_name,
            position: formData.employee_position,
            department: formData.employee_department,
            phone: formData.employee_phone,
            email: formData.employee_email,
            created_at: new Date().toISOString()
          }]));
          break;
          
        case 'priority':
          ({ data, error } = await supabase.from('priorities').insert([{
            name: formData.priority_name,
            value: formData.priority_value,
            color: formData.priority_color,
            created_at: new Date().toISOString()
          }]));
          break;
          
        case 'status':
          ({ data, error } = await supabase.from('statuses').insert([{
            name: formData.status_name,
            description: formData.status_description,
            color: formData.status_color,
            created_at: new Date().toISOString()
          }]));
          break;
      }
      
      if (error) throw error;
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('설정 저장 오류:', err);
      setError(err.message || '설정을 저장하는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  const getTitle = () => {
    switch (type) {
      case 'siteInfo': return '사이트 정보 수정';
      case 'category': return '카테고리 등록';
      case 'employee': return '직원 등록';
      case 'priority': return '우선순위 등록';
      case 'status': return '상태 등록';
      default: return '설정';
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
            {/* 사이트 정보 */}
            {type === 'siteInfo' && (
              <>
                <div className="mb-4">
                  <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
                    회사명
                  </label>
                  <input
                    type="text"
                    id="company_name"
                    name="company_name"
                    required
                    value={formData.company_name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="company_address" className="block text-sm font-medium text-gray-700 mb-1">
                    회사 주소
                  </label>
                  <input
                    type="text"
                    id="company_address"
                    name="company_address"
                    required
                    value={formData.company_address}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="company_phone" className="block text-sm font-medium text-gray-700 mb-1">
                    전화번호
                  </label>
                  <input
                    type="text"
                    id="company_phone"
                    name="company_phone"
                    required
                    value={formData.company_phone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="company_email" className="block text-sm font-medium text-gray-700 mb-1">
                    이메일
                  </label>
                  <input
                    type="email"
                    id="company_email"
                    name="company_email"
                    required
                    value={formData.company_email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="tax_id" className="block text-sm font-medium text-gray-700 mb-1">
                    사업자 등록번호
                  </label>
                  <input
                    type="text"
                    id="tax_id"
                    name="tax_id"
                    required
                    value={formData.tax_id}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </>
            )}
            
            {/* 카테고리 */}
            {type === 'category' && (
              <>
                <div className="mb-4">
                  <label htmlFor="category_name" className="block text-sm font-medium text-gray-700 mb-1">
                    카테고리명
                  </label>
                  <input
                    type="text"
                    id="category_name"
                    name="category_name"
                    required
                    value={formData.category_name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="category_description" className="block text-sm font-medium text-gray-700 mb-1">
                    설명
                  </label>
                  <textarea
                    id="category_description"
                    name="category_description"
                    value={formData.category_description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </>
            )}
            
            {/* 직원 */}
            {type === 'employee' && (
              <>
                <div className="mb-4">
                  <label htmlFor="employee_name" className="block text-sm font-medium text-gray-700 mb-1">
                    이름
                  </label>
                  <input
                    type="text"
                    id="employee_name"
                    name="employee_name"
                    required
                    value={formData.employee_name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="employee_position" className="block text-sm font-medium text-gray-700 mb-1">
                    직책
                  </label>
                  <input
                    type="text"
                    id="employee_position"
                    name="employee_position"
                    required
                    value={formData.employee_position}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="employee_department" className="block text-sm font-medium text-gray-700 mb-1">
                    부서
                  </label>
                  <input
                    type="text"
                    id="employee_department"
                    name="employee_department"
                    required
                    value={formData.employee_department}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="employee_phone" className="block text-sm font-medium text-gray-700 mb-1">
                    전화번호
                  </label>
                  <input
                    type="text"
                    id="employee_phone"
                    name="employee_phone"
                    required
                    value={formData.employee_phone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="employee_email" className="block text-sm font-medium text-gray-700 mb-1">
                    이메일
                  </label>
                  <input
                    type="email"
                    id="employee_email"
                    name="employee_email"
                    required
                    value={formData.employee_email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </>
            )}
            
            {/* 우선순위 */}
            {type === 'priority' && (
              <>
                <div className="mb-4">
                  <label htmlFor="priority_name" className="block text-sm font-medium text-gray-700 mb-1">
                    우선순위명
                  </label>
                  <input
                    type="text"
                    id="priority_name"
                    name="priority_name"
                    required
                    value={formData.priority_name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="예: 낮음, 보통, 높음, 긴급"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="priority_value" className="block text-sm font-medium text-gray-700 mb-1">
                    우선순위 값 (숫자)
                  </label>
                  <input
                    type="number"
                    id="priority_value"
                    name="priority_value"
                    required
                    min="0"
                    value={formData.priority_value}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="예: 낮음(1), 보통(2), 높음(3), 긴급(4)"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="priority_color" className="block text-sm font-medium text-gray-700 mb-1">
                    색상
                  </label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      id="priority_color"
                      name="priority_color"
                      required
                      value={formData.priority_color}
                      onChange={handleChange}
                      className="h-10 w-10 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={formData.priority_color}
                      onChange={handleChange}
                      name="priority_color"
                      className="ml-2 w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </>
            )}
            
            {/* 상태 */}
            {type === 'status' && (
              <>
                <div className="mb-4">
                  <label htmlFor="status_name" className="block text-sm font-medium text-gray-700 mb-1">
                    상태명
                  </label>
                  <input
                    type="text"
                    id="status_name"
                    name="status_name"
                    required
                    value={formData.status_name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="예: 대기중, 진행중, 완료, 취소됨"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="status_description" className="block text-sm font-medium text-gray-700 mb-1">
                    설명
                  </label>
                  <textarea
                    id="status_description"
                    name="status_description"
                    value={formData.status_description}
                    onChange={handleChange}
                    rows={2}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="status_color" className="block text-sm font-medium text-gray-700 mb-1">
                    색상
                  </label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      id="status_color"
                      name="status_color"
                      required
                      value={formData.status_color}
                      onChange={handleChange}
                      className="h-10 w-10 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={formData.status_color}
                      onChange={handleChange}
                      name="status_color"
                      className="ml-2 w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
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
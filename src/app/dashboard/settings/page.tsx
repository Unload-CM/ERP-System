'use client';

import { useState, useEffect } from 'react';
import { supabase, safeSupabaseQuery } from '@/lib/supabase';
import SettingsModal from '@/components/modals/SettingsModal';

type CompanySettings = {
  id: string;
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  tax_id: string;
  currency: string;
  timezone: string;
  date_format: string;
  logo_url: string | null;
  updated_at: string;
  updated_by: string;
  user_full_name: string;
};

// 모킹 데이터 - API 연결 실패 시 사용
const MOCK_SETTINGS: CompanySettings = {
  id: '1',
  company_name: '테크노 제조 유한회사',
  company_address: '서울특별시 강남구 테헤란로 123',
  company_phone: '02-123-4567',
  company_email: 'contact@techno-manufacturing.kr',
  tax_id: '123-45-67890',
  currency: 'KRW',
  timezone: 'Asia/Seoul',
  date_format: 'YYYY-MM-DD',
  logo_url: null,
  updated_at: '2023-11-01T09:00:00Z',
  updated_by: '00000000-0000-0000-0000-000000000001',
  user_full_name: '관리자'
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<CompanySettings>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'siteInfo' | 'category' | 'employee' | 'priority' | 'status'>('siteInfo');
  
  // 추가 설정 데이터
  const [categories, setCategories] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [priorities, setPriorities] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [loadingAdditionalData, setLoadingAdditionalData] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    
    try {
      // Supabase API 사용 시도 (오류 발생 시 모킹 데이터 사용)
      const { data, error } = await safeSupabaseQuery(
        async () => {
          const { data: settingsData, error: settingsError } = await supabase
            .from('company_settings')
            .select(`
              *,
              users:updated_by(full_name)
            `)
            .single();
          
          if (settingsError) throw settingsError;
          
          const enrichedData = {
            ...settingsData,
            user_full_name: settingsData.users?.full_name || '알 수 없음'
          };
          
          return { data: enrichedData, error: null };
        },
        MOCK_SETTINGS
      );
      
      if (error) {
        setError('설정을 불러오는 데 실패했습니다.');
      } else if (data) {
        setSettings(data);
        setFormData(data);
      }
    } catch (err) {
      console.error('설정 데이터 불러오기 오류:', err);
      setError('데이터 로딩 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 추가 설정 데이터 불러오기
  const fetchAdditionalData = async () => {
    setLoadingAdditionalData(true);
    
    try {
      // 카테고리 불러오기
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .order('name');
        
      if (!categoryError && categoryData) {
        setCategories(categoryData);
      }
      
      // 직원 불러오기
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .order('name');
        
      if (!employeeError && employeeData) {
        setEmployees(employeeData);
      }
      
      // 우선순위 불러오기
      const { data: priorityData, error: priorityError } = await supabase
        .from('priorities')
        .select('*')
        .order('value');
        
      if (!priorityError && priorityData) {
        setPriorities(priorityData);
      }
      
      // 상태 불러오기
      const { data: statusData, error: statusError } = await supabase
        .from('statuses')
        .select('*')
        .order('name');
        
      if (!statusError && statusData) {
        setStatuses(statusData);
      }
    } catch (err) {
      console.error('추가 설정 데이터 불러오기 오류:', err);
    } finally {
      setLoadingAdditionalData(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchAdditionalData();
  }, []);
  
  const handleOpenModal = (type: 'siteInfo' | 'category' | 'employee' | 'priority' | 'status') => {
    setModalType(type);
    setIsModalOpen(true);
  };
  
  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  
  const handleModalSuccess = () => {
    // 설정 데이터 다시 불러오기
    if (modalType === 'siteInfo') {
      fetchSettings();
    } else {
      fetchAdditionalData();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveSettings = async () => {
    if (!formData) return;
    
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    
    try {
      // 실제 API 연결 상태라면 Supabase에 저장
      const { error } = await supabase
        .from('company_settings')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
          // 실제로는 현재 로그인 사용자 ID가 들어갑니다
          updated_by: '00000000-0000-0000-0000-000000000001'
        })
        .eq('id', settings?.id || '1');
      
      if (error) throw error;
      
      // API 연결 실패 시 모킹 데이터 업데이트
      const updatedSettings = {
        ...MOCK_SETTINGS,
        ...formData,
        updated_at: new Date().toISOString()
      };
      
      setSettings(updatedSettings);
      setSaveSuccess(true);
      setEditMode(false);
      
      // 3초 후 성공 메시지 숨기기
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('설정 저장 오류:', err);
      setSaveError('설정을 저장하는 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(settings || {});
    setEditMode(false);
  };

  // 날짜 형식 변환 함수
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (!settings) {
    return (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
        <p className="font-bold">알림</p>
        <p>설정 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">시스템 설정</h1>
      </div>

      {saveSuccess && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4" role="alert">
          <p>설정이 성공적으로 저장되었습니다.</p>
        </div>
      )}

      {saveError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p className="font-bold">오류</p>
          <p>{saveError}</p>
        </div>
      )}

      {/* 사이트 정보 섹션 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium">사이트 정보</h2>
          <button
            onClick={() => handleOpenModal('siteInfo')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm"
          >
            수정
          </button>
        </div>
        <div className="p-6">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">회사명</dt>
              <dd className="mt-1 text-sm text-gray-900">{settings?.company_name || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">회사 주소</dt>
              <dd className="mt-1 text-sm text-gray-900">{settings?.company_address || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">전화번호</dt>
              <dd className="mt-1 text-sm text-gray-900">{settings?.company_phone || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">이메일</dt>
              <dd className="mt-1 text-sm text-gray-900">{settings?.company_email || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">사업자 등록번호</dt>
              <dd className="mt-1 text-sm text-gray-900">{settings?.tax_id || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">최근 업데이트</dt>
              <dd className="mt-1 text-sm text-gray-900">{settings?.updated_at ? formatDate(settings.updated_at) : '-'}</dd>
            </div>
          </dl>
        </div>
      </div>
      
      {/* 카테고리 섹션 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium">카테고리 관리</h2>
          <button
            onClick={() => handleOpenModal('category')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm"
          >
            카테고리 추가
          </button>
        </div>
        <div className="p-6">
          {loadingAdditionalData ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : categories.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {categories.map(category => (
                <li key={category.id} className="py-4">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-sm font-medium">{category.name}</h3>
                      <p className="text-sm text-gray-500">{category.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-900 text-sm">수정</button>
                      <button className="text-red-600 hover:text-red-900 text-sm">삭제</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 py-4">등록된 카테고리가 없습니다.</p>
          )}
        </div>
      </div>
      
      {/* 직원 관리 섹션 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium">직원 관리</h2>
          <button
            onClick={() => handleOpenModal('employee')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm"
          >
            직원 추가
          </button>
        </div>
        <div className="p-6">
          {loadingAdditionalData ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : employees.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {employees.map(employee => (
                <li key={employee.id} className="py-4">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-sm font-medium">{employee.name}</h3>
                      <p className="text-sm text-gray-500">{employee.department} - {employee.position}</p>
                      <p className="text-sm text-gray-500">{employee.email} | {employee.phone}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-900 text-sm">수정</button>
                      <button className="text-red-600 hover:text-red-900 text-sm">삭제</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 py-4">등록된 직원이 없습니다.</p>
          )}
        </div>
      </div>
      
      {/* 우선순위 관리 섹션 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium">우선순위 관리</h2>
          <button
            onClick={() => handleOpenModal('priority')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm"
          >
            우선순위 추가
          </button>
        </div>
        <div className="p-6">
          {loadingAdditionalData ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : priorities.length > 0 ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {priorities.map(priority => (
                <li key={priority.id} className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-2" 
                        style={{ backgroundColor: priority.color || '#3B82F6' }}
                      ></div>
                      <h3 className="text-sm font-medium">{priority.name}</h3>
                    </div>
                    <span className="text-sm text-gray-500">값: {priority.value}</span>
                  </div>
                  <div className="mt-2 flex justify-end space-x-2">
                    <button className="text-indigo-600 hover:text-indigo-900 text-sm">수정</button>
                    <button className="text-red-600 hover:text-red-900 text-sm">삭제</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 py-4">등록된 우선순위가 없습니다.</p>
          )}
        </div>
      </div>
      
      {/* 상태 관리 섹션 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium">상태 관리</h2>
          <button
            onClick={() => handleOpenModal('status')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm"
          >
            상태 추가
          </button>
        </div>
        <div className="p-6">
          {loadingAdditionalData ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : statuses.length > 0 ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statuses.map(status => (
                <li key={status.id} className="border border-gray-200 rounded-md p-4">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-2" 
                      style={{ backgroundColor: status.color || '#3B82F6' }}
                    ></div>
                    <h3 className="text-sm font-medium">{status.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{status.description}</p>
                  <div className="mt-2 flex justify-end space-x-2">
                    <button className="text-indigo-600 hover:text-indigo-900 text-sm">수정</button>
                    <button className="text-red-600 hover:text-red-900 text-sm">삭제</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 py-4">등록된 상태가 없습니다.</p>
          )}
        </div>
      </div>
      
      {/* 설정 모달 */}
      <SettingsModal 
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        type={modalType}
      />
    </div>
  );
} 
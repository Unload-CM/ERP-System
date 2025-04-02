'use client';

import { useState, useEffect } from 'react';
import { supabase, safeSupabaseQuery } from '@/lib/supabase';

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

  useEffect(() => {
    async function fetchSettings() {
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
    }

    fetchSettings();
  }, []);

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
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
          >
            수정
          </button>
        ) : (
          <div className="space-x-2">
            <button
              onClick={handleCancel}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
            >
              취소
            </button>
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className={`bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSaving ? '저장 중...' : '저장'}
            </button>
          </div>
        )}
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-medium mb-4">회사 정보</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
                회사명
              </label>
              {editMode ? (
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  value={formData.company_name || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              ) : (
                <p className="text-gray-900">{settings.company_name}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="tax_id" className="block text-sm font-medium text-gray-700 mb-1">
                사업자등록번호
              </label>
              {editMode ? (
                <input
                  type="text"
                  id="tax_id"
                  name="tax_id"
                  value={formData.tax_id || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              ) : (
                <p className="text-gray-900">{settings.tax_id}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="company_email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              {editMode ? (
                <input
                  type="email"
                  id="company_email"
                  name="company_email"
                  value={formData.company_email || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              ) : (
                <p className="text-gray-900">{settings.company_email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="company_phone" className="block text-sm font-medium text-gray-700 mb-1">
                전화번호
              </label>
              {editMode ? (
                <input
                  type="text"
                  id="company_phone"
                  name="company_phone"
                  value={formData.company_phone || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              ) : (
                <p className="text-gray-900">{settings.company_phone}</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="company_address" className="block text-sm font-medium text-gray-700 mb-1">
                주소
              </label>
              {editMode ? (
                <input
                  type="text"
                  id="company_address"
                  name="company_address"
                  value={formData.company_address || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              ) : (
                <p className="text-gray-900">{settings.company_address}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 p-6">
          <h2 className="text-lg font-medium mb-4">시스템 설정</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                기본 통화
              </label>
              {editMode ? (
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="KRW">한국 원 (₩)</option>
                  <option value="USD">미국 달러 ($)</option>
                  <option value="EUR">유로 (€)</option>
                  <option value="JPY">일본 엔 (¥)</option>
                </select>
              ) : (
                <p className="text-gray-900">
                  {settings.currency === 'KRW' ? '한국 원 (₩)' : 
                   settings.currency === 'USD' ? '미국 달러 ($)' : 
                   settings.currency === 'EUR' ? '유로 (€)' : 
                   settings.currency === 'JPY' ? '일본 엔 (¥)' : 
                   settings.currency}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                타임존
              </label>
              {editMode ? (
                <select
                  id="timezone"
                  name="timezone"
                  value={formData.timezone || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="Asia/Seoul">아시아/서울 (UTC+9)</option>
                  <option value="America/New_York">미국/뉴욕 (UTC-5)</option>
                  <option value="Europe/London">유럽/런던 (UTC+0)</option>
                  <option value="Asia/Tokyo">아시아/도쿄 (UTC+9)</option>
                </select>
              ) : (
                <p className="text-gray-900">
                  {settings.timezone === 'Asia/Seoul' ? '아시아/서울 (UTC+9)' : 
                   settings.timezone === 'America/New_York' ? '미국/뉴욕 (UTC-5)' : 
                   settings.timezone === 'Europe/London' ? '유럽/런던 (UTC+0)' : 
                   settings.timezone === 'Asia/Tokyo' ? '아시아/도쿄 (UTC+9)' : 
                   settings.timezone}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="date_format" className="block text-sm font-medium text-gray-700 mb-1">
                날짜 형식
              </label>
              {editMode ? (
                <select
                  id="date_format"
                  name="date_format"
                  value={formData.date_format || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY/MM/DD">YYYY/MM/DD</option>
                </select>
              ) : (
                <p className="text-gray-900">{settings.date_format}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>마지막 업데이트: {formatDate(settings.updated_at)}</div>
            <div>업데이트한 사용자: {settings.user_full_name}</div>
          </div>
        </div>
      </div>
    </div>
  );
} 
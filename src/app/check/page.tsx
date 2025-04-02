'use client';

import { useState, useEffect } from 'react';

export default function CheckPage() {
  const [debugInfo, setDebugInfo] = useState<any>({
    localStorage: null,
    location: null,
    userAgent: null,
    error: null
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        // localStorage 확인
        const storageItems: Record<string, string> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            storageItems[key] = localStorage.getItem(key) || '';
          }
        }

        // 현재 위치 정보
        const locationInfo = {
          href: window.location.href,
          origin: window.location.origin,
          pathname: window.location.pathname,
          host: window.location.host
        };

        setDebugInfo({
          localStorage: storageItems,
          location: locationInfo,
          userAgent: window.navigator.userAgent,
          error: null
        });
      }
    } catch (error) {
      setDebugInfo((prev: any) => ({
        ...prev,
        error: error instanceof Error ? error.message : String(error)
      }));
    }
  }, []);

  const clearStorage = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch (error) {
      setDebugInfo((prev: any) => ({
        ...prev,
        error: error instanceof Error ? error.message : String(error)
      }));
    }
  };

  const redirectToDashboard = () => {
    try {
      const adminUser = {
        id: 'admin-temp-id',
        email: 'admin@example.com',
        user_metadata: { 
          username: 'admin', 
          full_name: 'Admin User' 
        },
        role: 'admin',
        isAuthenticated: true
      };
      
      localStorage.setItem('user', JSON.stringify(adminUser));
      localStorage.setItem('is_authenticated', 'true');
      
      window.location.href = '/dashboard';
    } catch (error) {
      setDebugInfo((prev: any) => ({
        ...prev,
        error: error instanceof Error ? error.message : String(error)
      }));
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">브라우저 상태 확인</h1>
      
      {debugInfo.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p><strong>오류 발생:</strong> {debugInfo.error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">로컬 스토리지</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
            {JSON.stringify(debugInfo.localStorage, null, 2)}
          </pre>
          <button 
            onClick={clearStorage}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            로컬 스토리지 초기화
          </button>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">위치 정보</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
            {JSON.stringify(debugInfo.location, null, 2)}
          </pre>
          <p className="mt-4 text-sm text-gray-600">User Agent: {debugInfo.userAgent}</p>
        </div>
      </div>
      
      <div className="mt-8 flex space-x-4">
        <button 
          onClick={() => window.location.href = '/login'}
          className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600"
        >
          로그인 페이지로 이동
        </button>
        <button 
          onClick={redirectToDashboard}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          관리자로 로그인하고 대시보드로 이동
        </button>
      </div>
    </div>
  );
} 
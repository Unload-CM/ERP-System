'use client';

import { useEffect, useState } from 'react';

export default function AdminRedirectPage() {
  const [message, setMessage] = useState('관리자 인증 중...');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    console.log('리디렉션 페이지 마운트됨');
    
    // 먼저 localStorage에 사용자 정보가 있는지 확인
    if (typeof window !== 'undefined') {
      console.log('localStorage 확인 중');
      
      // 관리자 정보 저장 (다시 한번 확실하게)
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
      
      // 디버깅 - 저장 후 확인
      const savedUser = localStorage.getItem('user');
      const isAuthenticated = localStorage.getItem('is_authenticated');
      
      console.log('저장된 사용자 정보:', savedUser);
      console.log('인증 상태:', isAuthenticated);
      
      // 즉시 한 번 리디렉션 시도
      console.log('즉시 리디렉션 시도...');
      
      // 즉시 강제 페이지 이동 시도
      try {
        window.location.replace('/dashboard');
      } catch (error) {
        console.error('즉시 이동 실패, 타이머 설정...', error);
        
        // 카운트다운 시작
        const timer = setInterval(() => {
          setCountdown((prev) => {
            console.log('카운트다운:', prev);
            if (prev <= 1) {
              clearInterval(timer);
              
              // 대시보드로 이동
              console.log('대시보드로 이동 중...');
              try {
                window.location.href = '/dashboard';
                // 하드 리디렉션 백업
                setTimeout(() => {
                  window.location.replace('/dashboard');
                }, 500);
              } catch (e) {
                console.error('이동 실패', e);
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        return () => clearInterval(timer);
      }
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">관리자 로그인 성공</h2>
          <p className="mt-2 text-sm text-gray-600">
            {countdown}초 후 대시보드로 이동합니다...
          </p>
        </div>
        <div className="mt-5">
          <div className="relative pt-1">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
              <div 
                style={{ width: `${(3-countdown) / 3 * 100}%` }} 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 transition-all duration-500"
              ></div>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500">
            자동으로 이동하지 않으면 
            <button 
              onClick={() => window.location.href = '/dashboard'} 
              className="ml-1 font-medium text-primary-600 hover:text-primary-500"
            >
              여기를 클릭하세요
            </button>
          </p>
        </div>
      </div>
    </div>
  );
} 
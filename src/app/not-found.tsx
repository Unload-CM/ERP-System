'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function NotFound() {
  useEffect(() => {
    console.log('404 페이지가 렌더링됨');
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600">404</h1>
        <h2 className="text-4xl font-bold text-gray-800 mt-4">페이지를 찾을 수 없습니다</h2>
        <p className="text-gray-600 mt-4 max-w-md">
          존재하지 않는 페이지이거나, 잘못된 주소를 입력하셨습니다.
        </p>
        <div className="mt-8 space-x-4">
          <Link 
            href="/"
            className="px-6 py-3 bg-primary-600 text-white rounded-md font-semibold hover:bg-primary-700 transition-colors"
          >
            홈으로 이동
          </Link>
          <Link 
            href="/login"
            className="px-6 py-3 bg-white text-primary-600 border border-primary-600 rounded-md font-semibold hover:bg-gray-50 transition-colors"
          >
            로그인 페이지
          </Link>
        </div>
        <div className="mt-8">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md font-semibold hover:bg-gray-300 transition-colors"
          >
            대시보드로 직접 이동
          </button>
        </div>
      </div>
    </div>
  );
} 
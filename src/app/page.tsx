'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function IntroPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        router.push('/dashboard');
        return;
      }

      setLoading(false);
    };

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-900 to-primary-700">
        <div className="w-16 h-16 border-4 border-white border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 text-white">
      {/* 헤더 */}
      <header className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold">DMC ERP</span>
          <span className="bg-white text-primary-700 text-xs px-2 py-1 rounded-md font-semibold">SYSTEM</span>
        </div>
        <div className="space-x-4">
          <Link href="/login" className="text-white hover:text-primary-200 font-medium">
            로그인
          </Link>
          <Link href="/register" className="bg-white text-primary-700 px-4 py-2 rounded-md font-medium hover:bg-primary-100 transition-colors">
            회원가입
          </Link>
        </div>
      </header>

      {/* 메인 섹션 */}
      <main className="container mx-auto mt-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          {/* 왼쪽 텍스트 */}
          <div className="md:w-1/2 space-y-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
              기업 자원 관리의 <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">새로운 표준</span>
            </h1>
            <p className="text-lg sm:text-xl text-primary-100 max-w-lg">
              DMC ERP 시스템으로 자재, 구매, 생산, 배송 계획을 효율적으로 관리하세요. 클라우드 기반의 모던한 ERP 솔루션을 지금 경험하세요.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/login" className="bg-white text-primary-700 px-6 py-3 rounded-md font-bold text-center hover:bg-primary-100 transition-colors">
                시작하기
              </Link>
              <Link href="/about" className="border border-white text-white px-6 py-3 rounded-md font-bold text-center hover:bg-white/10 transition-colors">
                자세히 알아보기
              </Link>
            </div>
            <div className="flex items-center space-x-4 pt-6">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold border-2 border-white">B</div>
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold border-2 border-white">S</div>
                <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold border-2 border-white">K</div>
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold border-2 border-white">M</div>
              </div>
              <p className="text-sm text-primary-100">
                <span className="font-bold">1,000+</span> 기업이 사용 중
              </p>
            </div>
          </div>

          {/* 오른쪽 이미지/카드 */}
          <div className="md:w-1/2 relative">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-sm">dashboard.dmc-erp.com</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="text-2xl mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="text-sm font-medium">자재 관리</div>
                  <div className="text-xs opacity-70 mt-1">1,243개 항목</div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="text-2xl mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="text-sm font-medium">구매 요청</div>
                  <div className="text-xs opacity-70 mt-1">56개 진행 중</div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="text-2xl mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <div className="text-sm font-medium">생산 계획</div>
                  <div className="text-xs opacity-70 mt-1">12개 계획</div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  <div className="text-2xl mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                  </div>
                  <div className="text-sm font-medium">배송 계획</div>
                  <div className="text-xs opacity-70 mt-1">8개 배송 중</div>
                </div>
              </div>
              
              <div className="mt-6 bg-white/5 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium">월간 실적</div>
                  <div className="text-xs opacity-70">2023년 11월</div>
                </div>
                <div className="h-16 flex items-end space-x-1">
                  <div className="bg-primary-300 h-6 w-full rounded-sm"></div>
                  <div className="bg-primary-300 h-10 w-full rounded-sm"></div>
                  <div className="bg-primary-300 h-8 w-full rounded-sm"></div>
                  <div className="bg-primary-300 h-14 w-full rounded-sm"></div>
                  <div className="bg-primary-300 h-10 w-full rounded-sm"></div>
                  <div className="bg-primary-300 h-7 w-full rounded-sm"></div>
                  <div className="bg-yellow-300 h-16 w-full rounded-sm"></div>
                </div>
              </div>
            </div>
            
            {/* 장식용 요소들 */}
            <div className="absolute top-1/4 right-[5%] w-20 h-20 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
            <div className="absolute bottom-1/4 left-[10%] w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-20"></div>
          </div>
        </div>
        
        {/* 특징 섹션 */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold mb-12">주요 기능</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
              <div className="text-3xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">자재 관리</h3>
              <p className="text-primary-200">재고 현황 및 자재 관리를 실시간으로 추적하고 관리하세요.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
              <div className="text-3xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">구매 요청</h3>
              <p className="text-primary-200">효율적인 구매 프로세스로 승인 절차를 간소화하세요.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
              <div className="text-3xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">생산 계획</h3>
              <p className="text-primary-200">생산 일정을 최적화하고 자원을 효율적으로 할당하세요.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
              <div className="text-3xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">배송 계획</h3>
              <p className="text-primary-200">배송 과정을 추적하고 고객에게 정확한 정보를 제공하세요.</p>
            </div>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="mt-24 bg-primary-950 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold">DMC ERP</span>
                <span className="bg-white text-primary-700 text-xs px-2 py-1 rounded-md font-semibold">SYSTEM</span>
              </div>
              <p className="text-primary-300 text-sm mt-2">효율적인 자원 관리의 시작</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <h3 className="text-sm font-semibold mb-3">제품</h3>
                <ul className="space-y-2 text-sm text-primary-300">
                  <li><a href="#" className="hover:text-white">소개</a></li>
                  <li><a href="#" className="hover:text-white">기능</a></li>
                  <li><a href="#" className="hover:text-white">가격</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-3">회사</h3>
                <ul className="space-y-2 text-sm text-primary-300">
                  <li><a href="#" className="hover:text-white">소개</a></li>
                  <li><a href="#" className="hover:text-white">블로그</a></li>
                  <li><a href="#" className="hover:text-white">채용</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-3">지원</h3>
                <ul className="space-y-2 text-sm text-primary-300">
                  <li><a href="#" className="hover:text-white">문의하기</a></li>
                  <li><a href="#" className="hover:text-white">FAQ</a></li>
                  <li><a href="#" className="hover:text-white">개발자</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-primary-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-primary-400 text-sm">© 2023 DMC ERP System. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <a href="#" className="text-primary-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                Facebook
              </a>
              <a href="#" className="text-primary-400 hover:text-white">
                <span className="sr-only">Instagram</span>
                Instagram
              </a>
              <a href="#" className="text-primary-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                Twitter
              </a>
              <a href="#" className="text-primary-400 hover:text-white">
                <span className="sr-only">GitHub</span>
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

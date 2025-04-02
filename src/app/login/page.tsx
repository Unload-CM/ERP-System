'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<'email' | 'username'>('email');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const toggleLoginMethod = () => {
    setLoginMethod(prev => prev === 'email' ? 'username' : 'email');
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 관리자 계정 임시 로그인 기능
      if ((loginMethod === 'email' && formData.email === 'admin@example.com' && formData.password === 'admin123') ||
          (loginMethod === 'username' && formData.username === 'admin' && formData.password === 'admin123')) {
        console.log('임시 관리자 로그인 기능 사용');
        
        // 더 명확한 사용자 객체 생성
        const adminUser = {
          id: 'admin-temp-id',
          email: 'admin@example.com',
          user_metadata: { 
            username: 'admin', 
            full_name: 'Admin User' 
          },
          role: 'admin',
          // 추가 인증 상태 정보
          isAuthenticated: true
        };
        
        // localStorage에 사용자 정보 저장
        console.log('localStorage에 사용자 정보 저장:', adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
        localStorage.setItem('is_authenticated', 'true');
        
        // 디버깅 - 저장 후 확인
        const savedUser = localStorage.getItem('user');
        console.log('localStorage에 저장된 사용자 정보:', savedUser);
        
        console.log('router.push를 사용하여 대시보드로 이동 시도...');
        
        // Next.js router를 사용하여 대시보드로 이동
        router.push('/dashboard');
        
        return;
      }
      
      // 일반 로그인 시도
      if (loginMethod === 'email') {
        await loginWithEmail();
      } else {
        await loginWithUsername();
      }
    } catch (err: any) {
      console.error('로그인 오류:', err);
      setError(err.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async () => {
    console.log('이메일 로그인 시도:', formData.email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) {
        console.error('이메일 로그인 오류:', error);
        console.error('오류 세부 정보:', JSON.stringify(error, null, 2));
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
        }
        throw error;
      }

      if (data.user) {
        console.log('로그인 성공:', data.user.email);
        
        // 사용자 추가 정보 가져오기
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (userError) {
          console.error('사용자 정보 조회 오류:', userError);
        }
        
        // 로컬 스토리지에 사용자 정보 저장
        const userToStore = {
          id: data.user.id,
          email: data.user.email,
          user_metadata: userData || data.user.user_metadata || {},
          role: userData?.role || 'user',
          isAuthenticated: true
        };
        
        localStorage.setItem('user', JSON.stringify(userToStore));
        localStorage.setItem('is_authenticated', 'true');
        
        // 비밀번호 재설정 필요 여부에 따라 페이지 이동
        if (userData?.password_reset_required) {
          router.push('/change-password');
        } else {
          router.push('/dashboard');
        }
      } else {
        // 데이터가 없지만 오류도 없는 경우는 드물지만 처리
        console.warn('로그인 결과에 사용자 정보가 없습니다');
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('로그인 처리 오류:', error);
      throw error;
    }
  };

  const loginWithUsername = async () => {
    // 먼저 사용자 이름에 해당하는 이메일 찾기
    console.log('로그인 시도 - 사용자 이름:', formData.username);
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email, id')
      .eq('username', formData.username)
      .single();

    if (userError) {
      console.error('사용자 이름 조회 오류:', userError);
      if (userError.code === 'PGRST116') {
        throw new Error('존재하지 않는 사용자 이름입니다.');
      }
      throw userError;
    }

    console.log('사용자 이메일 찾음:', userData.email);

    try {
      // 찾은 이메일로 로그인 시도
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: formData.password
      });

      if (loginError) {
        console.error('로그인 오류:', loginError);
        if (loginError.message.includes('Invalid login credentials')) {
          throw new Error('비밀번호가 올바르지 않습니다.');
        }
        throw loginError;
      }

      if (data.user) {
        // 사용자 추가 정보 가져오기
        const { data: fullUserData, error: fullUserError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (fullUserError) {
          console.error('사용자 정보 조회 오류:', fullUserError);
        }
        
        // 로컬 스토리지에 사용자 정보 저장
        const userToStore = {
          id: data.user.id,
          email: data.user.email,
          user_metadata: fullUserData || data.user.user_metadata || {},
          role: fullUserData?.role || 'user',
          isAuthenticated: true
        };
        
        localStorage.setItem('user', JSON.stringify(userToStore));
        localStorage.setItem('is_authenticated', 'true');
        
        // 비밀번호 재설정 필요 여부에 따라 페이지 이동
        if (fullUserData?.password_reset_required) {
          router.push('/change-password');
        } else {
          router.push('/dashboard');
        }
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('로그인 처리 오류:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* 왼쪽 이미지 섹션 */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-900 to-primary-700 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-primary-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-12 text-white">
          <div className="w-full max-w-md text-center">
            <div className="mb-8 inline-flex items-center space-x-2">
              <span className="text-3xl font-bold">DMC ERP</span>
              <span className="bg-white text-primary-700 text-xs px-2 py-1 rounded-md font-semibold">SYSTEM</span>
            </div>
            
            <h1 className="text-4xl font-bold mb-6">기업 자원 관리의 미래를 경험하세요</h1>
            
            <p className="text-lg mb-8 opacity-90">
              클라우드 기반 ERP 시스템으로 자재 관리, 구매, 생산, 배송을 효율적으로 관리하세요.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <div className="text-3xl mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="font-medium">자재 관리</div>
              </div>
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <div className="text-3xl mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="font-medium">구매 요청</div>
              </div>
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <div className="text-3xl mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div className="font-medium">생산 계획</div>
              </div>
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <div className="text-3xl mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                </div>
                <div className="font-medium">배송 계획</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-4">
              <span className="text-sm opacity-70">trusted by</span>
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold border-2 border-white text-xs">B</div>
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold border-2 border-white text-xs">S</div>
                <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold border-2 border-white text-xs">K</div>
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold border-2 border-white text-xs">M</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 오른쪽 로그인 폼 */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">환영합니다</h2>
            <p className="mt-2 text-gray-600">계정에 로그인하여 시작하세요</p>
          </div>

          <div className="flex justify-center mb-6">
            <div className="flex p-1 rounded-lg bg-gray-100">
              <button
                type="button"
                onClick={() => loginMethod !== 'email' && toggleLoginMethod()}
                className={`py-2 px-4 text-sm font-medium rounded ${
                  loginMethod === 'email'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                이메일로 로그인
              </button>
              <button
                type="button"
                onClick={() => loginMethod !== 'username' && toggleLoginMethod()}
                className={`py-2 px-4 text-sm font-medium rounded ${
                  loginMethod === 'username'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                아이디로 로그인
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {loginMethod === 'email' ? (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  이메일
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="py-3 px-10 block w-full border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="name@company.com"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  아이디
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="py-3 px-10 block w-full border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="사용자 아이디"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="py-3 px-10 block w-full border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  자동 로그인
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                  비밀번호 찾기
                </Link>
              </div>
            </div>

            {/* 테스트 계정 정보 */}
            <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm">
              <p className="text-gray-500 font-medium mb-1">테스트 계정:</p>
              <p className="text-gray-600">일반 사용자: user@example.com / password123</p>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? '로그인 중...' : '로그인'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  또는
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub로 로그인
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              계정이 없으신가요?{' '}
              <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500">
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
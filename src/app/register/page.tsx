'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    nickname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [terms, setTerms] = useState({
    serviceTerms: false,
    privacyPolicy: false,
    marketingConsent: false,
  });

  // 비밀번호 강도 측정
  useEffect(() => {
    const calculatePasswordStrength = (password: string) => {
      let strength = 0;
      if (password.length > 6) strength += 1;
      if (password.length > 10) strength += 1;
      if (/[A-Z]/.test(password)) strength += 1;
      if (/[0-9]/.test(password)) strength += 1;
      if (/[^A-Za-z0-9]/.test(password)) strength += 1;
      return strength;
    };

    setPasswordStrength(calculatePasswordStrength(formData.password));
  }, [formData.password]);

  // 비밀번호 확인
  useEffect(() => {
    if (formData.confirmPassword) {
      setPasswordMatch(formData.password === formData.confirmPassword);
    } else {
      setPasswordMatch(true);
    }
  }, [formData.password, formData.confirmPassword]);

  // 아이디 중복 확인
  const checkUsernameAvailability = async () => {
    if (!formData.username || formData.username.length < 4) {
      setError('아이디는 최소 4자 이상이어야 합니다.');
      return;
    }

    setUsernameChecking(true);
    setError(null);
    setSuccess(null);
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('username', formData.username)
        .maybeSingle();

      if (error) throw error;
      
      setUsernameAvailable(!data);
      
      if (data) {
        setError('이미 사용 중인 아이디입니다.');
      } else {
        setError(null);
        setSuccess('사용 가능한 아이디입니다.');
      }
    } catch (err: any) {
      console.error('아이디 확인 오류:', err);
      setError('아이디 확인 중 오류가 발생했습니다.');
      setUsernameAvailable(null);
    } finally {
      setUsernameChecking(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'username') {
      setUsernameAvailable(null);
      setSuccess(null);
    }
    
    // 입력 시 에러 메시지 초기화
    setError(null);
  };

  const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setTerms((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    // 필수 입력값 검증
    if (!formData.username || !formData.firstName || !formData.email || !formData.password) {
      setError('모든 필수 항목을 입력해주세요.');
      setLoading(false);
      return;
    }
    
    // 비밀번호 검증
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    // 비밀번호 길이 검증
    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      setLoading(false);
      return;
    }

    // 아이디 중복 검증
    if (usernameAvailable !== true) {
      setError('아이디 중복 확인을 해주세요.');
      setLoading(false);
      return;
    }

    // 약관 동의 검증
    if (!terms.serviceTerms || !terms.privacyPolicy) {
      setError('필수 약관에 동의해주세요.');
      setLoading(false);
      return;
    }

    try {
      // 회원가입 처리
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            nickname: formData.nickname || formData.username,
            full_name: `${formData.firstName} ${formData.lastName}`.trim(),
            first_name: formData.firstName,
            last_name: formData.lastName,
            marketing_consent: terms.marketingConsent
          },
        },
      });

      if (authError) throw authError;

      // 사용자 정보 저장
      if (authData?.user) {
        const { error: profileError } = await supabase.from('users').insert([
          {
            id: authData.user.id,
            email: formData.email,
            username: formData.username,
            nickname: formData.nickname || formData.username,
            full_name: `${formData.firstName} ${formData.lastName}`.trim(),
            first_name: formData.firstName,
            last_name: formData.lastName,
            marketing_consent: terms.marketingConsent,
            password_reset_required: false,
            role: 'user',
          },
        ]);

        if (profileError) throw profileError;
      }

      setSuccess('회원가입이 완료되었습니다. 이메일 인증 후 로그인해주세요.');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      if (err.message.includes('already registered')) {
        setError('이미 등록된 이메일 주소입니다.');
      } else {
        setError(err.message || '회원가입 중 오류가 발생했습니다.');
      }
      console.error('회원가입 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 flex">
      {/* 왼쪽 섹션 - 모바일에서는 숨김 */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center text-white p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 inline-flex items-center space-x-2">
            <span className="text-3xl font-bold">DMC ERP</span>
            <span className="bg-white text-primary-700 text-xs px-2 py-1 rounded-md font-semibold">SYSTEM</span>
          </div>
          
          <h1 className="text-4xl font-bold mb-6">함께 성장하는 미래를 꿈꿉니다</h1>
          
          <p className="text-lg mb-8 opacity-90">
            DMC ERP 시스템에 회원으로 가입하고 기업 자원 관리의 모든 혁신적인 기능을 경험하세요.
          </p>
          
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">보안 및 데이터 보호</h3>
                  <p className="opacity-80">모든 데이터는 강력한 암호화를 통해 보호됩니다.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">빠른 시작</h3>
                  <p className="opacity-80">간단한 가입 절차로 빠르게 시작하세요.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">팀 협업</h3>
                  <p className="opacity-80">팀원들과 함께 효율적인 협업을 경험하세요.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 오른쪽 회원가입 폼 */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8 overflow-y-auto max-h-screen">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">회원가입</h2>
            <p className="mt-2 text-gray-600">DMC ERP 시스템의 모든 기능을 사용하세요</p>
          </div>

          {error && (
            <div className="mb-6 p-4 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          {success && !error && (
            <div className="mb-6 p-4 text-sm text-green-700 bg-green-100 rounded-md">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 아이디 및 중복 확인 */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                아이디 <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2">
                <div className="relative flex-grow">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                      usernameAvailable === false ? 'border-red-500' : usernameAvailable === true ? 'border-green-500' : ''
                    }`}
                    placeholder="사용할 아이디"
                  />
                  {usernameAvailable !== null && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      {usernameAvailable ? (
                        <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={checkUsernameAvailability}
                  disabled={usernameChecking || !formData.username || formData.username.length < 4}
                  className="inline-flex justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {usernameChecking ? '확인 중...' : '중복 확인'}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">4자 이상의 영문, 숫자 조합</p>
            </div>

            {/* 닉네임 */}
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                닉네임
              </label>
              <input
                id="nickname"
                name="nickname"
                type="text"
                value={formData.nickname}
                onChange={handleChange}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="사용할 닉네임 (선택)"
              />
              <p className="mt-1 text-xs text-gray-500">입력하지 않을 경우 아이디가 닉네임으로 사용됩니다</p>
            </div>

            {/* 이름/성 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  성
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* 이메일 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일 <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="your@email.com"
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
              {/* 비밀번호 강도 표시 */}
              {formData.password && (
                <div className="mt-2">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                    <div
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                        passwordStrength <= 2
                          ? 'bg-red-500'
                          : passwordStrength <= 3
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                    ></div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {passwordStrength <= 2
                      ? '약함: 더 복잡한 비밀번호를 사용하세요'
                      : passwordStrength <= 3
                      ? '중간: 괜찮지만 더 강화할 수 있습니다'
                      : '강함: 안전한 비밀번호입니다'}
                  </p>
                </div>
              )}
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                  !passwordMatch && formData.confirmPassword ? 'border-red-500' : formData.confirmPassword && passwordMatch ? 'border-green-500' : ''
                }`}
              />
              {!passwordMatch && formData.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">비밀번호가 일치하지 않습니다.</p>
              )}
              {passwordMatch && formData.confirmPassword && (
                <p className="mt-1 text-xs text-green-500">비밀번호가 일치합니다.</p>
              )}
            </div>

            {/* 약관 동의 */}
            <div className="space-y-3 pt-2">
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="serviceTerms"
                    name="serviceTerms"
                    type="checkbox"
                    required
                    checked={terms.serviceTerms}
                    onChange={handleTermsChange}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="serviceTerms" className="font-medium text-gray-700">
                    서비스 이용약관에 동의합니다 <span className="text-red-500">*</span>
                  </label>
                  <p className="text-gray-500">
                    <Link href="/terms" className="text-primary-600 hover:text-primary-500">
                      약관 보기
                    </Link>
                  </p>
                </div>
              </div>

              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="privacyPolicy"
                    name="privacyPolicy"
                    type="checkbox"
                    required
                    checked={terms.privacyPolicy}
                    onChange={handleTermsChange}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="privacyPolicy" className="font-medium text-gray-700">
                    개인정보 처리방침에 동의합니다 <span className="text-red-500">*</span>
                  </label>
                  <p className="text-gray-500">
                    <Link href="/privacy" className="text-primary-600 hover:text-primary-500">
                      정책 보기
                    </Link>
                  </p>
                </div>
              </div>

              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="marketingConsent"
                    name="marketingConsent"
                    type="checkbox"
                    checked={terms.marketingConsent}
                    onChange={handleTermsChange}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="marketingConsent" className="font-medium text-gray-700">
                    마케팅 정보 수신에 동의합니다 (선택)
                  </label>
                  <p className="text-gray-500">제품 업데이트 및 혜택 정보를 받아보세요.</p>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? '처리 중...' : '회원가입'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 
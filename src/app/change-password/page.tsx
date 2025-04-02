'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isForceChange, setIsForceChange] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.push('/login');
        return;
      }

      setCurrentUser(data.user);

      // 강제 비밀번호 변경 여부 확인
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('password_reset_required')
        .eq('id', data.user.id)
        .single();
        
      if (!userError && userData && userData.password_reset_required) {
        setIsForceChange(true);
      }
    };

    checkAuth();
  }, [router]);

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

    setPasswordStrength(calculatePasswordStrength(formData.newPassword));
  }, [formData.newPassword]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 비밀번호 유효성 검사
      if (formData.newPassword.length < 6) {
        throw new Error('새 비밀번호는 최소 6자 이상이어야 합니다.');
      }

      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      }

      // 현재 비밀번호 확인
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: formData.currentPassword
      });

      if (signInError) {
        throw new Error('현재 비밀번호가 올바르지 않습니다.');
      }

      // 비밀번호 변경
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (updateError) {
        throw updateError;
      }

      // 비밀번호 변경 필요 플래그 제거
      if (isForceChange) {
        const { error: updateFlagError } = await supabase
          .from('users')
          .update({ password_reset_required: false })
          .eq('id', currentUser.id);
          
        if (updateFlagError) {
          console.error('사용자 정보 업데이트 오류:', updateFlagError);
        }
      }

      setSuccess('비밀번호가 성공적으로 변경되었습니다.');
      
      // 폼 초기화
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // 성공 후 대시보드로 이동
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('비밀번호 변경 오류:', err);
      setError(err.message || '비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="p-6 max-w-sm w-full bg-white shadow-md rounded-md">
          <p className="text-center text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">비밀번호 변경</h2>
          <p className="mt-2 text-sm text-gray-600">
            {isForceChange 
              ? '임시 비밀번호를 사용하고 계십니다. 계속하려면 새 비밀번호를 설정해 주세요.' 
              : '계정 보안을 위해 비밀번호를 변경합니다.'}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-6 p-4 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 text-sm text-green-700 bg-green-100 rounded-md">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                현재 비밀번호
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  required
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="py-3 px-10 block w-full border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="현재 비밀번호 입력"
                />
              </div>
              {isForceChange && (
                <p className="mt-1 text-xs text-gray-500">
                  임시 비밀번호를 입력하세요.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                새 비밀번호
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="py-3 px-10 block w-full border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="새 비밀번호 입력"
                />
              </div>

              {/* 비밀번호 강도 표시 */}
              {formData.newPassword && (
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                새 비밀번호 확인
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`py-3 px-10 block w-full border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                    formData.confirmPassword && formData.newPassword !== formData.confirmPassword
                      ? 'border-red-500'
                      : formData.confirmPassword && formData.newPassword === formData.confirmPassword
                      ? 'border-green-500'
                      : ''
                  }`}
                  placeholder="새 비밀번호 확인"
                />
              </div>
              {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">비밀번호가 일치하지 않습니다.</p>
              )}
              {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                <p className="mt-1 text-xs text-green-500">비밀번호가 일치합니다.</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? '처리 중...' : '비밀번호 변경'}
              </button>
            </div>

            {!isForceChange && (
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  나중에 변경하기
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
} 
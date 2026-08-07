'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import AuthLayout from '@/components/AuthLayout';
import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();

  const loginFields = [
    {
      name: 'email',
      type: 'email' as const,
      label: 'Email Address',
      placeholder: 'you@example.com',
      required: true,
    },
    {
      name: 'password',
      type: 'password' as const,
      label: 'Password',
      placeholder: '••••••••',
      required: true,
    },
  ];

  const handleSubmit = async (formData: Record<string, string>) => {
    try {
      await login(formData.email, formData.password);
      router.push('/dashboard');
    } catch (err) {
      // Error is handled by store
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      description="Sign in to Oakami Waste Intelligence"
      bottomLink={
        <>
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-sky-500 hover:text-sky-600 font-semibold">
            Sign up
          </Link>
        </>
      }
    >
      <AuthForm
        fields={loginFields}
        onSubmit={handleSubmit}
        submitLabel="Sign In"
        error={error}
        isLoading={isLoading}
      />
    </AuthLayout>
  );
}

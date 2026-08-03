'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import AuthLayout from '@/components/AuthLayout';
import AuthForm from '@/components/AuthForm';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error } = useAuthStore();

  const registerFields = [
    {
      name: 'firstName',
      type: 'text' as const,
      label: 'First Name',
      placeholder: 'John',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text' as const,
      label: 'Last Name',
      placeholder: 'Doe',
      required: true,
    },
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
      await register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      );
      router.push('/dashboard');
    } catch (err) {
      // Error is handled by store
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      description="Join Oakami Waste Intelligence"
      bottomLink={
        <>
          Already have an account?{' '}
          <Link href="/auth/login" className="text-sky-500 hover:text-sky-600 font-semibold">
            Sign in
          </Link>
        </>
      }
    >
      <AuthForm
        fields={registerFields}
        onSubmit={handleSubmit}
        submitLabel="Sign Up"
        error={error}
        isLoading={isLoading}
      />
    </AuthLayout>
  );
}

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Oakami Waste Intelligence
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Enterprise-grade restaurant food waste intelligence system
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/login"
            className="px-8 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className="px-8 py-3 border-2 border-sky-500 text-sky-500 rounded-lg hover:bg-sky-50 transition"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}

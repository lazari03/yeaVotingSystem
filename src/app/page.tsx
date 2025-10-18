import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 to-white p-6">
      <div className="max-w-xl w-full bg-white/90 dark:bg-gray-900/80 backdrop-blur-md rounded-xl shadow-lg p-10 text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to Yea Voting System</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Secure, simple voting for your community. Sign in to access your dashboard and cast votes.
        </p>
        <Link href="/login" className="inline-block">
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md">
            Go to Login
          </button>
        </Link>
      </div>
    </main>
  );
}
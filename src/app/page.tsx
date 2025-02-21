'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { TrendingUp, LineChart, Lock, Shield } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const { user, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/api-data');
    }
  }, [user, router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold text-white">TradingAI</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Hero Section */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Advanced Trading <span className="text-blue-500">Analytics</span>
            </h1>
            <p className="text-lg text-slate-300 mb-8">
              Access real-time market data, advanced charting tools, and AI-powered insights
              to make informed trading decisions.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start p-4 bg-slate-800/50 rounded-lg backdrop-blur-sm border border-slate-700">
                <LineChart className="h-6 w-6 text-blue-500 mt-1" />
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-white">Real-time Charts</h3>
                  <p className="text-slate-400">Interactive charts with multiple timeframes</p>
                </div>
              </div>
              <div className="flex items-start p-4 bg-slate-800/50 rounded-lg backdrop-blur-sm border border-slate-700">
                <Lock className="h-6 w-6 text-blue-500 mt-1" />
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-white">Secure Access</h3>
                  <p className="text-slate-400">Protected data and personal information</p>
                </div>
              </div>
            </div>
          </div>

          {/* Auth Section */}
          <div className="w-full max-w-md">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Get Started</h2>
              <div className="space-y-4">
                <button
                  onClick={() => signInWithGoogle()}
                  className="w-full px-4 py-3 flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 rounded-lg transition-colors duration-200"
                >
                  <Image 
                    src="https://www.google.com/favicon.ico" 
                    alt="Google" 
                    width={20} 
                    height={20}
                  />
                  Continue with Google
                </button>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-slate-800/50 text-slate-400">Or continue with email</span>
                  </div>
                </div>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                      placeholder="Enter your password"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors duration-200"
                  >
                    Sign In
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="text-center py-20 space-y-4">
      <h1 className="text-6xl font-black text-indigo-600">404</h1>
      <h2 className="text-2xl font-bold text-slate-800">Page Not Found</h2>
      <p className="text-slate-500 max-w-md mx-auto text-sm">
        The page you are looking for does not exist or may have been relocated.
      </p>
      <div className="pt-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
        >
          <Home className="w-4 h-4" />
          Back to Overview
        </Link>
      </div>
    </div>
  );
}

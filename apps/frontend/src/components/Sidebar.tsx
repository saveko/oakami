'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import NotificationBell from './NotificationBell';
import clsx from 'clsx';

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuthStore();

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/waste', label: 'Waste Records' },
    { href: '/dashboard/inventory', label: 'Inventory' },
    { href: '/dashboard/analytics', label: 'Analytics' },
    { href: '/dashboard/reports', label: 'Reports' },
    { href: '/dashboard/suppliers', label: 'Suppliers' },
    { href: '/dashboard/settings', label: 'Settings' },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen flex flex-col">
      <div className="p-6 border-b border-gray-800 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Oakami</h1>
          <p className="text-gray-400 text-sm">Waste Intelligence</p>
        </div>
        <NotificationBell />
      </div>

      <nav className="flex-1 p-6 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'block px-4 py-2 rounded-lg transition',
              isActive(item.href)
                ? 'bg-sky-500 text-white font-semibold'
                : 'text-gray-300 hover:bg-gray-800'
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t border-gray-800">
        <div className="mb-4">
          <p className="text-sm text-gray-400">Signed in as</p>
          <p className="text-white font-semibold">
            {user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`
              : user?.email}
          </p>
        </div>
        <button
          onClick={logout}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/projects', label: 'Projects', icon: '🏗️' },
  { href: '/vendors', label: 'Vendors', icon: '🤝' },
  { href: '/reports', label: 'Reports', icon: '📈' },
  { href: '/profile', label: 'Profile', icon: '👤' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-100 transition-colors',
                  pathname === item.href ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                )}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

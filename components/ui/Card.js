import clsx from 'clsx';

export default function Card({ children, title, className }) {
  return (
    <div className={clsx('bg-white border border-gray-200 rounded-lg p-6 text-gray-900', className)}>
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>}
      {children}
    </div>
  );
}

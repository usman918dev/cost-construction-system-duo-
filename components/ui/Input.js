import clsx from 'clsx';

export default function Input({ label, error, className, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700" htmlFor={props.id || props.name}>
          {label}
        </label>
      )}
      <input
        className={clsx(
          'px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'bg-white text-gray-900 placeholder:text-gray-400',
          error && 'border-red-500',
          className
        )}
        {...props}
      />
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
}

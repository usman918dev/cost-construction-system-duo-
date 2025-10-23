import clsx from 'clsx';

export default function Select({ label, error, options, className, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700" htmlFor={props.id || props.name}>
          {label}
        </label>
      )}
      <select
        className={clsx(
          'px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'bg-white text-gray-900',
          error && 'border-red-500',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
}

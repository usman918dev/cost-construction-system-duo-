'use client';

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white p-8 rounded-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Application Error!</h2>
            <p className="text-gray-600 mb-6">{error.message || 'A critical error occurred'}</p>
            <button
              onClick={reset}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

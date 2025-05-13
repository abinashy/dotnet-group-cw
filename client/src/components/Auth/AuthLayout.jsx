export default function AuthLayout({ children }) {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center w-full bg-white py-8">
      <div className="flex flex-col justify-center max-w-md w-full px-8 md:px-16">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Welcome to BookNook</h1>
          <p className="text-lg text-gray-500 mb-6">Discover, collect, and enjoy your favorite books!</p>
        </div>
        {children}
      </div>
    </div>
  );
} 
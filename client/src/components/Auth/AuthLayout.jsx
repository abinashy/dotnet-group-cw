export default function AuthLayout({ children }) {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-white overflow-hidden">
      <div className="flex flex-col justify-center max-w-md px-8 md:px-16">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Welcome to BookNook</h1>
          <p className="text-lg text-gray-500 mb-6">Discover, collect, and enjoy your favorite books!</p>
        </div>
        {children}
      </div>
    </div>
  );
} 
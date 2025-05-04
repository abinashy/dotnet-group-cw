export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden md:flex w-1/2 bg-cover bg-center relative" style={{ backgroundImage: "url('/assets/react.svg')" }}>
        <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-center items-center text-white">
          <h1 className="text-4xl font-bold mb-4">Welcome to BookNook</h1>
          <p className="text-lg">Discover, collect, and enjoy your favorite books!</p>
        </div>
      </div>
      <div className="flex w-full md:w-1/2 justify-center items-center bg-white">
        <div className="w-full max-w-md p-8">{children}</div>
      </div>
    </div>
  );
} 
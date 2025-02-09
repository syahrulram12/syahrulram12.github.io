import { useAuth } from "../../context/AuthContext";

function Home() {
  const { user } = useAuth();
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6 border border-slate-100 bg-white p-10 rounded-md shadow-md">
        Welcome Home, {user?.name}
      </h1>
    </div>
  );
}

export default Home;

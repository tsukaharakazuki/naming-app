export default function Header() {
  return (
    <header className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-6 px-4 shadow-lg">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          名付け画数診断
        </h1>
        <p className="mt-1 text-sm text-pink-100 opacity-90">
          夫婦それぞれの姓で姓名判断を比較できます
        </p>
      </div>
    </header>
  );
}

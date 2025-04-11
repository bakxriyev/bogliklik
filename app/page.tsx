import NetworkGraph from "@/components/network"
import SearchForm from "@/components/search-form"

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Bo`gliklikni aniqlash</h1>
        <p className="text-center mb-8 text-gray-600 max-w-2xl mx-auto">
          Ikki shaxs o`rtasidagi aloqalarni grafik shaklda ko`rsish
        </p>

        <div className="mb-8">
          <SearchForm />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 overflow-hidden">
          <NetworkGraph />
        </div>
      </div>
    </main>
  )
}

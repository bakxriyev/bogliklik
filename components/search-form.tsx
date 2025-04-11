"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

export default function SearchForm() {
  const [name1, setName1] = useState("Kamron")
  const [name2, setName2] = useState("Zaxro")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name1 && name2) {
      router.push(`?source=${encodeURIComponent(name1)}&target=${encodeURIComponent(name2)}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <input
          type="text"
          placeholder="Birinchi shaxs ismini kiriting"
          value={name1}
          onChange={(e) => setName1(e.target.value)}
          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
          required
        />
      </div>
      <div className="flex-1">
        <input
          type="text"
          placeholder="Ikkinchi shaxs ismini kiriting"
          value={name2}
          onChange={(e) => setName2(e.target.value)}
          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
          required
        />
      </div>
      <button
        type="submit"
        className="flex items-center justify-center gap-2 h-10 px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        <Search className="h-4 w-4" />
        Aloqani Topish
      </button>
    </form>
  )
}

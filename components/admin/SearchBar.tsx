'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

interface SearchBarProps {
  placeholder?: string
}

export default function SearchBar({ placeholder = 'Buscar...' }: SearchBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [value, setValue] = useState(searchParams.get('q') ?? '')

  // Ref to always read the latest searchParams inside the effect
  // without including it in the dependency array (which would cause an infinite loop,
  // since searchParams is a new object reference on every navigation).
  const searchParamsRef = useRef(searchParams)
  searchParamsRef.current = searchParams

  useEffect(() => {
    const timer = setTimeout(() => {
      const newQ = value.trim()
      const currentQ = searchParamsRef.current.get('q') ?? ''
      if (newQ === currentQ) return  // URL already reflects the current input — skip

      const params = new URLSearchParams(searchParamsRef.current.toString())
      if (newQ) {
        params.set('q', newQ)
      } else {
        params.delete('q')
      }
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    }, 300)

    return () => clearTimeout(timer)
  }, [value, pathname, router])  // searchParams intentionally excluded — see ref above

  return (
    <div className="relative max-w-sm">
      <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#004b23]/25 focus:border-[#004b23] transition"
      />
    </div>
  )
}

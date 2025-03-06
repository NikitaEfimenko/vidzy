'use client'

import { usePathname, useSearchParams } from "next/navigation"
import { useCallback, useMemo } from "react"

export const useQueryParams = () => {
  const pathname = usePathname()
  const searchParamsFrom = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParamsFrom.toString())
      params.set(name, value)
 
      return `${pathname}?${params.toString()}`
    },
    [searchParamsFrom, pathname]
  )
  const searchParams = useMemo(() => {
    return new URLSearchParams(searchParamsFrom.toString())
  }, [searchParamsFrom])

  const checkParams = useCallback(
    (params: (string | null)[], candidate: string | null) => {
      return params.includes(candidate)
    },
    []
  )
  return {
    pathname,
    searchParams,
    createQueryString,
    checkParams
  }
}
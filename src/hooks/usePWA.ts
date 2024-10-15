'use client'

import { useEffect, useState } from 'react'

export function usePWA() {
    const [isStandalone, setIsStandalone] = useState(false)

    useEffect(() => {
        const mediaQuery = window.matchMedia('(display-mode: standalone)')

        const handleChange = (e: MediaQueryListEvent) => {
            setIsStandalone(e.matches)
        }

        // 초기 상태 설정
        setIsStandalone(mediaQuery.matches || (window.navigator as any).standalone || document.referrer.includes('android-app://'))

        mediaQuery.addListener(handleChange)

        return () => mediaQuery.removeListener(handleChange)
    }, [])

    return isStandalone
}
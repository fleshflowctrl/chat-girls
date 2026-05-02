/* eslint-disable react-refresh/only-export-components -- Provider + useCredits pattern */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { BuyCreditsModal } from '../components/credits/BuyCreditsModal'

const STORAGE_KEY = 'velvet_chat_credits'
/** Free starter balance for demo — later set after signup or Stripe webhook. */
const DEFAULT_BALANCE = 18

function readStoredBalance(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return DEFAULT_BALANCE
    const n = Number.parseInt(raw, 10)
    return Number.isFinite(n) && n >= 0 ? n : DEFAULT_BALANCE
  } catch {
    return DEFAULT_BALANCE
  }
}

function writeBalance(n: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(n))
  } catch {
    /* private mode */
  }
}

type CreditsContextValue = {
  balance: number
  openBuyCredits: () => void
  closeBuyCredits: () => void
  addCredits: (amount: number) => void
  /** Returns true if balance was enough and deducted. */
  trySpendCredits: (amount: number) => boolean
}

const CreditsContext = createContext<CreditsContextValue | null>(null)

export function useCredits(): CreditsContextValue {
  const ctx = useContext(CreditsContext)
  if (!ctx) throw new Error('useCredits must be used within CreditsProvider')
  return ctx
}

export function CreditsProvider({ children }: { children: ReactNode }) {
  const initial = readStoredBalance()
  const [balance, setBalance] = useState(initial)
  const balanceRef = useRef(initial)

  useEffect(() => {
    balanceRef.current = balance
  }, [balance])

  const [buyOpen, setBuyOpen] = useState(false)

  const addCredits = useCallback((amount: number) => {
    const n = Math.floor(amount)
    if (n <= 0) return
    const next = balanceRef.current + n
    balanceRef.current = next
    setBalance(next)
    writeBalance(next)
  }, [])

  const trySpendCredits = useCallback((amount: number) => {
    const n = Math.floor(amount)
    if (n <= 0) return true
    if (balanceRef.current < n) return false
    const next = balanceRef.current - n
    balanceRef.current = next
    setBalance(next)
    writeBalance(next)
    return true
  }, [])

  const value = useMemo(
    () => ({
      balance,
      openBuyCredits: () => setBuyOpen(true),
      closeBuyCredits: () => setBuyOpen(false),
      addCredits,
      trySpendCredits,
    }),
    [balance, addCredits, trySpendCredits],
  )

  return (
    <CreditsContext.Provider value={value}>
      {children}
      <BuyCreditsModal open={buyOpen} onClose={() => setBuyOpen(false)} />
    </CreditsContext.Provider>
  )
}

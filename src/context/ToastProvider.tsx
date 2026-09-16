// App-wide toast notifications. Also owns the single listener for
// ACTING_AS_CUSTOMER_CLEARED, so the "customer no longer exists" message
// (DESIGN.md section 13) is shown from exactly one place, regardless of
// which API call triggered it.
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { ACTING_AS_CUSTOMER_CLEARED, actingAsEvents } from '../api/actingAsStore'
import { Toast } from '../components/Toast'

interface ToastItem {
  id: number
  message: string
}

interface ToastContextValue {
  showToast: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

const TOAST_DURATION_MS = 5000

let nextToastId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string) => {
      const id = nextToastId++
      setToasts((current) => [...current, { id, message }])
      setTimeout(() => dismiss(id), TOAST_DURATION_MS)
    },
    [dismiss],
  )

  useEffect(() => {
    function handleActingAsCustomerCleared() {
      showToast('Kunden du agerade som finns inte längre.')
    }
    actingAsEvents.addEventListener(ACTING_AS_CUSTOMER_CLEARED, handleActingAsCustomerCleared)
    return () =>
      actingAsEvents.removeEventListener(ACTING_AS_CUSTOMER_CLEARED, handleActingAsCustomerCleared)
  }, [showToast])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast.message} onDismiss={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

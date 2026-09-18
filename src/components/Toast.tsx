// Presentational toast item. Rendering and dismiss-timer logic lives in
// ToastProvider; this just draws one message.
import './Toast.css'

interface ToastProps {
  message: string
  onDismiss: () => void
}

export function Toast({ message, onDismiss }: ToastProps) {
  return (
    <div className="toast">
      <span>{message}</span>
      <button type="button" className="toast__dismiss" onClick={onDismiss} aria-label="Stäng">
        ×
      </button>
    </div>
  )
}

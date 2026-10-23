import { pushToast } from '../store/slices/toast-slice'
import { useAppDispatch } from '../store/hooks'

export function useToast() {
  const dispatch = useAppDispatch()

  return {
    success(message: string) {
      dispatch(pushToast({ message, variant: 'success' }))
    },
    error(message: string) {
      dispatch(pushToast({ message, variant: 'error' }))
    },
  }
}

import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { baseApi } from '../../store/api/base-api'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { pushToast } from '../../store/slices/toast-slice'
import type { InventoryAlertEvent } from './types'

function socketOrigin(apiBase: string | undefined): string {
  if (!apiBase) {
    return window.location.origin
  }

  return new URL(apiBase, window.location.origin).origin
}

export function useAlertSocket(): void {
  const token = useAppSelector((state) => state.auth.token)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!token) {
      return
    }

    const socket = io(`${socketOrigin(import.meta.env.VITE_API_BASE_URL)}/notifications`, {
      auth: { token },
      transports: ['websocket'],
    })

    function refresh(event: InventoryAlertEvent) {
      dispatch(
        baseApi.util.invalidateTags([
          { type: 'InventoryAlert', id: 'LIST' },
          { type: 'InventoryAlert', id: event.alertId },
        ]),
      )
    }

    socket.on('inventory.alert.created', (event: InventoryAlertEvent) => {
      refresh(event)
      dispatch(
        pushToast({
          message: 'A product is below its reorder level.',
          variant: 'success',
        }),
      )
    })
    socket.on('inventory.alert.analysis_ready', (event: InventoryAlertEvent) => {
      refresh(event)
      dispatch(
        pushToast({
          message: 'Inventory analysis is ready.',
          variant: 'success',
        }),
      )
    })
    socket.on('inventory.alert.analysis_failed', (event: InventoryAlertEvent) => {
      refresh(event)
      dispatch(
        pushToast({
          message: 'Inventory analysis could not be completed.',
          variant: 'error',
        }),
      )
    })
    socket.on('inventory.alert.resolved', refresh)

    return () => {
      socket.disconnect()
    }
  }, [dispatch, token])
}

import { useCallback } from 'react'
import { createClient, RealtimeChannel } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * useRealtimeCareReceivers
 * 
 * Care receivers のリアルタイム更新をリッスン
 * 複数端末で同時に編集した場合、他端末にも即座に反映される
 * 
 * Usage:
 *   const { onRealtimeUpdate } = useRealtimeCareReceivers(() => {
 *     router.refresh() // UI を再フェッチ
 *   })
 *   
 *   useEffect(() => {
 *     onRealtimeUpdate() // 初回設定時に実行
 *   }, [onRealtimeUpdate])
 */
export function useRealtimeCareReceivers(
  onUpdate?: () => void
) {
  const handleUpdate = useCallback(() => {
    onUpdate?.()
  }, [onUpdate])

  const onRealtimeUpdate = useCallback(() => {
    try {
      const channel: RealtimeChannel = supabase.channel('care_receivers_changes')

      channel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'care_receivers',
          },
          (_payload: any) => {
            // すべての変更をキャッチ
            handleUpdate()
          }
        )
        .subscribe((status: string, err?: any) => {
          if (err) {
            console.error('[useRealtimeCareReceivers] Subscription error:', err)
          }
        })

      return () => {
        try {
          supabase.removeChannel(channel)
        } catch (e) {
          console.error('[useRealtimeCareReceivers] removeChannel failed:', e)
        }
      }
    } catch (err) {
      console.error('[useRealtimeCareReceivers] Failed to subscribe:', err)
      return () => {}
    }
  }, [handleUpdate])

  return { onRealtimeUpdate }
}

/**
 * useRealtimeCaseRecords
 * 
 * Case records のリアルタイム更新をリッスン
 * care_receiver_id ベースで制限可能
 */
export function useRealtimeCaseRecords(
  careReceiverId?: string,
  onUpdate?: () => void
) {
  const handleUpdate = useCallback(() => {
    onUpdate?.()
  }, [onUpdate])

  const onRealtimeUpdate = useCallback(() => {
    try {
      const channel: RealtimeChannel = supabase.channel('case_records_changes')

      const filter = careReceiverId
        ? { event: '*', schema: 'public', table: 'case_records', filter: `care_receiver_id=eq.${careReceiverId}` }
        : { event: '*', schema: 'public', table: 'case_records' }

      channel
        .on(
          'postgres_changes',
          filter as any,
          (_payload: any) => {
            handleUpdate()
          }
        )
        .subscribe((status: string, err?: any) => {
          if (err) {
            console.error('[useRealtimeCaseRecords] Subscription error:', err)
          }
        })

      return () => {
        try {
          supabase.removeChannel(channel)
        } catch (e) {
          console.error('[useRealtimeCaseRecords] removeChannel failed:', e)
        }
      }
    } catch (err) {
      console.error('[useRealtimeCaseRecords] Failed to subscribe:', err)
      return () => {}
    }
  }, [careReceiverId, handleUpdate])

  return { onRealtimeUpdate }
}

/**
 * useRealtimeStaffProfiles
 * 
 * Staff profiles のリアルタイム更新をリッスン
 * admin 権限でスタッフの情報が更新されたときに反映
 */
export function useRealtimeStaffProfiles(
  onUpdate?: () => void
) {
  const handleUpdate = useCallback(() => {
    onUpdate?.()
  }, [onUpdate])

  const onRealtimeUpdate = useCallback(() => {
    try {
      const channel: RealtimeChannel = supabase.channel('staff_profiles_changes')

      channel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'staff_profiles',
          },
          (_payload: any) => {
            // すべての変更をキャッチ
            handleUpdate()
          }
        )
        .subscribe((status: string, err?: any) => {
          if (err) {
            console.error('[useRealtimeStaffProfiles] Subscription error:', err)
          }
        })

      return () => {
        try {
          supabase.removeChannel(channel)
        } catch (e) {
          console.error('[useRealtimeStaffProfiles] removeChannel failed:', e)
        }
      }
    } catch (err) {
      console.error('[useRealtimeStaffProfiles] Failed to subscribe:', err)
      return () => {}
    }
  }, [handleUpdate])

  return { onRealtimeUpdate }
}

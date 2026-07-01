import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const body = await req.json()
    console.log('[kie-webhook] received:', JSON.stringify(body))

    const taskId = body?.task_id ?? body?.taskId ?? body?.data?.taskId
    const url = body?.data?.output?.imageUrl
      ?? body?.data?.output?.image_url
      ?? body?.data?.imageUrl
      ?? body?.output?.imageUrl
      ?? body?.imageUrl
      ?? body?.url

    if (!taskId || !url) {
      console.log('[kie-webhook] missing taskId or url, body:', JSON.stringify(body))
      return new Response('ok', { status: 200 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    await supabase.from('pending_results').upsert({ task_id: taskId, result_url: url })
    console.log('[kie-webhook] saved taskId=' + taskId + ' url=' + url)

    return new Response('ok', { status: 200 })
  } catch (err) {
    console.error('[kie-webhook]', err)
    return new Response('ok', { status: 200 })
  }
})

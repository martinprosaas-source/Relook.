import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const KIE_BASE = 'https://api.kie.ai'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const body = await req.json()
    const KIE_API_KEY = Deno.env.get('KIE_API_KEY')

    if (!KIE_API_KEY) {
      return new Response(JSON.stringify({ resultUrl: body.imageUrl, mock: true }), {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    if (body.action === 'poll') return await handlePoll(body.taskId, body.recordId, KIE_API_KEY)
    return await handleCreate(body, KIE_API_KEY)
  } catch (err) {
    console.error('[generate-modification]', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})

async function handleCreate(body, apiKey) {
  const { imageUrl, vehicle, modification } = body
  const vehicleDesc = [vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter(Boolean).join(' ')
  const prompt = buildPrompt(vehicleDesc, modification.modifTitle, modification.optionLabel)
  const webhookUrl = Deno.env.get('SUPABASE_URL') + '/functions/v1/kie-webhook'

  const requestBody = {
    model: 'nano-banana-pro',
    input: { prompt, image_url: imageUrl, strength: 0.68 },
    callback_url: webhookUrl,
  }

  console.log('[KIE] createTask:', JSON.stringify(requestBody))

  const createRes = await fetch(KIE_BASE + '/api/v1/jobs/createTask', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  })

  const createText = await createRes.text()
  console.log('[KIE] createTask ' + createRes.status + ':', createText)

  if (!createRes.ok) throw new Error('KIE createTask ' + createRes.status + ': ' + createText)

  const d = JSON.parse(createText)
  const taskId = d?.data?.taskId ?? d?.data?.task_id ?? d?.taskId ?? d?.id
  const recordId = d?.data?.recordId ?? d?.data?.record_id ?? d?.recordId

  if (!taskId) throw new Error('Pas de taskId: ' + createText)

  console.log('[KIE] taskId:', taskId, 'recordId:', recordId)

  return new Response(JSON.stringify({ taskId, recordId }), {
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

async function handlePoll(taskId, recordId, apiKey) {
  // 1. Verifier la table pending_results (resultat webhook)
  try {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    )
    const { data } = await supabase.from('pending_results').select('result_url').eq('task_id', taskId).single()
    if (data?.result_url) {
      await supabase.from('pending_results').delete().eq('task_id', taskId)
      console.log('[poll] trouve dans DB:', data.result_url)
      return new Response(JSON.stringify({ resultUrl: data.result_url }), {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }
  } catch (e) {
    console.log('[poll] DB check error:', e.message)
  }

  // 2. Essayer directement les endpoints KIE
  const endpoints = [
    { method: 'POST', path: '/api/v1/jobs/queryTask', body: { taskId } },
    { method: 'GET', path: '/api/v1/jobs/queryTask?taskId=' + taskId, body: null },
    { method: 'POST', path: '/api/v1/jobs/getTask', body: { taskId } },
    { method: 'GET', path: '/api/v1/jobs/' + taskId, body: null },
    { method: 'GET', path: '/api/v1/task/' + taskId, body: null },
    { method: 'POST', path: '/api/v1/jobs/queryTasks', body: { taskIds: [taskId] } },
  ]

  if (recordId) {
    endpoints.push(
      { method: 'GET', path: '/api/v1/records/' + recordId, body: null },
      { method: 'GET', path: '/api/v1/jobs/record/' + recordId, body: null }
    )
  }

  for (const ep of endpoints) {
    try {
      const url = KIE_BASE + ep.path
      const fetchOptions = {
        method: ep.method,
        headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      }
      if (ep.body) fetchOptions['body'] = JSON.stringify(ep.body)

      const res = await fetch(url, fetchOptions)
      const text = await res.text()
      console.log('[poll] ' + ep.method + ' ' + url + ' -> ' + res.status + ':', text.substring(0, 300))

      if (res.ok && text.length > 2) {
        try {
          const parsed = JSON.parse(text)
          const imgUrl = extractImageUrl(parsed)
          if (imgUrl) {
            console.log('[poll] image trouvee via KIE API:', imgUrl)
            return new Response(JSON.stringify({ resultUrl: imgUrl }), {
              headers: { ...CORS, 'Content-Type': 'application/json' },
            })
          }
        } catch (_) {}
      }
    } catch (e) {
      console.log('[poll] endpoint error:', e.message)
    }
  }

  return new Response(JSON.stringify({ pending: true }), {
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

function extractImageUrl(data) {
  if (!data) return null
  if (typeof data === 'string') {
    return (data.startsWith('http://') || data.startsWith('https://')) ? data : null
  }
  if (Array.isArray(data)) {
    for (const item of data) {
      const u = extractImageUrl(item)
      if (u) return u
    }
    return null
  }
  if (typeof data === 'object') {
    const directKeys = ['imageUrl', 'image_url', 'url', 'outputUrl', 'output_url', 'resultUrl', 'result_url', 'result', 'output']
    for (const key of directKeys) {
      if (data[key] && typeof data[key] === 'string' && data[key].startsWith('http')) return data[key]
      if (data[key] && typeof data[key] !== 'string') {
        const u = extractImageUrl(data[key])
        if (u) return u
      }
    }
    for (const key of Object.keys(data)) {
      if (directKeys.includes(key)) continue
      const u = extractImageUrl(data[key])
      if (u) return u
    }
  }
  return null
}

function buildPrompt(vehicle, modifType, option) {
  const descMap = {
    'PEINTURE': 'full body repaint in ' + option + ' color, same car same angle same background, photorealistic automotive photography',
    'COVERING': 'full body vinyl wrap ' + option + ', matte finish, same car same angle same background, photorealistic',
    'JANTES': option + ' aftermarket alloy wheels, same car body same angle, photorealistic sharp detail',
    'KIT CARROSSERIE': 'wide body kit ' + option + ' color, aggressive stance, same car same angle, photorealistic',
    'AILERON': option + ' rear wing spoiler installed, same car same angle same background, photorealistic',
    'PARE-CHOCS': 'sport front and rear bumper kit ' + option + ', same car same angle, photorealistic',
  }
  const modifDesc = descMap[modifType] ?? modifType + ' ' + option + ', same car'
  return vehicle + ', ' + modifDesc + ', high quality, 8k, sharp focus, realistic, no text, no watermark'
}

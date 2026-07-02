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

    if (body.action === 'poll') return await handlePoll(body.taskId, KIE_API_KEY)
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

  const requestBody = {
    model: 'nano-banana-pro',
    input: { prompt, image_url: imageUrl, strength: 0.68 },
    callBackUrl: Deno.env.get('SUPABASE_URL') + '/functions/v1/kie-webhook',
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
  if (!taskId) throw new Error('Pas de taskId: ' + createText)

  console.log('[KIE] taskId:', taskId)

  return new Response(JSON.stringify({ taskId }), {
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

async function handlePoll(taskId, apiKey) {
  const url = KIE_BASE + '/api/v1/jobs/recordInfo?taskId=' + taskId
  console.log('[poll] GET', url)

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
  })

  const text = await res.text()
  console.log('[poll] ' + res.status + ':', text)

  if (!res.ok) {
    return new Response(JSON.stringify({ pending: true }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  const d = JSON.parse(text)
  const state = d?.data?.state ?? ''
  console.log('[poll] state:', state)

  if (state === 'failed' || state === 'error') {
    return new Response(JSON.stringify({ failed: true, reason: d?.data?.failMsg ?? state }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  if (state === 'success') {
    let resultUrl = null
    try {
      const resultJson = JSON.parse(d.data.resultJson)
      resultUrl = resultJson?.resultUrls?.[0] ?? resultJson?.imageUrl ?? resultJson?.url
    } catch (_) {}

    if (!resultUrl) {
      resultUrl = d?.data?.imageUrl ?? d?.data?.url
    }

    if (resultUrl) {
      console.log('[poll] image trouvee:', resultUrl)
      return new Response(JSON.stringify({ resultUrl }), {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }
  }

  return new Response(JSON.stringify({ pending: true, state }), {
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
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

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

    if (body.action === 'poll') {
      return await handlePoll(body.taskId, KIE_API_KEY)
    }

    return await handleCreate(body, KIE_API_KEY)
  } catch (err) {
    console.error('[generate-modification]', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})

async function handleCreate(body: any, apiKey: string): Promise<Response> {
  const { imageUrl, vehicle, modification } = body

  const vehicleDesc = [vehicle.year, vehicle.make, vehicle.model, vehicle.trim]
    .filter(Boolean).join(' ')

  const prompt = buildPrompt(vehicleDesc, modification.modifTitle, modification.optionLabel)

  const requestBody = {
    model: 'nano-banana-pro',
    input: {
      prompt,
      image_url: imageUrl,
      strength: 0.68,
    },
  }

  console.log('[KIE] createTask:', JSON.stringify(requestBody))

  const createRes = await fetch(KIE_BASE + '/api/v1/jobs/createTask', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  const createText = await createRes.text()
  console.log('[KIE] createTask response ' + createRes.status + ':', createText)

  if (!createRes.ok) {
    throw new Error('KIE createTask ' + createRes.status + ': ' + createText)
  }

  const createData = JSON.parse(createText)
  const taskId = createData?.data?.taskId ?? createData?.data?.task_id ?? createData?.taskId ?? createData?.id

  console.log('[KIE] taskId:', taskId)

  if (!taskId) throw new Error('Pas de taskId. Reponse: ' + createText)

  return new Response(JSON.stringify({ taskId }), {
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

async function handlePoll(taskId: string, apiKey: string): Promise<Response> {
  const res = await fetch(KIE_BASE + '/api/v1/jobs/queryTask?taskId=' + taskId, {
    headers: { 'Authorization': 'Bearer ' + apiKey },
  })

  const data = await res.json()
  console.log('[KIE] poll taskId=' + taskId + ':', JSON.stringify(data))

  const rawStatus = data?.data?.status ?? data?.status
  const status = rawStatus != null ? String(rawStatus).toLowerCase() : ''

  const url = data?.data?.output?.imageUrl
    ?? data?.data?.output?.image_url
    ?? data?.data?.output?.images?.[0]?.url
    ?? data?.data?.imageUrl
    ?? data?.data?.image_url
    ?? data?.output?.imageUrl
    ?? data?.imageUrl
    ?? data?.url

  console.log('[KIE] rawStatus=' + rawStatus + ' status=' + status + ' url=' + (url ?? 'none'))

  // Si une URL est presente, la tache est terminee peu importe le statut
  if (url) {
    return new Response(JSON.stringify({ resultUrl: url }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  const isFailed = ['failed', 'error', 'cancelled', 'fail'].includes(status)
    || rawStatus === 3 || rawStatus === '3'

  if (isFailed) {
    return new Response(JSON.stringify({ failed: true }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ pending: true, rawStatus }), {
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

function buildPrompt(vehicle: string, modifType: string, option: string): string {
  const descMap: Record<string, string> = {
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

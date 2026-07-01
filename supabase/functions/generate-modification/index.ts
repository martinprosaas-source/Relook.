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

  const webhookUrl = Deno.env.get('SUPABASE_URL') + '/functions/v1/kie-webhook'

  const requestBody = {
    model: 'nano-banana-pro',
    input: {
      prompt,
      image_url: imageUrl,
      strength: 0.68,
    },
    callback_url: webhookUrl,
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

async function handlePoll(taskId: string, _apiKey: string): Promise<Response> {
  // Lit le resultat depuis Supabase (ecrit par le webhook KIE)
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data, error } = await supabase
    .from('pending_results')
    .select('result_url')
    .eq('task_id', taskId)
    .single()

  console.log('[poll] taskId=' + taskId + ' result_url=' + (data?.result_url ?? 'null') + ' error=' + (error?.message ?? 'none'))

  if (data?.result_url) {
    // Nettoie la ligne
    await supabase.from('pending_results').delete().eq('task_id', taskId)
    return new Response(JSON.stringify({ resultUrl: data.result_url }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ pending: true }), {
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

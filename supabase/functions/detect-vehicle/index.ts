import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { imageUrl } = await req.json()

    // ── TODO: Ajouter OPENAI_API_KEY dans Supabase Dashboard → Settings → Edge Functions → Secrets ──
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

    if (!OPENAI_API_KEY) {
      // Mode dev : retourne un mock réaliste
      return new Response(JSON.stringify({
        make: 'Volkswagen', model: 'Golf', trim: 'GTI Mk7',
        year: '2019', color: 'Blanc Pur', category: 'Hot hatch',
      }), { headers: { ...CORS, 'Content-Type': 'application/json' } })
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 150,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Identifie le véhicule dans cette photo.
Réponds UNIQUEMENT en JSON valide, sans markdown, sans explication :
{"make":"...","model":"...","trim":"...","year":"...","color":"...","category":"..."}
- make : marque (ex: Volkswagen, Renault, Toyota)
- model : modèle (ex: Golf, Clio, Supra)
- trim : finition / génération (ex: GTI Mk7, RS 200, Type R)
- year : année approximative (ex: 2019)
- color : couleur perçue en français (ex: Blanc Nacré, Noir Métallisé)
- category : type (ex: Hot hatch, Berline sport, Coupé, SUV, Moto, Scooter)
Si pas de véhicule visible, utilise {"make":"Inconnu","model":"","trim":"","year":"","color":"","category":"Voiture"}.`,
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl, detail: 'low' },
            },
          ],
        }],
      }),
    })

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content ?? '{}'

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    const vehicle = jsonMatch
      ? JSON.parse(jsonMatch[0])
      : { make: 'Véhicule', model: 'Détecté', trim: '', year: '', color: '', category: 'Voiture' }

    return new Response(JSON.stringify(vehicle), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})

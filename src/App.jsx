import { useState, useRef, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'

// ══════════════════════════════════════════════════════════════════
//  DATA
// ══════════════════════════════════════════════════════════════════

const STEPS = [
  {
    num: '01',
    title: 'IMPORTE TA PHOTO',
    desc: 'Une photo de face ou 3/4 de ta caisse suffit. Bonne lumière, bon angle — et c\'est parti.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="10" width="24" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M16 4V22M16 4L11 9M16 4L21 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 14H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    num: '02',
    title: 'CHOISIS TON STYLE',
    desc: 'Couleur, covering, jantes, kit carrosserie, aileron — tu choisis ce que tu veux tester, modif par modif.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="10" cy="16" r="5" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="22" cy="10" r="5" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="22" cy="22" r="5" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="14" y1="14" x2="18" y2="12" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="14" y1="18" x2="18" y2="20" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    num: '03',
    title: 'REÇOIS TON RENDU HD',
    desc: 'En quelques secondes, ton rendu est prêt. Télécharge-le, partage-le, montre-le au carrossier.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="4" width="24" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M16 28V22M16 28L11 23M16 28L21 23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 10L14 14L18 11L23 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

const SHOWCASE = [
  { id: 'RL-001', cat: 'VOITURE', before: '#68696E', after: '#C41C1C', mod: 'COVERING ROUGE SATINÉ',   sub: 'Hot hatch · Coupé sportif' },
  { id: 'RL-002', cat: 'VOITURE', before: '#1C1B18', after: '#F5C518', mod: 'PEINTURE JAUNE SPORT',    sub: 'Berline · GTI · RS' },
  { id: 'RL-003', cat: 'MOTO',    before: '#D6D4CC', after: '#111111', mod: 'COVERING CARBONE MAT',    sub: 'Sportive · Supersport' },
  { id: 'RL-004', cat: 'VOITURE', before: '#98A0A8', after: '#2F4C6B', mod: 'JANTES 18" ANTHRACITE',   sub: 'Stance · JDM · Euro' },
  { id: 'RL-005', cat: 'SCOOT',   before: '#7A7570', after: '#7C3AED', mod: 'VINYLE BORDEAUX MAT',     sub: 'Maxi-scoot · 125 custom' },
  { id: 'RL-006', cat: 'MOTO',    before: '#3E3C38', after: '#E86B1A', mod: 'KIT DÉCO COMPÉTITION',    sub: 'Naked · Streetfighter' },
]

// ══════════════════════════════════════════════════════════════════
//  SVG CAR — profil générique 3/4 hatchback sportif, aucune marque
// ══════════════════════════════════════════════════════════════════

function CarSVG({ bodyColor = '#5A554A', rimColor = '#3A3830', accent = false, className = '' }) {
  const spokes = [0, 60, 120, 180, 240, 300]
  const s = (cx, cy, a) => {
    const r = (a * Math.PI) / 180
    return { x1: cx + Math.cos(r) * 10, y1: cy + Math.sin(r) * 10, x2: cx + Math.cos(r) * 26, y2: cy + Math.sin(r) * 26 }
  }
  return (
    <svg viewBox="0 0 545 215" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Shadow au sol */}
      <ellipse cx="270" cy="207" rx="218" ry="6" fill="rgba(0,0,0,0.30)" />

      {/* Carrosserie principale */}
      <path
        d="M 58,175 L 58,148 L 72,128 L 158,88 L 188,76 L 210,34 L 370,27 L 412,50 L 440,86 L 455,108 L 468,138 L 474,175 L 455,175 A 35,35 0 0 0 385,175 L 175,175 A 35,35 0 0 0 105,175 L 58,175 Z"
        fill={bodyColor}
        stroke="#0C0B08"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Bande latérale basse */}
      <path d="M 72,148 L 468,148 L 468,155 L 72,155 Z" fill="rgba(0,0,0,0.14)" />

      {/* Pare-brise */}
      <path d="M 190,74 L 213,34 L 298,28 L 296,72 Z" fill="#162535" stroke="#0C0B08" strokeWidth="1.5" opacity="0.92" />

      {/* Vitre arrière */}
      <path d="M 299,28 L 370,27 L 410,49 L 438,85 L 300,72 Z" fill="#162535" stroke="#0C0B08" strokeWidth="1.5" opacity="0.92" />

      {/* Montant B */}
      <line x1="297" y1="72" x2="299" y2="150" stroke="#0C0B08" strokeWidth="2" />

      {/* Aileron arrière */}
      <path d="M 408,27 L 412,18 L 450,18 L 454,27 Z" fill={bodyColor} stroke="#0C0B08" strokeWidth="1.5" />
      <line x1="412" y1="22" x2="450" y2="22" stroke="#0C0B08" strokeWidth="1" opacity="0.5" />

      {/* Rétroviseur */}
      <path d="M 408,55 L 430,51 L 433,63 L 408,66 Z" fill={bodyColor} stroke="#0C0B08" strokeWidth="1" />

      {/* Phare avant */}
      <path d="M 60,148 L 80,144 L 84,164 L 62,166 Z" fill={accent ? '#FEFCD0' : '#ADAA7A'} stroke="#0C0B08" strokeWidth="1" />
      <rect x="62" y="156" width="13" height="5" rx="1" fill="#0C0B08" opacity="0.65" />

      {/* Feu arrière */}
      <rect x="467" y="137" width="9" height="29" rx="1.5" fill={accent ? '#FF3311' : '#882200'} stroke="#0C0B08" strokeWidth="1" />

      {/* Roue avant */}
      <circle cx="140" cy="175" r="35" fill="#0D0C09" stroke="#2A2820" strokeWidth="2" />
      <circle cx="140" cy="175" r="23" fill={rimColor} stroke="#777" strokeWidth="1.5" />
      <circle cx="140" cy="175" r="8"  fill="#0D0C09" />
      {spokes.map(a => { const sp = s(140, 175, a); return <line key={a} {...sp} stroke={accent ? '#B0AFA8' : '#555'} strokeWidth="2.5" /> })}

      {/* Roue arrière */}
      <circle cx="420" cy="175" r="35" fill="#0D0C09" stroke="#2A2820" strokeWidth="2" />
      <circle cx="420" cy="175" r="23" fill={rimColor} stroke="#777" strokeWidth="1.5" />
      <circle cx="420" cy="175" r="8"  fill="#0D0C09" />
      {spokes.map(a => { const sp = s(420, 175, a); return <line key={a} {...sp} stroke={accent ? '#B0AFA8' : '#555'} strokeWidth="2.5" /> })}
    </svg>
  )
}

// ══════════════════════════════════════════════════════════════════
//  ICONS — pour les patches "Pour qui"
// ══════════════════════════════════════════════════════════════════

function IconCar({ size = 44 }) {
  return (
    <svg width={size} height={size * 0.45} viewBox="0 0 44 20" fill="none">
      <path d="M2,16 L2,11 L7,5 L30,5 L36,10 L42,10 L42,16 L37,16 A5,5 0 0 0 27,16 L15,16 A5,5 0 0 0 5,16 Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.12" />
      <circle cx="10" cy="16" r="4"  stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="32" cy="16" r="4"  stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M7,11 L14,6 L26,6" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function IconMoto({ size = 44 }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 44 26" fill="none">
      <circle cx="8"  cy="20" r="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="36" cy="20" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8,20 L16,10 L24,8 L32,14 L36,20" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M24,8 L28,4 L32,5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16,10 L24,8 L28,13 L20,14 Z" fill="currentColor" fillOpacity="0.15" />
    </svg>
  )
}

function IconScoot({ size = 44 }) {
  return (
    <svg width={size} height={size * 0.55} viewBox="0 0 44 24" fill="none">
      <circle cx="8"  cy="18" r="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="36" cy="18" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8,18 L16,9 L22,7 L30,7 L34,14 L36,18" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M16,9 L18,4 L22,3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="22" y="15" width="12" height="3" rx="1" fill="currentColor" fillOpacity="0.25" />
    </svg>
  )
}

// ══════════════════════════════════════════════════════════════════
//  CARTE GRISE — faux certificat d'immatriculation
// ══════════════════════════════════════════════════════════════════

function CarteGrise() {
  return (
    <div className="bg-carte-grise text-noir-atelier border border-acier rounded-sm p-4 w-64 shadow-xl">
      {/* En-tête */}
      <div className="flex justify-between items-start border-b border-acier/40 pb-2 mb-3">
        <div>
          <p className="font-mono text-[9px] text-bleu-grise tracking-widest font-medium">CERTIFICAT D'IMMATRICULATION</p>
          <p className="font-mono text-[8px] text-texte-muted mt-0.5">REPUBLIQUE FRANÇAISE</p>
        </div>
        <div className="font-display text-sm text-noir-atelier/50 tracking-widest">RELOOK<span className="text-jaune-securite">.</span></div>
      </div>

      {/* Champs */}
      <div className="space-y-2.5">
        {[
          { code: 'A', label: 'N° DOSSIER',   value: 'REL–2024–7734' },
          { code: 'D.1', label: 'MARQUE',      value: '—————————' },
          { code: 'D.3', label: 'MODÈLE',      value: '—————————' },
          { code: 'J.1', label: 'GENRE',       value: 'PASSION AUTO' },
        ].map(f => (
          <div key={f.code} className="flex gap-2.5">
            <span className="font-mono text-[9px] font-medium text-bleu-grise w-6 shrink-0 mt-0.5">{f.code}</span>
            <div>
              <p className="font-mono text-[8px] text-texte-muted leading-none">{f.label}</p>
              <p className="font-mono text-[11px] font-medium text-noir-atelier tracking-wider leading-snug">{f.value}</p>
            </div>
          </div>
        ))}

        {/* Statut */}
        <div className="flex gap-2.5 pt-2 border-t border-acier/30">
          <span className="font-mono text-[9px] font-medium text-bleu-grise w-6 shrink-0 mt-0.5">ST.</span>
          <div>
            <p className="font-mono text-[8px] text-texte-muted leading-none">STATUT</p>
            <p className="font-mono text-[11px] font-medium text-bleu-grise tracking-wider leading-snug flex items-center gap-1.5">
              EN ATTENTE DE STYLE
              <span className="inline-block w-2 h-2 rounded-full bg-jaune-securite animate-pulse shrink-0" />
            </p>
          </div>
        </div>
      </div>

      {/* Pseudo-code barre */}
      <div className="mt-3 pt-2.5 border-t border-acier/30 flex gap-[2px] items-end">
        {Array.from({ length: 36 }, (_, i) => (
          <div
            key={i}
            className="bg-noir-atelier/70 rounded-[1px]"
            style={{ width: i % 4 === 0 ? '3px' : i % 7 === 0 ? '4px' : '1.5px', height: i % 3 === 0 ? '20px' : '14px' }}
          />
        ))}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
//  HERO SLIDER — drag-to-reveal avant / après
// ══════════════════════════════════════════════════════════════════

function HeroSlider() {
  const [pos, setPos] = useState(40)
  const [dragging, setDragging] = useState(false)
  const ref = useRef(null)

  const clamp = (v) => Math.max(3, Math.min(97, v))

  const update = useCallback((clientX) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    setPos(clamp(((clientX - r.left) / r.width) * 100))
  }, [])

  useEffect(() => {
    const move  = (e) => { if (dragging) update(e.clientX) }
    const mTouch = (e) => { if (dragging) { e.preventDefault(); update(e.touches[0].clientX) } }
    const up    = () => setDragging(false)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    window.addEventListener('touchmove', mTouch, { passive: false })
    window.addEventListener('touchend', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
      window.removeEventListener('touchmove', mTouch)
      window.removeEventListener('touchend', up)
    }
  }, [dragging, update])

  return (
    <div
      ref={ref}
      className="relative overflow-hidden border border-acier rounded-sm bg-[#1A190E] select-none"
      style={{ cursor: 'col-resize' }}
      onMouseDown={(e) => { e.preventDefault(); setDragging(true); update(e.clientX) }}
      onTouchStart={(e) => { setDragging(true); update(e.touches[0].clientX) }}
    >
      {/* Ratio box matching viewBox 545×215 */}
      <div className="relative w-full" style={{ paddingBottom: '39.45%' }}>

        {/* ── APRÈS (voiture colorée) ── */}
        <CarSVG
          bodyColor="#F5C518"
          rimColor="#2F4C6B"
          accent={true}
          className="absolute inset-0 w-full h-full"
        />

        {/* ── AVANT (voiture grise) — clippath depuis la droite ── */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          <CarSVG
            bodyColor="#4E4C45"
            rimColor="#3A3830"
            accent={false}
            className="absolute inset-0 w-full h-full"
          />
          <span className="absolute top-3 left-3 font-mono text-[10px] text-texte-muted tracking-widest bg-noir-atelier/70 px-2 py-0.5 rounded-sm">
            AVANT
          </span>
        </div>

        {/* Label APRÈS */}
        <span className="absolute top-3 right-3 font-mono text-[10px] text-jaune-securite tracking-widest bg-noir-atelier/70 px-2 py-0.5 rounded-sm">
          APRÈS
        </span>

        {/* ── Poignée du slider ── */}
        <div
          className="absolute top-0 bottom-0 z-10 flex items-center"
          style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
        >
          <div className="w-px h-full bg-jaune-securite opacity-90" />
          <button
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-jaune-securite border-2 border-noir-atelier flex items-center justify-center shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label="Glisser pour comparer avant et après"
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft')  setPos(p => clamp(p - 4))
              if (e.key === 'ArrowRight') setPos(p => clamp(p + 4))
            }}
          >
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
              <path d="M1 5H13M1 5L4 2M1 5L4 8M13 5L10 2M13 5L10 8" stroke="#15140F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Hint */}
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-[9px] text-texte-muted/50 whitespace-nowrap pointer-events-none">
          ← GLISSE POUR COMPARER →
        </span>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
//  AUTH FORM — inscription / connexion
// ══════════════════════════════════════════════════════════════════

function AuthForm({ className = '', onSuccess }) {
  const [mode, setMode]     = useState('signup') // 'signup' | 'login'
  const [email, setEmail]   = useState('')
  const [password, setPass] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error | confirm-email
  const [errMsg, setErrMsg] = useState('')

  const isSignup = mode === 'signup'

  const switchMode = (next) => { setMode(next); setStatus('idle'); setErrMsg('') }

  const friendlyError = (msg = '') => {
    const m = msg.toLowerCase()
    if (m.includes('already registered') || m.includes('already been registered') || m.includes('email address is already')) return 'Cet email est déjà utilisé — connecte-toi plutôt.'
    if (m.includes('invalid login') || m.includes('invalid credentials') || m.includes('email not confirmed')) return 'Email ou mot de passe incorrect.'
    if (m.includes('password') && m.includes('short')) return 'Mot de passe trop court (minimum 6 caractères).'
    if (m.includes('rate limit') || m.includes('too many')) return 'Trop de tentatives — attends quelques secondes.'
    if (m.includes('invalid email')) return 'Adresse email invalide.'
    return 'Une erreur est survenue — réessaie.'
  }

  const submit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setErrMsg('')
    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (data.user && !data.session) {
          setStatus('confirm-email')
          return
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
      setStatus('success')
    } catch (err) {
      console.error('[RELOOK] Auth error:', err.message)
      setErrMsg(friendlyError(err.message))
      setStatus('error')
    }
  }

  if (status === 'confirm-email') {
    return (
      <div className={`flex items-start gap-3 px-4 py-3 border border-jaune-securite/50 rounded-sm bg-jaune-securite/5 ${className}`}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 mt-0.5 text-jaune-securite">
          <rect x="2" y="5" width="16" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M2 8L10 13L18 8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
        <div>
          <p className="font-display text-xl text-jaune-securite leading-none">VÉRIFIE TON EMAIL.</p>
          <p className="font-mono text-xs text-texte-muted mt-0.5">
            Un lien de confirmation a été envoyé à <span className="text-carte-grise">{email}</span>. Clique dessus pour activer ton compte.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className={`flex items-center gap-3 px-4 py-3 border border-jaune-securite rounded-sm bg-jaune-securite/10 ${className}`}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
          <circle cx="10" cy="10" r="9" stroke="#F5C518" strokeWidth="1.5" />
          <path d="M5.5 10.5L8.5 13.5L14.5 7.5" stroke="#F5C518" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div>
          <p className="font-display text-xl text-jaune-securite leading-none">
            {isSignup ? 'COMPTE CRÉÉ.' : 'CONNEXION RÉUSSIE.'}
          </p>
          <p className="font-mono text-xs text-texte-muted mt-0.5">
            {isSignup
              ? 'Bienvenue dans l\'atelier. Ton premier rendu t\'attend →'
              : 'Bon retour. Ton espace t\'attend →'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <form onSubmit={submit} className="flex flex-col gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ton@adresse.com"
          required
          disabled={status === 'loading'}
          aria-label="Adresse email"
          className="w-full bg-acier border border-acier text-carte-grise placeholder-texte-muted focus:border-jaune-securite focus:bg-[#2A2820] outline-none transition-colors px-4 py-3 font-mono text-sm rounded-sm disabled:opacity-50"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPass(e.target.value)}
          placeholder={isSignup ? 'choisis un mot de passe' : 'ton mot de passe'}
          required
          minLength={8}
          disabled={status === 'loading'}
          aria-label="Mot de passe"
          className="w-full bg-acier border border-acier text-carte-grise placeholder-texte-muted focus:border-jaune-securite focus:bg-[#2A2820] outline-none transition-colors px-4 py-3 font-mono text-sm rounded-sm disabled:opacity-50"
        />
        {errMsg && (
          <p className="font-mono text-xs text-red-400 px-1 -mt-1">{errMsg}</p>
        )}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-jaune-securite text-noir-atelier font-display text-lg tracking-wider px-6 py-3 rounded-sm hover:bg-[#E4B610] transition-all active:scale-[0.98] disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jaune-securite"
        >
          {status === 'loading' ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
              </svg>
              EN COURS…
            </span>
          ) : isSignup ? (
            'CRÉER MON COMPTE →'
          ) : (
            'ME CONNECTER →'
          )}
        </button>
      </form>

      {/* Toggle signup ↔ login */}
      <p className="font-mono text-xs text-texte-muted mt-3">
        {isSignup ? (
          <>Déjà un compte ?{' '}
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="text-carte-grise underline underline-offset-2 hover:text-jaune-securite transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-jaune-securite rounded-sm"
            >
              Se connecter →
            </button>
          </>
        ) : (
          <>Pas encore inscrit ?{' '}
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className="text-carte-grise underline underline-offset-2 hover:text-jaune-securite transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-jaune-securite rounded-sm"
            >
              Créer un compte →
            </button>
          </>
        )}
      </p>

      {status === 'error' && (
        <p className="font-mono text-xs text-red-400 mt-2">
          {isSignup ? 'Email déjà utilisé ou mot de passe trop court.' : 'Email ou mot de passe incorrect.'}{' '}Réessaie.
        </p>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
//  HEADER
// ══════════════════════════════════════════════════════════════════

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-noir-atelier/96 backdrop-blur-sm border-b border-acier">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <a
          href="#"
          className="font-display text-2xl sm:text-3xl text-carte-grise tracking-wider shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-jaune-securite focus-visible:outline-offset-2 rounded-sm"
        >
          RELOOK<span className="text-jaune-securite">.</span>
        </a>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { href: '#pour-qui', label: 'POUR QUI' },
            { href: '#comment',  label: 'COMMENT ÇA MARCHE' },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="font-mono text-xs text-texte-muted hover:text-carte-grise transition-colors tracking-widest focus-visible:outline focus-visible:outline-2 focus-visible:outline-jaune-securite focus-visible:outline-offset-2 rounded-sm"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <a
          href="#inscription"
          className="bg-jaune-securite text-noir-atelier font-display text-base sm:text-lg tracking-wider px-4 sm:px-5 py-2 rounded-sm hover:bg-[#E4B610] transition-colors shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
        >
          S'INSCRIRE
        </a>
      </div>
    </header>
  )
}

// ══════════════════════════════════════════════════════════════════
//  SECTION HERO
// ══════════════════════════════════════════════════════════════════

function HeroSection({ onAuth }) {
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 grid-bg overflow-hidden">
      {/* Bande jaune diagonale décorative (coin haut gauche) */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 opacity-[0.04] pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(-45deg, #F5C518 0px, #F5C518 12px, transparent 12px, transparent 24px)',
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Colonne gauche — texte + form */}
          <div className="animate-fade-slide-up">
            <div className="inline-flex items-center gap-2 border border-acier px-3 py-1 rounded-sm mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-jaune-securite animate-pulse" />
              <span className="font-mono text-[11px] text-texte-muted tracking-widest">ACCÈS GRATUIT — INSCRIPTION OUVERTE</span>
            </div>

            <h1 className="font-display text-[clamp(3rem,8vw,5.5rem)] text-carte-grise leading-[0.9] mb-6">
              VOIS TA CAISSE<br />
              AVANT DE LA<br />
              <span className="text-jaune-securite">TRANSFORMER</span>
            </h1>

            <p className="font-body text-texte-muted text-lg mb-8 max-w-md leading-relaxed">
              Peinture, covering, jantes, kit carrosserie — visualise tout en quelques secondes sur ta propre bagnole. Sans toucher à rien.
            </p>

            <AuthForm className="mb-4" onSuccess={onAuth} />

            {/* Preuve sociale */}
            <div className="flex items-center gap-2 font-mono text-xs text-texte-muted mt-4">
              <span className="text-jaune-securite text-base leading-none">●</span>
              <span><span className="text-carte-grise font-medium">1 247</span> passionnés déjà inscrits</span>
              <span className="text-acier">·</span>
              <span>Gratuit, toujours</span>
            </div>
          </div>

          {/* Colonne droite — carte grise + slider */}
          <div
            className="flex flex-col gap-5 animate-fade-slide-up"
            style={{ animationDelay: '0.15s' }}
          >
            {/* Carte grise positionnée en haut à droite */}
            <div className="flex justify-end">
              <div className="rotate-1">
                <CarteGrise />
              </div>
            </div>

            {/* Slider interactif */}
            <HeroSlider />
          </div>
        </div>
      </div>
    </section>
  )
}

// ══════════════════════════════════════════════════════════════════
//  SECTION POUR QUI — patches / badges
// ══════════════════════════════════════════════════════════════════

function PourQuiSection() {
  const patches = [
    {
      icon: <IconCar size={52} />,
      title: 'VOITURE',
      subtitle: 'De la GTI au JDM, du circuit à la rue',
      tags: ['GTI', 'RS', 'JDM', 'DRIFT', 'STANCE', 'RALLYE'],
      borderColor: 'border-jaune-securite',
      textColor: 'text-jaune-securite',
      bgColor: 'bg-jaune-securite/5',
    },
    {
      icon: <IconMoto size={52} />,
      title: 'MOTO',
      subtitle: 'Sportive, naked, streetfighter — tout y passe',
      tags: ['SUPERSPORT', 'NAKED', 'STREETFIGHTER', 'ROADSTER'],
      borderColor: 'border-bleu-grise',
      textColor: 'text-bleu-grise',
      bgColor: 'bg-bleu-grise/5',
    },
    {
      icon: <IconScoot size={52} />,
      title: 'SCOOT',
      subtitle: 'Le 50 ou le 125, custom ou pas encore',
      tags: ['50CC', '125CC', 'MAXI-SCOOT', 'CUSTOM'],
      borderColor: 'border-carte-grise/30',
      textColor: 'text-carte-grise',
      bgColor: 'bg-carte-grise/3',
    },
  ]

  return (
    <section id="pour-qui" className="py-24 bg-[#100F0A]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* En-tête de section */}
        <div className="flex items-center gap-4 mb-12">
          <div className="h-px flex-1 bg-acier" />
          <span className="font-mono text-[10px] text-texte-muted tracking-widest px-3 py-1 border border-acier/50 rounded-sm shrink-0">
            REF: RL-CIBLES-001
          </span>
          <div className="h-px flex-1 bg-acier" />
        </div>

        <div className="text-center mb-12">
          <p className="font-mono text-xs text-jaune-securite tracking-widest mb-3">POUR QUI C'EST FAIT</p>
          <h2 className="font-display text-5xl md:text-6xl text-carte-grise leading-none">
            T'AS UNE BAGNOLE, UNE MOTO,<br className="hidden md:block" /> OU UN SCOOT ?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {patches.map((p) => (
            <div
              key={p.title}
              className={`relative border-2 ${p.borderColor} ${p.bgColor} p-8 rounded-sm text-center`}
            >
              {/* Double bordure effet patch */}
              <div className={`absolute inset-2 border ${p.borderColor} opacity-20 rounded-sm pointer-events-none`} />

              {/* Coins décoratifs */}
              {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map((pos, i) => (
                <div
                  key={i}
                  className={`absolute ${pos} w-3 h-3 ${p.borderColor} border-2 rounded-[1px]`}
                  style={{
                    borderRight:   i < 2 && i !== 0 ? undefined : 'none',
                    borderBottom:  i >= 2 ? undefined : 'none',
                    borderLeft:    i === 0 || i === 2 ? undefined : 'none',
                    borderTop:     i >= 2 ? 'none' : undefined,
                    border: 'none',
                  }}
                />
              ))}
              {/* Coins simplifiés */}
              <div className={`absolute top-3 left-3 w-3 h-3 border-l-2 border-t-2 ${p.borderColor} opacity-60`} />
              <div className={`absolute top-3 right-3 w-3 h-3 border-r-2 border-t-2 ${p.borderColor} opacity-60`} />
              <div className={`absolute bottom-3 left-3 w-3 h-3 border-l-2 border-b-2 ${p.borderColor} opacity-60`} />
              <div className={`absolute bottom-3 right-3 w-3 h-3 border-r-2 border-b-2 ${p.borderColor} opacity-60`} />

              <div className={`relative z-10 ${p.textColor} mb-4 flex justify-center`}>
                {p.icon}
              </div>
              <h3 className={`font-display text-5xl ${p.textColor} leading-none mb-2`}>{p.title}</h3>
              <p className="font-body text-sm text-texte-muted mb-5 leading-snug">{p.subtitle}</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {p.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`font-mono text-[9px] border ${p.borderColor} ${p.textColor} opacity-60 px-2 py-0.5 rounded-sm tracking-wider`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ══════════════════════════════════════════════════════════════════
//  SECTION COMMENT ÇA MARCHE — ordre de travail de garage
// ══════════════════════════════════════════════════════════════════

function CommentCaMarcheSection() {
  return (
    <section id="comment" className="py-24 bg-noir-atelier grid-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        <div className="text-center mb-12">
          <p className="font-mono text-xs text-jaune-securite tracking-widest mb-3">COMMENT ÇA MARCHE</p>
          <h2 className="font-display text-5xl md:text-6xl text-carte-grise leading-none">EN TROIS ÉTAPES</h2>
        </div>

        {/* Ordre de travail */}
        <div className="border border-acier rounded-sm overflow-hidden">

          {/* En-tête du bon de travail */}
          <div className="border-b border-acier px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 bg-[#0F0E09]">
            <div className="flex items-center gap-4">
              <span className="font-display text-xl text-carte-grise tracking-widest">ORDRE DE TRAVAIL</span>
              <div className="hidden sm:block h-4 w-px bg-acier" />
              <span className="font-mono text-xs text-texte-muted">ATELIER RELOOK.</span>
            </div>
            <span className="font-mono text-xs text-texte-muted tracking-wider">REF: RL-PROCESS-001</span>
          </div>

          {/* Étapes */}
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className={`px-6 py-8 flex gap-6 items-start ${i < STEPS.length - 1 ? 'border-b border-acier/50' : ''}`}
            >
              {/* Numéro d'étape */}
              <div className="shrink-0 flex flex-col items-center gap-1 pt-1">
                <span className="font-display text-5xl text-jaune-securite leading-none">{step.num}</span>
                <div className="w-px flex-1 bg-acier/40 min-h-[20px]" />
              </div>

              {/* Icône */}
              <div className="shrink-0 w-9 h-9 flex items-center justify-center text-texte-muted mt-1">
                {step.icon}
              </div>

              {/* Contenu */}
              <div className="flex-1">
                <h3 className="font-display text-3xl text-carte-grise mb-2 leading-none">{step.title}</h3>
                <p className="font-body text-texte-muted text-base leading-relaxed">{step.desc}</p>
              </div>

              {/* Stub ticket (desktop) */}
              <div className="hidden sm:flex shrink-0 flex-col items-center justify-center w-16 h-16 border border-acier/40 rounded-sm bg-[#0F0E09]">
                <span className="font-mono text-[8px] text-texte-muted/50 tracking-widest">ÉTAPE</span>
                <span className="font-display text-3xl text-acier leading-none">{step.num}</span>
              </div>
            </div>
          ))}

          {/* Pied du bon de travail */}
          <div className="border-t border-acier px-6 py-3 bg-[#0F0E09] flex justify-between items-center">
            <span className="font-mono text-[10px] text-texte-muted/50 tracking-wider">DURÉE ESTIMÉE : &lt; 30 SECONDES</span>
            <span className="font-mono text-[10px] text-texte-muted/50 tracking-wider">RÉSULTAT : RENDU HD</span>
          </div>
        </div>
      </div>
    </section>
  )
}

// ══════════════════════════════════════════════════════════════════
//  SECTION SHOWCASE — fiches avant/après façon ticket de garage
// ══════════════════════════════════════════════════════════════════

function ShowcaseSection() {
  return (
    <section className="py-24 bg-[#100F0A]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        <div className="flex items-center gap-4 mb-12">
          <div className="h-px flex-1 bg-acier" />
          <span className="font-mono text-[10px] text-texte-muted tracking-widest px-3 py-1 border border-acier/50 rounded-sm shrink-0">
            REF: RL-EXEMPLES-001
          </span>
          <div className="h-px flex-1 bg-acier" />
        </div>

        <div className="text-center mb-12">
          <p className="font-mono text-xs text-jaune-securite tracking-widest mb-3">CE QUE TU PEUX FAIRE</p>
          <h2 className="font-display text-5xl md:text-6xl text-carte-grise leading-none">
            DES TRANSFORMATIONS AVANT DE SIGNER
          </h2>
          <p className="font-body text-texte-muted mt-4 max-w-xl mx-auto">
            Quelques exemples de what's possible. Les vraies, avec ta photo, en quelques secondes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SHOWCASE.map((item, i) => (
            <ShowcaseCard key={item.id} item={item} delay={i * 60} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ShowcaseCard({ item }) {
  return (
    <div className="relative bg-carte-grise text-noir-atelier rounded-sm overflow-hidden shadow-lg">
      {/* Washi tape en haut */}
      <div
        className="absolute -top-1 left-1/4 w-1/2 h-3.5 rounded-sm opacity-70 z-10"
        style={{
          background: item.cat === 'VOITURE' ? '#F5C518' : item.cat === 'MOTO' ? '#2F4C6B' : '#9C9788',
          transform: `rotate(${item.id.endsWith('1') ? '-0.8' : item.id.endsWith('3') ? '0.6' : item.id.endsWith('5') ? '-0.4' : '0.9'}deg)`,
        }}
      />

      <div className="p-4 pt-5">
        {/* En-tête ticket */}
        <div className="flex justify-between items-center border-b border-acier/20 pb-2 mb-3">
          <span className="font-mono text-[10px] text-texte-muted tracking-wider">#{item.id}</span>
          <span
            className="font-mono text-[9px] font-medium tracking-widest px-1.5 py-0.5 rounded-sm"
            style={{
              background: item.cat === 'VOITURE' ? 'rgba(245,197,24,0.15)' : item.cat === 'MOTO' ? 'rgba(47,76,107,0.15)' : 'rgba(156,151,136,0.15)',
              color: item.cat === 'VOITURE' ? '#7A6000' : item.cat === 'MOTO' ? '#2F4C6B' : '#5A5650',
            }}
          >
            {item.cat}
          </span>
        </div>

        {/* Swatches avant / après */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="h-14 rounded-sm border border-acier/15" style={{ background: item.before }} />
            <span className="font-mono text-[9px] text-center text-texte-muted">AVANT</span>
          </div>
          <div className="flex items-start pt-4 text-acier/50">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="h-14 rounded-sm border border-acier/15" style={{ background: item.after }} />
            <span className="font-mono text-[9px] text-center text-texte-muted">APRÈS</span>
          </div>
        </div>

        {/* Modification */}
        <h4 className="font-display text-xl text-noir-atelier leading-tight mb-0.5">{item.mod}</h4>
        <p className="font-mono text-[10px] text-texte-muted">{item.sub}</p>
      </div>

      {/* Coin plié (dog-ear) */}
      <div
        className="absolute bottom-0 right-0 w-7 h-7"
        style={{ background: 'linear-gradient(225deg, #3A3830 50%, #ECE6D6 50%)' }}
      />
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
//  SECTION CTA FINAL — bandes chantier + formulaire
// ══════════════════════════════════════════════════════════════════

function FinalCTASection({ onAuth }) {
  return (
    <section id="inscription" className="relative py-28 overflow-hidden bg-noir-atelier">
      {/* Bandes chantier en fond, très atténuées */}
      <div className="absolute inset-0 hazard-stripes opacity-[0.06] pointer-events-none" />

      {/* Ligne jaune haute */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-jaune-securite" />

      {/* Ligne jaune basse */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-jaune-securite/40" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 border border-jaune-securite/30 px-3 py-1 rounded-sm mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-jaune-securite animate-pulse" />
          <span className="font-mono text-[11px] text-jaune-securite tracking-widest">INSCRIPTION GRATUITE — ACCÈS IMMÉDIAT</span>
        </div>

        <h2 className="font-display text-[clamp(2.8rem,8vw,5rem)] text-carte-grise leading-[0.92] mb-6">
          CRÉE TON COMPTE.<br />
          <span className="text-jaune-securite">TON PREMIER RENDU T'ATTEND.</span>
        </h2>

        <p className="font-body text-texte-muted text-lg mb-10 leading-relaxed">
          Inscription gratuite, accès immédiat. Tu upload une photo, tu choisis un style,
          le rendu arrive en quelques secondes. Aucune carte bancaire.
        </p>

        <AuthForm className="text-left max-w-md mx-auto" onSuccess={onAuth} />

        <div className="flex items-center justify-center gap-3 mt-6 font-mono text-xs text-texte-muted/60">
          <span>100% gratuit</span>
          <span className="text-acier">·</span>
          <span>Sans engagement</span>
          <span className="text-acier">·</span>
          <span>Suppression de compte en 1 clic</span>
        </div>
      </div>
    </section>
  )
}

// ══════════════════════════════════════════════════════════════════
//  FOOTER
// ══════════════════════════════════════════════════════════════════

function Footer() {
  return (
    <footer className="border-t border-acier bg-[#0C0B08] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <a href="#" className="font-display text-2xl text-carte-grise/35 tracking-wider hover:text-carte-grise/60 transition-colors">
          RELOOK<span className="text-jaune-securite/35">.</span>
        </a>

        <p className="font-mono text-xs text-texte-muted/50 text-center">
          © 2024 RELOOK. — Tous droits réservés.
        </p>

        <div className="flex items-center gap-5">
          {['INSTAGRAM', 'TIKTOK', 'DISCORD'].map((s) => (
            <a
              key={s}
              href="#"
              className="font-mono text-[10px] text-texte-muted/50 hover:text-carte-grise/60 transition-colors tracking-widest focus-visible:outline focus-visible:outline-2 focus-visible:outline-jaune-securite focus-visible:outline-offset-2 rounded-sm"
            >
              {s}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}

// ══════════════════════════════════════════════════════════════════
//  ONBOARDING — flow post-inscription / connexion
// ══════════════════════════════════════════════════════════════════

// ── Data ─────────────────────────────────────────────────────────

const DETECTED_VEHICLES = [
  { type: 'COMPACTE SPORTIVE', cat: 'HOT HATCH · 3 PORTES' },
  { type: 'BERLINE SPORT',     cat: 'SPORTIVE · 4 PORTES' },
  { type: 'COUPÉ',             cat: 'SPORT · 2 PORTES' },
  { type: 'COMPACTE',          cat: 'CITADINE TUNING' },
]

const MODIFS = [
  {
    id: 'peinture', title: 'PEINTURE', desc: 'Couleur carrosserie',
    icon: <svg viewBox="0 0 24 24" fill="none" width="28" height="28"><path d="M12 2C12 2 5 9 5 14a7 7 0 0 0 14 0C19 9 12 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M8.5 17a3.5 3.5 0 0 0 3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    options: [
      { label: 'Rouge Racing',  hex: '#C41C1C', bodyColor: '#C41C1C', rimColor: '#1A1A1A' },
      { label: 'Blanc Nacré',   hex: '#EEEDE6', bodyColor: '#EEEDE6', rimColor: '#1A1A1A' },
      { label: 'Bleu Nuit',     hex: '#1E3A5F', bodyColor: '#1E3A5F', rimColor: '#C0C0C0' },
      { label: 'Vert Forêt',    hex: '#1A4A2E', bodyColor: '#1A4A2E', rimColor: '#1A1A1A' },
      { label: 'Noir Mat',      hex: '#181818', bodyColor: '#181818', rimColor: '#F5C518' },
      { label: 'Orange Sport',  hex: '#E86B1A', bodyColor: '#E86B1A', rimColor: '#1A1A1A' },
      { label: 'Jaune Sécu',    hex: '#F5C518', bodyColor: '#F5C518', rimColor: '#2F4C6B' },
      { label: 'Bordeaux',      hex: '#7C1D2E', bodyColor: '#7C1D2E', rimColor: '#C0C0C0' },
    ],
  },
  {
    id: 'covering', title: 'COVERING', desc: 'Vinyle mat, satiné, chromé',
    icon: <svg viewBox="0 0 24 24" fill="none" width="28" height="28"><rect x="3" y="7" width="18" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><rect x="5" y="4" width="14" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.2" opacity="0.5"/><path d="M7 11h10M7 14h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    options: [
      { label: 'Rouge Satiné',   hex: '#B81818', bodyColor: '#B81818', rimColor: '#1A1A1A' },
      { label: 'Noir Mat',       hex: '#181818', bodyColor: '#181818', rimColor: '#F5C518' },
      { label: 'Blanc Glacier',  hex: '#E8E8E0', bodyColor: '#E8E8E0', rimColor: '#1A1A1A' },
      { label: 'Carbone Sombre', hex: '#2A2A2A', bodyColor: '#2A2A2A', rimColor: '#C0C0C0' },
      { label: 'Violet Chrome',  hex: '#5B2D8E', bodyColor: '#5B2D8E', rimColor: '#C0C0C0' },
      { label: 'Or Chromé',      hex: '#C9A84C', bodyColor: '#C9A84C', rimColor: '#1A1A1A' },
    ],
  },
  {
    id: 'jantes', title: 'JANTES', desc: 'Couleur & design de roues',
    icon: <svg viewBox="0 0 24 24" fill="none" width="28" height="28"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5"/>{[0,60,120,180,240,300].map(a=><line key={a} x1={12+Math.cos(a*Math.PI/180)*4} y1={12+Math.sin(a*Math.PI/180)*4} x2={12+Math.cos(a*Math.PI/180)*8} y2={12+Math.sin(a*Math.PI/180)*8} stroke="currentColor" strokeWidth="1.5"/>)}</svg>,
    options: [
      { label: 'Anthracite',     hex: '#2A2A2A', bodyColor: '#5A554A', rimColor: '#2A2A2A' },
      { label: 'Chrome Poli',    hex: '#D0D0D0', bodyColor: '#5A554A', rimColor: '#D0D0D0' },
      { label: 'Or Mat',         hex: '#C9A84C', bodyColor: '#5A554A', rimColor: '#C9A84C' },
      { label: 'Blanc Brillant', hex: '#ECECEC', bodyColor: '#5A554A', rimColor: '#ECECEC' },
      { label: 'Bleu Racing',    hex: '#2F4C6B', bodyColor: '#5A554A', rimColor: '#2F4C6B' },
      { label: 'Rouge Sport',    hex: '#C41C1C', bodyColor: '#5A554A', rimColor: '#C41C1C' },
    ],
  },
  {
    id: 'kit-carrosserie', title: 'KIT CARROSSERIE', desc: 'Spoilers, jupes latérales',
    icon: <svg viewBox="0 0 24 24" fill="none" width="28" height="28"><path d="M2 14L4 10L8 7H16L20 10L22 14" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M2 14H22V17H2Z" stroke="currentColor" strokeWidth="1.5"/><circle cx="7" cy="17" r="2" stroke="currentColor" strokeWidth="1.5"/><circle cx="17" cy="17" r="2" stroke="currentColor" strokeWidth="1.5"/></svg>,
    options: [
      { label: 'Noir Sport',    hex: '#1A1A1A', bodyColor: '#5A554A', rimColor: '#2A2A2A' },
      { label: 'Carbone Mat',   hex: '#2A2A2A', bodyColor: '#5A554A', rimColor: '#1A1A1A' },
      { label: 'Blanc Wide',    hex: '#EEEDE6', bodyColor: '#5A554A', rimColor: '#ECECEC' },
      { label: 'Rouge Racing',  hex: '#C41C1C', bodyColor: '#C41C1C', rimColor: '#2A2A2A' },
    ],
  },
  {
    id: 'aileron', title: 'AILERON', desc: 'Duck tail, GT wing...',
    icon: <svg viewBox="0 0 24 24" fill="none" width="28" height="28"><path d="M2 17C6 17 8 11 12 11C16 11 18 17 22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M8 17V12M16 17V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="2" y1="17" x2="22" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    options: [
      { label: 'Carbone',         hex: '#2A2A2A', bodyColor: '#5A554A', rimColor: '#2A2A2A' },
      { label: 'Blanc',           hex: '#EEEDE6', bodyColor: '#5A554A', rimColor: '#2A2A2A' },
      { label: 'Match carrosse',  hex: '#5A554A', bodyColor: '#5A554A', rimColor: '#2A2A2A' },
      { label: 'Rouge',           hex: '#C41C1C', bodyColor: '#5A554A', rimColor: '#2A2A2A' },
    ],
  },
  {
    id: 'pare-chocs', title: 'PARE-CHOCS', desc: 'Avant & arrière sport',
    icon: <svg viewBox="0 0 24 24" fill="none" width="28" height="28"><rect x="2" y="9" width="20" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/><line x1="7" y1="9" x2="7" y2="15" stroke="currentColor" strokeWidth="1.2" opacity="0.6"/><line x1="12" y1="9" x2="12" y2="15" stroke="currentColor" strokeWidth="1.2" opacity="0.6"/><line x1="17" y1="9" x2="17" y2="15" stroke="currentColor" strokeWidth="1.2" opacity="0.6"/><path d="M4 9V7M20 9V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    options: [
      { label: 'Sport Noir',   hex: '#1A1A1A', bodyColor: '#5A554A', rimColor: '#2A2A2A' },
      { label: 'Racing Blanc', hex: '#EEEDE6', bodyColor: '#5A554A', rimColor: '#2A2A2A' },
      { label: 'Carbone',      hex: '#2A2A2A', bodyColor: '#5A554A', rimColor: '#1A1A1A' },
    ],
  },
]

// ── Onboarding header ─────────────────────────────────────────────

function OnboardingHeader({ stepIdx, totalSteps, onBack, onExit }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-noir-atelier/95 backdrop-blur-sm border-b border-acier" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
        {onBack ? (
          <button
            onClick={onBack}
            className="font-mono text-xs text-texte-muted hover:text-carte-grise transition-colors flex items-center gap-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-jaune-securite rounded-sm min-h-[44px] min-w-[44px]"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            RETOUR
          </button>
        ) : (
          <div className="w-16" />
        )}

        {/* Progress bar */}
        <div className="flex-1 flex gap-1.5">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className="h-0.5 flex-1 rounded-full transition-all duration-500"
              style={{ background: i <= stepIdx ? '#F5C518' : '#3A3830' }}
            />
          ))}
        </div>

        <button
          onClick={onExit}
          className="font-display text-2xl text-carte-grise/30 hover:text-carte-grise/60 transition-colors leading-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-jaune-securite rounded-sm"
        >
          RELOOK<span className="text-jaune-securite/30">.</span>
        </button>
      </div>
    </div>
  )
}

// ── Step 1 : Bienvenue ────────────────────────────────────────────

function WelcomeStep({ userEmail, onNext }) {
  const COLORS = ['#F5C518', '#C41C1C', '#1E3A5F', '#E86B1A', '#1A4A2E', '#7C1D2E']
  const [ci, setCi] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const colorTimer = setInterval(() => setCi(i => (i + 1) % COLORS.length), 700)
    return () => clearInterval(colorTimer)
  }, [])

  useEffect(() => {
    const start = Date.now()
    const duration = 3000
    const frame = () => {
      const p = Math.min((Date.now() - start) / duration, 1)
      setProgress(p)
      if (p < 1) requestAnimationFrame(frame)
      else onNext()
    }
    const id = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(id)
  }, []) // eslint-disable-line

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 text-center" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 3.5rem)', paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
      {/* Car SVG animée */}
      <div className="w-full max-w-md mb-10 opacity-90">
        <CarSVG bodyColor={COLORS[ci]} rimColor="#2F4C6B" accent className="w-full transition-none" />
      </div>

      <div className="inline-flex items-center gap-2 border border-acier px-3 py-1 rounded-sm mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-jaune-securite animate-pulse" />
        <span className="font-mono text-[11px] text-texte-muted tracking-widest">
          {userEmail}
        </span>
      </div>

      <h1 className="font-display text-5xl sm:text-6xl md:text-7xl text-carte-grise leading-none mb-4">
        L'ATELIER<br />EST OUVERT.
      </h1>
      <p className="font-body text-texte-muted text-base sm:text-lg mb-10 max-w-sm">
        Prépare une photo de ta caisse.<br />On s'occupe du reste.
      </p>

      {/* Progress bar auto-avancement */}
      <div className="w-64 h-0.5 bg-acier rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-jaune-securite rounded-full transition-none"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <button
        onClick={onNext}
        className="w-full sm:w-auto font-display text-xl tracking-wider text-noir-atelier bg-jaune-securite px-8 py-4 min-h-[56px] rounded-sm hover:bg-[#E4B610] transition-colors active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jaune-securite"
      >
        LANCER MON PREMIER RENDU →
      </button>
      <p className="font-mono text-xs text-texte-muted/40 mt-3">ou attends 3 secondes</p>
    </div>
  )
}

// ── Step 2 : Upload photo ─────────────────────────────────────────

function UploadStep({ onNext, onBack, userId }) {
  const [dragOver, setDragOver]   = useState(false)
  const [preview, setPreview]     = useState(null)
  const [file, setFile]           = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState(null)
  const fileRef = useRef(null)

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(f)
  }

  const handleAnalyse = async () => {
    if (!file) return
    setUploading(true)
    setUploadErr(null)
    try {
      const ext  = file.name.split('.').pop() || 'jpg'
      const path = `${userId}/${Date.now()}.${ext}`
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(path, file, { contentType: file.type })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(data.path)
      onNext(publicUrl)
    } catch (err) {
      console.error('[RELOOK] Upload error:', err.message)
      setUploadErr('Erreur lors de l\'envoi. Réessaie.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] px-4 flex flex-col items-center justify-center" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 5rem)', paddingBottom: 'max(3rem, env(safe-area-inset-bottom))' }}>
      <div className="w-full max-w-xl">
        <p className="font-mono text-xs text-jaune-securite tracking-widest text-center mb-3">ÉTAPE 1 / 3</p>
        <h2 className="font-display text-5xl md:text-6xl text-carte-grise text-center leading-none mb-10">
          UPLOAD TA PHOTO
        </h2>

        {preview ? (
          /* Prévisualisation */
          <div className="border border-acier rounded-sm overflow-hidden mb-6">
            <img src={preview} alt="Ta voiture" className="w-full object-cover max-h-72" />
            <div className="flex justify-between items-center px-4 py-3 bg-[#0F0E09] border-t border-acier">
              <span className="font-mono text-xs text-jaune-securite flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/><path d="M4.5 7.5L6.5 9.5L9.5 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                PHOTO CHARGÉE
              </span>
              <button
                onClick={() => setPreview(null)}
                className="font-mono text-xs text-texte-muted hover:text-carte-grise transition-colors underline underline-offset-2"
              >
                Changer →
              </button>
            </div>
          </div>
        ) : (
          /* Zone drag & drop */
          <div
            className={`border-2 border-dashed rounded-sm p-12 text-center cursor-pointer transition-all mb-6 ${
              dragOver
                ? 'border-jaune-securite bg-jaune-securite/5'
                : 'border-acier hover:border-texte-muted'
            }`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
            role="button"
            tabIndex={0}
            aria-label="Zone de dépôt de photo"
            onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
            <svg className="mx-auto mb-4 text-texte-muted" width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="4" y="10" width="40" height="30" rx="3" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="17" cy="22" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M4 34L14 24L20 30L30 20L44 34" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M32 4V18M32 4L27 9M32 4L37 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="font-display text-2xl text-carte-grise mb-1">GLISSE TA PHOTO ICI</p>
            <p className="font-mono text-xs text-texte-muted mb-4">ou clique pour sélectionner</p>
            <span className="font-mono text-[10px] text-texte-muted/50 border border-acier/40 px-3 py-1 rounded-sm">
              JPG · PNG · HEIC — max 20 Mo
            </span>
          </div>
        )}

        {/* Tips */}
        <div className="border border-acier/40 rounded-sm overflow-hidden mb-8">
          <div className="px-4 py-2 bg-[#0F0E09] border-b border-acier/40">
            <span className="font-mono text-[10px] text-texte-muted tracking-widest">3 CONSEILS POUR UN BON RENDU</span>
          </div>
          <div className="grid grid-cols-3 divide-x divide-acier/30">
            {[
              { num: '01', tip: 'Photo de profil ou 3/4' },
              { num: '02', tip: 'Voiture entière visible' },
              { num: '03', tip: 'Bonne lumière, sans contre-jour' },
            ].map(({ num, tip }) => (
              <div key={num} className="px-4 py-3 text-center">
                <p className="font-display text-2xl text-jaune-securite leading-none mb-1">{num}</p>
                <p className="font-mono text-[10px] text-texte-muted leading-snug">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {uploadErr && (
          <p className="font-mono text-xs text-red-400 text-center mb-3">{uploadErr}</p>
        )}

        <button
          onClick={handleAnalyse}
          disabled={!file || uploading}
          className="w-full font-display text-xl tracking-wider text-noir-atelier bg-jaune-securite py-4 min-h-[56px] rounded-sm hover:bg-[#E4B610] transition-colors active:scale-[0.99] disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jaune-securite"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10"/>
              </svg>
              ENVOI EN COURS…
            </span>
          ) : 'ANALYSER MA PHOTO →'}
        </button>
      </div>
    </div>
  )
}

// ── Step 3 : Choix de la modification ────────────────────────────

function StyleStep({ photoURL, onGenerate, onBack, freeGenUsed, onPaywall }) {
  const [detected, setDetected]             = useState(null)
  const [detectError, setDetectError]       = useState(false)
  const [selectedModif, setSelectedModif]   = useState(null)
  const [selectedOption, setSelectedOption] = useState(null)
  const [generating, setGenerating]         = useState(false)
  const [genError, setGenError]             = useState(null)

  // Détection IA du véhicule dès l'arrivée sur l'étape
  useEffect(() => {
    let cancelled = false
    const detect = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('detect-vehicle', {
          body: { imageUrl: photoURL },
        })
        if (error) throw error
        // L'edge function peut retourner { error: '...' } avec status 200 si crash interne
        if (data?.error) throw new Error(data.error)
        console.info('[RELOOK] Véhicule détecté:', data)
        if (!cancelled) setDetected(data)
      } catch (err) {
        console.error('[RELOOK] Détection échouée:', err.message)
        if (!cancelled) {
          setDetectError(true)
          setDetected({ make: 'Véhicule', model: 'non identifié', trim: '', year: '', color: '', category: 'Inconnu' })
        }
      }
    }
    detect()
    return () => { cancelled = true }
  }, [photoURL])

  const selectModif = (m) => {
    setSelectedModif(m)
    setSelectedOption(null)
  }

  const canGenerate = selectedModif && selectedOption

  return (
    <div className="min-h-[100dvh] px-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 5rem)', paddingBottom: 'max(4rem, env(safe-area-inset-bottom))' }}>
      <div className="max-w-2xl mx-auto">
        <p className="font-mono text-xs text-jaune-securite tracking-widest text-center mb-3">ÉTAPE 2 / 3</p>
        <h2 className="font-display text-5xl md:text-6xl text-carte-grise text-center leading-none mb-8">
          CHOISIS TA MODIF
        </h2>

        {/* Chip de détection véhicule */}
        {!detected ? (
          <div className="flex items-center gap-3 border border-acier rounded-sm px-4 py-3 mb-8">
            <svg className="animate-spin w-4 h-4 shrink-0 text-texte-muted" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeDasharray="31.4" strokeDashoffset="10"/>
            </svg>
            <span className="font-mono text-xs text-texte-muted tracking-wider">IDENTIFICATION DU VÉHICULE…</span>
          </div>
        ) : (
          <div className="border border-jaune-securite/40 bg-jaune-securite/5 rounded-sm px-4 py-3 mb-8">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                {detectError ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-0.5 text-texte-muted">
                    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M7 4v3.5M7 9.5v0.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-0.5 text-jaune-securite">
                    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M4 7.5L6 9.5L10 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                <p className="font-mono text-[10px] text-texte-muted tracking-widest">
                  {detectError ? 'DÉTECTION PARTIELLE' : 'VÉHICULE IDENTIFIÉ PAR IA'}
                </p>
              </div>
              <button className="font-mono text-[10px] text-texte-muted hover:text-carte-grise underline underline-offset-2 transition-colors shrink-0">
                Corriger
              </button>
            </div>

            {/* Nom du véhicule — ligne principale, impactante */}
            <p className="font-display text-3xl text-carte-grise leading-tight mt-1">
              {[detected.make, detected.model, detected.trim].filter(Boolean).join(' ') || 'VÉHICULE INCONNU'}
            </p>

            {/* Détails secondaires */}
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {detected.year && (
                <span className="font-mono text-xs text-jaune-securite">{detected.year}</span>
              )}
              {detected.color && (
                <span className="font-mono text-xs text-texte-muted">{detected.color}</span>
              )}
              {detected.category && (
                <span className="font-mono text-xs text-texte-muted/60">{detected.category}</span>
              )}
            </div>
          </div>
        )}

        {/* Grille de modifications */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {MODIFS.map((m) => (
            <button
              key={m.id}
              onClick={() => selectModif(m)}
              className={`border rounded-sm p-4 text-left transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-jaune-securite active:scale-[0.98] ${
                selectedModif?.id === m.id
                  ? 'border-jaune-securite bg-jaune-securite/8 text-carte-grise'
                  : 'border-acier hover:border-texte-muted text-texte-muted hover:text-carte-grise'
              }`}
            >
              <div className="mb-2">{m.icon}</div>
              <p className="font-display text-lg leading-none mb-0.5">{m.title}</p>
              <p className="font-mono text-[10px] opacity-60 leading-snug">{m.desc}</p>
            </button>
          ))}
        </div>

        {/* Sélection de couleur/option — apparaît quand modif choisie */}
        {selectedModif && (
          <div className="border border-acier rounded-sm overflow-hidden mb-8">
            <div className="px-4 py-2.5 bg-[#0F0E09] border-b border-acier flex justify-between items-center">
              <span className="font-mono text-[10px] text-texte-muted tracking-widest">
                {selectedModif.options[0]?.label.includes('Mat') || selectedModif.id === 'jantes'
                  ? 'CHOISIS L\'OPTION'
                  : 'CHOISIS LA COULEUR'}
              </span>
              {selectedOption && (
                <span className="font-mono text-[10px] text-jaune-securite">{selectedOption.label}</span>
              )}
            </div>
            <div className="p-4 flex flex-wrap gap-3">
              {selectedModif.options.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setSelectedOption(opt)}
                  title={opt.label}
                  className={`relative w-12 h-12 rounded-sm border-2 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-jaune-securite active:scale-95 ${
                    selectedOption?.label === opt.label
                      ? 'border-jaune-securite scale-110'
                      : 'border-transparent hover:border-texte-muted/50'
                  }`}
                  style={{ background: opt.hex }}
                >
                  {selectedOption?.label === opt.label && (
                    <svg className="absolute inset-0 m-auto" width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7.5L5.5 10L11 4.5" stroke={opt.hex === '#EEEDE6' || opt.hex === '#E8E8E0' || opt.hex === '#D0D0D0' || opt.hex === '#ECECEC' ? '#15140F' : 'white'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {genError && (
          <p className="font-mono text-xs text-red-400 text-center mb-3">{genError}</p>
        )}

        <button
          onClick={async () => {
            if (!canGenerate || generating) return
            if (freeGenUsed) { onPaywall('new-gen'); return }
            setGenError(null)
            setGenerating(true)
            try {
              // 1. Créer la tâche → obtenir taskId
              const { data: createData, error: createError } = await supabase.functions.invoke('generate-modification', {
                body: {
                  imageUrl: photoURL,
                  vehicle: detected ?? {},
                  modification: {
                    modifTitle: selectedModif.title,
                    optionLabel: selectedOption.label,
                  },
                },
              })
              if (createError) throw createError
              if (createData?.mock) {
                onGenerate({ modif: selectedModif, option: selectedOption, vehicle: detected, resultUrl: createData.resultUrl, mock: true })
                return
              }
              const taskId = createData?.taskId
              const recordId = createData?.recordId
              if (!taskId) throw new Error('Pas de taskId recu')

              // 2. Poller depuis le navigateur (max 5 min)
              let resultUrl = null
              for (let i = 0; i < 100; i++) {
                await new Promise(r => setTimeout(r, 3000))
                const { data: pollData, error: pollError } = await supabase.functions.invoke('generate-modification', {
                  body: { action: 'poll', taskId, recordId },
                })
                if (pollError) throw pollError
                console.log('[RELOOK] poll #' + i, pollData)
                if (pollData?.failed) throw new Error('Generation KIE echouee')
                if (pollData?.resultUrl) { resultUrl = pollData.resultUrl; break }
              }
              if (!resultUrl) throw new Error('Timeout — generation trop longue')

              onGenerate({
                modif: selectedModif,
                option: selectedOption,
                vehicle: detected,
                resultUrl,
                mock: false,
              })
            } catch (err) {
              console.error('[RELOOK] Génération échouée:', err.message, err)
              const detail = err?.context?.error ?? err?.message ?? 'Erreur inconnue'
              setGenError('Erreur: ' + detail)
              setGenerating(false)
            }
          }}
          disabled={!canGenerate || generating}
          className={`w-full font-display text-2xl tracking-wider py-4 min-h-[56px] rounded-sm transition-all active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jaune-securite ${
            canGenerate && freeGenUsed
              ? 'text-jaune-securite border border-jaune-securite hover:bg-jaune-securite/10'
              : 'text-noir-atelier bg-jaune-securite hover:bg-[#E4B610] disabled:opacity-25 disabled:cursor-not-allowed'
          }`}
        >
          {generating ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10"/>
              </svg>
              GÉNÉRATION EN COURS…
            </span>
          ) : !selectedModif
            ? 'CHOISIS UNE MODIF D\'ABORD'
            : !selectedOption
            ? 'CHOISIS UNE COULEUR'
            : freeGenUsed
            ? (
              <span className="flex items-center justify-center gap-2.5">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="6" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                GÉNÉRER — 1 CRÉDIT
              </span>
            )
            : 'GÉNÉRER MON RENDU →'}
        </button>
      </div>
    </div>
  )
}

// ── Step 4 : Résultat ─────────────────────────────────────────────

// Slider générique — fonctionne avec des SVG (mock) ou des vraies images (URLs)
function ResultSlider({ beforeUrl, afterUrl, beforeProps, afterProps }) {
  const [pos, setPos] = useState(45)
  const [dragging, setDragging] = useState(false)
  const ref = useRef(null)
  const clamp = (v) => Math.max(3, Math.min(97, v))
  const update = useCallback((clientX) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    setPos(clamp(((clientX - r.left) / r.width) * 100))
  }, [])
  useEffect(() => {
    const move   = (e) => { if (dragging) update(e.clientX) }
    const mTouch = (e) => { if (dragging) { e.preventDefault(); update(e.touches[0].clientX) } }
    const up     = () => setDragging(false)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    window.addEventListener('touchmove', mTouch, { passive: false })
    window.addEventListener('touchend', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
      window.removeEventListener('touchmove', mTouch)
      window.removeEventListener('touchend', up)
    }
  }, [dragging, update])

  const useRealImages = beforeUrl && afterUrl

  return (
    <div ref={ref} className="relative overflow-hidden border border-acier rounded-sm bg-[#1A190E] select-none" style={{ cursor: 'col-resize' }}
      onMouseDown={(e) => { e.preventDefault(); setDragging(true); update(e.clientX) }}
      onTouchStart={(e) => { setDragging(true); update(e.touches[0].clientX) }}
    >
      <div className="relative w-full" style={{ paddingBottom: useRealImages ? '75%' : '39.45%' }}>
        {/* APRÈS */}
        {useRealImages
          ? <img src={afterUrl} alt="Après modification" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
          : <CarSVG {...afterProps} className="absolute inset-0 w-full h-full" />
        }
        {/* AVANT — clipPath révèle la moitié gauche */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          {useRealImages
            ? <img src={beforeUrl} alt="Avant modification" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
            : <CarSVG {...beforeProps} className="absolute inset-0 w-full h-full" />
          }
          <span className="absolute top-3 left-3 font-mono text-[10px] text-texte-muted bg-noir-atelier/70 px-2 py-0.5 rounded-sm">AVANT</span>
        </div>
        <span className="absolute top-3 right-3 font-mono text-[10px] text-jaune-securite bg-noir-atelier/70 px-2 py-0.5 rounded-sm">APRÈS</span>
        {/* Handle */}
        <div className="absolute top-0 bottom-0 z-10 flex items-center" style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}>
          <div className="w-px h-full bg-jaune-securite opacity-90" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-jaune-securite border-2 border-noir-atelier flex items-center justify-center shadow-xl">
            <svg width="12" height="9" viewBox="0 0 14 10" fill="none"><path d="M1 5H13M1 5L4 2M1 5L4 8M13 5L10 2M13 5L10 8" stroke="#15140F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      </div>
    </div>
  )
}

function ResultStep({ config, photoURL, onNewModif, onReset, onExit, isFirstGen, onPaywall }) {
  const [shared, setShared] = useState(false)

  const { modif, option, resultUrl, mock } = config
  const hasRealImage = resultUrl && !mock

  // Fallback SVG si pas de vraie image (mode dev / clé manquante)
  const beforeProps = { bodyColor: '#4E4C45', rimColor: '#3A3830' }
  const afterProps  = { bodyColor: option.bodyColor, rimColor: option.rimColor, accent: true }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'Mon rendu RELOOK.', text: `Regarde ce que donnerait un ${modif.title.toLowerCase()} ${option.label.toLowerCase()} sur ma caisse !`, url: window.location.href })
    } else {
      await navigator.clipboard?.writeText(window.location.href)
    }
    setShared(true)
    setTimeout(() => setShared(false), 2500)
  }

  return (
    <div className="min-h-[100dvh] px-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 5rem)', paddingBottom: 'max(4rem, env(safe-area-inset-bottom))' }}>
      <div className="max-w-2xl mx-auto">
        <p className="font-mono text-xs text-jaune-securite tracking-widest text-center mb-3">ÉTAPE 3 / 3</p>

        {/* Tampon RÉSULTAT */}
        <div className="text-center mb-8">
          <div className="inline-block border-2 border-jaune-securite px-5 py-1 rounded-sm mb-4 rotate-[-1deg]">
            <span className="font-display text-sm text-jaune-securite tracking-[0.3em]">RÉSULTAT PRÊT</span>
          </div>
          <h2 className="font-display text-5xl md:text-6xl text-carte-grise leading-none">
            VOILÀ CE QUE<br />
            <span className="text-jaune-securite">ÇA DONNE.</span>
          </h2>
        </div>

        {/* Slider avant/après + filigrane si gen gratuite */}
        <div className="relative">
          <ResultSlider
            beforeUrl={hasRealImage ? photoURL : null}
            afterUrl={hasRealImage ? resultUrl : null}
            beforeProps={beforeProps}
            afterProps={afterProps}
          />
          {isFirstGen && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <span
                className="font-display text-5xl text-carte-grise/10 tracking-widest"
                style={{ transform: 'rotate(-18deg)' }}
              >
                RELOOK.
              </span>
            </div>
          )}
        </div>

        {/* Fiche de modification */}
        <div className="border border-acier rounded-sm overflow-hidden mt-4 mb-6">
          <div className="flex items-center gap-4 px-4 py-3 bg-[#0F0E09]">
            <div
              className="w-8 h-8 rounded-sm border border-acier/40 shrink-0"
              style={{ background: option.hex }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[10px] text-texte-muted tracking-widest">{modif.title}</p>
              <p className="font-display text-xl text-carte-grise leading-none">{option.label}</p>
            </div>
            <span className="font-mono text-[10px] text-texte-muted/50 border border-acier/30 px-2 py-0.5 rounded-sm shrink-0">RENDU SIMULÉ</span>
          </div>
        </div>

        {/* Bandeau "Débloquer le HD" si génération gratuite */}
        {isFirstGen && (
          <div className="border border-jaune-securite/30 bg-jaune-securite/5 rounded-sm px-4 py-3 mb-6 flex items-start gap-3">
            <svg className="shrink-0 mt-0.5 text-jaune-securite" width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="7" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5 7V5.5a3 3 0 0 1 6 0V7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="8" cy="11" r="1" fill="currentColor"/></svg>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[11px] text-jaune-securite tracking-wide font-medium">RENDU GRATUIT AVEC FILIGRANE</p>
              <p className="font-mono text-[10px] text-texte-muted mt-0.5 leading-snug">Télécharge en HD sans filigrane et génère autant de rendus que tu veux — à partir de 0,99&nbsp;€.</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => onPaywall('download')}
            className="flex items-center justify-center gap-2 border border-jaune-securite text-jaune-securite font-display text-lg tracking-wider py-3 rounded-sm hover:bg-jaune-securite/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-jaune-securite"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2V11M8 11L4.5 7.5M8 11L11.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 13H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            {isFirstGen ? 'TÉLÉCHARGER HD' : 'TÉLÉCHARGER'}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 border border-acier text-texte-muted font-display text-lg tracking-wider py-3 rounded-sm hover:border-texte-muted hover:text-carte-grise transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-jaune-securite"
          >
            {shared ? (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7L6 10L11 4" stroke="#F5C518" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span className="text-jaune-securite">COPIÉ !</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="13" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="13" cy="13" r="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="3" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M4.5 8.8L11.5 12.2M11.5 3.8L4.5 7.2" stroke="currentColor" strokeWidth="1.3"/></svg>
                PARTAGER
              </>
            )}
          </button>
        </div>

        <button
          onClick={onNewModif}
          className="w-full font-display text-xl tracking-wider text-carte-grise border border-acier py-3 rounded-sm hover:border-texte-muted transition-colors mb-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-jaune-securite"
        >
          ESSAYER UNE AUTRE MODIF →
        </button>
        <button
          onClick={onReset}
          className="w-full font-mono text-xs text-texte-muted/50 hover:text-texte-muted transition-colors py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-jaune-securite rounded-sm"
        >
          Changer de photo
        </button>
      </div>
    </div>
  )
}

// ── Paywall modal ─────────────────────────────────────────────────

const CREDIT_PACKS = [
  { id: 'decouverte', label: 'DÉCOUVERTE', price: '0,99 €', credits: 1,  perUnit: null,           highlight: false },
  { id: 'passion',    label: 'PASSION',    price: '5 €',    credits: 10, perUnit: '0,50 €/rendu', highlight: true  },
  { id: 'atelier',    label: 'ATELIER',    price: '12 €',   credits: 30, perUnit: '0,40 €/rendu', highlight: false },
]

function PaywallModal({ trigger, onClose }) {
  const handleBuy = (pack) => {
    // ── TODO: Ouvrir Stripe Checkout avec le price_id du pack ────────────────
    // stripe.redirectToCheckout({ lineItems: [{ price: pack.stripePriceId, quantity: 1 }], mode: 'payment', successUrl, cancelUrl })
    // ────────────────────────────────────────────────────────────────────────
    console.info('[RELOOK] Achat initié — pack:', pack.id, pack.price)
    alert(`Stripe Checkout ici — pack ${pack.label} à ${pack.price}`)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-noir-atelier/85 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative z-10 w-full max-w-md bg-[#1A190E] border border-acier rounded-t-2xl sm:rounded-xl overflow-hidden shadow-2xl">

        {/* Barre chantier */}
        <div className="h-1 hazard-stripes opacity-50" />

        <div className="px-6 pt-6" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>

          {/* Fermer */}
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="absolute top-4 right-4 text-texte-muted hover:text-carte-grise transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-jaune-securite rounded-sm"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Titre */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center gap-2 mb-3">
              <svg className="text-jaune-securite" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="7" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M5 7V5.5a3 3 0 0 1 6 0V7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <circle cx="8" cy="11" r="1" fill="currentColor"/>
              </svg>
              <span className="font-mono text-[10px] text-jaune-securite tracking-widest uppercase">
                {trigger === 'download' ? 'Télécharger en HD' : 'Générations illimitées'}
              </span>
            </div>
            <h3 className="font-display text-5xl text-carte-grise leading-none">
              CHOISIS<br />TON PACK.
            </h3>
            <p className="font-mono text-xs text-texte-muted mt-2 leading-snug">
              {trigger === 'download'
                ? 'Rendu HD sans filigrane + crédits pour la suite'
                : 'Chaque rendu supplémentaire consomme 1 crédit'}
            </p>
          </div>

          {/* Packs */}
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            {CREDIT_PACKS.map((pack) => (
              <button
                key={pack.id}
                onClick={() => handleBuy(pack)}
                className={`relative border rounded-sm p-3.5 text-center transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-jaune-securite active:scale-[0.97] ${
                  pack.highlight
                    ? 'border-jaune-securite bg-jaune-securite/8 text-carte-grise'
                    : 'border-acier hover:border-texte-muted/60 text-texte-muted hover:text-carte-grise'
                }`}
              >
                {pack.highlight && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 font-mono text-[8px] text-noir-atelier bg-jaune-securite px-2 py-0.5 rounded-sm whitespace-nowrap tracking-wider">
                    POPULAIRE
                  </span>
                )}
                <p className="font-display text-base leading-none mb-1.5">{pack.label}</p>
                <p className="font-display text-2xl text-carte-grise leading-none">{pack.price}</p>
                <p className="font-mono text-[9px] opacity-50 mt-1">
                  {pack.credits} {pack.credits > 1 ? 'rendus' : 'rendu'}
                </p>
                {pack.perUnit && (
                  <p className="font-mono text-[9px] text-jaune-securite mt-1">{pack.perUnit}</p>
                )}
              </button>
            ))}
          </div>

          {/* Garanties */}
          <div className="flex items-center justify-center gap-3 font-mono text-[9px] text-texte-muted/40">
            <span>Paiement sécurisé</span>
            <span className="text-acier">·</span>
            <span>Crédits valables 1 an</span>
            <span className="text-acier">·</span>
            <span>Aucun abonnement</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Orchestrateur ─────────────────────────────────────────────────

function OnboardingFlow({ userEmail, userId, onExit }) {
  const [step, setStep]               = useState('welcome')
  const [photoURL, setPhotoURL]       = useState(null)
  const [genConfig, setGenConfig]     = useState(null)
  const [genCount, setGenCount]       = useState(0)
  const [paywallTrigger, setPaywallTrigger] = useState(null)

  const STEP_IDX = { welcome: 0, upload: 1, style: 2, result: 3 }

  const back = {
    welcome: null,
    upload:  () => setStep('welcome'),
    style:   () => setStep('upload'),
    result:  () => setStep('style'),
  }

  const handleGenerate = (cfg) => {
    setGenCount((c) => c + 1)
    setGenConfig(cfg)
    setStep('result')
  }

  return (
    <div className="bg-noir-atelier min-h-[100dvh] font-body grid-bg">
      <OnboardingHeader
        stepIdx={STEP_IDX[step]}
        totalSteps={4}
        onBack={back[step]}
        onExit={onExit}
      />

      {step === 'welcome' && (
        <WelcomeStep userEmail={userEmail} onNext={() => setStep('upload')} />
      )}
      {step === 'upload' && (
        <UploadStep
          userId={userId}
          onNext={(url) => { setPhotoURL(url); setStep('style') }}
          onBack={() => setStep('welcome')}
        />
      )}
      {step === 'style' && (
        <StyleStep
          photoURL={photoURL}
          onGenerate={handleGenerate}
          onBack={() => setStep('upload')}
          freeGenUsed={genCount > 0}
          onPaywall={setPaywallTrigger}
        />
      )}
      {step === 'result' && (
        <ResultStep
          config={genConfig}
          photoURL={photoURL}
          onNewModif={() => setStep('style')}
          onReset={() => { setPhotoURL(null); setGenConfig(null); setGenCount(0); setStep('upload') }}
          onExit={onExit}
          isFirstGen={genCount === 1}
          onPaywall={setPaywallTrigger}
        />
      )}

      {paywallTrigger && (
        <PaywallModal trigger={paywallTrigger} onClose={() => setPaywallTrigger(null)} />
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
//  APP ROOT
// ══════════════════════════════════════════════════════════════════

export default function App() {
  const [user, setUser]           = useState(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    // Restaure la session existante au chargement
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthReady(true)
    })
    // Écoute les changements d'état auth (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (!authReady) {
    return (
      <div className="bg-noir-atelier min-h-screen flex items-center justify-center">
        <svg className="animate-spin w-6 h-6 text-jaune-securite" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeDasharray="31.4" strokeDashoffset="10"/>
        </svg>
      </div>
    )
  }

  if (user) {
    return (
      <OnboardingFlow
        userEmail={user.email}
        userId={user.id}
        onExit={() => supabase.auth.signOut()}
      />
    )
  }

  return (
    <div className="bg-noir-atelier min-h-screen font-body">
      <Header />
      <main>
        <HeroSection onAuth={() => {}} />
        <PourQuiSection />
        <CommentCaMarcheSection />
        <ShowcaseSection />
        <FinalCTASection onAuth={() => {}} />
      </main>
      <Footer />
    </div>
  )
}

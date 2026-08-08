'use client'

import { useMemo, useRef, useState } from 'react'
import { ArrowRight, Check, ChevronDown, ChevronUp, Clock3, FileDown, Minus, Plus, RotateCcw, Sparkles, X } from 'lucide-react'

type Difficulty = 'easy' | 'medium' | 'difficult'
type Subject = { id: number; name: string; difficulty: Difficulty }
type Session = { time: string; title: string; subject: string; type: 'focus' | 'practice' | 'revision' | 'break'; duration: string }

const difficultyLabel: Record<Difficulty, string> = { easy: 'Easy', medium: 'Medium', difficult: 'Difficult' }
const difficultyWeight: Record<Difficulty, number> = { easy: 1, medium: 2, difficult: 3 }
const sessionColors = { focus: 'session-focus', practice: 'session-practice', revision: 'session-revision', break: 'session-break' }

function formatTime(totalMinutes: number) {
  const minutesInDay = 24 * 60
  const normalized = ((totalMinutes % minutesInDay) + minutesInDay) % minutesInDay
  const hour24 = Math.floor(normalized / 60)
  const minute = normalized % 60
  const period = hour24 >= 12 ? 'PM' : 'AM'
  const hour12 = hour24 % 12 || 12
  return `${hour12}:${String(minute).padStart(2, '0')} ${period}`
}

function buildSchedule(subjects: Subject[], days: number, hours: number, revision: boolean, startTime: string) {
  const cleanSubjects = subjects.filter((subject) => subject.name.trim())
  const sessions: Session[][] = []
  const totalMinutes = Math.max(60, hours * 60)
  const studyMinutes = Math.max(45, Math.floor(totalMinutes * 0.84))
  const block = Math.max(30, Math.floor(studyMinutes / Math.max(1, cleanSubjects.length)))
  const [startHour, startMinute] = startTime.split(':').map(Number)
  const startMinutes = startHour * 60 + startMinute

  for (let day = 0; day < days; day++) {
    const daySessions: Session[] = []
    let cursor = startMinutes
    cleanSubjects.forEach((subject, index) => {
      const subjectIndex = (day + index) % cleanSubjects.length
      const selected = cleanSubjects[subjectIndex]
      const isPractice = selected.difficulty === 'difficult' && (day + index) % 3 === 1
      daySessions.push({
        time: formatTime(cursor),
        title: isPractice ? 'Practice & problems' : 'Deep focus',
        subject: selected.name,
        type: isPractice ? 'practice' : 'focus',
        duration: `${Math.round(block / 5) * 5} min`,
      })
      cursor += Math.round(block / 5) * 5
      if (index === 0 && cleanSubjects.length > 1) {
        daySessions.push({ time: formatTime(cursor), title: 'Reset & recharge', subject: 'Take a proper break', type: 'break', duration: '20 min' })
        cursor += 20
      }
    })
    if (revision && day > 0 && day % 2 === 1) {
      daySessions.push({ time: formatTime(cursor), title: 'Quick revision', subject: cleanSubjects[day % cleanSubjects.length].name, type: 'revision', duration: '25 min' })
    }
    sessions.push(daySessions)
  }
  return sessions
}

export default function Page() {
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: 1, name: 'Mathematics', difficulty: 'difficult' },
    { id: 2, name: 'Physics', difficulty: 'medium' },
    { id: 3, name: 'Chemistry', difficulty: 'medium' },
    { id: 4, name: 'English', difficulty: 'easy' },
  ])
  const [days, setDays] = useState(7)
  const [hours, setHours] = useState(4)
  const [startTime, setStartTime] = useState('07:00')
  const [revision, setRevision] = useState(true)
  const [errors, setErrors] = useState<string[]>([])
  const [schedule, setSchedule] = useState<Session[][] | null>(null)
  const [visibleDays, setVisibleDays] = useState(3)
  const [premiumOpen, setPremiumOpen] = useState(false)
  const resultsRef = useRef<HTMLElement>(null)

  const activeSubjects = useMemo(() => subjects.filter((subject) => subject.name.trim()), [subjects])
  const difficultCount = activeSubjects.filter((subject) => subject.difficulty === 'difficult').length

  function generatePlan() {
    const nextErrors: string[] = []
    if (activeSubjects.length === 0) nextErrors.push('Add at least one subject to build your plan.')
    if (subjects.some((subject) => !subject.name.trim())) nextErrors.push('Please name every subject or remove the empty row.')
    if (days < 1 || days > 30) nextErrors.push('Choose between 1 and 30 study days.')
    if (hours < 1 || hours > 12) nextErrors.push('Choose between 1 and 12 hours per day.')
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)) nextErrors.push('Choose a valid study start time.')
    setErrors(nextErrors)
    if (nextErrors.length) return
    setSchedule(buildSchedule(subjects, days, hours, revision, startTime))
    setVisibleDays(3)
    window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40)
  }

  function updateSubject(id: number, key: 'name' | 'difficulty', value: string) {
    setSubjects((current) => current.map((subject) => subject.id === id ? { ...subject, [key]: value } as Subject : subject))
  }

  function addSubject() {
    if (subjects.length >= 8) return
    setSubjects((current) => [...current, { id: Date.now(), name: '', difficulty: 'medium' }])
  }

  function removeSubject(id: number) {
    setSubjects((current) => current.filter((subject) => subject.id !== id))
  }

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <a href="#planner" className="flex items-center gap-3" aria-label="Study Planner home">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm"><Check aria-hidden="true" size={19} strokeWidth={3} /></span>
          <span className="font-mono text-sm font-bold tracking-[-0.03em] sm:text-base">study planner<span className="text-primary">.</span></span>
        </a>
        <a href="#how-it-works" className="hidden items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground sm:flex">How it works <ArrowRight aria-hidden="true" size={15} /></a>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-10 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-10 lg:pb-24 lg:pt-20" id="planner">
        <div className="flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-primary"><Sparkles aria-hidden="true" size={14} /> Plan smarter, not longer</div>
          <h1 className="max-w-xl text-balance font-mono text-4xl font-extrabold leading-[1.06] tracking-[-0.07em] sm:text-5xl lg:text-6xl">Your study plan, <span className="text-primary">sorted.</span></h1>
          <p className="mt-6 max-w-lg text-pretty text-base leading-7 text-muted-foreground sm:text-lg">Tell us what you&apos;re studying and when. Get a realistic timetable that makes space for focus, practice, and actual breaks.</p>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs font-semibold text-muted-foreground"><span className="flex items-center gap-2"><Check className="text-primary" size={15} /> Built around your time</span><span className="flex items-center gap-2"><Check className="text-primary" size={15} /> No overloading</span></div>
        </div>

        <div className="paper-card min-w-0 rounded-[1.5rem] p-5 sm:p-7">
          <div className="mb-7 flex items-start justify-between gap-4"><div><p className="font-mono text-xl font-bold tracking-[-0.04em]">Build your plan</p><p className="mt-1 text-sm text-muted-foreground">A few details and we&apos;ll do the organizing.</p></div><span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">Free</span></div>
          <div className="flex flex-col gap-7">
            <div><label className="field-label" htmlFor="days">How many days?</label><div className="control-row"><button className="icon-button" onClick={() => setDays(Math.max(1, days - 1))} aria-label="Decrease days"><Minus size={16} /></button><input id="days" className="number-input" type="number" min="1" max="30" value={days} onChange={(event) => setDays(Number(event.target.value))} /><span className="control-suffix">days</span><button className="icon-button" onClick={() => setDays(Math.min(30, days + 1))} aria-label="Increase days"><Plus size={16} /></button></div></div>
            <div><label className="field-label" htmlFor="hours">Hours per day</label><div className="control-row"><button className="icon-button" onClick={() => setHours(Math.max(1, hours - 1))} aria-label="Decrease hours"><Minus size={16} /></button><input id="hours" className="number-input" type="number" min="1" max="12" value={hours} onChange={(event) => setHours(Number(event.target.value))} /><span className="control-suffix">hours</span><button className="icon-button" onClick={() => setHours(Math.min(12, hours + 1))} aria-label="Increase hours"><Plus size={16} /></button></div></div>
            <div><label className="field-label" htmlFor="start-time">When do you want to start?</label><div className="time-input-wrap"><Clock3 aria-hidden="true" size={17} /><input id="start-time" className="time-input" type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} /></div><p className="mt-2 text-xs leading-5 text-muted-foreground">Choose any start time, including evening or late night.</p></div>
            <div><div className="mb-3 flex items-center justify-between"><label className="field-label mb-0">Your subjects</label><span className="text-xs text-muted-foreground">{subjects.length}/8</span></div><div className="flex flex-col gap-3">{subjects.map((subject, index) => <div className="subject-row" key={subject.id}><label className="sr-only" htmlFor={`subject-${subject.id}`}>Subject {index + 1} name</label><input id={`subject-${subject.id}`} className="subject-input" placeholder="e.g. Biology" value={subject.name} onChange={(event) => updateSubject(subject.id, 'name', event.target.value)} /><label className="sr-only" htmlFor={`difficulty-${subject.id}`}>Difficulty for {subject.name || `subject ${index + 1}`}</label><select id={`difficulty-${subject.id}`} className="difficulty-select" value={subject.difficulty} onChange={(event) => updateSubject(subject.id, 'difficulty', event.target.value)}>{Object.entries(difficultyLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>{subjects.length > 1 && <button className="remove-button" onClick={() => removeSubject(subject.id)} aria-label={`Remove ${subject.name || `subject ${index + 1}`}`}><X size={16} /></button>}</div>)}</div><button className="add-button" onClick={addSubject} disabled={subjects.length >= 8}><Plus size={15} /> Add another subject</button></div>
            <label className="toggle-row"><span><span className="field-label mb-1 block">Include revision sessions</span><span className="text-xs text-muted-foreground">Short reviews to help it stick.</span></span><input className="toggle-input" type="checkbox" checked={revision} onChange={(event) => setRevision(event.target.checked)} /><span className="toggle-track" aria-hidden="true"><span /></span></label>
            {errors.length > 0 && <div className="error-box" role="alert">{errors.map((error) => <p key={error}>{error}</p>)}</div>}
            <button className="primary-button" onClick={generatePlan}>Generate my plan <ArrowRight size={17} /></button>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card/60" id="how-it-works"><div className="mx-auto grid max-w-6xl gap-6 px-5 py-8 sm:grid-cols-3 sm:px-8 lg:px-10"><div className="step"><span>01</span><div><strong>Share the basics</strong><p>Subjects, start time, and the days you have.</p></div></div><div className="step"><span>02</span><div><strong>We balance it out</strong><p>Harder subjects get more attention.</p></div></div><div className="step"><span>03</span><div><strong>You get moving</strong><p>A plan you can actually follow.</p></div></div></div></section>

      {schedule && <section ref={resultsRef} className="mx-auto w-full max-w-6xl scroll-mt-6 px-5 py-16 sm:px-8 lg:px-10 lg:py-24"><div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow">Your plan is ready</p><h2 className="mt-2 text-balance font-mono text-3xl font-extrabold tracking-[-0.06em] sm:text-4xl">A steady week, <span className="text-primary">sorted.</span></h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{days} days · {hours} hours/day · {activeSubjects.length} subjects · {difficultCount} priority {difficultCount === 1 ? 'subject' : 'subjects'}</p></div><button className="secondary-button" onClick={() => setSchedule(null)}><RotateCcw size={15} /> Edit inputs</button></div><div className="grid gap-8 lg:grid-cols-[1fr_320px]"><div className="flex flex-col gap-5">{schedule.slice(0, visibleDays).map((day, dayIndex) => <article className="day-card" key={dayIndex}><div className="day-heading"><span>Day {dayIndex + 1}</span><span>{day.filter((session) => session.type !== 'break').length} study blocks</span></div><div className="flex flex-col">{day.map((session, index) => <div className="schedule-row" key={`${session.subject}-${index}`}><time>{session.time}</time><span className={`session-dot ${sessionColors[session.type]}`} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{session.title}</p><p className="truncate text-xs text-muted-foreground">{session.subject}</p></div><span className={`session-pill ${sessionColors[session.type]}`}>{session.duration}</span></div>)}</div></article>)}{visibleDays < schedule.length && <button className="secondary-button mx-auto" onClick={() => setVisibleDays(schedule.length)}>{schedule.length - visibleDays} more days <ChevronDown size={16} /></button>}{visibleDays === schedule.length && schedule.length > 3 && <button className="secondary-button mx-auto" onClick={() => setVisibleDays(3)}>Show fewer <ChevronUp size={16} /></button>}</div><aside className="premium-card"><div className="mb-5 flex items-center justify-between"><span className="premium-label">Premium</span><span className="font-mono text-2xl font-extrabold">₹49</span></div><h3 className="font-mono text-xl font-bold tracking-[-0.04em]">The complete plan.</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Get the detail and structure to keep your momentum all week.</p><ul className="mt-6 flex flex-col gap-3 text-sm">{['Detailed day-by-day timetable', 'Smart revision sessions', 'Built-in breaks & buffer time', 'Download as a PDF'].map((item) => <li key={item} className="flex items-start gap-2"><Check className="mt-0.5 shrink-0 text-primary" size={15} />{item}</li>)}</ul><button className="premium-button mt-7" onClick={() => setPremiumOpen(true)}>Unlock complete plan <ArrowRight size={16} /></button></aside></div></section>}

      <footer className="mx-auto flex max-w-6xl flex-col gap-2 border-t border-border px-5 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10"><span className="font-mono font-bold text-foreground">study planner<span className="text-primary">.</span></span><span>Make time for what matters.</span></footer>

      {premiumOpen && <div className="modal-backdrop" role="presentation" onClick={() => setPremiumOpen(false)}><div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="premium-title" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setPremiumOpen(false)} aria-label="Close dialog"><X size={18} /></button><div className="grid size-12 place-items-center rounded-2xl bg-accent text-primary"><FileDown size={22} /></div><h2 id="premium-title" className="mt-5 font-mono text-2xl font-extrabold tracking-[-0.05em]">Almost there.</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Premium checkout is ready to connect. Once payments are wired up, you&apos;ll get your complete PDF plan for ₹49.</p><button className="primary-button mt-6 w-full" onClick={() => setPremiumOpen(false)}>Got it</button></div></div>}
    </main>
  )
}

export { difficultyWeight }

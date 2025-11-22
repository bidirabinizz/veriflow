import React from 'react'
import AnimatedBackground from '../components/AnimasyonluBackground'
import NasilKullanilirAdimlar from '../components/NasilKullanilirAdimlar.jsx'

function NasilKullanilir() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
      <AnimatedBackground/>
      <div className="relative z-10">
        <NasilKullanilirAdimlar />
      </div>
    </section>
  )
}

export default NasilKullanilir
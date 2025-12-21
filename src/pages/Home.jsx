import React from "react";
import { useTranslation } from "react-i18next";
import AnimatedBackground from "../components/AnimasyonluBackground";
import BiziTercihEt from "../components/BiziTercihEt";
import NasilCalisir from "../components/NasilCalisir";
import FiyatlandirmaPlanlar from "../components/FiyatlandirmaPlanlar";
import StatsSection from "../components/StatsSection";
import FinalCTA from "../components/FinalCTA";
// YENİ IMPORTLAR
import FAQ from "../components/FAQ";
import MusteriYorumlari from "../components/MusteriYorumlari";

export default function Home() {
  const { t } = useTranslation();

  return (
    <section className="min-h-screen bg-slate-950 relative overflow-x-hidden">
      
      <AnimatedBackground count={15} />

      <div className="relative z-10 flex flex-col gap-0">
        
        {/* 1. HERO */}
        <section className="relative">
          <BiziTercihEt />
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
        </section>

        {/* 2. STATS */}
        <StatsSection />

        {/* 3. NASIL ÇALIŞIR */}
        <section className="relative py-24">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
           <div className="container mx-auto px-6 mb-12 text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Nasıl <span className="text-cyan-400">Çalışır?</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Karmaşık kurulumlara son. Sadece 4 adımda sisteminizi hazır hale getirin.
              </p>
           </div>
           <NasilCalisir />
        </section>

        {/* 4. MÜŞTERİ YORUMLARI (YENİ) */}
        <MusteriYorumlari />

        {/* 5. FİYATLANDIRMA */}
        <section className="relative py-12">
          <div className="absolute inset-0 bg-slate-900/50 skew-y-3 transform origin-bottom-left -z-10" />
          <FiyatlandirmaPlanlar />
        </section>

        {/* 6. FAQ (YENİ) */}
        <FAQ />

        {/* 7. CTA */}
        <FinalCTA />

      </div>
    </section>
  );
}
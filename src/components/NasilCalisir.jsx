import React from 'react'
import { useTranslation } from 'react-i18next'

function NasilCalisir() {
const { t } = useTranslation();
  return (
    <div>
      <div className="relative">
  <div className="hidden lg:block relative">
    <div className="absolute top-16 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
    <div className="grid grid-cols-4 gap-8 relative z-10">
      <div className="relative group flex flex-col items-center">
        <div className="absolute top-[132px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white/40 rounded-full"></div>
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 h-64 flex flex-col justify-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#79FFFF]/20 border border-[#79FFFF]/30 flex items-center justify-center">
              <span className="text-[#79FFFF] font-semibold text-sm">01</span>
            </div>
          </div>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cable w-8 h-8 text-white" aria-hidden="true">
                <path d="M17 21v-2a1 1 0 0 1-1-1v-1a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1"></path>
                <path d="M19 15V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V9"></path>
                <path d="M21 21v-2h-4"></path>
                <path d="M3 5h4V3"></path>
                <path d="M7 5a1 1 0 0 1 1 1v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1V3"></path>
              </svg>
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-3">{t("nasilcalisir_kayitol")}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{t("nasilcalisir_kayitol_aciklama")}</p>
          </div>
        </div>
      </div>

      <div className="relative group flex flex-col items-center">
        <div className="absolute top-[132px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white/40 rounded-full"></div>
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 h-64 flex flex-col justify-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#79FFFF]/20 border border-[#79FFFF]/30 flex items-center justify-center">
              <span className="text-[#79FFFF] font-semibold text-sm">02</span>
            </div>
          </div>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings w-8 h-8 text-white" aria-hidden="true">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-3">{t("nasilcalisir_lisansolustur")}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{t("nasilcalisir_yazilimiyukle")}</p>
          </div>
        </div>
      </div>

      <div className="relative group flex flex-col items-center">
        <div className="absolute top-[132px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white/40 rounded-full"></div>
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 h-64 flex flex-col justify-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#79FFFF]/20 border border-[#79FFFF]/30 flex items-center justify-center">
              <span className="text-[#79FFFF] font-semibold text-sm">03</span>
            </div>
          </div>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap w-8 h-8 text-white" aria-hidden="true">
                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
              </svg>
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-3">{t("nasilcalisir_yaziliminatanimla")}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{t("nasilcalisir_sistemietkinlestir")}</p>
          </div>
        </div>
      </div>

      <div className="relative group flex flex-col items-center">
        <div className="absolute top-[132px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white/40 rounded-full"></div>
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 h-64 flex flex-col justify-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#79FFFF]/20 border border-[#79FFFF]/30 flex items-center justify-center">
              <span className="text-[#79FFFF] font-semibold text-sm">04</span>
            </div>
          </div>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-target w-8 h-8 text-white" aria-hidden="true">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="6"></circle>
                <circle cx="12" cy="12" r="2"></circle>
              </svg>
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-3">{t("nasilcalisir_testetvekullanmayabasla")}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{t("nasilcalisir_testetvekullan")}</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div className="lg:hidden space-y-8">
    <div className="relative">
      <div className="absolute left-8 top-24 w-px h-16 bg-white/20"></div>
      <div className="flex items-center gap-6 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 h-28">
        <div className="flex-shrink-0">
          <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cable w-7 h-7 text-white" aria-hidden="true">
              <path d="M17 21v-2a1 1 0 0 1-1-1v-1a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1"></path>
              <path d="M19 15V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V9"></path>
              <path d="M21 21v-2h-4"></path>
              <path d="M3 5h4V3"></path>
              <path d="M7 5a1 1 0 0 1 1 1v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1V3"></path>
            </svg>
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#79FFFF]/20 border border-[#79FFFF]/30 flex items-center justify-center">
            <span className="text-[#79FFFF] font-semibold text-sm">01</span>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">Bağlantı</h3>
          <p className="text-gray-400 text-sm">Cihazı USB'ye tak, mouse'u bağla</p>
        </div>
      </div>
    </div>
  </div>
</div>

    </div>
  )
}

export default NasilCalisir

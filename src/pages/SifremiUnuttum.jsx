import React from 'react'
import AnimatedBackground from '../components/AnimasyonluBackground'
import { Mail } from "lucide-react"

function SifremiUnuttum() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-12">
        <AnimatedBackground/>
        <>
        <div className="relative z-10 w-full max-w-md">
            <div className='bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl shadow2-xl p-8'>
                <div className='text-center mb-8'>
                    <div className='inline-flex items-center justify-center w-20 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 mb-4'>
                        <span className='text-white font-bold text-2xl'>VF</span>
                    </div>
                    <h2 className='text-3xl font-bold text-white mb-2'>Şifremi Unuttum</h2>
                    <p className='text-gray-400'>Şifrenizi sıfırlamak için lütfen eposta adresinizi giriniz.</p>
                </div>

                <form className='space-y-6'>
                    <label htmlFor='email' className='block text-sm font-medium text-gray-300 mb-2'>E-posta adresiniz</label>
                    <div className='relative'>
                        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                        type='email'
                        id='email'
                        name='email'
                        value={FormData.email}
                        className={'block w-full pl-10 pr-3 py-3 bg-slate-900/50 border text-white'}
                        />
                        
                    </div>
                
                
                </form>

            </div> 
        </div>
        </>

    </div>
  )
}

export default SifremiUnuttum
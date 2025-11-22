import AnimatedBackground from "../components/AnimasyonluBackground";
import BiziTercihEt from "../components/BiziTercihEt";
import { useTranslation } from "react-i18next";
import NasilCalisir from "../components/NasilCalisir";
import FiyatlandirmaPlanlar from "../components/FiyatlandirmaPlanlar";

export default function Home() {

  const { t } = useTranslation();
  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
      
      <AnimatedBackground/>
      <div className="relative z-10">
    <BiziTercihEt/>
    
      asdasd

      <NasilCalisir/>

      <FiyatlandirmaPlanlar/>
   

      </div>
    </section>
  );
}

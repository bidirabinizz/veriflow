import AnimatedBackground from "../components/AnimasyonluBackground";
import { useTranslation } from "react-i18next";
import FiyatlandirmaPlanlar from "../components/FiyatlandirmaPlanlar";


export default function About() {
  
  const { t } = useTranslation();

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
      <AnimatedBackground/>
      
      <div className="relative z-10">

  <FiyatlandirmaPlanlar/>
      </div>

  

    </section>
  );
}

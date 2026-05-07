import { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Users, 
  ArrowRight, Mail, Phone, MapPin, Shield, CheckCircle2,
  ClipboardList, Target, TrendingUp, Settings, Layers
} from 'lucide-react';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
});

const responsibilities = [
  { icon: Target, title: 'Strategic Planning', desc: 'Develops and implements comprehensive plans and strategies for provincial management and administration.' },
  { icon: Settings, title: 'Service Delivery', desc: 'Ensures efficient delivery of government services to the public across all provincial departments.' },
  { icon: Layers, title: 'Policy Implementation', desc: 'Oversees the implementation of policies and programs for effective governance.' },
  { icon: Users, title: 'Personnel Management', desc: 'Manages and coordinates provincial staff and human resources across departments.' },
  { icon: ClipboardList, title: 'Administrative Oversight', desc: 'Provides administrative supervision and coordination of provincial operations.' },
  { icon: TrendingUp, title: 'Performance Monitoring', desc: 'Monitors and evaluates the performance of provincial programs and services.' },
];

const keyFunctions = [
  'Development and implementation of strategic plans',
  'Management and administration of provincial services',
  'Coordination of departmental operations',
  'Oversight of service delivery to the public',
  'Implementation of provincial policies and programs',
  'Personnel and human resource management',
  'Budget and resource allocation coordination',
  'Performance monitoring and evaluation',
];

export default function ProvincialAdministratorPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative bg-gradient-to-br from-indigo-600 via-blue-700 to-cyan-700 overflow-hidden px-8 lg:px-16 py-16 lg:py-24"
      >
        {/* subtle decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 left-48 w-52 h-52 rounded-full bg-white/4 pointer-events-none" />

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div {...fade(0.1)} className="relative">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-200 inline-block" />
              Provincial Administrator's Office — Province of Bataan
            </div>

            <h1 className="text-4xl lg:text-6xl font-serif font-bold text-white leading-tight mb-6">
              Provincial{' '}
              <span className="italic text-cyan-200">Administrator's</span>
              <br />
              Office
            </h1>

            <p className="text-base lg:text-lg text-white/70 leading-relaxed mb-10 max-w-xl">
              Responsible for the development and implementation of plans and strategies 
              concerning the management and administration for the delivery of services to the public.
            </p>

            <div className="flex flex-wrap gap-3">
              <button className="bg-white text-indigo-700 font-semibold text-sm px-6 py-3 rounded-lg inline-flex items-center gap-2 hover:bg-cyan-50 transition-colors">
                Learn More <ArrowRight className="w-4 h-4" />
              </button>
              <button className="bg-transparent text-white border border-white/40 font-medium text-sm px-6 py-3 rounded-lg hover:bg-white/10 hover:border-white transition-colors">
                Contact Us
              </button>
            </div>
          </motion.div>

          {/* Bataan Seal */}
          <motion.div 
            {...fade(0.3)}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl scale-110" />
              <img
                src="/images/bataan-seal-icon.png.png"
                alt="Bataan Seal"
                className="relative w-64 h-64 lg:w-96 lg:h-96 object-contain drop-shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── MANDATE BAR ── */}
      <div className="bg-slate-50 border-b border-slate-200 px-8 lg:px-16 py-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-indigo-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-700 mb-2">Official Mandate</h3>
            <p className="text-slate-700 leading-relaxed">
              Responsible in the development and implementation of plans and strategies concerning 
              the management and administration for the delivery of services to the public.
            </p>
          </div>
        </div>
      </div>

      {/* ── ABOUT ── */}
      <section className="px-8 lg:px-16 py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Text */}
          <motion.div {...fadeIn(0)}>
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full mb-5">
              About the Office
            </span>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-800 leading-snug mb-6">
              Leading Provincial Administration and Management
            </h2>
            <div className="space-y-4 text-slate-600 text-[15px] leading-relaxed">
              <p>
                The Provincial Administrator's Office serves as the central administrative body of the 
                Province of Bataan, responsible for developing and implementing comprehensive plans and 
                strategies that guide the management and administration of provincial services.
              </p>
              <p>
                As the chief administrative officer, the Provincial Administrator ensures the efficient 
                delivery of government services to the public by coordinating various provincial departments, 
                implementing policies, and overseeing the day-to-day operations of the provincial government.
              </p>
              <p>
                The office plays a crucial role in translating the vision and policies of the provincial 
                leadership into actionable programs and services that directly benefit the citizens of Bataan, 
                ensuring transparency, accountability, and excellence in public service delivery.
              </p>
            </div>

            <div className="mt-8 bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h4 className="text-sm font-bold text-slate-800 mb-4">Key Functions</h4>
              <ul className="space-y-2.5">
                {keyFunctions.map((func, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13.5px] text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span>{func}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Contact Card */}
          <motion.div {...fadeIn(0.15)} className="sticky top-6">
            <div className="bg-gradient-to-br from-indigo-600 via-blue-700 to-cyan-700 rounded-2xl p-8 text-white">
              <h3 className="text-xl font-serif font-bold mb-3">Provincial Administrator's Office</h3>
              <p className="text-sm text-white/80 leading-relaxed mb-6">
                The central administrative office responsible for strategic planning, policy implementation, 
                and service delivery coordination across the province.
              </p>

              <hr className="border-white/15 mb-6" />

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-white/60 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-white/85">
                    7th Floor, The Bunker Building, Capitol Compound,<br />
                    San Jose, Balanga City, Bataan 2100 PH
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <a href="mailto:admin@bataan.gov.ph" className="text-sm text-white/90 hover:underline">
                    admin@bataan.gov.ph
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <div className="text-sm text-white/90">
                    <a href="tel:+639190791367" className="hover:underline">0919-079-1367</a>
                    <span className="text-white/60"> / </span>
                    <a href="tel:+639190791378" className="hover:underline">0919-079-1378</a>
                    <span className="text-white/60"> / </span>
                    <a href="tel:+639992211277" className="hover:underline">0999-221-1277</a>
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  window.open(
                    'https://maps.google.com/?q=Capitol+Compound+San+Jose+Balanga+City+Bataan',
                    '_blank'
                  )
                }
                className="mt-6 w-full flex items-center justify-center gap-2 bg-white/15 border border-white/25 hover:bg-white/22 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Get Directions
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── RESPONSIBILITIES ── */}
      <section className="bg-slate-50 px-8 lg:px-16 py-16 lg:py-20">
        <motion.div {...fadeIn(0)} className="mb-10">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full mb-5">
            Core Responsibilities
          </span>
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-800 mb-3">
            Areas of Responsibility
          </h2>
          <p className="text-[15px] text-slate-600 max-w-xl leading-relaxed">
            The Provincial Administrator oversees key areas of provincial governance and administration.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {responsibilities.map((resp, i) => (
            <motion.div
              key={i}
              {...fadeIn(i * 0.08)}
              className="bg-white border border-slate-200 rounded-xl p-7 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/8 transition-all duration-200"
            >
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-5">
                <resp.icon className="w-5 h-5 text-indigo-700" />
              </div>
              <h3 className="text-[15px] font-bold text-slate-800 mb-2">{resp.title}</h3>
              <p className="text-[13.5px] text-slate-600 leading-relaxed">{resp.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="bg-gradient-to-br from-indigo-600 via-blue-700 to-cyan-700 px-8 lg:px-16 py-16 lg:py-20 text-center">
        <motion.div {...fadeIn(0)}>
          <h2 className="text-3xl lg:text-5xl font-serif font-bold text-white mb-4">
            Excellence in Public Administration
          </h2>
          <p className="text-base text-white/70 max-w-lg mx-auto leading-relaxed">
            Through strategic planning and effective management, we ensure the delivery of 
            quality services to every citizen of Bataan.
          </p>
        </motion.div>
      </section>

    </div>
  );
}

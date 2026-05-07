import { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Users, FileText, Scale, Gavel, 
  ArrowRight, Mail, Phone, MapPin, Shield, BookOpen, CheckCircle2
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
  { icon: Gavel, title: 'Presiding Officer', desc: 'Serves as the presiding officer of the Sangguniang Panlalawigan, leading legislative sessions and deliberations.' },
  { icon: FileText, title: 'Warrant Signing', desc: 'Signs all warrants drawn from the Provincial Treasury for expenditures appropriated for Sangguniang Panlalawigan operations.' },
  { icon: Scale, title: 'Legislative Oversight', desc: 'Ensures proper conduct of legislative proceedings and maintains order during Sangguniang sessions.' },
  { icon: Users, title: 'Council Leadership', desc: 'Provides leadership and guidance to all members of the Sangguniang Panlalawigan.' },
  { icon: BookOpen, title: 'Policy Review', desc: 'Reviews and facilitates the passage of ordinances, resolutions, and other legislative measures.' },
  { icon: Shield, title: 'Provincial Representation', desc: 'Represents the legislative body in official functions and provincial matters.' },
];

const keyFunctions = [
  'Presides over all sessions of the Sangguniang Panlalawigan',
  'Signs warrants for all SP operational expenditures',
  'Ensures compliance with legislative procedures and protocols',
  'Coordinates with provincial departments on legislative matters',
  'Facilitates communication between executive and legislative branches',
  'Oversees the preparation and approval of the legislative agenda',
];

export default function ViceGovernorPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative bg-gradient-to-br from-red-600 via-red-700 to-rose-800 overflow-hidden px-8 lg:px-16 py-16 lg:py-24"
      >
        {/* subtle decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 left-48 w-52 h-52 rounded-full bg-white/4 pointer-events-none" />

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div {...fade(0.1)} className="relative">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-red-200 inline-block" />
              Provincial Vice-Governor's Office — Province of Bataan
            </div>

            <h1 className="text-4xl lg:text-6xl font-serif font-bold text-white leading-tight mb-6">
              Office of the{' '}
              <span className="italic text-red-200">Vice-Governor</span>,<br />
              Province of Bataan
            </h1>

            <p className="text-base lg:text-lg text-white/70 leading-relaxed mb-10 max-w-xl">
              The presiding officer of the Sangguniang Panlalawigan — leading legislative 
              sessions, signing warrants, and ensuring effective governance across the province.
            </p>

            <div className="flex flex-wrap gap-3">
              <button className="bg-white text-red-700 font-semibold text-sm px-6 py-3 rounded-lg inline-flex items-center gap-2 hover:bg-red-50 transition-colors">
                Learn More <ArrowRight className="w-4 h-4" />
              </button>
              <button className="bg-transparent text-white border border-white/40 font-medium text-sm px-6 py-3 rounded-lg hover:bg-white/10 hover:border-white transition-colors">
                Contact Us
              </button>
            </div>
          </motion.div>

          {/* SP Logo */}
          <motion.div 
            {...fade(0.3)}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl scale-110" />
              <img
                src="/images/sp-logo.png.png"
                alt="Sangguniang Panlalawigan Logo"
                className="relative w-64 h-64 lg:w-96 lg:h-96 object-contain drop-shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── MANDATE BAR ── */}
      <div className="bg-slate-50 border-b border-slate-200 px-8 lg:px-16 py-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-red-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-red-700 mb-2">Official Mandate</h3>
            <p className="text-slate-700 leading-relaxed">
              The Vice Governor shall be the presiding officer of the Sangguniang Panlalawigan 
              and signs all warrants drawn from the Provincial Treasury for all expenditures 
              appropriated for the operation of the Sangguniang Panlalawigan.
            </p>
          </div>
        </div>
      </div>

      {/* ── ABOUT ── */}
      <section className="px-8 lg:px-16 py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Text */}
          <motion.div {...fadeIn(0)}>
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-red-700 bg-red-50 px-3 py-1 rounded-full mb-5">
              About the Office
            </span>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-800 leading-snug mb-6">
              Leading the Legislative Body of Bataan
            </h2>
            <div className="space-y-4 text-slate-600 text-[15px] leading-relaxed">
              <p>
                The Office of the Vice-Governor serves as the legislative leadership of the Province of Bataan. 
                As the presiding officer of the Sangguniang Panlalawigan (Provincial Council), the Vice-Governor 
                ensures the smooth conduct of legislative sessions and the proper execution of the council's functions.
              </p>
              <p>
                With the authority to sign all warrants drawn from the Provincial Treasury for expenditures 
                appropriated for the Sangguniang Panlalawigan's operations, the Vice-Governor plays a crucial 
                role in maintaining fiscal responsibility and transparency in legislative operations.
              </p>
              <p>
                The office works closely with council members, provincial departments, and the executive branch 
                to ensure that legislative measures serve the best interests of all Bataeños and contribute to 
                the province's continued development and progress.
              </p>
            </div>

            <div className="mt-8 bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h4 className="text-sm font-bold text-slate-800 mb-4">Key Functions</h4>
              <ul className="space-y-2.5">
                {keyFunctions.map((func, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13.5px] text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>{func}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Contact Card */}
          <motion.div {...fadeIn(0.15)} className="sticky top-6">
            <div className="bg-gradient-to-br from-red-600 via-red-700 to-rose-800 rounded-2xl p-8 text-white">
              <h3 className="text-xl font-serif font-bold mb-3">Provincial Vice-Governor's Office</h3>
              <p className="text-sm text-white/80 leading-relaxed mb-6">
                The presiding officer of the Sangguniang Panlalawigan, responsible for leading 
                legislative sessions and signing all warrants for council operations.
              </p>

              <hr className="border-white/15 mb-6" />

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-white/60 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-white/85">
                    6th Floor, The Bunker Bldg., Capitol Compound,<br />
                    San Jose, Balanga City, Bataan 2100 PH
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <a href="mailto:vicegovernor@bataan.gov.ph" className="text-sm text-white/90 hover:underline">
                    vicegovernor@bataan.gov.ph
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <a href="tel:+6347240-5877" className="text-sm text-white/90 hover:underline">
                    (047) 240-5877
                  </a>
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
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-red-700 bg-red-50 px-3 py-1 rounded-full mb-5">
            Responsibilities
          </span>
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-800 mb-3">
            Core Duties & Functions
          </h2>
          <p className="text-[15px] text-slate-600 max-w-xl leading-relaxed">
            The Vice-Governor's office carries out essential legislative and administrative functions 
            to ensure effective governance.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {responsibilities.map((resp, i) => (
            <motion.div
              key={i}
              {...fadeIn(i * 0.08)}
              className="bg-white border border-slate-200 rounded-xl p-7 hover:border-red-400 hover:shadow-lg hover:shadow-red-500/8 transition-all duration-200"
            >
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mb-5">
                <resp.icon className="w-5 h-5 text-red-700" />
              </div>
              <h3 className="text-[15px] font-bold text-slate-800 mb-2">{resp.title}</h3>
              <p className="text-[13.5px] text-slate-600 leading-relaxed">{resp.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="bg-gradient-to-br from-red-600 via-red-700 to-rose-800 px-8 lg:px-16 py-16 lg:py-20 text-center">
        <motion.div {...fadeIn(0)}>
          <h2 className="text-3xl lg:text-5xl font-serif font-bold text-white mb-4">
            Legislative Excellence for Bataan
          </h2>
          <p className="text-base text-white/70 max-w-lg mx-auto leading-relaxed">
            Through dedicated leadership and effective governance, the Sangguniang Panlalawigan 
            works to serve every citizen of our province.
          </p>
        </motion.div>
      </section>

    </div>
  );
}

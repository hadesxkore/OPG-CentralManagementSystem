import { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Users, FileText, Gavel, 
  ArrowRight, Mail, Phone, MapPin, Shield, BookOpen, CheckCircle2,
  Building2, ClipboardList, UserCheck, FileCheck
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

const services = [
  { icon: FileText, title: 'Ordinances & Resolutions', desc: 'Prepares and issues certified true copies of ordinances and resolutions passed by the council.' },
  { icon: ClipboardList, title: 'Legislative Documentation', desc: 'Maintains comprehensive records of all legislative proceedings and committee activities.' },
  { icon: BookOpen, title: 'Public Hearings', desc: 'Organizes and documents public hearings for transparency and community engagement.' },
  { icon: FileCheck, title: 'Committee Services', desc: 'Provides administrative support to Sanggunian committees and their operations.' },
  { icon: UserCheck, title: 'Memoranda & Notices', desc: 'Issues official memoranda and notices for legislative matters and council activities.' },
  { icon: Building2, title: 'Legislative Support', desc: 'Offers comprehensive support services for all legislative functions and requirements.' },
];

const keyFunctions = [
  'Prepares certified true copies of ordinances and resolutions',
  'Maintains official records of Sanggunian proceedings',
  'Coordinates public hearings and community consultations',
  'Provides secretariat services to legislative committees',
  'Issues official notices and memoranda',
  'Manages legislative documentation and archives',
  'Facilitates communication between council members',
  'Ensures compliance with legislative procedures',
];

export default function SangguniangPanlalawiganPage() {
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
              Sangguniang Panlalawigan — Province of Bataan
            </div>

            <h1 className="text-4xl lg:text-6xl font-serif font-bold text-white leading-tight mb-6">
              Sangguniang{' '}
              <span className="italic text-red-200">Panlalawigan</span>
              <br />
              <span className="text-3xl lg:text-4xl">Provincial Council of Bataan</span>
            </h1>

            <p className="text-base lg:text-lg text-white/70 leading-relaxed mb-10 max-w-xl">
              The legislative body of the Province of Bataan — preparing and issuing certified 
              documents, managing legislative services, and supporting the council's operations.
            </p>

            <div className="flex flex-wrap gap-3">
              <button className="bg-white text-red-700 font-semibold text-sm px-6 py-3 rounded-lg inline-flex items-center gap-2 hover:bg-red-50 transition-colors">
                View Services <ArrowRight className="w-4 h-4" />
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
              Prepares and issues certified true copies of ordinances, resolutions, memoranda 
              and notices of Sanggunian committees, public hearings and other legislative services.
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
              The Legislative Secretariat of Bataan
            </h2>
            <div className="space-y-4 text-slate-600 text-[15px] leading-relaxed">
              <p>
                The Sangguniang Panlalawigan serves as the legislative body of the Province of Bataan, 
                responsible for enacting ordinances, approving resolutions, and appropriating funds for 
                the general welfare of the province and its inhabitants.
              </p>
              <p>
                As the secretariat of the provincial council, the office prepares and maintains certified 
                true copies of all legislative documents, including ordinances, resolutions, memoranda, 
                and notices. It provides essential administrative support to ensure the smooth operation 
                of legislative functions.
              </p>
              <p>
                The office also coordinates public hearings, manages committee documentation, and facilitates 
                communication between council members, provincial departments, and the public, ensuring 
                transparency and accountability in all legislative processes.
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
              <h3 className="text-xl font-serif font-bold mb-3">Sangguniang Panlalawigan</h3>
              <p className="text-sm text-white/80 leading-relaxed mb-6">
                The legislative secretariat providing comprehensive support services for the 
                Provincial Council of Bataan.
              </p>

              <hr className="border-white/15 mb-6" />

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-white/60 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-white/85">
                    6th Floor, The Bunker @ The Capitol Compound,<br />
                    Tenejero, Balanga City, Bataan 2100
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <a href="mailto:spsecretariat@bataan.gov.ph" className="text-sm text-white/90 hover:underline">
                    spsecretariat@bataan.gov.ph
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <div className="text-sm text-white/90">
                    <a href="tel:+6347633-3135" className="hover:underline">(047) 633-3135</a>
                    <span className="text-white/60"> / </span>
                    <a href="tel:+639190791367" className="hover:underline">0919-0791367</a>
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  window.open(
                    'https://maps.google.com/?q=Capitol+Compound+Tenejero+Balanga+City+Bataan',
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

      {/* ── SERVICES ── */}
      <section className="bg-slate-50 px-8 lg:px-16 py-16 lg:py-20">
        <motion.div {...fadeIn(0)} className="mb-10">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-red-700 bg-red-50 px-3 py-1 rounded-full mb-5">
            Our Services
          </span>
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-800 mb-3">
            Legislative Support Services
          </h2>
          <p className="text-[15px] text-slate-600 max-w-xl leading-relaxed">
            Comprehensive secretariat services supporting the legislative functions of the Provincial Council.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((svc, i) => (
            <motion.div
              key={i}
              {...fadeIn(i * 0.08)}
              className="bg-white border border-slate-200 rounded-xl p-7 hover:border-red-400 hover:shadow-lg hover:shadow-red-500/8 transition-all duration-200"
            >
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mb-5">
                <svc.icon className="w-5 h-5 text-red-700" />
              </div>
              <h3 className="text-[15px] font-bold text-slate-800 mb-2">{svc.title}</h3>
              <p className="text-[13.5px] text-slate-600 leading-relaxed">{svc.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── ORGANIZATIONAL STRUCTURE ── */}
      <section className="px-8 lg:px-16 py-16 lg:py-20">
        <motion.div {...fadeIn(0)} className="mb-10">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-red-700 bg-red-50 px-3 py-1 rounded-full mb-5">
            Organization
          </span>
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-800 mb-3">
            Organizational Structure
          </h2>
          <p className="text-[15px] text-slate-600 max-w-xl leading-relaxed">
            The hierarchical structure of the Sangguniang Panlalawigan and its various committees.
          </p>
        </motion.div>

        <motion.div 
          {...fadeIn(0.2)}
          className="bg-white border-2 border-slate-200 rounded-2xl p-6 lg:p-8 shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">SP Organizational Chart 2022</h3>
            <button 
              onClick={() => window.open('/images/SP-Organizational-Structure_2022-1175x1536.jpg.png', '_blank')}
              className="text-sm font-semibold text-red-700 hover:text-red-800 flex items-center gap-2"
            >
              View Full Size
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="relative bg-slate-50 rounded-xl overflow-hidden">
            <img
              src="/images/SP-Organizational-Structure_2022-1175x1536.jpg.png"
              alt="Sangguniang Panlalawigan Organizational Structure"
              className="w-full h-auto object-contain"
            />
          </div>

          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-red-700" />
                <h4 className="text-sm font-bold text-slate-800">Council Members</h4>
              </div>
              <p className="text-xs text-slate-600">
                Elected officials representing various districts and sectors
              </p>
            </div>

            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <Gavel className="w-4 h-4 text-red-700" />
                <h4 className="text-sm font-bold text-slate-800">Committees</h4>
              </div>
              <p className="text-xs text-slate-600">
                Specialized committees handling specific legislative areas
              </p>
            </div>

            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-red-700" />
                <h4 className="text-sm font-bold text-slate-800">Secretariat</h4>
              </div>
              <p className="text-xs text-slate-600">
                Administrative support staff and legislative services
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="bg-gradient-to-br from-red-600 via-red-700 to-rose-800 px-8 lg:px-16 py-16 lg:py-20 text-center">
        <motion.div {...fadeIn(0)}>
          <h2 className="text-3xl lg:text-5xl font-serif font-bold text-white mb-4">
            Serving Through Legislation
          </h2>
          <p className="text-base text-white/70 max-w-lg mx-auto leading-relaxed">
            The Sangguniang Panlalawigan works to enact laws and policies that benefit 
            every citizen of Bataan through transparent and effective governance.
          </p>
        </motion.div>
      </section>

    </div>
  );
}

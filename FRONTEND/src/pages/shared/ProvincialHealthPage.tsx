import { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Heart, Activity, Stethoscope, 
  ArrowRight, Mail, Phone, MapPin, Shield, CheckCircle2,
  Users, Building2, Droplet, Baby, UserCheck, Syringe
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
  { icon: Stethoscope, title: 'Comprehensive Health Services', desc: 'Integrated implementation of health, medical, and dental services across all facilities.' },
  { icon: Building2, title: 'Hospital Upgrading', desc: 'Development and upgrading of hospitals and health centers as centers for wellness.' },
  { icon: Shield, title: 'Preventive Programs', desc: 'Intensified implementation of all preventive and control programs.' },
  { icon: UserCheck, title: 'Service Provider Development', desc: 'Developing capabilities of service providers for quality healthcare delivery.' },
  { icon: Droplet, title: 'Environmental Sanitation', desc: 'Promotes environmental sanitation and enforces health and sanitation standards.' },
  { icon: Baby, title: 'Maternal & Child Health', desc: 'Focused programs to decrease morbidity and mortality among children and mothers.' },
];

const keyFunctions = [
  'Coordinate integrated health and medical services',
  'Implement preventive and control programs',
  'Develop capabilities of healthcare providers',
  'Upgrade hospitals and health centers',
  'Promote environmental sanitation',
  'Enforce health and sanitation standards',
  'Provide quality dental services',
  'Collaborate with various health sectors',
  'Decrease morbidity and mortality rates',
  'Promote health awareness and good practices',
];

export default function ProvincialHealthPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative bg-gradient-to-br from-teal-600 via-cyan-700 to-blue-700 overflow-hidden px-8 lg:px-16 py-16 lg:py-24"
      >
        {/* subtle decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 left-48 w-52 h-52 rounded-full bg-white/4 pointer-events-none" />

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div {...fade(0.1)} className="relative">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-200 inline-block" />
              Provincial Health Office — Province of Bataan
            </div>

            <h1 className="text-4xl lg:text-6xl font-serif font-bold text-white leading-tight mb-6">
              Provincial{' '}
              <span className="italic text-teal-200">Health</span>
              <br />
              Office
            </h1>

            <p className="text-base lg:text-lg text-white/70 leading-relaxed mb-10 max-w-xl">
              Providing quality health services through intensified preventive programs, 
              developing healthcare capabilities, and upgrading facilities as centers for wellness.
            </p>

            <div className="flex flex-wrap gap-3">
              <button className="bg-white text-teal-700 font-semibold text-sm px-6 py-3 rounded-lg inline-flex items-center gap-2 hover:bg-teal-50 transition-colors">
                Our Services <ArrowRight className="w-4 h-4" />
              </button>
              <button className="bg-transparent text-white border border-white/40 font-medium text-sm px-6 py-3 rounded-lg hover:bg-white/10 hover:border-white transition-colors">
                Contact Us
              </button>
            </div>
          </motion.div>

          {/* PHO Logo */}
          <motion.div 
            {...fade(0.3)}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl scale-110" />
              <img
                src="/images/pho-logo.png.png"
                alt="Provincial Health Office Logo"
                className="relative w-64 h-64 lg:w-96 lg:h-96 object-contain drop-shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── MISSION BAR ── */}
      <div className="bg-slate-50 border-b border-slate-200 px-8 lg:px-16 py-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Heart className="w-6 h-6 text-teal-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-teal-700 mb-2">Mission</h3>
            <p className="text-slate-700 leading-relaxed">
              To provide quality health services in all facilities, through intensified implementation 
              of all preventive & control programs, develop capabilities of service providers & upgrading 
              of hospitals, health center under the Provincial Government as center for wellness.
            </p>
          </div>
        </div>
      </div>

      {/* ── VISION BAR ── */}
      <div className="bg-white border-b border-slate-200 px-8 lg:px-16 py-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Activity className="w-6 h-6 text-teal-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-teal-700 mb-2">Vision</h3>
            <p className="text-slate-700 leading-relaxed">
              All health facilities under the Provincial Government are accessible, managed by competent 
              & committed health workers capable of providing quality services and actively collaborating 
              with various sectors in health service delivery, hence a decrease in morbidity/mortality of 
              prevailing diseases among under five children, mothers & the general populace with high level 
              of awareness & good health practices.
            </p>
          </div>
        </div>
      </div>

      {/* ── MANDATE BAR ── */}
      <div className="bg-slate-50 border-b border-slate-200 px-8 lg:px-16 py-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-teal-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-teal-700 mb-2">Official Mandate</h3>
            <p className="text-slate-700 leading-relaxed">
              Coordinates integrated implementation of a comprehensive health and medical and dental services, 
              promotes environmental sanitation and enforces health and sanitation standards.
            </p>
          </div>
        </div>
      </div>

      {/* ── ABOUT ── */}
      <section className="px-8 lg:px-16 py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Text */}
          <motion.div {...fadeIn(0)}>
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full mb-5">
              About the Office
            </span>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-800 leading-snug mb-6">
              Delivering Quality Healthcare for All Bataeños
            </h2>
            <div className="space-y-4 text-slate-600 text-[15px] leading-relaxed">
              <p>
                The Provincial Health Office serves as the primary healthcare coordinating body of the 
                Province of Bataan, responsible for the integrated implementation of comprehensive health, 
                medical, and dental services across all provincial health facilities. The office ensures 
                that quality healthcare is accessible to all residents of the province.
              </p>
              <p>
                Through intensified preventive and control programs, the office works to reduce morbidity 
                and mortality rates, particularly among vulnerable populations such as children under five 
                and mothers. The PHO is committed to developing the capabilities of healthcare service 
                providers and continuously upgrading hospitals and health centers to serve as true centers 
                for wellness.
              </p>
              <p>
                The office also plays a crucial role in promoting environmental sanitation and enforcing 
                health and sanitation standards throughout the province. By actively collaborating with 
                various sectors in health service delivery, the PHO ensures a comprehensive approach to 
                public health that benefits the entire community.
              </p>
            </div>

            <div className="mt-8 bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h4 className="text-sm font-bold text-slate-800 mb-4">Key Functions</h4>
              <div className="grid sm:grid-cols-2 gap-x-4 gap-y-2.5">
                {keyFunctions.map((func, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-[13.5px] text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span>{func}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Card */}
          <motion.div {...fadeIn(0.15)} className="sticky top-6">
            <div className="bg-gradient-to-br from-teal-600 via-cyan-700 to-blue-700 rounded-2xl p-8 text-white">
              <h3 className="text-xl font-serif font-bold mb-3">Provincial Health Office</h3>
              <p className="text-sm text-white/80 leading-relaxed mb-6">
                Coordinating comprehensive health services, promoting wellness, and ensuring 
                quality healthcare delivery across the province.
              </p>

              <hr className="border-white/15 mb-6" />

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-white/60 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-white/85">
                    Tenejero, Balanga City, Bataan 2100 PH
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <a href="mailto:pho@bataan.gov.ph" className="text-sm text-white/90 hover:underline">
                    pho@bataan.gov.ph
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <a href="tel:+6347237-3270" className="text-sm text-white/90 hover:underline">
                    (047) 237-3270
                  </a>
                </div>
              </div>

              <button
                onClick={() =>
                  window.open(
                    'https://maps.google.com/?q=Tenejero+Balanga+City+Bataan',
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
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full mb-5">
            Our Services
          </span>
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-800 mb-3">
            Healthcare Services & Programs
          </h2>
          <p className="text-[15px] text-slate-600 max-w-xl leading-relaxed">
            Comprehensive health services designed to promote wellness and prevent disease across all communities.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((svc, i) => (
            <motion.div
              key={i}
              {...fadeIn(i * 0.08)}
              className="bg-white border border-slate-200 rounded-xl p-7 hover:border-teal-400 hover:shadow-lg hover:shadow-teal-500/8 transition-all duration-200"
            >
              <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center mb-5">
                <svc.icon className="w-5 h-5 text-teal-700" />
              </div>
              <h3 className="text-[15px] font-bold text-slate-800 mb-2">{svc.title}</h3>
              <p className="text-[13.5px] text-slate-600 leading-relaxed">{svc.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HEALTH PRIORITIES ── */}
      <section className="px-8 lg:px-16 py-16 lg:py-20">
        <motion.div {...fadeIn(0)} className="mb-10">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full mb-5">
            Health Priorities
          </span>
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-800 mb-3">
            Focus Areas for Better Health
          </h2>
          <p className="text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            Our strategic priorities aimed at improving health outcomes and reducing disease burden 
            across the province.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div {...fadeIn(0.1)} className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-xl p-6">
            <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center mb-4">
              <Baby className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Maternal & Child Health</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Decrease morbidity and mortality among under-five children and mothers through 
              targeted programs and quality care.
            </p>
          </motion.div>

          <motion.div {...fadeIn(0.2)} className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-xl p-6">
            <div className="w-12 h-12 bg-cyan-600 rounded-xl flex items-center justify-center mb-4">
              <Syringe className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Disease Prevention</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Intensified implementation of preventive and control programs to reduce the 
              burden of prevailing diseases.
            </p>
          </motion.div>

          <motion.div {...fadeIn(0.3)} className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Health Awareness</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Promoting high level of awareness and good health practices among the general 
              populace through education and outreach.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="bg-gradient-to-br from-teal-600 via-cyan-700 to-blue-700 px-8 lg:px-16 py-16 lg:py-20 text-center">
        <motion.div {...fadeIn(0)}>
          <h2 className="text-3xl lg:text-5xl font-serif font-bold text-white mb-4">
            Healthy Communities, Thriving Bataan
          </h2>
          <p className="text-base text-white/70 max-w-lg mx-auto leading-relaxed">
            Through quality healthcare services and collaborative partnerships, we work to 
            ensure the health and wellness of every Bataeño.
          </p>
        </motion.div>
      </section>

    </div>
  );
}

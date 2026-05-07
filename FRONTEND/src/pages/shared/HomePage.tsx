import { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Users, FileText, TrendingUp, Shield,
  Target, Heart, Briefcase, Award, Mail, Phone, MapPin,
  ArrowRight, Globe, Circle
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
  { icon: Building2, title: 'Infrastructure Development', desc: 'Building better roads, bridges, and facilities for improved connectivity.' },
  { icon: Users, title: 'Social Services', desc: 'Comprehensive welfare programs for all residents and communities.' },
  { icon: FileText, title: 'Budget Management', desc: 'Transparent and efficient management of provincial financial resources.' },
  { icon: TrendingUp, title: 'Economic Development', desc: 'Creating jobs and attracting investments to boost the local economy.' },
  { icon: Shield, title: 'Public Safety', desc: 'Ensuring security through coordinated law enforcement efforts.' },
  { icon: Heart, title: 'Healthcare Services', desc: 'Quality healthcare facilities and programs for all citizens of Bataan.' },
  { icon: Briefcase, title: 'Business Support', desc: 'Resources and assistance for entrepreneurs to grow and thrive locally.' },
  { icon: Award, title: 'Education Programs', desc: 'Scholarships and support for educational institutions and learners.' },
];

const objectives = [
  {
    icon: Target,
    title: 'Strengthen Capability',
    desc: 'Enhance the technical and managerial capacity of the provincial government to effectively respond to rural needs and development challenges across all municipalities.',
  },
  {
    icon: TrendingUp,
    title: 'Drive Economic Growth',
    desc: 'Lower transportation costs, promote equitable taxation, and expand investment and rural employment opportunities to boost the local economy for all residents.',
  },
  {
    icon: Users,
    title: 'Community Development',
    desc: 'Undertake targeted projects through provincial offices to alleviate the living conditions of the masses and improve the quality of life throughout Bataan.',
  },
];

const stats = [
  { icon: Globe, label: 'Municipalities', value: '11' },
  { icon: Users, label: 'Population Served', value: '850K+' },
  { icon: Building2, label: 'Provincial Offices', value: '50+' },
  { icon: Circle, label: 'Active Projects', value: '200+' },
];

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative bg-blue-700 overflow-hidden px-8 lg:px-16 py-16 lg:py-24"
      >
        {/* subtle decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 left-48 w-52 h-52 rounded-full bg-white/4 pointer-events-none" />

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div {...fade(0.1)} className="relative">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-200 inline-block" />
              Provincial Governor's Office — Province of Bataan
            </div>

            <h1 className="text-4xl lg:text-6xl font-serif font-bold text-white leading-tight mb-6">
              Office of the{' '}
              <span className="italic text-blue-200">Governor</span>,<br />
              Province of Bataan
            </h1>

            <p className="text-base lg:text-lg text-white/70 leading-relaxed mb-10 max-w-xl">
              The executive arm of the Provincial Government — exercising leadership,
              supervision, and socio-economic development across all municipalities and
              communities of Bataan.
            </p>

            <div className="flex flex-wrap gap-3">
              <button className="bg-white text-blue-700 font-semibold text-sm px-6 py-3 rounded-lg inline-flex items-center gap-2 hover:bg-blue-50 transition-colors">
                Explore Services <ArrowRight className="w-4 h-4" />
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

      {/* ── STATS BAR ── */}
      <div className="bg-slate-50 border-b border-slate-200 px-8 lg:px-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-slate-200">
          {stats.map((s, i) => (
            <div key={i} className="py-6 px-6 first:pl-0 last:pr-0">
              <p className="text-3xl font-serif font-bold text-blue-700 mb-1">{s.value}</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── ABOUT ── */}
      <section className="px-8 lg:px-16 py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Text */}
          <motion.div {...fadeIn(0)}>
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-700 bg-blue-50 px-3 py-1 rounded-full mb-5">
              About the Office
            </span>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-800 leading-snug mb-6">
              The Executive Arm of Bataan's Provincial Government
            </h2>
            <div className="space-y-4 text-slate-600 text-[15px] leading-relaxed">
              <p>
                The Office of the Governor serves as the executive arm of the Provincial Government of Bataan.
                The Provincial Governor is the Chief Executive Officer, exercising executive functions and
                general supervision over all municipalities and other political subdivisions situated within the province.
              </p>
              <p>
                As Chief Executive, the Provincial Governor — with the full assistance of provincial and national
                offices — aims to strengthen the government's managerial and technical capability to effectively
                respond to rural needs, reduce transportation costs, advance equitable taxation, and expand
                investment and rural employment opportunities.
              </p>
              <p>
                Through leadership and the work of different provincial offices, the Governor undertakes programs
                and projects to alleviate living conditions of the masses and ensure that all national and
                provincial progress goals are properly executed within the province.
              </p>
            </div>
          </motion.div>

          {/* Contact Card */}
          <motion.div {...fadeIn(0.15)} className="sticky top-6">
            <div className="bg-blue-700 rounded-2xl p-8 text-white">
              <h3 className="text-xl font-serif font-bold mb-3">Provincial Governor's Office</h3>
              <p className="text-sm text-white/80 leading-relaxed mb-6">
                Manages and supervises the PGO staff including the financial processing unit and social services —
                except IAS, OSM, MIS, BPPPIC, Iskolar ng Bataan, Cultural Heritage and Preservation, Housing, and
                other community affairs programs under the Provincial Administrator.
              </p>

              <hr className="border-white/15 mb-6" />

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-white/60 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-white/85">
                    7th Floor, The Bunker @ The Capitol Compound,<br />
                    Tenejero, Balanga City, Bataan 2100
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <a href="mailto:pgo@bataan.gov.ph" className="text-sm text-white/90 hover:underline">
                    pgo@bataan.gov.ph
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <a href="tel:+63476130991" className="text-sm text-white/90 hover:underline">
                    (047) 613-0991
                  </a>
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

      {/* ── OBJECTIVES ── */}
      <section className="bg-slate-50 px-8 lg:px-16 py-16 lg:py-20">
        <motion.div {...fadeIn(0)} className="mb-10">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-700 bg-blue-50 px-3 py-1 rounded-full mb-5">
            Objectives
          </span>
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-800 mb-3">
            What We Aim to Achieve
          </h2>
          <p className="text-[15px] text-slate-600 max-w-xl leading-relaxed">
            Guided by a clear vision for Bataan's future, the Governor's Office works toward these core objectives.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-5">
          {objectives.map((obj, i) => (
            <motion.div
              key={i}
              {...fadeIn(i * 0.08)}
              className="bg-white border border-slate-200 rounded-xl p-7 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/8 transition-all duration-200"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-5">
                <obj.icon className="w-5 h-5 text-blue-700" />
              </div>
              <h3 className="text-[15px] font-bold text-slate-800 mb-2">{obj.title}</h3>
              <p className="text-[13.5px] text-slate-600 leading-relaxed">{obj.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="px-8 lg:px-16 py-16 lg:py-20">
        <motion.div {...fadeIn(0)} className="mb-10">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-700 bg-blue-50 px-3 py-1 rounded-full mb-5">
            Our Services
          </span>
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-800 mb-3">
            Programs for Every Bataeño
          </h2>
          <p className="text-[15px] text-slate-600 max-w-xl leading-relaxed">
            Comprehensive programs designed to serve every citizen across the province.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((svc, i) => (
            <motion.div
              key={i}
              {...fadeIn(i * 0.05)}
              className="bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-400 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/8 transition-all duration-200"
            >
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <svc.icon className="w-4.5 h-4.5 text-blue-700" />
              </div>
              <h4 className="text-[13.5px] font-bold text-slate-800 mb-1.5">{svc.title}</h4>
              <p className="text-[12.5px] text-slate-600 leading-relaxed">{svc.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="bg-blue-700 px-8 lg:px-16 py-16 lg:py-20 text-center">
        <motion.div {...fadeIn(0)}>
          <h2 className="text-3xl lg:text-5xl font-serif font-bold text-white mb-4">
            Building a Better Bataan, Together
          </h2>
          <p className="text-base text-white/70 max-w-lg mx-auto leading-relaxed">
            Through dedicated service and collaborative leadership, we work to improve
            the lives of every citizen across our province.
          </p>
        </motion.div>
      </section>

    </div>
  );
}
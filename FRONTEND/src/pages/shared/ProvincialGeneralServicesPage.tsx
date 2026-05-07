import { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Package, Building, 
  ArrowRight, Mail, Phone, MapPin, Shield, CheckCircle2,
  Truck, ClipboardCheck, Users, Sparkles, Target, Briefcase
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
  { icon: Package, title: 'Property Custodian', desc: 'Acts as custodian of all provincial properties and assets, ensuring proper management and security.' },
  { icon: Truck, title: 'Supplies & Equipment', desc: 'Procures supplies, materials and equipment for various offices across the provincial government.' },
  { icon: Building, title: 'Facility Maintenance', desc: 'Maintains and promotes cleanliness of the Bunker Building and other public places.' },
  { icon: Users, title: 'Manpower Support', desc: 'Provides manpower support during special activities of the provincial government.' },
  { icon: ClipboardCheck, title: 'Asset Management', desc: 'Comprehensive management and tracking of all provincial assets and properties.' },
  { icon: Sparkles, title: 'Clean Environment', desc: 'Promotes clean, orderly and secure surroundings for a conducive working environment.' },
];

const missionPoints = [
  'Promotion of honest interest and effective public service for the Bataeños',
  'Promotion of clean, orderly and secure surroundings for a conducive working environment',
  'Provision of essential factors to uplift better performance of public servants',
];

const keyFunctions = [
  'Custodian of all provincial properties and assets',
  'Procurement of supplies, materials and equipment',
  'Maintenance of the Bunker Building premises',
  'Cleanliness promotion in public places',
  'Manpower support for special activities',
  'Asset inventory and management',
  'Property security and protection',
  'Coordination with various offices',
];

export default function ProvincialGeneralServicesPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative bg-gradient-to-br from-slate-700 via-gray-800 to-zinc-800 overflow-hidden px-8 lg:px-16 py-16 lg:py-24"
      >
        {/* subtle decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 left-48 w-52 h-52 rounded-full bg-white/4 pointer-events-none" />

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div {...fade(0.1)} className="relative">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block" />
              Provincial General Services Office — Province of Bataan
            </div>

            <h1 className="text-4xl lg:text-6xl font-serif font-bold text-white leading-tight mb-6">
              Provincial{' '}
              <span className="italic text-slate-300">General Services</span>
              <br />
              Office
            </h1>

            <p className="text-base lg:text-lg text-white/70 leading-relaxed mb-10 max-w-xl">
              Dedicated to the direct and responsible management, supervision, coordination and 
              planning of all general services for the provincial government.
            </p>

            <div className="flex flex-wrap gap-3">
              <button className="bg-white text-slate-800 font-semibold text-sm px-6 py-3 rounded-lg inline-flex items-center gap-2 hover:bg-slate-100 transition-colors">
                Our Services <ArrowRight className="w-4 h-4" />
              </button>
              <button className="bg-transparent text-white border border-white/40 font-medium text-sm px-6 py-3 rounded-lg hover:bg-white/10 hover:border-white transition-colors">
                Contact Us
              </button>
            </div>
          </motion.div>

          {/* PGSO Logo */}
          <motion.div 
            {...fade(0.3)}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl scale-110" />
              <img
                src="/images/pgso-logo.png.png"
                alt="Provincial General Services Office Logo"
                className="relative w-64 h-64 lg:w-96 lg:h-96 object-contain drop-shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── MISSION BAR ── */}
      <div className="bg-slate-50 border-b border-slate-200 px-8 lg:px-16 py-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">Mission</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              The Provincial General Services Office is dedicated to the direct and responsible management, 
              supervision, coordination and planning of over all general services for the:
            </p>
            <ul className="space-y-2">
              {missionPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[15px] text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── VISION BAR ── */}
      <div className="bg-white border-b border-slate-200 px-8 lg:px-16 py-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-2">Vision</h3>
            <p className="text-slate-700 leading-relaxed">
              The Provincial General Services Office in cooperation with all the Provincial Government 
              Offices and its officials shall strive to promote public interest and reach out to achieve 
              its highest goal to render the best authentic services for the welfare of the people of Bataan.
            </p>
          </div>
        </div>
      </div>

      {/* ── MANDATE BAR ── */}
      <div className="bg-slate-50 border-b border-slate-200 px-8 lg:px-16 py-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-2">Official Mandate</h3>
            <p className="text-slate-700 leading-relaxed">
              Acts as custodian of all provincial properties and assets, procures supplies, materials and 
              equipment for various offices, maintains and promotes cleanliness of the premises of the Bunker 
              Building, and other public places, provides manpower support during special activities of the 
              provincial government.
            </p>
          </div>
        </div>
      </div>

      {/* ── ABOUT ── */}
      <section className="px-8 lg:px-16 py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Text */}
          <motion.div {...fadeIn(0)}>
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-slate-700 bg-slate-100 px-3 py-1 rounded-full mb-5">
              About the Office
            </span>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-800 leading-snug mb-6">
              Managing Provincial Assets and Services
            </h2>
            <div className="space-y-4 text-slate-600 text-[15px] leading-relaxed">
              <p>
                The Provincial General Services Office serves as the central management body for all general 
                services within the Province of Bataan. The office is responsible for the direct and responsible 
                management, supervision, coordination, and planning of essential services that support the 
                operations of the provincial government.
              </p>
              <p>
                As the custodian of all provincial properties and assets, the PGSO ensures proper management, 
                security, and maintenance of government resources. The office procures supplies, materials, and 
                equipment for various provincial offices, ensuring that all departments have the necessary 
                resources to function effectively.
              </p>
              <p>
                The office is committed to promoting clean, orderly, and secure surroundings that create a 
                conducive working environment for public servants. Through the provision of essential factors 
                and manpower support, the PGSO uplifts the performance of public servants and contributes to 
                the delivery of honest and effective public service for all Bataeños.
              </p>
            </div>

            <div className="mt-8 bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h4 className="text-sm font-bold text-slate-800 mb-4">Key Functions</h4>
              <div className="grid sm:grid-cols-2 gap-x-4 gap-y-2.5">
                {keyFunctions.map((func, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-[13.5px] text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                    <span>{func}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Card */}
          <motion.div {...fadeIn(0.15)} className="sticky top-6">
            <div className="bg-gradient-to-br from-slate-700 via-gray-800 to-zinc-800 rounded-2xl p-8 text-white">
              <h3 className="text-xl font-serif font-bold mb-3">Provincial General Services Office</h3>
              <p className="text-sm text-white/80 leading-relaxed mb-6">
                Managing provincial assets, procuring supplies, maintaining facilities, and providing 
                essential support services for the provincial government.
              </p>

              <hr className="border-white/15 mb-6" />

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-white/60 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-white/85">
                    4th Floor, The Bunker, Capitol Compound,<br />
                    San Jose, Balanga City, Bataan 2100 PH
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <a href="mailto:gso@bataan.gov.ph" className="text-sm text-white/90 hover:underline">
                    gso@bataan.gov.ph
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <a href="tel:+639563320604" className="text-sm text-white/90 hover:underline">
                    0956-3320604
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

      {/* ── SERVICES ── */}
      <section className="bg-slate-50 px-8 lg:px-16 py-16 lg:py-20">
        <motion.div {...fadeIn(0)} className="mb-10">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-slate-700 bg-slate-100 px-3 py-1 rounded-full mb-5">
            Our Services
          </span>
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-800 mb-3">
            General Services & Support
          </h2>
          <p className="text-[15px] text-slate-600 max-w-xl leading-relaxed">
            Comprehensive support services ensuring efficient operations across the provincial government.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((svc, i) => (
            <motion.div
              key={i}
              {...fadeIn(i * 0.08)}
              className="bg-white border border-slate-200 rounded-xl p-7 hover:border-slate-400 hover:shadow-lg hover:shadow-slate-500/8 transition-all duration-200"
            >
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-5">
                <svc.icon className="w-5 h-5 text-slate-700" />
              </div>
              <h3 className="text-[15px] font-bold text-slate-800 mb-2">{svc.title}</h3>
              <p className="text-[13.5px] text-slate-600 leading-relaxed">{svc.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CORE VALUES ── */}
      <section className="px-8 lg:px-16 py-16 lg:py-20">
        <motion.div {...fadeIn(0)} className="mb-10">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-slate-700 bg-slate-100 px-3 py-1 rounded-full mb-5">
            Core Values
          </span>
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-800 mb-3">
            Our Commitment to Excellence
          </h2>
          <p className="text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            Guiding principles that drive our service delivery and operations.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div {...fadeIn(0.1)} className="bg-gradient-to-br from-slate-50 to-gray-50 border-2 border-slate-200 rounded-xl p-6">
            <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Honest Interest</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Promoting honest interest and integrity in all aspects of public service delivery 
              for the benefit of Bataeños.
            </p>
          </motion.div>

          <motion.div {...fadeIn(0.2)} className="bg-gradient-to-br from-gray-50 to-zinc-50 border-2 border-gray-200 rounded-xl p-6">
            <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center mb-4">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Effective Service</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Delivering effective and efficient public services through proper management 
              and coordination of resources.
            </p>
          </motion.div>

          <motion.div {...fadeIn(0.3)} className="bg-gradient-to-br from-zinc-50 to-slate-50 border-2 border-zinc-200 rounded-xl p-6">
            <div className="w-12 h-12 bg-zinc-700 rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Clean Environment</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Maintaining clean, orderly, and secure surroundings to create a conducive 
              working environment for all.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="bg-gradient-to-br from-slate-700 via-gray-800 to-zinc-800 px-8 lg:px-16 py-16 lg:py-20 text-center">
        <motion.div {...fadeIn(0)}>
          <h2 className="text-3xl lg:text-5xl font-serif font-bold text-white mb-4">
            Supporting Provincial Operations
          </h2>
          <p className="text-base text-white/70 max-w-lg mx-auto leading-relaxed">
            Through responsible management and dedicated service, we ensure the provincial 
            government has the resources and support needed to serve the people of Bataan.
          </p>
        </motion.div>
      </section>

    </div>
  );
}

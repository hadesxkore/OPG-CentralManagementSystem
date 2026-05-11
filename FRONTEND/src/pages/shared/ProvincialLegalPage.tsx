import { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Target, Eye, FileText, 
  ArrowRight, Mail, Phone, MapPin, Shield, CheckCircle2,
  Scale, Users, FileCheck, AlertTriangle, BookOpen, Gavel
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

const keyServices = [
  'Legal advice to walk-in clients',
  'Assist City/Municipalities in legal needs',
  'Assist the BAC for legal needs',
  'Coordinate with National Government Agencies',
  'Render legal support to various departments',
  'Evaluate repurchase of land applications',
  'Assist the PPIC for PPP proponents evaluation',
  'Act as legal adviser to the PTF/IATFC',
  'Legal representation and support',
  'Legal review of documents',
];

const duties = [
  {
    icon: Scale,
    title: 'Legal Representation',
    description: 'Represent the LGU in all civil actions and special proceedings wherein the LGU or any official thereof, in his official capacity, is a party.',
  },
  {
    icon: FileCheck,
    title: 'Document Drafting',
    description: 'When required by the governor or sanggunian, draft ordinances, contracts, bonds, leases and other instruments involving any interest of the LGU.',
  },
  {
    icon: BookOpen,
    title: 'Legal Opinions',
    description: 'Render his opinion in writing on any question of law when required to do so by the governor.',
  },
  {
    icon: AlertTriangle,
    title: 'Investigations',
    description: 'Investigate or cause to be investigated any local official or employee for administrative neglect or misconduct in office.',
  },
  {
    icon: Gavel,
    title: 'Civil Actions',
    description: 'When directed by the governor, initiate and prosecute, in the interest of the LGU concerned, any civil action on any bond, lease or other contract.',
  },
  {
    icon: Users,
    title: 'Review & Recommendations',
    description: 'Review and submit recommendations on ordinances approved and executive orders issued by component units.',
  },
];

export default function ProvincialLegalPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 overflow-hidden px-8 lg:px-16 py-16 lg:py-24"
      >
        {/* subtle decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 left-48 w-52 h-52 rounded-full bg-white/4 pointer-events-none" />

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div {...fade(0.1)} className="relative">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-200 inline-block" />
              Provincial Legal Office — Province of Bataan
            </div>

            <h1 className="text-4xl lg:text-6xl font-serif font-bold text-white leading-tight mb-6">
              Provincial{' '}
              <span className="italic text-amber-200">Legal</span>
              <br />
              Office
            </h1>

            <p className="text-base lg:text-lg text-white/70 leading-relaxed mb-10 max-w-xl">
              Providing fast and reliable legal services with integrity, excellence and 
              professionalism to support the Provincial Government.
            </p>

            <div className="flex flex-wrap gap-3">
              <button className="bg-white text-amber-700 font-semibold text-sm px-6 py-3 rounded-lg inline-flex items-center gap-2 hover:bg-amber-50 transition-colors">
                Our Services <ArrowRight className="w-4 h-4" />
              </button>
              <button className="bg-transparent text-white border border-white/40 font-medium text-sm px-6 py-3 rounded-lg hover:bg-white/10 hover:border-white transition-colors">
                Contact Us
              </button>
            </div>
          </motion.div>

          {/* Bataan Seal Logo */}
          <motion.div 
            {...fade(0.3)}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl scale-110" />
              <img
                src="/images/bataanlogo.png"
                alt="Bataan Provincial Seal"
                className="relative w-64 h-64 lg:w-96 lg:h-96 object-contain drop-shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── MANDATE BAR ── */}
      <div className="bg-slate-50 border-b border-slate-200 px-8 lg:px-16 py-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-700 mb-2">Mandate</h3>
            <p className="text-slate-700 leading-relaxed">
              Under the Local Government Code of 1991, otherwise known as RA 7160, the Provincial Legal Office 
              shall take charge of the legal services, provide legal assistance and support to the governor, 
              and develop plans and strategies, particularly programs and related projects to legal services.
            </p>
          </div>
        </div>
      </div>

      {/* ── MISSION BAR ── */}
      <div className="bg-white border-b border-slate-200 px-8 lg:px-16 py-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-700 mb-2">Mission</h3>
            <p className="text-slate-700 leading-relaxed">
              By 2025, the Provincial Legal Office will have a fast and reliable legal service consistent 
              with its commitment to provide legal support to the Provincial Government with integrity, 
              excellence and professionalism.
            </p>
          </div>
        </div>
      </div>

      {/* ── VISION BAR ── */}
      <div className="bg-slate-50 border-b border-slate-200 px-8 lg:px-16 py-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Eye className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-700 mb-2">Vision</h3>
            <p className="text-slate-700 leading-relaxed">
              To see to it that it carries out its tasks and obligations expeditiously and competently 
              by rendering legal assistance and services of outstanding quality in accordance with 
              existing laws and regulations.
            </p>
          </div>
        </div>
      </div>

      {/* ── ABOUT ── */}
      <section className="px-8 lg:px-16 py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Text */}
          <motion.div {...fadeIn(0)}>
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full mb-5">
              About the Office
            </span>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-800 leading-snug mb-6">
              Delivering Excellence in Legal Services
            </h2>
            <div className="space-y-4 text-slate-600 text-[15px] leading-relaxed">
              <p>
                The Provincial Legal Office serves as the primary legal counsel and support system for 
                the Provincial Government of Bataan. We are committed to providing comprehensive legal 
                services that ensure compliance with all applicable laws and regulations while protecting 
                the interests of the province and its constituents.
              </p>
              <p>
                Our office provides expert legal advice, document review and drafting, representation 
                in legal proceedings, and investigative services. We work closely with all provincial 
                departments, local government units, and external agencies to ensure that all legal 
                matters are handled with the highest level of professionalism and expertise.
              </p>
              <p>
                Through our dedicated team of legal professionals, we strive to deliver fast, reliable, 
                and high-quality legal services that support the effective governance and administration 
                of the Province of Bataan.
              </p>
            </div>

            <div className="mt-8 bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h4 className="text-sm font-bold text-slate-800 mb-4">Key Services</h4>
              <div className="grid sm:grid-cols-2 gap-x-4 gap-y-2.5">
                {keyServices.map((service, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-[13.5px] text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>{service}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Card + Org Chart */}
          <motion.div {...fadeIn(0.15)} className="space-y-6">
            {/* Contact Card */}
            <div className="bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 rounded-2xl p-8 text-white">
              <h3 className="text-xl font-serif font-bold mb-3">Provincial Legal Office</h3>
              <p className="text-sm text-white/80 leading-relaxed mb-6">
                Fast and reliable legal services with integrity, excellence and professionalism 
                for the Provincial Government of Bataan.
              </p>

              <hr className="border-white/15 mb-6" />

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-white/60 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-white/85">
                    3rd Floor, The Bunker, Capitol Compound<br />
                    San Jose, Balanga City, Bataan 2100 PH
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <a href="mailto:legal@bataan.gov.ph" className="text-sm text-white/90 hover:underline">
                    legal@bataan.gov.ph
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
                    'https://maps.google.com/?q=The+Bunker+Capitol+Compound+San+Jose+Balanga+City+Bataan',
                    '_blank'
                  )
                }
                className="mt-6 w-full flex items-center justify-center gap-2 bg-white/15 border border-white/25 hover:bg-white/22 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Get Directions
              </button>
            </div>

            {/* Organizational Chart */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                Organizational Structure
              </h4>
              <img
                src="/images/PLO-ORGANIZATION-CHART-UPDATED-Legal-Office-BATAAN-1.jpg.png"
                alt="Provincial Legal Office Organizational Chart"
                className="w-full h-auto rounded-lg border border-slate-200"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── DUTIES AND FUNCTIONS ── */}
      <section className="bg-slate-50 px-8 lg:px-16 py-16 lg:py-20">
        <motion.div {...fadeIn(0)} className="mb-10">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full mb-5">
            Duties and Functions
          </span>
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-800 mb-3">
            Legal Officer Responsibilities
          </h2>
          <p className="text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            In addition to the foregoing duties and functions, the Legal Officer shall perform 
            the following key responsibilities to ensure comprehensive legal support.
          </p>
        </motion.div>

        <motion.div {...fadeIn(0.15)} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {duties.map((duty, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <duty.icon className="w-6 h-6 text-amber-700" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-3">
                {duty.title}
              </h3>
              <p className="text-[13.5px] text-slate-600 leading-relaxed">
                {duty.description}
              </p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 px-8 lg:px-16 py-16 lg:py-20 text-center">
        <motion.div {...fadeIn(0)}>
          <h2 className="text-3xl lg:text-5xl font-serif font-bold text-white mb-4">
            Justice Through Excellence
          </h2>
          <p className="text-base text-white/70 max-w-lg mx-auto leading-relaxed">
            Providing comprehensive legal services with integrity, excellence and professionalism 
            for the Province of Bataan.
          </p>
        </motion.div>
      </section>

    </div>
  );
}
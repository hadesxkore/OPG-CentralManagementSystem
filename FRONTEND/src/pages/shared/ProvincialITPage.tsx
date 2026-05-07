import { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Monitor, Target, Eye, FileText, 
  ArrowRight, Mail, MapPin, Shield, CheckCircle2,
  Server, Globe, Database, Wifi, Code, Laptop, Network, HardDrive
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

const focusAreas = [
  'Policy and Planning',
  'Improved public access to government sites and information',
  'Resource-sharing and capacity building',
  'Internal and External clients; protection and Industry Development',
];

const divisions = [
  {
    icon: Server,
    title: 'Technical Maintenance and Support Division',
    color: 'from-blue-50 to-cyan-50 border-blue-200',
    iconBg: 'bg-blue-600',
    responsibilities: [
      'Installation and configuration of hardware and software to ensure functional operations of the office',
      'Monitor and maintain IT-related equipment and network infrastructure',
      'Install and manage the local area network and internet connectivity of PGB offices',
    ],
  },
  {
    icon: Monitor,
    title: 'IT and Multimedia Support Division',
    color: 'from-purple-50 to-indigo-50 border-purple-200',
    iconBg: 'bg-purple-600',
    responsibilities: [
      'Provide System Analytics assistance',
    ],
  },
  {
    icon: Globe,
    title: 'Systems and Web Division',
    color: 'from-cyan-50 to-teal-50 border-cyan-200',
    iconBg: 'bg-cyan-600',
    responsibilities: [
      'Design web portals such as the Bataan Website that implement effective and efficient data recording and proper dissemination',
      'Develop complete and comprehensive information systems that fit the needs of our clients to support their operations',
      'Provide assistance to other departments through comprehensive system evaluation and recommendation',
      'Maintain accurate database records and troubleshoot database-related problems',
    ],
  },
];

const services = [
  { icon: Server, title: 'Hardware & Software Installation', desc: 'Installation and configuration of hardware and software systems for optimal operations.' },
  { icon: Network, title: 'Network Infrastructure', desc: 'Monitor and maintain IT equipment and network infrastructure across provincial offices.' },
  { icon: Wifi, title: 'LAN & Internet Connectivity', desc: 'Install and manage local area network and internet connectivity for PGB offices.' },
  { icon: Database, title: 'System Analytics', desc: 'Provide comprehensive system analytics assistance and data-driven insights.' },
  { icon: Globe, title: 'Web Portal Development', desc: 'Design and develop web portals for effective data recording and information dissemination.' },
  { icon: Code, title: 'Information Systems', desc: 'Develop comprehensive information systems tailored to client operational needs.' },
  { icon: Laptop, title: 'System Evaluation', desc: 'Comprehensive system evaluation and recommendations for departmental needs.' },
  { icon: HardDrive, title: 'Database Management', desc: 'Maintain accurate database records and troubleshoot database-related issues.' },
];

export default function ProvincialITPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 overflow-hidden px-8 lg:px-16 py-16 lg:py-24"
      >
        {/* subtle decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 left-48 w-52 h-52 rounded-full bg-white/4 pointer-events-none" />

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div {...fade(0.1)} className="relative">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-200 inline-block" />
              Provincial Information Technology Office — Province of Bataan
            </div>

            <h1 className="text-4xl lg:text-6xl font-serif font-bold text-white leading-tight mb-6">
              Provincial{' '}
              <span className="italic text-cyan-200">Information</span>
              <br />
              Technology Office
            </h1>

            <p className="text-base lg:text-lg text-white/70 leading-relaxed mb-10 max-w-xl">
              Building an efficient ICT-enabled Bataan province with safe, citizen-centric infrastructure 
              and an inclusive environment for investment.
            </p>

            <div className="flex flex-wrap gap-3">
              <button className="bg-white text-blue-700 font-semibold text-sm px-6 py-3 rounded-lg inline-flex items-center gap-2 hover:bg-cyan-50 transition-colors">
                Our Services <ArrowRight className="w-4 h-4" />
              </button>
              <button className="bg-transparent text-white border border-white/40 font-medium text-sm px-6 py-3 rounded-lg hover:bg-white/10 hover:border-white transition-colors">
                Contact Us
              </button>
            </div>
          </motion.div>

          {/* PITO Logo */}
          <motion.div 
            {...fade(0.3)}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl scale-110" />
              <img
                src="/images/pito-icon-logo.png.png"
                alt="Provincial Information Technology Office Logo"
                className="relative w-64 h-64 lg:w-96 lg:h-96 object-contain drop-shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── MANDATE BAR ── */}
      <div className="bg-slate-50 border-b border-slate-200 px-8 lg:px-16 py-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-700 mb-2">Mandate</h3>
            <p className="text-slate-700 leading-relaxed mb-3">
              Based on Ordinance No. 27, Series of 2021, an ordinance creating the Provincial Information 
              Technology Office (PITO), the aforementioned office is mandated to contribute to the national 
              ICT development agenda supporting the DICT's primary planning and coordination on the following 
              focus areas:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-slate-700">
              {focusAreas.map((area, i) => (
                <li key={i}>{area}</li>
              ))}
            </ul>
            <p className="text-slate-700 leading-relaxed mt-3">
              We envision an efficient ICT-enabled Bataan province that has a safe and citizen-centric ICT 
              infrastructure and an inclusive and thriving environment for investment.
            </p>
          </div>
        </div>
      </div>

      {/* ── MISSION BAR ── */}
      <div className="bg-white border-b border-slate-200 px-8 lg:px-16 py-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-700 mb-2">Mission</h3>
            <p className="text-slate-700 leading-relaxed">
              Excellent public service that encourages multi-sectoral engagement.
            </p>
          </div>
        </div>
      </div>

      {/* ── VISION BAR ── */}
      <div className="bg-slate-50 border-b border-slate-200 px-8 lg:px-16 py-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Eye className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-700 mb-2">Vision</h3>
            <p className="text-slate-700 leading-relaxed">
              By 2030, Bataan will achieve quality growth driven by diversified economic investments and 
              efficient governance resulting in STABLE and empowered families.
            </p>
          </div>
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
              Driving Digital Transformation in Bataan
            </h2>
            <div className="space-y-4 text-slate-600 text-[15px] leading-relaxed">
              <p>
                The Provincial Information Technology Office (PITO) was established through Ordinance No. 27, 
                Series of 2021, to serve as the primary ICT development and coordination body of the Province 
                of Bataan. We are committed to contributing to the national ICT development agenda in support 
                of the Department of Information and Communications Technology (DICT).
              </p>
              <p>
                Our office focuses on policy and planning, improving public access to government sites and 
                information, resource-sharing and capacity building, and protecting both internal and external 
                clients while fostering industry development. Through these focus areas, we work towards 
                building an efficient ICT-enabled province with safe and citizen-centric infrastructure.
              </p>
              <p>
                PITO provides comprehensive ICT services including technical maintenance and support, system 
                analytics, web portal development, and information systems development. We ensure that all 
                provincial government offices have reliable network infrastructure, internet connectivity, 
                and the technological tools needed to deliver excellent public service.
              </p>
            </div>
          </motion.div>

          {/* Contact Card + Org Chart */}
          <motion.div {...fadeIn(0.15)} className="space-y-6">
            {/* Contact Card */}
            <div className="bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 rounded-2xl p-8 text-white">
              <h3 className="text-xl font-serif font-bold mb-3">Provincial Information Technology Office</h3>
              <p className="text-sm text-white/80 leading-relaxed mb-6">
                Building an efficient ICT-enabled Bataan with safe, citizen-centric infrastructure 
                and excellent public service through multi-sectoral engagement.
              </p>

              <hr className="border-white/15 mb-6" />

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-white/60 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-white/85">
                    5th Floor, The Bunker Bldg., Capitol Compound<br />
                    San Jose, Balanga City, Bataan 2100 PH
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <a href="mailto:pito@bataan.gov.ph" className="text-sm text-white/90 hover:underline">
                    pito@bataan.gov.ph
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
                <FileText className="w-4 h-4 text-blue-600" />
                Organizational Structure
              </h4>
              <img
                src="/images/pito org.png"
                alt="Provincial Information Technology Office Organizational Chart"
                className="w-full h-auto rounded-lg border border-slate-200"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── DIVISIONS & RESPONSIBILITIES ── */}
      <section className="bg-slate-50 px-8 lg:px-16 py-16 lg:py-20">
        <motion.div {...fadeIn(0)} className="mb-10">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-700 bg-blue-50 px-3 py-1 rounded-full mb-5">
            Our Divisions
          </span>
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-800 mb-3">
            PITO Divisions & Responsibilities
          </h2>
          <p className="text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            Three specialized divisions working together to deliver comprehensive ICT services and support 
            to the Provincial Government of Bataan.
          </p>
        </motion.div>

        <div className="space-y-6">
          {divisions.map((division, index) => (
            <motion.div
              key={index}
              {...fadeIn(index * 0.1)}
              className={`bg-gradient-to-br ${division.color} rounded-xl p-8 border-2`}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className={`w-12 h-12 ${division.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <division.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-1">{division.title}</h3>
                  <p className="text-sm text-slate-600">
                    {division.responsibilities.length} key responsibilit{division.responsibilities.length !== 1 ? 'ies' : 'y'}
                  </p>
                </div>
              </div>
              <div className="space-y-3 ml-16">
                {division.responsibilities.map((resp, rIndex) => (
                  <div key={rIndex} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-[15px] text-slate-700 leading-relaxed">{resp}</p>
                  </div>
                ))}
              </div>
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
            ICT Services & Solutions
          </h2>
          <p className="text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            Comprehensive information and communications technology services to support provincial 
            government operations and public service delivery.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((service, i) => (
            <motion.div
              key={i}
              {...fadeIn(i * 0.08)}
              className="bg-white border border-slate-200 rounded-xl p-7 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/8 transition-all duration-200"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-5">
                <service.icon className="w-5 h-5 text-blue-700" />
              </div>
              <h3 className="text-[15px] font-bold text-slate-800 mb-2">{service.title}</h3>
              <p className="text-[13.5px] text-slate-600 leading-relaxed">{service.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 px-8 lg:px-16 py-16 lg:py-20 text-center">
        <motion.div {...fadeIn(0)}>
          <h2 className="text-3xl lg:text-5xl font-serif font-bold text-white mb-4">
            Empowering Bataan Through Technology
          </h2>
          <p className="text-base text-white/70 max-w-lg mx-auto leading-relaxed">
            Building an efficient ICT-enabled province with safe, citizen-centric infrastructure 
            and excellent public service.
          </p>
        </motion.div>
      </section>

    </div>
  );
}

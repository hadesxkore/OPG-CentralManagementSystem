import { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Target, Eye, FileText, 
  ArrowRight, Mail, Phone, MapPin, Shield, CheckCircle2,
  Monitor, Database, Code, Settings
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
  'Installation and configuration of hardware and software',
  'Monitor and maintain IT-related equipment',
  'Install and manage local area network',
  'Internet connectivity management',
  'System Analytics assistance',
  'Web portal design and development',
  'Information systems development',
  'Database management and troubleshooting',
  'System evaluation and recommendations',
  'Technical support services',
];

const divisions = [
  {
    icon: Settings,
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
    icon: Database,
    title: 'IT and Multimedia Support Division',
    color: 'from-purple-50 to-indigo-50 border-purple-200',
    iconBg: 'bg-purple-600',
    responsibilities: [
      'Provide System Analytics assistance',
    ],
  },
  {
    icon: Code,
    title: 'Systems and Web Division',
    color: 'from-green-50 to-emerald-50 border-green-200',
    iconBg: 'bg-green-600',
    responsibilities: [
      'Design web portals such as the Bataan Website that implement effective and efficient data recording and proper dissemination',
      'Develop complete and comprehensive information systems that fit the needs of our clients to support their operations',
      'Provide assistance to other departments through comprehensive system evaluation and recommendation',
      'Maintain accurate database records and troubleshoot database-related problems',
    ],
  },
];

export default function ProvincialITPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 overflow-hidden px-8 lg:px-16 py-16 lg:py-24"
      >
        {/* subtle decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 left-48 w-52 h-52 rounded-full bg-white/4 pointer-events-none" />

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div {...fade(0.1)} className="relative">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-200 inline-block" />
              Provincial Information Technology Office — Province of Bataan
            </div>

            <h1 className="text-4xl lg:text-6xl font-serif font-bold text-white leading-tight mb-6">
              Provincial{' '}
              <span className="italic text-blue-200">Information</span>
              <br />
              Technology Office
            </h1>

            <p className="text-base lg:text-lg text-white/70 leading-relaxed mb-10 max-w-xl">
              Contributing to the national ICT development agenda supporting efficient 
              ICT-enabled governance and citizen-centric infrastructure.
            </p>

            <div className="flex flex-wrap gap-3">
              <button className="bg-white text-blue-700 font-semibold text-sm px-6 py-3 rounded-lg inline-flex items-center gap-2 hover:bg-blue-50 transition-colors">
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
            <p className="text-slate-700 leading-relaxed">
              Based on Ordinance No. 27, Series of 2021, an ordinance creating the Provincial Information 
              Technology Office (PITO), the aforementioned office is mandated to contribute to the national 
              ICT development agenda supporting the DICT's primary planning and coordination on the following 
              focus areas: Policy and Planning; Improved public access to government sites and information; 
              Resource-sharing and capacity building; and Internal and External clients; protection and 
              Industry Development.
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
              We envision an efficient ICT-enabled Bataan province that has a safe and citizen-centric 
              ICT infrastructure and an inclusive and thriving environment for investment. By 2030, 
              Bataan will achieve quality growth driven by diversified economic investments and efficient 
              governance resulting in STABLE and empowered families.
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
                The Provincial Information Technology Office (PITO) serves as the primary technology 
                hub for the Province of Bataan. We are committed to providing comprehensive ICT 
                services that support efficient governance, enhance public service delivery, and 
                promote digital transformation across all provincial operations.
              </p>
              <p>
                Our office specializes in system development, network infrastructure management, 
                technical support, and digital innovation. We work closely with all provincial 
                departments and local government units to ensure that technology solutions are 
                effectively implemented and maintained to serve the needs of our constituents.
              </p>
              <p>
                Through our dedicated team of IT professionals and three specialized divisions, 
                we strive to create an efficient ICT-enabled province with safe, citizen-centric 
                infrastructure that supports sustainable development and economic growth.
              </p>
            </div>

            <div className="mt-8 bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h4 className="text-sm font-bold text-slate-800 mb-4">Key Services</h4>
              <div className="grid sm:grid-cols-2 gap-x-4 gap-y-2.5">
                {keyServices.map((service, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-[13.5px] text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>{service}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Card + Org Chart */}
          <motion.div {...fadeIn(0.15)} className="space-y-6">
            {/* Contact Card */}
            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
              <h3 className="text-xl font-serif font-bold mb-3">Provincial Information Technology Office</h3>
              <p className="text-sm text-white/80 leading-relaxed mb-6">
                Driving digital transformation and providing excellent ICT services for 
                efficient governance and citizen-centric solutions in Bataan.
              </p>

              <hr className="border-white/15 mb-6" />

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-white/60 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-white/85">
                    2nd Floor, The Bunker, Capitol Compound<br />
                    San Jose, Balanga City, Bataan 2100 PH
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <a href="mailto:pito@bataan.gov.ph" className="text-sm text-white/90 hover:underline">
                    pito@bataan.gov.ph
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

      {/* ── DIVISIONS AND RESPONSIBILITIES ── */}
      <section className="bg-slate-50 px-8 lg:px-16 py-16 lg:py-20">
        <motion.div {...fadeIn(0)} className="mb-10">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-700 bg-blue-50 px-3 py-1 rounded-full mb-5">
            Divisions and Responsibilities
          </span>
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-800 mb-3">
            PITO Performs the Following Responsibilities
          </h2>
          <p className="text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            Our three specialized divisions work together to provide comprehensive ICT services 
            and support to the Provincial Government and its constituents.
          </p>
        </motion.div>

        <motion.div {...fadeIn(0.15)} className="space-y-6">
          {divisions.map((division, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 ${division.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <division.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-800 mb-3">
                    {division.title}
                  </h3>
                  <div className="space-y-3">
                    {division.responsibilities.map((responsibility, rIndex) => (
                      <div 
                        key={rIndex}
                        className={`bg-gradient-to-br ${division.color} rounded-lg p-4 border-2`}
                      >
                        <p className="text-[13.5px] text-slate-700 leading-relaxed flex items-start gap-2">
                          <Monitor className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          {responsibility}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 px-8 lg:px-16 py-16 lg:py-20 text-center">
        <motion.div {...fadeIn(0)}>
          <h2 className="text-3xl lg:text-5xl font-serif font-bold text-white mb-4">
            Innovating for Tomorrow
          </h2>
          <p className="text-base text-white/70 max-w-lg mx-auto leading-relaxed">
            Building an efficient ICT-enabled Bataan with safe, citizen-centric infrastructure 
            and inclusive digital solutions.
          </p>
        </motion.div>
      </section>

    </div>
  );
}
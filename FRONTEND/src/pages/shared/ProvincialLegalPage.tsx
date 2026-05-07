import { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Scale, Target, Eye, FileText, 
  ArrowRight, Mail, Phone, MapPin, Shield, CheckCircle2,
  Gavel, Users, Building2, FileCheck, Briefcase, BookOpen
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

const dutiesAndFunctions = [
  'Represent the LGU in all civil actions and special proceedings wherein the LGU or any official thereof, in his official capacity, is a party',
  'When required by the governor or sanggunian, draft ordinances, contracts, bonds, leases and other instruments involving any interest of the LGU and provide comments and recommendations on any instruments already drawn',
  'Render his opinion in writing on any question of law when required to do so by the governor',
  'Investigate or cause to be investigated any local official or employee for administrative neglect or misconduct in office and recommend appropriate action to the governor or sanggunian',
  'Investigate or cause to be investigated any person, firm or corporation holding any franchise or exercising any public privilege for failure to comply with any term or condition in the grant of such franchise or privilege and recommend appropriate action to the governor or sanggunian',
  'When directed by the governor, initiate and prosecute, in the interest of the LGU concerned, any civil action on any bond, lease or other contract upon any breach or violation thereof',
  'Review and submit recommendations on ordinances approved and executive orders issued by component units',
];

const legalServices = [
  { icon: Users, title: 'Walk-in Client Assistance', desc: 'Assist or legal advice to walk-in clients.' },
  { icon: Building2, title: 'City/Municipality Support', desc: 'Assist City / Municipalities in term of their legal needs.' },
  { icon: Briefcase, title: 'BAC Legal Support', desc: 'Assist the BAC for its legal needs.' },
  { icon: Scale, title: 'NGA Coordination', desc: 'Coordinate with National Government Agencies on legal matters and concerns in the province.' },
  { icon: FileCheck, title: 'Departmental Legal Support', desc: 'Render legal support to various departments with regard to their SIs.' },
  { icon: FileText, title: 'Land Repurchase Evaluation', desc: 'Evaluate repurchase of land applications.' },
  { icon: BookOpen, title: 'PPP Evaluation', desc: 'Assist the PPIC for the evaluation of PPP proponents.' },
  { icon: Shield, title: 'Task Force Legal Adviser', desc: 'Act as legal adviser to the PTF/IATFC.' },
  { icon: Gavel, title: 'Legal Representation', desc: 'Legal review of documents and legal representation support.' },
];

export default function ProvincialLegalPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 overflow-hidden px-8 lg:px-16 py-16 lg:py-24"
      >
        {/* subtle decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 left-48 w-52 h-52 rounded-full bg-white/4 pointer-events-none" />

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div {...fade(0.1)} className="relative">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-200 inline-block" />
              Provincial Legal Office — Province of Bataan
            </div>

            <h1 className="text-4xl lg:text-6xl font-serif font-bold text-white leading-tight mb-6">
              Provincial{' '}
              <span className="italic text-blue-200">Legal</span>
              <br />
              Office
            </h1>

            <p className="text-base lg:text-lg text-white/70 leading-relaxed mb-10 max-w-xl">
              Providing fast and reliable legal services with integrity, excellence, and professionalism 
              to support the Provincial Government of Bataan.
            </p>

            <div className="flex flex-wrap gap-3">
              <button className="bg-white text-blue-900 font-semibold text-sm px-6 py-3 rounded-lg inline-flex items-center gap-2 hover:bg-blue-50 transition-colors">
                Our Services <ArrowRight className="w-4 h-4" />
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
                alt="Province of Bataan Seal"
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
              Under the Local Government Code of 1991, otherwise known as RA 7160, the Provincial Legal 
              Office shall take charge of the legal services, provide legal assistance and support to the 
              governor, and develop plans and strategies, particularly programs and related projects to 
              legal services.
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
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Eye className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-700 mb-2">Vision</h3>
            <p className="text-slate-700 leading-relaxed">
              To see to it that it carries out its tasks and obligations expeditiously and competently by 
              rendering legal assistance and services of outstanding quality in accordance with existing 
              laws and regulations.
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
              Legal Excellence in Public Service
            </h2>
            <div className="space-y-4 text-slate-600 text-[15px] leading-relaxed">
              <p>
                The Provincial Legal Office serves as the primary legal arm of the Provincial Government 
                of Bataan. Under the Local Government Code of 1991 (RA 7160), we are mandated to provide 
                comprehensive legal services, assistance, and support to the governor and all provincial 
                government units.
              </p>
              <p>
                Our office is committed to delivering fast and reliable legal services characterized by 
                integrity, excellence, and professionalism. We handle a wide range of legal matters including 
                representation in civil actions, drafting of ordinances and contracts, legal opinions, 
                administrative investigations, and coordination with national government agencies on legal 
                concerns.
              </p>
              <p>
                Through our dedicated team of legal professionals, we ensure that all tasks and obligations 
                are carried out expeditiously and competently, rendering legal assistance and services of 
                outstanding quality in accordance with existing laws and regulations. We serve as legal 
                advisers to various provincial offices, task forces, and provide support to cities and 
                municipalities within the province.
              </p>
            </div>

            <div className="mt-8 bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Scale className="w-4 h-4 text-blue-600" />
                Duties and Functions of the Legal Officer
              </h4>
              <div className="space-y-2.5">
                {dutiesAndFunctions.map((duty, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-[13.5px] text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>{duty}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Card + Org Chart */}
          <motion.div {...fadeIn(0.15)} className="space-y-6">
            {/* Contact Card */}
            <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 rounded-2xl p-8 text-white">
              <h3 className="text-xl font-serif font-bold mb-3">Provincial Legal Office</h3>
              <p className="text-sm text-white/80 leading-relaxed mb-6">
                Fast and reliable legal services with integrity, excellence, and professionalism 
                for the Provincial Government of Bataan.
              </p>

              <hr className="border-white/15 mb-6" />

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-white/60 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-white/85">
                    7th Floor, The Bunker, Capitol Compound<br />
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
                  <div className="text-sm text-white/90">
                    <a href="tel:+639815797297" className="hover:underline block">09815797297</a>
                    <a href="tel:+6347636-0702" className="hover:underline block">(047) 636-0702</a>
                  </div>
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
                src="/images/PLO-ORGANIZATION-CHART-UPDATED-Legal-Office-BATAAN-1.jpg.png"
                alt="Provincial Legal Office Organizational Chart"
                className="w-full h-auto rounded-lg border border-slate-200"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── LEGAL OFFICE SERVICES ── */}
      <section className="bg-slate-50 px-8 lg:px-16 py-16 lg:py-20">
        <motion.div {...fadeIn(0)} className="mb-10">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-700 bg-blue-50 px-3 py-1 rounded-full mb-5">
            Our Services
          </span>
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-800 mb-3">
            Legal Office Services
          </h2>
          <p className="text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            Comprehensive legal services and support for the Provincial Government, local government 
            units, and various stakeholders.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {legalServices.map((service, i) => (
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

      {/* ── LEGAL REPRESENTATION ── */}
      <section className="px-8 lg:px-16 py-16 lg:py-20">
        <motion.div {...fadeIn(0)} className="mb-10">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-700 bg-blue-50 px-3 py-1 rounded-full mb-5">
            Legal Representation
          </span>
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-800 mb-3">
            Legal Representation and Support
          </h2>
          <p className="text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            Professional legal representation and comprehensive document review services for the 
            Provincial Government and its component units.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div {...fadeIn(0.1)} className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
              <Gavel className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Legal Representation</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Representing the LGU in civil actions and special proceedings, ensuring the interests 
              of the Provincial Government are protected.
            </p>
          </motion.div>

          <motion.div {...fadeIn(0.2)} className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4">
              <FileCheck className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Document Review</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Comprehensive legal review of documents, contracts, ordinances, and other legal 
              instruments to ensure compliance with laws and regulations.
            </p>
          </motion.div>

          <motion.div {...fadeIn(0.3)} className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Legal Advisory</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Providing expert legal opinions and advisory services to the governor, sanggunian, 
              and various provincial departments.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 px-8 lg:px-16 py-16 lg:py-20 text-center">
        <motion.div {...fadeIn(0)}>
          <h2 className="text-3xl lg:text-5xl font-serif font-bold text-white mb-4">
            Justice, Integrity, Excellence
          </h2>
          <p className="text-base text-white/70 max-w-lg mx-auto leading-relaxed">
            Providing fast and reliable legal services with professionalism to support the 
            Provincial Government of Bataan.
          </p>
        </motion.div>
      </section>

    </div>
  );
}

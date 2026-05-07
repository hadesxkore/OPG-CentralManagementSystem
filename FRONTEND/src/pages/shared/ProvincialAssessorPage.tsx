import { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Home, Map, FileSearch, 
  ArrowRight, Mail, Phone, MapPin, Shield, CheckCircle2,
  Building2, ClipboardList, Search, Database, FolderOpen, Eye
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
  { icon: Database, title: 'Assessment System', desc: 'Establish systematic methods of assessment in accordance with rules and regulations issued by the Secretary of Finance.' },
  { icon: Home, title: 'Property Identification', desc: 'Install and maintain a real property identification and accounting system conforming to prescribed standards.' },
  { icon: Map, title: 'Tax Mapping', desc: 'Prepare, install and maintain a system of tax mapping showing graphically all property subject to assessment.' },
  { icon: Eye, title: 'Physical Surveys', desc: 'Make frequent physical surveys to check and determine whether all real property is properly listed in assessment rolls.' },
  { icon: FileSearch, title: 'Property Appraisal', desc: 'Appraise all items of real property at current market value and conduct regular ocular inspection trips.' },
  { icon: FolderOpen, title: 'Records Management', desc: 'Keep records of all transfers, leases, mortgages, rentals, insurance and construction costs for assessment purposes.' },
];

const keyFunctions = [
  'Establish systematic method of assessment per prescribed guidelines',
  'Install and maintain real property identification system',
  'Prepare and maintain tax mapping system',
  'Conduct frequent physical surveys of properties',
  'Appraise properties at current market value',
  'Keep records of transfers, leases, and mortgages',
  'Cancel duplicate assessments when necessary',
  'Assist in administration and supervision of the office',
  'Make ocular inspections and decide on assessment problems',
  'List all taxable and non-taxable real property',
  'Establish rapport with public and private establishments',
  'Attend local board of assessment appeal sessions',
  'Provide clerical services and property management',
  'Issue certifications for property ownership',
];

export default function ProvincialAssessorPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative bg-gradient-to-br from-orange-600 via-amber-700 to-yellow-700 overflow-hidden px-8 lg:px-16 py-16 lg:py-24"
      >
        {/* subtle decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 left-48 w-52 h-52 rounded-full bg-white/4 pointer-events-none" />

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div {...fade(0.1)} className="relative">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-200 inline-block" />
              Provincial Assessor's Office — Province of Bataan
            </div>

            <h1 className="text-4xl lg:text-6xl font-serif font-bold text-white leading-tight mb-6">
              Provincial{' '}
              <span className="italic text-orange-200">Assessor's</span>
              <br />
              Office
            </h1>

            <p className="text-base lg:text-lg text-white/70 leading-relaxed mb-10 max-w-xl">
              Takes charge of the classification, appraisal, assessment and valuation of all real 
              properties, including tax mapping system and records management for taxation purposes.
            </p>

            <div className="flex flex-wrap gap-3">
              <button className="bg-white text-orange-700 font-semibold text-sm px-6 py-3 rounded-lg inline-flex items-center gap-2 hover:bg-orange-50 transition-colors">
                Learn More <ArrowRight className="w-4 h-4" />
              </button>
              <button className="bg-transparent text-white border border-white/40 font-medium text-sm px-6 py-3 rounded-lg hover:bg-white/10 hover:border-white transition-colors">
                Contact Us
              </button>
            </div>
          </motion.div>

          {/* Assessor Logo */}
          <motion.div 
            {...fade(0.3)}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl scale-110" />
              <img
                src="/images/ASSESSOR-LOGO-1.png.png"
                alt="Provincial Assessor's Office Logo"
                className="relative w-64 h-64 lg:w-96 lg:h-96 object-contain drop-shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── MANDATE BAR ── */}
      <div className="bg-slate-50 border-b border-slate-200 px-8 lg:px-16 py-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-orange-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-orange-700 mb-2">Official Mandate</h3>
            <p className="text-slate-700 leading-relaxed">
              Takes charge of the classification, appraisal, assessment and valuation of all real 
              properties of the province, which shall be used as the basis for taxation, as well as 
              preparation, installation and maintenance of a tax mapping system and records management.
            </p>
          </div>
        </div>
      </div>

      {/* ── ABOUT ── */}
      <section className="px-8 lg:px-16 py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Text */}
          <motion.div {...fadeIn(0)}>
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-orange-700 bg-orange-50 px-3 py-1 rounded-full mb-5">
              About the Office
            </span>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-800 leading-snug mb-6">
              Real Property Assessment and Valuation
            </h2>
            <div className="space-y-4 text-slate-600 text-[15px] leading-relaxed">
              <p>
                The Provincial Assessor's Office is responsible for the systematic classification, appraisal, 
                assessment, and valuation of all real properties within the Province of Bataan. These valuations 
                serve as the basis for real property taxation and ensure fair and equitable tax collection across 
                the province.
              </p>
              <p>
                The office maintains a comprehensive real property identification and accounting system, conforming 
                to standards prescribed by the Secretary of Finance. This includes the preparation and maintenance 
                of tax mapping systems that graphically display all properties subject to assessment, providing 
                accurate and up-to-date information for taxation purposes.
              </p>
              <p>
                Through regular physical surveys and ocular inspections, the office ensures that all real property 
                within the locality is properly listed in assessment rolls and appraised at current market values. 
                The office also maintains detailed records of property transfers, leases, mortgages, and construction 
                costs to support accurate property assessment and valuation.
              </p>
            </div>

            <div className="mt-8 bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h4 className="text-sm font-bold text-slate-800 mb-4">Key Functions</h4>
              <div className="grid sm:grid-cols-2 gap-x-4 gap-y-2.5">
                {keyFunctions.map((func, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-[13.5px] text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span>{func}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Card */}
          <motion.div {...fadeIn(0.15)} className="sticky top-6">
            <div className="bg-gradient-to-br from-orange-600 via-amber-700 to-yellow-700 rounded-2xl p-8 text-white">
              <h3 className="text-xl font-serif font-bold mb-3">Provincial Assessor's Office</h3>
              <p className="text-sm text-white/80 leading-relaxed mb-6">
                Responsible for real property classification, appraisal, assessment, valuation, 
                tax mapping, and records management.
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
                  <a href="mailto:assessor@bataan.gov.ph" className="text-sm text-white/90 hover:underline">
                    assessor@bataan.gov.ph
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <a href="tel:+639318978389" className="text-sm text-white/90 hover:underline">
                    0931-897-8389
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
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-orange-700 bg-orange-50 px-3 py-1 rounded-full mb-5">
            Core Responsibilities
          </span>
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-800 mb-3">
            Areas of Responsibility
          </h2>
          <p className="text-[15px] text-slate-600 max-w-xl leading-relaxed">
            The Provincial Assessor manages critical property assessment and valuation functions.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {responsibilities.map((resp, i) => (
            <motion.div
              key={i}
              {...fadeIn(i * 0.08)}
              className="bg-white border border-slate-200 rounded-xl p-7 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/8 transition-all duration-200"
            >
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mb-5">
                <resp.icon className="w-5 h-5 text-orange-700" />
              </div>
              <h3 className="text-[15px] font-bold text-slate-800 mb-2">{resp.title}</h3>
              <p className="text-[13.5px] text-slate-600 leading-relaxed">{resp.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FUNCTIONAL STATEMENTS ── */}
      <section className="px-8 lg:px-16 py-16 lg:py-20">
        <motion.div {...fadeIn(0)} className="mb-10">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-orange-700 bg-orange-50 px-3 py-1 rounded-full mb-5">
            Functional Statements
          </span>
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-800 mb-3">
            Detailed Functions & Duties
          </h2>
          <p className="text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            Comprehensive overview of the office's functions in property assessment, tax mapping, 
            records management, and administrative support.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Assessment & Valuation */}
          <motion.div {...fadeIn(0.1)} className="bg-white border-2 border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-orange-700" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Assessment & Valuation</h3>
            </div>
            <ul className="space-y-2.5 text-[13.5px] text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 flex-shrink-0 mt-1.5" />
                <span>Establish systematic method of assessment per prescribed guidelines</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 flex-shrink-0 mt-1.5" />
                <span>Install and maintain real property identification & accounting system</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 flex-shrink-0 mt-1.5" />
                <span>Appraise all items of real property at current market value</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 flex-shrink-0 mt-1.5" />
                <span>Apply uniformly the assessment levels to current market value</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 flex-shrink-0 mt-1.5" />
                <span>Eliminate from assessment roll properties that have been destroyed or are exempt</span>
              </li>
            </ul>
          </motion.div>

          {/* Tax Mapping */}
          <motion.div {...fadeIn(0.2)} className="bg-white border-2 border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Map className="w-5 h-5 text-orange-700" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Tax Mapping</h3>
            </div>
            <ul className="space-y-2.5 text-[13.5px] text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 flex-shrink-0 mt-1.5" />
                <span>Provide basic information for assessing property tax purposes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 flex-shrink-0 mt-1.5" />
                <span>Construction & maintenance of tax maps based on cadastral maps</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 flex-shrink-0 mt-1.5" />
                <span>Keep tax maps in order for safekeeping and protection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 flex-shrink-0 mt-1.5" />
                <span>Record number of parcels of land that are taxable or exempt</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 flex-shrink-0 mt-1.5" />
                <span>Provide permanent link between property owners & office records</span>
              </li>
            </ul>
          </motion.div>

          {/* Surveys & Inspections */}
          <motion.div {...fadeIn(0.3)} className="bg-white border-2 border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-orange-700" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Surveys & Inspections</h3>
            </div>
            <ul className="space-y-2.5 text-[13.5px] text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 flex-shrink-0 mt-1.5" />
                <span>Make frequent physical surveys to check property listings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 flex-shrink-0 mt-1.5" />
                <span>Conduct regular ocular inspection trips for correct assessments</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 flex-shrink-0 mt-1.5" />
                <span>Make ocular inspections and decide on assessment problems</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 flex-shrink-0 mt-1.5" />
                <span>Identify true use of land and ownership of each parcel</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 flex-shrink-0 mt-1.5" />
                <span>Keep inventory cards of properties for listing and appraising</span>
              </li>
            </ul>
          </motion.div>

          {/* Records & Administration */}
          <motion.div {...fadeIn(0.4)} className="bg-white border-2 border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-orange-700" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Records & Administration</h3>
            </div>
            <ul className="space-y-2.5 text-[13.5px] text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 flex-shrink-0 mt-1.5" />
                <span>Keep records of transfers, leases, mortgages, and rentals</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 flex-shrink-0 mt-1.5" />
                <span>Provide clerical service, property management, and building maintenance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 flex-shrink-0 mt-1.5" />
                <span>Keep and update personnel records and property index cards</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 flex-shrink-0 mt-1.5" />
                <span>Issue certifications for property ownership and taxation purposes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 flex-shrink-0 mt-1.5" />
                <span>Coordinate and maintain working relationships between divisions</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="bg-gradient-to-br from-orange-600 via-amber-700 to-yellow-700 px-8 lg:px-16 py-16 lg:py-20 text-center">
        <motion.div {...fadeIn(0)}>
          <h2 className="text-3xl lg:text-5xl font-serif font-bold text-white mb-4">
            Fair and Accurate Property Assessment
          </h2>
          <p className="text-base text-white/70 max-w-lg mx-auto leading-relaxed">
            Through systematic assessment and valuation, we ensure equitable taxation 
            and proper management of real property records across Bataan.
          </p>
        </motion.div>
      </section>

    </div>
  );
}

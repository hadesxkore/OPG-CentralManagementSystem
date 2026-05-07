import { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, 
  ArrowRight, Mail, Phone, MapPin, Shield, CheckCircle2,
  FileText, PieChart, BarChart3, ClipboardCheck, Target, Users
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
  { icon: FileText, title: 'Budget Preparation', desc: 'Prepares the provincial budget in accordance with DBM guidelines and RA 7160 mandates.' },
  { icon: ClipboardCheck, title: 'Budget Review', desc: 'Reviews annual and supplemental budgets to ensure compliance with regulations.' },
  { icon: PieChart, title: 'Expenditure Management', desc: 'Implements public expenditure management policies supporting provincial development.' },
  { icon: BarChart3, title: 'Budget Matrix', desc: 'Ensures conformity with Local Budget Matrix and Allotment Release Order requirements.' },
  { icon: Target, title: 'Transparency & Efficiency', desc: 'Promotes efficiency, effectiveness, and transparency in public spending.' },
  { icon: Users, title: 'Staff Development', desc: 'Commits to better performance and dedicated service to the province and its people.' },
];

const keyFunctions = [
  'Preparation of provincial budget per DBM guidelines',
  'Compliance with RA 7160 and Local Budget Matrix',
  'Review of annual and supplemental budgets',
  'Implementation of expenditure management policies',
  'Support for provincial development goals',
  'Ensuring transparency in public spending',
  'Budget monitoring and evaluation',
  'Coordination with Department of Budget and Management',
];

export default function ProvincialBudgetPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative bg-gradient-to-br from-purple-600 via-violet-700 to-indigo-700 overflow-hidden px-8 lg:px-16 py-16 lg:py-24"
      >
        {/* subtle decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 left-48 w-52 h-52 rounded-full bg-white/4 pointer-events-none" />

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div {...fade(0.1)} className="relative">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-200 inline-block" />
              Provincial Budget Office — Province of Bataan
            </div>

            <h1 className="text-4xl lg:text-6xl font-serif font-bold text-white leading-tight mb-6">
              Provincial{' '}
              <span className="italic text-purple-200">Budget</span>
              <br />
              Office
            </h1>

            <p className="text-base lg:text-lg text-white/70 leading-relaxed mb-10 max-w-xl">
              Promoting and implementing public expenditure management policies to support 
              provincial development goals and ensure efficiency, effectiveness, and transparency 
              of public spending.
            </p>

            <div className="flex flex-wrap gap-3">
              <button className="bg-white text-purple-700 font-semibold text-sm px-6 py-3 rounded-lg inline-flex items-center gap-2 hover:bg-purple-50 transition-colors">
                Learn More <ArrowRight className="w-4 h-4" />
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

      {/* ── MISSION & VISION BAR ── */}
      <div className="bg-slate-50 border-b border-slate-200 px-8 lg:px-16 py-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-purple-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-purple-700 mb-3">Mission and Vision</h3>
            <div className="space-y-3 text-slate-700 text-[15px] leading-relaxed">
              <p>
                The Provincial Budget Office as one of the staff offices of the Provincial Governor, 
                aims to promote and implement public expenditures management policies that will support 
                provincial development goals and objectives; and to ensure efficiency, effectiveness and 
                transparency of public spending.
              </p>
              <p>
                As personnel of this organization, we commit ourselves to have a better performance to 
                do our duties and functions to the best of our knowledge and ability as well. It is also 
                our goal that as public servants, be dedicated to the services that we can give to the 
                province and its people.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── MANDATE BAR ── */}
      <div className="bg-white border-b border-slate-200 px-8 lg:px-16 py-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-purple-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-purple-700 mb-2">Official Mandate</h3>
            <p className="text-slate-700 leading-relaxed">
              Prepares the provincial budget in accordance with the prescribed guidelines issued by the 
              Department of Budget and Management in order to conform with the mandates of RA 7160 and 
              local Budget Matrix and Allotment Release Order, responsible for the review of annual and 
              supplemental budget of the province.
            </p>
          </div>
        </div>
      </div>

      {/* ── ABOUT ── */}
      <section className="px-8 lg:px-16 py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Text */}
          <motion.div {...fadeIn(0)}>
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-purple-700 bg-purple-50 px-3 py-1 rounded-full mb-5">
              About the Office
            </span>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-800 leading-snug mb-6">
              Managing Provincial Budget and Expenditures
            </h2>
            <div className="space-y-4 text-slate-600 text-[15px] leading-relaxed">
              <p>
                The Provincial Budget Office serves as one of the key staff offices of the Provincial Governor, 
                playing a crucial role in the financial planning and management of the Province of Bataan. The 
                office is responsible for preparing the provincial budget in strict accordance with guidelines 
                issued by the Department of Budget and Management.
              </p>
              <p>
                Operating under the mandates of Republic Act 7160 (Local Government Code) and adhering to the 
                Local Budget Matrix and Allotment Release Order, the office ensures that all budgetary processes 
                are compliant with national and local regulations. This includes the comprehensive review of both 
                annual and supplemental budgets.
              </p>
              <p>
                The office is committed to promoting transparency, efficiency, and effectiveness in public spending, 
                ensuring that every peso allocated serves the development goals and objectives of the province. 
                Through dedicated service and professional excellence, the team works to support the financial 
                needs of Bataan and its people.
              </p>
            </div>

            <div className="mt-8 bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h4 className="text-sm font-bold text-slate-800 mb-4">Key Functions</h4>
              <ul className="space-y-2.5">
                {keyFunctions.map((func, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13.5px] text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>{func}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Contact Card */}
          <motion.div {...fadeIn(0.15)} className="sticky top-6">
            <div className="bg-gradient-to-br from-purple-600 via-violet-700 to-indigo-700 rounded-2xl p-8 text-white">
              <h3 className="text-xl font-serif font-bold mb-3">Provincial Budget Office</h3>
              <p className="text-sm text-white/80 leading-relaxed mb-6">
                Staff office of the Provincial Governor responsible for budget preparation, review, 
                and expenditure management.
              </p>

              <hr className="border-white/15 mb-6" />

              <div className="space-y-4">
                <div className="bg-white/10 rounded-lg p-4 mb-4">
                  <p className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">
                    Provincial Budget Officer
                  </p>
                  <p className="text-sm font-bold text-white">Eduardo D. Banzon</p>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-white/60 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-white/85">
                    4th Floor, The Bunker, Capitol Compound,<br />
                    San Jose, City of Balanga, Bataan 2100 PH
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <a href="mailto:budget@bataan.gov.ph" className="text-sm text-white/90 hover:underline">
                    budget@bataan.gov.ph
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <a href="tel:+639190791340" className="text-sm text-white/90 hover:underline">
                    0919-0791340
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
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-purple-700 bg-purple-50 px-3 py-1 rounded-full mb-5">
            Core Responsibilities
          </span>
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-800 mb-3">
            Areas of Responsibility
          </h2>
          <p className="text-[15px] text-slate-600 max-w-xl leading-relaxed">
            The Provincial Budget Office manages critical budgetary functions for the province.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {responsibilities.map((resp, i) => (
            <motion.div
              key={i}
              {...fadeIn(i * 0.08)}
              className="bg-white border border-slate-200 rounded-xl p-7 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/8 transition-all duration-200"
            >
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-5">
                <resp.icon className="w-5 h-5 text-purple-700" />
              </div>
              <h3 className="text-[15px] font-bold text-slate-800 mb-2">{resp.title}</h3>
              <p className="text-[13.5px] text-slate-600 leading-relaxed">{resp.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="bg-gradient-to-br from-purple-600 via-violet-700 to-indigo-700 px-8 lg:px-16 py-16 lg:py-20 text-center">
        <motion.div {...fadeIn(0)}>
          <h2 className="text-3xl lg:text-5xl font-serif font-bold text-white mb-4">
            Transparent Budget Management for Bataan
          </h2>
          <p className="text-base text-white/70 max-w-lg mx-auto leading-relaxed">
            Through responsible budget preparation and expenditure management, we ensure 
            efficient allocation of resources for provincial development.
          </p>
        </motion.div>
      </section>

    </div>
  );
}

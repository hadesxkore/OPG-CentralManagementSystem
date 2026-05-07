import { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet, TrendingUp, 
  ArrowRight, Mail, Phone, MapPin, Shield, CheckCircle2,
  Building2, FileText, Eye, Coins, Receipt
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
  { icon: Wallet, title: 'Fund Custodian', desc: 'Acts as custodian of all provincial government funds and maintains corresponding financial records.' },
  { icon: Coins, title: 'Revenue Collection', desc: 'Responsible for the collection of all revenues due to the Province from various sources.' },
  { icon: Receipt, title: 'Fund Disbursement', desc: 'Manages the disbursement of funds pursuant to existing laws and regulations.' },
  { icon: FileText, title: 'Record Maintenance', desc: 'Maintains comprehensive and accurate records of all financial transactions.' },
  { icon: Eye, title: 'Utility Inspection', desc: 'Inspects the operation of public utilities in accordance with local tax ordinances.' },
  { icon: Building2, title: 'Business Monitoring', desc: 'Monitors private commercial and industrial establishments for tax compliance.' },
];

const keyFunctions = [
  'Custodian of all provincial government funds',
  'Collection of all revenues due to the Province',
  'Disbursement of funds per laws and regulations',
  'Maintenance of financial records and documentation',
  'Inspection of public utilities operations',
  'Monitoring of commercial and industrial establishments',
  'Enforcement of local tax ordinances',
  'Revenue target establishment and enforcement',
];

export default function ProvincialTreasurerPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative bg-gradient-to-br from-emerald-600 via-green-700 to-teal-700 overflow-hidden px-8 lg:px-16 py-16 lg:py-24"
      >
        {/* subtle decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 left-48 w-52 h-52 rounded-full bg-white/4 pointer-events-none" />

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div {...fade(0.1)} className="relative">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 inline-block" />
              Provincial Treasurer's Office — Province of Bataan
            </div>

            <h1 className="text-4xl lg:text-6xl font-serif font-bold text-white leading-tight mb-6">
              Provincial{' '}
              <span className="italic text-emerald-200">Treasurer's</span>
              <br />
              Office
            </h1>

            <p className="text-base lg:text-lg text-white/70 leading-relaxed mb-10 max-w-xl">
              Custodian of provincial funds, responsible for revenue collection, fund disbursement, 
              and financial record maintenance to effectively respond to the province's financial needs.
            </p>

            <div className="flex flex-wrap gap-3">
              <button className="bg-white text-emerald-700 font-semibold text-sm px-6 py-3 rounded-lg inline-flex items-center gap-2 hover:bg-emerald-50 transition-colors">
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
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-700 mb-2">Mission and Vision</h3>
            <p className="text-slate-700 leading-relaxed">
              The Provincial Treasurer's Office aims to establish collection targets and enforce measures 
              to attain these targets in order to raise revenues for the province so it can effectively 
              and efficiently respond to the financial needs of the province.
            </p>
          </div>
        </div>
      </div>

      {/* ── MANDATE BAR ── */}
      <div className="bg-white border-b border-slate-200 px-8 lg:px-16 py-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-700 mb-2">Official Mandate</h3>
            <p className="text-slate-700 leading-relaxed">
              Acts as custodian of all provincial government funds and its corresponding records. 
              Responsible for the collection of all revenues due to the Province and the disbursement 
              of funds pursuant to existing laws and regulations as well as the maintenance of its 
              corresponding records. Inspects the operation of public utilities and all private commercial 
              and industrial establishments in accordance with its local tax ordinances.
            </p>
          </div>
        </div>
      </div>

      {/* ── ABOUT ── */}
      <section className="px-8 lg:px-16 py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Text */}
          <motion.div {...fadeIn(0)}>
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-5">
              About the Office
            </span>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-800 leading-snug mb-6">
              Managing Provincial Financial Resources
            </h2>
            <div className="space-y-4 text-slate-600 text-[15px] leading-relaxed">
              <p>
                The Provincial Treasurer's Office serves as the financial custodian of the Province of Bataan, 
                managing all provincial government funds and maintaining comprehensive financial records. The 
                office plays a critical role in ensuring the province's fiscal health and sustainability.
              </p>
              <p>
                With the responsibility of collecting all revenues due to the province and disbursing funds 
                in accordance with existing laws and regulations, the office ensures transparency and 
                accountability in all financial transactions. This includes establishing collection targets 
                and implementing measures to achieve revenue goals.
              </p>
              <p>
                The office also conducts inspections of public utilities and monitors private commercial and 
                industrial establishments to ensure compliance with local tax ordinances, contributing to the 
                province's revenue generation and regulatory enforcement efforts.
              </p>
            </div>

            <div className="mt-8 bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h4 className="text-sm font-bold text-slate-800 mb-4">Key Functions</h4>
              <ul className="space-y-2.5">
                {keyFunctions.map((func, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13.5px] text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{func}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Contact Card */}
          <motion.div {...fadeIn(0.15)} className="sticky top-6">
            <div className="bg-gradient-to-br from-emerald-600 via-green-700 to-teal-700 rounded-2xl p-8 text-white">
              <h3 className="text-xl font-serif font-bold mb-3">Provincial Treasurer's Office</h3>
              <p className="text-sm text-white/80 leading-relaxed mb-6">
                The financial custodian of the province, responsible for revenue collection, 
                fund disbursement, and financial record management.
              </p>

              <hr className="border-white/15 mb-6" />

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-white/60 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-white/85">
                    4th Floor, The Bunker @ The Capitol Compound,<br />
                    Tenejero, Balanga City, Bataan 2100
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-white/60 flex-shrink-0" />
                    <a href="mailto:pto@bataan.gov.ph" className="text-sm text-white/90 hover:underline">
                      pto@bataan.gov.ph
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-white/60 flex-shrink-0" />
                    <a href="mailto:pto.rod@bataan.gov.ph" className="text-sm text-white/90 hover:underline">
                      pto.rod@bataan.gov.ph
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <a href="tel:+639176388381" className="text-sm text-white/90 hover:underline">
                    09176388381
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

      {/* ── RESPONSIBILITIES ── */}
      <section className="bg-slate-50 px-8 lg:px-16 py-16 lg:py-20">
        <motion.div {...fadeIn(0)} className="mb-10">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-5">
            Core Responsibilities
          </span>
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-800 mb-3">
            Areas of Responsibility
          </h2>
          <p className="text-[15px] text-slate-600 max-w-xl leading-relaxed">
            The Provincial Treasurer manages critical financial functions for the province.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {responsibilities.map((resp, i) => (
            <motion.div
              key={i}
              {...fadeIn(i * 0.08)}
              className="bg-white border border-slate-200 rounded-xl p-7 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/8 transition-all duration-200"
            >
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-5">
                <resp.icon className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="text-[15px] font-bold text-slate-800 mb-2">{resp.title}</h3>
              <p className="text-[13.5px] text-slate-600 leading-relaxed">{resp.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="bg-gradient-to-br from-emerald-600 via-green-700 to-teal-700 px-8 lg:px-16 py-16 lg:py-20 text-center">
        <motion.div {...fadeIn(0)}>
          <h2 className="text-3xl lg:text-5xl font-serif font-bold text-white mb-4">
            Financial Stewardship for Bataan
          </h2>
          <p className="text-base text-white/70 max-w-lg mx-auto leading-relaxed">
            Through responsible financial management and revenue collection, we ensure the 
            province has the resources to serve its citizens effectively.
          </p>
        </motion.div>
      </section>

    </div>
  );
}

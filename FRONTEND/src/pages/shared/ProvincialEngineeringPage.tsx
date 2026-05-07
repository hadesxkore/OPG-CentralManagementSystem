import { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Hammer, Ruler, Building, 
  ArrowRight, Mail, Phone, MapPin, Target, CheckCircle2,
  Wrench, HardHat, TrendingUp, Users, Cog, FileText
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

const objectives = [
  { icon: Ruler, title: 'Surveying Services', desc: 'Provide necessary surveying services in planning, programming and implementation of all provincial infrastructure projects.' },
  { icon: Building, title: 'Road & Bridge Planning', desc: 'Plan and program all other roads and bridges that will be undertaken by the province.' },
  { icon: Hammer, title: 'Infrastructure Construction', desc: 'Construct and/or improve feeder road projects and implement provincial infrastructure projects.' },
  { icon: FileText, title: 'Project Supervision', desc: 'Plan, program and supervise provincial work projects and assist in planning and programming of public works projects.' },
  { icon: CheckCircle2, title: 'Quality Assurance', desc: 'Ensure the completion of projects according to approved plans and specifications.' },
  { icon: Cog, title: 'Equipment Management', desc: 'Install a functioning maintenance and supply system for the provincial equipment pool with deadline rate not exceeding 25%.' },
  { icon: Users, title: 'Engineering Services', desc: 'Provide engineering services to the province and its component units including investigation, surveys, designs, and feasibility studies.' },
  { icon: TrendingUp, title: 'Project Management', desc: 'Deliver comprehensive project management services for all provincial infrastructure initiatives.' },
];

const keyResponsibilities = [
  'Professional planning and building services',
  'Infrastructure development support',
  'Construction of roads, bridges, and school buildings',
  'Water systems development',
  'Quality infrastructure projects',
  'Surveying and engineering design',
  'Feasibility studies and project management',
  'Equipment pool maintenance',
  'Municipal government assistance',
  'Barangay engineering support',
];

export default function ProvincialEngineeringPage() {
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
              Provincial Engineering Office — Province of Bataan
            </div>

            <h1 className="text-4xl lg:text-6xl font-serif font-bold text-white leading-tight mb-6">
              Provincial{' '}
              <span className="italic text-amber-200">Engineering</span>
              <br />
              Office
            </h1>

            <p className="text-base lg:text-lg text-white/70 leading-relaxed mb-10 max-w-xl">
              Professional planners and builders committed to delivering high-quality infrastructure 
              projects that respond to the developmental needs of Bataeños.
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

          {/* PEO Logo */}
          <motion.div 
            {...fade(0.3)}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl scale-110" />
              <img
                src="/images/peo_logo-300x300.png.png"
                alt="Provincial Engineering Office Logo"
                className="relative w-64 h-64 lg:w-96 lg:h-96 object-contain drop-shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── MISSION BAR ── */}
      <div className="bg-slate-50 border-b border-slate-200 px-8 lg:px-16 py-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-700 mb-2">Mission</h3>
            <div className="text-slate-700 leading-relaxed space-y-2">
              <p className="font-semibold">We are committed:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>To be professional Planners and Builders ready to serve the public effectively and efficiently</li>
                <li>To assist the government's plan of infrastructure development by taking charge of construction of public roads & bridges, school buildings and water systems that will be service to the people</li>
                <li>To construct good quality of infrastructure projects that can withstand time with less hindrances/problems</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ── VISION BAR ── */}
      <div className="bg-white border-b border-slate-200 px-8 lg:px-16 py-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Building className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-700 mb-2">Vision</h3>
            <p className="text-slate-700 leading-relaxed">
              PEO aspires to have quality infrastructure projects that will be beneficial to Bataeños 
              and responding to their developmental needs. Projects that will improve the quality of 
              lives of our people and that will be integrated with our goal of public service.
            </p>
          </div>
        </div>
      </div>

      {/* ── GOAL BAR ── */}
      <div className="bg-slate-50 border-b border-slate-200 px-8 lg:px-16 py-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-700 mb-2">Goal</h3>
            <p className="text-slate-700 leading-relaxed">
              To deliver high-quality infrastructure projects responding to the developmental needs of Bataeños.
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
              Building Quality Infrastructure for Bataan's Future
            </h2>
            <div className="space-y-4 text-slate-600 text-[15px] leading-relaxed">
              <p>
                The Provincial Engineering Office (PEO) serves as the primary infrastructure development 
                arm of the Province of Bataan. Our team of professional planners and builders is dedicated 
                to serving the public effectively and efficiently through the planning, design, and 
                construction of quality infrastructure projects.
              </p>
              <p>
                We take charge of constructing public roads and bridges, school buildings, and water systems 
                that directly serve the people of Bataan. Our commitment is to deliver infrastructure projects 
                that can withstand the test of time with minimal hindrances or problems, ensuring long-term 
                benefits for all Bataeños.
              </p>
              <p>
                Through comprehensive engineering services including surveying, feasibility studies, project 
                management, and technical assistance to municipal governments and barangays, PEO plays a 
                crucial role in the province's infrastructure development and the improvement of the quality 
                of life of our people.
              </p>
            </div>

            <div className="mt-8 bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h4 className="text-sm font-bold text-slate-800 mb-4">Key Responsibilities</h4>
              <div className="grid sm:grid-cols-2 gap-x-4 gap-y-2.5">
                {keyResponsibilities.map((resp, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-[13.5px] text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>{resp}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Card */}
          <motion.div {...fadeIn(0.15)} className="sticky top-6">
            <div className="bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 rounded-2xl p-8 text-white">
              <h3 className="text-xl font-serif font-bold mb-3">Provincial Engineering Office</h3>
              <p className="text-sm text-white/80 leading-relaxed mb-6">
                Professional planners and builders delivering high-quality infrastructure projects 
                for the development and progress of Bataan.
              </p>

              <hr className="border-white/15 mb-6" />

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-white/60 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-white/85">
                    5th Floor, The Bunker @ The Capitol Compound<br />
                    Tenejero, Balanga City, Bataan 2100 PH
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <a href="mailto:peo@bataan.gov.ph" className="text-sm text-white/90 hover:underline">
                    peo@bataan.gov.ph
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <a href="tel:+6347633-6960" className="text-sm text-white/90 hover:underline">
                    (047) 633-6960
                  </a>
                </div>
              </div>

              <button
                onClick={() =>
                  window.open(
                    'https://maps.google.com/?q=The+Bunker+Capitol+Compound+Tenejero+Balanga+City+Bataan',
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
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full mb-5">
            Our Objectives
          </span>
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-800 mb-3">
            Strategic Objectives & Services
          </h2>
          <p className="text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            Comprehensive engineering services designed to support infrastructure development and 
            improve the quality of life for all Bataeños.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {objectives.map((obj, i) => (
            <motion.div
              key={i}
              {...fadeIn(i * 0.08)}
              className="bg-white border border-slate-200 rounded-xl p-7 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/8 transition-all duration-200"
            >
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center mb-5">
                <obj.icon className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className="text-[15px] font-bold text-slate-800 mb-2">{obj.title}</h3>
              <p className="text-[13.5px] text-slate-600 leading-relaxed">{obj.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── COMMITMENT ── */}
      <section className="px-8 lg:px-16 py-16 lg:py-20">
        <motion.div {...fadeIn(0)} className="mb-10">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full mb-5">
            Our Commitment
          </span>
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-800 mb-3">
            Excellence in Infrastructure Development
          </h2>
          <p className="text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            We are dedicated to delivering infrastructure projects that meet the highest standards 
            of quality and sustainability.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div {...fadeIn(0.1)} className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6">
            <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center mb-4">
              <HardHat className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Professional Service</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Professional planners and builders ready to serve the public effectively and efficiently 
              in all infrastructure development initiatives.
            </p>
          </motion.div>

          <motion.div {...fadeIn(0.2)} className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6">
            <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mb-4">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Quality Construction</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Constructing good quality infrastructure projects that can withstand time with 
              minimal hindrances or problems.
            </p>
          </motion.div>

          <motion.div {...fadeIn(0.3)} className="bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-6">
            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Public Service</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Projects integrated with our goal of public service, improving the quality of 
              lives of our people.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 px-8 lg:px-16 py-16 lg:py-20 text-center">
        <motion.div {...fadeIn(0)}>
          <h2 className="text-3xl lg:text-5xl font-serif font-bold text-white mb-4">
            Building Bataan's Infrastructure, Building Our Future
          </h2>
          <p className="text-base text-white/70 max-w-lg mx-auto leading-relaxed">
            Quality infrastructure projects that respond to developmental needs and improve 
            the quality of life for all Bataeños.
          </p>
        </motion.div>
      </section>

    </div>
  );
}

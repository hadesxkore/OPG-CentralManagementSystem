import { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Target, Eye, FileText, 
  ArrowRight, Mail, Phone, MapPin, Shield, CheckCircle2,
  Users, Fish, Wheat, Wrench, FileSpreadsheet, Leaf
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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
  'Agricultural extension services',
  'On-site research services & facilities',
  'Prevention and control of plant & animal diseases',
  'Organization of farmers\' & fishermen\'s cooperatives',
  'Transfer of appropriate technology',
  'Rural-based organizations strengthening',
  'Agribusiness development programs',
  'Youth development in agriculture',
  'Gender and development mainstreaming',
  'Fisheries and aquatic resources management',
];

const divisions = [
  {
    icon: Users,
    title: 'Agricultural Development Support',
    color: 'from-green-50 to-emerald-50 border-green-200',
    iconBg: 'bg-green-600',
    programs: [
      { name: 'Strengthening Rural-Based Organizations (RBOs) – 4-H & Rural Improvement Clubs', desc: 'A program that strengthens the RBOs and their links to the government and other NGOs because they constitute a significant segment of the population labor force that can be tapped to enhance the productivity of the sector. This program is geared toward the creation of more opportunities and exposures.' },
      { name: 'Agribusiness Program', desc: 'A program that refers to agriculture-related activities that put farmers, processors, distributors, and consumers within a system that produces, processes, transports, markets, and distributes agricultural products.' },
      { name: 'Techno-Guidebook Program (TGP)', desc: 'A program that provides modalities for effective and efficient delivery of information and technology services in agriculture and fishery resources sector. It involves integration of Farmers Information and Technology Services (FITS), Magsasakang Siyentista (MS); Information, Education and Communication Strategies (IEC) and Information and Communication Technology (ICT).' },
      { name: 'Youth Development Program', desc: 'A program that creates and disseminates opportunities for the youth to discover and express their abilities and skills, and empower them in their decision making towards their holistic development.' },
      { name: 'Gender and Development (GAD) Program', desc: 'A program that mainstreams gender equality and equity in the agriculture sector. It promotes equal participation and access to resources, assistance, and services in agriculture.' },
      { name: 'Provincial Agricultural and Fisheries Council (PAFC)', desc: 'Empowerment of farmers and fisherfolk to be engaged in monitoring and evaluation activities and policy formulation for agriculture and fisheries.' },
      { name: 'Livelihood Enhancement for Agricultural Development Program (LEAD)', desc: 'Provides small grants and loans to targeted businesses to encourage wider investment and delivery of support services in the un-served or under-served market.' },
      { name: 'Philippine Rural Development Project (PRDP)', desc: 'Project funded by the World Bank to develop priority commodities of particular areas to help develop farmers organizations.' },
      { name: 'Planning Documents Preparation', desc: 'Preparation of Annual Accomplishment Report, Annual Investment Program, Annual Budget and other planning forms.' },
    ],
  },
  {
    icon: Fish,
    title: 'Fishery Development',
    color: 'from-blue-50 to-cyan-50 border-blue-200',
    iconBg: 'bg-blue-600',
    programs: [
      { name: 'Fisheries and Aquatic Resources Management Council (FARMC)', desc: 'Policy making and recommendatory body for Philippine Fisheries composed of representatives from the fisherfolk, NGOs, academe, commercial fisheries and government.' },
      { name: 'Aquaculture Development', desc: 'Programs related to enhancing the productivity of fishponds through fry sufficiency programs and seaweed development as well as mariculture production and regulate Fishpond Lease Agreements.' },
      { name: 'Capture Fisheries Development', desc: 'Provides technical assistance and advisory services on capture fisheries technologies pertaining to vessel designs, fishing gears and other regulations.' },
      { name: 'Post-harvest Fisheries', desc: 'Provision of trainings for value adding activities for fish and marine products to increase the income of fisherfolk households.' },
    ],
  },
  {
    icon: Wheat,
    title: 'Crop Development',
    color: 'from-amber-50 to-yellow-50 border-amber-200',
    iconBg: 'bg-amber-600',
    programs: [
      { name: 'Rice Program', desc: 'One of the priority programs of the department that is concentrated in raising the farmers\' productivity and competitiveness by providing various agricultural incentives, both technical and financial.' },
      { name: 'Corn and Cassava Program', desc: 'A program that aims to increase productivity and production of quality corn for human consumption, feeds and industrial uses, as well as improve farmers\' income and quality of life. A program intended to develop cassava as a viable alternative source of raw materials for industrial production and enhance industry competitiveness.' },
      { name: 'High-Value Crops Development (HVCD) Program', desc: 'A program that helps to promote the production, processing, marketing, and distribution of high-value crops. Commodities include but not limited to mango, sweet-potato, onion, coffee, cacao, tomatoes, and other fruits and vegetables.' },
      { name: 'Organic Agriculture (OA) Program', desc: 'As mandated by the national law aims were designed to promote, propagate, further develop, and implement the practice of organic agriculture in the Philippines towards a competitive and sustainable organic agriculture industry.' },
      { name: 'Soils', desc: 'Provides continuing assessment of the sustainability of the country\'s agricultural production systems, particularly soils and water as vital agricultural resources and sustains Philippine agriculture through the promotion of sustainable agricultural land management practices in the croplands, as well as in the marginal uplands, hilly lands, and highlands.' },
      { name: 'Research Studies and Development', desc: 'Participate in the conduct of research on Next-Gen Plus Project and Validation of Different Fertilizer Recommendations and Nitrogen Calibration on the Growth and Yield Performance of Rice.' },
    ],
  },
  {
    icon: Wrench,
    title: 'Agricultural and Biosystems Engineering (ABE)',
    color: 'from-slate-50 to-gray-50 border-slate-200',
    iconBg: 'bg-slate-600',
    programs: [
      { name: 'Regulatory and Enforcement', desc: 'Monitors compliance to engineering standards and verification of specifications of machineries, equipment, and infrastructures.' },
      { name: 'Irrigation and Drainage', desc: 'Construction of irrigation infrastructures for agricultural and fishery areas.' },
      { name: 'Agricultural Infrastructures and Machineries', desc: 'Establishment of warehouses, and distribution of machineries such as mechanical dryers, tractors, rice reapers, harvesters, etc.' },
    ],
  },
  {
    icon: FileSpreadsheet,
    title: 'Administrative Support Unit',
    color: 'from-purple-50 to-indigo-50 border-purple-200',
    iconBg: 'bg-purple-600',
    programs: [
      { name: 'Administrative Services', desc: 'Preparation of DTR, CAFOA, payroll, TEV, transmission of documents, uploading of accomplishments of employees, uploading of Monthly Report on L&D Tracking, preparation of CAFOA expenditure monitoring and Locator Slip.' },
    ],
  },
];

export default function ProvincialAgriculturePage() {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 overflow-hidden px-8 lg:px-16 py-16 lg:py-24"
      >
        {/* subtle decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 left-48 w-52 h-52 rounded-full bg-white/4 pointer-events-none" />

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div {...fade(0.1)} className="relative">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-green-200 inline-block" />
              Office of the Provincial Agriculturist — Province of Bataan
            </div>

            <h1 className="text-4xl lg:text-6xl font-serif font-bold text-white leading-tight mb-6">
              Provincial{' '}
              <span className="italic text-green-200">Agriculturist's</span>
              <br />
              Office
            </h1>

            <p className="text-base lg:text-lg text-white/70 leading-relaxed mb-10 max-w-xl">
              Excellent delivery of extension and support services to achieve sustained productivity 
              and income among agriculture and fisheries sector in Bataan.
            </p>

            <div className="flex flex-wrap gap-3">
              <button className="bg-white text-green-700 font-semibold text-sm px-6 py-3 rounded-lg inline-flex items-center gap-2 hover:bg-green-50 transition-colors">
                Our Programs <ArrowRight className="w-4 h-4" />
              </button>
              <button className="bg-transparent text-white border border-white/40 font-medium text-sm px-6 py-3 rounded-lg hover:bg-white/10 hover:border-white transition-colors">
                Contact Us
              </button>
            </div>
          </motion.div>

          {/* Agriculture Logo */}
          <motion.div 
            {...fade(0.3)}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl scale-110" />
              <img
                src="/images/agri-logo.png.png"
                alt="Provincial Agriculturist's Office Logo"
                className="relative w-64 h-64 lg:w-96 lg:h-96 object-contain drop-shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── MANDATE BAR ── */}
      <div className="bg-slate-50 border-b border-slate-200 px-8 lg:px-16 py-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-green-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-green-700 mb-2">Mandate</h3>
            <p className="text-slate-700 leading-relaxed">
              Provides agricultural extension services and on-site research services & facilities which 
              include the prevention and control of plant & animal diseases and assistance in the 
              organization of farmers' & fishermen's cooperatives and other collective organizations, 
              as well as the transfer of appropriate technology.
            </p>
          </div>
        </div>
      </div>

      {/* ── MISSION BAR ── */}
      <div className="bg-white border-b border-slate-200 px-8 lg:px-16 py-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6 text-green-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-green-700 mb-2">Mission</h3>
            <p className="text-slate-700 leading-relaxed">
              Excellent delivery of extension and support services to clienteles.
            </p>
          </div>
        </div>
      </div>

      {/* ── VISION BAR ── */}
      <div className="bg-slate-50 border-b border-slate-200 px-8 lg:px-16 py-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Eye className="w-6 h-6 text-green-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-green-700 mb-2">Vision</h3>
            <p className="text-slate-700 leading-relaxed">
              Sustained productivity and income among agriculture and fisheries sector in Bataan by 2025.
            </p>
          </div>
        </div>
      </div>

      {/* ── ABOUT ── */}
      <section className="px-8 lg:px-16 py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Text */}
          <motion.div {...fadeIn(0)}>
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-green-700 bg-green-50 px-3 py-1 rounded-full mb-5">
              About the Office
            </span>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-800 leading-snug mb-6">
              Empowering Farmers and Fisherfolk for Sustainable Agriculture
            </h2>
            <div className="space-y-4 text-slate-600 text-[15px] leading-relaxed">
              <p>
                The Office of the Provincial Agriculturist serves as the primary agricultural development 
                agency of the Province of Bataan. We are committed to providing excellent extension and 
                support services to farmers, fisherfolk, and other agricultural stakeholders throughout 
                the province.
              </p>
              <p>
                Our office provides comprehensive agricultural extension services, on-site research facilities, 
                and technical assistance in the prevention and control of plant and animal diseases. We actively 
                support the organization of farmers' and fishermen's cooperatives and facilitate the transfer 
                of appropriate agricultural technology to enhance productivity and sustainability.
              </p>
              <p>
                Through our various programs and divisions, we work towards achieving sustained productivity 
                and increased income for the agriculture and fisheries sector in Bataan. Our integrated approach 
                encompasses crop development, fishery management, agricultural engineering, and comprehensive 
                support services for rural communities.
              </p>
            </div>

            <div className="mt-8 bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h4 className="text-sm font-bold text-slate-800 mb-4">Key Services</h4>
              <div className="grid sm:grid-cols-2 gap-x-4 gap-y-2.5">
                {keyServices.map((service, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-[13.5px] text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{service}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Card + Org Chart */}
          <motion.div {...fadeIn(0.15)} className="space-y-6">
            {/* Contact Card */}
            <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-8 text-white">
              <h3 className="text-xl font-serif font-bold mb-3">Provincial Agriculturist's Office</h3>
              <p className="text-sm text-white/80 leading-relaxed mb-6">
                Delivering excellent extension and support services for sustained agricultural 
                productivity and income growth in Bataan.
              </p>

              <hr className="border-white/15 mb-6" />

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-white/60 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-white/85">
                    5th Floor, The Bunker, Capitol Compound<br />
                    San Jose, Balanga City, Bataan 2100 PH
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <a href="mailto:agri@bataan.gov.ph" className="text-sm text-white/90 hover:underline">
                    agri@bataan.gov.ph
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-white/60 flex-shrink-0" />
                  <a href="tel:+639190791367" className="text-sm text-white/90 hover:underline">
                    0919-0791367
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
                <FileText className="w-4 h-4 text-green-600" />
                Organizational Structure
              </h4>
              <img
                src="/images/opa-orgchart-232x300.jpg.png"
                alt="Provincial Agriculturist's Office Organizational Chart"
                className="w-full h-auto rounded-lg border border-slate-200"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── DUTIES AND FUNCTIONS (ACCORDION) ── */}
      <section className="bg-slate-50 px-8 lg:px-16 py-16 lg:py-20">
        <motion.div {...fadeIn(0)} className="mb-10">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-green-700 bg-green-50 px-3 py-1 rounded-full mb-5">
            Duties and Functions
          </span>
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-800 mb-3">
            Our Divisions & Programs
          </h2>
          <p className="text-[15px] text-slate-600 max-w-3xl leading-relaxed">
            Comprehensive programs and services organized across five specialized divisions to support 
            agricultural development in Bataan.
          </p>
        </motion.div>

        <motion.div {...fadeIn(0.15)} className="max-w-5xl">
          <Accordion type="single" collapsible className="space-y-4">
            {divisions.map((division, index) => (
              <AccordionItem 
                key={index} 
                value={`division-${index}`}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden"
              >
                <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4 text-left">
                    <div className={`w-10 h-10 ${division.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <division.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">
                        {division.title} Division
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {division.programs.length} program{division.programs.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-4 pt-2">
                    {division.programs.map((program, pIndex) => (
                      <div 
                        key={pIndex}
                        className={`bg-gradient-to-br ${division.color} rounded-lg p-5 border-2`}
                      >
                        <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-start gap-2">
                          <Leaf className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          {program.name}
                        </h4>
                        <p className="text-[13.5px] text-slate-600 leading-relaxed ml-6">
                          {program.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 px-8 lg:px-16 py-16 lg:py-20 text-center">
        <motion.div {...fadeIn(0)}>
          <h2 className="text-3xl lg:text-5xl font-serif font-bold text-white mb-4">
            Growing Together, Harvesting Success
          </h2>
          <p className="text-base text-white/70 max-w-lg mx-auto leading-relaxed">
            Empowering farmers and fisherfolk through excellent extension services and sustainable 
            agricultural development programs.
          </p>
        </motion.div>
      </section>

    </div>
  );
}

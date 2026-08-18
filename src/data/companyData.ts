import { ServiceItem, CaseStudy, TeamMember, InsightPost, OfficeLocation, ClientProject, ClientMessage, FederalCredentials, InvestmentPayloadItem } from '../types';

export const COMPANY_INFO = {
  name: "Display & Cell Pros LLC",
  shortName: "D&CP",
  tagline: "Master Precision Micro-Soldering & Mobile Data-Secure Lab",
  description: "Display & Cell Pros LLC (D&CP) is a Combat Veteran and Enrolled Tribal Member-owned precision electronics lab specializing in Tier 3 micro-soldering, on-site data-secure mobile repairs, and federal technical maintenance under NAICS 811210. In business since October 17, 2025.",
  establishedYear: 2025,
  establishedDate: "October 17, 2025",
  founder: "Ryan Young",
  stats: [
    { label: "Gross Profit Margin (Micro-Soldering)", value: "87%" },
    { label: "MVP Break-Even Volume", value: "17 Repairs/mo" },
    { label: "SAM.gov Federal UEI", value: "VAJXG5MNYQK8" },
    { label: "On-Site Data Privacy Guarantee", value: "100% Zero-Leak" },
  ]
};

export const FEDERAL_CREDENTIALS: FederalCredentials = {
  uei: "VAJXG5MNYQK8",
  ein: "39-5018763",
  ubi: "605 985 265",
  naicsCode: "811210",
  naicsDescription: "Electronic and Precision Equipment Repair & Maintenance",
  samStatus: "Active / Pre-Flight Ready (2026)",
  demographics: [
    "Combat Veteran-Owned Small Business",
    "Enrolled Tribal Member Entity",
    "Small Business Concern (<500 Employees)"
  ],
  sbaStatus: "Qualified Small Business Concern"
};

export const PHASE_1_INVESTMENT_LOADOUT: InvestmentPayloadItem[] = [
  {
    category: "Category 1 ($2,100)",
    allocation: 2100,
    title: "Technical Moat (Tier 3 Micro-Soldering & Board Diagnostics)",
    purpose: "Establishes a precision repair barrier preventing outsourcing of board-level failures ($800 per job).",
    keyAssets: [
      "JBC Precision Micro-Soldering Station",
      "FLIR High-Resolution Thermal Imaging Camera",
      "RF4 Optical Microscope & Board Jig Assembly",
      "Logic Board Component Reflow Station"
    ]
  },
  {
    category: "Category 2 ($2,600)",
    allocation: 2600,
    title: "Velocity Inventory (High-Turnover Parts)",
    purpose: "Maintains immediate stock for high-demand devices to guarantee same-day turnaround.",
    keyAssets: [
      "iPhone 11–14 Series OLED/LCD Assemblies ($30–$60 unit cost)",
      "Samsung A-Series & S-Series Premium Display Modules",
      "High-Capacity Battery Replacements & Flex Cables",
      "Board-Level Capacitors, IC Chips & Power Regulators"
    ]
  },
  {
    category: "Category 3 ($300)",
    allocation: 300,
    title: "Digital Command & Audit Infrastructure",
    purpose: "Ensures FAR-compliant audit-readiness and localized digital customer acquisition.",
    keyAssets: [
      "QuickBooks Online (Clean Feed FAR-Compliant Setup)",
      "Local SEO Optimization & Search Engine Indexing",
      "Encrypted Customer Service Portal Integration"
    ]
  }
];

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: "tier3-micro-soldering",
    title: "Tier 3 Micro-Soldering & Logic Board Restoration",
    category: "micro-soldering",
    shortDescription: "Precision component-level repair for shorted boards, blown power ICs, liquid damage, and damaged FPC connectors.",
    fullDescription: "While 90% of local repair shops are limited to basic part swapping, D&CP operates a full Tier 3 micro-soldering laboratory. Utilizing JBC soldering stations, thermal imaging, and high-power microscopes, we repair board-level failures that competitors write off, capturing $800 major repair jobs at an 87% gross margin.",
    iconName: "Cpu",
    deliverables: [
      "BGA IC Chip Reballing & Replacement",
      "Thermal Camera Micro-Short Circuit Tracing",
      "FPC Connector & Power Management IC (PMIC) Reflow",
      "Trace Repair & Jumper Wire Bridge Reconstruction"
    ],
    keyMetrics: [
      { label: "Target Price", value: "$800 / job" },
      { label: "Gross Margin", value: "87%" }
    ],
    caseStudyRefId: "hospital-board-repair",
    tags: ["Micro-Soldering", "Tier 3 Repair", "Logic Board", "Thermal Tracing"],
    marginProfit: "87% Gross Profit"
  },
  {
    id: "high-velocity-repairs",
    title: "High-Velocity Screen & Battery Replacements",
    category: "high-velocity",
    shortDescription: "Rapid same-day display, battery, and port restorations funded by lean velocity inventory.",
    fullDescription: "High-velocity retail repairs provide the foundational cash flow floor for D&CP. Priced at $139 with premium component costs of $30–$60, our 80%+ markup delivers sustainable daily liquidity while maintaining exceptional turnaround times.",
    iconName: "Zap",
    deliverables: [
      "OEM-Grade Display Assembly Swaps",
      "High-Capacity Battery Replacement & Cycle Calibration",
      "Charging Port Flex Cable Soldering & Cleanouts",
      "Same-Day Express Mobile Delivery Option"
    ],
    keyMetrics: [
      { label: "Target Price", value: "$139 / repair" },
      { label: "Cost Markup", value: "80%+" }
    ],
    tags: ["Express Repair", "Display Swap", "Battery Service", "High Velocity"],
    marginProfit: "80% Markup"
  },
  {
    id: "mobile-data-secure-lab",
    title: "Mobile Lab & On-Site Data Privacy Guarantee",
    category: "mobile-data-security",
    shortDescription: "Zero-leak mobile lab service ensuring client data never leaves their physical presence during repair.",
    fullDescription: "Corporate, legal, and healthcare clients cannot risk off-site data leaks or device theft. D&CP deploys a fully equipped mobile repair lab directly to client premises in Spokane and surrounding regions, conducting repairs on-site with 100% data privacy guarantees.",
    iconName: "ShieldCheck",
    deliverables: [
      "On-Site Mobile Lab Vehicle Deployment",
      "Zero-Data-Access Repair Protocol (Data Never Touched)",
      "Chain-of-Custody Documentation for Corporate Legal Compliance",
      "Immediate On-Site QC & Functional Validation"
    ],
    keyMetrics: [
      { label: "Data Leakage", value: "0% Guarantee" },
      { label: "Rent Overhead", value: "$0 (Mobile Lab)" }
    ],
    caseStudyRefId: "mobile-security-law-firm",
    tags: ["Mobile Repair", "On-Site Data Privacy", "Zero Trust", "Corporate Fleet"],
    marginProfit: "100% On-Site Confidential"
  },
  {
    id: "federal-gsa-contracting",
    title: "Federal & GSA Equipment Repair Contracting",
    category: "federal-gsa",
    shortDescription: "SAM.gov registered (UEI VAJXG5MNYQK8) precision repair services for government, defense, and public sector fleets.",
    fullDescription: "Positioned under NAICS 811210 (Electronic and Precision Equipment Repair), D&CP leverages Combat Veteran and Enrolled Tribal Member designations to secure federal procurement contracts, GSA orders, and SBIR R&D grant pipelines.",
    iconName: "Award",
    deliverables: [
      "FAR-Compliant Clean Feed Accounting via QuickBooks",
      "Federal Precision Equipment Maintenance (NAICS 811210)",
      "GSA Schedule & SAM.gov Active UEI Integration",
      "SBIR/STTR Phase I Early-Stage R&D Diagnostic Readiness"
    ],
    keyMetrics: [
      { label: "SAM.gov UEI", value: "VAJXG5MNYQK8" },
      { label: "NAICS Code", value: "811210" }
    ],
    tags: ["SAM.gov", "GSA Contractor", "Combat Veteran", "Tribal Member"],
    marginProfit: "Federal Procurement Ready"
  },
  {
    id: "board-data-recovery",
    title: "Emergency Board-Level Forensic Data Recovery",
    category: "board-diagnostics",
    shortDescription: "Specialized extraction of critical encrypted data from dead or severely water-damaged motherboards.",
    fullDescription: "When devices suffer catastrophic water immersion, crushing, or electrical surge, standard software recovery fails. We perform board reflow, NAND chip swaps, and temporary logic repair to extract irreplaceable photos, legal documents, and corporate records.",
    iconName: "HardDrive",
    deliverables: [
      "NAND / Memory IC Board Transplants",
      "Ultrasonic Corrosion Cleaning & Voltage Bridge Repair",
      "Encrypted External Storage Data Delivery",
      "Forensic Inspection Reports"
    ],
    keyMetrics: [
      { label: "Recovery Success", value: "92%" },
      { label: "Standard Rate", value: "$500 – $1,200" }
    ],
    tags: ["Data Recovery", "Forensics", "Water Damage", "NAND Swap"],
    marginProfit: "High Value Specialized Service"
  }
];

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: "hospital-board-repair",
    title: "Critical Hospital Diagnostic Tablet Logic Board Recovery",
    clientName: "Inland Northwest Medical Center",
    industry: "Healthcare Systems",
    category: "micro-soldering",
    summary: "Restored a water-damaged specialized ultrasound diagnostic tablet motherboard that replacement vendors quoted at $12,000 replacement.",
    challenge: "A primary diagnostic tablet suffered liquid damage during emergency triage. The OEM device vendor stated the unit was unrepairable and quoted a 6-week backordered replacement.",
    solution: "DCP deployed thermal imaging to locate a shorted 0201 power filter capacitor, replaced the PMIC chip via JBC micro-soldering station, and restored full touch display lines in 3 hours.",
    impactMetrics: [
      { label: "Client Savings", value: "$11,200", trend: "vs replacement" },
      { label: "Turnaround Time", value: "3 Hours", trend: "vs 6 wks OEM" },
      { label: "Repair Margin", value: "89%", trend: "Gross Margin" }
    ],
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    year: "2026",
    testimonial: {
      quote: "Ryan's micro-soldering expertise saved our emergency ward thousands of dollars and brought our ultrasound tablet back online the very same afternoon.",
      author: "Chief Biomedical Engineer",
      role: "Medical Equipment Supervisor",
      company: "Inland Northwest Medical Center"
    }
  },
  {
    id: "mobile-security-law-firm",
    title: "Law Firm Mobile Data Confidentiality Fleet Maintenance",
    clientName: "Spokane Trial & Corporate Legal Counsel",
    industry: "Legal & Corporate",
    category: "mobile-security",
    summary: "Executed on-site screen and battery replacements for 28 senior partner devices inside our mobile laboratory van.",
    challenge: "Law partners possessed confidential litigation documents on mobile hardware and could not permit devices to leave partner sight under client confidentiality rules.",
    solution: "DCP parked the mobile repair laboratory directly outside the firm's offices, completing all 28 repairs on-site while partners observed work via transparent lab window.",
    impactMetrics: [
      { label: "Data Leak Exposure", value: "0%", trend: "100% On-Site" },
      { label: "Partner Downtime", value: "< 25 mins", trend: "per device" },
      { label: "Fleet Contract Value", value: "$4,200", trend: "recurring" }
    ],
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    year: "2026",
    testimonial: {
      quote: "The mobile lab guarantee gave our compliance officers 100% peace of mind. Exceptional precision and speed.",
      author: "Managing Partner",
      role: "Chief Operating Officer",
      company: "Spokane Trial Counsel"
    }
  },
  {
    id: "federal-fleet-maintenance",
    title: "Federal Agency Field Tablet Board Repair Contract",
    clientName: "Regional Federal Forestry & Survey Division",
    industry: "Federal Government",
    category: "federal-gsa",
    summary: "Utilized UEI VAJXG5MNYQK8 under NAICS 811210 to repair ruggedized survey tablets damaged during wildfire field operations.",
    challenge: "Extreme thermal stress in field operations caused power rail failures across 15 survey tablets.",
    solution: "DCP reflowed micro-connectors, replaced blown fuses, and issued FAR-compliant maintenance logs under SAM.gov federal procurement guidelines.",
    impactMetrics: [
      { label: "Devices Salvaged", value: "15 / 15", trend: "100% Success" },
      { label: "Taxpayer Savings", value: "$18,500", trend: "procurement saved" },
      { label: "Compliance Rating", value: "100%", trend: "FAR Compliant" }
    ],
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    featured: false,
    year: "2026"
  }
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "ryan-young",
    name: "Ryan Young",
    role: "Founder, CEO & Lead Precision Engineer",
    department: "Executive & Technical Operations",
    bio: "Combat Veteran and Enrolled Tribal Member. Ryan's computer science experience spans the majority of his career profession, starting in junior high when schools lacked dedicated IT staff. This lifelong passion for networking and hardware diagnostics shaped D&CP's rigorous engineering standards.",
    technicalBiography: "My journey in computer science spans the majority of my career profession. I started working in computer networking when I was in junior high—back when there were no IT professionals in schools. I just carried on a good interest and passion for computers after that, which naturally led to inclined technical accomplishments and a unique roadmap in Tier 3 micro-soldering, thermal circuit diagnostics, and precision electronics restoration.",
    militaryService: "After high school, I joined the US Navy as a participant in the delayed entry program. Shortly into boot camp, September 11th happened, and I was deployed to Iraq immediately. That defining experience instilled unwavering discipline, crisis resilience, and mission-critical precision.",
    education: "Attended Salish Kootenai College in Pablo, Montana, majoring in Computer Engineering.",
    researchExperience: "Worked as a NASA intern as a subsystem communications lead on our nation's first nanosat tribal college-led project: BisonSat. Additionally employed by MSGC MSU Bozeman R&D project 'ultra low frequency magnetometer for aurora detection'.",
    seattleExperience: "After college, I moved to Seattle and started IT contracting in King County. I also worked as a field technician and a low-voltage technician in King County, where I learned the logistics and hardworking ethics of the American Dream. One of the fortunate contracts landed me as a mobile phone repair technician at the Car Toys warehouse in Kent, Washington. While working as an active IT contractor in Seattle, I also obtained a web development certification in 2015. As a junior software developer, I was able to be on projects that helped educate me in e-commerce and extra lean business strategies.",
    photo: "/ryan.jpg",
    email: "ryan@displaycellpros.com",
    linkedInUrl: "https://www.linkedin.com/in/ryan-young-dcp/",
    expertise: ["Tier 3 Micro-Soldering", "SAM.gov Procurement", "Thermal Imaging", "Circuit Reflow"],
    location: "Spokane, WA (Mobile Lab Command)"
  },
  {
    id: "technical-advisor",
    name: "Advisory Board & Technical Specialists",
    role: "Master Hardware & Compliance Advisors",
    department: "Quality Assurance & GSA Contracting",
    bio: "Advisory team overseeing FAR-compliant financial engineering, OBBBA Section 179 tax optimization, and GSA Schedule contracting alignment.",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    email: "info@displaycellpros.com",
    expertise: ["FAR Compliance", "QuickBooks Clean-Feed", "Section 179 Tax Code", "GSA Protocols"],
    location: "Spokane / Federal Desk"
  }
];

export const INSIGHTS_DATA: InsightPost[] = [
  {
    id: "micro-soldering-moat-2026",
    title: "Why Micro-Soldering Creates an Unshakeable Technical Moat in Hardware Repair",
    category: "technical-micro-soldering",
    excerpt: "Analysis of how board-level diagnostics and JBC precision soldering bridge the gap between $139 part swaps and $800 major board restorations.",
    content: `
      In the competitive electronics service landscape, 90% of local shops are strictly "part swappers." When faced with a shorted capacitor, a damaged FPC connector, or a blown power management IC (PMIC), standard storefronts declare the motherboard "dead."

      ### Capturing the $800 Major Repair Spread
      By investing in Tier 3 micro-soldering infrastructure (JBC soldering stations, FLIR thermal imaging cameras, and RF4 optical microscopes), Display & Cell Pros LLC unlocks an elite service tier.

      - **Component Costs**: Micro-capacitors and IC chips cost pennies.
      - **Target Service Fee**: $800 per major repair.
      - **Gross Profit Margin**: 87%.

      This technical moat insulates D&CP from price wars while providing local healthcare, legal, and government clients with immediate, high-value device recovery.
    `,
    author: {
      name: "Ryan Young",
      role: "Founder & Lead Precision Engineer",
      avatar: "/ryan.jpg"
    },
    date: "August 3, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80",
    featured: true,
    tags: ["Micro-Soldering", "Tier 3 Repair", "Unit Economics", "Spokane WA"]
  },
  {
    id: "obbba-section-179-tax-engineering",
    title: "Tax Engineering for Hardware Labs: Capitalizing OBBBA 100% Bonus Depreciation",
    category: "tax-engineering",
    excerpt: "How the One Big Beautiful Bill Act (OBBBA) and Section 179 allow 100% first-year write-offs for precision equipment investments.",
    content: `
      Under the OBBBA provisions permanently restored for qualifying equipment placed in service, small business technical laboratories can immediately deduct 100% of capital investments.

      ### $5,000 Phase 1 Loadout Impact
      By writing off the full $5,000 Phase 1 operational payload against year-one revenue, D&CP shields initial profits from federal income tax, preserving liquidity to fund high-velocity inventory scaling.
    `,
    author: {
      name: "D&CP Financial Advisory",
      role: "Tax & Compliance Lead",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    },
    date: "July 28, 2026",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80",
    featured: false,
    tags: ["Section 179", "OBBBA Tax Code", "Bonus Depreciation", "Accounting"]
  },
  {
    id: "sam-gov-federal-readiness-2026",
    title: "Federal Procurement Readiness: Utilizing UEI VAJXG5MNYQK8 & NAICS 811210",
    category: "federal-compliance",
    excerpt: "A tactical guide to navigating SAM.gov registration, FAR-compliant QuickBooks accounting, and SBIR Phase I R&D grant eligibility.",
    content: `
      Establishing a "Golden Record" in SAM.gov under UEI VAJXG5MNYQK8 is the prerequisite for federal contract awards. Combining Combat Veteran and Enrolled Tribal Member credentials unlocks grant multipliers across federal and regional economic development portals.
    `,
    author: {
      name: "Ryan Young",
      role: "Founder & Lead Precision Engineer",
      avatar: "/ryan.jpg"
    },
    date: "July 18, 2026",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1000&q=80",
    featured: false,
    tags: ["SAM.gov", "GSA", "NAICS 811210", "Combat Veteran"]
  }
];

export const OFFICE_LOCATIONS: OfficeLocation[] = [
  {
    id: "spokane-hq",
    city: "Spokane (HQ & Mobile Command)",
    country: "United States (Washington)",
    address: "Spokane Mobile Operations & Dispatch Hub, WA 99201",
    phone: "+1 (509) 555-0192",
    email: "ryan@displaycellpros.com",
    tz: "PST (UTC-8)",
    isHeadquarters: true,
    coordinates: { lat: 47.6588, lng: -117.4260 }
  }
];

export const MOCK_CLIENT_PROJECTS: ClientProject[] = [
  {
    id: "JOB-2026-089",
    name: "Tier 3 Board Reflow & PMIC Chip Replacement",
    status: "In Progress",
    progress: 85,
    leadPartner: "Ryan Young",
    nextMilestone: "Thermal Imaging QC & Voltage Stability Test",
    targetCompletion: "Aug 4, 2026",
    recentDeliverable: "FLIR thermal short analysis report (#cap-0201 cleared)"
  },
  {
    id: "JOB-2026-074",
    name: "On-Site Legal Mobile Laboratory Fleet Service",
    status: "Completed",
    progress: 100,
    leadPartner: "Ryan Young",
    nextMilestone: "Quarterly Fleet Maintenance Renewal",
    targetCompletion: "Aug 1, 2026",
    recentDeliverable: "28 Devices Serviced On-Site with Zero Data Exposure Certificate"
  },
  {
    id: "JOB-2026-052",
    name: "GSA Federal Tablet Maintenance Batch (NAICS 811210)",
    status: "Pending Board Audit",
    progress: 92,
    leadPartner: "Ryan Young",
    nextMilestone: "SAM.gov FAR-Compliant Invoice Upload",
    targetCompletion: "Aug 10, 2026",
    recentDeliverable: "FAR Form 941 & Audit-Ready Maintenance Log"
  }
];

export const MOCK_CLIENT_MESSAGES: ClientMessage[] = [
  {
    id: "msg-201",
    senderName: "Ryan Young",
    senderRole: "Founder & Lead Engineer",
    timestamp: "Today at 9:15 AM",
    content: "Good morning! The thermal imaging diagnostic on your iPad logic board identified a shorted power rail capacitor. Component reflow is underway with our JBC micro-soldering station.",
    isFromClient: false
  },
  {
    id: "msg-202",
    senderName: "Marcus Vance",
    senderRole: "Client Representative",
    timestamp: "Today at 9:30 AM",
    content: "Awesome news Ryan! That saves us from replacing the entire tablet. Will you be sending the thermal scan image?",
    isFromClient: true
  },
  {
    id: "msg-203",
    senderName: "Ryan Young",
    senderRole: "Founder & Lead Engineer",
    timestamp: "Today at 9:40 AM",
    content: "Yes, attached in your client portal vault under 'FLIR Diagnostic Log v1'. Total turnaround time will be under 2 hours.",
    isFromClient: false
  }
];

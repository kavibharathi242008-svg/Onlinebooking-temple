export type Language = 'en' | 'ta';

export const translations = {
  en: {
    // Header & Nav
    siteTitle: 'AI Temple Dharisanam & Crowd Management System',
    tagline: 'Tamil Nadu Heritage Temples Smart Pilgrim Distribution',
    navHome: 'Home',
    navTemples: 'Temples',
    navBook: 'Book Dharisanam',
    navCounter: 'Temple Counter (Offline)',
    navCCTV: 'AI CCTV & Crowd Vision',
    navAITech: 'AI Technology',
    navHelp: 'Need Help?',
    navTickets: 'Verify Pass',
    navAdmin: 'Admin Portal',
    langToggle: 'தமிழ்',

    // Hero
    heroTitle: 'Plan Your Dharisanam. Avoid the Crowd.',
    heroSubtext: 'Book your preferred dharisanam slot in advance and spend less time waiting in long queues. Powered by AI crowd management across Tamil Nadu.',
    btnBookDarshan: 'Book Dharisanam Slot',
    btnExploreTemples: 'Explore Temples',
    searchPlaceholder: 'Search famous temples in Tamil Nadu (e.g., Palani, Madurai, Murugan, Shiva)...',

    // How It Works
    howItWorksTitle: 'How It Works',
    howItWorksSubtitle: 'Smart 5-step visitor distribution to eliminate overcrowding',
    step1Title: 'Search Temple',
    step1Desc: 'Find heritage shrines across Tamil Nadu by district, deity, or popularity.',
    step2Title: 'Choose Dharisanam',
    step2Desc: 'Select between Free Dharisanam (regular line) or Paid Dharisanam (express line).',
    step3Title: 'Select Date & Slot',
    step3Desc: 'Pick a 1-hour time slot with verified real-time database capacity.',
    step4Title: 'Get Digital Ticket',
    step4Desc: 'Instant digital pass with secure QR code for mobile or printout.',
    step5Title: 'Arrive On Time',
    step5Desc: 'Arrive 15 minutes before your slot and proceed directly without waiting.',
    aiDistributionBadge: 'AI analyses crowd patterns and helps distribute visitors across available slots.',

    // Darshan Types
    freeDarshan: 'Free Dharisanam',
    paidDarshan: 'Paid Dharisanam',
    freeDarshanDesc: 'General queue access at no cost with controlled hourly capacity.',
    paidDarshanDesc: 'Express queue line for a nominal temple fee with separate capacity.',

    // Statuses
    statusAvailable: 'AVAILABLE',
    statusLimited: 'LIMITED',
    statusFull: 'FULL',
    slotsRemaining: 'available',

    // Crowd Levels
    crowdLow: 'LOW',
    crowdMedium: 'MEDIUM',
    crowdHigh: 'HIGH',
    crowdVeryHigh: 'VERY HIGH',
    estimatedWait: 'Estimated Waiting Time',
    currentCrowd: 'Current Crowd Level',
    occupancy: 'Occupancy',

    // Offline Counter
    counterTitle: 'Offline Temple Counter Booking Desk',
    counterSubtitle: 'Front-entrance reservation portal for walk-in pilgrims without smartphones. Uses the exact same synchronized real-time capacity as online bookings.',
    staffNotice: 'Authorized Counter Staff Mode: Shared capacity ensures zero overbooking.',

    // Booking Wizard
    bookingWizardTitle: 'Dharisanam Slot Reservation',
    selectTempleLabel: '1. Select Temple',
    selectDarshanLabel: '2. Select Dharisanam Type',
    selectDateLabel: '3. Select Date',
    selectSlotLabel: '4. Select Time Slot',
    visitorDetailsLabel: '5. Visitor Details',
    primaryVisitorName: 'Lead Devotee Name',
    visitorPhone: 'Mobile Phone Number',
    visitorEmail: 'Email Address (Optional)',
    addVisitor: '+ Add Another Visitor',
    removeVisitor: 'Remove',
    confirmBooking: 'Confirm & Reserve Slot',
    paymentDemo: 'Complete Demo Payment (₹{amount})',

    // Ticket
    ticketTitle: 'Official Temple Dharisanam E-Pass',
    ticketRef: 'Booking Reference',
    darshanDate: 'Dharisanam Date',
    darshanTime: 'Assigned Time Slot',
    visitorsCount: 'Total Visitors',
    qrInstruction: 'Present this QR code at temple entrance verification counters.',
    printTicket: 'Print / Save Pass',
    verifiedPass: 'Government Verified E-Pass',

    // AI & CCTV
    cctvTitle: 'AI CCTV Crowd Counting & Computer Vision',
    cctvSubtitle: 'Simulated real-time people detection, crowd density heatmaps, and automated slot redistribution recommendations based on YOLO architecture.',
    aiRecTitle: 'AI Slot Recommendations',
    approveRec: 'Approve & Apply Capacity',
    rejectRec: 'Dismiss',

    // Help & Support
    helpTitle: 'Pilgrim Help Center & 24/7 Helpline',
    faqTitle: 'Frequently Asked Questions',
    chatWithUs: 'Chat with Temple Assistant',
    chatPlaceholder: 'Ask a question about timings, costs, slots, or ticket status...',
    tollFreeNumber: 'Toll-Free Helpline',
    emergencyContact: 'Emergency Medical Desk',

    // Verification & Search
    searchTemples: 'Filter by District or Deity',
    allDistricts: 'All Districts',
    allDeities: 'All Deities',
    verifiedBadge: 'Verified Temple Schedule'
  },
  ta: {
    // Header & Nav
    siteTitle: 'AI திருக்கோயில் தரிசனம் & கூட்ட மேலாண்மை அமைப்பு',
    tagline: 'தமிழ்நாடு பாரம்பரியத் திருக்கோயில்கள் சீர்மிகு பக்தர்கள் விநியோகம்',
    navHome: 'முகப்பு',
    navTemples: 'கோயில்கள்',
    navBook: 'தரிசனம் முன்பதிவு',
    navCounter: 'கோயில் கவுண்டர் (நேரடி)',
    navCCTV: 'AI சிசிடிவி & கூட்ட பார்வை',
    navAITech: 'AI தொழில்நுட்பம்',
    navHelp: 'உதவி மையம்',
    navTickets: 'பாஸ் சரிபார்ப்பு',
    navAdmin: 'நிர்வாகப் பலகை',
    langToggle: 'English',

    // Hero
    heroTitle: 'தரிசனத்தை முன்கூட்டியே திட்டமிடுங்கள். கூட்ட நெரிசலைத் தவிருங்கள்.',
    heroSubtext: 'உங்களுக்கு விருப்பமான தரிசன நேரத்தை முன்பதிவு செய்து நீண்ட வரிசையில் காத்திருக்கும் நேரத்தைக் குறையுங்கள். AI கூட்ட மேலாண்மை மூலம் இயங்குகிறது.',
    btnBookDarshan: 'தரிசனம் முன்பதிவு செய்',
    btnExploreTemples: 'கோயில்களைப் பார்',
    searchPlaceholder: 'தமிழ்நாடு புகழ்பெற்ற கோயில்களைத் தேடுக (எ.கா. பழனி, மதுரை, முருகன், சிவன்)...',

    // How It Works
    howItWorksTitle: 'எவ்வாறு செயல்படுகிறது?',
    howItWorksSubtitle: 'கூட்ட நெரிசலைத் தடுக்கும் 5-படி பக்தர்கள் பகிர்வு முறை',
    step1Title: 'கோயிலைத் தேர்வு செய்க',
    step1Desc: 'மாவட்டம் அல்லது மூலவர் அடிப்படையில் தமிழ்நாட்டின் புகழ்பெற்ற தலங்களைத் தேடுங்கள்.',
    step2Title: 'தரிசன வகையைத் தேர்வு செய்க',
    step2Desc: 'இலவச தரிசனம் (பொது வரிசை) அல்லது கட்டண தரிசனம் (விரைவு வரிசை) தேர்வு செய்யுங்கள்.',
    step3Title: 'தேதி & நேரத்தைத் தேர்வு செய்க',
    step3Desc: 'நிகழ்நேர தரவுத்தள ஒதுக்கீட்டின் அடிப்படையில் 1-மணி நேர தரிசனப் பிரிவைத் தேர்வு செய்க.',
    step4Title: 'டிஜிட்டல் பாஸைப் பெறுங்கள்',
    step4Desc: 'மொபைலில் அல்லது அச்சுப்படியாகப் பயன்படுத்தக்கூடிய பாதுகாப்பான QR குறியீடு கொண்ட இ-பாஸ்.',
    step5Title: 'நேரத்திற்கு வருகை தருக',
    step5Desc: 'ஒதுக்கப்பட்ட நேரத்திற்கு 15 நிமிடங்களுக்கு முன்பாக வந்து காத்திருப்பின்றி தரிசனம் செய்யுங்கள்.',
    aiDistributionBadge: 'AI கூட்ட முறைகளை ஆய்வு செய்து கிடைக்கக்கூடிய நேரங்களில் பக்தர்களைப் பிரித்து சீரமைக்கிறது.',

    // Darshan Types
    freeDarshan: 'இலவச தரிசனம்',
    paidDarshan: 'சிறப்புக் கட்டண தரிசனம்',
    freeDarshanDesc: 'கட்டணமில்லாத பொது வரிசை அனுமதி. கட்டுப்படுத்தப்பட்ட இட ஒதுக்கீடு.',
    paidDarshanDesc: 'குறைந்த கட்டணத்தில் தனி விரைவு வரிசை அனுமதி. தனி இட ஒதுக்கீடு.',

    // Statuses
    statusAvailable: 'கிடைக்கிறது',
    statusLimited: 'குறைந்த இடங்கள்',
    statusFull: 'முழுமை அடைந்தது',
    slotsRemaining: 'இடங்கள் உள்ளன',

    // Crowd Levels
    crowdLow: 'குறைவு',
    crowdMedium: 'மிதமானது',
    crowdHigh: 'அதிகம்',
    crowdVeryHigh: 'மிக அதிகம்',
    estimatedWait: 'மதிப்பிடப்பட்ட காத்திருப்பு நேரம்',
    currentCrowd: 'தற்போதைய கூட்ட நிலை',
    occupancy: 'நிரம்பிய அளவு',

    // Offline Counter
    counterTitle: 'கோயில் நுழைவு வாயில் நேரடி முன்பதிவு மையம்',
    counterSubtitle: 'ஸ்மார்ட்போன் இல்லாத பக்தர்களுக்கான நேரடி முன்பதிவு தளம். ஆன்லைன் மற்றும் கவுண்டர் இரண்டும் ஒரே பொதுவான தரிசன ஒதுக்கீட்டைப் பயன்படுத்துகின்றன.',
    staffNotice: 'அங்கீகரிக்கப்பட்ட பணியாளர் பயன்முறை: ஒரே ஒதுக்கீடு மூலம் அதிகப்படியான முன்பதிவு முற்றிலுமாகத் தடுக்கப்படுகிறது.',

    // Booking Wizard
    bookingWizardTitle: 'தரிசன நேரம் முன்பதிவு',
    selectTempleLabel: '1. கோயிலைத் தேர்வு செய்க',
    selectDarshanLabel: '2. தரிசன வகையைத் தேர்வு செய்க',
    selectDateLabel: '3. தேதியைத் தேர்வு செய்க',
    selectSlotLabel: '4. நேரத்தைத் தேர்வு செய்க',
    visitorDetailsLabel: '5. பக்தர்கள் விவரங்கள்',
    primaryVisitorName: 'முதன்மை பக்தர் பெயர்',
    visitorPhone: 'மொபைல் எண்',
    visitorEmail: 'மின்னஞ்சல் (விருப்பத்திற்குரியது)',
    addVisitor: '+ கூடுதல் பக்தரைச் சேர்க்க',
    removeVisitor: 'நீக்கு',
    confirmBooking: 'முன்பதிவை உறுதி செய்',
    paymentDemo: 'கட்டணம் செலுத்துக (₹{amount})',

    // Ticket
    ticketTitle: 'அதிகாரப்பூர்வ கோயில் தரிசன இ-பாஸ்',
    ticketRef: 'முன்பதிவு எண்',
    darshanDate: 'தரிசன தேதி',
    darshanTime: 'ஒதுக்கப்பட்ட நேரம்',
    visitorsCount: 'மொத்த பக்தர்கள்',
    qrInstruction: 'கோயில் நுழைவு வாயில் சரிபார்ப்பு கவுண்டரில் இந்த QR குறியீட்டைக் காண்பிக்கவும்.',
    printTicket: 'பாஸை அச்சிடுக / சேமிக்க',
    verifiedPass: 'அரசு சரிபார்க்கப்பட்ட இ-பாஸ்',

    // AI & CCTV
    cctvTitle: 'AI சிசிடிவி கூட்டக் கணக்கீடு & கணினி பார்வை',
    cctvSubtitle: 'YOLO கட்டமைப்பின் அடிப்படையில் நிகழ்நேர ஆட்கள் கண்டறிதல், அடர்த்தி வரைபடம் மற்றும் நேர ஒதுக்கீட்டு பரிந்துரைகள்.',
    aiRecTitle: 'AI தரிசன நேர பரிந்துரைகள்',
    approveRec: 'ஏற்றுக்கொள்க & நடைமுறைப்படுத்துக',
    rejectRec: 'நிராகரி',

    // Help & Support
    helpTitle: 'பக்தர்கள் உதவி மையம் & 24/7 தொலைபேசி உதவி',
    faqTitle: 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
    chatWithUs: 'கோயில் உதவி உதவியாளருடன் உரையாடுங்கள்',
    chatPlaceholder: 'நேரம், கட்டணம், இடங்கள் குறித்து ஏதேனும் கேட்கவும்...',
    tollFreeNumber: 'இலவச உதவி எண்',
    emergencyContact: 'அவசர மருத்துவ உதவி மையம்',

    // Verification & Search
    searchTemples: 'மாவட்டம் அல்லது மூலவர் மூலம் வடிகட்டவும்',
    allDistricts: 'அனைத்து மாவட்டங்கள்',
    allDeities: 'அனைத்து மூலவர்கள்',
    verifiedBadge: 'சரிபார்க்கப்பட்ட கோயில் நேரம்'
  }
};

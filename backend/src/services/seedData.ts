import { getDatabase, queryOne, runSql, saveDatabase } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export async function seedInitialData() {
  await getDatabase();

  const countRow = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM temples');
  if (countRow && countRow.count > 0) {
    return; // Already seeded
  }

  console.log('Seeding authentic Tamil Nadu temples dataset...');

  const temples = [
    {
      id: 'temple-palani',
      name: 'Arulmigu Dhandayuthapani Swamy Temple',
      name_tamil: 'அருள்மிகு தண்டாயுதபாணி சுவாமி திருக்கோயில், பழனி',
      district: 'Dindigul',
      city: 'Palani',
      deity: 'Lord Murugan',
      deity_tamil: 'முருகப் பெருமான்',
      image_url: '/images/temples/temple-palani.jpg',
      description: 'One of the six holy abodes (Arupadai Veedu) of Lord Murugan, located atop the Sivagiri hill in Palani. Celebrated for its unique Navapashanam idol crafted by sage Bogar, holy Panchamirtham prasad, and millions of Thaipusam pilgrims.',
      description_tamil: 'முருகப்பெருமானின் ஆறுபடை வீடுகளில் மூன்றாம் படை வீடு. போகர் சித்தரால் நவபாஷாணத்தால் உருவாக்கப்பட்ட மூலவர் திருமேனி கொண்ட உலகப் புகழ்பெற்ற புண்ணியத் தலம்.',
      location: 'Palani, Dindigul District, Tamil Nadu 624601',
      is_verified: 1,
      default_free_capacity: 500,
      default_paid_capacity: 150,
      default_paid_price: 100,
      advance_booking_hours: 24,
      facilities: JSON.stringify([
        'Rope Car & Winch Train Access',
        'Special Queue Complexes',
        'Free RO Drinking Water',
        'Locker & Cloak Room',
        'Tonsure (Mottai) Sheds',
        'Panchamirtham Stalls',
        'Medical First-Aid Center'
      ]),
      rules: JSON.stringify([
        'Traditional Hindu attire required (Dhoti/Kurta for men, Saree/Churidar for women)',
        'Footwear strictly restricted at hill base',
        'Mobile phones & photography prohibited inside sanctum sanctorum',
        'Valid photo identity card mandatory for Paid Darshan verification'
      ]),
      timings: [
        { session_name: 'Morning Session', session_name_tamil: 'காலை தரிசனம்', start_time: '06:00', end_time: '11:00', duration: 60 },
        { session_name: 'Afternoon & Evening Session', session_name_tamil: 'மாலை தரிசனம்', start_time: '14:00', end_time: '21:00', duration: 60 }
      ]
    },
    {
      id: 'temple-madurai',
      name: 'Arulmigu Meenakshi Sundareswarar Temple',
      name_tamil: 'அருள்மிகு மீனாட்சி சுந்தரேஸ்வரர் திருக்கோயில், மதுரை',
      district: 'Madurai',
      city: 'Madurai',
      deity: 'Goddess Meenakshi & Lord Sundareswarar',
      deity_tamil: 'மீனாட்சி அம்மன் & சுந்தரேஸ்வரர்',
      image_url: '/images/temples/temple-madurai.jpg',
      description: 'The architectural pride of Tamil Nadu located in the heart of the historic ancient city of Madurai. Known for its towering multi-tiered gopurams adorned with thousands of stone sculptures, Ashta Shakthi Mandapam, and the Thousand Pillar Hall.',
      description_tamil: 'மதுரையின் இதயமாகத் திகழும் வரலாற்றுச் சிறப்புமிக்க திருத்தலம். பிரம்மாண்ட கோபுரங்கள், ஆயிரம் கால் மண்டபம் மற்றும் பொற்றாமரைக் குளம் கொண்ட உலகப் புகழ்பெற்ற திராவிடக் கலைச் சின்னம்.',
      location: 'Madurai, Tamil Nadu 625001',
      is_verified: 1,
      default_free_capacity: 600,
      default_paid_capacity: 200,
      default_paid_price: 150,
      advance_booking_hours: 48,
      facilities: JSON.stringify([
        'Shoe Keeping Counters (4 Gopuram Entrances)',
        'Battery Buggy for Senior Citizens',
        'Wheelchair Assistance',
        'Prasadam Counter',
        'Security Bag Scanning',
        'Purified Drinking Water'
      ]),
      rules: JSON.stringify([
        'Strict dress code enforced at all four Gopurams',
        'No mobile phones or electronic gadgets allowed inside temple premises',
        'Baggage inspection mandatory at entrance security gates'
      ]),
      timings: [
        { session_name: 'Morning Session', session_name_tamil: 'காலை தரிசனம்', start_time: '05:00', end_time: '12:30', duration: 60 },
        { session_name: 'Evening Session', session_name_tamil: 'மாலை தரிசனம்', start_time: '16:00', end_time: '22:00', duration: 60 }
      ]
    },
    {
      id: 'temple-rameswaram',
      name: 'Arulmigu Ramanathaswamy Temple',
      name_tamil: 'அருள்மிகு ராமநாதசுவாமி திருக்கோயில், ராமேஸ்வரம்',
      district: 'Ramanathapuram',
      city: 'Rameswaram',
      deity: 'Lord Shiva (Jyotirlinga)',
      deity_tamil: 'ராமநாதசுவாமி (ஜோதிர்லிங்கம்)',
      image_url: '/images/temples/temple-rameswaram.jpg',
      description: 'One of the twelve sacred Jyotirlinga shrines and an integral part of the Char Dham pilgrimage. Features the world-famous third corridor (the longest pillared corridor in the world) and 22 holy theerthams (wells) for sacred bathing.',
      description_tamil: 'பாரதத்தின் 12 ஜோதிர்லிங்கத் தலங்களில் ஒன்று. உலகின் மிக நீளமான தூண் தாழ்வாரம் மற்றும் 22 புனித தீர்த்தங்களைக் கொண்ட மிக முக்கிய ஆன்மீகத் தலம்.',
      location: 'Rameswaram, Ramanathapuram District, Tamil Nadu 623526',
      is_verified: 1,
      default_free_capacity: 550,
      default_paid_capacity: 150,
      default_paid_price: 100,
      advance_booking_hours: 24,
      facilities: JSON.stringify([
        '22 Theertham Bathing Guide & Queue',
        'Dress Changing Rooms for Devotees',
        'Luggage Deposit Center',
        'Free Wheelchairs',
        'Medical Emergency Dispensary'
      ]),
      rules: JSON.stringify([
        'Dry clothes mandatory before entering main sanctum after theertham snanam',
        'Men must wear dhoti or pyjama with upper cloth; women sarees or churidar'
      ]),
      timings: [
        { session_name: 'Morning Darshan & Theertham', session_name_tamil: 'காலை தரிசனம் & தீர்த்த ஸ்நானம்', start_time: '05:00', end_time: '13:00', duration: 60 },
        { session_name: 'Evening Sayaratchai', session_name_tamil: 'சாயரட்சை & இரவு தரிசனம்', start_time: '15:00', end_time: '21:00', duration: 60 }
      ]
    },
    {
      id: 'temple-srirangam',
      name: 'Sri Ranganathaswamy Temple',
      name_tamil: 'அருள்மிகு ரங்கநாதசுவாமி திருக்கோயில், ஸ்ரீரங்கம்',
      district: 'Tiruchirappalli',
      city: 'Srirangam',
      deity: 'Lord Ranganatha (Maha Vishnu)',
      deity_tamil: 'ரங்கநாதர் (மகா விஷ்ணு)',
      image_url: '/images/temples/temple-srirangam.jpg',
      description: 'The foremost of the 108 Divya Desams and the largest active functioning temple complex in the world covering 156 acres. Celebrated for its 7 prakarams, 21 gopurams including the mammoth Rajagopuram standing 236 feet tall.',
      description_tamil: '108 திவ்ய தேசங்களில் முதன்மையான பெரிய கோயில். 156 ஏக்கர் பரப்பளவில் 7 பிரகாரங்கள் மற்றும் 236 அடி உயர ராஜகோபுரம் கொண்ட உலகின் மாபெரும் ஆன்மீக வளாகம்.',
      location: 'Srirangam, Tiruchirappalli, Tamil Nadu 620006',
      is_verified: 1,
      default_free_capacity: 700,
      default_paid_capacity: 250,
      default_paid_price: 250,
      advance_booking_hours: 48,
      facilities: JSON.stringify([
        'Electric Vehicle Shuttle Services',
        'Special Darshan Air-Conditioned Waiting Lounge',
        'Heritage Information Kiosk',
        'Direct Audio Guide Access',
        'Prasadam Counter (Aravanai, Puliyodarai)'
      ]),
      rules: JSON.stringify([
        'Strict traditional dhoti/saree dress code',
        'Queue token scanning at Vellai Gopuram and Ranga Ranga Gopuram gates'
      ]),
      timings: [
        { session_name: 'Viswaroopa & Morning Darshan', session_name_tamil: 'விஸ்வரூபம் & காலை தரிசனம்', start_time: '06:00', end_time: '13:00', duration: 60 },
        { session_name: 'Evening Darshan', session_name_tamil: 'மாலை தரிசனம்', start_time: '15:30', end_time: '21:00', duration: 60 }
      ]
    },
    {
      id: 'temple-thanjavur',
      name: 'Brihadeeswarar Temple (Thanjai Periya Kovil)',
      name_tamil: 'அருள்மிகு பிரகதீஸ்வரர் திருக்கோயில் (தஞ்சைப் பெரிய கோயில்)',
      district: 'Thanjavur',
      city: 'Thanjavur',
      deity: 'Lord Shiva (Peruvudaiyar)',
      deity_tamil: 'பெருவுடையார் (சிவபெருமான்)',
      image_url: '/images/temples/temple-thanjavur.jpg',
      description: 'A UNESCO World Heritage site and masterpiece of Chola architecture built by Emperor Raja Raja Chola I in 1010 CE. Renowned for its monolithic Nandi, 80-tonne granite Kumbam atop the vimanam, and exquisite fresco wall paintings.',
      description_tamil: 'மாமன்னன் ராஜராஜ சோழனால் கட்டப்பட்ட யுனெஸ்கோ உலகப் பாரம்பரியச் சின்னம். ஆயிரம் ஆண்டுகள் கடந்தும் கம்பீரமாக நிற்கும் 216 அடி விமானம் மற்றும் பிரம்மாண்ட நந்தி கொண்ட தமிழரின் கட்டடக்கலை அற்புதம்.',
      location: 'Membalam Road, Thanjavur, Tamil Nadu 613007',
      is_verified: 1,
      default_free_capacity: 500,
      default_paid_capacity: 100,
      default_paid_price: 50,
      advance_booking_hours: 24,
      facilities: JSON.stringify([
        'Archeological Survey Guide Services',
        'Spacious Lawns & Courtyard Rest Areas',
        'Drinking Water Outlets',
        'Footwear Token Stall'
      ]),
      rules: JSON.stringify([
        'Respectful modest dress code',
        'Do not touch or lean on ancient Chola inscriptions and stone frescoes'
      ]),
      timings: [
        { session_name: 'Morning Session', session_name_tamil: 'காலை தரிசனம்', start_time: '06:00', end_time: '12:30', duration: 60 },
        { session_name: 'Evening Session', session_name_tamil: 'மாலை தரிசனம்', start_time: '16:00', end_time: '20:30', duration: 60 }
      ]
    },
    {
      id: 'temple-tiruchendur',
      name: 'Arulmigu Subramaniya Swamy Temple',
      name_tamil: 'அருள்மிகு சுப்பிரமணிய சுவாமி திருக்கோயில், திருச்செந்தூர்',
      district: 'Thoothukudi',
      city: 'Tiruchendur',
      deity: 'Lord Murugan (Senthil Andavar)',
      deity_tamil: 'செந்தில் ஆண்டவர்',
      image_url: '/images/temples/temple-tiruchendur.jpg',
      description: 'The second abode among the six sacred Murugan temples (Arupadai Veedu) and the only one situated on the picturesque seashore of the Gulf of Mannar. Renowned for Soorasamharam festival and Valli Cave.',
      description_tamil: 'முருகப் பெருமானின் அறுபடை வீடுகளில் கடற்கரைக் கரையில் அமைந்துள்ள இரண்டாம் படை வீடு. சூரசம்ஹாரம் மற்றும் கந்த சஷ்டி திருவிழாக்கள் மிக விமரிசையாக நடைபெறும் புண்ணியத் தலம்.',
      location: 'Tiruchendur, Thoothukudi District, Tamil Nadu 628215',
      is_verified: 1,
      default_free_capacity: 650,
      default_paid_capacity: 200,
      default_paid_price: 100,
      advance_booking_hours: 24,
      facilities: JSON.stringify([
        'Sea Shore Safety & Lifeguards',
        'Nazhikinaru Holy Well Queue Line',
        'Tonsure Sheds',
        'Free Cloak Rooms',
        'Continuous RO Water'
      ]),
      rules: JSON.stringify([
        'Traditional clothing required',
        'Bathe only in designated beach areas and change before sanctum queue entry'
      ]),
      timings: [
        { session_name: 'Morning Darshan & Abhishekam', session_name_tamil: 'காலை தரிசனம்', start_time: '05:00', end_time: '12:00', duration: 60 },
        { session_name: 'Evening Darshan', session_name_tamil: 'மாலை தரிசனம்', start_time: '16:00', end_time: '21:00', duration: 60 }
      ]
    },
    {
      id: 'temple-samayapuram',
      name: 'Arulmigu Mariamman Temple',
      name_tamil: 'அருள்மிகு மாரியம்மன் திருக்கோயில், சமயபுரம்',
      district: 'Tiruchirappalli',
      city: 'Samayapuram',
      deity: 'Goddess Mariamman',
      deity_tamil: 'சமயபுரத்தாள் மாரியம்மன்',
      image_url: '/images/temples/temple-samayapuram.jpg',
      description: 'One of the most visited and revered Goddess Shakthi shrines in South India. Known for curing illnesses, Pachai Pattini Viradham during the Tamil month of Panguni, and massive flower offering (Poochoridhal) festival.',
      description_tamil: 'தமிழ்நாட்டின் மிக முக்கிய சக்தி பீடங்களில் ஒன்று. பக்தர்களின் நோய்களைத் தீர்க்கும் அம்மனாக வழிபடப்படும் அருள்மிகு சமயபுரம் மாரியம்மன் திருக்கோயில்.',
      location: 'Samayapuram, Tiruchirappalli District, Tamil Nadu 621112',
      is_verified: 1,
      default_free_capacity: 600,
      default_paid_capacity: 180,
      default_paid_price: 100,
      advance_booking_hours: 24,
      facilities: JSON.stringify([
        'Mottai / Tonsure Counters',
        'Mavillaku & Deepam Sheds',
        'Rest Sheds for Devotees',
        'Free Annadhanam Hall',
        'Purified Water Outlets'
      ]),
      rules: JSON.stringify([
        'Devotees carrying Mavillaku must use designated paths',
        'Keep children close during peak crowd times'
      ]),
      timings: [
        { session_name: 'Morning Session', session_name_tamil: 'காலை தரிசனம்', start_time: '05:30', end_time: '11:30', duration: 60 },
        { session_name: 'Evening Session', session_name_tamil: 'மாலை தரிசனம்', start_time: '16:00', end_time: '21:00', duration: 60 }
      ]
    },
    {
      id: 'temple-kapaleeshwarar',
      name: 'Arulmigu Kapaleeshwarar Temple',
      name_tamil: 'அருள்மிகு கபாலீஸ்வரர் திருக்கோயில், மயிலாப்பூர், சென்னை',
      district: 'Chennai',
      city: 'Chennai',
      deity: 'Lord Shiva & Goddess Karpagambal',
      deity_tamil: 'கபாலீஸ்வரர் & கற்பகாம்பாள்',
      image_url: '/images/temples/temple-kapaleeshwarar.jpg',
      description: 'An ancient 7th-century Dravidian architectural jewel located in Mylapore, Chennai. Worshipped by Sambandar, featuring a magnificent rainbow-colored Gopuram and a sacred temple tank hosting the annual Teppam (Float Festival).',
      description_tamil: 'சென்னையின் ஆன்மீக அடையாளமாக விளங்கும் மயிலாப்பூர் கபாலீஸ்வரர் கோயில். அறுபத்து மூவர் திருவிழா மற்றும் பிரதோஷ வழிபாட்டிற்குப் புகழ்பெற்ற வரலாற்றுத் தலம்.',
      location: 'Mylapore, Chennai, Tamil Nadu 600004',
      is_verified: 1,
      default_free_capacity: 400,
      default_paid_capacity: 100,
      default_paid_price: 50,
      advance_booking_hours: 24,
      facilities: JSON.stringify([
        'Footwear Counters (East & West Sannidhi)',
        'Temple Library & Book Stall',
        'Clean Restrooms',
        'Wheelchair Ramps'
      ]),
      rules: JSON.stringify([
        'Traditional dress code recommended',
        'Mobile phone silent mode compulsory'
      ]),
      timings: [
        { session_name: 'Morning Session', session_name_tamil: 'காலை தரிசனம்', start_time: '06:00', end_time: '12:30', duration: 60 },
        { session_name: 'Evening Session', session_name_tamil: 'மாலை தரிசனம்', start_time: '16:00', end_time: '21:30', duration: 60 }
      ]
    },
    {
      id: 'temple-arunachaleswarar',
      name: 'Arulmigu Arunachaleswarar Temple',
      name_tamil: 'அருள்மிகு அருணாசலேஸ்வரர் திருக்கோயில், திருவண்ணாமலை',
      district: 'Tiruvannamalai',
      city: 'Thiruvannamalai',
      deity: 'Lord Shiva (Agni Sthalam / Fire Element)',
      deity_tamil: 'அருணாசலேஸ்வரர் (அக்னி ஸ்தலம்)',
      image_url: '/images/temples/temple-arunachaleswarar.jpg',
      description: 'The holy Agni (Fire) Sthalam among the Pancha Bhoota Sthalams situated at the foot of the sacred Arunachala hill. Famous for the 14km Girivalam circumnavigating the mountain and the grand Karthigai Deepam festival.',
      description_tamil: 'பஞ்ச பூதத் தலங்களில் அக்னித் தலமாகப் போற்றப்படும் திருத்தலம். 14 கி.மீ கிரிவலம் மற்றும் கார்த்திகை மகா தீபத் திருவிழாவிற்கு லட்சக்கணக்கான பக்தர்கள் கூடும் புண்ணிய பூமி.',
      location: 'Pavazhakundur, Tiruvannamalai, Tamil Nadu 606601',
      is_verified: 1,
      default_free_capacity: 650,
      default_paid_capacity: 200,
      default_paid_price: 150,
      advance_booking_hours: 48,
      facilities: JSON.stringify([
        'Girivalam Path Transit Help Desks',
        'Locker & Baggage Counters',
        'Senior Citizen Shuttles',
        'Emergency Ambulances & First Aid',
        'Free Annadhanam Counter'
      ]),
      rules: JSON.stringify([
        'Strict traditional clothing mandatory for inner sanctum entry',
        'Girivalam pilgrims must carry identity credentials for express entry'
      ]),
      timings: [
        { session_name: 'Morning Session', session_name_tamil: 'காலை தரிசனம்', start_time: '05:30', end_time: '12:30', duration: 60 },
        { session_name: 'Evening Sayaratchai', session_name_tamil: 'மாலை தரிசனம்', start_time: '15:30', end_time: '21:30', duration: 60 }
      ]
    },
    {
      id: 'temple-kanchi-kamakshi',
      name: 'Arulmigu Kamakshi Amman Temple',
      name_tamil: 'அருள்மிகு காமாட்சி அம்மன் திருக்கோயில், காஞ்சிபுரம்',
      district: 'Kanchipuram',
      city: 'Kanchipuram',
      deity: 'Goddess Kamakshi',
      deity_tamil: 'காமாட்சி அம்மன்',
      image_url: '/images/temples/temple-kanchi-kamakshi.jpg',
      description: 'The supreme seat of Goddess Parvati situated in the city of thousand temples, Kanchipuram. The sanctum houses the revered Sri Chakra consecrated by Adi Shankaracharya.',
      description_tamil: 'ஆதி சங்கராச்சாரியாரால் ஸ்ரீ சக்ரம் பிரதிஷ்டை செய்யப்பட்ட சக்தி பீடங்களின் முதன்மைத் தலமான காஞ்சி காமாட்சி அம்மன் திருக்கோயில்.',
      location: 'Kamakshi Amman Sannadhi St, Kanchipuram, Tamil Nadu 631502',
      is_verified: 1,
      default_free_capacity: 450,
      default_paid_capacity: 120,
      default_paid_price: 100,
      advance_booking_hours: 24,
      facilities: JSON.stringify([
        'Sri Chakra Kumkum Archana Counters',
        'Footwear Desks',
        'Pure Drinking Water',
        'Prasadam Counter'
      ]),
      rules: JSON.stringify([
        'Traditional attire mandatory',
        'Mobile phone use banned in the sanctum'
      ]),
      timings: [
        { session_name: 'Morning Session', session_name_tamil: 'காலை தரிசனம்', start_time: '05:30', end_time: '12:15', duration: 60 },
        { session_name: 'Evening Session', session_name_tamil: 'மாலை தரிசனம்', start_time: '16:00', end_time: '20:30', duration: 60 }
      ]
    },
    {
      id: 'temple-ekambareswarar',
      name: 'Arulmigu Ekambareswarar Temple',
      name_tamil: 'அருள்மிகு ஏகாம்பரேஸ்வரர் திருக்கோயில், காஞ்சிபுரம்',
      district: 'Kanchipuram',
      city: 'Kanchipuram',
      deity: 'Lord Shiva (Prithvi Sthalam / Earth Element)',
      deity_tamil: 'ஏகாம்பரேஸ்வரர் (பிருத்வி ஸ்தலம்)',
      image_url: '/images/temples/temple-ekambareswarar.jpg',
      description: 'The Earth (Prithvi) Element shrine of the Pancha Bhoota Sthalams in Kanchipuram. Famous for its sacred 3,500-year-old mango tree yielding four different varieties of mangoes and the 59-meter Raja Gopuram built by Krishnadevaraya.',
      description_tamil: 'பஞ்ச பூதத் தலங்களில் பிருத்வி (நிலம்) ஸ்தலமாகப் போற்றப்படும் திருத்தலம். 3500 ஆண்டுகள் பழமையான புனித மாமரம் மற்றும் கிருஷ்ணதேவராயர் கட்டிய பிரம்மாண்ட ராஜகோபுரம் கொண்ட திருத்தலம்.',
      location: 'Ekambaranathar Sannidhi St, Kanchipuram, Tamil Nadu 631502',
      is_verified: 1,
      default_free_capacity: 400,
      default_paid_capacity: 100,
      default_paid_price: 50,
      advance_booking_hours: 24,
      facilities: JSON.stringify([
        'Courtyard Shaded Pathways',
        'Footwear Deposit Counter',
        'RO Water Plants',
        'Heritage Audio Boards'
      ]),
      rules: JSON.stringify([
        'Modest Indian dress code',
        'Do not litter in the ancient temple tank and tree precinct'
      ]),
      timings: [
        { session_name: 'Morning Session', session_name_tamil: 'காலை தரிசனம்', start_time: '06:00', end_time: '11:00', duration: 60 },
        { session_name: 'Evening Session', session_name_tamil: 'மாலை தரிசனம்', start_time: '16:30', end_time: '20:30', duration: 60 }
      ]
    },
    {
      id: 'temple-chidambaram',
      name: 'Thillai Natarajar Temple',
      name_tamil: 'தில்லை நடராஜர் திருக்கோயில், சிதம்பரம்',
      district: 'Cuddalore',
      city: 'Chidambaram',
      deity: 'Lord Nataraja (Akasa Sthalam / Sky Element)',
      deity_tamil: 'ஆனந்த நடராஜர் (ஆகாய ஸ்தலம்)',
      image_url: '/images/temples/temple-chidambaram.jpg',
      description: 'The supreme Akasa (Space/Sky) Sthalam among the Pancha Bhootas where Lord Shiva performs the cosmic dance of Ananda Tandava. Famed for the Chidambara Ragasiyam (secret of formless divinity) and the golden roof of Kanaka Sabha.',
      description_tamil: 'சிவபெருமானின் ஆனந்த தாண்டவ நடனம் நிகழ்ந்த ஆகாயத் தலம். பொன் வேய்ந்த கூரை கொண்ட பொன்னம்பலம் மற்றும் புகழ்பெற்ற சிதம்பர ரகசியம் விளங்கும் உலக நாயகன் திருத்தலம்.',
      location: 'Chidambaram, Cuddalore District, Tamil Nadu 608001',
      is_verified: 1,
      default_free_capacity: 500,
      default_paid_capacity: 150,
      default_paid_price: 100,
      advance_booking_hours: 24,
      facilities: JSON.stringify([
        'Kanaka Sabha Viewing Corridor',
        'Shivaganga Sacred Tank Ramps',
        'Purified Drinking Water',
        'Prasadam Counter'
      ]),
      rules: JSON.stringify([
        'Men must remove upper shirts inside the Kanaka Sabha inner sanctuary',
        'Traditional attire compulsory'
      ]),
      timings: [
        { session_name: 'Morning Session', session_name_tamil: 'காலை தரிசனம்', start_time: '06:00', end_time: '12:00', duration: 60 },
        { session_name: 'Evening Session', session_name_tamil: 'மாலை தரிசனம்', start_time: '17:00', end_time: '22:00', duration: 60 }
      ]
    }
  ];

  // Insert temples and timings
  for (const t of temples) {
    runSql(`
      INSERT INTO temples (
        id, name, name_tamil, district, city, deity, deity_tamil, image_url,
        description, description_tamil, location, is_verified, default_free_capacity,
        default_paid_capacity, default_paid_price, advance_booking_hours, facilities, rules
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      t.id, t.name, t.name_tamil, t.district, t.city, t.deity, t.deity_tamil, t.image_url,
      t.description, t.description_tamil, t.location, t.is_verified, t.default_free_capacity,
      t.default_paid_capacity, t.default_paid_price, t.advance_booking_hours, t.facilities, t.rules
    ]);

    for (const tm of t.timings) {
      runSql(`
        INSERT INTO temple_timings (
          id, temple_id, session_name, session_name_tamil, start_time, end_time, slot_duration_minutes, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)
      `, [
        uuidv4(), t.id, tm.session_name, tm.session_name_tamil, tm.start_time, tm.end_time, tm.duration
      ]);
    }
  }

  // Insert System Support & Helpline
  runSql(`
    INSERT INTO support_information (
      id, temple_id, helpline_phone, toll_free, email, support_hours, emergency_phone, counter_locations, faqs
    ) VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'global-support',
    '+91 44 2833 9999',
    '1800-425-4555',
    'support.templedharshan@tn.gov.in',
    '05:00 AM to 10:00 PM (All 7 Days)',
    '+91 94440 12345',
    'Main Entrance Helpdesks, Counter #1 & #2 at all listed temples',
    JSON.stringify([
      {
        question: 'How do I book a Darshan slot online?',
        question_tamil: 'ஆன்லைனில் தரிசன முன்பதிவு செய்வது எப்படி?',
        answer: 'Search and select your desired temple, choose Free or Paid Darshan, pick an available date and time slot, add visitor details, and complete your reservation to receive an instant digital QR ticket.',
        answer_tamil: 'கோயிலைத் தேர்ந்தெடுத்து, இலவச அல்லது கட்டண தரிசனத்தைத் தேர்வுசெய்து, தேதி மற்றும் நேரத்தைத் தேர்ந்தெடுத்து, விவரங்களைப் பூர்த்தி செய்து டிஜிட்டல் பாஸைப் பெறுங்கள்.'
      },
      {
        question: 'Can I book a ticket offline directly at the temple?',
        question_tamil: 'கோயில் வாசலில் நேரடியாக முன்பதிவு செய்ய முடியுமா?',
        answer: 'Yes! Walk-in counters at temple entrances use the exact same synchronized real-time capacity system. Counter staff can generate a print/QR pass for visitors without smartphones.',
        answer_tamil: 'ஆம்! கோயில் நுழைவு வாயிலில் உள்ள சிறப்பு கவுண்டர்களில் பணியாளர்கள் மூலமாக உடனுக்குடன் முன்பதிவு செய்து பாஸ் பெற்றுக்கொள்ளலாம்.'
      },
      {
        question: 'What is the difference between Free Darshan and Paid Darshan?',
        question_tamil: 'இலவச தரிசனம் மற்றும் கட்டண தரிசனத்தின் வித்தியாசம் என்ன?',
        answer: 'Free Darshan is completely free of charge with regular queue entry. Paid Darshan provides an express queue entry at a temple-specific nominal charge (e.g. ₹50–₹250). Both have strictly managed capacities to prevent overcrowding.',
        answer_tamil: 'இலவச தரிசனம் கட்டணமின்றி பொது வரிசையில் அனுமதிக்கப்படுகிறது. கட்டண தரிசனம் குறிப்பிட்ட கட்டணத்தில் விரைவு வரிசை தரிசன வசதியை வழங்குகிறது.'
      },
      {
        question: 'What happens if my preferred slot is FULL?',
        question_tamil: 'நான் விரும்பும் நேரம் முன்பதிவு நிறைவடைந்துவிட்டால் என்ன செய்வது?',
        answer: 'The system will indicate FULL (marked in Red) and recommend the nearest available alternate slot with lower crowd density to ensure minimal waiting time.',
        answer_tamil: 'முழுமை அடைந்திருந்தால் (சிவப்பு வண்ணம்), காத்திருப்பு நேரத்தைக் குறைக்க குறைந்த கூட்டம் உள்ள அடுத்த நேரத்தை சிபாரிசு செய்யும்.'
      }
    ])
  ]);

  // Insert Special Festival Day
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];
  runSql(`
    INSERT INTO special_days (
      id, temple_id, date, event_name, event_name_tamil, special_timings, expected_crowd_level, slot_capacity_modifier, booking_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    uuidv4(),
    'temple-palani',
    nextMonth,
    'Thaipusam Special Thiruvizha',
    'தைப்பூச திருவிழா',
    'Continuous Darshan: 04:00 AM - 11:00 PM',
    'VERY HIGH',
    1.2,
    'High pilgrim influx expected. Advance online booking strongly advised.'
  ]);

  saveDatabase();
  console.log('Seed completed successfully!');
}

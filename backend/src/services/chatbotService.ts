import { queryAll, queryOne } from '../config/database';

export function handleChatbotQuery(userMessage: string, templeId?: string, bookingRef?: string): { reply: string; reply_tamil: string; suggestedActions?: string[] } {
  const msg = userMessage.toLowerCase().trim();

  // 1. Booking ref lookup query
  if (bookingRef || msg.includes('td202') || msg.includes('where is my ticket') || msg.includes('என் டிக்கெட்')) {
    const extractedRef = bookingRef || msg.match(/td\d{10,14}/i)?.[0];
    if (extractedRef) {
      const booking = queryOne<any>('SELECT * FROM bookings WHERE booking_ref = ?', [extractedRef.toUpperCase()]);
      if (booking) {
        const temple = queryOne<any>('SELECT * FROM temples WHERE id = ?', [booking.temple_id]);
        const slot = queryOne<any>('SELECT * FROM slots WHERE id = ?', [booking.slot_id]);
        return {
          reply: `Booking found! Reference: ${booking.booking_ref}. Temple: ${temple?.name}. Date: ${slot?.date}, Time: ${slot?.start_time} - ${slot?.end_time}. Status: ${booking.booking_status}. Total Visitors: ${booking.total_visitors}.`,
          reply_tamil: `முன்பதிவு கண்டுபிடிக்கப்பட்டது! எண்: ${booking.booking_ref}. கோயில்: ${temple?.name_tamil}. தேதி: ${slot?.date}, நேரம்: ${slot?.start_time} - ${slot?.end_time}. நிலை: ${booking.booking_status}. பக்தர்கள் எண்ணிக்கை: ${booking.total_visitors}.`,
          suggestedActions: ['View Digital Ticket', 'Cancel Booking']
        };
      }
    }
  }

  // 2. Temple location queries
  if (msg.includes('where is') || msg.includes('location') || msg.includes('எங்கு உள்ளது') || msg.includes('எங்கே')) {
    if (templeId) {
      const temple = queryOne<any>('SELECT * FROM temples WHERE id = ?', [templeId]);
      if (temple) {
        return {
          reply: `${temple.name} is located at: ${temple.location} in ${temple.district} district.`,
          reply_tamil: `${temple.name_tamil} அமைவிடம்: ${temple.location}, ${temple.district} மாவட்டம்.`
        };
      }
    }
    return {
      reply: `Our system manages major heritage temples across Tamil Nadu including Palani, Madurai Meenakshi, Rameswaram, Srirangam, Thanjavur, and more. You can search by temple name or district on the Temples page.`,
      reply_tamil: `பழனி, மதுரை மீனாட்சி, ராமேஸ்வரம், ஸ்ரீரங்கம், தஞ்சாவூர் உள்ளிட்ட தமிழ்நாட்டின் முதன்மை திருக்கோயில்களை நீங்கள் 'Temples' பக்கத்தில் தேடலாம்.`
    };
  }

  // 3. Darshan cost / Paid Darshan price
  if (msg.includes('price') || msg.includes('cost') || msg.includes('fee') || msg.includes('how much') || msg.includes('கட்டணம்')) {
    if (templeId) {
      const temple = queryOne<any>('SELECT * FROM temples WHERE id = ?', [templeId]);
      if (temple) {
        return {
          reply: `For ${temple.name}: Free Darshan is ₹0 (Free). Special Paid Darshan is ₹${temple.default_paid_price} per person.`,
          reply_tamil: `${temple.name_tamil}: பொது தரிசனம் முற்றிலும் இலவசம் (₹0). சிறப்பு கட்டண தரிசனம் ஒரு நபருக்கு ₹${temple.default_paid_price}.`
        };
      }
    }
    return {
      reply: `Free Darshan is ₹0 across all temples. Paid Darshan prices vary by temple (ranging from ₹50 to ₹250) based on official temple regulations. Select a specific temple to view its exact rates.`,
      reply_tamil: `இலவச தரிசனம் அனைத்து கோயில்களிலும் கட்டணமற்றது (₹0). கட்டண தரிசனக் கட்டணம் கோயிலைப் பொறுத்து ₹50 முதல் ₹250 வரை அமையும்.`
    };
  }

  // 4. Free vs Paid Darshan
  if (msg.includes('free darshan') || msg.includes('paid darshan') || msg.includes('difference') || msg.includes('வித்தியாசம்')) {
    return {
      reply: `Free Darshan allows general queue entry at no cost. Paid Darshan provides an express queue lane for a nominal fee. Both categories maintain separate, strictly monitored capacities to prevent overcrowding.`,
      reply_tamil: `இலவச தரிசனம் எவ்விதக் கட்டணமுமின்றி பொது வரிசைக்கானது. கட்டண தரிசனம் விரைவு வரிசைக்கானது. நெரிசலைத் தவிர்க்க இரண்டிற்கும் தனித்தனி இடங்கள் ஒதுக்கப்பட்டுள்ளன.`
    };
  }

  // 5. Offline booking / counter booking
  if (msg.includes('offline') || msg.includes('counter') || msg.includes('நேரடியாக') || msg.includes('கவுண்டர்')) {
    return {
      reply: `Yes! You can book offline at the temple entrance front counters. Counter staff use the exact same synchronized real-time capacity system, guaranteeing no overbooking. A printed ticket with QR code will be provided.`,
      reply_tamil: `ஆம்! கோயில் நுழைவு வாயில் கவுண்டர்களில் நேரடியாகப் பதிவு செய்யலாம். ஆன்லைன் மற்றும் கவுண்டர் இரண்டும் ஒரே பொதுவான தரிசன ஒதுக்கீட்டைப் பயன்படுத்துகின்றன.`
    };
  }

  // 6. Timing / What time should I come
  if (msg.includes('time') || msg.includes('when') || msg.includes('நேரம்') || msg.includes('எப்போது வர வேண்டும்')) {
    return {
      reply: `You should arrive 15 minutes before your booked time slot (e.g. For a 7:00–8:00 AM slot, please arrive by 6:45 AM). This ensures orderly queue verification and minimal waiting time.`,
      reply_tamil: `முன்பதிவு செய்த நேரத்திற்கு 15 நிமிடங்களுக்கு முன்பாக (எ.கா. 7:00–8:00 நேரத்திற்கு காலை 6:45 மணிக்கு) வருவது வரிசையில் எளிதாகச் செல்ல உதவும்.`
    };
  }

  // 7. Less crowd / recommendation
  if (msg.includes('less crowd') || msg.includes('crowd') || msg.includes('best time') || msg.includes('கூட்டம் குறைவு')) {
    return {
      reply: `Our AI system indicates that mid-morning slots (10:00–11:00 AM) and early afternoon slots (2:00–3:00 PM) typically have the lowest crowd density and fastest sanctum clearance.`,
      reply_tamil: `நமது AI கணிப்பின்படி, காலை 10:00–11:00 மற்றும் மதியம் 2:00–3:00 மணி ஆகிய நேரங்களில் கூட்டம் குறைவாகவும், தரிசனம் விரைவாகவும் அமைகிறது.`
    };
  }

  // 8. How to cancel booking
  if (msg.includes('cancel') || msg.includes('ரத்து')) {
    return {
      reply: `To cancel a booking, go to 'Find My Ticket', enter your Booking Reference (e.g. TD2026...), and click 'Cancel Booking'. The allocated capacity is automatically restored to the available pool.`,
      reply_tamil: `'Find My Ticket' பக்கத்திற்குச் சென்று உங்கள் முன்பதிவு எண்ணை உள்ளிட்டு 'Cancel Booking' பொத்தானை அழுத்தி எளிதாக ரத்து செய்யலாம்.`
    };
  }

  // 9. How to book
  if (msg.includes('how to book') || msg.includes('முன்பதிவு செய்வது எப்படி')) {
    return {
      reply: `Booking is easy in 5 steps: 1) Search and select temple, 2) Choose Free or Paid Darshan, 3) Select Date & Time Slot, 4) Enter visitor details, 5) Confirm & download your digital QR ticket.`,
      reply_tamil: `முன்பதிவு செய்ய: 1) கோயிலைத் தேர்வு செய்க, 2) தரிசன வகையைத் தேர்வு செய்க, 3) தேதி & நேரம் தேர்வு செய்க, 4) விவரங்களை உள்ளிடுக, 5) டிஜிட்டல் க்யூஆர் பாஸைப் பெறுக.`
    };
  }

  // Default fallback
  const support = queryOne<any>('SELECT * FROM support_information WHERE id = "global-support"');
  const helpline = support?.helpline_phone || '+91 44 2833 9999';
  return {
    reply: `I may not have the specific detail for your request. For personalized assistance, please contact our 24/7 Temple Helpline at ${helpline} or speak to temple helpdesk staff at the entrance.`,
    reply_tamil: `இந்த கேள்விக்கான நேரடித் தகவல் இல்லை. உதவிக்கு நமது உதவி எண் ${helpline}-ஐத் தொடர்பு கொள்ளலாம் அல்லது கோயில் நுழைவு வாயில் உதவி மையத்தை அணுகலாம்.`,
    suggestedActions: ['View Temple Timings', 'Check Slot Availability', 'Call Helpline']
  };
}

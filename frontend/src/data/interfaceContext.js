export const interfaceContext = {
  english: {
    appInfo: {
      name: "SanchayKart Flex",
      tagline: "Vendors set their price, suppliers make offers",
      description: "A 2-sided real-time marketplace where vendors (street vendors/buyers) can post requests with desired prices and suppliers make competitive offers or negotiate.",
      concept: "Inspired by Rapido (rider requests) and InDrive (negotiable bids) for raw material procurement"
    },
    vendorDashboard: {
      description: "Vendor (Buyer) dashboard for posting requests and managing offers",
      userType: "Street vendors who need to buy raw materials at preferred prices",
      sections: [
        "Stats cards showing active requests, pending offers, total spent, savings achieved",
        "Tabs for 'My Requests' and 'Notifications'", 
        "Create new request with item, quantity, desired price, location",
        "Request cards showing status (open/fulfilled/expired)",
        "View offers button showing number of supplier bids",
        "Accept/reject/counter offer functionality"
      ],
      actions: [
        "Post custom requests (e.g., '10kg onions @ ₹10/kg')",
        "Review multiple supplier offers",
        "Negotiate prices through counter offers",
        "Accept best offer and confirm delivery details",
        "Track order status and chat with selected supplier"
      ],
      workflow: "Post request → Receive offers → Compare prices → Negotiate → Accept → Get delivery"
    },
    supplierDashboard: {
      description: "Supplier (Seller) dashboard for bidding on vendor requests",
      userType: "Suppliers who want to fulfill vendor requests competitively",
      sections: [
        "Stats showing active bids, accepted deals, revenue, success rate",
        "Three tabs: Individual Requests, Group Requests, My Offers",
        "Browse vendor requests filtered by location/item",
        "Make competitive offers with pricing and delivery terms",
        "Track offer status and manage negotiations"
      ],
      actions: [
        "Browse open vendor requests by location/category",
        "Place competitive bids (match or beat desired price)",
        "Counter-negotiate when vendors make counter offers",
        "Confirm delivery details once offer is accepted",
        "Build reputation through successful deliveries"
      ],
      workflow: "Browse requests → Place offers → Negotiate → Win bid → Deliver → Get paid"
    },
    groupBuying: {
      description: "Group negotiation system for bulk purchases",
      concept: "Multiple vendors join together for bulk buying power, with a leader negotiating on behalf of the group",
      roles: {
        "group": "Collection of vendors interested in the same item",
        "leader": "A vendor from the group who negotiates with suppliers",
        "members": "Other vendors in the group who benefit from the negotiated deal"
      },
      workflow: [
        "1. Vendors join a group for specific item (e.g., 'Onion Buyers Group')",
        "2. Group leader creates group request with combined quantity",
        "3. Suppliers see larger order and offer better bulk rates",
        "4. Leader negotiates on behalf of all members",
        "5. Once accepted, all group members get the negotiated price",
        "6. Individual deliveries or pickup coordination"
      ],
      benefits: [
        "Better prices due to bulk buying power",
        "Reduced negotiation effort for individual vendors",
        "Access to wholesale rates for small vendors",
        "Shared delivery costs"
      ]
    },
    negotiationProcess: {
      description: "How the bidding and negotiation works",
      steps: [
        "1. Vendor posts request: 'I want 10kg onions @ ₹10/kg in Mumbai'",
        "2. Suppliers see request and place offers (₹12/kg, ₹11/kg, etc.)",
        "3. Vendor reviews offers and can accept or counter (₹10.5/kg)",
        "4. Supplier can accept counter or make new counter offer",
        "5. Process continues until both parties agree",
        "6. Deal confirmed with delivery details and payment terms"
      ],
      statuses: {
        "open": "Request accepting offers from suppliers",
        "negotiating": "Active counter-offers between vendor and supplier", 
        "fulfilled": "Deal confirmed and completed",
        "expired": "Request no longer active"
      }
    }
  },
  hindi: {
    appInfo: {
      name: "SanchayKart Flex",
      tagline: "विक्रेता अपनी कीमत तय करते हैं, आपूर्तिकर्ता ऑफर करते हैं",
      description: "एक द्विपक्षीय रियल-टाइम बाज़ार जहाँ विक्रेता (स्ट्रीट वेंडर/खरीदार) अपनी पसंदीदा कीमत पर अनुरोध पोस्ट कर सकते हैं और आपूर्तिकर्ता प्रतिस्पर्धी ऑफर या बातचीत कर सकते हैं।",
      concept: "कच्चे माल की खरीद के लिए Rapido (राइडर अनुरोध) और InDrive (परक्राम्य बोली) से प्रेरित"
    },
    vendorDashboard: {
      description: "विक्रेता (खरीदार) डैशबोर्ड अनुरोध पोस्ट करने और ऑफर प्रबंधन के लिए",
      userType: "स्ट्रीट वेंडर जिन्हें पसंदीदा कीमतों पर कच्चा माल खरीदना है",
      sections: [
        "सक्रिय अनुरोध, लंबित ऑफर, कुल खर्च, बचत के आंकड़े",
        "'मेरे अनुरोध' और 'सूचनाएं' टैब",
        "वस्तु, मात्रा, वांछित मूल्य, स्थान के साथ नया अनुरोध बनाएं",
        "स्थिति दिखाने वाले अनुरोध कार्ड (खुला/पूर्ण/समाप्त)",
        "आपूर्तिकर्ता बोलियों की संख्या दिखाने वाला ऑफर देखें बटन"
      ],
      workflow: "अनुरोध पोस्ट करें → ऑफर प्राप्त करें → कीमतों की तुलना करें → बातचीत करें → स्वीकार करें → डिलीवरी प्राप्त करें"
    },
    supplierDashboard: {
      description: "आपूर्तिकर्ता (विक्रेता) डैशबोर्ड विक्रेता अनुरोधों पर बोली लगाने के लिए", 
      userType: "आपूर्तिकर्ता जो विक्रेता अनुरोधों को प्रतिस्पर्धी रूप से पूरा करना चाहते हैं",
      workflow: "अनुरोध ब्राउज़ करें → ऑफर करें → बातचीत करें → बोली जीतें → डिलीवर करें → भुगतान प्राप्त करें"
    },
    groupBuying: {
      description: "थोक खरीदारी के लिए समूह बातचीत प्रणाली",
      concept: "कई विक्रेता थोक खरीदारी शक्ति के लिए एक साथ जुड़ते हैं, एक नेता समूह की ओर से बातचीत करता है",
      benefits: [
        "थोक खरीदारी शक्ति के कारण बेहतर कीमतें",
        "व्यक्तिगत विक्रेताओं के लिए कम बातचीत का प्रयास",
        "छोटे विक्रेताओं के लिए थोक दरों तक पहुंच"
      ]
    }
  }
};

export const getInterfaceHelp = (query, language = 'english') => {
  const context = interfaceContext[language];
  const lowerQuery = query.toLowerCase();
  
  // App info queries
  if (lowerQuery.includes('sanchayKart') || lowerQuery.includes('app') || 
      lowerQuery.includes('platform') || lowerQuery.includes('प्लेटफॉर्म')) {
    return context.appInfo;
  }
  
  // Dashboard queries
  if (lowerQuery.includes('dashboard') || lowerQuery.includes('डैशबोर्ड')) {
    if (lowerQuery.includes('vendor') || lowerQuery.includes('विक्रेता') || lowerQuery.includes('buyer')) {
      return context.vendorDashboard;
    } else if (lowerQuery.includes('supplier') || lowerQuery.includes('आपूर्तिकर्ता')) {
      return context.supplierDashboard;
    }
  }
  
  // Group buying queries
  if (lowerQuery.includes('group') || lowerQuery.includes('समूह') || 
      lowerQuery.includes('bulk') || lowerQuery.includes('थोक')) {
    return context.groupBuying;
  }
  
  // Negotiation/offer queries  
  if (lowerQuery.includes('offer') || lowerQuery.includes('ऑफर') ||
      lowerQuery.includes('negotiate') || lowerQuery.includes('बातचीत') ||
      lowerQuery.includes('bid') || lowerQuery.includes('बोली')) {
    return context.negotiationProcess;
  }
  
  return null;
};

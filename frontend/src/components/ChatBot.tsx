import { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  X,
  Languages,
  Minimize2,
  Maximize2,
  HelpCircle,
  Zap,
  Users,
  MessageSquare,
  ShoppingCart,
  Package,
  TrendingUp,
  Shield,
  ArrowLeft,
  DollarSign,
  Star,
  Clock
} from 'lucide-react';

// Relevant Q&A Database for SanchayKart Flex
const questionDatabase = {
  en: {
    categories: [
      {
        id: 'getting-started',
        name: 'Getting Started',
        icon: HelpCircle,
        color: 'bg-blue-500',
        questions: [
          {
            q: 'What is SanchayKart Flex?',
            a: 'SanchayKart Flex is a revolutionary 2-sided marketplace connecting street vendors with suppliers through real-time bidding. Vendors post requests for raw materials at their desired price, and suppliers compete to offer the best deals.'
          },
          {
            q: 'How do I register on the platform?',
            a: 'Click "Get Started" → Choose your role (Vendor/Supplier) → Fill basic details (name, phone, location) → Verify your phone number → Start using the platform immediately!'
          },
          {
            q: 'Is the platform completely free?',
            a: 'Yes! SanchayKart Flex is 100% free to use. No registration fees, no transaction fees, no hidden charges. We believe in transparent pricing with no commission on any deals.'
          },
          {
            q: 'Which cities are supported?',
            a: 'Currently available in 15+ major cities including Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Pune, Kolkata, Ahmedabad, Jaipur, and expanding rapidly to more cities.'
          },
          {
            q: 'How do you make money if it\'s free?',
            a: 'Currently, our platform is completely free with no charges. In the future, we may explore revenue through targeted advertisements and optional premium features, but the core platform will always remain free for users.'
          }
        ]
      },
      {
        id: 'vendor-guide',
        name: 'Vendor Guide',
        icon: ShoppingCart,
        color: 'bg-green-500',
        questions: [
          {
            q: 'How to post a request?',
            a: 'Step by step: 1) Click "New Request" 2) Enter product name (e.g., Tomatoes, Rice) 3) Set quantity needed 4) Set your desired price 5) Add delivery location 6) Set urgency level 7) Add description if needed 8) Submit. Suppliers will start sending offers within minutes!'
          },
          {
            q: 'How do I view offers from suppliers?',
            a: 'All offers appear directly on your request card. You can see supplier name, offered price, delivery time, and any notes. Each offer shows complete details to help you make the best decision.'
          },
          {
            q: 'How to negotiate with suppliers?',
            a: 'Send counter offers with your preferred price and terms. Use the built-in chat feature to discuss quality, delivery schedules, and payment terms. You can negotiate directly with multiple suppliers.'
          },
          {
            q: 'What payment methods can I use?',
            a: 'You can arrange payment directly with suppliers: Cash on delivery, UPI (PhonePe, GPay, Paytm), Bank transfer, or any method you both agree upon. We don\'t handle payments - it\'s between you and the supplier.'
          },
          {
            q: 'How do I contact suppliers after accepting offers?',
            a: 'Once you accept an offer, you get complete supplier contact details including phone number, email, and location. You can call, message, or meet directly to finalize your deal.'
          },
          {
            q: 'What if I\'m not satisfied with delivery?',
            a: 'Since transactions are direct between vendor and supplier, resolve issues directly with them. For serious disputes, contact our support team who can help mediate and provide guidance.'
          }
        ]
      },
      {
        id: 'supplier-guide',
        name: 'Supplier Guide',
        icon: Package,
        color: 'bg-orange-500',
        questions: [
          {
            q: 'How to find vendor requests?',
            a: 'Browse active requests by location, product type, or quantity. Use filters to find requests matching your inventory. The platform shows all vendor requests in real-time.'
          },
          {
            q: 'How to make offers to vendors?',
            a: 'Click on any vendor request → Enter your offered price → Add delivery time estimate → Include any quality specifications or notes → Submit your offer. Vendors will see your offer immediately.'
          },
          {
            q: 'How to build reputation on the platform?',
            a: 'Complete orders on time, maintain product quality, respond quickly to messages, offer competitive prices, and provide excellent customer service. Satisfied vendors will rate you positively.'
          },
          {
            q: 'Do I pay any fees to use the platform?',
            a: 'No! SanchayKart Flex is completely free for suppliers. No registration fees, no commission on sales, no hidden charges. You keep 100% of your earnings.'
          },
          {
            q: 'How do I get paid?',
            a: 'Payment is handled directly between you and the vendor. You can accept cash, UPI, bank transfer, or any payment method you both agree upon. We don\'t process payments.'
          },
          {
            q: 'How to handle bulk orders?',
            a: 'For large orders, negotiate payment terms directly with vendors, confirm your delivery capacity, provide accurate timelines, and consider offering bulk discounts to win more business.'
          }
        ]
      },
      {
        id: 'group-buying',
        name: 'Group Buying',
        icon: Users,
        color: 'bg-purple-500',
        questions: [
          {
            q: 'What is group buying?',
            a: 'Group buying allows multiple vendors to combine their orders for the same product to get better bulk pricing, shared delivery costs, and stronger negotiating power with suppliers.'
          },
          {
            q: 'How to create a group?',
            a: 'Click "Create Group" → Set product details → Set target quantity and price → Set group size limit → Set expiry date → Other vendors can then join your group to reach bulk quantity.'
          },
          {
            q: 'How to join an existing group?',
            a: 'Browse "Available Groups" → Find groups for products you need → Check group details and target price → Enter your required quantity → Click "Join Group". You can leave anytime before the group order is finalized.'
          },
          {
            q: 'Who manages the group?',
            a: 'The vendor who creates the group becomes the group leader. The leader coordinates with suppliers, manages group communication, and helps finalize the bulk order details.'
          },
          {
            q: 'How are costs divided in groups?',
            a: 'Costs are divided proportionally based on each member\'s order quantity. If someone orders 20kg out of 100kg total, they pay 20% of the total cost including their share of delivery charges.'
          },
          {
            q: 'What if group members leave?',
            a: 'Members can leave before the final order is placed. If total quantity falls below minimum requirements, the group leader can extend the deadline, adjust targets, or dissolve the group.'
          }
        ]
      },
      {
        id: 'pricing-negotiation',
        name: 'Pricing & Negotiation',
        icon: DollarSign,
        color: 'bg-red-500',
        questions: [
          {
            q: 'How to get the best prices?',
            a: 'Post clear requirements, wait for multiple offers, negotiate with suppliers, consider group buying for bulk discounts, be flexible with delivery dates, and build relationships with reliable suppliers.'
          },
          {
            q: 'What is counter offering?',
            a: 'Counter offering lets you propose different price or terms to suppliers. Include your preferred price, delivery timeline, payment terms, and quality specifications. Suppliers can accept, reject, or negotiate further.'
          },
          {
            q: 'How to negotiate delivery terms?',
            a: 'Discuss pickup vs delivery options, delivery timeline flexibility, packaging requirements, and handling charges directly with suppliers. Many offer better prices for flexible delivery schedules.'
          },
          {
            q: 'What about quantity discounts?',
            a: 'Most suppliers offer better rates for larger quantities. Group buying helps small vendors access these bulk discounts by combining orders with other vendors for the same product.'
          },
          {
            q: 'How to handle price changes?',
            a: 'Market prices fluctuate daily. Lock in good prices quickly, consider advance booking for future needs, and negotiate price protection clauses for regular orders with trusted suppliers.'
          },
          {
            q: 'Direct payment vs platform payment?',
            a: 'All payments are direct between vendor and supplier. This keeps costs low and allows flexible payment terms. Choose cash, UPI, bank transfer, or any method you both prefer.'
          }
        ]
      },
      {
        id: 'platform-features',
        name: 'Platform Features',
        icon: Shield,
        color: 'bg-cyan-500',
        questions: [
          {
            q: 'How to ensure product quality?',
            a: 'Check supplier ratings and reviews, request product samples, specify quality parameters in your request, inspect goods on delivery, and rate suppliers after transactions to help other vendors.'
          },
          {
            q: 'What delivery options are available?',
            a: 'Self-pickup (usually cheapest), supplier delivery, or third-party logistics. Choose based on your urgency, budget, and convenience. Discuss delivery options directly with suppliers.'
          },
          {
            q: 'How to track my orders?',
            a: 'Since orders are handled directly between vendor and supplier, coordinate tracking with your supplier. Exchange contact details after accepting offers to stay updated on order status.'
          },
          {
            q: 'What if there are issues?',
            a: 'Resolve issues directly with suppliers first. For serious problems, contact our support team for guidance and mediation. Rate your experience to help other users make informed decisions.'
          },
          {
            q: 'How secure is the platform?',
            a: 'Your data is secure with us. However, since transactions are direct between users, use your judgment when sharing personal information and meeting suppliers. Start with small orders to build trust.'
          },
          {
            q: 'Mobile app availability?',
            a: 'Our platform is mobile-friendly and works perfectly on all devices through your web browser. A dedicated mobile app may be launched in the future based on user demand.'
          }
        ]
      },
      {
        id: 'support',
        name: 'Support & Help',
        icon: MessageSquare,
        color: 'bg-gray-500',
        questions: [
          {
            q: 'How to contact customer support?',
            a: 'Reach us through: In-app chat support, WhatsApp, Email, or phone support during business hours. Our team is here to help with any platform-related questions or issues.'
          },
          {
            q: 'Platform not working properly?',
            a: 'Try these steps: Check internet connection, refresh the page, clear browser cache, try a different browser, or restart your device. Contact support if issues persist.'
          },
          {
            q: 'How to report fake suppliers or vendors?',
            a: 'Report suspicious users immediately through our support channels. Provide details about the issue, screenshots if possible, and we\'ll investigate and take appropriate action.'
          },
          {
            q: 'How to suggest new features?',
            a: 'We love user feedback! Send feature suggestions through our support channels. We regularly review suggestions and implement features that benefit our community.'
          },
          {
            q: 'Training or tutorials available?',
            a: 'Our platform is designed to be intuitive. This chatbot provides comprehensive guidance. For additional help, contact our support team for personalized assistance.'
          },
          {
            q: 'Community guidelines?',
            a: 'Be respectful to all users, provide accurate information in your listings, honor your commitments, communicate clearly, and rate others fairly. Help us maintain a trustworthy marketplace.'
          }
        ]
      }
    ]
  },
  hi: {
    categories: [
      {
        id: 'getting-started',
        name: 'शुरुआत करना',
        icon: HelpCircle,
        color: 'bg-blue-500',
        questions: [
          {
            q: 'SanchayKart Flex क्या है?',
            a: 'SanchayKart Flex एक क्रांतिकारी 2-तरफा मार्केटप्लेस है जो स्ट्रीट वेंडर्स को आपूर्तिकर्ताओं से रियल-टाइम बिडिंग के माध्यम से जोड़ता है। विक्रेता अपनी पसंदीदा कीमत पर कच्चे माल के लिए अनुरोध पोस्ट करते हैं।'
          },
          {
            q: 'प्लेटफॉर्म पर रजिस्टर कैसे करें?',
            a: '"शुरू करें" पर क्लिक करें → अपनी भूमिका चुनें (विक्रेता/आपूर्तिकर्ता) → बुनियादी विवरण भरें → फोन नंबर वेरीफाई करें → तुरंत प्लेटफॉर्म का उपयोग शुरू करें!'
          },
          {
            q: 'क्या प्लेटफॉर्म पूरी तरह मुफ्त है?',
            a: 'हां! SanchayKart Flex का उपयोग 100% मुफ्त है। कोई रजिस्ट्रेशन फीस नहीं, कोई ट्रांजैक्शन फीस नहीं, कोई छुपे हुए चार्ज नहीं। हम पारदर्शी प्राइसिंग में विश्वास करते हैं।'
          },
          {
            q: 'कौन से शहर समर्थित हैं?',
            a: 'फिलहाल 15+ प्रमुख शहरों में उपलब्ध: मुंबई, दिल्ली, बैंगलोर, चेन्नई, हैदराबाद, पुणे, कोलकाता, अहमदाबाद, जयपुर और तेजी से अन्य शहरों में विस्तार।'
          },
          {
            q: 'अगर मुफ्त है तो आप पैसे कैसे कमाते हैं?',
            a: 'फिलहाल हमारा प्लेटफॉर्म पूरी तरह मुफ्त है। भविष्य में हम टार्गेटेड विज्ञापन और वैकल्पिक प्रीमियम फीचर्स के माध्यम से रेवेन्यू पर विचार कर सकते हैं, लेकिन मुख्य प्लेटफॉर्म हमेशा मुफ्त रहेगा।'
          }
        ]
      },
      {
        id: 'vendor-guide',
        name: 'विक्रेता गाइड',
        icon: ShoppingCart,
        color: 'bg-green-500',
        questions: [
          {
            q: 'अनुरोध कैसे पोस्ट करें?',
            a: 'चरणबद्ध तरीका: 1) "नया अनुरोध" पर क्लिक करें 2) उत्पाद का नाम दर्ज करें 3) मात्रा सेट करें 4) अपनी वांछित कीमत सेट करें 5) डिलीवरी स्थान जोड़ें 6) तत्काल स्तर सेट करें 7) सबमिट करें।'
          },
          {
            q: 'आपूर्तिकर्ताओं के ऑफर्स कैसे देखें?',
            a: 'सभी ऑफर्स सीधे आपके रिक्वेस्ट कार्ड पर दिखाई देते हैं। आप आपूर्तिकर्ता का नाम, ऑफर की गई कीमत, डिलीवरी समय और कोई नोट्स देख सकते हैं।'
          },
          {
            q: 'आपूर्तिकर्ताओं से बातचीत कैसे करें?',
            a: 'अपनी पसंदीदा कीमत और शर्तों के साथ काउंटर ऑफर भेजें। गुणवत्ता, डिलीवरी शेड्यूल और पेमेंट शर्तों पर चर्चा के लिए बिल्ट-इन चैट का उपयोग करें।'
          },
          {
            q: 'कौन से पेमेंट मेथड उपयोग कर सकते हैं?',
            a: 'आप आपूर्तिकर्ताओं के साथ सीधे पेमेंट का व्यवस्था कर सकते हैं: कैश ऑन डिलीवरी, UPI, बैंक ट्रांसफर, या कोई भी तरीका जिस पर आप दोनों सहमत हों।'
          },
          {
            q: 'ऑफर स्वीकार करने के बाद आपूर्तिकर्ता से कैसे संपर्क करें?',
            a: 'ऑफर स्वीकार करने के बाद आपको पूरी आपूर्तिकर्ता संपर्क जानकारी मिलती है जिसमें फोन नंबर, ईमेल और स्थान शामिल है। आप सीधे कॉल, मैसेज या मिल सकते हैं।'
          }
        ]
      },
      {
        id: 'supplier-guide',
        name: 'आपूर्तिकर्ता गाइड',
        icon: Package,
        color: 'bg-orange-500',
        questions: [
          {
            q: 'विक्रेता के अनुरोध कैसे खोजें?',
            a: 'स्थान, उत्पाद प्रकार या मात्रा के आधार पर सक्रिय अनुरोध ब्राउज़ करें। अपनी इन्वेंटरी से मैच करने वाले अनुरोध खोजने के लिए फिल्टर का उपयोग करें।'
          },
          {
            q: 'विक्रेताओं को ऑफर कैसे करें?',
            a: 'किसी भी विक्रेता अनुरोध पर क्लिक करें → अपनी ऑफर की गई कीमत दर्ज करें → डिलीवरी समय जोड़ें → गुणवत्ता या नोट्स शामिल करें → अपना ऑफर सबमिट करें।'
          },
          {
            q: 'प्लेटफॉर्म पर प्रतिष्ठा कैसे बनाएं?',
            a: 'समय पर ऑर्डर पूरे करें, उत्पाद की गुणवत्ता बनाए रखें, संदेशों का तुरंत जवाब दें, प्रतिस्पर्धी कीमतें ऑफर करें, और उत्कृष्ट ग्राहक सेवा प्रदान करें।'
          },
          {
            q: 'क्या प्लेटफॉर्म उपयोग के लिए कोई फीस है?',
            a: 'नहीं! SanchayKart Flex आपूर्तिकर्ताओं के लिए पूरी तरह मुफ्त है। कोई रजिस्ट्रेशन फीस नहीं, बिक्री पर कोई कमीशन नहीं, कोई छुपे हुए चार्ज नहीं।'
          },
          {
            q: 'भुगतान कैसे मिलता है?',
            a: 'भुगतान सीधे आपके और विक्रेता के बीच होता है। आप कैश, UPI, बैंक ट्रांसफर, या कोई भी पेमेंट मेथड स्वीकार कर सकते हैं जिस पर आप दोनों सहमत हों।'
          }
        ]
      },
      {
        id: 'group-buying',
        name: 'ग्रुप बाइंग',
        icon: Users,
        color: 'bg-purple-500',
        questions: [
          {
            q: 'ग्रुप बाइंग क्या है?',
            a: 'ग्रुप बाइंग से कई विक्रेता एक ही उत्पाद के लिए अपने ऑर्डर मिला सकते हैं ताकि बेहतर बल्क प्राइसिंग, साझा डिलीवरी लागत और आपूर्तिकर्ताओं के साथ मजबूत बातचीत की शक्ति मिल सके।'
          },
          {
            q: 'ग्रुप कैसे बनाएं?',
            a: '"ग्रुप बनाएं" पर क्लिक करें → उत्पाद विवरण सेट करें → टारगेट मात्रा और कीमत सेट करें → ग्रुप साइज लिमिट सेट करें → एक्सपायरी डेट सेट करें।'
          },
          {
            q: 'मौजूदा ग्रुप में कैसे जुड़ें?',
            a: '"उपलब्ध ग्रुप्स" ब्राउज़ करें → अपनी जरूरत के उत्पादों के लिए ग्रुप्स खोजें → ग्रुप विवरण चेक करें → अपनी आवश्यक मात्रा दर्ज करें → "ग्रुप जॉइन करें" पर क्लिक करें।'
          },
          {
            q: 'ग्रुप का प्रबंधन कौन करता है?',
            a: 'जो विक्रेता ग्रुप बनाता है वह ग्रुप लीडर बनता है। लीडर आपूर्तिकर्ताओं के साथ समन्वय करता है, ग्रुप कम्युनिकेशन मैनेज करता है, और बल्क ऑर्डर फाइनलाइज़ करने में मदद करता है।'
          },
          {
            q: 'ग्रुप में लागत कैसे बांटी जाती है?',
            a: 'लागत हर सदस्य की ऑर्डर मात्रा के अनुपात में बांटी जाती है। अगर कोई 100kg में से 20kg ऑर्डर करता है, तो वे डिलीवरी चार्ज सहित कुल लागत का 20% भुगतान करते हैं।'
          }
        ]
      }
    ]
  }
};

// Simplified AI response function
const generateCategorizedResponse = (query, category, language) => {
  const db = questionDatabase[language] || questionDatabase.en;
  const categoryData = db.categories.find(cat => cat.id === category);
  
  if (categoryData) {
    // Find the most relevant question in the category
    const relevantQuestion = categoryData.questions.find(q => 
      query.toLowerCase().includes(q.q.toLowerCase().substring(0, 10)) ||
      q.q.toLowerCase().includes(query.toLowerCase().substring(0, 10))
    );
    
    if (relevantQuestion) {
      return relevantQuestion.a;
    }
    
    // General category responses
    const generalResponses = {
      en: {
        'getting-started': 'I can help you understand how SanchayKart Flex works. Our platform is completely free with no hidden charges!',
        'vendor-guide': 'I can guide you through posting requests, viewing offers, and negotiating with suppliers.',
        'supplier-guide': 'I can help you find vendor requests, make offers, and build your reputation on the platform.',
        'group-buying': 'Group buying helps you get better prices through bulk orders. I can explain how to create or join groups.',
        'pricing-negotiation': 'I can help you understand pricing strategies and negotiation tactics for better deals.',
        'platform-features': 'I can explain our platform features including quality assurance and delivery coordination.',
        'support': 'I can help you with platform support, reporting issues, and community guidelines.'
      },
      hi: {
        'getting-started': 'मैं SanchayKart Flex के काम करने के तरीके को समझने में आपकी मदद कर सकता हूं। हमारा प्लेटफॉर्म पूरी तरह मुफ्त है!',
        'vendor-guide': 'मैं आपको अनुरोध पोस्ट करने, ऑफर्स देखने और आपूर्तिकर्ताओं से बातचीत करने में गाइड कर सकता हूं।',
        'supplier-guide': 'मैं आपको विक्रेता अनुरोध खोजने, ऑफर बनाने और प्लेटफॉर्म पर प्रतिष्ठा बनाने में मदद कर सकता हूं।',
        'group-buying': 'ग्रुप बाइंग से बल्क ऑर्डर्स के जरिए बेहतर कीमतें मिलती हैं। मैं ग्रुप बनाने या जुड़ने की प्रक्रिया समझा सकता हूं।',
        'pricing-negotiation': 'मैं आपको प्राइसिंग स्ट्रैटेजीज और बेहतर डील के लिए बातचीत की तकनीकें समझा सकता हूं।'
      }
    };
    
    return generalResponses[language]?.[category] || generalResponses.en[category];
  }
  
  return language === 'hi' 
    ? 'मैं आपकी मदद करने के लिए यहाँ हूँ। कृपया अपना सवाल और स्पष्ट करें।'
    : 'I\'m here to help! Could you please be more specific about your question?';
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [currentView, setCurrentView] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize welcome message
  useEffect(() => {
    const welcomeMessage = language === 'hi' 
      ? 'नमस्ते! मैं SanchayKart Flex सहायक हूं। मैं आपको प्लेटफॉर्म के उपयोग और व्यापारिक सवालों में मदद कर सकता हूं। नीचे दिए गए कैटेगरी से अपना सवाल चुनें।'
      : 'Hello! I\'m your SanchayKart Flex assistant. I can help you with platform usage and business questions. Choose a category below to get started.';
    
    setMessages([{
      id: 1,
      text: welcomeMessage,
      sender: 'bot',
      timestamp: new Date()
    }]);
  }, [language]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      let botResponse;
      
      if (selectedCategory) {
        botResponse = generateCategorizedResponse(currentInput, selectedCategory.id, language);
      } else {
        botResponse = language === 'hi'
          ? 'कृपया पहले एक कैटेगरी चुनें ताकि मैं आपको बेहतर मदद कर सकूं।'
          : 'Please select a category first so I can provide you with more targeted help.';
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('AI response error:', error);
      const errorMessage = language === 'hi'
        ? 'माफ करें, मुझे कुछ तकनीकी समस्या आ रही है। कृपया फिर से कोशिश करें।'
        : 'Sorry, I\'m experiencing some technical issues. Please try again.';
      
      const botMessage = {
        id: messages.length + 2,
        text: errorMessage,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionSelect = (question) => {
    const userMessage = {
      id: messages.length + 1,
      text: question.q,
      sender: 'user',
      timestamp: new Date()
    };

    const botMessage = {
      id: messages.length + 2,
      text: question.a,
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, botMessage]);
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'hi' : 'en';
    setLanguage(newLang);
    setCurrentView('categories');
    setSelectedCategory(null);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentView('questions');
  };

  const handleBackToCategories = () => {
    setCurrentView('categories');
    setSelectedCategory(null);
  };

  const db = questionDatabase[language] || questionDatabase.en;

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="h-16 w-16 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white flex items-center justify-center transition-all duration-300 transform hover:scale-105"
        >
          <MessageCircle className="h-7 w-7" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {language === 'hi' ? 'SanchayKart सहायक' : 'SanchayKart Assistant'}
                </h3>
                <p className="text-xs opacity-80">
                  {language === 'hi' ? 'ऑनलाइन' : 'Online'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleLanguage}
                className="h-8 w-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                title={language === 'hi' ? 'भाषा बदलें' : 'Change Language'}
              >
                <Languages className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                title={language === 'hi' ? 'छोटा करें' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                title={language === 'hi' ? 'बंद करें' : 'Close'}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        {!isMinimized && (
          <>
            {/* Messages Area */}
            <div className="h-96 overflow-y-auto p-4 bg-gray-50">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-800 shadow-sm border border-gray-100'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.sender === 'bot' && (
                          <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Bot className="h-3 w-3 text-blue-600" />
                          </div>
                        )}
                        {message.sender === 'user' && (
                          <div className="h-6 w-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <User className="h-3 w-3 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm leading-relaxed">{message.text}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
                      <div className="flex items-center space-x-2">
                        <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <Bot className="h-3 w-3 text-blue-600" />
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {/* Categories/Questions Section */}
            <div className="p-4 bg-white border-t border-gray-100 max-h-64 overflow-y-auto">
              {currentView === 'categories' ? (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    {language === 'hi' ? 'कैटेगरी चुनें:' : 'Choose a Category:'}
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {db.categories.map((category) => {
                      const IconComponent = category.icon;
                      return (
                        <button
                          key={category.id}
                          onClick={() => handleCategorySelect(category)}
                          className={`flex items-center space-x-3 p-3 rounded-xl transition-colors text-left hover:bg-gray-50 border border-gray-200 hover:border-gray-300`}
                        >
                          <div className={`w-8 h-8 ${category.color} rounded-full flex items-center justify-center`}>
                            <IconComponent className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {category.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={handleBackToCategories}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {language === 'hi' ? 'वापस' : 'Back'}
                      </span>
                    </button>
                    <h4 className="text-sm font-semibold text-gray-700">
                      {selectedCategory?.name}
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {selectedCategory?.questions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuestionSelect(question)}
                        className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 hover:border-gray-300"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          {question.q}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={language === 'hi' ? 'अपना सवाल लिखें...' : 'Type your question...'}
                    onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-500"
                    disabled={isLoading}
                  />
                </div>
                <button 
                  onClick={handleSendMessage} 
                  disabled={isLoading || !inputValue.trim()}
                  className="h-12 w-12 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors"
                  title={language === 'hi' ? 'भेजें' : 'Send'}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatBot;

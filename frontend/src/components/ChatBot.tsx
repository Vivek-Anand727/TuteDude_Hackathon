import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Mic, 
  MicOff, 
  Volume2, 
  X,
  Languages,
  Minimize2,
  Maximize2,
  HelpCircle
} from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { interfaceContext, getInterfaceHelp } from '@/data/interfaceContext';
import { toast } from "@/components/ui/use-toast";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  // Initialize speech recognition - FIXED VERSION
  useEffect(() => {
    // Type-safe check for speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };
      
      recognitionInstance.onerror = () => {
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, [language]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = language === 'hi' 
        ? 'नमस्ते! मैं SanchayKart Flex सहायक हूं। मैं आपको इस प्लेटफॉर्म के उपयोग, बाजार की कीमतों और व्यापारिक सवालों में मदद कर सकता हूं।'
        : 'Hello! I\'m your SanchayKart Flex assistant. I can help you use this platform, understand market prices, and answer business questions.';
      
      setMessages([{
        id: 1,
        text: welcomeMessage,
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
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
      const interfaceHelp = getInterfaceHelp(currentInput, language);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const systemPrompt = language === 'hi' 
        ? `आप SanchayKart Flex प्लेटफॉर्म के लिए सहायक हैं। यह एक 2-तरफा मार्केटप्लेस है जहाँ:

🏪 विक्रेता (Street Vendors/Buyers): कच्चे माल के लिए कस्टम अनुरोध पोस्ट करते हैं
🚛 आपूर्तिकर्ता (Suppliers): अनुरोध देखकर प्रतिस्पर्धी ऑफर करते हैं

मुख्य विशेषताएं:
- रियल-टाइम बोली प्रणाली
- ग्रुप बाइंग और बल्क खरीदारी
- काउंटर ऑफर और नेगोसिएशन
- लोकेशन-आधारित मैचिंग

${interfaceHelp ? `संबंधित जानकारी: ${JSON.stringify(interfaceHelp, null, 2)}` : ''}

उपयोगकर्ता के सवाल का जवाब हिंदी में दें।`
        : `You are an assistant for SanchayKart Flex platform. This is a 2-sided marketplace where:

🏪 Vendors (Street Vendors/Buyers): Post custom requests for raw materials
🚛 Suppliers: See requests and place competitive offers

Key Features:
- Real-time bidding system
- Group buying and bulk purchasing
- Counter offers and price negotiation
- Location-based matching

${interfaceHelp ? `Relevant information: ${JSON.stringify(interfaceHelp, null, 2)}` : ''}

Answer user questions about using this marketplace platform.`;

      const prompt = `${systemPrompt}\n\nUser question: ${currentInput}`;
      const result = await model.generateContent(prompt);
      const botResponse = result.response.text();

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

  const handleVoiceInput = () => {
    if (!recognition) {
      toast({
        title: "Voice not supported",
        description: "Your browser doesn't support voice input",
        variant: "destructive",
      });
      return;
    }
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      recognition.start();
      setIsListening(true);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'hi' : 'en';
    setLanguage(newLang);
    
    const welcomeMessage = newLang === 'hi' 
      ? 'नमस्ते! मैं SanchayKart Flex सहायक हूं। मैं आपको इस प्लेटफॉर्म के उपयोग में मदद कर सकता हूं।'
      : 'Hello! I\'m your SanchayKart Flex assistant. I can help you use this platform.';
    
    setMessages([{
      id: 1,
      text: welcomeMessage,
      sender: 'bot',
      timestamp: new Date()
    }]);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${isMinimized ? 'w-80' : 'w-96'}`}>
      <Card className="shadow-xl border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">
                {language === 'hi' ? 'SanchayKart सहायक' : 'SanchayKart Assistant'}
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {language === 'hi' ? 'हिंदी' : 'English'}
              </Badge>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="h-8 w-8 p-0"
              >
                <Languages className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 p-0"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {!isMinimized && (
          <CardContent className="p-4">
            {/* Messages */}
            <div className="h-80 overflow-y-auto mb-4 space-y-3 bg-muted/30 rounded-lg p-3">
              {messages.map((message: any) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border border-border shadow-sm'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.sender === 'bot' && <Bot className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />}
                      {message.sender === 'user' && <User className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        {message.sender === 'bot' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => speakText(message.text)}
                            className="h-6 w-6 p-0 mt-1"
                          >
                            <Volume2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-background border border-border rounded-lg p-3 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-4 w-4 text-primary" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input */}
            <div className="flex space-x-2 mb-3">
              <div className="flex-1 relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={language === 'hi' ? 'अपना सवाल लिखें...' : 'Type your question...'}
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                  className="pr-10"
                  disabled={isLoading}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleVoiceInput}
                  className={`absolute right-1 top-1 h-8 w-8 p-0 ${isListening ? 'text-red-500' : ''}`}
                  disabled={!recognition || isLoading}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
              <Button 
                onClick={handleSendMessage} 
                disabled={isLoading || !inputValue.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Quick Actions - UPDATED */}
            <div className="grid grid-cols-2 gap-2">
              {language === 'hi' ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setInputValue('SanchayKart Flex कैसे काम करता है?')} 
                    className="text-xs"
                  >
                    <HelpCircle className="h-3 w-3 mr-1" />
                    प्लेटफॉर्म गाइड
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setInputValue('अनुरोध कैसे पोस्ट करूं?')} 
                    className="text-xs"
                  >
                    अनुरोध बनाएं
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setInputValue('ग्रुप बाइंग कैसे काम करती है?')} 
                    className="text-xs"
                  >
                    ग्रुप खरीदारी
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setInputValue('ऑफर पर बातचीत कैसे करें?')} 
                    className="text-xs"
                  >
                    बातचीत प्रक्रिया
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setInputValue('How does SanchayKart Flex work?')} 
                    className="text-xs"
                  >
                    <HelpCircle className="h-3 w-3 mr-1" />
                    Platform Guide
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setInputValue('How to post a request?')} 
                    className="text-xs"
                  >
                    Create Request
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setInputValue('How does group buying work?')} 
                    className="text-xs"
                  >
                    Group Buying
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setInputValue('How to negotiate offers?')} 
                    className="text-xs"
                  >
                    Negotiation
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default ChatBot;

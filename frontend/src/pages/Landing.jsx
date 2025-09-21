// src/pages/Landing.jsx - WITH COMMUNITY OUTREACH & AWARENESS EVENTS
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowRight, 
  Play, 
  CheckCircle, 
  Shield, 
  Globe, 
  Mic,
  Camera,
  BarChart3,
  MessageCircle,
  Star,
  Smartphone,
  Sparkles,
  TrendingUp,
  Users,
  MapPin,
  Calendar,
  Award,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Facebook,
  ExternalLink,
  Presentation,
  School,
  HandHeart,
  Megaphone
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/hooks/useLanguage'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/context/ThemeContext'
import { motion } from 'framer-motion'

const Landing = () => {
  const [stats] = useState({
    farmers: '10,000+',
    yieldIncrease: '30%',
    languages: '3',
    crops: '50+'
  })
  
  const [testimonials, setTestimonials] = useState([])
  const { currentLanguage } = useLanguage()
  const { isAuthenticated } = useAuth()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  useEffect(() => {
    const mockTestimonials = currentLanguage === 'hi' ? [
      {
        id: 1,
        farmerName: 'राम सिंह पटेल',
        location: 'पंजाब',
        message: 'कृषि सहायक से मेरी फसल की पैदावार 40% बढ़ गई है! किसानों के लिए बेहतरीन प्लेटफॉर्म।',
        cropType: 'गेहूं किसान',
        rating: 5
      },
      {
        id: 2,
        farmerName: 'सुनीता देवी',
        location: 'हरियाणा',
        message: 'मौसम अपडेट और बाजार भाव से बेहतर निर्णय लेने में मदद मिलती है।',
        cropType: 'धान किसान',
        rating: 5
      },
      {
        id: 3,
        farmerName: 'अजय कुमार',
        location: 'उत्तर प्रदेश',
        message: 'AI रोग पहचान तकनीक से खेती आसान और फायदेमंद हो गई है।',
        cropType: 'आलू किसान',
        rating: 5
      }
    ] : [
      {
        id: 1,
        farmerName: 'Ram Singh Patel',
        location: 'Punjab',
        message: 'Krishi Sahayak increased my crop yield by 40%. Excellent platform for farmers!',
        cropType: 'Wheat Farmer',
        rating: 5
      },
      {
        id: 2,
        farmerName: 'Sunita Devi',
        location: 'Haryana',
        message: 'Weather updates and market prices help me make better farming decisions.',
        cropType: 'Rice Farmer',
        rating: 5
      },
      {
        id: 3,
        farmerName: 'Ajay Kumar',
        location: 'Uttar Pradesh',
        message: 'AI disease detection has made farming much easier and more profitable.',
        cropType: 'Potato Farmer',
        rating: 5
      }
    ]
    
    setTestimonials(mockTestimonials)
  }, [currentLanguage])

  const handleGetStarted = () => {
    navigate('/register')
  }

  const handleWatchDemo = () => {
    navigate('/demo')
  }

  const features = [
    {
      icon: Mic,
      title: currentLanguage === 'hi' ? 'वॉयस असिस्टेंट' : 'Voice Assistant',
      description: currentLanguage === 'hi' ? 'हिंदी, अंग्रेजी और पंजाबी में आवाज़ से सवाल पूछें' : 'Ask questions in Hindi, English & Punjabi using voice',
      color: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/20'
    },
    {
      icon: Camera,
      title: currentLanguage === 'hi' ? 'रोग पहचान' : 'Disease Detection',
      description: currentLanguage === 'hi' ? 'कैमरा से फसल के रोग तुरंत पहचानें' : 'Identify crop diseases instantly using camera',
      color: 'from-green-600 to-emerald-700',
      bgColor: 'bg-green-50 dark:bg-green-950/20'
    },
    {
      icon: BarChart3,
      title: currentLanguage === 'hi' ? 'बाजार भाव' : 'Market Prices',
      description: currentLanguage === 'hi' ? 'लाइव बाजार दरें और बेचने की सलाह पाएं' : 'Get live market rates and selling recommendations',
      color: 'from-yellow-600 to-orange-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/20'
    },
    {
      icon: Shield,
      title: currentLanguage === 'hi' ? 'मौसम चेतावनी' : 'Weather Alerts',
      description: currentLanguage === 'hi' ? 'समय पर मौसम की चेतावनी और खेती की सलाह' : 'Timely weather warnings and farming advice',
      color: 'from-blue-600 to-cyan-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20'
    },
    {
      icon: MessageCircle,
      title: currentLanguage === 'hi' ? 'AI चैटबॉट' : 'AI Chatbot',
      description: currentLanguage === 'hi' ? '24/7 खेती की सलाह और तुरंत सहायता' : '24/7 farming advice and instant support',
      color: 'from-teal-600 to-emerald-600',
      bgColor: 'bg-teal-50 dark:bg-teal-950/20'
    },
    {
      icon: Globe,
      title: currentLanguage === 'hi' ? 'बहु-भाषी' : 'Multi-Language',
      description: currentLanguage === 'hi' ? '3 भाषाओं में पूर्ण सहायता' : 'Complete support in 3 languages',
      color: 'from-green-700 to-emerald-800',
      bgColor: 'bg-green-50 dark:bg-green-950/20'
    }
  ]

  // ✅ COMMUNITY OUTREACH EVENTS DATA
  const outreachEvents = [
    {
      id: 1,
      title: currentLanguage === 'hi' ? 'गांव में स्मार्ट फार्मिंग वर्कशॉप' : 'Village Smart Farming Workshop',
      image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=250&fit=crop&crop=faces',
      location: 'लुधियाना, पंजाब',
      date: '15 सितंबर 2025',
      description: currentLanguage === 'hi' 
        ? 'स्थानीय NGO के साथ मिलकर 200+ किसानों को डिजिटल खेती की ट्रेनिंग दी। मोबाइल ऐप का इस्तेमाल सिखाया।'
        : 'Partnered with local NGO to train 200+ farmers on digital farming. Taught mobile app usage and modern techniques.',
      attendees: '200+ किसान',
      partner: 'ग्रामीण विकास संस्था',
      type: 'Training Workshop'
    },
    {
      id: 2,
      title: currentLanguage === 'hi' ? 'डिजिटल साक्षरता अभियान' : 'Digital Literacy Campaign',
      image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=250&fit=crop&crop=faces',
      location: 'अमृतसर, पंजाब',
      date: '22 अगस्त 2025',
      description: currentLanguage === 'hi'
        ? 'किसान कल्याण समिति के साथ मिलकर गांव-गांव जाकर स्मार्टफोन और ऐप का इस्तेमाल सिखाया।'
        : 'Collaborated with Farmer Welfare Committee to teach smartphone and app usage village by village.',
      attendees: '150+ किसान',
      partner: 'किसान कल्याण समिति',
      type: 'Digital Education'
    },
    {
      id: 3,
      title: currentLanguage === 'hi' ? 'युवा किसान सम्मेलन' : 'Young Farmers Conference',
      image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=250&fit=crop&crop=faces',
      location: 'जालंधर, पंजाब',
      date: '10 अगस्त 2025',
      description: currentLanguage === 'hi'
        ? 'युवा कृषक मंच के साथ नई पीढ़ी के किसानों को AI और IoT तकनीक के बारे में जानकारी दी।'
        : 'Partnered with Youth Farmer Forum to educate next-generation farmers about AI and IoT technology.',
      attendees: '300+ युवा किसान',
      partner: 'युवा कृषक मंच',
      type: 'Youth Conference'
    },
    {
      id: 4,
      title: currentLanguage === 'hi' ? 'महिला किसान सशक्तिकरण' : 'Women Farmer Empowerment',
      image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&h=250&fit=crop&crop=faces',
      location: 'पटियाला, पंजाब',
      date: '28 जुलाई 2025',
      description: currentLanguage === 'hi'
        ? 'महिला सहयोग संस्था के साथ महिला किसानों को डिजिटल खेती और बाजार की जानकारी दी।'
        : 'Collaborated with Women Support Organization to educate women farmers about digital farming and market insights.',
      attendees: '180+ महिला किसान',
      partner: 'महिला सहयोग संस्था',
      type: 'Women Empowerment'
    }
  ]

  // ✅ SOCIAL MEDIA LINKS
  const socialLinks = [
    {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://www.instagram.com/krishisahayak_official',
      color: 'from-pink-500 to-purple-600',
      bgColor: 'bg-pink-50 dark:bg-pink-950/20',
      username: '@krishisahayak_official'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: 'https://twitter.com/KrishiSahayak',
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      username: '@KrishiSahayak'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: 'https://www.linkedin.com/company/krishi-sahayak',
      color: 'from-blue-600 to-blue-800',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      username: 'Krishi Sahayak'
    },
    {
      name: 'YouTube',
      icon: Youtube,
      url: 'https://www.youtube.com/@KrishiSahayakOfficial',
      color: 'from-red-500 to-red-700',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      username: 'Krishi Sahayak Official'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: 'https://www.facebook.com/KrishiSahayakOfficial',
      color: 'from-blue-600 to-indigo-700',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      username: 'Krishi Sahayak Official'
    }
  ]

  return (
    <div className="w-full">
      {/* ✅ HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-yellow-500 via-emerald-50/80 to-green-700 dark:from-gray-950 dark:via-green-950/30 dark:to-emerald-950/20">
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute top-20 left-20 text-6xl opacity-30">🌾</div>
          <div className="absolute top-40 right-32 text-4xl opacity-20">🚜</div>
          <div className="absolute bottom-20 left-32 text-5xl opacity-25">🌱</div>
          <div className="absolute bottom-32 right-20 text-3xl opacity-30">🌾</div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <Badge 
                variant="outline" 
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white/80 dark:bg-gray-800/80 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-600/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300"
              >
                <Sparkles className="w-4 h-4" />
                {currentLanguage === 'hi' ? 'AI-संचालित स्मार्ट खेती' : 'AI-Powered Smart Farming'}
              </Badge>
              
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-green-700 via-emerald-600 to-green-800 bg-clip-text text-transparent">
                    {currentLanguage === 'hi' ? 'कृषि सहायक' : 'Krishi Sahayak'}
                  </span>
                  <br />
                  <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-700 dark:text-gray-300 font-medium">
                    {currentLanguage === 'hi' ? 'स्मार्ट खेती प्लेटफॉर्म' : 'Smart Farming Platform'}
                  </span>
                </h1>
                
                <p className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                  <span className="font-semibold text-green-700 dark:text-green-400">🇮🇳 भारतीय किसानों के लिए</span>
                  <br />
                  {currentLanguage === 'hi' 
                    ? 'हिंदी, अंग्रेजी और पंजाबी में AI-संचालित खेती की जानकारी' 
                    : 'AI-powered farming insights in Hindi, English & Punjabi'
                  }
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-3xl mx-auto">
                {[
                  { icon: Users, value: stats.farmers, label: currentLanguage === 'hi' ? 'किसान' : 'Farmers', color: 'emerald' },
                  { icon: TrendingUp, value: stats.yieldIncrease, label: currentLanguage === 'hi' ? 'उत्पादन वृद्धि' : 'Yield Increase', color: 'green' },
                  { icon: Globe, value: stats.languages, label: currentLanguage === 'hi' ? 'भाषाएं' : 'Languages', color: 'yellow' },
                  { icon: Sparkles, value: stats.crops, label: currentLanguage === 'hi' ? 'फसलें' : 'Crops', color: 'orange' }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                    className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <stat.icon className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                      <div className={`text-2xl sm:text-3xl font-bold text-${stat.color}-700 dark:text-${stat.color}-400`}>
                        {stat.value}
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto"
              >
                <Button 
                  size="lg" 
                  onClick={handleGetStarted}
                  className="w-full sm:w-auto bg-green-500 hover:bg-green-900 text-white shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold text-lg px-8 py-4 rounded-xl group"
                >
                  <span className="mr-2">
                    {currentLanguage === 'hi' ? '🚀 शुरू करें' : '🚀 Get Started'}
                  </span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto dark:border-green-600 text-green-700 dark:text-green-400 hover:bg-green-900 dark:hover:bg-green-950/30 font-semibold text-lg px-8 py-4 rounded-xl backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 group"
                  onClick={handleWatchDemo}
                >
                  <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  {currentLanguage === 'hi' ? 'डेमो देखें' : 'Watch Demo'}
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 pt-8 border-t border-green-200/30 dark:border-green-800/30"
              >
                {[
                  { icon: CheckCircle, text: currentLanguage === 'hi' ? 'पूर्णतः निःशुल्क' : 'Completely Free', color: 'emerald' },
                  { icon: Shield, text: currentLanguage === 'hi' ? 'सुरक्षित डेटा' : 'Secure Data', color: 'green' },
                  { icon: Smartphone, text: currentLanguage === 'hi' ? 'मोबाइल फ्रेंडली' : 'Mobile Friendly', color: 'blue' }
                ].map((badge, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    <badge.icon className={`w-4 h-4 text-${badge.color}-600 dark:text-${badge.color}-400`} />
                    <span>{badge.text}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ✅ FEATURES SECTION */}
      <section className="py-20 sm:py-28 bg-white dark:bg-gray-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16 sm:mb-20"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              <span className="text-4xl">🌾</span> {currentLanguage === 'hi' ? 'मुख्य विशेषताएं' : 'Key Features'}
            </h2>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {currentLanguage === 'hi' ? 'आधुनिक तकनीक से खेती को आसान और फायदेमंद बनाएं' : 'Make farming easier and more profitable with modern technology'}
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <Card 
                  className={`h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 ${feature.bgColor} backdrop-blur-sm cursor-pointer`}
                  onClick={() => navigate('/register')}
                >
                  <CardContent className="p-8">
                    <div className="relative mb-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ✅ TESTIMONIALS SECTION */}
      {testimonials.length > 0 && (
        <section className="py-20 sm:py-28 bg-gradient-to-br from-green-50/80 to-emerald-50/60 dark:from-gray-800 dark:to-green-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16 sm:mb-20"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                <span className="text-4xl">🗣️</span> {currentLanguage === 'hi' ? 'किसान प्रशंसापत्र' : 'Farmer Testimonials'}
              </h2>
              <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                {currentLanguage === 'hi' ? 'हजारों किसान हमारे साथ अपनी फसल की पैदावार बढ़ा रहे हैं' : 'Thousands of farmers are improving their yields with us'}
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <Card className="h-full shadow-xl hover:shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2">
                    <CardContent className="p-8">
                      <div className="flex items-center mb-6">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                        ))}
                      </div>
                      
                      <blockquote className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed text-lg italic relative">
                        <span className="text-4xl text-green-500 absolute -top-2 -left-2 opacity-50">"</span>
                        {testimonial.message}
                        <span className="text-4xl text-green-500 absolute -bottom-6 -right-2 opacity-50">"</span>
                      </blockquote>
                      
                      <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {testimonial.farmerName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-lg text-gray-900 dark:text-white">{testimonial.farmerName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            📍 {testimonial.location} • {testimonial.cropType}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ✅ NEW: COMMUNITY OUTREACH & AWARENESS SECTION */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-blue-50 via-indigo-50/80 to-purple-50 dark:from-gray-900 dark:via-blue-950/10 dark:to-purple-950/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16 sm:mb-20"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              <span className="text-4xl">🎯</span> {currentLanguage === 'hi' ? 'सामुदायिक पहल और जागरूकता' : 'Community Outreach & Awareness'}
            </h2>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              {currentLanguage === 'hi' 
                ? 'हम NGO संगठनों के साथ मिलकर गांव-गांव जाकर किसानों को डिजिटल खेती के बारे में जागरूक करते हैं और हमारे ऐप का इस्तेमाल सिखाते हैं'
                : 'We partner with NGOs to conduct village-to-village awareness campaigns, educating farmers about digital farming and teaching them how to use our app'
              }
            </p>
          </motion.div>

          {/* Outreach Events Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 mb-16">
            {outreachEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm overflow-hidden">
                  <div className="relative">
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <Badge className="bg-blue-600 text-white px-3 py-1 text-xs">
                        {event.type}
                      </Badge>
                      <Badge className="bg-green-600 text-white px-3 py-1 text-xs">
                        {event.date}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <Presentation className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-6 sm:p-8">
                    <h3 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors duration-300">
                      {event.title}
                    </h3>
                    
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-red-500" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>{event.date}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                      {event.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {currentLanguage === 'hi' ? 'उपस्थिति:' : 'Attendance:'}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-green-700 dark:text-green-400">
                          {event.attendees}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <HandHeart className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {currentLanguage === 'hi' ? 'साझेदार:' : 'Partner:'}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                          {event.partner}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Outreach Impact Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 sm:p-12 shadow-2xl"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                <span className="text-3xl">📊</span> {currentLanguage === 'hi' ? 'हमारी सामुदायिक पहुंच' : 'Our Community Impact'}
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {currentLanguage === 'hi' 
                  ? 'गांव-गांव जाकर किसानों को डिजिटल खेती की जानकारी देने का हमारा प्रभाव'
                  : 'Impact of our village-to-village digital farming awareness campaigns'
                }
              </p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {[
                { 
                  icon: Presentation, 
                  value: '50+', 
                  label: currentLanguage === 'hi' ? 'वर्कशॉप आयोजित' : 'Workshops Conducted',
                  color: 'blue'
                },
                { 
                  icon: Users, 
                  value: '2,500+', 
                  label: currentLanguage === 'hi' ? 'किसान प्रशिक्षित' : 'Farmers Trained',
                  color: 'green'
                },
                { 
                  icon: School, 
                  value: '25+', 
                  label: currentLanguage === 'hi' ? 'गांव कवर्ड' : 'Villages Covered',
                  color: 'purple'
                },
                { 
                  icon: Megaphone, 
                  value: '15+', 
                  label: currentLanguage === 'hi' ? 'NGO साझेदार' : 'NGO Partners',
                  color: 'orange'
                }
              ].map((stat, index) => (
                <div key={index} className="text-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-2xl hover:shadow-lg transition-shadow duration-300">
                  <div className={`w-14 h-14 bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className={`text-3xl sm:text-4xl font-bold text-${stat.color}-700 dark:text-${stat.color}-400 mb-2`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-tight">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Call to Action for NGOs */}
            <div className="mt-12 text-center">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl p-6 sm:p-8">
                <h4 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  {currentLanguage === 'hi' ? '🤝 NGO साझेदारी कार्यक्रम' : '🤝 NGO Partnership Program'}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-3xl mx-auto">
                  {currentLanguage === 'hi'
                    ? 'क्या आप भी किसानों की मदद करना चाहते हैं? हमारे साथ जुड़ें और अपने क्षेत्र में डिजिटल खेती की जागरूकता फैलाने में योगदान दें।'
                    : 'Want to help farmers in your region? Join our partnership program and contribute to spreading digital farming awareness in your area.'
                  }
                </p>
                <Button 
                  size="lg"
                  onClick={() => window.open('https://wa.me/918789658518', '_blank')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <HandHeart className="w-5 h-5 mr-2" />
                  {currentLanguage === 'hi' ? 'साझेदार बनें' : 'Become a Partner'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ✅ SOCIAL MEDIA & CTA SECTION */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 text-8xl animate-pulse">🌾</div>
          <div className="absolute top-40 right-32 text-6xl animate-bounce delay-300">🚜</div>
          <div className="absolute bottom-20 left-32 text-7xl animate-pulse delay-700">🌱</div>
          <div className="absolute bottom-32 right-20 text-5xl animate-bounce delay-500">🌾</div>
        </div>
        
        <div className="relative max-w-6xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-4xl">🌾</span><br />
                {currentLanguage === 'hi' ? 'समुदाय से जुड़ें और साथ मिलकर बदलाव लाएं' : 'Join Our Community and Create Change Together'}
              </h2>
              <p className="text-xl sm:text-2xl text-green-100 max-w-4xl mx-auto leading-relaxed">
                {currentLanguage === 'hi' 
                  ? 'भारत के लाखों किसानों के साथ स्मार्ट कृषि की यात्रा में शामिल हों। हमारे सोशल मीडिया पर फॉलो करें और किसान समुदाय का हिस्सा बनें।'
                  : 'Join millions of Indian farmers in the smart agriculture revolution. Follow us on social media and be part of the farmer community.'
                }
              </p>
            </div>

            {/* Social Media Links */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 max-w-4xl mx-auto">
              {socialLinks.map((social, index) => (
                <motion.div
                  key={social.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Button
                    onClick={() => window.open(social.url, '_blank')}
                    className={`w-full h-auto p-4 sm:p-6 bg-gradient-to-br ${social.color} hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl group border-0`}
                  >
                    <div className="flex flex-col items-center gap-2 sm:gap-3">
                      <social.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                      <div className="text-center">
                        <div className="font-bold text-sm sm:text-base text-white">
                          {social.name}
                        </div>
                        <div className="text-xs text-white/80 truncate max-w-24 sm:max-w-32">
                          {social.username}
                        </div>
                      </div>
                      <ExternalLink className="w-3 h-3 text-white/60 group-hover:text-white transition-colors duration-300" />
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center max-w-2xl mx-auto pt-8">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 text-lg px-8 sm:px-10 py-4 sm:py-5 rounded-xl group"
              >
                <span className="mr-2">
                  {currentLanguage === 'hi' ? '🚀 निःशुल्क खाता बनाएं' : '🚀 Create Free Account'}
                </span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => window.open('https://wa.me/918789658518', '_blank')}
                className="w-full sm:w-auto border-2 border-green-300/50 text-white hover:bg-green-700/30 backdrop-blur-sm font-bold text-lg px-8 sm:px-10 py-4 sm:py-5 rounded-xl"
              >
                {currentLanguage === 'hi' ? '📞 संपर्क करें' : '📞 Contact Us'}
              </Button>
            </div>

            {/* Community Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className="pt-8 border-t border-green-300/20"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 max-w-3xl mx-auto">
                {[
                  { icon: '📱', value: '25K+', label: currentLanguage === 'hi' ? 'इंस्टाग्राम फॉलोअर्स' : 'Instagram Followers' },
                  { icon: '🐦', value: '15K+', label: currentLanguage === 'hi' ? 'ट्विटर फॉलोअर्स' : 'Twitter Followers' },
                  { icon: '📺', value: '50K+', label: currentLanguage === 'hi' ? 'यूट्यूब व्यूज' : 'YouTube Views' },
                  { icon: '👥', value: '100K+', label: currentLanguage === 'hi' ? 'कुल रीच' : 'Total Reach' }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className="text-lg sm:text-xl font-bold text-green-300 mb-1">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-green-100">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Landing

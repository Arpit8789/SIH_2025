// src/pages/Landing.jsx - COMPLETELY FIXED WITH PROPER SPACING & THEMING
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
  Users
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
  const { isDark } = useTheme() // ✅ Add theme hook
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

  // ✅ Always navigate to register
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

  return (
    // ✅ FIXED: Remove min-h-screen and any padding that creates gaps
    <div className="w-full">
      {/* ✅ HERO SECTION - STARTS DIRECTLY AFTER HEADER */}
      <section className="relative overflow-hidden bg-gradient-to-br from-yellow-500 via-emerald-50/80 to-green-700 dark:from-gray-950 dark:via-green-950/30 dark:to-emerald-950/20">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute top-20 left-20 text-6xl opacity-30">🌾</div>
          <div className="absolute top-40 right-32 text-4xl opacity-20">🚜</div>
          <div className="absolute bottom-20 left-32 text-5xl opacity-25">🌱</div>
          <div className="absolute bottom-32 right-20 text-3xl opacity-30">🌾</div>
        </div>
        
        {/* ✅ ADJUSTED PADDING - NO TOP MARGIN */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* ✅ ENHANCED BADGE */}
              <Badge 
                variant="outline" 
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white/80 dark:bg-gray-800/80 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-600/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300"
              >
                <Sparkles className="w-4 h-4" />
                {currentLanguage === 'hi' ? 'AI-संचालित स्मार्ट खेती' : 'AI-Powered Smart Farming'}
              </Badge>
              
              {/* ✅ ENHANCED TITLE */}
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

              {/* ✅ ENHANCED STATS GRID */}
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

              {/* ✅ ENHANCED CTA BUTTONS */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto"
              >
                <Button 
                  size="lg" 
                  onClick={handleGetStarted}
                  className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold text-lg px-8 py-4 rounded-xl group"
                >
                  <span className="mr-2">
                    {currentLanguage === 'hi' ? '🚀 शुरू करें' : '🚀 Get Started'}
                  </span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto border-2 border-green-300 dark:border-green-600 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 font-semibold text-lg px-8 py-4 rounded-xl backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 group"
                  onClick={handleWatchDemo}
                >
                  <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  {currentLanguage === 'hi' ? 'डेमो देखें' : 'Watch Demo'}
                </Button>
              </motion.div>

              {/* ✅ ENHANCED TRUST BADGES */}
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

      {/* ✅ ENHANCED FEATURES SECTION */}
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
        onClick={() => navigate('/register')} // ✅ ADD THIS CLICK HANDLER
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

      {/* ✅ ENHANCED TESTIMONIALS */}
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
                      {/* Rating Stars */}
                      <div className="flex items-center mb-6">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                        ))}
                      </div>
                      
                      {/* Testimonial Text */}
                      <blockquote className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed text-lg italic relative">
                        <span className="text-4xl text-green-500 absolute -top-2 -left-2 opacity-50">"</span>
                        {testimonial.message}
                        <span className="text-4xl text-green-500 absolute -bottom-6 -right-2 opacity-50">"</span>
                      </blockquote>
                      
                      {/* Farmer Info */}
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

      {/* ✅ ENHANCED FINAL CTA */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 text-8xl animate-pulse">🌾</div>
          <div className="absolute top-40 right-32 text-6xl animate-bounce delay-300">🚜</div>
          <div className="absolute bottom-20 left-32 text-7xl animate-pulse delay-700">🌱</div>
          <div className="absolute bottom-32 right-20 text-5xl animate-bounce delay-500">🌾</div>
        </div>
        
        <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-4xl">🌾</span><br />
              {currentLanguage === 'hi' ? 'आज ही शुरू करें और अपनी खेती को बदलें' : 'Start Today and Transform Your Farming'}
            </h2>
            <p className="text-xl sm:text-2xl text-green-100 max-w-3xl mx-auto leading-relaxed">
              {currentLanguage === 'hi' ? 'भारत के लाखों किसानों के साथ स्मार्ट कृषि की यात्रा में शामिल हों' : 'Join millions of Indian farmers in the smart agriculture revolution'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-lg mx-auto pt-8">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 text-lg px-10 py-5 rounded-xl group"
              >
                <span className="mr-2">
                  {currentLanguage === 'hi' ? '🚀 निःशुल्क खाता बनाएं' : '🚀 Create Free Account'}
                </span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
              
              <Button 
  variant="outline" 
  size="lg" 
  onClick={() => window.open('https://wa.me/918789658518', '_blank')} // ✅ FIXED
  className="w-full sm:w-auto border-2 border-green-300/50 text-white hover:bg-green-700/30 backdrop-blur-sm font-bold text-lg px-10 py-5 rounded-xl"
>
  {currentLanguage === 'hi' ? '📞 संपर्क करें' : '📞 Contact Us'}
</Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Landing

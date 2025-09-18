// src/pages/Landing.jsx - FIXED JSX CLOSING TAGS
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
  Smartphone
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/hooks/useLanguage'
import { useAuth } from '@/hooks/useAuth'
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
  const navigate = useNavigate()

  useEffect(() => {
    const mockTestimonials = currentLanguage === 'hi' ? [
      {
        id: 1,
        farmerName: 'राम सिंह पटेल',
        location: 'पंजाब',
        message: 'कृषि सहायक से मेरी फसल की पैदावार 40% बढ़ गई है! किसानों के लिए बेहतरीन प्लेटफॉर्म।',
        cropType: 'गेहूं किसान'
      },
      {
        id: 2,
        farmerName: 'सुनीता देवी',
        location: 'हरियाणa',
        message: 'मौसम अपडेट और बाजार भाव से बेहतर निर्णय लेने में मदद मिलती है।',
        cropType: 'धान किसान'
      },
      {
        id: 3,
        farmerName: 'अजय कुमार',
        location: 'उत्तर प्रदेश',
        message: 'AI रोग पहचान तकनीक से खेती आसान और फायदेमंद हो गई है।',
        cropType: 'आलू किसान'
      }
    ] : [
      {
        id: 1,
        farmerName: 'Ram Singh Patel',
        location: 'Punjab',
        message: 'Krishi Sahayak increased my crop yield by 40%. Excellent platform for farmers!',
        cropType: 'Wheat Farmer'
      },
      {
        id: 2,
        farmerName: 'Sunita Devi',
        location: 'Haryana',
        message: 'Weather updates and market prices help me make better farming decisions.',
        cropType: 'Rice Farmer'
      },
      {
        id: 3,
        farmerName: 'Ajay Kumar',
        location: 'Uttar Pradesh',
        message: 'AI disease detection has made farming much easier and more profitable.',
        cropType: 'Potato Farmer'
      }
    ]
    
    setTestimonials(mockTestimonials)
  }, [currentLanguage])

  const handleGetStarted = () => {
    const targetRoute = isAuthenticated ? '/dashboard' : '/register'
    navigate(targetRoute)
  }

  const handleWatchDemo = () => {
    navigate('/demo')
  }

  const features = [
    {
      icon: Mic,
      title: currentLanguage === 'hi' ? 'वॉयस असिस्टेंट' : 'Voice Assistant',
      description: currentLanguage === 'hi' ? 'हिंदी, अंग्रेजी और पंजाबी में आवाज़ से सवाल पूछें' : 'Ask questions in Hindi, English & Punjabi using voice',
      color: 'from-emerald-500 to-green-600'
    },
    {
      icon: Camera,
      title: currentLanguage === 'hi' ? 'रोग पहचान' : 'Disease Detection',
      description: currentLanguage === 'hi' ? 'कैमरा से फसल के रोग तुरंत पहचानें' : 'Identify crop diseases instantly using camera',
      color: 'from-green-600 to-emerald-700'
    },
    {
      icon: BarChart3,
      title: currentLanguage === 'hi' ? 'बाजार भाव' : 'Market Prices',
      description: currentLanguage === 'hi' ? 'लाइव बाजार दरें और बेचने की सलाह पाएं' : 'Get live market rates and selling recommendations',
      color: 'from-yellow-600 to-orange-600'
    },
    {
      icon: Shield,
      title: currentLanguage === 'hi' ? 'मौसम चेतावनी' : 'Weather Alerts',
      description: currentLanguage === 'hi' ? 'समय पर मौसम की चेतावनी और खेती की सलाह' : 'Timely weather warnings and farming advice',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      icon: MessageCircle,
      title: currentLanguage === 'hi' ? 'AI चैटबॉट' : 'AI Chatbot',
      description: currentLanguage === 'hi' ? '24/7 खेती की सलाह और तुरंत सहायता' : '24/7 farming advice and instant support',
      color: 'from-teal-600 to-emerald-600'
    },
    {
      icon: Globe,
      title: currentLanguage === 'hi' ? 'बहु-भाषी' : 'Multi-Language',
      description: currentLanguage === 'hi' ? '3 भाषाओं में पूर्ण सहायता' : 'Complete support in 3 languages',
      color: 'from-green-700 to-emerald-800'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50 dark:from-gray-900 dark:via-green-900/20 dark:to-gray-800">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-32">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="outline" className="mb-4 bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-600/30">
                {currentLanguage === 'hi' ? '🌾 AI-संचालित स्मार्ट खेती' : '🌾 AI-Powered Smart Farming'}
              </Badge>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-green-700 via-emerald-600 to-green-800 bg-clip-text text-transparent leading-tight">
                {currentLanguage === 'hi' ? 'कृषि सहायक - स्मार्ट खेती प्लेटफॉर्म' : 'Krishi Sahayak - Smart Farming Platform'}
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
                {currentLanguage === 'hi' ? '🇮🇳 भारतीय किसानों के लिए हिंदी, अंग्रेजी और पंजाबी में AI-संचालित खेती की जानकारी' : '🇮🇳 AI-powered farming insights for Indian farmers in Hindi, English & Punjabi'}
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8 max-w-2xl mx-auto">
                <div className="text-center p-3 bg-white/90 dark:bg-gray-800/90 rounded-xl backdrop-blur-sm border border-emerald-100 dark:border-gray-700">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-700 dark:text-emerald-400">{stats.farmers}</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {currentLanguage === 'hi' ? 'किसान' : 'Farmers'}
                  </div>
                </div>
                <div className="text-center p-3 bg-white/90 dark:bg-gray-800/90 rounded-xl backdrop-blur-sm border border-green-100 dark:border-gray-700">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-700 dark:text-green-400">{stats.yieldIncrease}</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {currentLanguage === 'hi' ? 'उत्पादन वृद्धि' : 'Yield Increase'}
                  </div>
                </div>
                <div className="text-center p-3 bg-white/90 dark:bg-gray-800/90 rounded-xl backdrop-blur-sm border border-yellow-100 dark:border-gray-700">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-700 dark:text-yellow-400">{stats.languages}</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {currentLanguage === 'hi' ? 'भाषाएं' : 'Languages'}
                  </div>
                </div>
                <div className="text-center p-3 bg-white/90 dark:bg-gray-800/90 rounded-xl backdrop-blur-sm border border-orange-100 dark:border-gray-700">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-700 dark:text-orange-400">{stats.crops}</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {currentLanguage === 'hi' ? 'फसलें' : 'Crops'}
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
                <Button 
                  size="lg" 
                  onClick={handleGetStarted}
                  className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                >
                  {currentLanguage === 'hi' ? 'शुरू करें' : 'Get Started'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-900/20 font-semibold"
                  onClick={handleWatchDemo}
                >
                  <Play className="mr-2 h-4 w-4" />
                  {currentLanguage === 'hi' ? 'डेमो देखें' : 'Watch Demo'}
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="mt-8 flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-medium">{currentLanguage === 'hi' ? 'पूर्णतः निःशुल्क' : 'Completely Free'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="font-medium">{currentLanguage === 'hi' ? 'सुरक्षित डेटा' : 'Secure Data'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="font-medium">{currentLanguage === 'hi' ? 'मोबाइल फ्रेंडली' : 'Mobile Friendly'}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              {currentLanguage === 'hi' ? '🌾 मुख्य विशेषताएं' : '🌾 Key Features'}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {currentLanguage === 'hi' ? 'आधुनिक तकनीक से खेती को आसान और फायदेमंद बनाएं' : 'Make farming easier and more profitable with modern technology'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group border border-gray-200 dark:border-gray-700 shadow-md">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-12 sm:py-20 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-green-900/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                {currentLanguage === 'hi' ? '🗣️ किसान प्रशंसापत्र' : '🗣️ Farmer Testimonials'}
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
                {currentLanguage === 'hi' ? 'हजारों किसान हमारे साथ अपनी फसल की पैदावार बढ़ा रहे हैं' : 'Thousands of farmers are improving their yields with us'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full shadow-lg border-0 bg-white dark:bg-gray-800">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                        ))}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed text-sm sm:text-base italic">
                        "{testimonial.message}"
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {testimonial.farmerName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">{testimonial.farmerName}</p>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {testimonial.location} • {testimonial.cropType}
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

      {/* Final CTA */}
      <section className="py-12 sm:py-20 bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 dark:from-slate-900 dark:via-green-900 dark:to-emerald-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-20 text-6xl">🌾</div>
          <div className="absolute top-40 right-32 text-4xl">🚜</div>
          <div className="absolute bottom-20 left-32 text-5xl">🌱</div>
          <div className="absolute bottom-32 right-20 text-3xl">🌾</div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
              {currentLanguage === 'hi' ? '🌾 आज ही शुरू करें और अपनी खेती को बदलें' : '🌾 Start Today and Transform Your Farming'}
            </h2>
            <p className="text-lg sm:text-xl mb-8 text-green-100">
              {currentLanguage === 'hi' ? 'भारत के लाखों किसानों के साथ स्मार्ट कृषि की यात्रा में शामिल हों' : 'Join millions of Indian farmers in the smart agriculture revolution'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isAuthenticated ? 
                  (currentLanguage === 'hi' ? 'डैशबोर्ड पर जाएं' : 'Go to Dashboard') : 
                  (currentLanguage === 'hi' ? 'निःशुल्क खाता बनाएं' : 'Create Free Account')
                }
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => navigate('/contact')}
                className="w-full sm:w-auto border-green-300/50 text-white hover:bg-green-700/20 backdrop-blur-sm font-semibold"
              >
                {currentLanguage === 'hi' ? 'संपर्क करें' : 'Contact Us'}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Landing

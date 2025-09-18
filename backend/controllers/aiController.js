// controllers/aiController.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import DiseaseDetection from '../models/DiseaseDetection.js';
import Farmer from '../models/Farmer.js';
import { ResponseHandler } from '../utils/responseHandler.js';
import { catchAsync } from '../utils/errorHandler.js';
import { ValidationError } from '../utils/errorHandler.js';
import config from '../config/config.js';
import fs from 'fs';
import path from 'path';

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(config.geminiKey);

// Agricultural chatbot with Gemini AI
export const chatWithAI = catchAsync(async (req, res, next) => {
  const { message, conversationId } = req.body;
  
  if (!message || message.trim().length === 0) {
    throw new ValidationError('Message is required', [
      { field: 'message', message: 'Please provide a message to chat' }
    ]);
  }

  const farmer = await Farmer.findById(req.user._id);
  
  // Create agricultural context for the AI
  const agriculturalContext = `
    You are Krishi Sahayak AI, an expert agricultural advisor for Indian farmers. 
    Current farmer context:
    - Name: ${farmer?.name || 'Farmer'}
    - Location: ${farmer?.farmLocation?.state}, ${farmer?.farmLocation?.district}
    - Land Size: ${farmer?.landSize} acres
    - Current Crops: ${farmer?.currentCrops?.join(', ') || 'Not specified'}
    - Soil Type: ${farmer?.soilType || 'Not specified'}
    - Farming Experience: ${farmer?.farmingExperience || 0} years
    - Preferred Language: ${farmer?.preferredLanguage || 'hindi'}
    
    Guidelines:
    - Provide practical, actionable agricultural advice
    - Focus on Indian farming conditions and practices
    - Consider the farmer's specific context (location, crops, experience)
    - Respond in ${farmer?.preferredLanguage === 'hindi' ? 'Hindi (Devanagari script)' : 'English'}
    - Keep responses concise but informative
    - Include relevant seasonal advice when applicable
    - Suggest government schemes when relevant
    - Always prioritize farmer safety and sustainable practices
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const chat = model.startChat({
      history: [], // In production, you'd store conversation history
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });

    const prompt = agriculturalContext + "\n\nFarmer's Question: " + message;
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const aiResponse = response.text();

    // Log the conversation for analytics
    console.log(`AI Chat - User: ${req.user._id}, Message: ${message.substring(0, 50)}...`);

    ResponseHandler.success(res, {
      response: aiResponse,
      conversationId: conversationId || `chat_${Date.now()}`,
      timestamp: new Date(),
      context: {
        farmerLocation: farmer?.farmLocation?.state,
        currentCrops: farmer?.currentCrops
      }
    }, 'AI response generated successfully');

  } catch (error) {
    console.error('Gemini AI Error:', error);
    
    // Fallback responses for common queries
    const fallbackResponse = generateFallbackResponse(message, farmer);
    
    ResponseHandler.success(res, {
      response: fallbackResponse,
      conversationId: conversationId || `chat_${Date.now()}`,
      timestamp: new Date(),
      isFallback: true
    }, 'Response generated (fallback mode)');
  }
});

// Generate fallback responses when AI is unavailable
const generateFallbackResponse = (message, farmer) => {
  const messageLower = message.toLowerCase();
  const lang = farmer?.preferredLanguage || 'english';
  
  const responses = {
    english: {
      weather: "For weather information, please check the weather section in your dashboard. I recommend monitoring temperature and rainfall for your crops.",
      disease: "If you suspect plant disease, please use our disease detection feature by uploading a photo of the affected plant.",
      price: "Current market prices are available in the market section. Prices vary by location and season.",
      fertilizer: "For fertilizer advice, consider your soil type and crop requirements. Consult with local agricultural experts for specific recommendations.",
      irrigation: "Proper irrigation depends on your crop type, soil, and weather conditions. Generally, early morning watering is most effective.",
      default: "I'm currently experiencing technical difficulties. Please try again later or contact support for assistance."
    },
    hindi: {
      weather: "मौसम की जानकारी के लिए कृपया अपने डैशबोर्ड में मौसम सेक्शन देखें। अपनी फसलों के लिए तापमान और वर्षा की निगरानी करना सुझाता हूं।",
      disease: "यदि आपको पौधे की बीमारी का संदेह है, तो कृपया प्रभावित पौधे की फोटो अपलोड करके हमारी बीमारी पहचान सुविधा का उपयोग करें।",
      price: "वर्तमान बाजार मूल्य मार्केट सेक्शन में उपलब्ध हैं। मूल्य स्थान और मौसम के अनुसार अलग-अलग होते हैं।",
      fertilizer: "उर्वरक सलाह के लिए अपनी मिट्टी के प्रकार और फसल की आवश्यकताओं को ध्यान में रखें। विशिष्ट सिफारिशों के लिए स्थानीय कृषि विशेषज्ञों से सलाह लें।",
      irrigation: "उचित सिंचाई आपकी फसल के प्रकार, मिट्टी और मौसम की स्थिति पर निर्भर करती है। आम तौर पर सुबह जल्दी पानी देना सबसे प्रभावी होता है।",
      default: "मुझे अभी तकनीकी कठिनाइयों का सामना कर रहा हूं। कृपया बाद में पुनः प्रयास करें या सहायता के लिए समर्थन से संपर्क करें।"
    }
  };

  const langResponses = responses[lang] || responses.english;
  
  if (messageLower.includes('weather') || messageLower.includes('मौसम')) {
    return langResponses.weather;
  } else if (messageLower.includes('disease') || messageLower.includes('बीमारी')) {
    return langResponses.disease;
  } else if (messageLower.includes('price') || messageLower.includes('मूल्य')) {
    return langResponses.price;
  } else if (messageLower.includes('fertilizer') || messageLower.includes('उर्वरक')) {
    return langResponses.fertilizer;
  } else if (messageLower.includes('irrigation') || messageLower.includes('सिंचाई')) {
    return langResponses.irrigation;
  }
  
  return langResponses.default;
};

// Disease detection using image analysis
export const detectDiseaseFromImage = catchAsync(async (req, res, next) => {
  if (!req.uploadedFile) {
    throw new ValidationError('Image is required', [
      { field: 'diseaseImage', message: 'Please upload an image of the affected plant' }
    ]);
  }

  const { cropName, additionalInfo } = req.body;
  const imagePath = req.uploadedFile.path;

  try {
    // Read the uploaded image
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');

    // Use Gemini Vision API for disease detection
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    const prompt = `
      Analyze this plant image for diseases or health issues. Please provide:
      1. Disease identification (if any)
      2. Confidence level (as percentage)
      3. Symptoms observed
      4. Possible causes
      5. Treatment recommendations
      6. Prevention measures
      
      Additional context: 
      - Crop type: ${cropName || 'Unknown'}
      - Additional info: ${additionalInfo || 'None'}
      
      Format the response as JSON with the following structure:
      {
        "disease": "disease name or 'Healthy'",
        "confidence": confidence_percentage,
        "symptoms": ["symptom1", "symptom2"],
        "causes": ["cause1", "cause2"],
        "treatment": ["treatment1", "treatment2"],
        "prevention": ["prevention1", "prevention2"],
        "severity": "mild/moderate/severe"
      }
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: req.uploadedFile.mimetype
        }
      }
    ]);

    const response = await result.response;
    let aiAnalysis;
    
    try {
      // Try to parse JSON response
      const responseText = response.text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      aiAnalysis = jsonMatch ? JSON.parse(jsonMatch) : null;
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      aiAnalysis = null;
    }

    // Fallback analysis if AI parsing fails
    if (!aiAnalysis) {
      aiAnalysis = {
        disease: "Analysis incomplete",
        confidence: 50,
        symptoms: ["Unable to analyze automatically"],
        causes: ["Multiple factors possible"],
        treatment: ["Consult agricultural expert"],
        prevention: ["Regular monitoring recommended"],
        severity: "moderate"
      };
    }

    // Save detection results to database
    const detectionRecord = new DiseaseDetection({
      farmerId: req.user._id,
      cropName: cropName || 'Unknown',
      imageUrl: `/uploads/diseases/${req.uploadedFile.filename}`,
      originalFileName: req.uploadedFile.originalName,
      detectionResults: {
        diseaseName: aiAnalysis.disease,
        confidence: aiAnalysis.confidence,
        severity: aiAnalysis.severity,
        affectedArea: null // Could be calculated from image analysis
      },
      aiModelUsed: {
        name: 'Gemini Pro Vision',
        version: '1.0',
        accuracy: 85 // Estimated accuracy
      },
      recommendations: aiAnalysis.treatment?.map(treatment => ({
        treatment,
        priority: aiAnalysis.severity === 'severe' ? 'high' : 'medium',
        description: treatment
      })) || [],
      preventiveMeasures: aiAnalysis.prevention || [],
      followUpRequired: aiAnalysis.severity === 'severe',
      status: 'detected'
    });

    const savedDetection = await detectionRecord.save();

    ResponseHandler.created(res, {
      detectionId: savedDetection._id,
      analysis: aiAnalysis,
      imageInfo: {
        filename: req.uploadedFile.filename,
        size: req.uploadedFile.size,
        uploadedAt: new Date()
      },
      recommendations: savedDetection.recommendations,
      followUpRequired: savedDetection.followUpRequired
    }, 'Disease detection completed successfully');

  } catch (error) {
    console.error('Disease detection error:', error);
    
    // Clean up uploaded file on error
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    
    throw new Error('Unable to analyze image. Please try again with a clearer image.');
  }
});

// Get AI-powered crop recommendations
export const getAICropRecommendations = catchAsync(async (req, res, next) => {
  const farmer = await Farmer.findById(req.user._id);
  
  if (!farmer) {
    throw new ValidationError('Farmer profile required', [
      { field: 'profile', message: 'Please complete your farmer profile' }
    ]);
  }

  const { season, budget, riskTolerance } = req.query;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      As an expert agricultural AI advisor, recommend the best crops for this Indian farmer:
      
      Farmer Profile:
      - Location: ${farmer.farmLocation?.state}, ${farmer.farmLocation?.district}
      - Land Size: ${farmer.landSize} acres
      - Soil Type: ${farmer.soilType}
      - Farming Experience: ${farmer.farmingExperience} years
      - Current Crops: ${farmer.currentCrops?.join(', ') || 'None'}
      - Farming Type: ${farmer.farmingType}
      
      Additional Parameters:
      - Season: ${season || 'current'}
      - Budget Level: ${budget || 'medium'}
      - Risk Tolerance: ${riskTolerance || 'medium'}
      
      Please provide 5 crop recommendations with:
      1. Crop name
      2. Suitability score (1-10)
      3. Expected yield per acre
      4. Investment required
      5. Market potential
      6. Risk factors
      7. Specific advice for this farmer's conditions
      
      Format as JSON array.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let recommendations;
    
    try {
      const responseText = response.text();
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      recommendations = jsonMatch ? JSON.parse(jsonMatch) : null;
    } catch (parseError) {
      recommendations = null;
    }

    // Fallback recommendations if AI parsing fails
    if (!recommendations) {
      recommendations = generateFallbackCropRecommendations(farmer, season);
    }

    ResponseHandler.success(res, {
      recommendations,
      farmerContext: {
        location: farmer.farmLocation,
        landSize: farmer.landSize,
        experience: farmer.farmingExperience
      },
      parameters: { season, budget, riskTolerance },
      generatedAt: new Date()
    }, 'AI crop recommendations generated successfully');

  } catch (error) {
    console.error('AI crop recommendation error:', error);
    
    // Return fallback recommendations
    const fallbackRecommendations = generateFallbackCropRecommendations(farmer, season);
    
    ResponseHandler.success(res, {
      recommendations: fallbackRecommendations,
      isFallback: true,
      message: 'Basic recommendations provided (AI temporarily unavailable)'
    }, 'Crop recommendations retrieved successfully');
  }
});

// Generate fallback crop recommendations
const generateFallbackCropRecommendations = (farmer, season) => {
  const currentMonth = new Date().getMonth() + 1;
  const state = farmer.farmLocation?.state?.toLowerCase() || '';
  
  let seasonalCrops = [];
  
  // Basic seasonal recommendations for India
  if (season === 'kharif' || (currentMonth >= 6 && currentMonth <= 9)) {
    seasonalCrops = ['Rice', 'Cotton', 'Sugarcane', 'Soybean', 'Maize'];
  } else if (season === 'rabi' || (currentMonth >= 10 || currentMonth <= 3)) {
    seasonalCrops = ['Wheat', 'Mustard', 'Chickpea', 'Barley', 'Potato'];
  } else {
    seasonalCrops = ['Fodder crops', 'Vegetables', 'Green gram', 'Cucumber', 'Watermelon'];
  }
  
  return seasonalCrops.slice(0, 3).map((crop, index) => ({
    cropName: crop,
    suitabilityScore: 7 + index,
    expectedYield: 'Variable',
    investment: 'Medium',
    marketPotential: 'Good',
    riskFactors: ['Weather dependency', 'Market fluctuations'],
    advice: `${crop} is generally suitable for ${farmer.farmLocation?.state || 'your region'} during this season.`
  }));
};

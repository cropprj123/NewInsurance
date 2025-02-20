const GeminiService = require("../services/gemini.service");

const geminiService = new GeminiService(process.env.GEMINI_API_KEY);

// Disease-specific handler
// In controllers/gemini.controller.js - Update disease handler
exports.handleDiseaseQuery = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Invalid message format" });
    }

    const rawResponse = await geminiService.getDiseaseResponse(message);

    // Add JSON cleaning and validation
    const cleanedResponse = rawResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      const parsed = JSON.parse(cleanedResponse);
      res.json(parsed); // Direct JSON response without wrapping
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      res.status(500).json({
        error: "Invalid response format",
        details: {
          rawResponse: cleanedResponse,
          systemPrompt: systemPrompt,
        },
      });
    }
  } catch (error) {
    console.error("Disease Controller Error:", error);
    res.status(500).json({
      error: "Disease query processing failed",
      technicalDetails: error.message,
    });
  }
};

// General agriculture handler with JSON response
exports.handleGeneralQuery = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Invalid message format" });
    }

    const response = await geminiService.getGeneralResponse(message);

    try {
      // Parse Gemini's response into JSON
      const parsedResponse = JSON.parse(response);
      res.json(parsedResponse);
    } catch (jsonError) {
      // If JSON parsing fails, return the raw text
      console.warn("JSON parsing failed, returning raw response");
      res.json({
        type: "Error",
        overview: "Response format error",
        details: { rawResponse: response },
      });
    }
  } catch (error) {
    console.error("General Controller Error:", error);
    res.status(500).json({
      error: "Failed to process general agricultural query",
    });
  }
};

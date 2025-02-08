const axios = require("axios");

const translateMiddleware = async (req, res, next) => {
  const originalJson = res.json;

  res.json = async function (data) {
    try {
      const targetLanguage = req.query.lang || "en";

      // Check if the route is `/detect-crop-disease`
      const isCropDiseaseRoute = req.originalUrl.includes(
        "/detect-crop-disease"
      );

      let dataToTranslate = data;

      // If it's the crop disease route, handle recommendedProducts separately
      if (isCropDiseaseRoute && data.predictions) {
        // Extract recommendedProducts
        const recommendedProducts = data.predictions.map(
          (prediction) => prediction.info.recommendedProducts
        );

        // Remove recommendedProducts from the data to be translated
        dataToTranslate = JSON.parse(JSON.stringify(data));
        dataToTranslate.predictions.forEach((prediction) => {
          delete prediction.info.recommendedProducts;
        });

        // Translate the remaining data
        const translationResponse = await axios.post(
          "http://127.0.0.1:5000/translate",
          {
            text: JSON.stringify(dataToTranslate),
            lang: targetLanguage,
          }
        );

        // Parse the translated data
        const translatedData = JSON.parse(
          translationResponse.data.translated_text
        );

        // Reinsert the recommendedProducts field
        translatedData.predictions.forEach((prediction, index) => {
          prediction.info.recommendedProducts = recommendedProducts[index];
        });

        // Send the final response
        originalJson.call(this, translatedData);
      } else {
        // For all other routes, translate the entire data
        const translationResponse = await axios.post(
          "http://127.0.0.1:5000/translate",
          {
            text: JSON.stringify(dataToTranslate),
            lang: targetLanguage,
          }
        );

        const translatedData = JSON.parse(
          translationResponse.data.translated_text
        );
        originalJson.call(this, translatedData);
      }
    } catch (error) {
      console.error("Translation error:", error);
      originalJson.call(this, data); // Fallback to original data if translation fails
    }
  };

  next();
};

module.exports = translateMiddleware;

const { GoogleGenAI } = require('@google/genai');
const modelProduct = require('../models/ModelProducts');

async function askQuestion(question) {
    const normalizedQuestion = typeof question === 'string' ? question.trim() : '';
    if (!normalizedQuestion) return 'Bạn hãy nhập câu hỏi để Kainie hỗ trợ nhé.';

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('GEMINI_API_KEY chưa được cấu hình');

        const products = await modelProduct
            .find({})
            .select('name price slug description')
            .limit(50)
            .lean();

        const catalog = products.length
            ? products
                  .map((product) => {
                      const name = String(product.name || 'Sản phẩm').replace(/\s+/g, ' ').trim();
                      const price = Number(product.price || 0).toLocaleString('vi-VN');
                      const description = String(product.description || '')
                          .replace(/<[^>]*>/g, ' ')
                          .replace(/\s+/g, ' ')
                          .trim()
                          .slice(0, 180);
                      return `- ${name} | ${price} đ${description ? ` | ${description}` : ''}`;
                  })
                  .join('\n')
            : 'Hiện cửa hàng chưa có dữ liệu sản phẩm.';

        const storeUrl = (process.env.REACT_APP_URL_DOMAIN || 'http://localhost:3000').replace(/\/$/, '');
        const prompt = `Bạn là trợ lý chăm sóc khách hàng của Kainie Shoes Store. Hãy trả lời bằng tiếng Việt, thân thiện, ngắn gọn và chỉ dựa trên thông tin cửa hàng bên dưới. Không tự bịa giá, kích cỡ, màu sắc, tồn kho hoặc chính sách. Nếu dữ liệu chưa có, hãy nói rõ và hướng khách liên hệ cửa hàng. Không trả lời bằng HTML.

Danh mục sản phẩm hiện có:
${catalog}

Trang cửa hàng: ${storeUrl}

Câu hỏi của khách: ${normalizedQuestion}`;

        const genAI = new GoogleGenAI({ apiKey });
        const result = await genAI.models.generateContent({
            model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
            contents: prompt,
        });
        const answer = typeof result.text === 'string' ? result.text.trim() : '';
        if (!answer) throw new Error('Gemini trả về nội dung rỗng');
        return answer;
    } catch (error) {
        const detail = String(error?.message || error).replace(/AIzaSy[A-Za-z0-9_-]+/g, '[API_KEY_REDACTED]');
        console.error('Kainie chatbot request failed:', error?.status || error?.code || 'unknown', detail.slice(0, 400));
        return 'Xin lỗi, trợ lý Kainie đang tạm thời không kết nối được. Bạn có thể thử lại sau ít phút hoặc liên hệ cửa hàng để được hỗ trợ.';
    }
}

module.exports = { askQuestion };

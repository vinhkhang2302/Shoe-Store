const { GoogleGenAI } = require('@google/genai');
const modelProduct = require('../models/ModelProducts');

const productCategories = [
    { query: /chạy bộ|running|đi bộ/, product: /chạy bộ|running|đi bộ/i, label: 'giày chạy bộ' },
    { query: /bóng rổ|basketball/, product: /bóng rổ|basketball/i, label: 'giày bóng rổ' },
    { query: /đá bóng|bóng đá|football|soccer/, product: /đá bóng|bóng đá|football|soccer/i, label: 'giày đá bóng' },
    { query: /tennis|quần vợt/, product: /tennis|quần vợt/i, label: 'giày tennis' },
];

const productSearchIntent = /giày|sản phẩm|mẫu|tìm|mua|nike|adidas|giá|bao nhiêu|còn hàng/i;
const genericShoppingIntent = /hỗ trợ mua|tư vấn|muốn mua|cần mua|tìm giày|mua giày|xem giày/i;
const affordableIntent = /vừa túi tiền|hợp túi tiền|giá mềm|giá rẻ|giá phải chăng|bình dân|ngân sách|vừa ngân sách/i;

function getBudgetLimit(text) {
    const amount = text.match(/(\d+(?:[.,]\d+)?)\s*(triệu|tr|k|nghìn|ngàn)(?![\p{L}])/iu);
    const dongAmount = text.match(/\b(\d{5,})\s*(?:đ|đồng|vnd)?\b/i);
    const matchedAmount = amount || dongAmount;
    if (!matchedAmount) return null;

    const value = Number(matchedAmount[1].replace(',', '.'));
    const unit = (matchedAmount[2] || '').toLocaleLowerCase('vi-VN');
    if (unit === 'triệu' || unit === 'tr') return value * 1_000_000;
    if (unit === 'k' || unit === 'nghìn' || unit === 'ngàn') return value * 1_000;
    return value >= 10_000 ? value : value * 1_000_000;
}

function searchProductsAnswer(question, products) {
    const text = question.toLocaleLowerCase('vi-VN');
    if (!productSearchIntent.test(text)) return null;

    const category = productCategories.find(({ query }) => query.test(text));
    const wantsNike = /\bnike\b/i.test(text);
    const wantsAdidas = /\badidas\b/i.test(text);
    const budgetLimit = getBudgetLimit(text);

    if (affordableIntent.test(text) && budgetLimit === null) {
        return 'Mình sẽ lọc mẫu phù hợp ngân sách cho bạn. Bạn muốn giới hạn tối đa khoảng bao nhiêu cho một đôi giày (ví dụ 1 triệu, 2 triệu hay 3 triệu)? Nếu đã biết loại giày hoặc thương hiệu, bạn nói thêm để mình lọc chính xác hơn nhé.';
    }
    const stopWords = new Set([
        'giày', 'sản', 'phẩm', 'mẫu', 'tìm', 'mua', 'muốn', 'cần', 'cho', 'mình', 'tôi',
        'shop', 'loại', 'nào', 'các', 'với', 'giá', 'bao', 'nhiêu', 'còn', 'hàng',
        'hỗ', 'trợ', 'tư', 'vấn', 'đang', 'đôi', 'để', 'xem', 'một', 'những', 'về',
    ]);
    const searchWords = text
        .normalize('NFC')
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .split(/\s+/)
        .filter((word) => word.length > 2 && !stopWords.has(word) && word !== 'nike' && word !== 'adidas');

    const hasSpecificFilter = Boolean(category || wantsNike || wantsAdidas || searchWords.length);
    if (!hasSpecificFilter && genericShoppingIntent.test(text)) {
        return 'Mình sẵn sàng tư vấn nhé. Bạn đang tìm giày chạy bộ, bóng rổ, đá bóng hay giày đi hằng ngày? Nếu có, cho mình biết thêm thương hiệu hoặc ngân sách để lọc mẫu phù hợp.';
    }
    if (!hasSpecificFilter) return null;

    const catalog = products.filter((product) => product.name && Number(product.price) > 0);
    const results = catalog.filter((product) => {
        const searchable = `${product.name || ''} ${product.description || ''}`;
        if (category && !category.product.test(searchable)) return false;
        if (wantsNike && !/nike/i.test(searchable)) return false;
        if (wantsAdidas && !/adidas/i.test(searchable)) return false;
        if (budgetLimit !== null && Number(product.price) > budgetLimit) return false;

        // A category or brand is a sufficient filter; avoid further narrowing on filler words.
        if (category || wantsNike || wantsAdidas || searchWords.length === 0) return true;
        return searchWords.some((word) => searchable.toLocaleLowerCase('vi-VN').includes(word));
    });

    if (!results.length) {
        if (budgetLimit !== null) return `Mình chưa tìm thấy mẫu phù hợp với ngân sách tối đa ${budgetLimit.toLocaleString('vi-VN')} đ${category ? ` thuộc nhóm ${category.label}` : ''}. Bạn muốn nâng ngân sách hoặc đổi loại giày không?`;
        const requestedType = category?.label || (wantsNike && wantsAdidas ? 'giày Nike hoặc Adidas' : wantsNike ? 'giày Nike' : wantsAdidas ? 'giày Adidas' : 'mẫu giày này');
        return `Mình chưa tìm thấy ${requestedType} phù hợp trong danh mục hiện có. Bạn thử đổi từ khóa hoặc cho mình biết thêm thương hiệu nhé.`;
    }

    if (affordableIntent.test(text) || budgetLimit !== null) {
        results.sort((first, second) => Number(first.price) - Number(second.price));
    }
    const shownProducts = results.slice(0, 5);
    const lines = shownProducts.map(
        (product) => `• ${product.name} — ${Number(product.price).toLocaleString('vi-VN')} đ`,
    );
    const moreLabel = results.length > shownProducts.length ? ' Mình còn có thể tìm thêm nếu bạn muốn.' : '';
    return `Mình tìm được ${results.length} mẫu phù hợp${category ? ` thuộc nhóm ${category.label}` : ''}:\n${lines.join('\n')}\nBạn muốn xem mẫu nào?${moreLabel}`;
}

function buildLocalAnswer(question, products) {
    const text = question.toLocaleLowerCase('vi-VN');

    if (/xin chào|chào|hello|hi\b|shop ơi|alo/.test(text)) {
        return 'Xin chào! Kainie có thể giúp bạn tìm giày, xem giá, tư vấn cách chọn size và thông tin đặt hàng. Bạn đang cần tìm mẫu nào ạ?';
    }
    if (/size|kích cỡ|kích thước|chọn cỡ/.test(text)) {
        return 'Bạn nên chọn size theo chiều dài bàn chân và bảng size của hãng. Hiện dữ liệu cửa hàng chưa có bảng quy đổi size cho từng mẫu; hãy mở trang sản phẩm hoặc liên hệ cửa hàng để được xác nhận trước khi đặt nhé.';
    }
    if (/ship|vận chuyển|giao hàng|phí giao/.test(text)) {
        return 'Thông tin phí và thời gian giao hàng sẽ được hiển thị khi đặt hàng. Nếu bạn cho biết tỉnh/thành nhận hàng, cửa hàng có thể xác nhận chi tiết hơn.';
    }
    if (/đổi trả|bảo hành|hoàn tiền/.test(text)) {
        return 'Bạn vui lòng xem chính sách đổi trả/bảo hành trên website hoặc liên hệ cửa hàng để được xác nhận điều kiện áp dụng cho đơn hàng.';
    }
    if (/thanh toán|momo|vnpay|cod|chuyển khoản/.test(text)) {
        return 'Bản demo Kainie hiện chỉ hỗ trợ thanh toán khi nhận hàng (COD). MoMo và VNPay chưa được tích hợp; bạn sẽ thanh toán trực tiếp khi nhận giày.';
    }
    const productAnswer = searchProductsAnswer(question, products);
    if (productAnswer) return productAnswer;

    return 'Mình có thể hỗ trợ tìm sản phẩm và giá trong danh mục, cách chọn size, giao hàng, đổi trả và thanh toán. Bạn muốn hỏi thông tin nào?';
}

async function askQuestion(question) {
    const normalizedQuestion = typeof question === 'string' ? question.trim() : '';
    if (!normalizedQuestion) return 'Bạn hãy nhập câu hỏi để Kainie hỗ trợ nhé.';

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const products = await modelProduct
            .find({})
            .select('name price slug description')
            .limit(50)
            .lean();

        // Handle catalog queries deterministically so category requests (e.g. running shoes)
        // cannot be answered with unrelated products by the model.
        const productAnswer = searchProductsAnswer(normalizedQuestion, products);
        if (productAnswer) return productAnswer;

        // The store assistant remains useful without an external AI key or if that provider is unavailable.
        if (!apiKey) return buildLocalAnswer(normalizedQuestion, products);

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

        const prompt = `Bạn là trợ lý chăm sóc khách hàng của Kainie Shoes Store. Hãy trả lời bằng tiếng Việt, thân thiện, ngắn gọn và chỉ dựa trên thông tin cửa hàng bên dưới. Không tự bịa giá, kích cỡ, màu sắc, tồn kho hoặc chính sách. Nếu dữ liệu chưa có, hãy nói rõ và hướng khách liên hệ cửa hàng. Không trả lời bằng HTML hoặc chèn URL/đường link sản phẩm. Khi khách hỏi chung chung như cần hỗ trợ mua giày mà chưa nêu loại giày, thương hiệu hay tên mẫu, hãy hỏi thêm nhu cầu thay vì tự chọn và liệt kê sản phẩm. Nếu khách nêu loại giày cụ thể, chỉ gợi ý sản phẩm có tên hoặc mô tả đúng loại đó.

Danh mục sản phẩm hiện có:
${catalog}

Câu hỏi của khách: ${normalizedQuestion}`;

        const genAI = new GoogleGenAI({ apiKey });
        const result = await genAI.models.generateContent({
            model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
            contents: prompt,
        });
        const answer = typeof result.text === 'string' ? result.text.trim() : '';
        if (!answer) throw new Error('Gemini trả về nội dung rỗng');
        return answer;
    } catch (error) {
        const detail = String(error?.message || error).replace(/AIzaSy[A-Za-z0-9_-]+/g, '[API_KEY_REDACTED]');
        console.error('Kainie chatbot request failed:', error?.status || error?.code || 'unknown', detail.slice(0, 400));
        try {
            const products = await modelProduct.find({}).select('name price slug').limit(50).lean();
            return buildLocalAnswer(normalizedQuestion, products);
        } catch (fallbackError) {
            console.error('Kainie chatbot local fallback failed:', fallbackError?.message || fallbackError);
            return 'Trợ lý chưa đọc được danh mục sản phẩm lúc này. Bạn thử lại sau ít phút hoặc liên hệ cửa hàng để được hỗ trợ nhé.';
        }
    }
}

module.exports = { askQuestion };

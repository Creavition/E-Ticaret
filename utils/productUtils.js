// utils/productUtils.js

// Görsel eşleşmeleri
const imageMap = {
    Jacket: 'https://www.pierrecassi.com/wp-content/uploads/2015/01/Erkek-blazer-ceket-kombinasyonlari.png',
    Pants: 'https://www.dgnonline.com/jack-jones-jjiglenn-jjoriginal-sq-703-noos-erkek-jean-pantolon-gri-jean-pantolon-jackjones-12249189-262598-51-B.jpg',
    'Shoes': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?crop=entropy&cs=tinysrgb&fit=crop&h=300&w=300',
    'T-Shirt': 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?crop=entropy&cs=tinysrgb&fit=crop&h=300&w=300',
};

// Rastgele fiyat üretme
const getRandomPrice = (category) => {
    let min, max;
    switch (category) {
        case 'Jacket': min = 1500; max = 2500; break;
        case 'Pants': min = 900; max = 1300; break;
        case 'Shoes': min = 2000; max = 3000; break;
        case 'T-Shirt': min = 300; max = 500; break;
        default: return '0₺';
    }
    const price = Math.floor(Math.random() * ((max - min) / 10 + 1)) * 10 + min;
    return price + '₺';
};

// Rastgele 3 beden seç
const getRandomSizes = (allSizes) => {
    const shuffled = [...allSizes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
};

// Tüm ürünleri oluştur (sadece bir kez)
export const generateProducts = () => {
    const sizeMap = {
        'Jacket': ['S', 'M', 'L', 'XL'],
        'Pants': ['30', '32', '34', '36'],
        'T-Shirt': ['S', 'M', 'L', 'XL'],
        'Shoes': ['40', '42', '43', '44'],
    };

    const categories = Object.keys(sizeMap);
    const products = [];

    categories.forEach((category) => {
        const allSizes = sizeMap[category];
        // Her kategoriden 16 ürün oluştur
        for (let i = 1; i <= 16; i++) {
            const availableSizes = getRandomSizes(allSizes); // Rastgele 3 beden
            const displaySize = availableSizes[0]; // İlk bedeni göster

            products.push({
                id: `${category}-${i}`,
                name: `${category} ${i}`,
                image: imageMap[category],
                price: getRandomPrice(category),
                category,
                size: displaySize, // Filtreleme için kullanılacak
                availableSizes: availableSizes, // Mevcut bedenler
                allSizes: allSizes // Tüm beden seçenekleri
            });
        }
    });

    return products;
};

// Ürünleri sadece bir kez oluştur ve cache'le
let cachedProducts = null;
// Cache'i temizle - İngilizce kategoriler için
cachedProducts = null;
export const getAllProducts = () => {
    if (!cachedProducts) {
        cachedProducts = generateProducts();
    }
    return cachedProducts;
};

// Cache'i temizlemek için yardımcı fonksiyon
export const clearProductCache = () => {
    cachedProducts = null;
};

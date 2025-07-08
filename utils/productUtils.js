import AsyncStorage from '@react-native-async-storage/async-storage';

export const sizeMap = {
    'Jacket': ['S', 'M', 'L', 'XL'],
    'Pants': ['30', '32', '34', '36'],
    'T-Shirt': ['S', 'M', 'L', 'XL'],
    'Shoes': ['40', '42', '43', '44'],
};

export const categories = Object.keys(sizeMap); // sizeMap deki keyleri yani Urunlerin isimlerini dizinin icine alir.
// Görsel eşleşmeleri
const imageMap = {
    Jacket: 'https://www.pierrecassi.com/wp-content/uploads/2015/01/Erkek-blazer-ceket-kombinasyonlari.png',
    Pants: 'https://www.dgnonline.com/jack-jones-jjiglenn-jjoriginal-sq-703-noos-erkek-jean-pantolon-gri-jean-pantolon-jackjones-12249189-262598-51-B.jpg',
    'Shoes': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?crop=entropy&cs=tinysrgb&fit=crop&h=300&w=300',
    'T-Shirt': 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?crop=entropy&cs=tinysrgb&fit=crop&h=300&w=300',
};

// Kategoriye Gore rastgele fiyat üretme
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

// Tum bedenlerden(allSizes) Rastgele 3 beden seç
const getRandomSizes = (allSizes) => {
    const shuffled = [...allSizes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
};

// Dile göre ürün ismini al
const getProductName = (category, index, language = 'en') => {
    const names = {
        en: {
            'Jacket': ['Business Jacket', 'Casual Blazer', 'Winter Coat', 'Denim Jacket', 'Leather Jacket', 'Sports Jacket', 'Formal Blazer', 'Bomber Jacket', 'Windbreaker', 'Hoodie Jacket', 'Varsity Jacket', 'Puffer Jacket', 'Trench Coat', 'Peacoat', 'Field Jacket', 'Track Jacket'],
            'Pants': ['Slim Jeans', 'Cargo Pants', 'Chino Pants', 'Dress Pants', 'Joggers', 'Straight Jeans', 'Skinny Jeans', 'Wide Leg Pants', 'Bootcut Jeans', 'Sweatpants', 'Formal Trousers', 'Khaki Pants', 'Corduroy Pants', 'Linen Pants', 'Track Pants', 'Cropped Pants'],
            'Shoes': ['Running Shoes', 'Casual Sneakers', 'Dress Shoes', 'Boots', 'Loafers', 'Canvas Shoes', 'High Tops', 'Sandals', 'Oxfords', 'Moccasins', 'Hiking Boots', 'Basketball Shoes', 'Tennis Shoes', 'Slip-ons', 'Boat Shoes', 'Combat Boots'],
            'T-Shirt': ['Basic Tee', 'Graphic T-Shirt', 'Polo Shirt', 'V-Neck Tee', 'Henley Shirt', 'Long Sleeve Tee', 'Striped Shirt', 'Vintage Tee', 'Sports Tee', 'Plain T-Shirt', 'Printed Tee', 'Crew Neck Tee', 'Pocket Tee', 'Fitted Tee', 'Oversized Tee', 'Tank Top']
        },
        tr: {
            'Jacket': ['İş Ceketi', 'Günlük Blazer', 'Kış Montu', 'Kot Ceket', 'Deri Ceket', 'Spor Ceketi', 'Resmi Blazer', 'Bomber Ceket', 'Rüzgarlık', 'Kapüşonlu Ceket', 'Varsity Ceket', 'Şişme Mont', 'Trençkot', 'Palto', 'Arazi Ceketi', 'Eşofman Ceketi'],
            'Pants': ['Dar Kot', 'Kargo Pantolon', 'Chino Pantolon', 'Kumaş Pantolon', 'Eşofman Altı', 'Düz Kot', 'Skinny Kot', 'Bol Paça Pantolon', 'İspanyol Paça', 'Sweatpants', 'Resmi Pantolon', 'Haki Pantolon', 'Kadife Pantolon', 'Keten Pantolon', 'Antrenman Pantolonu', 'Kısa Paça Pantolon'],
            'Shoes': ['Koşu Ayakkabısı', 'Günlük Spor Ayakkabı', 'Klasik Ayakkabı', 'Bot', 'Loafer', 'Kanvas Ayakkabı', 'Yüksek Bilek', 'Sandalet', 'Oxford Ayakkabı', 'Mokasen', 'Trekking Botu', 'Basketbol Ayakkabısı', 'Tenis Ayakkabısı', 'Terlik', 'Tekne Ayakkabısı', 'Muharebe Botu'],
            'T-Shirt': ['Basic Tişört', 'Grafik Tişört', 'Polo Tişört', 'V Yaka Tişört', 'Henley Tişört', 'Uzun Kol Tişört', 'Çizgili Tişört', 'Vintage Tişört', 'Spor Tişört', 'Düz Tişört', 'Baskılı Tişört', 'Bisiklet Yaka', 'Cepli Tişört', 'Dar Kesim Tişört', 'Oversize Tişört', 'Atlet']
        }
    };

    return names[language][category][index - 1] || `${category} ${index}`;
    // Eger names[language][category][index - 1] varsa onu don yoksa `${category} ${index}` don 
};

// Dil tercihini al
const getCurrentLanguage = async () => {
    try {
        const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
        return savedLanguage || 'en';
    } catch (error) {
        return 'en';
    }
};

// Tüm ürünleri oluştur (dil desteği ile)
export const generateProducts = async () => {
    const language = await getCurrentLanguage();

    const products = [];

    categories.forEach((category) => {
        const allSizes = sizeMap[category];
        // Her kategoriden 16 ürün oluştur
        for (let i = 1; i <= 16; i++) {
            const availableSizes = getRandomSizes(allSizes); // Rastgele 3 beden
            const displaySize = availableSizes[0]; // İlk bedeni göster

            products.push({
                id: `${category}-${i}`,
                name: getProductName(category, i, language),
                image: imageMap[category], //resim linkine ulasma
                price: getRandomPrice(category), // kategoriye gore belirlenen fiyat araliginda rastgele fiyat olusturma
                category, // category: category yaziminin kisaltilmisidir.
                size: displaySize, // Ilk beden
                availableSizes: availableSizes, // Mevcut bedenler
                allSizes: allSizes // Tüm beden seçenekleri
            });
        }
    });

    return products;
};

// Ürünleri cache'le ve dil değişikliklerini takip et
let cachedProducts = null;
let cachedLanguage = null;

export const getAllProducts = async () => {
    const currentLanguage = await getCurrentLanguage();

    // Dil değişmişse urunAdlari degisecegi icin cache'i temizle
    if (cachedLanguage !== currentLanguage) {
        cachedProducts = null;
        cachedLanguage = currentLanguage;
    }

    //Dil degismisse ve cachedProducts bossa generateProducts() fonksiyonuyla urun
    if (!cachedProducts) {
        cachedProducts = await generateProducts();
    }

    return cachedProducts;
};

// Cache'i temizlemek için yardımcı fonksiyon
export const clearProductCache = () => {
    cachedProducts = null;
    cachedLanguage = null;
};

// Dil değiştiğinde ürünleri yeniden yükle
export const refreshProductsForLanguage = async () => {
    clearProductCache();
    return await getAllProducts();
};
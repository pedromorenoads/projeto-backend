'use strict';

const {
  Product,
  ProductImage,
  ProductOption,
  ProductCategory,
  Category,
} = require('../../models');

const IMAGE_DIR = '/seed-images';

const extraImages = [
  'produc-image-1.jpeg',
  'produc-image-2.jpeg',
  'produc-image-3.jpeg',
  'produc-image-4.jpeg',
  'produc-image-5.jpeg',
  'product-thumb-1.jpeg',
  'product-thumb-2.jpeg',
  'product-thumb-3.jpeg',
  'product-thumb-4.jpeg',
  'product-thumb-5.jpeg',
];

function buildImages(mainImage) {
  const others = extraImages.filter((image) => image !== mainImage).slice(0, 4);
  return [mainImage, ...others].map((image) => `${IMAGE_DIR}/${image}`);
}

// Espelha o catálogo usado pelo front-end para a integração ficar consistente.
const products = [
  {
    name: "Air Jordan 1 Retro High OG 'Chicago'",
    slug: 'air-jordan-1-retro-high-chicago',
    brand: 'Jordan',
    gender: 'Masculino',
    categorySlug: 'tenis',
    price: 1299.9,
    price_with_discount: 999.9,
    rating: 4.9,
    reviews: 132,
    image: 'product-thumb-2.jpeg',
    description:
      'O clássico que dispensa apresentações. Cabedal em couro premium, combinação icônica de vermelho, preto e branco e amortecimento Air no calcanhar. Uma peça que funciona tanto no dia a dia quanto na coleção.',
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: ['#d62828', '#ffffff', '#1f1f1f'],
  },
  {
    name: "Air Jordan 1 Mid 'White University Red'",
    slug: 'air-jordan-1-mid-white-red',
    brand: 'Jordan',
    gender: 'Masculino',
    categorySlug: 'tenis',
    price: 899.9,
    price_with_discount: 719.9,
    rating: 4.7,
    reviews: 96,
    image: 'product-thumb-1.jpeg',
    description:
      'Silhueta inspirada no modelo de 1985, com cabedal em couro e detalhes em vermelho. O cano médio deixa o visual mais versátil para combinar com calça jeans, short ou alfaiataria.',
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: ['#ffffff', '#d62828', '#1f1f1f'],
  },
  {
    name: "Levi's Skate Tênis Couro",
    slug: 'levis-skate-brown',
    brand: "Levi's",
    gender: 'Unissex',
    categorySlug: 'casual',
    price: 349.9,
    price_with_discount: 349.9,
    rating: 4.5,
    reviews: 58,
    image: 'product-thumb-3.jpeg',
    description:
      'Tênis de skate com cabedal em couro marrom escuro e solado vulcanizado. A palmilha acolchoada segura a onda nos rolês e o design discreto combina com qualquer look.',
    sizes: ['37', '38', '39', '40', '41', '42', '43'],
    colors: ['#6b4226', '#1f1f1f'],
  },
  {
    name: 'Saucony Jazz Original Vintage',
    slug: 'saucony-jazz-original-teal',
    brand: 'Saucony',
    gender: 'Unissex',
    categorySlug: 'corrida',
    price: 499.9,
    price_with_discount: 399.9,
    rating: 4.6,
    reviews: 71,
    image: 'product-thumb-4.jpeg',
    description:
      'Um clássico dos anos 80 que voltou com tudo. Mix de suede e nylon, detalhes em verde e laranja e entressola EVA para garantir conforto o dia inteiro.',
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
    colors: ['#1d6f6d', '#d97a38', '#e8e1d5'],
  },
  {
    name: 'Nike Air Zoom Rival Fly Verde',
    slug: 'nike-air-zoom-neon',
    brand: 'Nike',
    gender: 'Masculino',
    categorySlug: 'corrida',
    price: 749.9,
    price_with_discount: 749.9,
    rating: 4.8,
    reviews: 43,
    image: 'product-thumb-5.jpeg',
    description:
      'Feito para corridas leves e treinos na academia. Cabedal em mesh respirável, espuma responsiva e um toque de verde neon que não passa despercebido.',
    sizes: ['38', '39', '40', '41', '42', '43', '44', '45'],
    colors: ['#c6f432', '#ffffff', '#1f1f1f'],
  },
  {
    name: 'Nike Dunk High Premium Salmon',
    slug: 'nike-dunk-high-salmon',
    brand: 'Nike',
    gender: 'Feminino',
    categorySlug: 'tenis',
    price: 899.9,
    price_with_discount: 749.9,
    rating: 4.9,
    reviews: 210,
    image: 'produc-image-3.jpeg',
    description:
      'Cano alto com combinação de rosa salmão, azul claro e bege. O cabedal em suede e a entressola gum entregam um visual retrô que combina fácil com peças neutras.',
    sizes: ['34', '35', '36', '37', '38', '39', '40'],
    colors: ['#e9a08a', '#bfd7ea', '#efe6c8'],
  },
  {
    name: 'Converse Chuck 70 Hi Bege',
    slug: 'converse-chuck-70-beige',
    brand: 'Converse',
    gender: 'Unissex',
    categorySlug: 'casual',
    price: 429.9,
    price_with_discount: 429.9,
    rating: 4.7,
    reviews: 187,
    image: 'produc-image-4.jpeg',
    description:
      'Versão premium do Chuck Taylor, com lona mais grossa, costura reforçada e solado de borracha. O bege envelhece bem e acompanha qualquer estilo.',
    sizes: ['34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44'],
    colors: ['#d9ceb2', '#ffffff'],
  },
  {
    name: 'Nike Air Max 1 Branco Laranja',
    slug: 'nike-air-max-1-orange',
    brand: 'Nike',
    gender: 'Masculino',
    categorySlug: 'corrida',
    price: 699.9,
    price_with_discount: 599.9,
    rating: 4.8,
    reviews: 154,
    image: 'produc-image-5.jpeg',
    description:
      'O primeiro tênis com unidade Air visível completa 35 anos e continua atual. Base branca, detalhes em laranja e amortecimento que você sente no primeiro passo.',
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: ['#f26b3a', '#ffffff', '#1f1f1f'],
  },
  {
    name: "Air Jordan 1 High 'Pine Green'",
    slug: 'air-jordan-1-pine-green',
    brand: 'Jordan',
    gender: 'Masculino',
    categorySlug: 'tenis',
    price: 1199.9,
    price_with_discount: 1199.9,
    rating: 4.9,
    reviews: 88,
    image: 'produc-image-1.jpeg',
    description:
      'Combinação de cinza, verde e amarelo em um dos modelos mais desejados dos últimos anos. Couro macio, cano alto e muita personalidade.',
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: ['#2e6b4f', '#c9c9c9', '#e8b93a'],
  },
  {
    name: 'Adidas Originals Bege Premium',
    slug: 'adidas-originals-beige',
    brand: 'Adidas',
    gender: 'Unissex',
    categorySlug: 'casual',
    price: 579.9,
    price_with_discount: 489.9,
    rating: 4.6,
    reviews: 64,
    image: 'produc-image-2.jpeg',
    description:
      'Modelo casual com cabedal em couro bege e solado branco. Minimalista na medida, é a escolha certa para quem gosta de um visual limpo sem abrir mão do conforto.',
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43'],
    colors: ['#c7b299', '#ffffff'],
  },
];

module.exports = {
  async up() {
    const categoryRows = await Category.findAll({
      attributes: ['id', 'slug'],
      raw: true,
    });
    const categoryBySlug = new Map(
      categoryRows.map((category) => [category.slug, category.id])
    );

    for (const item of products) {
      const product = await Product.create({
        enabled: true,
        name: item.name,
        slug: item.slug,
        use_in_menu: true,
        stock: 20,
        description: item.description,
        price: item.price,
        price_with_discount: item.price_with_discount,
        brand: item.brand,
        gender: item.gender,
        rating: item.rating,
        reviews: item.reviews,
      });

      await ProductImage.bulkCreate(
        buildImages(item.image).map((imagePath) => ({
          product_id: product.id,
          enabled: true,
          path: imagePath,
        }))
      );

      await ProductOption.bulkCreate([
        {
          product_id: product.id,
          title: 'Tamanhos',
          shape: 'square',
          radius: 4,
          type: 'text',
          values: item.sizes.join(','),
        },
        {
          product_id: product.id,
          title: 'Cores',
          shape: 'circle',
          radius: 0,
          type: 'color',
          values: item.colors.join(','),
        },
      ]);

      const categoryId = categoryBySlug.get(item.categorySlug);
      if (categoryId) {
        await ProductCategory.create({
          product_id: product.id,
          category_id: categoryId,
        });
      }
    }
  },

  async down() {
    const slugs = products.map((product) => product.slug);
    const rows = await Product.findAll({
      where: { slug: slugs },
      attributes: ['id'],
      raw: true,
    });
    const ids = rows.map((row) => row.id);

    if (!ids.length) {
      return;
    }

    await ProductImage.destroy({ where: { product_id: ids } });
    await ProductOption.destroy({ where: { product_id: ids } });
    await ProductCategory.destroy({ where: { product_id: ids } });
    await Product.destroy({ where: { id: ids } });
  },
};

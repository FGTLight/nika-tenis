/**
 * Seed inicial – Nika Tênis
 * Rode com: npm run db:seed  (ou npm run db:setup para criar o banco + seed)
 *
 * ⚠️  Tudo marcado com [COMPLETAR] é placeholder: troque aqui ou pelo painel /admin.
 *     Os produtos são exemplos — substitua pelos modelos reais da loja.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  {
    name: 'Runner Pulse',
    slug: 'runner-pulse',
    brand: 'Linha Esportiva',
    description: 'Tênis de corrida leve com entressola macia e cabedal em mesh respirável. Ideal para treinos diários.',
    category: 'esportivo',
    price: 299.9,
    wholesalePrice: 189.9,
    sizes: '37,38,39,40,41,42,43',
    featured: true,
    isNew: true,
    colorPrimary: '#F2EFE9',
    colorSecondary: '#1A1A1A',
    colorAccent: '#FF4F9A',
  },
  {
    name: 'Street Classic',
    slug: 'street-classic',
    brand: 'Linha Urbana',
    description: 'O clássico urbano de cano baixo que combina com tudo. Solado vulcanizado e couro sintético premium.',
    category: 'masculino',
    price: 249.9,
    wholesalePrice: 159.9,
    sizes: '38,39,40,41,42,43,44',
    featured: true,
    isNew: false,
    colorPrimary: '#FFFFFF',
    colorSecondary: '#0B0B0B',
    colorAccent: '#FF5A1F',
  },
  {
    name: 'Cloud Walk',
    slug: 'cloud-walk',
    brand: 'Linha Conforto',
    description: 'Conforto o dia inteiro: palmilha em espuma de memória e solado flexível. Perfeito para quem fica em pé.',
    category: 'feminino',
    price: 279.9,
    wholesalePrice: 174.9,
    sizes: '34,35,36,37,38,39',
    featured: true,
    isNew: true,
    colorPrimary: '#F7D6E0',
    colorSecondary: '#FFFFFF',
    colorAccent: '#B0A8FF',
  },
  {
    name: 'Mini Jump',
    slug: 'mini-jump',
    brand: 'Linha Kids',
    description: 'Tênis infantil com fechamento em velcro, biqueira reforçada e solado antiderrapante.',
    category: 'infantil',
    price: 159.9,
    wholesalePrice: 99.9,
    sizes: '24,25,26,27,28,29,30,31,32,33',
    featured: true,
    isNew: false,
    colorPrimary: '#5EC8FF',
    colorSecondary: '#FFE14D',
    colorAccent: '#FF5A1F',
  },
  {
    name: 'Volt High',
    slug: 'volt-high',
    brand: 'Linha Urbana',
    description: 'Cano alto com visual de quadra, colarinho acolchoado e detalhes em verde neon.',
    category: 'masculino',
    price: 349.9,
    wholesalePrice: 219.9,
    sizes: '38,39,40,41,42,43',
    featured: false,
    isNew: true,
    colorPrimary: '#1A1A1A',
    colorSecondary: '#2B2B2B',
    colorAccent: '#FF4F9A',
  },
  {
    name: 'Aura Knit',
    slug: 'aura-knit',
    brand: 'Linha Conforto',
    description: 'Cabedal em knit que abraça o pé como uma meia. Leve, estiloso e fácil de calçar.',
    category: 'feminino',
    price: 229.9,
    wholesalePrice: 144.9,
    sizes: '34,35,36,37,38,39',
    featured: false,
    isNew: false,
    colorPrimary: '#E8E3D9',
    colorSecondary: '#C9BFAE',
    colorAccent: '#FF5A1F',
  },
  {
    name: 'Trail Grip',
    slug: 'trail-grip',
    brand: 'Linha Esportiva',
    description: 'Solado com cravos para trilha e terrenos irregulares. Cabedal resistente à água.',
    category: 'esportivo',
    price: 379.9,
    wholesalePrice: 239.9,
    sizes: '38,39,40,41,42,43,44',
    featured: true,
    isNew: false,
    colorPrimary: '#5B6B3A',
    colorSecondary: '#2A2A2A',
    colorAccent: '#FF5A1F',
  },
  {
    name: 'Skate Low',
    slug: 'skate-low',
    brand: 'Linha Urbana',
    description: 'Inspirado no skate: biqueira reforçada, sola de borracha aderente e muito estilo de rua.',
    category: 'masculino',
    price: 199.9,
    wholesalePrice: 124.9,
    sizes: '37,38,39,40,41,42,43',
    featured: false,
    isNew: false,
    colorPrimary: '#8B5E3C',
    colorSecondary: '#F2EFE9',
    colorAccent: '#0B0B0B',
  },
  {
    name: 'Glow Kids',
    slug: 'glow-kids',
    brand: 'Linha Kids',
    description: 'Divertido e resistente, com detalhes refletivos para a criançada brincar com segurança.',
    category: 'infantil',
    price: 139.9,
    wholesalePrice: 89.9,
    sizes: '22,23,24,25,26,27,28,29,30',
    featured: false,
    isNew: true,
    colorPrimary: '#FFFFFF',
    colorSecondary: '#FF7AB6',
    colorAccent: '#FF4F9A',
  },
  {
    name: 'Platform Chunky',
    slug: 'platform-chunky',
    brand: 'Linha Urbana',
    description: 'Solado plataforma que alonga a silhueta. O queridinho das produções streetwear.',
    category: 'feminino',
    price: 319.9,
    wholesalePrice: 199.9,
    sizes: '34,35,36,37,38,39,40',
    featured: true,
    isNew: true,
    colorPrimary: '#FFFFFF',
    colorSecondary: '#EDEDED',
    colorAccent: '#0B0B0B',
  },
  {
    name: 'Court Pro',
    slug: 'court-pro',
    brand: 'Linha Esportiva',
    description: 'Feito para quadra: estabilidade lateral, amortecimento no calcanhar e solado de alta tração.',
    category: 'esportivo',
    price: 329.9,
    wholesalePrice: 209.9,
    sizes: '38,39,40,41,42,43,44',
    featured: false,
    isNew: false,
    colorPrimary: '#1E3A8A',
    colorSecondary: '#FFFFFF',
    colorAccent: '#FF5A1F',
  },
  {
    name: 'Daily Slip',
    slug: 'daily-slip',
    brand: 'Linha Conforto',
    description: 'Slip-on sem cadarço para o dia a dia. Calça em segundos e vai com qualquer look.',
    category: 'masculino',
    price: 179.9,
    wholesalePrice: 109.9,
    sizes: '38,39,40,41,42,43,44',
    featured: false,
    isNew: false,
    colorPrimary: '#3A3A3A',
    colorSecondary: '#0B0B0B',
    colorAccent: '#F2EFE9',
  },
];

// [COMPLETAR] Substitua pelas avaliações reais (Google, Facebook, WhatsApp...).
const reviews = [
  { author: '[COMPLETAR] Nome do cliente', city: 'Erechim/RS', rating: 5, text: '[COMPLETAR] Depoimento real do cliente sobre o atendimento e os tênis.' },
  { author: '[COMPLETAR] Nome do cliente', city: 'Erechim/RS', rating: 5, text: '[COMPLETAR] Depoimento real de um cliente de varejo.' },
  { author: '[COMPLETAR] Nome do revendedor', city: '[COMPLETAR] Cidade/UF', rating: 5, text: '[COMPLETAR] Depoimento real de um revendedor do atacado.' },
  { author: '[COMPLETAR] Nome do cliente', city: 'Erechim/RS', rating: 4, text: '[COMPLETAR] Depoimento real do cliente.' },
];

const storeInfo = {
  id: 1,
  name: 'Nika Tênis',
  address: 'R. Angelo Chiochetta, 94 (fundos) – Jabuticabal',
  city: 'Erechim/RS · CEP 99712-332',
  phone: '(54) 98132-3241',
  // Só dígitos com DDD. Usado nos links do WhatsApp (o 55 do Brasil é adicionado automaticamente).
  whatsapp: '54981323241',
  email: '[COMPLETAR]',
  latitude: -27.6370527,
  longitude: -52.3100348,
  facebook: 'https://www.facebook.com/nikatenisvarejoatacado',
  instagram: '[COMPLETAR]',
  hours: JSON.stringify([
    { days: 'Segunda', time: '13h às 18h' },
    { days: 'Terça a Sexta', time: '8h30 às 11h30 · 13h30 às 18h' },
    { days: 'Sábado', time: '8h30 às 11h30 · 13h30 às 16h40' },
    // Conforme o Google Maps — confirmar com a loja
    { days: 'Domingo', time: 'Aberto 24 horas' },
  ]),
  // [COMPLETAR] Números exibidos nos contadores da seção Atacado — ajuste para os reais.
  stats: JSON.stringify([
    { value: 100, suffix: '+', label: 'Modelos em estoque' },
    { value: 50, suffix: '+', label: 'Revendedores parceiros' },
    { value: 27, label: 'Estados atendidos' },
  ]),
};

async function main() {
  // --if-empty: usado no start de produção. Só popula um banco novo/vazio
  // (ex.: disco apagado no plano grátis do Render) e nunca apaga dados existentes.
  if (process.argv.includes('--if-empty')) {
    const count = await prisma.product.count();
    if (count > 0 || (await prisma.storeInfo.findUnique({ where: { id: 1 } }))) {
      console.log(`🌱 Banco já tem dados (${count} produtos) — seed ignorado.`);
      return;
    }
  }

  console.log('🌱 Limpando e populando o banco...');

  await prisma.product.deleteMany();
  await prisma.review.deleteMany();

  await prisma.product.createMany({ data: products });
  await prisma.review.createMany({ data: reviews });
  await prisma.storeInfo.upsert({ where: { id: 1 }, update: storeInfo, create: storeInfo });

  console.log(`✅ ${products.length} produtos, ${reviews.length} avaliações e dados da loja criados.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

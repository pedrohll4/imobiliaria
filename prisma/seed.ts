import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed do banco de dados focado em Rondônia (RO)...");

  // Limpar tabelas existentes
  await prisma.lead.deleteMany();
  await prisma.propertyFeature.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.property.deleteMany();
  await prisma.broker.deleteMany();
  await prisma.user.deleteMany();

  // Senhas hash
  const adminPassword = await bcrypt.hash("admin123", 10);
  const brokerPassword = await bcrypt.hash("corretor123", 10);

  // 1. Administrador Geral
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@vanguard.com.br",
      passwordHash: adminPassword,
      name: "Diretoria Executiva",
      role: "ADMIN",
    },
  });

  // 2. Corretores de Elite de Rondônia
  const userHelena = await prisma.user.create({
    data: {
      email: "helena@vanguard.com.br",
      passwordHash: brokerPassword,
      name: "Helena Vianna",
      role: "BROKER",
    },
  });

  const brokerHelena = await prisma.broker.create({
    data: {
      userId: userHelena.id,
      name: "Helena Vianna",
      email: "helena@vanguard.com.br",
      phone: "(69) 99245-8000",
      whatsapp: "5569992458000",
      creci: "RO 3.421-F",
      photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
      bio: "Mais de 14 anos de atuação no mercado imobiliário ultra-prime de Rondônia. Especialista em residências no Alphaville Porto Velho, Ecoville e coberturas panorâmicas no Bairro Olaria.",
    },
  });

  const userRodrigo = await prisma.user.create({
    data: {
      email: "rodrigo@vanguard.com.br",
      passwordHash: brokerPassword,
      name: "Rodrigo Montenegro",
      role: "BROKER",
    },
  });

  const brokerRodrigo = await prisma.broker.create({
    data: {
      userId: userRodrigo.id,
      name: "Rodrigo Montenegro",
      email: "rodrigo@vanguard.com.br",
      phone: "(69) 99312-4500",
      whatsapp: "5569993124500",
      creci: "RO 4.108-F",
      photoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
      bio: "Engenheiro agrônomo e consultor imobiliário sênior. Especialista em grandes fazendas de grãos, gado de elite e haras no Vale do Jamari, Ji-Paraná, Cacoal e Cone Sul de Rondônia.",
    },
  });

  const userCamila = await prisma.user.create({
    data: {
      email: "camila@vanguard.com.br",
      passwordHash: brokerPassword,
      name: "Camila Alencar",
      role: "BROKER",
    },
  });

  const brokerCamila = await prisma.broker.create({
    data: {
      userId: userCamila.id,
      name: "Camila Alencar",
      email: "camila@vanguard.com.br",
      phone: "(69) 99288-7711",
      whatsapp: "5569992887711",
      creci: "RO 2.894-F",
      photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80",
      bio: "Arquiteta e consultora imobiliária de luxo em Cacoal e Ji-Paraná. Especialista em mansões contemporâneas em condomínios fechados como Bosque dos Ipês e residências de veraneio.",
    },
  });

  console.log("Usuários e corretores de Rondônia criados com sucesso.");

  // 3. Imóveis de Alto Padrão em Rondônia
  const propertiesData = [
    {
      code: "RO-1001",
      title: "Mansão Origami Alphaville Porto Velho",
      slug: "mansao-origami-alphaville-porto-velho",
      description:
        "Espetacular residência de arquitetura contemporânea no prestigiado condomínio Alphaville Porto Velho. Projeto assinado com volumetria arrojada em concreto aparente e brises em madeira teca sustentável. Living monumental com pé-direito duplo de 6,80m integrado ao espaço gourmet e à piscina com borda infinita aquecida. Automação residencial completa Control4, climatização dutada inverter em todos os ambientes e adega envidraçada para 600 garrafas.",
      type: "CONDOMINIO",
      purpose: "VENDA",
      price: 8900000,
      condoFee: 1450,
      propertyTax: 8500,
      city: "Porto Velho",
      state: "RO",
      neighborhood: "Alphaville",
      address: "Alameda dos Jatobás, Alphaville Porto Velho",
      number: "182",
      zipCode: "76824-700",
      bedrooms: 5,
      suites: 5,
      bathrooms: 7,
      parkingSpaces: 6,
      builtArea: 680,
      totalArea: 1100,
      status: "PUBLICADO",
      isFeatured: true,
      brokerId: brokerHelena.id,
      images: [
        { url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80", isMain: true, order: 1, alt: "Fachada contemporânea Alphaville Porto Velho" },
        { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80", isMain: false, order: 2, alt: "Living com pé direito duplo" },
        { url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80", isMain: false, order: 3, alt: "Área de lazer com piscina de borda infinita" },
        { url: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=80", isMain: false, order: 4, alt: "Cozinha gourmet de alta precisão" },
      ],
      features: [
        { name: "Piscina com borda infinita aquecida", category: "Lazer" },
        { name: "Adega climatizada para 600 garrafas", category: "Lazer" },
        { name: "Automação residencial completa", category: "Tecnologia" },
        { name: "Energia solar fotovoltaica com microinversores", category: "Sustentabilidade" },
        { name: "Segurança armada 24h e portaria blindada", category: "Segurança" },
        { name: "Brises em madeira nobre certificada", category: "Arquitetura" },
      ],
    },
    {
      code: "RO-1002",
      title: "Vila Náutica Privativa Rio Madeira",
      slug: "vila-nautica-privativa-rio-madeira",
      description:
        "Verdadeiro santuário arquitetônico às margens do Rio Madeira em Porto Velho. Propriedade singular com píer náutico privativo homologado para embarcações e jet-skis, heliponto particular gramado e 8.500m² de parque privativo com espécies nativas preservadas. A residência principal é em balanço, com amplas galerias de vidro que emolduram as águas do Rio Madeira e um pôr do sol inigualável da Amazônia.",
      type: "CASA",
      purpose: "VENDA",
      price: 14500000,
      condoFee: null,
      propertyTax: 12000,
      city: "Porto Velho",
      state: "RO",
      neighborhood: "Rio Madeira",
      address: "Estrada do Belmonte, Margens do Rio Madeira",
      number: "S/N",
      zipCode: "76807-000",
      bedrooms: 6,
      suites: 6,
      bathrooms: 8,
      parkingSpaces: 10,
      builtArea: 950,
      totalArea: 8500,
      status: "PUBLICADO",
      isFeatured: true,
      brokerId: brokerHelena.id,
      images: [
        { url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80", isMain: true, order: 1, alt: "Vista panorâmica do píer privativo e piscina suspensa" },
        { url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80", isMain: false, order: 2, alt: "Arquitetura monumental integrada à mata nativa" },
        { url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80", isMain: false, order: 3, alt: "Espaço gourmet de contemplação do rio" },
      ],
      features: [
        { name: "Píer privativo de atracação para lanchas", category: "Exclusividade" },
        { name: "Heliponto particular homologado", category: "Exclusividade" },
        { name: "Piscina semiolímpica com deck molhado em Cumaru", category: "Lazer" },
        { name: "Casa de hóspedes e casa de caseiro independentes", category: "Infraestrutura" },
        { name: "Gerador a diesel Cummins silencioso 150kVA", category: "Tecnologia" },
      ],
    },
    {
      code: "RO-1003",
      title: "Penthouse Duplex Bauhaus no Bairro Olaria",
      slug: "penthouse-duplex-bauhaus-bairro-olaria",
      description:
        "O ápice da sofisticação vertical em Porto Velho. Cobertura duplex com 520m² de área privativa no ponto mais alto e nobre do Bairro Olaria. No pavimento superior, um terraço cinematográfico com piscina aquecida suspensa com visor de vidro, solarium com pergolado em aço corten e lounge gourmet com chopeira embutida e churrasqueira parrilla argentina. No pavimento inferior, 4 amplas suítes com piso em madeira maciça Cumaru e suíte master com sala de banho em mármore Calacatta.",
      type: "COBERTURA",
      purpose: "VENDA",
      price: 5400000,
      condoFee: 2800,
      propertyTax: 6200,
      city: "Porto Velho",
      state: "RO",
      neighborhood: "Olaria",
      address: "Rua Duque de Caxias, Bairro Olaria",
      number: "1420",
      zipCode: "76801-200",
      bedrooms: 4,
      suites: 4,
      bathrooms: 6,
      parkingSpaces: 5,
      builtArea: 520,
      totalArea: 520,
      status: "PUBLICADO",
      isFeatured: true,
      brokerId: brokerHelena.id,
      images: [
        { url: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80", isMain: true, order: 1, alt: "Piscina suspensa na cobertura duplex Olaria" },
        { url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=80", isMain: false, order: 2, alt: "Living com vista panorâmica da capital" },
        { url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80", isMain: false, order: 3, alt: "Suíte master com closet duplo" },
      ],
      features: [
        { name: "Piscina suspensa privativa com visor de vidro", category: "Lazer" },
        { name: "Vista panorâmica 360° de Porto Velho", category: "Exclusividade" },
        { name: "Elevador privativo com biometria facial", category: "Segurança" },
        { name: "5 vagas soltas de garagem com tomada para carro elétrico", category: "Infraestrutura" },
      ],
    },
    {
      code: "RO-1004",
      title: "Residência Bioclimática no Ecoville Porto Velho",
      slug: "residencia-bioclimatica-ecoville-porto-velho",
      description:
        "Projetada para valorizar o clima tropical com conforto térmico e eficiência luminosa. Volumes puros, brises pivotantes e ventilação cruzada natural com ampla integração com jardim privativo. 4 suítes, sendo a master com banheira de imersão esculpida em pedra natural vulcânica e terraço privativo voltado para a mata nativa preservada do condomínio.",
      type: "CONDOMINIO",
      purpose: "VENDA",
      price: 4950000,
      condoFee: 1100,
      propertyTax: 4200,
      city: "Porto Velho",
      state: "RO",
      neighborhood: "Ecoville",
      address: "Alameda das Orquídeas, Condomínio Ecoville",
      number: "88",
      zipCode: "76825-100",
      bedrooms: 4,
      suites: 4,
      bathrooms: 5,
      parkingSpaces: 4,
      builtArea: 480,
      totalArea: 800,
      status: "PUBLICADO",
      isFeatured: false,
      brokerId: brokerHelena.id,
      images: [
        { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80", isMain: true, order: 1, alt: "Fachada bioclimática com iluminação cenográfica" },
        { url: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1600&q=80", isMain: false, order: 2, alt: "Living com aberturas zenitais" },
      ],
      features: [
        { name: "Arquitetura bioclimática sustentável", category: "Arquitetura" },
        { name: "Lago ornamental com peixes na entrada", category: "Lazer" },
        { name: "Sistema de reuso de água pluvial de 15.000L", category: "Sustentabilidade" },
      ],
    },
    {
      code: "RO-1005",
      title: "Mega Fazenda de Grãos & Pecuária no Cone Sul",
      slug: "mega-fazenda-graos-pecuaria-cone-sul-vilhena",
      description:
        "Excepcional propriedade agropecuária de altíssimo rendimento no município de Vilhena, Cone Sul de Rondônia. Área total de 2.200 hectares com topografia 100% plana e argila acima de 38%. Sede monumental em estilo contemporâneo com piscina de raia, heliponto homologado, pista de pouso asfaltada de 1.400 metros iluminada, 3 pivôs centrais de irrigação instalados, secador e armazéns próprios para 300.000 sacas.",
      type: "FAZENDA",
      purpose: "VENDA",
      price: 68000000,
      condoFee: null,
      propertyTax: 25000,
      city: "Vilhena",
      state: "RO",
      neighborhood: "Zona Rural Produtiva",
      address: "BR-364, KM 48 - Cone Sul de Rondônia",
      number: "S/N",
      zipCode: "76980-000",
      bedrooms: 8,
      suites: 6,
      bathrooms: 10,
      parkingSpaces: 12,
      builtArea: 1400,
      totalArea: 22000000,
      status: "PUBLICADO",
      isFeatured: true,
      brokerId: brokerRodrigo.id,
      images: [
        { url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80", isMain: true, order: 1, alt: "Panorama dos campos agrícolas de Vilhena e sede executiva" },
        { url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80", isMain: false, order: 2, alt: "Sede residencial cinematográfica contemporânea" },
        { url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80", isMain: false, order: 3, alt: "Área de lazer da sede com piscina e paisagismo" },
      ],
      features: [
        { name: "Pista de pouso homologada de 1.400m iluminada", category: "Exclusividade" },
        { name: "Armazém e secador próprio Kepler Weber", category: "Agro" },
        { name: "3 Pivôs centrais de irrigação Valley", category: "Agro" },
        { name: "Sede cinematográfica com piscina e heliponto", category: "Infraestrutura" },
        { name: "Dupla aptidão: Soja, Milho e Pecuária de Confinamento", category: "Agro" },
      ],
    },
    {
      code: "RO-1006",
      title: "Haras de Elite & Fazenda no Vale do Urupá",
      slug: "haras-elite-fazenda-vale-urupa-ji-parana",
      description:
        "O mais imponente complexo equestre e de criação de gado Nelore PO de Rondônia, em Ji-Paraná. Propriedade com 420 hectares, sede projetada em madeira nobre e pedra granítica, 30 cocheiras padrão internacional climatizadas, pista de treinamento coberta de 1.800m², laboratório veterinário para transferência de embriões, represa privativa com deck e quiosque gourmet.",
      type: "FAZENDA",
      purpose: "VENDA",
      price: 24500000,
      condoFee: null,
      propertyTax: 14000,
      city: "Ji-Paraná",
      state: "RO",
      neighborhood: "Vale do Urupá",
      address: "Rodovia RO-135, Vale do Urupá",
      number: "KM 12",
      zipCode: "76900-000",
      bedrooms: 6,
      suites: 6,
      bathrooms: 8,
      parkingSpaces: 8,
      builtArea: 1100,
      totalArea: 4200000,
      status: "PUBLICADO",
      isFeatured: true,
      brokerId: brokerRodrigo.id,
      images: [
        { url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1600&q=80", isMain: true, order: 1, alt: "Cocheiras monumentais e sede do Haras" },
        { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80", isMain: false, order: 2, alt: "Sede social do Haras Ji-Paraná" },
      ],
      features: [
        { name: "30 Cocheiras padrão internacional climatizadas", category: "Infraestrutura" },
        { name: "Pista de treinamento de equinos coberta oficial", category: "Esporte" },
        { name: "Laboratório de biotecnologia e embriões", category: "Tecnologia" },
        { name: "Represa privativa com lago de pesca e píer", category: "Lazer" },
      ],
    },
    {
      code: "RO-1007",
      title: "Villa Contemporânea no Bosque dos Ipês",
      slug: "villa-contemporanea-bosque-dos-ipes-cacoal",
      description:
        "Residência de altíssimo luxo no condomínio mais exclusivo de Cacoal. Imóvel com 560m² de área construída, 5 suítes, pé-direito duplo, fachada com brises de madeira cumaru e concreto ripado. Piscina em L revestida em pedra hijau da Indonésia com cascata em rocha natural, adega climatizada subterrânea com lounge de degustação e cozinha gourmet com bancadas em quartzito mont blanc.",
      type: "CONDOMINIO",
      purpose: "VENDA",
      price: 5800000,
      condoFee: 950,
      propertyTax: 3800,
      city: "Cacoal",
      state: "RO",
      neighborhood: "Bosque dos Ipês",
      address: "Avenida dos Ipês, Condomínio Bosque dos Ipês",
      number: "45",
      zipCode: "76960-000",
      bedrooms: 5,
      suites: 5,
      bathrooms: 6,
      parkingSpaces: 4,
      builtArea: 560,
      totalArea: 920,
      status: "PUBLICADO",
      isFeatured: true,
      brokerId: brokerCamila.id,
      images: [
        { url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80", isMain: true, order: 1, alt: "Fachada noturna com iluminação de destaque" },
        { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80", isMain: false, order: 2, alt: "Adega e living integrado" },
      ],
      features: [
        { name: "Adega subterrânea climatizada", category: "Lazer" },
        { name: "Piscina em pedra Hijau indonésia", category: "Lazer" },
        { name: "Bancadas em Quartzito Mont Blanc", category: "Acabamento" },
        { name: "Condomínio com heliponto e quadras de tênis", category: "Condomínio" },
      ],
    },
    {
      code: "RO-1008",
      title: "Mansão Neoclássica no Bairro Dois de Abril",
      slug: "mansao-neoclassica-bairro-dois-de-abril-ji-parana",
      description:
        "Localizada na área nobre mais valorizada de Ji-Paraná, esta propriedade combina imponência e acabamentos primorosos. Com 650m² de área construída em terreno de esquina de 1.400m², oferece salões de festas climatizado para 80 convidados, academia privativa, cinema para 12 lugares e área de lazer com sauna integrada à piscina aquecida.",
      type: "CASA",
      purpose: "VENDA",
      price: 5200000,
      condoFee: null,
      propertyTax: 4600,
      city: "Ji-Paraná",
      state: "RO",
      neighborhood: "Dois de Abril",
      address: "Rua Presidente Vargas, Bairro Dois de Abril",
      number: "510",
      zipCode: "76900-110",
      bedrooms: 5,
      suites: 5,
      bathrooms: 7,
      parkingSpaces: 6,
      builtArea: 650,
      totalArea: 1400,
      status: "PUBLICADO",
      isFeatured: false,
      brokerId: brokerCamila.id,
      images: [
        { url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80", isMain: true, order: 1, alt: "Fachada imponente de esquina em Ji-Paraná" },
        { url: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=80", isMain: false, order: 2, alt: "Salão de festas privativo" },
      ],
      features: [
        { name: "Cinema acústico privativo para 12 lugares", category: "Lazer" },
        { name: "Academia completa climatizada", category: "Saúde" },
        { name: "Piscina aquecida com hidro e sauna úmida", category: "Lazer" },
      ],
    },
    {
      code: "RO-1009",
      title: "Residência Suspensa San Pelegrino",
      slug: "residencia-suspensa-san-pelegrino-porto-velho",
      description:
        "Empreendimento boutique no condomínio fechado San Pelegrino em Porto Velho. Arquitetura minimalista com balanços estruturais impressionantes em aço e concreto protendido. 4 suítes, escritório corporativo com entrada independente, sistema de aspiração central, e jardim com lareira ecológica externa (fire pit).",
      type: "CONDOMINIO",
      purpose: "VENDA",
      price: 4300000,
      condoFee: 890,
      propertyTax: 3900,
      city: "Porto Velho",
      state: "RO",
      neighborhood: "San Pelegrino",
      address: "Rua San Pelegrino, Lote 14",
      number: "14",
      zipCode: "76820-400",
      bedrooms: 4,
      suites: 4,
      bathrooms: 5,
      parkingSpaces: 4,
      builtArea: 440,
      totalArea: 680,
      status: "PUBLICADO",
      isFeatured: false,
      brokerId: brokerHelena.id,
      images: [
        { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80", isMain: true, order: 1, alt: "Fachada em concreto protendido com fire pit" },
        { url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=80", isMain: false, order: 2, alt: "Living com lareira ecológica e pé direito duplo" },
      ],
      features: [
        { name: "Fire pit rebaixado integrado ao jardim", category: "Lazer" },
        { name: "Aspiração central em todos os ambientes", category: "Tecnologia" },
        { name: "Escritório com acesso independente", category: "Conforto" },
      ],
    },
    {
      code: "RO-1010",
      title: "Mansão dos Buritis no Jardim Eldorado",
      slug: "mansao-dos-buritis-jardim-eldorado-vilhena",
      description:
        "Residência de cinema no bairro mais tradicional de Vilhena. Conta com 580m² de área construída com amplo uso de madeira maciça de manejo florestal sustentável, piscina aquecida coberta para os dias frescos do sul do estado, adega para 400 rótulos e cozinha chef com ilha central e coifa de vazão industrial.",
      type: "CASA",
      purpose: "VENDA",
      price: 4600000,
      condoFee: null,
      propertyTax: 3400,
      city: "Vilhena",
      state: "RO",
      neighborhood: "Jardim Eldorado",
      address: "Avenida Capitão Castro, Jardim Eldorado",
      number: "920",
      zipCode: "76980-050",
      bedrooms: 4,
      suites: 4,
      bathrooms: 6,
      parkingSpaces: 5,
      builtArea: 580,
      totalArea: 1200,
      status: "PUBLICADO",
      isFeatured: false,
      brokerId: brokerRodrigo.id,
      images: [
        { url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80", isMain: true, order: 1, alt: "Fachada clássica com paisagismo de buritis" },
        { url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80", isMain: false, order: 2, alt: "Área gourmet e piscina climatizada" },
      ],
      features: [
        { name: "Piscina aquecida com fechamento retrátil", category: "Lazer" },
        { name: "Madeiramento em Ipê e Cumaru certificado", category: "Acabamento" },
        { name: "Cozinha Chef com eletrodomésticos Gorenje", category: "Conforto" },
      ],
    },
    {
      code: "RO-1011",
      title: "Chácara Residencial de Alto Padrão em Ariquemes",
      slug: "chacara-residencial-alto-padrao-ariquemes",
      description:
        "Refúgio paradisíaco no Vale do Jamari em Ariquemes. Propriedade com 30.000m² privativos, casa sede com 4 suítes, varandas panorâmicas, pomar com dezenas de árvores frutíferas amazônicas produtivas (açaí, cupuaçu, cacau), campo de futebol iluminado e quiosque com churrasqueira e forno de pizza.",
      type: "CHACARA",
      purpose: "VENDA",
      price: 3600000,
      condoFee: null,
      propertyTax: 2100,
      city: "Ariquemes",
      state: "RO",
      neighborhood: "Vale do Jamari",
      address: "Linha C-65, Vale do Jamari",
      number: "KM 4",
      zipCode: "76870-000",
      bedrooms: 4,
      suites: 4,
      bathrooms: 5,
      parkingSpaces: 8,
      builtArea: 480,
      totalArea: 30000,
      status: "PUBLICADO",
      isFeatured: false,
      brokerId: brokerRodrigo.id,
      images: [
        { url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80", isMain: true, order: 1, alt: "Casa sede da chácara com gramado e pomar" },
        { url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80", isMain: false, order: 2, alt: "Vista aérea do refúgio e represa" },
      ],
      features: [
        { name: "Terreno de 3 hectares com pomar produtivo", category: "Natureza" },
        { name: "Campo de futebol society com iluminação LED", category: "Esporte" },
        { name: "Piscina com prainha e quiosque gourmet", category: "Lazer" },
      ],
    },
    {
      code: "RO-1012",
      title: "Fazenda Produtora de Café Especial & Gado em Cacoal",
      slug: "fazenda-produtora-cafe-especial-gado-cacoal",
      description:
        "Localizada na prestigiada região cafeeira de Cacoal, premiada nacionalmente pelos cafés robustas amazônicos de alta pontuação. A fazenda possui 650 hectares, sede contemporânea de luxo com lago privativo, 120 hectares em café clonado irrigado por gotejamento, terreiros suspensos e estrutura completa de beneficiamento.",
      type: "FAZENDA",
      purpose: "VENDA",
      price: 38000000,
      condoFee: null,
      propertyTax: 18000,
      city: "Cacoal",
      state: "RO",
      neighborhood: "Cinturão do Café",
      address: "Estrada do Café, KM 18",
      number: "S/N",
      zipCode: "76960-970",
      bedrooms: 5,
      suites: 5,
      bathrooms: 7,
      parkingSpaces: 8,
      builtArea: 850,
      totalArea: 6500000,
      status: "PUBLICADO",
      isFeatured: true,
      brokerId: brokerCamila.id,
      images: [
        { url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80", isMain: true, order: 1, alt: "Plantação de café especial e sede da fazenda" },
        { url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80", isMain: false, order: 2, alt: "Sede residencial com piscina de pedra natural" },
      ],
      features: [
        { name: "120 hectares de café especial de alta pontuação", category: "Agro" },
        { name: "Irrigação por gotejamento computadorizada Netafim", category: "Tecnologia" },
        { name: "Sede cinematográfica com lago e heliponto", category: "Infraestrutura" },
      ],
    },
    {
      code: "RO-1013",
      title: "Residência Executiva Mobiliada no Alphaville (Locação)",
      slug: "residencia-executiva-mobiliada-alphaville-porto-velho-locacao",
      description:
        "Disponível para locação corporativa ou executiva de alto escalão. Residência completamente mobiliada e decorada com mobiliário de designers brasileiros renomados (Jader Almeida e Sergio Rodrigues). 4 suítes, cozinha Kitchens com eletrodomésticos embutidos, adega, rouparia completa e área gourmet climatizada com churrasqueira a gás.",
      type: "CONDOMINIO",
      purpose: "ALUGUEL",
      price: 24000,
      condoFee: 1450,
      propertyTax: 720,
      city: "Porto Velho",
      state: "RO",
      neighborhood: "Alphaville",
      address: "Alameda das Palmeiras, Alphaville",
      number: "72",
      zipCode: "76824-700",
      bedrooms: 4,
      suites: 4,
      bathrooms: 5,
      parkingSpaces: 4,
      builtArea: 420,
      totalArea: 600,
      status: "PUBLICADO",
      isFeatured: false,
      brokerId: brokerHelena.id,
      images: [
        { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80", isMain: true, order: 1, alt: "Living mobiliado com design contemporâneo" },
        { url: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=80", isMain: false, order: 2, alt: "Cozinha e espaço gourmet integrados" },
      ],
      features: [
        { name: "100% Mobiliada e decorada (porteira fechada)", category: "Conforto" },
        { name: "Mobiliário assinado por Jader Almeida", category: "Design" },
        { name: "Condomínio com clube completo e segurança armada", category: "Segurança" },
      ],
    },
    {
      code: "RO-1014",
      title: "Apartamento High-End no Edifício Saint Germain (Locação)",
      slug: "apartamento-high-end-edificio-saint-germain-porto-velho-locacao",
      description:
        "1 apartamento por andar no Bairro Liberdade em Porto Velho. Vista panorâmica da cidade, hall social privativo, living para 3 ambientes integrado à varanda com fechamento em cortina de vidro e persianas motorizadas. 3 suítes, sendo a principal com hidromassagem e amplo closet.",
      type: "APARTAMENTO",
      purpose: "ALUGUEL",
      price: 15000,
      condoFee: 2100,
      propertyTax: 450,
      city: "Porto Velho",
      state: "RO",
      neighborhood: "Liberdade",
      address: "Avenida Carlos Gomes, Bairro Liberdade",
      number: "2200",
      zipCode: "76803-888",
      bedrooms: 3,
      suites: 3,
      bathrooms: 4,
      parkingSpaces: 3,
      builtArea: 290,
      totalArea: 290,
      status: "PUBLICADO",
      isFeatured: false,
      brokerId: brokerHelena.id,
      images: [
        { url: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80", isMain: true, order: 1, alt: "Varanda integrada com cortina de vidro e vista panorâmica" },
        { url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80", isMain: false, order: 2, alt: "Suíte master com piso em madeira nobre" },
      ],
      features: [
        { name: "1 Apartamento por andar com elevador privativo", category: "Privacidade" },
        { name: "Varanda com fechamento retrátil e persianas elétricas", category: "Conforto" },
        { name: "Prédio com gerador total e portaria 24h", category: "Segurança" },
      ],
    },
  ];

  for (const prop of propertiesData) {
    const { images, features, ...propertyFields } = prop;

    const createdProperty = await prisma.property.create({
      data: {
        ...propertyFields,
        images: {
          create: images.map((img) => ({
            url: img.url,
            isMain: img.isMain,
            order: img.order,
            alt: img.alt,
          })),
        },
        features: {
          create: features.map((feat) => ({
            name: feat.name,
            category: feat.category,
          })),
        },
      },
    });

    console.log(`Imóvel criado: ${createdProperty.title} (${createdProperty.city} - RO)`);
  }

  // 4. Leads de Exemplo em Rondônia
  const firstProp = await prisma.property.findFirst({
    where: { city: "Porto Velho" },
  });

  if (firstProp) {
    await prisma.lead.create({
      data: {
        propertyId: firstProp.id,
        brokerId: brokerHelena.id,
        name: "Dr. Alexandre Fontes",
        email: "alexandre.fontes@medicina.com.br",
        phone: "(69) 99988-1122",
        message:
          "Olá Helena, gostaria de agendar uma visita privativa no imóvel do Alphaville neste próximo sábado pela manhã com minha esposa.",
        status: "VISITA_AGENDADA",
        source: "PORTAL",
      },
    });

    await prisma.lead.create({
      data: {
        propertyId: firstProp.id,
        brokerId: brokerHelena.id,
        name: "Eng. Marcos Vinícius Prado",
        email: "marcos.prado@agro.com.br",
        phone: "(69) 99877-3344",
        message:
          "Tenho interesse no imóvel e gostaria de saber as condições de pagamento e permuta com imóvel em Cacoal.",
        status: "EM_ATENDIMENTO",
        source: "WHATSAPP",
      },
    });
  }

  console.log("Seed de Rondônia concluído com sucesso: 14 propriedades contemporâneas cadastradas no Supabase!");
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

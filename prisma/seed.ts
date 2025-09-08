import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash password for test users
  const hashedPassword = await bcrypt.hash('123456', 12);

  // Create test users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'maria@example.com' },
      update: {},
      create: {
        email: 'maria@example.com',
        password: hashedPassword,
        full_name: 'María González',
        location: 'San José, Costa Rica',
        gender: 'femenino',
        phone: '+506 8888-1111',
        profile_picture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        rating: 4.5,
        total_reviews: 12,
      },
    }),
    prisma.user.upsert({
      where: { email: 'carlos@example.com' },
      update: {},
      create: {
        email: 'carlos@example.com',
        password: hashedPassword,
        full_name: 'Carlos Rodríguez',
        location: 'Cartago, Costa Rica',
        gender: 'masculino',
        phone: '+506 8888-2222',
        profile_picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        rating: 4.8,
        total_reviews: 8,
      },
    }),
    prisma.user.upsert({
      where: { email: 'ana@example.com' },
      update: {},
      create: {
        email: 'ana@example.com',
        password: hashedPassword,
        full_name: 'Ana Jiménez',
        location: 'Heredia, Costa Rica',
        gender: 'femenino',
        phone: '+506 8888-3333',
        profile_picture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        rating: 4.2,
        total_reviews: 15,
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create sample products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        title: 'Vestido Floral Vintage',
        category: 'vestidos',
        description: 'Hermoso vestido floral vintage en excelente estado. Perfecto para ocasiones especiales o uso casual. Talla M.',
        price: 25000,
        size: 'M',
        condition: 'poco_uso',
        location: 'San José, Costa Rica',
        gender: 'femenino',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop',
          'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=600&fit=crop'
        ]),
        featured: true,
        seller_id: users[0].id,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Camisa de Mezclilla Clásica',
        category: 'camisas',
        description: 'Camisa de mezclilla azul clásica, marca reconocida. Muy poco uso, como nueva. Talla L.',
        price: 18000,
        size: 'L',
        condition: 'poco_uso',
        location: 'Cartago, Costa Rica',
        gender: 'masculino',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=600&fit=crop',
          'https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=400&h=600&fit=crop'
        ]),
        featured: true,
        seller_id: users[1].id,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Jeans Skinny Azul Oscuro',
        category: 'pantalones',
        description: 'Jeans skinny en azul oscuro, muy cómodos y favorecedores. Condición usada pero en buen estado.',
        price: 15000,
        size: 'S',
        condition: 'usado',
        location: 'Heredia, Costa Rica',
        gender: 'femenino',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1541840031508-326b77c9a17e?w=400&h=600&fit=crop'
        ]),
        seller_id: users[2].id,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Zapatos Deportivos Nike',
        category: 'zapatos',
        description: 'Zapatos deportivos Nike en excelente estado. Ideales para hacer ejercicio o uso casual.',
        price: 35000,
        size: '42',
        condition: 'poco_uso',
        location: 'San José, Costa Rica',
        gender: 'masculino',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop'
        ]),
        featured: true,
        seller_id: users[0].id,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Chaqueta de Cuero Negro',
        category: 'chaquetas',
        description: 'Chaqueta de cuero genuino color negro. Estilo clásico, nunca pasa de moda. Como nueva.',
        price: 45000,
        size: 'M',
        condition: 'nuevo',
        location: 'Cartago, Costa Rica',
        gender: 'otro',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=600&fit=crop'
        ]),
        featured: true,
        seller_id: users[1].id,
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} products`);

  // Create sample questions and answers
  const questions = await Promise.all([
    prisma.question.create({
      data: {
        product_id: products[0].id,
        user_id: users[1].id,
        question: '¿El vestido viene con algún accesorio o solo es la prenda?',
        user_name: users[1].full_name,
      },
    }),
    prisma.question.create({
      data: {
        product_id: products[1].id,
        user_id: users[2].id,
        question: '¿La camisa tiene algún defecto o está en perfecto estado?',
        user_name: users[2].full_name,
      },
    }),
  ]);

  console.log(`✅ Created ${questions.length} questions`);

  const answers = await Promise.all([
    prisma.answer.create({
      data: {
        question_id: questions[0].id,
        user_id: users[0].id,
        answer: 'Solo es el vestido, pero está en excelente estado y es muy bonito puesto.',
        user_name: users[0].full_name,
      },
    }),
    prisma.answer.create({
      data: {
        question_id: questions[1].id,
        user_id: users[1].id,
        answer: 'Está en perfecto estado, la he usado muy pocas veces. Como nueva.',
        user_name: users[1].full_name,
      },
    }),
  ]);

  console.log(`✅ Created ${answers.length} answers`);

  // Create sample reviews
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        reviewer_id: users[1].id,
        reviewed_user_id: users[0].id,
        rating: 5,
        comment: 'Excelente vendedora, muy amable y el producto llegó en perfectas condiciones.',
        reviewer_name: users[1].full_name,
      },
    }),
    prisma.review.create({
      data: {
        reviewer_id: users[2].id,
        reviewed_user_id: users[1].id,
        rating: 5,
        comment: 'Muy recomendado, comunicación excelente y producto tal como se describía.',
        reviewer_name: users[2].full_name,
      },
    }),
    prisma.review.create({
      data: {
        reviewer_id: users[0].id,
        reviewed_user_id: users[2].id,
        rating: 4,
        comment: 'Buena experiencia de compra, producto en buen estado.',
        reviewer_name: users[0].full_name,
      },
    }),
  ]);

  console.log(`✅ Created ${reviews.length} reviews`);

  console.log('🎉 Database seeding completed successfully!');
  console.log(`
📧 Test user credentials:
- maria@example.com / 123456
- carlos@example.com / 123456  
- ana@example.com / 123456
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

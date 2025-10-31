const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const monthsAgo = (months) => {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date;
};

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');
  
  // Limpiar datos existentes
  console.log('🗑️  Limpiando datos existentes...');
  await prisma.chatMessage.deleteMany();
  await prisma.review.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.question.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Datos limpiados');
  
  const hashedPassword = await bcrypt.hash('123456', 12);

  // Crear usuarios
  console.log('👥 Creando usuarios...');
  const maria = await prisma.user.create({
    data: {
      email: 'maria@example.com',
      password: hashedPassword,
      full_name: 'Maria Rodriguez',
      location: 'Escazú, San José',
      gender: 'femenino',
      phone: '88887777',
      rating: 4.8,
    },
  });

  const carlos = await prisma.user.create({
    data: {
      email: 'carlos@example.com',
      password: hashedPassword,
      full_name: 'Carlos Mendez',
      location: 'Heredia, Heredia',
      gender: 'masculino',
      phone: '88886666',
      rating: 4.6,
    },
  });

  const ana = await prisma.user.create({
    data: {
      email: 'ana@example.com',
      password: hashedPassword,
      full_name: 'Ana Jimenez',
      location: 'Alajuela, Alajuela',
      gender: 'femenino',
      phone: '88885555',
      rating: 4.5,
    },
  });

  const diego = await prisma.user.create({
    data: {
      email: 'diego@example.com',
      password: hashedPassword,
      full_name: 'Diego Vargas',
      location: 'Cartago, Cartago',
      gender: 'masculino',
      phone: '88884444',
      rating: 4.7,
    },
  });

  const users = [maria, carlos, ana, diego];
  console.log(`✅ Creados ${users.length} usuarios`);

  // Crear suscripciones premium para Maria y Carlos
  console.log('💎 Creando suscripciones...');
  await prisma.subscription.create({
    data: {
      user_id: maria.id,
      plan: 'premium',
      billing_cycle: 'mensual',
      price: 3500,
      start_date: monthsAgo(5),
      end_date: new Date(monthsAgo(5).getTime() + 30 * 24 * 60 * 60 * 1000),
      status: 'activa',
      products_limit: 50,
      featured_products_limit: 5,
      analytics_enabled: true,
    },
  });

  await prisma.subscription.create({
    data: {
      user_id: carlos.id,
      plan: 'profesional',
      billing_cycle: 'mensual',
      price: 6500,
      start_date: monthsAgo(4),
      end_date: new Date(monthsAgo(4).getTime() + 30 * 24 * 60 * 60 * 1000),
      status: 'activa',
      products_limit: 200,
      featured_products_limit: 15,
      analytics_enabled: true,
    },
  });
  console.log('✅ Creadas 2 suscripciones premium');

  // Crear productos vendidos de Maria (para estadísticas)
  console.log('📦 Creando productos...');
  const mariaProducts = [];
  
  // Productos vendidos hace 5 meses
  for (let i = 0; i < 3; i++) {
    const product = await prisma.product.create({
      data: {
        seller_id: maria.id,
        title: `Producto Maria Mes 5 - ${i + 1}`,
        description: 'Producto de calidad ecológico',
        price: 15000 + (i * 2000),
        category: 'camisas',
        size: 'M',
        condition: 'nuevo',
        location: maria.location,
        gender: 'femenino',
        images: JSON.stringify(['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500']),
        status: 'sold',
        featured: false,
        created_at: monthsAgo(5),
      },
    });
    mariaProducts.push(product);
  }

  // Productos vendidos hace 4 meses
  for (let i = 0; i < 4; i++) {
    const product = await prisma.product.create({
      data: {
        seller_id: maria.id,
        title: `Producto Maria Mes 4 - ${i + 1}`,
        description: 'Producto de calidad ecológico',
        price: 18000 + (i * 3000),
        category: 'vestidos',
        size: 'S',
        condition: 'nuevo',
        location: maria.location,
        gender: 'femenino',
        images: JSON.stringify(['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500']),
        status: 'sold',
        featured: false,
        created_at: monthsAgo(4),
      },
    });
    mariaProducts.push(product);
  }

  // Productos vendidos hace 3 meses
  for (let i = 0; i < 5; i++) {
    const product = await prisma.product.create({
      data: {
        seller_id: maria.id,
        title: `Producto Maria Mes 3 - ${i + 1}`,
        description: 'Producto de calidad ecológico',
        price: 12000 + (i * 1500),
        category: 'zapatos',
        size: '38',
        condition: 'poco_uso',
        location: maria.location,
        gender: 'femenino',
        images: JSON.stringify(['https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500']),
        status: 'sold',
        featured: false,
        created_at: monthsAgo(3),
      },
    });
    mariaProducts.push(product);
  }

  // Productos vendidos hace 2 meses
  for (let i = 0; i < 6; i++) {
    const product = await prisma.product.create({
      data: {
        seller_id: maria.id,
        title: `Producto Maria Mes 2 - ${i + 1}`,
        description: 'Producto de calidad ecológico',
        price: 20000 + (i * 4000),
        category: 'chaquetas',
        size: 'M',
        condition: 'nuevo',
        location: maria.location,
        gender: 'femenino',
        images: JSON.stringify(['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500']),
        status: 'sold',
        featured: false,
        created_at: monthsAgo(2),
      },
    });
    mariaProducts.push(product);
  }

  // Productos vendidos hace 1 mes
  for (let i = 0; i < 7; i++) {
    const product = await prisma.product.create({
      data: {
        seller_id: maria.id,
        title: `Producto Maria Mes 1 - ${i + 1}`,
        description: 'Producto de calidad ecológico',
        price: 14000 + (i * 2500),
        category: 'pantalones',
        size: 'M',
        condition: 'nuevo',
        location: maria.location,
        gender: 'femenino',
        images: JSON.stringify(['https://images.unsplash.com/photo-1517438322307-e67111335449?w=500']),
        status: 'sold',
        featured: false,
        created_at: monthsAgo(1),
      },
    });
    mariaProducts.push(product);
  }

  // Productos disponibles actuales
  for (let i = 0; i < 3; i++) {
    const product = await prisma.product.create({
      data: {
        seller_id: maria.id,
        title: `Producto Maria Disponible - ${i + 1}`,
        description: 'Producto de calidad ecológico disponible',
        price: 16000 + (i * 3000),
        category: 'deportiva',
        size: 'M',
        condition: 'nuevo',
        location: maria.location,
        gender: 'femenino',
        images: JSON.stringify(['https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=500']),
        status: 'available',
        featured: i === 0,
        created_at: monthsAgo(0),
      },
    });
    mariaProducts.push(product);
  }

  console.log(`✅ Creados ${mariaProducts.length} productos de Maria`);

  // Crear productos de Carlos
  const carlosProducts = [];
  
  // Productos vendidos en diferentes meses
  for (let month = 5; month >= 1; month--) {
    for (let i = 0; i < (6 - month); i++) {
      const product = await prisma.product.create({
        data: {
          seller_id: carlos.id,
          title: `Producto Carlos Mes ${month} - ${i + 1}`,
          description: 'Producto masculino de calidad',
          price: 25000 + (i * 5000),
          category: month % 2 === 0 ? 'camisas' : 'pantalones',
          size: 'L',
          condition: 'nuevo',
          location: carlos.location,
          gender: 'masculino',
          images: JSON.stringify(['https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500']),
          status: 'sold',
          featured: false,
          created_at: monthsAgo(month),
        },
      });
      carlosProducts.push(product);
    }
  }

  // Productos disponibles
  for (let i = 0; i < 4; i++) {
    const product = await prisma.product.create({
      data: {
        seller_id: carlos.id,
        title: `Producto Carlos Disponible - ${i + 1}`,
        description: 'Producto masculino disponible',
        price: 30000 + (i * 10000),
        category: 'zapatos',
        size: '42',
        condition: 'nuevo',
        location: carlos.location,
        gender: 'masculino',
        images: JSON.stringify(['https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500']),
        status: 'available',
        featured: i < 2,
        created_at: monthsAgo(0),
      },
    });
    carlosProducts.push(product);
  }

  console.log(`✅ Creados ${carlosProducts.length} productos de Carlos`);

  // Crear algunos productos para otros usuarios
  const anaProduct = await prisma.product.create({
    data: {
      seller_id: ana.id,
      title: 'Blusa Elegante',
      description: 'Blusa para ocasiones especiales',
      price: 18000,
      category: 'camisas',
      size: 'S',
      condition: 'nuevo',
      location: ana.location,
      gender: 'femenino',
      images: JSON.stringify(['https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=500']),
      status: 'available',
      featured: false,
      created_at: new Date(),
    },
  });

  const diegoProduct = await prisma.product.create({
    data: {
      seller_id: diego.id,
      title: 'Chaqueta Deportiva',
      description: 'Chaqueta para ejercicio',
      price: 22000,
      category: 'deportiva',
      size: 'L',
      condition: 'nuevo',
      location: diego.location,
      gender: 'masculino',
      images: JSON.stringify(['https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500']),
      status: 'available',
      featured: false,
      created_at: new Date(),
    },
  });

  const allProducts = [...mariaProducts, ...carlosProducts, anaProduct, diegoProduct];
  console.log(`✅ Total de productos: ${allProducts.length}`);

  // Crear compras para productos vendidos
  console.log('💰 Creando compras...');
  const soldProducts = allProducts.filter(p => p.status === 'sold');
  
  for (const product of soldProducts) {
    // Seleccionar un comprador aleatorio diferente al vendedor
    let buyer = users[Math.floor(Math.random() * users.length)];
    while (buyer.id === product.seller_id) {
      buyer = users[Math.floor(Math.random() * users.length)];
    }

    await prisma.purchase.create({
      data: {
        buyer_id: buyer.id,
        seller_id: product.seller_id,
        product_id: product.id,
        buyer_name: buyer.full_name,
        buyer_email: buyer.email,
        buyer_phone: buyer.phone,
        status: 'completed',
        created_at: new Date(product.created_at.getTime() + 2 * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log(`✅ Creadas ${soldProducts.length} compras`);

  // Crear reseñas
  console.log('⭐ Creando reseñas...');
  const purchases = await prisma.purchase.findMany({
    where: { status: 'completed' },
    include: { buyer: true },
  });

  let reviewCount = 0;
  for (const purchase of purchases) {
    if (Math.random() > 0.3) { // 70% tienen reseña
      const rating = Math.random() > 0.2 ? 5 : 4;
      await prisma.review.create({
        data: {
          purchase_id: purchase.id,
          reviewer_id: purchase.buyer_id,
          reviewed_user_id: purchase.seller_id,
          rating,
          comment: 'Excelente producto, muy recomendado',
          reviewer_name: purchase.buyer.full_name,
          created_at: new Date(purchase.created_at.getTime() + 3 * 24 * 60 * 60 * 1000),
        },
      });
      reviewCount++;
    }
  }
  console.log(`✅ Creadas ${reviewCount} reseñas`);

  // Crear algunas preguntas y respuestas
  console.log('❓ Creando preguntas y respuestas...');
  const availableProducts = allProducts.filter(p => p.status === 'available').slice(0, 5);
  
  for (const product of availableProducts) {
    let questioner = users[Math.floor(Math.random() * users.length)];
    while (questioner.id === product.seller_id) {
      questioner = users[Math.floor(Math.random() * users.length)];
    }

    const seller = users.find(u => u.id === product.seller_id);

    const question = await prisma.question.create({
      data: {
        product_id: product.id,
        user_id: questioner.id,
        question: '¿Está disponible aún?',
        user_name: questioner.full_name,
      },
    });

    await prisma.answer.create({
      data: {
        question_id: question.id,
        user_id: product.seller_id,
        answer: 'Sí, todavía está disponible',
        user_name: seller.full_name,
      },
    });
  }
  console.log(`✅ Creadas ${availableProducts.length} preguntas con respuestas`);

  // Actualizar ratings de usuarios
  console.log('📊 Actualizando ratings de usuarios...');
  for (const user of users) {
    const userReviews = await prisma.review.findMany({
      where: { reviewed_user_id: user.id },
    });

    if (userReviews.length > 0) {
      const avgRating = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          rating: Math.round(avgRating * 10) / 10,
          total_reviews: userReviews.length,
        },
      });
    }
  }
  console.log('✅ Ratings actualizados');

  console.log('\n🎉 ¡Seed completado exitosamente!');
  console.log('📊 Resumen:');
  console.log(`   - ${users.length} usuarios`);
  console.log(`   - 2 suscripciones premium`);
  console.log(`   - ${allProducts.length} productos (${soldProducts.length} vendidos)`);
  console.log(`   - ${soldProducts.length} compras completadas`);
  console.log(`   - ${reviewCount} reseñas`);
  console.log('\n👤 Usuarios de prueba (contraseña: 123456):');
  console.log('   - maria@example.com (Premium con ventas históricas)');
  console.log('   - carlos@example.com (Profesional con ventas históricas)');
  console.log('   - ana@example.com, diego@example.com');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

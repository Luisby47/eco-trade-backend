const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('👥 Usuarios y sus suscripciones:\n');
  
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      full_name: true,
      subscriptions: {
        where: {
          status: 'activa'
        },
        select: {
          id: true,
          plan: true,
          billing_cycle: true,
          status: true,
          end_date: true
        }
      }
    }
  });

  users.forEach(user => {
    console.log(`📧 ${user.email} (${user.full_name})`);
    if (user.subscriptions.length > 0) {
      user.subscriptions.forEach(sub => {
        console.log(`   ✅ ${sub.plan} - ${sub.billing_cycle} - Hasta ${sub.end_date.toISOString().split('T')[0]}`);
        console.log(`      ID: ${sub.id}`);
      });
    } else {
      console.log('   ⚪ Sin suscripción activa (Plan básico por defecto)');
    }
    console.log('');
  });
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

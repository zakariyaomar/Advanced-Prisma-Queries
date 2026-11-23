// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear data
  await prisma.comment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.post.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  // Create tags
  const tagTech = await prisma.tag.create({ data: { name: 'technology' } });
  const tagLife = await prisma.tag.create({ data: { name: 'lifestyle' } });
  const tagCode = await prisma.tag.create({ data: { name: 'coding' } });
  const tagKenya = await prisma.tag.create({ data: { name: 'kenya' } });
  const tagBiz = await prisma.tag.create({ data: { name: 'business' } });

  // Create users
  const wanjiku = await prisma.user.create({
    data: { name: 'Wanjiku Kamau', email: 'wanjiku@example.com', bio: 'Tech blogger from Nairobi' },
  });
  const ochieng = await prisma.user.create({
    data: { name: 'Ochieng Otieno', email: 'ochieng@example.com', bio: 'Software developer in Kisumu' },
  });
  const amina = await prisma.user.create({
    data: { name: 'Amina Wafula', email: 'amina@example.com', bio: 'Entrepreneur from Mombasa' },
  });
  const njoroge = await prisma.user.create({
    data: { name: 'Njoroge Mwangi', email: 'njoroge@example.com', bio: 'Student from Nakuru' },
  });

  // Create posts (some published, some not)
  const post1 = await prisma.post.create({
    data: {
      title: 'Getting Started with Node.js in Kenya',
      content: 'A comprehensive guide to setting up Node.js for Kenyan developers...',
      published: true,
      authorId: wanjiku.id,
      tags: { connect: [{ id: tagTech.id }, { id: tagCode.id }, { id: tagKenya.id }] },
      createdAt: new Date('2026-04-01'),
    },
  });
  const post2 = await prisma.post.create({
    data: {
      title: 'Building APIs with Express',
      content: 'Learn how to build REST APIs with Express framework...',
      published: true,
      authorId: wanjiku.id,
      tags: { connect: [{ id: tagTech.id }, { id: tagCode.id }] },
      createdAt: new Date('2026-04-15'),
    },
  });
  const post3 = await prisma.post.create({
    data: {
      title: 'M-Pesa Integration for Developers',
      content: 'How to integrate M-Pesa payments into your web application...',
      published: true,
      authorId: ochieng.id,
      tags: { connect: [{ id: tagTech.id }, { id: tagBiz.id }, { id: tagKenya.id }] },
      createdAt: new Date('2026-04-20'),
    },
  });
  const post4 = await prisma.post.create({
    data: {
      title: 'Life as a Remote Developer in Nairobi',
      content: 'My experience working remotely from Nairobi for international companies...',
      published: true,
      authorId: ochieng.id,
      tags: { connect: [{ id: tagLife.id }, { id: tagKenya.id }] },
      createdAt: new Date('2026-04-28'),
    },
  });
  const post5 = await prisma.post.create({
    data: {
      title: 'Draft: Prisma vs Drizzle ORM',
      content: 'Comparing two popular ORMs for TypeScript projects...',
      published: false,
      authorId: wanjiku.id,
      tags: { connect: [{ id: tagTech.id }, { id: tagCode.id }] },
    },
  });
  const post6 = await prisma.post.create({
    data: {
      title: 'Starting a Tech Business in East Africa',
      content: 'Lessons from launching a startup in the East African market...',
      published: true,
      authorId: amina.id,
      tags: { connect: [{ id: tagBiz.id }, { id: tagKenya.id }] },
      createdAt: new Date('2026-05-01'),
    },
  });
  const post7 = await prisma.post.create({
    data: {
      title: 'Draft: My Internship Experience',
      content: 'What I learned during my summer internship...',
      published: false,
      authorId: njoroge.id,
      tags: { connect: [{ id: tagLife.id }] },
    },
  });

  // Create comments
  await prisma.comment.createMany({
    data: [
      { text: 'Great article! Very helpful for beginners.', userId: ochieng.id, postId: post1.id },
      { text: 'I followed this tutorial and it worked perfectly.', userId: amina.id, postId: post1.id },
      { text: 'Can you cover TypeScript next?', userId: njoroge.id, postId: post1.id },
      { text: 'Express is my favourite framework.', userId: njoroge.id, postId: post2.id },
      { text: 'This is exactly what I needed for my project.', userId: amina.id, postId: post2.id },
      { text: 'M-Pesa integration was so hard before this guide.', userId: wanjiku.id, postId: post3.id },
      { text: 'Thanks for sharing!', userId: njoroge.id, postId: post3.id },
      { text: 'Please add Lipa Na M-Pesa example.', userId: amina.id, postId: post3.id },
      { text: 'The remote work scene in Nairobi is growing fast.', userId: wanjiku.id, postId: post4.id },
      { text: 'Inspiring story!', userId: amina.id, postId: post4.id },
      { text: 'Very insightful article about startups.', userId: ochieng.id, postId: post6.id },
      { text: 'I wish I had read this before starting my company.', userId: wanjiku.id, postId: post6.id },
    ],
  });

  // Create categories
  const electronics = await prisma.category.create({ data: { name: 'Electronics', description: 'Phones, laptops, accessories' } });
  const clothing = await prisma.category.create({ data: { name: 'Clothing', description: 'Fashion and apparel' } });
  const food = await prisma.category.create({ data: { name: 'Food & Groceries', description: 'Fresh produce and packaged food' } });
  const home = await prisma.category.create({ data: { name: 'Home & Kitchen', description: 'Household items and kitchen equipment' } });

  // Create products (prices in KES)
  const phone = await prisma.product.create({
    data: { name: 'Samsung Galaxy A14', price: 18500, stock: 25, categoryId: electronics.id },
  });
  const laptop = await prisma.product.create({
    data: { name: 'HP Laptop 15', price: 65000, stock: 10, categoryId: electronics.id },
  });
  const earbuds = await prisma.product.create({
    data: { name: 'Wireless Earbuds', price: 2500, stock: 50, categoryId: electronics.id },
  });
  const tshirt = await prisma.product.create({
    data: { name: 'Ankara Print T-Shirt', price: 1200, stock: 30, categoryId: clothing.id },
  });
  const hoodie = await prisma.product.create({
    data: { name: 'Nairobi Hoodie', price: 3500, stock: 0, categoryId: clothing.id },
  });
  const maizeFlour = await prisma.product.create({
    data: { name: 'Jogoo Maize Flour 2kg', price: 180, stock: 100, categoryId: food.id },
  });
  const cookingOil = await prisma.product.create({
    data: { name: 'Elianto Cooking Oil 1L', price: 350, stock: 75, categoryId: food.id },
  });
  const sufuria = await prisma.product.create({
    data: { name: 'Aluminium Sufuria Set', price: 4500, stock: 15, categoryId: home.id },
  });

  // Create orders
  const order1 = await prisma.order.create({
    data: {
      totalAmount: 21000,
      status: 'delivered',
      customerId: wanjiku.id,
      items: {
        create: [
          { quantity: 1, price: 18500, productId: phone.id },
          { quantity: 1, price: 2500, productId: earbuds.id },
        ],
      },
      createdAt: new Date('2026-03-15'),
    },
  });
  const order2 = await prisma.order.create({
    data: {
      totalAmount: 65000,
      status: 'shipped',
      customerId: ochieng.id,
      items: {
        create: [
          { quantity: 1, price: 65000, productId: laptop.id },
        ],
      },
      createdAt: new Date('2026-04-01'),
    },
  });
  const order3 = await prisma.order.create({
    data: {
      totalAmount: 5730,
      status: 'delivered',
      customerId: amina.id,
      items: {
        create: [
          { quantity: 2, price: 1200, productId: tshirt.id },
          { quantity: 1, price: 180, productId: maizeFlour.id },
          { quantity: 2, price: 350, productId: cookingOil.id },
          { quantity: 1, price: 2500, productId: earbuds.id },
        ],
      },
      createdAt: new Date('2026-04-10'),
    },
  });
  const order4 = await prisma.order.create({
    data: {
      totalAmount: 4680,
      status: 'pending',
      customerId: wanjiku.id,
      items: {
        create: [
          { quantity: 1, price: 4500, productId: sufuria.id },
          { quantity: 1, price: 180, productId: maizeFlour.id },
        ],
      },
      createdAt: new Date('2026-05-01'),
    },
  });

  console.log('Seeding complete!');
  const counts = {
    users: await prisma.user.count(),
    posts: await prisma.post.count(),
    comments: await prisma.comment.count(),
    tags: await prisma.tag.count(),
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    orders: await prisma.order.count(),
    orderItems: await prisma.orderItem.count(),
  };
  console.log(counts);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
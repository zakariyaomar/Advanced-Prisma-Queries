const { Prisma, PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createOrder() {
  const result = await prisma.$transaction(async (tx) => {
    const customer = await tx.user.findUnique({
      where: { email: 'njoroge@example.com' },
    });
    if (!customer) throw new Error('Njoroge was not found');

    const itemsToOrder = [
      { name: 'Samsung Galaxy A14', quantity: 1 },
      { name: 'Jogoo Maize Flour 2kg', quantity: 3 },
    ];
    const order = await tx.order.create({
      data: { customerId: customer.id, totalAmount: 0, status: 'pending' },
    });

    let totalAmount = new Prisma.Decimal(0);
    for (const item of itemsToOrder) {
      const products = await tx.product.findMany({ where: { name: item.name } });
      if (products.length !== 1) {
        throw new Error(`Expected exactly one product named ${item.name}; found ${products.length}`);
      }
      const product = products[0];
      const updated = await tx.product.updateMany({
        where: { id: product.id, stock: { gte: item.quantity }, price: product.price },
        data: { stock: { decrement: item.quantity } },
      });
      if (updated.count !== 1) {
        throw new Error(`Insufficient stock or price changed for ${product.name}`);
      }

      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
        },
      });
      totalAmount = totalAmount.plus(product.price.times(item.quantity));
    }

    return tx.order.update({
      where: { id: order.id },
      data: { totalAmount },
      include: {
        customer: { select: { name: true } },
        items: { include: { product: { select: { name: true } } }, orderBy: { id: 'asc' } },
      },
    });
  });

  console.log('\n=== Task 3: Order created via transaction ===');
  console.log(`Order #${result.id} for ${result.customer.name} - KES ${result.totalAmount}`);
  result.items.forEach((item) => {
    console.log(`  - ${item.product.name} x${item.quantity} @ KES ${item.price}`);
  });
  for (const item of result.items) {
    const product = await prisma.product.findUniqueOrThrow({ where: { id: item.productId } });
    console.log(`${product.name} stock: ${product.stock}`);
  }
}

async function main() {
  const wanjikuPosts = await prisma.post.findMany({
    where: { published: true, author: { name: 'Wanjiku Kamau' } },
    include: {
      author: { select: { name: true } },
      comments: {
        include: { user: { select: { name: true } } },
        orderBy: { id: 'asc' },
      },
    },
    orderBy: { id: 'asc' },
  });
  console.log("=== 1a: Wanjiku's published posts with comments ===");
  wanjikuPosts.forEach((post) => {
    console.log(`\n"${post.title}" by ${post.author.name} (${post.comments.length} comments)`);
    post.comments.forEach((comment) => console.log(`  - ${comment.user.name}: ${comment.text}`));
  });

  const topPosts = await prisma.post.findMany({
    take: 5,
    orderBy: [{ comments: { _count: 'desc' } }, { id: 'asc' }],
    include: { author: { select: { name: true } }, _count: { select: { comments: true } } },
  });
  console.log('\n=== 1b: Top 5 most-commented posts ===');
  topPosts.forEach((post, index) => {
    console.log(`${index + 1}. "${post.title}" by ${post.author.name} - ${post._count.comments} comments`);
  });

  const unpublishedUsers = await prisma.user.findMany({
    where: { posts: { none: { published: true } } },
    orderBy: { id: 'asc' },
  });
  console.log('\n=== 1c: Users who never published ===');
  unpublishedUsers.forEach((user) => console.log(`- ${user.name}`));

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentPosts = await prisma.post.findMany({
    where: { createdAt: { gte: sevenDaysAgo, lte: now } },
    include: { author: { select: { name: true } } },
    orderBy: { id: 'asc' },
  });
  console.log('\n=== 2a: Posts from last 7 days ===');
  recentPosts.forEach((post) => {
    console.log(`- "${post.title}" by ${post.author.name} (${post.createdAt.toISOString().slice(0, 10)})`);
  });

  const affordableProducts = await prisma.product.findMany({
    where: { price: { lt: 1000 }, stock: { gt: 0 } },
    orderBy: { id: 'asc' },
  });
  console.log('\n=== 2b: Affordable in-stock products (under KES 1000) ===');
  affordableProducts.forEach((product) => {
    console.log(`- ${product.name} - KES ${product.price} (${product.stock} in stock)`);
  });

  const orders = await prisma.order.findMany({
    where: { totalAmount: { gte: 5000, lte: 50000 } },
    include: {
      customer: { select: { name: true } },
      items: { include: { product: { select: { name: true } } }, orderBy: { id: 'asc' } },
    },
    orderBy: { id: 'asc' },
  });
  console.log('\n=== 2c: Orders between KES 5,000 and KES 50,000 ===');
  orders.forEach((order) => {
    console.log(`Order #${order.id} - KES ${Number(order.totalAmount).toLocaleString('en-US')} (${order.status}) by ${order.customer.name}`);
    order.items.forEach((item) => {
      console.log(`  - ${item.product.name} x${item.quantity} @ KES ${Number(item.price).toLocaleString('en-US')}`);
    });
  });

  const completedOrders = await prisma.order.findMany({
    where: { status: { in: ['delivered', 'shipped'] } },
    select: { totalAmount: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
  const revenueByMonth = new Map();
  completedOrders.forEach((order) => {
    const month = order.createdAt.toISOString().slice(0, 7);
    revenueByMonth.set(month, (revenueByMonth.get(month) || new Prisma.Decimal(0)).plus(order.totalAmount));
  });
  const averageOrder = await prisma.order.aggregate({ _avg: { totalAmount: true }, _count: true });
  const popularProducts = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true },
    orderBy: [{ _sum: { quantity: 'desc' } }, { productId: 'asc' }],
    take: 1,
  });
  console.log('\n=== Bonus: Business Reports ===');
  console.log('Revenue by month:');
  for (const [month, revenue] of revenueByMonth) {
    const label = new Date(`${month}-01T00:00:00Z`).toLocaleDateString('en-US', {
      month: 'long', year: 'numeric', timeZone: 'UTC',
    });
    console.log(`  ${label}: KES ${revenue.toString()}`);
  }
  console.log(`\nAverage order value: KES ${averageOrder._avg.totalAmount === null ? 'N/A' : averageOrder._avg.totalAmount}`);
  console.log(`Total orders: ${averageOrder._count}`);
  if (popularProducts.length > 0) {
    const product = await prisma.product.findUniqueOrThrow({ where: { id: popularProducts[0].productId } });
    console.log(`\nMost popular product: ${product.name} (ordered ${popularProducts[0]._sum.quantity} units)`);
  } else {
    console.log('\nMost popular product: N/A');
  }

  await createOrder();
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });

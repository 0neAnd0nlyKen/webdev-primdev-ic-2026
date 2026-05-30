// backend/prisma/seed_for_recommend.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// Initialize Prisma Client - it will use DATABASE_URL from .env
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting additional database seeding...\n');

  // Test database connection first
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully\n');
  } catch (error) {
    console.error('❌ Failed to connect to database:', error.message);
    throw error;
  }

  // ========== VERIFY EXISTING DATA ==========
  console.log('🔍 Verifying existing data...');
  
  // Get existing categories
  const existingCategories = await prisma.categories.findMany();
  const categoryMap = {};
  existingCategories.forEach(cat => {
    categoryMap[cat.name] = cat.id;
  });
  console.log(`✅ Found ${existingCategories.length} existing categories`);
  
  // Get existing users
  const existingUsers = await prisma.users.findMany();
  const userMap = {};
  existingUsers.forEach(user => {
    userMap[user.email] = user.id;
  });
  console.log(`✅ Found ${existingUsers.length} existing users`);
  
  // Get existing books to check for duplicates
  const existingBooks = await prisma.books.findMany();
  const existingBookTitles = new Set(existingBooks.map(book => book.title));
  console.log(`✅ Found ${existingBooks.length} existing books\n`);

  // ========== CREATE ADDITIONAL CATEGORIES (if needed) ==========
  console.log('📚 Creating additional categories...');
  const newCategories = [];
  
  const additionalCategories = [
    { name: 'Philosophy' },
    { name: 'Art & Photography' },
    { name: 'Travel' },
    { name: 'Cooking' },
    { name: 'Business & Economics' },
  ];
  
  for (const catData of additionalCategories) {
    if (!categoryMap[catData.name]) {
      const category = await prisma.categories.create({ data: catData });
      newCategories.push(category);
      categoryMap[catData.name] = category.id;
      console.log(`   Created category: ${catData.name}`);
    } else {
      console.log(`   Category already exists: ${catData.name}`);
    }
  }
  console.log(`✅ Created ${newCategories.length} new categories\n`);

  // ========== CREATE ADDITIONAL USERS ==========
  console.log('👥 Creating additional users...');
  const newUsers = [];
  
  const additionalUsers = [
    { name: 'Robert Chen', email: 'robert.chen@example.com', password: 'password123', role: 'USER' },
    { name: 'Maria Garcia', email: 'maria.garcia@example.com', password: 'password123', role: 'USER' },
    { name: 'James Wilson', email: 'james.wilson@example.com', password: 'password123', role: 'USER' },
    { name: 'Patricia Lee', email: 'patricia.lee@example.com', password: 'password123', role: 'USER' },
    { name: 'Michael Brown', email: 'michael.brown@example.com', password: 'password123', role: 'USER' },
    { name: 'Jennifer Taylor', email: 'jennifer.taylor@example.com', password: 'password123', role: 'USER' },
  ];
  
  for (const userData of additionalUsers) {
    if (!userMap[userData.email]) {
      const hashedPwd = await bcrypt.hash(userData.password, 10);
      const user = await prisma.users.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPwd,
          role: userData.role
        }
      });
      newUsers.push(user);
      userMap[userData.email] = user.id;
      console.log(`   Created user: ${userData.name} (${userData.email})`);
    } else {
      console.log(`   User already exists: ${userData.email}`);
    }
  }
  console.log(`✅ Created ${newUsers.length} new users\n`);

  // ========== CREATE PROFILES FOR NEW USERS ==========
  if (newUsers.length > 0) {
    console.log('📝 Creating profiles for new users...');
    
    const profileData = newUsers.map((user, idx) => ({
      userId: user.id,
      address: `${1000 + idx} New Library Lane, City ${user.id}`,
      phone: `+1 (555) ${String(200 + idx).padStart(3, '0')}-${String(1000 + idx).slice(-4)}`
    }));
    
    let profilesCreated = 0;
    for (const data of profileData) {
      const existingProfile = await prisma.profiles.findFirst({
        where: { userId: data.userId }
      });
      
      if (!existingProfile) {
        await prisma.profiles.create({ data });
        profilesCreated++;
      }
    }
    console.log(`✅ Created ${profilesCreated} new profiles\n`);
  }

  // ========== CREATE ADDITIONAL BOOKS ==========
  console.log('📖 Creating additional books...');
  const newBooks = [];
  
  const additionalBooks = [
    // Philosophy
    { title: 'Meditations', author: 'Marcus Aurelius', year: 180, categoryId: categoryMap['Philosophy'] || categoryMap['Non-Fiction'], available: true },
    { title: 'Thus Spoke Zarathustra', author: 'Friedrich Nietzsche', year: 1885, categoryId: categoryMap['Philosophy'] || categoryMap['Non-Fiction'], available: true },
    
    // Art & Photography
    { title: 'The Story of Art', author: 'E.H. Gombrich', year: 1950, categoryId: categoryMap['Art & Photography'] || categoryMap['Non-Fiction'], available: true },
    { title: 'Ways of Seeing', author: 'John Berger', year: 1972, categoryId: categoryMap['Art & Photography'] || categoryMap['Non-Fiction'], available: false },
    
    // Travel
    { title: 'Eat, Pray, Love', author: 'Elizabeth Gilbert', year: 2006, categoryId: categoryMap['Travel'] || categoryMap['Biography & Memoir'], available: true },
    { title: 'A Walk in the Woods', author: 'Bill Bryson', year: 1998, categoryId: categoryMap['Travel'] || categoryMap['Non-Fiction'], available: false },
    
    // Cooking
    { title: 'Salt, Fat, Acid, Heat', author: 'Samin Nosrat', year: 2017, categoryId: categoryMap['Cooking'] || categoryMap['Non-Fiction'], available: true },
    { title: 'The Joy of Cooking', author: 'Irma S. Rombauer', year: 1931, categoryId: categoryMap['Cooking'] || categoryMap['Non-Fiction'], available: true },
    
    // Business & Economics
    { title: 'The Lean Startup', author: 'Eric Ries', year: 2011, categoryId: categoryMap['Business & Economics'] || categoryMap['Technology'], available: false },
    { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', year: 2011, categoryId: categoryMap['Business & Economics'] || categoryMap['Science'], available: true },
    { title: 'Good to Great', author: 'Jim Collins', year: 2001, categoryId: categoryMap['Business & Economics'] || categoryMap['Non-Fiction'], available: true },
    
    // More Fiction
    { title: 'Brave New World', author: 'Aldous Huxley', year: 1932, categoryId: categoryMap['Fiction'], available: false },
    { title: 'The Alchemist', author: 'Paulo Coelho', year: 1988, categoryId: categoryMap['Fiction'], available: true },
    { title: 'The Kite Runner', author: 'Khaled Hosseini', year: 2003, categoryId: categoryMap['Fiction'], available: false },
    
    // More Science
    { title: 'Cosmos', author: 'Carl Sagan', year: 1980, categoryId: categoryMap['Science'], available: true },
    { title: 'The Elegant Universe', author: 'Brian Greene', year: 1999, categoryId: categoryMap['Science'], available: true },
    
    // More Fantasy
    { title: 'The Fellowship of the Ring', author: 'J.R.R. Tolkien', year: 1954, categoryId: categoryMap['Fantasy'], available: false },
    { title: 'A Game of Thrones', author: 'George R.R. Martin', year: 1996, categoryId: categoryMap['Fantasy'], available: true },
  ];
  
  for (const bookData of additionalBooks) {
    if (!existingBookTitles.has(bookData.title)) {
      const book = await prisma.books.create({ data: bookData });
      newBooks.push(book);
      console.log(`   Created book: ${bookData.title} by ${bookData.author}`);
    } else {
      console.log(`   Book already exists: ${bookData.title}`);
    }
  }
  console.log(`✅ Created ${newBooks.length} new books\n`);

  // ========== CREATE ADDITIONAL BORROWINGS ==========
  console.log('🔄 Creating additional borrowing records...');
  
  // Get all existing users and books for reference
  const allUsers = await prisma.users.findMany();
  const allBooksList = await prisma.books.findMany();
  
  // Create borrowings using existing IDs from your data
  const additionalBorrowings = [
    // Borrowings for existing users with existing books
    { userId: 9, bookId: 11, borrow_date: new Date('2024-05-01'), returned_at: null },
    { userId: 10, bookId: 13, borrow_date: new Date('2024-05-05'), returned_at: null },
    { userId: 11, bookId: 16, borrow_date: new Date('2024-05-10'), returned_at: null },
    { userId: 12, bookId: 24, borrow_date: new Date('2024-05-12'), returned_at: null },
    { userId: 13, bookId: 31, borrow_date: new Date('2024-05-15'), returned_at: null },
    { userId: 14, bookId: 34, borrow_date: new Date('2024-05-18'), returned_at: null },
    
    // Past borrowings (returned)
    { userId: 9, bookId: 15, borrow_date: new Date('2024-03-15'), returned_at: new Date('2024-03-30') },
    { userId: 10, bookId: 21, borrow_date: new Date('2024-03-20'), returned_at: new Date('2024-04-05') },
    { userId: 11, bookId: 25, borrow_date: new Date('2024-04-01'), returned_at: new Date('2024-04-15') },
    { userId: 12, bookId: 29, borrow_date: new Date('2024-04-10'), returned_at: new Date('2024-04-25') },
    { userId: 13, bookId: 33, borrow_date: new Date('2024-04-15'), returned_at: new Date('2024-04-30') },
    { userId: 14, bookId: 35, borrow_date: new Date('2024-04-20'), returned_at: new Date('2024-05-05') },
    
    // Admin and librarian borrowings
    { userId: 7, bookId: 19, borrow_date: new Date('2024-05-25'), returned_at: null },
    { userId: 8, bookId: 26, borrow_date: new Date('2024-05-27'), returned_at: null },
    
    // More recent borrowings
    { userId: 9, bookId: 36, borrow_date: new Date('2024-05-28'), returned_at: null },
    { userId: 10, bookId: 37, borrow_date: new Date('2024-05-29'), returned_at: null },
  ];
  
  // Add borrowings for new users
  if (newUsers.length > 0) {
    const newUserBookIds = [17, 22, 19, 26, 20, 23];
    newUsers.forEach((user, index) => {
      if (index < newUserBookIds.length) {
        additionalBorrowings.push({
          userId: user.id,
          bookId: newUserBookIds[index % newUserBookIds.length],
          borrow_date: new Date('2024-05-20'),
          returned_at: null
        });
      }
    });
  }
  
  let borrowingsCreated = 0;
  for (const borrowingData of additionalBorrowings) {
    // Verify that the book exists before creating borrowing
    const bookExists = allBooksList.some(book => book.id === borrowingData.bookId);
    const userExists = allUsers.some(user => user.id === borrowingData.userId);
    
    if (!bookExists || !userExists) {
      console.log(`   Skipping borrowing - Book ID ${borrowingData.bookId} or User ID ${borrowingData.userId} not found`);
      continue;
    }
    
    // Check if borrowing already exists
    const existingBorrowing = await prisma.borrowings.findFirst({
      where: {
        userId: borrowingData.userId,
        bookId: borrowingData.bookId,
        borrow_date: borrowingData.borrow_date
      }
    });
    
    if (!existingBorrowing) {
      await prisma.borrowings.create({ data: borrowingData });
      
      // Update book availability if not returned
      if (!borrowingData.returned_at) {
        await prisma.books.update({
          where: { id: borrowingData.bookId },
          data: { available: false }
        });
      }
      borrowingsCreated++;
    }
  }
  console.log(`✅ Created ${borrowingsCreated} new borrowing records\n`);

  // ========== DISPLAY SUMMARY ==========
  console.log('=' .repeat(50));
  console.log('🎉 ADDITIONAL SEEDING COMPLETED SUCCESSFULLY!');
  console.log('=' .repeat(50));
  
  // Get final counts
  const finalCategories = await prisma.categories.count();
  const finalUsers = await prisma.users.count();
  const finalBooks = await prisma.books.count();
  const finalBorrowings = await prisma.borrowings.count();
  const activeBorrowings = await prisma.borrowings.count({
    where: { returned_at: null }
  });
  
  console.log('\n📊 UPDATED DATABASE SUMMARY:');
  console.log(`   📚 Categories: ${finalCategories} (+${newCategories.length})`);
  console.log(`   👥 Users: ${finalUsers} (+${newUsers.length})`);
  console.log(`   📖 Books: ${finalBooks} (+${newBooks.length})`);
  console.log(`   🔄 Active Borrowings: ${activeBorrowings}`);
  console.log(`   ✅ Total Borrowings: ${finalBorrowings} (+${borrowingsCreated})`);
  
  console.log('\n📋 SAMPLE DATA FOR TESTING:');
  console.log(`   Existing Admin Login: admin@library.com / admin123`);
  if (newUsers.length > 0) {
    console.log(`   New User Login: ${newUsers[0].email} / password123`);
  }
  console.log(`   Existing User Login: john.doe@example.com / password123`);
  
  if (newBooks.length > 0) {
    console.log('\n📚 NEW BOOKS ADDED:');
    newBooks.slice(0, 5).forEach(book => {
      console.log(`   - ${book.title} by ${book.author}`);
    });
    if (newBooks.length > 5) {
      console.log(`   ... and ${newBooks.length - 5} more`);
    }
  }
  
  if (newUsers.length > 0) {
    console.log('\n👥 NEW USERS ADDED:');
    newUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email})`);
    });
  }
  
  console.log('\n✨ Database is ready with additional test data! ✨\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Error during seeding:', e);
    console.error('\n💡 Troubleshooting tips:');
    console.error('   1. Check your DATABASE_URL in .env file');
    console.error('   2. Make sure database is running');
    console.error('   3. Run "npx prisma generate" to generate Prisma Client');
    console.error('   4. Verify the IDs in the seeder match your existing data');
    console.error('   5. Check if you have proper network access to Supabase');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
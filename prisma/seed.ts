import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 1. Seed Admin User
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const existingAdmin = await prisma.adminUser.findUnique({
        where: { username: adminUsername },
    });

    if (!existingAdmin) {
        const passwordHash = await bcrypt.hash(adminPassword, 10);
        await prisma.adminUser.create({
            data: {
                username: adminUsername,
                password_hash: passwordHash,
                is_active: true,
            },
        });
        console.log(`Admin user "${adminUsername}" created.`);
    } else {
        console.log(`Admin user "${adminUsername}" already exists.`);
    }

    // 2. Seed Categories
    console.log('Seeding categories...');
    const electronics = await prisma.category.create({
        data: {
            name: 'Electronics',
            description: 'Devices and gadgets',
            order: 1,
            image_url: 'https://images.example.com/categories/electronics.jpg',
            is_active: true,
        },
    });

    const phones = await prisma.category.create({
        data: {
            name: 'Smartphones',
            description: 'Mobile phones and accessories',
            order: 1,
            image_url: 'https://images.example.com/categories/phones.jpg',
            is_active: true,
            parent_id: electronics.id,
        },
    });

    const laptops = await prisma.category.create({
        data: {
            name: 'Laptops',
            description: 'Notebooks and personal computers',
            order: 2,
            image_url: 'https://images.example.com/categories/laptops.jpg',
            is_active: true,
            parent_id: electronics.id,
        },
    });

    const clothing = await prisma.category.create({
        data: {
            name: 'Clothing',
            description: 'Apparel and fashion',
            order: 2,
            image_url: 'https://images.example.com/categories/clothing.jpg',
            is_active: true,
        },
    });

    // 3. Seed Brands
    console.log('Seeding brands...');
    const apple = await prisma.brand.create({
        data: {
            name: 'Apple',
            order: 1,
            link: 'https://apple.com',
            image_url: 'https://images.example.com/brands/apple.jpg',
        },
    });

    const samsung = await prisma.brand.create({
        data: {
            name: 'Samsung',
            order: 2,
            link: 'https://samsung.com',
            image_url: 'https://images.example.com/brands/samsung.jpg',
        },
    });

    const nike = await prisma.brand.create({
        data: {
            name: 'Nike',
            order: 3,
            link: 'https://nike.com',
            image_url: 'https://images.example.com/brands/nike.jpg',
        },
    });

    // 4. Seed Products
    console.log('Seeding products...');
    const iphone = await prisma.product.create({
        data: {
            name: 'iPhone 15 Pro',
            description: 'The latest titanium iPhone',
            category_id: phones.id,
            brand_id: apple.id,
        },
    });

    const s24 = await prisma.product.create({
        data: {
            name: 'Galaxy S24 Ultra',
            description: 'Samsungs AI integrated flagship smartphone',
            category_id: phones.id,
            brand_id: samsung.id,
        },
    });

    const macbook = await prisma.product.create({
        data: {
            name: 'MacBook Pro 16',
            description: 'Apple Silicon power house laptop',
            category_id: laptops.id,
            brand_id: apple.id,
        },
    });

    // 5. Seed ProductOptions
    console.log('Seeding product options...');
    await prisma.productOption.createMany({
        data: [
            {
                product_id: iphone.id,
                color_name: 'Natural Titanium',
                size: '256GB',
                price: 999.00,
                color: '#8f8c85',
                image_url: 'https://images.example.com/products/iphone-natural.jpg',
            },
            {
                product_id: iphone.id,
                color_name: 'Titanium Blue',
                size: '512GB',
                price: 1199.00,
                color: '#2f4452',
                image_url: 'https://images.example.com/products/iphone-blue.jpg',
            },
            {
                product_id: s24.id,
                color_name: 'Titanium Gray',
                size: '256GB',
                price: 1299.00,
                color: '#7e7e7e',
                image_url: 'https://images.example.com/products/s24-gray.jpg',
            },
            {
                product_id: macbook.id,
                color_name: 'Space Black',
                size: '1TB',
                price: 2499.00,
                color: '#1d1d1f',
                image_url: 'https://images.example.com/products/macbook-black.jpg',
            },
        ],
    });

    // 6. Seed ProductImages
    console.log('Seeding product images...');
    await prisma.productImage.createMany({
        data: [
            {
                product_id: iphone.id,
                image_url: 'https://images.example.com/products/iphone-back.jpg',
            },
            {
                product_id: iphone.id,
                image_url: 'https://images.example.com/products/iphone-front.jpg',
            },
            {
                product_id: s24.id,
                image_url: 'https://images.example.com/products/s24-front.jpg',
            },
            {
                product_id: macbook.id,
                image_url: 'https://images.example.com/products/macbook-side.jpg',
            },
        ],
    });

    // 7. Seed Coupons
    console.log('Seeding coupons...');
    await prisma.coupon.create({
        data: {
            name: 'Summer Sale 20%',
            code: 'SUMMER20',
            from_date: new Date('2026-06-01T00:00:00Z'),
            to_date: new Date('2026-09-01T00:00:00Z'),
            percentage: 20,
            is_active: true,
        },
    });

    await prisma.coupon.create({
        data: {
            name: 'Welcome Discount $10',
            code: 'WELCOME10',
            amount: 10.00,
            is_active: true,
        },
    });

    await prisma.coupon.create({
        data: {
            name: 'Expired Coupon',
            code: 'EXPIRED10',
            from_date: new Date('2025-01-01T00:00:00Z'),
            to_date: new Date('2025-02-01T00:00:00Z'),
            percentage: 10,
            is_active: true,
        },
    });

    // 8. Seed Sliders
    console.log('Seeding sliders...');
    await prisma.slider.createMany({
        data: [
            {
                name: 'Main Hero Banner',
                description: 'Discover the new iPhone 15 Pro series starting at $999',
                interval: 5000,
                image_url: 'https://images.example.com/sliders/hero-iphone.jpg',
                is_active: true,
            },
            {
                name: 'Back to School Laptop Sale',
                description: 'Upgrade your tech with up to 15% off on MacBook Pro',
                interval: 6000,
                image_url: 'https://images.example.com/sliders/hero-laptops.jpg',
                is_active: true,
            },
        ],
    });

    console.log('Database seed completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

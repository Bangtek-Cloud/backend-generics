import prisma from '../src/utils/prisma'

async function main() {
  const event = await prisma.event.create({
    data: {
      name: "Roadshow Surabaya",
      description: "Event kompetisi teknologi di Surabaya",
      rules: {},
      startDate: new Date(),
      location: "Surabaya",
    }
  })


  // Removed unused variable 'asset' and its creation logic
    await prisma.asset.create({
      data: {
        code: "AST-003",
        name: "Kamera Nikon",
        acquiredAt: new Date(),
        category: "Peralatan",
        value: 10000000,
        condition: "Baik",
        status: "Aktif",
        eventId: event.id,
        location: "Gudang Surabaya"
      }
    })
  // Removed unused variable 'trx' and ensured valid foreign keys for 'accountId'
    await prisma.transaction.create({
      data: {
        description: "Pembelian Kamera Nikon",
        date: new Date(),
        eventId: event.id,
        journal: {
          create: [
            { accountId: 1, debit: 10000000 }, // Ensure '1' exists in 'Account' table
            { accountId: 2, credit: 10000000 } // Ensure '2' exists in 'Account' table
          ]
        }
      }
    })

  const donor = await prisma.donor.create({
    data: {
      name: "PT. Maju Mundur",
      email: "support@maju.com",
      phone: "08123456789",
      address: "Jl. Sponsor No.1"
    }
  })
  
  await prisma.donation.create({
    data: {
      donorId: donor.id,
      eventId: event.id,
      amount: 25000000,
      notes: "Donasi untuk kompetisi 2025"
    }
  })

  console.log("✅ Seeding selesai.")
}

main().catch(e => {
  console.error(e)
  process.exit(1)
}).finally(() => prisma.$disconnect())

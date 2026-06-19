import asyncio
from datetime import date
from app.database import engine, Base, AsyncSessionLocal
from app.models.user import User
from app.models.patient import Patient
from app.models.test import Test
from app.core.security import hash_password

async def seed():
    # Make sure tables are created (with retries for database readiness)
    for attempt in range(1, 11):
        try:
            print(f"Connecting to database (attempt {attempt}/10)...")
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            print("Connected and initialized database tables successfully!")
            break
        except Exception as e:
            if attempt == 10:
                print("Could not connect to database after 10 attempts. Exiting.")
                raise e
            print(f"Database not ready yet ({e}). Waiting 3 seconds...")
            await asyncio.sleep(3)

    async with AsyncSessionLocal() as db:
        # Check if users already exist
        from sqlalchemy import select
        result = await db.execute(select(User))
        existing_users = result.scalars().all()
        if existing_users:
            print("Database already contains user data. Skipping seeding.")
            return

        print("Seeding database...")

        # Create default users
        admin = User(
            full_name="System Administrator",
            email="admin@citylab.com",
            hashed_password=hash_password("admin123"),
            role="admin",
            is_active=True
        )
        doctor = User(
            full_name="Alistair Sharma",
            email="doctor@citylab.com",
            hashed_password=hash_password("doctor123"),
            role="doctor",
            is_active=True
        )
        tech = User(
            full_name="Sarah Connor",
            email="tech@citylab.com",
            hashed_password=hash_password("tech123"),
            role="technician",
            is_active=True
        )
        db.add_all([admin, doctor, tech])

        # Create default patients
        p1 = Patient(
            full_name="John Doe",
            date_of_birth=date(1985, 5, 15),
            gender="Male",
            phone="+1-555-0199",
            email="john.doe@email.com",
            address="123 Main St"
        )
        p2 = Patient(
            full_name="Jane Smith",
            date_of_birth=date(1990, 8, 22),
            gender="Female",
            phone="+1-555-0244",
            email="jane.smith@email.com",
            address="456 Elm St"
        )
        db.add_all([p1, p2])

        # Create default tests
        t1 = Test(
            name="Complete Blood Count (CBC)",
            category="Hematology",
            price=350.0,
            normal_range="4.0-11.0",
            unit="10^9/L",
            is_active=True
        )
        t2 = Test(
            name="Fasting Blood Sugar (FBS)",
            category="Biochemistry",
            price=150.0,
            normal_range="70-100",
            unit="mg/dL",
            is_active=True
        )
        t3 = Test(
            name="Lipid Profile",
            category="Biochemistry",
            price=500.0,
            normal_range="100-150",
            unit="mg/dL",
            is_active=True
        )
        t4 = Test(
            name="Thyroid Stimulating Hormone (TSH)",
            category="Endocrinology",
            price=400.0,
            normal_range="0.4-4.0",
            unit="uIU/mL",
            is_active=True
        )
        db.add_all([t1, t2, t3, t4])

        await db.commit()
        print("Database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed())

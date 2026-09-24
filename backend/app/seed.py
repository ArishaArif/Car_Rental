"""
Database Seeder Script — Populates initial domain data matching frontend prototypes.
Run via:
    python -m app.seed
"""

import asyncio
import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import AsyncSessionLocal, init_db
from app.models.user import User, UserRole, AuthProvider, VerificationStatus
from app.models.vehicle import Vehicle
from app.models.booking import Booking, BookingInvoice
from app.models.fleet import MaintenanceRecord, FleetInspection, DamageReport, FleetTask
from app.models.subscription import ProviderSubscription, BillingInvoiceRecord
from app.models.admin import VerificationItem, PaymentRecord, DisputeRecord, SystemConfigRecord
from app.models.notification import AppNotification
from app.utils.hashing import hash_password


async def seed_data():
    print("🌱 Initializing Database Schema...")
    await init_db()

    async with AsyncSessionLocal() as db:
        # Check if already seeded
        res = await db.execute(select(User).limit(1))
        if res.scalar_one_or_none():
            print("⚠️ Database already has records. Skipping initial seeding.")
            return

        print("🚀 Seeding Users...")
        # 1. Users for each role
        admin_user = User(
            id=uuid.uuid4(),
            full_name="System Administrator",
            email="admin@carrental.com",
            hashed_password=hash_password("Admin@123456"),
            auth_provider=AuthProvider.EMAIL,
            role=UserRole.ADMIN,
            is_email_verified=True,
            is_profile_complete=True,
            verification_status=VerificationStatus.VERIFIED,
            phone_number="+1 (555) 000-0001",
            city="San Francisco, CA",
        )

        provider_user = User(
            id=uuid.UUID("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"),
            full_name="Elena Vance",
            email="provider@fleetowner.com",
            hashed_password=hash_password("Provider@123456"),
            auth_provider=AuthProvider.EMAIL,
            role=UserRole.PROVIDER,
            is_email_verified=True,
            is_profile_complete=True,
            verification_status=VerificationStatus.VERIFIED,
            phone_number="+1 (555) 876-5432",
            city="Los Angeles, CA",
            business_name="Apex Luxury Mobility LLC",
            fleet_size="15-25",
        )

        fleet_manager_user = User(
            id=uuid.uuid4(),
            full_name="Marcus Chen",
            email="fleet@operations.com",
            hashed_password=hash_password("Fleet@123456"),
            auth_provider=AuthProvider.EMAIL,
            role=UserRole.FLEET_MANAGER,
            is_email_verified=True,
            is_profile_complete=True,
            verification_status=VerificationStatus.VERIFIED,
            phone_number="+1 (555) 345-6789",
            city="San Francisco, CA",
            department="West Hub Turnaround Operations",
        )

        customer_user = User(
            id=uuid.UUID("b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e"),
            full_name="Alex Rivera",
            email="customer@carrental.com",
            hashed_password=hash_password("Customer@123456"),
            auth_provider=AuthProvider.EMAIL,
            role=UserRole.CUSTOMER,
            is_email_verified=True,
            is_profile_complete=True,
            verification_status=VerificationStatus.VERIFIED,
            phone_number="+1 (555) 234-5678",
            city="San Francisco, CA",
            license_number="DL-CA-98421094",
            license_expiry="2028-11-20",
            preferences={
                "language": "English",
                "preferred_category": "SUV",
                "preferred_transmission": "Automatic",
                "currency": "USD",
            },
        )

        db.add_all([admin_user, provider_user, fleet_manager_user, customer_user])
        await db.flush()

        print("🚗 Seeding Fleet Vehicles...")
        vehicles_data = [
            Vehicle(
                id="veh-corolla-01",
                provider_id=provider_user.id,
                brand="Toyota",
                model="Corolla Hybrid",
                year=2024,
                category="Sedan",
                image="https://images.unsplash.com/photo-1623869675781-80aa31012a5a?q=80&w=800",
                images=[
                    "https://images.unsplash.com/photo-1623869675781-80aa31012a5a?q=80&w=800",
                    "https://images.unsplash.com/photo-1590362891988-f77804703088?q=80&w=800",
                ],
                price_per_day=55.0,
                weekly_price=340.0,
                security_deposit=150.0,
                rating=4.9,
                seats=5,
                doors=4,
                transmission="Automatic",
                fuel="Hybrid",
                location="Airport Terminal 1 - Hub West",
                mileage=14200,
                availability="Available",
                features=["Apple CarPlay", "Adaptive Cruise", "Backup Camera", "Lane Assist", "Bluetooth Audio"],
                description="Ultra-efficient 2024 hybrid sedan offering smooth highway cruising and 52 MPG economy.",
                is_published=True,
            ),
            Vehicle(
                id="veh-civic-02",
                provider_id=provider_user.id,
                brand="Honda",
                model="Civic Touring",
                year=2023,
                category="Sedan",
                image="https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?q=80&w=800",
                images=["https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?q=80&w=800"],
                price_per_day=62.0,
                weekly_price=385.0,
                security_deposit=150.0,
                rating=4.8,
                seats=5,
                doors=4,
                transmission="Automatic",
                fuel="Petrol",
                location="Downtown Tech District Hub",
                mileage=18900,
                availability="Available",
                features=["Bose Premium Sound", "Wireless Charging", "Sunroof", "Leather Seats", "Blind Spot Info"],
                description="Sporty, refined compact executive sedan with advanced driver assistance and spacious trunk.",
                is_published=True,
            ),
            Vehicle(
                id="veh-tesla-03",
                provider_id=provider_user.id,
                brand="Tesla",
                model="Model 3 Long Range",
                year=2024,
                category="Electric",
                image="https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=800",
                images=["https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=800"],
                price_per_day=95.0,
                weekly_price=590.0,
                security_deposit=250.0,
                rating=4.95,
                seats=5,
                doors=4,
                transmission="Automatic",
                fuel="Electric",
                location="Silicon Valley Supercharger Hub",
                mileage=8200,
                availability="Available",
                features=["Autopilot", "Glass Roof", "358mi Range", "Heated Seats All Around", "Premium Audio"],
                description="All-electric luxury sedan with lightning acceleration, minimalist cabin, and high range.",
                is_published=True,
            ),
            Vehicle(
                id="veh-tucson-04",
                provider_id=provider_user.id,
                brand="Hyundai",
                model="Tucson AWD",
                year=2023,
                category="SUV",
                image="https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800",
                images=["https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800"],
                price_per_day=85.0,
                weekly_price=520.0,
                security_deposit=200.0,
                rating=4.75,
                seats=5,
                doors=4,
                transmission="Automatic",
                fuel="Petrol",
                location="Downtown Tech District Hub",
                mileage=22400,
                availability="Available",
                features=["All-Wheel Drive", "Panoramic Sunroof", "Smart Power Tailgate", "Heated Seats"],
                description="Versatile crossover SUV tailored for family excursions and luggage capacity.",
                is_published=True,
            ),
            Vehicle(
                id="veh-porsche-01",
                provider_id=provider_user.id,
                brand="Porsche",
                model="Taycan Turbo S",
                year=2024,
                category="Luxury",
                image="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=800",
                images=["https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=800"],
                price_per_day=280.0,
                weekly_price=1750.0,
                security_deposit=500.0,
                rating=5.0,
                seats=4,
                doors=4,
                transmission="Automatic",
                fuel="Electric",
                location="Beverly Hills Executive Depot",
                mileage=3100,
                availability="Available",
                features=["Launch Control", "Sport Chrono", "Ceramic Brakes", "Burmester 3D Sound", "Rear Axle Steering"],
                description="The ultimate electric super-sedan blending legendary Porsche chassis dynamics with zero emissions.",
                is_published=True,
            ),
        ]
        db.add_all(vehicles_data)
        await db.flush()

        print("📋 Seeding Bookings & Invoices...")
        booking_1 = Booking(
            id="VLX-BK-34901",
            vehicle_id="veh-civic-02",
            customer_id=customer_user.id,
            pickup_date="2026-09-24",
            pickup_time="11:00 AM",
            return_date="2026-09-28",
            return_time="11:00 AM",
            rental_days=4,
            pickup_location="Downtown Tech District Hub",
            return_location="Downtown Tech District Hub",
            pricing={
                "dailyPrice": 62.0,
                "rentalDays": 4,
                "subtotal": 248.0,
                "serviceFee": 24.8,
                "taxes": 12.4,
                "securityDeposit": 150.0,
                "total": 435.2,
            },
            customer_details={
                "fullName": "Alex Rivera",
                "phone": "+1 (555) 234-5678",
                "email": "customer@carrental.com",
                "licenseNumber": "DL-CA-98421094",
                "notes": "Late flight arrival.",
            },
            payment_method="Card",
            payment_status="Paid",
            status="Confirmed",
            pickup_code="1849",
            pickup_mileage=18900,
        )

        booking_2 = Booking(
            id="VLX-BK-91823",
            vehicle_id="veh-tucson-04",
            customer_id=customer_user.id,
            pickup_date="2026-09-18",
            pickup_time="09:00 AM",
            return_date="2026-09-22",
            return_time="06:00 PM",
            rental_days=4,
            pickup_location="Downtown Tech District Hub",
            return_location="Airport Terminal 1 - Hub West",
            pricing={
                "dailyPrice": 85.0,
                "rentalDays": 4,
                "subtotal": 340.0,
                "serviceFee": 34.0,
                "taxes": 17.0,
                "securityDeposit": 150.0,
                "total": 541.0,
            },
            customer_details={
                "fullName": "Alex Rivera",
                "phone": "+1 (555) 234-5678",
                "email": "customer@carrental.com",
                "licenseNumber": "DL-CA-98421094",
            },
            payment_method="Card",
            payment_status="Paid",
            status="Completed",
            pickup_code="3194",
            pickup_mileage=22100,
            dropoff_mileage=22400,
            dropoff_fuel=85,
        )
        db.add_all([booking_1, booking_2])
        await db.flush()

        invoice_2 = BookingInvoice(
            id="inv-91823",
            invoice_number="INV-2026-91823",
            booking_id="VLX-BK-91823",
            base_rental=340.0,
            service_fee=34.0,
            taxes=17.0,
            security_deposit=150.0,
            late_charges=0.0,
            damage_charges=0.0,
            deposit_refund=150.0,
            final_amount=391.0,
            payment_method="Card",
            payment_status="Paid",
            issued_at=datetime.now(timezone.utc),
        )
        db.add(invoice_2)

        print("🔧 Seeding Fleet Maintenance & Inspections...")
        maint_1 = MaintenanceRecord(
            id="maint-01",
            vehicle_id="veh-civic-02",
            vehicle_name="Honda Civic Touring",
            vehicle_plate="WST-9284",
            type="Oil Change",
            due_date="2026-09-28",
            status="Scheduled",
            estimated_cost=85.0,
            service_center="Metro Honda Certified Center",
            notes="Standard 10,000 km synthetic oil & filter change.",
        )
        insp_1 = FleetInspection(
            id="insp-101",
            vehicle_id="veh-corolla-01",
            vehicle_name="Toyota Corolla Hybrid",
            inspector_name="Marcus Chen",
            date="2026-09-21",
            status="Completed",
            type="Routine",
            exterior_condition="Good",
            interior_condition="Clean",
            tires_and_brakes="Good",
            fuel_level=90,
            odometer_reading=14200,
            passed=True,
            notes="Routine fleet health check passed with zero defects.",
        )
        task_1 = FleetTask(
            id="task-01",
            title="Clean & Detail Tesla Model 3",
            description="Complete interior sanitization and exterior hand wash before 3:00 PM VIP pickup.",
            vehicle_id="veh-tesla-03",
            vehicle_name="Tesla Model 3 Long Range",
            priority="High",
            due_time="Today, 2:30 PM",
            status="Pending",
            category="Cleaning",
        )
        db.add_all([maint_1, insp_1, task_1])

        print("💼 Seeding SaaS Subscriptions...")
        sub_provider = ProviderSubscription(
            id="sub-prov-201",
            provider_id=provider_user.id,
            plan_id="professional",
            status="Active",
            billing_cycle="monthly",
            start_date="2025-08-15",
            renewal_date="2026-10-15",
            usage={
                "vehiclesUsed": 5,
                "vehicleLimit": 25,
                "bookingsUsed": 46,
                "bookingLimit": 150,
                "teamSeatsUsed": 2,
                "teamSeatsLimit": 5,
            },
            enabled_features=[
                "Up to 25 fleet vehicles",
                "150 monthly reservations",
                "Automated Smart Dynamic Pricing",
                "AI Damage & Photo Inspection",
            ],
        )
        sub_invoice = BillingInvoiceRecord(
            id="inv-sub-201",
            invoice_number="INV-SUB-202609-PRO",
            provider_id=provider_user.id,
            date="2026-09-15",
            amount=149.0,
            plan_name="Professional Tier (Monthly)",
            billing_cycle="monthly",
            status="Paid",
            payment_method="Visa ending 4242",
        )
        db.add_all([sub_provider, sub_invoice])

        print("🛡️ Seeding Verifications & Notifications...")
        ver_1 = VerificationItem(
            id="ver-01",
            target_id=str(customer_user.id),
            name="Alex Rivera",
            type="Customer",
            identifier="DL-CA-98421094",
            submitted_date="2026-09-20",
            status="Verified",
            document_type="California Driver's License",
            document_number="DL-CA-98421094",
            expiry_date="2028-11-20",
            notes="Automated facial & biometric DMV verification passed.",
        )
        notif_1 = AppNotification(
            id="notif-001",
            title="New Booking Request #VLX-BK-34901",
            message="Alex Rivera requested a 4-day reservation for Honda Civic Touring starting Sep 24.",
            category="Booking",
            is_read=False,
            target_role="Provider",
            action_route="ProviderBookings",
            metadata_json={"bookingId": "VLX-BK-34901", "vehicleId": "veh-civic-02"},
        )
        db.add_all([ver_1, notif_1])

        print("⚙️ Initializing System Configuration...")
        sys_cfg = SystemConfigRecord(
            id="default",
            commission_rate=10.0,
            vehicle_categories=[
                {"id": "cat-1", "name": "Economy", "isActive": True, "basePrice": 45},
                {"id": "cat-2", "name": "Sedan", "isActive": True, "basePrice": 65},
                {"id": "cat-3", "name": "SUV", "isActive": True, "basePrice": 95},
                {"id": "cat-4", "name": "Luxury", "isActive": True, "basePrice": 160},
                {"id": "cat-5", "name": "Electric", "isActive": True, "basePrice": 110},
            ],
            regions=[
                {"id": "reg-1", "name": "California - West Coast", "stateOrCountry": "USA", "isActive": True},
                {"id": "reg-2", "name": "Texas - Central Hub", "stateOrCountry": "USA", "isActive": True},
                {"id": "reg-3", "name": "Florida - South Coast", "stateOrCountry": "USA", "isActive": True},
            ],
            pricing_baseline={
                "minDailyRate": 35,
                "defaultDeposit": 150,
                "peakMultiplierBaseline": 1.25,
            },
        )
        db.add(sys_cfg)

        await db.commit()
        print("✅ Database successfully seeded with full initial dataset!")


if __name__ == "__main__":
    asyncio.run(seed_data())

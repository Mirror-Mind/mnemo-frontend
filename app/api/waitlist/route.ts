import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const waitlistSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  countryCode: z.string().min(1, "Country code is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the input
    const validatedData = waitlistSchema.parse(body);
    
    // Check if email already exists
    const existingUser = await prisma.waitlist.findUnique({
      where: { email: validatedData.email }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { 
          success: false,
          error: "Email already registered for waitlist" 
        },
        { status: 400 }
      );
    }
    
    // Create waitlist entry
    const waitlistEntry = await prisma.waitlist.create({
      data: validatedData,
    });
    
    console.log(`✅ New waitlist signup: ${validatedData.name} (${validatedData.email})`);
    
    // Return success response (emails will be handled on client side)
    return NextResponse.json(
      { 
        success: true,
        message: "Successfully joined waitlist!", 
        id: waitlistEntry.id
      },
      { status: 201 }
    );
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: "Validation failed", 
          details: error.errors 
        },
        { status: 400 }
      );
    }
    
    console.error("Waitlist signup error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
} 
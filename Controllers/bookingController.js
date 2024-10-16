import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import Booking from "../models/BookingSchema.js";
import Stripe from "stripe";
import express from "express";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create a Stripe checkout session
export const getCheckoutSession = async (req, res) => {
  try {
    // Get currently booked doctor and user
    const doctor = await Doctor.findById(req.params.doctorId);
    const user = await User.findById(req.userId);

    // Create the Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.CLIENT_SITE_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_SITE_URL}/doctors/${doctor.id}`,
      customer_email: user.email,
      client_reference_id: req.params.doctorId,
      line_items: [
        {
          price_data: {
            currency: "bdt",
            unit_amount: doctor.ticketPrice * 100,
            product_data: {
              name: doctor.name,
              description: doctor.bio,
              images: [doctor.photo],
            },
          },
          quantity: 1,
        },
      ],
    });

    // Send the session to the frontend
    res.status(200).json({ success: true, message: "Session created", session });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error creating checkout session" });
  }
};

// Handle Stripe webhook for successful payment
export const stripeWebhook = express.raw({ type: 'application/json' }, async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    // Construct the event using the Stripe secret
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log(`Webhook signature verification failed: ${err.message}`);
    return res.sendStatus(400);
  }

  // Handle successful payment event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      // Find the user and doctor based on session data
      const user = await User.findOne({ email: session.customer_email });
      const doctor = await Doctor.findById(session.client_reference_id);

      // Create a booking entry only after successful payment
      const booking = new Booking({
        doctor: doctor._id,
        user: user._id,
        ticketPrice: doctor.ticketPrice,
        session: session.id,
      });
      
      await booking.save();
      console.log("Booking saved:", booking);
    } catch (error) {
      console.error("Error saving booking:", error);
      return res.status(500).send("Internal server error");
    }
  }

  // Acknowledge receipt of the event
  res.json({ received: true });
});

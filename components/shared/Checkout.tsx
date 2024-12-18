"use client";
import { useRouter } from 'next/navigation';
import { IEvent } from '@/lib/database/models/event.model';
import { Button } from '../ui/button';
import { toast } from 'sonner'; // Import Sonner

const Checkout = ({ event }: { event: IEvent }) => {
  const router = useRouter();

  const handleCheckout = async () => {
    const checkoutPromise = fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventId: event._id,
        eventTitle: event.title,
        totalAmount: event.price || 0,
      }),
    }).then(async (response) => {
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Checkout failed'); // Trigger error toast
      }

      return data;
    });

    toast.promise(checkoutPromise, {
      loading: 'Processing your checkout...',
      success: 'Checkout successful! Redirecting...',
      error: (err) => `Checkout failed: ${err.message}`,
    });

    try {
      const result = await checkoutPromise;
      router.push('/orders');
    } catch (error) {
      console.error('Error during checkout:', error);
      toast.error(`Error during checkout: ${error instanceof Error ? error.message : 'Something went wrong'}`);
    }
  };

  return (
    <Button onClick={handleCheckout} className="button rounded-full" size="lg">
      Book Ticket
    </Button>
  );
};

export default Checkout;
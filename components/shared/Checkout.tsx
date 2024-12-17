"use client"
import { useRouter } from 'next/navigation';
import { IEvent } from '@/lib/database/models/event.model'
import { Button } from '../ui/button';

const Checkout = ({event}:{event:IEvent}) => {
  const router = useRouter();

  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event._id,
          eventTitle: event.title,
          totalAmount: event.price || 0,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Checkout successful!');
        router.push('/orders'); // Redirect to orders page after successful booking
      } else {
        alert(`Checkout failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <Button onClick={handleCheckout} className='button rounded-full' size="lg">
      Book Ticket
    </Button>
  );
};

export default Checkout;

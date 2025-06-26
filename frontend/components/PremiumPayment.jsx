import React, { useState } from 'react';
import useAuthStore from '../src/store/authStore';
import { paymentApi } from '../src/front2backconnect/api';

const PremiumPayment = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await paymentApi.order();
      const order = response.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'EMS Premium',
        description: 'Premium subscription',
        order_id: order.id,
        handler: async function (response) {
          try {
            const result = await paymentApi.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              user_id: user.id,
            });
            if (result.data.success) {
              alert('Payment successful!');
              onSuccess();
            }
          } catch {
            alert('Payment verification failed!');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: '#3399cc' },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      alert('Payment failed!');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-white border   p-6 text-center">
      <h3 className="text-xl font-semibold mb-4">Premium Feature</h3>
      <p className="mb-2">Requires premium subscription</p>
      <p className="text-2xl font-bold mb-4">₹99/year</p>
      <button
        onClick={handlePayment}
        disabled={loading}
        className={`w-full py-4 px-6   text-white font-semibold ${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
        }`}
      >
        {loading ? 'Processing...' : 'Pay ₹99 & Go Premium'}
      </button>
    </div>
  );
};

export default PremiumPayment;

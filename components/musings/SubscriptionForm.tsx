'use client';

import { useState } from 'react';

export default function SubscriptionForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      // For now, just log the email to console
      // TODO: Integrate with email service (Buttondown, ConvertKit, etc.)
      console.log('New subscription:', email);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Store in localStorage as a temporary solution
      const subscriptions = JSON.parse(localStorage.getItem('musing-subscriptions') || '[]');
      subscriptions.push({
        email,
        subscribedAt: new Date().toISOString(),
      });
      localStorage.setItem('musing-subscriptions', JSON.stringify(subscriptions));

      setStatus('success');
      setMessage('Thank you for subscribing! You\'ll receive updates when new musings are published.');
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
      console.error('Subscription error:', error);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[var(--studio-cream)] to-white rounded-lg border border-[var(--border)] p-8">
      <div className="max-w-2xl mx-auto">
        <h3 className="font-montserrat text-2xl font-bold text-[var(--ink-black)] mb-3">
          Subscribe to Musings
        </h3>
        <p className="font-lora text-[var(--charcoal-wash)] mb-6">
          Receive updates when new musings are published. Typically ~2 posts per month.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              disabled={status === 'loading'}
              className="flex-1 px-4 py-3 border border-[var(--border)] rounded-lg font-lora focus:outline-none focus:ring-2 focus:ring-[var(--moura-teal)] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-3 bg-[var(--moura-teal)] text-white font-montserrat font-medium rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </div>

          {status === 'success' && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <svg
                className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="font-lora text-sm text-green-800">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <svg
                className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="font-lora text-sm text-red-800">{message}</p>
            </div>
          )}
        </form>

        <p className="font-lora text-xs text-[var(--muted-foreground)] mt-4">
          Your email will only be used to send updates about new musings. You can unsubscribe at any time.
        </p>
      </div>
    </div>
  );
}

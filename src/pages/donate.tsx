import Head from 'next/head';
import { ExternalLink, Heart } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui';

const GIVEBUTTER_URL = 'https://givebutter.com/mobilepantry2025';

const GIVING_TIERS = [
  {
    amount: '$10',
    emoji: '🥕',
    description: 'Covers packaging for one full rescue box of fresh produce.',
    borderColor: 'border-[#f29516]',
    featured: false,
  },
  {
    amount: '$25',
    emoji: '🥬',
    description: 'Funds the rescue of ~50 lbs of fresh produce — keeping it out of landfills.',
    borderColor: 'border-primary',
    featured: true,
  },
  {
    amount: '$50',
    emoji: '🍎',
    description: 'Delivers two fully stocked community boxes to Columbus neighbors.',
    borderColor: 'border-[#159977]',
    featured: false,
  },
];

const HOW_IT_WORKS = [
  {
    emoji: '💳',
    title: 'You Donate',
    desc: 'Securely through Givebutter. One-time or recurring — your choice.',
  },
  {
    emoji: '🚐',
    title: 'We Rescue',
    desc: 'MobilePantry picks up cosmetically imperfect produce before it goes to waste.',
  },
  {
    emoji: '📦',
    title: 'Neighbors Eat Fresh',
    desc: 'Produce is packed and delivered to Columbus families and community partners.',
  },
];

export default function DonatePage() {
  return (
    <Layout>
      <Head>
        <title>Donate | MobilePantry</title>
        <meta
          name="description"
          content="Support MobilePantry's mission to rescue fresh produce and deliver it to neighbors across Columbus, Ohio."
        />
      </Head>

      {/* Hero */}
      <section className="bg-primary py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
            <Heart className="w-8 h-8 text-white" fill="white" />
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            Support MobilePantry
          </h1>
          <p className="text-lg sm:text-xl text-white/85 mb-10 leading-relaxed">
            Every contribution helps us rescue fresh, nutritious produce from going to waste —
            and puts it on the tables of Columbus neighbors who need it most.
          </p>
          <a href={GIVEBUTTER_URL} target="_blank" rel="noopener noreferrer">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-semibold text-base h-auto px-10 py-3 shadow-lg"
            >
              Donate Now
              <ExternalLink className="ml-2 w-4 h-4" />
            </Button>
          </a>
          <p className="mt-4 text-sm text-white/60">
            Secure donation powered by Givebutter
          </p>
        </div>
      </section>

      {/* Giving Tiers */}
      <section className="bg-muted py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-center text-foreground mb-3">
            See Your Impact
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Every amount makes a difference. Choose what works for you.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
            {GIVING_TIERS.map(({ amount, emoji, description, borderColor, featured }) => (
              <div
                key={amount}
                className={`bg-white rounded-xl border-2 ${borderColor} p-6 text-center flex flex-col ${
                  featured ? 'shadow-xl sm:-mt-4 sm:mb-0' : 'shadow-sm'
                }`}
              >
                {featured && (
                  <span className="inline-block bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 self-center">
                    Most Popular
                  </span>
                )}
                <div className="text-5xl mb-4">{emoji}</div>
                <p className="text-3xl font-bold font-heading text-foreground mb-3">{amount}</p>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{description}</p>
                <a
                  href={GIVEBUTTER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-6"
                >
                  <Button
                    size="sm"
                    variant={featured ? 'default' : 'outline'}
                    className={
                      featured
                        ? 'w-full bg-primary hover:bg-primary/90 text-white'
                        : 'w-full border-border hover:border-primary hover:text-primary'
                    }
                  >
                    Give {amount}
                  </Button>
                </a>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Want to give a custom amount?{' '}
            <a
              href={GIVEBUTTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              Choose your own on Givebutter →
            </a>
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-center text-foreground mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {HOW_IT_WORKS.map(({ emoji, title, desc }, i) => (
              <div key={title} className="text-center relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden sm:block absolute top-6 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-px bg-border" />
                )}
                <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full text-3xl mb-4 relative z-10">
                  {emoji}
                </div>
                <div className="inline-flex items-center justify-center w-6 h-6 bg-primary text-white text-xs font-bold rounded-full mb-3 relative">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / Bottom CTA */}
      <section className="bg-primary/5 border-t-4 border-primary py-16 px-4">
        <div className="max-w-xl mx-auto text-center">
          <div className="flex justify-center gap-4 mb-6">
            {[
              { emoji: '🍎', bg: 'bg-[#cc3332]' },
              { emoji: '🥕', bg: 'bg-[#f29516]' },
              { emoji: '🍇', bg: 'bg-purple-600' },
              { emoji: '🥬', bg: 'bg-[#159977]' },
            ].map(({ emoji, bg }) => (
              <div
                key={emoji}
                className={`${bg} w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-sm`}
              >
                {emoji}
              </div>
            ))}
          </div>

          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-3">
            A Market on a Mission
          </h2>
          <p className="text-muted-foreground mb-2 leading-relaxed">
            MobilePantry is a registered 501(c)(3) nonprofit organization. Your donation
            may be tax-deductible to the full extent allowed by law.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            EIN: 39-2242376
          </p>

          <a href={GIVEBUTTER_URL} target="_blank" rel="noopener noreferrer">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white font-semibold px-10 h-auto py-3"
            >
              Donate on Givebutter
              <ExternalLink className="ml-2 w-4 h-4" />
            </Button>
          </a>
          <p className="text-xs text-muted-foreground mt-4">
            You&apos;ll be redirected to our secure Givebutter donation page and receive a receipt for your records.
          </p>
        </div>
      </section>
    </Layout>
  );
}

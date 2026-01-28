import Link from 'next/link';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui';

export default function About() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            About MobilePantry
          </h1>
          <p className="text-xl text-white/90 leading-relaxed">
            We&apos;re on a mission to rescue food and feed our community.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-8 text-center">
            Our Mission
          </h2>
          <div className="prose prose-lg max-w-none text-gray-600 text-center">
            <p className="text-xl leading-relaxed mb-6">
              At MobilePantry, we believe good food shouldn&apos;t go to waste and
              getting it to people should be easy and dignified. We solve the
              hardest part of the problem: logistics.
            </p>
            <p className="text-lg leading-relaxed">
              Every day, tons of perfectly good food goes to waste while many in
              our community go hungry. We&apos;re bridging that gap by making food
              donation simple, efficient, and impactful.
            </p>
          </div>
        </div>
      </section>

      {/* How We Work Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-12 text-center">
            How We Work
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Food Rescue
              </h3>
              <p className="text-gray-600">
                We partner with farms, stores, and restaurants to rescue surplus
                food before it&apos;s wasted.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Smart Logistics
              </h3>
              <p className="text-gray-600">
                Our platform makes donating fast, simple, and trackable for
                businesses of all sizes.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Community Delivery
              </h3>
              <p className="text-gray-600">
                We deliver food to community partners and host pop-up
                distributions across Columbus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-8 text-center">
            Our Story
          </h2>
          <div className="prose prose-lg max-w-none text-gray-600 text-center">
            <p className="text-lg leading-relaxed mb-6">
              MobilePantry was founded by Ohio State University students who saw
              an opportunity to make a real difference in their community.
            </p>
            <p className="text-lg leading-relaxed">
              What started as a simple idea has grown into a movement to reduce
              food waste and fight hunger in Columbus. We&apos;re building
              partnerships with local businesses, food banks, and community
              organizations to create a more sustainable and equitable food
              system.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Join Our Mission
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Whether you&apos;re a business with surplus food or someone who wants to
            help, there&apos;s a place for you at MobilePantry.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-gray-100 text-lg px-8"
              >
                Register as a Donor
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 text-lg px-8"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui';

export default function Home() {
  return (
    <Layout>
      {/* Mission Statement Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-primary rounded-3xl p-8 sm:p-12 text-center">
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-relaxed">
              At MobilePantry, we believe good food shouldn&apos;t go to waste and
              getting it to people should be easy and dignified. We solve the
              hardest part of the problem: logistics.
            </p>
          </div>
        </div>
      </section>

      {/* How Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-primary text-center mb-12">
            How
          </h2>
          <HowAccordion />
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-white text-center mb-12">
            The Founders
          </h2>
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <TeamMember
              name="Jack Swartley"
              title="Founder & CEO"
              bio="Jack leads MobilePantry's long-term vision, partnerships, and fundraising strategy. He has experience in raising millions of dollars in Venture Capital at Vessel, performing FP&A for early stage startups, and as a government official."
              variant="founder"
            />
            <TeamMember
              name="Sky Sie"
              title="Founder & COO"
              bio="Sky oversees day to day operations and ensures operational excellence within the team. He has experience working in tech startups, Private Equity, and is an incoming business analyst intern at JPMorgan Chase"
              variant="founder"
            />
          </div>
        </div>
      </section>

      {/* Board Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-primary text-center mb-12">
            The Board
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <TeamMember
              name="Neil Collins"
              bio="Neil is a serial entrepreneur and startup leader with an MBA from Harvard Business School. He is a leader at Innovate New Albany, where he supports and mentors early-stage founders and growing companies."
              variant="board"
            />
            <TeamMember
              name="Greg Pugh"
              bio="Greg is a serial entrepreneur and Senior Advisory Partner at Rev1 Ventures. He brings deep experience in building and scaling startups and supports MobilePantry with strategic guidance and growth expertise."
              variant="board"
            />
            <TeamMember
              name="Derrick Brent"
              bio="Derrick holds a JD from Northwestern and has served as an attorney, professor, and Acting Under Secretary of Commerce for Intellectual Property and Acting Director of the USPTO. He brings deep expertise in law, policy, and intellectual property to MobilePantry's board."
              variant="board"
            />
            <TeamMember
              name="Rakesh Thaploo"
              bio="Rakesh is a senior technology and consulting executive and a Partner at Kyndryl. He brings deep experience working with grocery stores and retailers, helping us source donor clients."
              variant="board"
            />
            <TeamMember
              name="James Terranova"
              bio="Jim was a Managing Director at Wilson Sonsini Goodrich & Rosati and brings deep experience at the intersection of law, finance, and technology. He supports MobilePantry with strategic and organizational guidance."
              variant="board"
            />
            <TeamMember
              name="Keith Monda"
              bio="Keith is the former COO of Coach and a former director at Feeding America. He brings deep leadership experience in both global business and nonprofit food systems to MobilePantry's board."
              variant="board"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ready to make a difference?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join us in rescuing food and feeding Columbus.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="text-lg px-8">
              Register Now
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}

function HowAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const items = [
    {
      title: 'Rescuing Food',
      content:
        "We partner with farms, stores, and restaurants to rescue surplus food before it's wasted. Our platform makes donating fast, simple, and trackable.",
    },
    {
      title: 'Serving The Community',
      content:
        'We deliver food to community partners and host pop-up distributions across Columbus to reach people where they live.',
    },
    {
      title: 'Efficiency',
      content:
        'By reducing friction and waste, we get more good food to more people quickly and efficiently.',
    },
  ];

  return (
    <div className="space-y-0">
      {items.map((item, index) => (
        <div key={index} className="border-t border-primary last:border-b">
          <button
            className="w-full py-4 flex items-center justify-between text-left"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <span className="text-lg font-medium text-primary">{item.title}</span>
            <span className="text-2xl text-gray-400">
              {openIndex === index ? '−' : '+'}
            </span>
          </button>
          {openIndex === index && (
            <div className="pb-6 pl-4">
              <p className="text-primary font-medium">{item.content}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

interface TeamMemberProps {
  name: string;
  title?: string;
  bio: string;
  variant: 'founder' | 'board';
}

function TeamMember({ name, title, bio, variant }: TeamMemberProps) {
  const isFounder = variant === 'founder';

  return (
    <div className="flex flex-col items-center text-center">
      {/* Placeholder Avatar */}
      <div
        className={`w-48 h-48 rounded-full mb-6 flex items-center justify-center text-4xl font-bold ${
          isFounder
            ? 'bg-white/20 text-white'
            : 'bg-gray-200 text-gray-400'
        }`}
      >
        {name
          .split(' ')
          .map((n) => n[0])
          .join('')}
      </div>

      <h3
        className={`text-2xl font-bold mb-1 ${
          isFounder ? 'text-white' : 'text-primary'
        }`}
      >
        {name}
      </h3>

      {title && (
        <p className={`mb-4 ${isFounder ? 'text-white/90' : 'text-gray-600'}`}>
          {title}
        </p>
      )}

      <p
        className={`text-sm leading-relaxed ${
          isFounder ? 'text-white/80' : 'text-gray-600'
        }`}
      >
        {bio}
      </p>
    </div>
  );
}

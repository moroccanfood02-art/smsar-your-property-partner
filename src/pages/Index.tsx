import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import LatestProperties from '@/components/home/LatestProperties';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import CallToAction from '@/components/home/CallToAction';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturedProperties />
        <WhyChooseUs />
        <LatestProperties />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

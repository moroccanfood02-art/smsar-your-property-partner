import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import SmartAdSection from '@/components/home/SmartAdSection';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import LatestProperties from '@/components/home/LatestProperties';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import CallToAction from '@/components/home/CallToAction';
import AdBar from '@/components/home/AdBar';
import { usePromotions } from '@/hooks/usePromotions';

const Index: React.FC = () => {
  const { promotions } = usePromotions();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <AdBar ads={promotions.slice(0, 10)} rotationInterval={4000} />
        <SmartAdSection />
        <AdBar ads={promotions.slice(10, 20)} rotationInterval={5000} />
        <FeaturedProperties />
        <AdBar ads={promotions.slice(20, 30)} rotationInterval={6000} />
        <WhyChooseUs />
        <LatestProperties />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

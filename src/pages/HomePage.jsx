import React from 'react';
import { Hero } from '../components/Hero';
import { Services } from '../components/Services';
import { Features } from '../components/Features';
import { PremiumAmenities } from '../components/PremiumAmenities';
import { ContactInfo } from '../components/ContactInfo';
import { CTA } from '../components/CTA';

const HomePage = () => {
  return (
    <div>
      <title>Home | FitPro GYM</title>
      <meta name="description" content="FitProGym offers 24/7 gym access, expert personal trainers, premium fitness equipment, and affordable membership plans designed for fast results. Build muscle, lose weight, and transform your health with a modern, motivating workout environment. Join FitProGym today and start your fitness journey with the best gym in your area." />
      <Hero/>
      <Services/>
      <Features/>
      <PremiumAmenities/>
      <ContactInfo/>
      <CTA/>
    </div>
  )
}

export default HomePage

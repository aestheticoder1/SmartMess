import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import FeaturesSection from '../components/FeatureSection'
import TestimonialsSection from '../components/TestimonialSection'

const Home = () => {
  return (
    <div>
        {/* <Navbar/> */}
        <Hero/>
        <FeaturesSection/>
        <TestimonialsSection/>
    </div>
  )
}

export default Home
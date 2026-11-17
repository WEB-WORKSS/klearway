import { useMeta } from '../hooks/useMeta.js';
import { useReveal } from '../hooks/useReveal.js';
import Hero from '../components/sections/Hero.jsx';
import Problem, { Highlights } from '../components/sections/Problem.jsx';
import { HowItWorks, DemoTour } from '../components/sections/Product.jsx';
import Features from '../components/sections/Features.jsx';
import { WhoFor, MvpStatus } from '../components/sections/Audience.jsx';
import Trust from '../components/sections/Trust.jsx';
import Aws from '../components/sections/Aws.jsx';
import Pricing from '../components/sections/Pricing.jsx';
import Team from '../components/sections/Team.jsx';
import Faq from '../components/sections/Faq.jsx';
import { PilotForm, Contact } from '../components/sections/Forms.jsx';

export default function Home() {
  useMeta('/');
  useReveal('home');
  return (
    <>
      <Hero />
      <Highlights />
      <Problem />
      <HowItWorks />
      <DemoTour />
      <Features />
      <WhoFor />
      <MvpStatus />
      <Trust />
      <Aws />
      <Pricing />
      <Team />
      <Faq />
      <PilotForm />
      <Contact />
    </>
  );
}

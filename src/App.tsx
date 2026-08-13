import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ProblemSolution } from '@/components/ProblemSolution';
import { Roulette } from '@/components/Roulette';
import { BeforeAfter } from '@/components/BeforeAfter';
import { Donation } from '@/components/Donation';
import { Memberships } from '@/components/Memberships';
import { ImpactModel } from '@/components/ImpactModel';
import { OurJourney } from '@/components/OurJourney';
import { Roadmap } from '@/components/Roadmap';
import { FamilyApplication } from '@/components/FamilyApplication';
import { Contact } from '@/components/Contact';
import { CommunityGallery } from '@/components/CommunityGallery';
import { DonationGuidePage } from '@/components/DonationGuidePage';
import { Footer } from '@/components/Footer';
import { SocialRail } from '@/components/SocialRail';
import { AuthProvider } from '@/admin/auth/AuthContext';
import { AdminApp } from '@/admin/AdminApp';
import { useSiteSettings } from '@/hooks/useSiteSettings';

function PublicSite() {
  const settings = useSiteSettings();

  useEffect(() => {
    if (settings.seo.metaTitle) document.title = settings.seo.metaTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && settings.seo.metaDescription) metaDesc.setAttribute('content', settings.seo.metaDescription);
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords && settings.seo.keywords) metaKeywords.setAttribute('content', settings.seo.keywords);
  }, [settings.seo.metaTitle, settings.seo.metaDescription, settings.seo.keywords]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <SocialRail />
      <main className="lg:pl-[88px]">
        <Hero />
        <ProblemSolution />
        <Roulette />
        <BeforeAfter />
        <Donation />
        <Memberships />
        <ImpactModel />
        <OurJourney />
        <Roadmap />
        <FamilyApplication />
        <CommunityGallery />
        <Contact />
      </main>
      <Footer className="lg:pl-[88px] pb-24 lg:pb-0" />
    </div>
  );
}

function DonationGuideSite() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <SocialRail />
      <main className="lg:pl-[88px]">
        <DonationGuidePage />
      </main>
      <Footer className="lg:pl-[88px] pb-24 lg:pb-0" />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/donation-guide" element={<DonationGuideSite />} />
          <Route path="/*" element={<PublicSite />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

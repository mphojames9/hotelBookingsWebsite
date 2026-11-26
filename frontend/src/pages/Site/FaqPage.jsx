import './Site.css';
import React, { useState } from 'react';
import { CtaBand, Faq, Intro, PageHero, useDocTitle } from '../../components/Editorial/Editorial';
import { FAQS, FAQ_CATEGORIES, IMG } from '../../data/site';

const FaqPage = () => {
  useDocTitle('FAQ');
  const [cat, setCat] = useState(FAQ_CATEGORIES[0]);
  const items = FAQS.filter((f) => f.cat === cat);

  return (
    <div className="ed">
      <PageHero eyebrow="Help centre" title="Frequently asked questions" lead="Quick answers about booking, your stay and our hotels." image={IMG.hero2} crumbs={[{ label: 'FAQ' }]} />
      <Intro>Cannot find what you need? Our team is here every day and replies to messages within one working day.</Intro>
      <section className="ed-sec">
        <div className="ed-filters" role="tablist" aria-label="Question topics">
          {FAQ_CATEGORIES.map((c) => <button key={c} type="button" role="tab" aria-selected={cat === c} className={cat === c ? 'on' : ''} onClick={() => setCat(c)}>{c}</button>)}
        </div>
        <Faq key={cat} items={items} />
      </section>
      <CtaBand title="Still have a question?" text="Send us a message and we will get back to you." to="/contact" label="Contact us" />
    </div>
  );
};

export default FaqPage;

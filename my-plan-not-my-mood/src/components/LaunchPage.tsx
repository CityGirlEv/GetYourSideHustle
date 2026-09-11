import React, { useState } from 'react';
import { ChevronDown, FileText } from 'lucide-react';
import { HEADER_CONTENT_OFFSET } from '../lib/headerClearance';
import { launchPageById, type LaunchPageId } from '../lib/launchPages';
import { HOUSE_BRAND_NAME } from '../lib/teeSalesPlaybook';
import { Logo } from './Logo';
import { MailingListSignup } from './MailingListSignup';

interface LaunchPageProps {
  pageId: LaunchPageId;
}

export const LaunchPage: React.FC<LaunchPageProps> = ({ pageId }) => {
  const page = launchPageById(pageId);
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div
      className={`bg-[#FAF8F5] min-h-[60vh] ${HEADER_CONTENT_OFFSET}`}
      id={`${page.id}-page`}
      data-testid={`${page.id}-page`}
    >
      <section className="bg-gradient-to-br from-[#FFF7ED] via-[#FFEDD5] to-[#FEF3C7] text-[#9A3412] border-b-4 border-[#EA580C] py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <Logo
              variant="seal-only"
              size="xl"
              className="shrink-0 drop-shadow-lg !w-24 !h-24 sm:!w-32 sm:!h-32"
            />
            <div className="text-center sm:text-left space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#EA580C] text-white text-[10px] font-mono font-black uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5" /> {page.kicker}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black uppercase tracking-tight leading-tight text-[#9A3412]">
                {page.title}
              </h1>
              <p className="text-sm sm:text-base text-[#C2410C] font-medium max-w-2xl leading-relaxed">
                {page.lede}
              </p>
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#9A3412]">
                {HOUSE_BRAND_NAME} — a NonNegotiation brand
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        {page.sections.map((section) => (
          <article key={section.heading} className="bg-white border-2 border-[#1F1917] rounded-3xl p-5 sm:p-6 space-y-2">
            <h2 className="text-lg font-serif font-black uppercase tracking-tight text-[#1F1917]">{section.heading}</h2>
            <p className="text-sm text-[#3F3832] font-medium leading-relaxed">{section.body}</p>
          </article>
        ))}

        {page.faqs?.length ? (
          <div className="space-y-3" data-testid="faq-list">
            {page.faqs.map((item, index) => {
              const open = openFaq === index;
              return (
                <div key={item.question} className="bg-white border-2 border-[#1F1917] rounded-3xl overflow-hidden">
                  <button
                    type="button"
                    className="w-full min-h-[44px] px-5 py-3 flex items-center justify-between gap-3 text-left cursor-pointer"
                    aria-expanded={open}
                    onClick={() => setOpenFaq(open ? -1 : index)}
                  >
                    <span className="text-sm font-black uppercase tracking-tight text-[#1F1917]">{item.question}</span>
                    <ChevronDown className={`w-4 h-4 shrink-0 text-[#C2410C] transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>
                  {open ? <p className="px-5 pb-4 text-sm text-[#3F3832] font-medium leading-relaxed">{item.answer}</p> : null}
                </div>
              );
            })}
          </div>
        ) : null}

        {page.showMailingList ? <MailingListSignup compact /> : null}
      </section>
    </div>
  );
};

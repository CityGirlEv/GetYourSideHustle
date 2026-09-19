import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Award, BadgeCheck, BookOpen, CalendarDays, CheckCircle2, Clock, FileText, Flame, FlaskConical, History, Images, ListChecks, Lock, LogIn, LogOut, Mail, Map, Megaphone, Menu, Package, ShieldCheck, Shirt, ShoppingBag, Sparkles, Stamp, User, UserPlus, Users, X } from 'lucide-react';
import { AppUser, canAccessAdminPortal, getRolePermissions, getRoleLabel } from '../lib/userAuth';
import { HEADER_TRAILING_LINKS, StoreRoute } from '../lib/storeRoutes';
import type { AdminPortalTab } from '../lib/adminPortalTabs';
import { headerAdminNavGroups } from '../lib/planPage';
import type { HeaderAdminNavId } from '../lib/planPage';
import { canSeeMemberships } from '../lib/membership';
import { ComingSoonBadge } from './ComingSoonBadge';
import { HeaderQuoteBar } from './HeaderQuoteBar';
import { HEADER_BRAND_SLOT_CLASS, HEADER_MOBILE_MENU_CLASS, HEADER_MOBILE_OVERLAY_CLASS, HEADER_STICKY_CLASS, MOBILE_NAV_SECTION_LABELS } from '../lib/headerClearance';
import { GEAR_PAGE_LABEL, GEAR_SHOP_LABEL } from '../lib/gearSelections';
import { HOUSE_BRAND_KICKER } from '../lib/teeSalesPlaybook';

const HEADER_ADMIN_ICONS: Record<HeaderAdminNavId, React.ReactNode> = {
  plan: <FileText className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />,
  agenda: <CheckCircle2 className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />,
  tasks: <ListChecks className="w-3.5 h-3.5 text-[#1F1917] shrink-0" />,
  testing: <FlaskConical className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />,
  'gear-selections': <Shirt className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />,
  timesheet: <Clock className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />,
  'daily-progress': <FileText className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />,
  users: <Users className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />,
  memberships: <BadgeCheck className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />,
  certificates: <Award className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />,
  emails: <Mail className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />,
  'mailing-list': <Mail className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />,
  factory: <Sparkles className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />,
  calendar: <CalendarDays className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />,
  'asset-library': <Images className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />,
  'logo-concepts': <Stamp className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />,
  growth: <Megaphone className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />,
  budget: <Sparkles className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />,
  pay: <Sparkles className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />,
  'previous-budget': <History className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />,
  'inventory-pricing': <Package className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />,
  sitemap: <Map className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />,
  guides: <BookOpen className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />,
};

interface HeaderProps {
  cartCount: number;
  currentUser?: AppUser | null;
  storeRoute?: StoreRoute;
  hasMembershipAccess?: boolean;
  onOpenCart: () => void;
  onOpenChallenge: () => void;
  onOpenAffirmations?: () => void;
  onNavigate: (route: StoreRoute) => void;
  onScrollToSection: (id: string, shopFilter?: 'planners' | 'gear') => void;
  onOpenJoin: () => void;
  onOpenProposal?: (tab?: AdminPortalTab) => void;
  onOpenUserAuth?: () => void;
  onLogoutUser?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  currentUser,
  storeRoute = 'home',
  hasMembershipAccess = false,
  onOpenCart,
  onOpenChallenge,
  onOpenAffirmations,
  onNavigate,
  onScrollToSection,
  onOpenJoin,
  onOpenProposal,
  onOpenUserAuth,
  onLogoutUser,
}) => {
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState<boolean>(false);
  const [isShopMenuOpen, setIsShopMenuOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const adminMenuRef = React.useRef<HTMLDivElement>(null);
  const shopMenuRef = React.useRef<HTMLDivElement>(null);
  const headerRef = React.useRef<HTMLElement>(null);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleMobileNavClick = (sectionId: string, shopFilter?: 'planners' | 'gear') => {
    closeMobileMenu();
    handleNavClick(sectionId, shopFilter);
  };

  const handleMobileShopNav = (filter: 'planners' | 'gear') => {
    closeMobileMenu();
    handleShopNav(filter);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target as Node)) {
        setIsAdminMenuOpen(false);
      }
      if (shopMenuRef.current && !shopMenuRef.current.contains(event.target as Node)) {
        setIsShopMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const el = headerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const update = () => setHeaderHeight(Math.round(el.getBoundingClientRect().height));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMobileMenu();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isMobileMenuOpen]);

  // Track scroll position to update active section indicator (home page only)
  useEffect(() => {
    if (storeRoute !== 'home') return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      const sections = ['hero', 'mood-tool', 'receipts'];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [storeRoute]);

  useEffect(() => {
    if (storeRoute === 'gear' || storeRoute === 'planners') {
      setActiveSection('products');
    } else if (storeRoute === 'join') {
      setActiveSection('join');
    } else if (storeRoute === 'pay') {
      setActiveSection('pay');
    } else if (storeRoute === 'home') {
      setActiveSection('hero');
    }
    closeMobileMenu();
  }, [storeRoute]);

  const handleNavClick = (sectionId: string, shopFilter?: 'planners' | 'gear') => {
    setActiveSection(sectionId);
    onScrollToSection(sectionId, shopFilter);
  };

  const handleShopNav = (filter: 'planners' | 'gear') => {
    setIsShopMenuOpen(false);
    setActiveSection('products');
    if (filter === 'gear') onNavigate('gear');
    else onNavigate('planners');
  };

  const hasAdminAccess = canAccessAdminPortal(currentUser);
  const adminPermissions = getRolePermissions(currentUser);
  const adminNavGroups = headerAdminNavGroups(adminPermissions);
  const showMemberships = canSeeMemberships(currentUser);

  const openAdminTab = (tab: HeaderAdminNavId) => {
    if (hasAdminAccess && onOpenProposal) onOpenProposal(tab);
    else if (onOpenUserAuth) onOpenUserAuth();
  };

  return (
    <>
    <header
      ref={headerRef}
      className={`${HEADER_STICKY_CLASS} flex flex-col bg-[#FAF8F5] text-[#1F1917] shadow-[0_6px_20px_rgba(31,25,23,0.08)]`}
      data-testid="site-header"
    >
      <div className="relative z-10 flex flex-col bg-[#FAF8F5]">
      <HeaderQuoteBar className="order-1 md:order-2" />
      <div className="order-2 md:order-1 bg-[#FAF8F5] border-b border-[#E5DFD3]">
      <div className="w-full px-1 sm:px-2 py-0">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] md:flex md:items-center md:justify-between gap-2 sm:gap-3 min-h-[3.25rem] sm:min-h-[3.5rem] py-1">
          {/* Mobile — cart + hamburger stay in-flow so the brand cannot overlay Admin Studio */}
          <div className="flex md:hidden items-center gap-2 shrink-0 self-center col-start-1 row-start-1 pr-1">
            <button
              type="button"
              onClick={onOpenCart}
              className="relative p-2 rounded-xl bg-white border-2 border-[#1F1917] text-[#1F1917] hover:border-[#C2410C] hover:bg-[#FFEDD5] transition-all cursor-pointer shrink-0"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#C2410C] text-white font-black text-[9px] h-4 w-4 rounded-full flex items-center justify-center border border-white">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-xl bg-[#EA580C] text-white border-2 border-[#FDBA74] hover:bg-[#C2410C] transition-all cursor-pointer shrink-0 shadow-[0_4px_12px_rgba(234,88,12,0.28)]"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Wordmark only — circular seal removed so it cannot cover Admin Studio */}
          <div
            className={`${HEADER_BRAND_SLOT_CLASS} cursor-pointer group col-start-2 row-start-1 justify-self-center md:justify-self-auto`}
            data-testid="site-header-brand"
            onClick={() => {
              setActiveSection('hero');
              onNavigate('home');
            }}
          >
            <span className="font-serif font-black text-sm sm:text-lg lg:text-xl text-[#1F1917] tracking-tight uppercase leading-tight">
              MY PLAN, <span className="text-[#C2410C] italic font-black">NOT MY MOOD</span>
            </span>
            <span className="text-[8px] sm:text-[10px] lg:text-xs font-mono uppercase tracking-widest text-[#3F3832] font-extrabold">
              {HOUSE_BRAND_KICKER}
            </span>
          </div>
          <div className="md:hidden col-start-3 row-start-1 w-[5.75rem] shrink-0" aria-hidden="true" />

          {/* Right — actions + sub-menu */}
          <div className="hidden md:flex flex-col items-end gap-3 sm:gap-4 shrink-0 min-w-0 pb-1">
            <div className="flex flex-nowrap items-center justify-end gap-1.5">
              <button
                type="button"
                data-testid="header-nav-home"
                onClick={() => {
                  setActiveSection('hero');
                  onNavigate('home');
                }}
                className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 shrink-0 whitespace-nowrap text-xs font-bold ${
                  storeRoute === 'home' && activeSection === 'hero'
                    ? 'bg-[#C2410C] text-white shadow-sm font-black'
                    : 'hover:bg-[#FFEDD5] text-[#1F1917] border-2 border-[#E5DFD3]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                Home
              </button>

              <div className="relative shrink-0" ref={shopMenuRef}>
                <button
                  type="button"
                  data-testid="header-shop-menu"
                  onClick={() => setIsShopMenuOpen((prev) => !prev)}
                  className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 shrink-0 whitespace-nowrap text-xs font-bold ${
                    storeRoute === 'gear' || storeRoute === 'planners' || activeSection === 'products'
                      ? 'bg-[#C2410C] text-white shadow-sm font-black'
                      : 'hover:bg-[#FFEDD5] text-[#1F1917] border-2 border-[#E5DFD3]'
                  }`}
                  aria-expanded={isShopMenuOpen}
                >
                  <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                  Shop
                  <span className="text-[9px] opacity-80">▼</span>
                </button>
                {isShopMenuOpen && (
                  <div className="absolute top-full left-0 mt-1.5 w-56 bg-white border-2 border-[#1F1917] rounded-xl shadow-2xl p-1.5 z-[10000] animate-fadeIn text-[#1F1917]">
                    <button
                      type="button"
                      data-testid="header-shop-menu-gear"
                      onClick={() => handleShopNav('gear')}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#FFEDD5] text-xs font-black uppercase cursor-pointer ${
                        storeRoute === 'gear' ? 'bg-[#FFEDD5] text-[#C2410C]' : ''
                      }`}
                    >
                      {GEAR_PAGE_LABEL}
                    </button>
                    <button
                      type="button"
                      data-testid="header-shop-planners"
                      onClick={() => handleShopNav('planners')}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#FFEDD5] text-xs font-black uppercase cursor-pointer ${
                        storeRoute === 'planners' ? 'bg-[#FFEDD5] text-[#C2410C]' : ''
                      }`}
                    >
                      Planners
                    </button>
                    <div className="border-t border-[#E5DFD3] mt-1 pt-1 space-y-0.5">
                      <div className="px-2.5 py-0.5 text-[8px] font-mono font-black text-[#3F3832] uppercase tracking-wider">
                        Coming Soon
                      </div>
                      {['Workshops', 'Bundles', 'Gift Cards'].map((label) => (
                        <button
                          key={label}
                          type="button"
                          disabled
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase text-[#3F3832] opacity-50 cursor-not-allowed"
                          title="Coming soon"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {showMemberships && (
              <button
                type="button"
                onClick={onOpenJoin}
                className={`px-2.5 py-1 rounded-xl font-black text-xs transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm shrink-0 whitespace-nowrap border ${
                  storeRoute === 'join'
                    ? 'bg-[#EA580C] text-white border-[#FDBA74] shadow-[0_4px_12px_rgba(234,88,12,0.28)]'
                    : 'bg-gradient-to-r from-[#C2410C] to-[#EA580C] text-white border-[#FDBA74] hover:from-[#EA580C] hover:to-[#C2410C]'
                }`}
                title="Memberships — Coming Soon"
              >
                <UserPlus className="w-3.5 h-3.5 shrink-0" />
                Join
                <ComingSoonBadge className="bg-white/90" />
              </button>
              )}

              {HEADER_TRAILING_LINKS.map((link) => (
                <button
                  key={link.route}
                  type="button"
                  data-testid={`header-nav-${link.route}`}
                  onClick={() => onNavigate(link.route)}
                  className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 shrink-0 whitespace-nowrap text-xs font-bold ${
                    storeRoute === link.route
                      ? 'bg-[#C2410C] text-white shadow-sm font-black'
                      : 'hover:bg-[#FFEDD5] text-[#1F1917] border-2 border-[#E5DFD3]'
                  }`}
                >
                  {link.label}
                </button>
              ))}

              <div className="relative group shrink-0" ref={adminMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    if (!hasAdminAccess) {
                      if (onOpenUserAuth) onOpenUserAuth();
                      else alert(`Access Denied: Admin authorization required. Your current role is "${currentUser?.role || 'Guest'}". Please log in as an Admin.`);
                    } else {
                      setIsAdminMenuOpen((prev) => !prev);
                    }
                  }}
                  className={`transition-all inline-flex items-center gap-1 cursor-pointer font-black px-2.5 py-1 rounded-xl border-2 shadow-sm whitespace-nowrap text-xs ${
                    hasAdminAccess
                      ? 'bg-white text-[#9A3412] border-[#FDBA74] hover:bg-[#FFEDD5] hover:text-[#C2410C]'
                      : 'bg-gray-100 text-gray-500 border-gray-300 hover:bg-gray-200'
                  }`}
                  title={hasAdminAccess ? 'Admin Command Portal (Click to toggle menu)' : 'Admin Portal (Gated)'}
                >
                  {hasAdminAccess ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  )}
                  Admin
                  <span className="text-[9px] text-[#C2410C]">▼</span>
                </button>

                <div
                  className={`absolute top-full right-0 mt-1 w-[min(calc(100vw-1.5rem),26rem)] bg-white border-2 border-[#1F1917] rounded-xl shadow-2xl p-1 z-[10000] animate-fadeIn text-[#1F1917] ${
                    isAdminMenuOpen ? 'grid grid-cols-2 gap-0' : 'hidden'
                  }`}
                  data-testid="header-admin-menu"
                >
                  {adminNavGroups.map((group) => (
                    <div
                      key={group.id}
                      data-testid={`header-admin-group-${group.id}`}
                      className={`${
                        group.id === 'hub' || group.id === 'content' ? 'col-span-2' : ''
                      } ${group.underHub ? 'pl-3' : ''} ${
                        group.id === 'pinned' ? 'col-span-2 border-t border-[#F0E8DC] mt-0.5 pt-0.5' : ''
                      }`}
                    >
                      <p className="px-2 pt-1 pb-0 text-[9px] font-black uppercase tracking-[0.14em] text-[#9A6B3D] leading-none">
                        {group.label}
                      </p>
                      {group.items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setIsAdminMenuOpen(false);
                            openAdminTab(item.id);
                          }}
                          className={`w-full min-h-8 px-2 py-1 rounded-lg hover:bg-[#FFEDD5] transition-colors inline-flex items-center gap-1.5 cursor-pointer min-w-0 ${
                            item.nested ? 'pl-4' : ''
                          }`}
                          title={item.label}
                          data-testid={item.id === 'emails' ? 'admin-nav-emails' : `header-admin-nav-${item.id}`}
                        >
                          {HEADER_ADMIN_ICONS[item.id]}
                          <span className={`font-extrabold text-[11px] leading-tight ${item.id === 'budget' ? 'text-[#C2410C]' : 'text-[#1F1917]'}`}>
                            {item.label}
                          </span>
                          {item.id === 'memberships' ? <ComingSoonBadge /> : null}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {currentUser ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={onOpenUserAuth}
                    className="px-2 py-1 rounded-xl bg-[#FFEDD5] border-2 border-[#C2410C] text-[#1F1917] font-black text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm hover:bg-amber-200 transition-colors whitespace-nowrap"
                    title="Manage User Roles & Profile"
                  >
                    <User className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />
                    <span className="truncate max-w-[90px] hidden sm:inline">{currentUser.name.split(' ')[0]}</span>
                    <span className="inline-flex shrink-0 items-center justify-center box-border px-2 py-[3px] min-h-[18px] text-[9px] font-mono bg-[#C2410C] text-white rounded uppercase font-black whitespace-nowrap leading-none">
                      {getRoleLabel(currentUser.role)}
                    </span>
                  </button>
                  {onLogoutUser && !isAdminMenuOpen && (
                    <button
                      type="button"
                      onClick={onLogoutUser}
                      className="px-2 py-1 rounded-xl bg-[#C2410C] hover:bg-red-700 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-sm border-2 border-[#1F1917] transition-all whitespace-nowrap"
                      title="Log Out of Account"
                    >
                      <LogOut className="w-3.5 h-3.5 text-white shrink-0" />
                      <span className="hidden sm:inline">Log Out</span>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onOpenUserAuth}
                  className="px-2.5 py-1 rounded-xl bg-white border-2 border-[#1F1917] text-[#1F1917] hover:bg-[#FFEDD5] transition-all font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-sm whitespace-nowrap"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}

              <button
                type="button"
                onClick={onOpenCart}
                className="relative p-1.5 rounded-xl bg-white border-2 border-[#1F1917] text-[#1F1917] hover:border-[#C2410C] hover:bg-[#FFEDD5] transition-all cursor-pointer shadow-md shrink-0"
                aria-label="View Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4 text-[#1F1917]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#C2410C] text-white font-black text-[9px] h-4 w-4 rounded-full flex items-center justify-center animate-bounce shadow-md border border-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            <nav
              className="flex flex-wrap items-center justify-end gap-x-3 gap-y-0.5 text-xs font-bold font-sans w-full"
              aria-label="Store sections"
            >
            {onOpenAffirmations && (
              <button
                type="button"
                data-testid="header-nav-affirmations"
                onClick={onOpenAffirmations}
                className="px-2.5 py-0.5 rounded-xl bg-gradient-to-r from-amber-100 via-orange-100 to-amber-100 border border-[#C2410C] text-[#C2410C] hover:bg-[#C2410C] hover:text-white font-black text-xs transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm shrink-0 whitespace-nowrap"
                title={hasMembershipAccess ? 'Open Daily Affirmations (20-30s Reset)' : 'Join to unlock Affirmations'}
              >
                {!hasMembershipAccess && <Lock className="w-3 h-3 shrink-0 opacity-70" />}
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                Affirmations
              </button>
            )}

            <button
              type="button"
              data-testid="header-nav-challenge"
              onClick={onOpenChallenge}
              className="px-2.5 py-0.5 rounded-xl bg-[#FFEDD5] border border-[#C2410C] text-[#C2410C] hover:bg-[#C2410C] hover:text-white font-black text-xs transition-all cursor-pointer shrink-0 whitespace-nowrap inline-flex items-center gap-1"
              title={hasMembershipAccess ? 'Start the 7-Day Challenge' : 'Join to unlock the 7-Day Challenge'}
            >
              {!hasMembershipAccess && <Lock className="w-3 h-3 shrink-0 opacity-70" />}
              7-Day Challenge
            </button>

            <button
              type="button"
              data-testid="header-nav-mood"
              onClick={() => handleNavClick('mood-tool')}
              className={`py-0.5 transition-colors cursor-pointer shrink-0 whitespace-nowrap border-b-2 ${
                activeSection === 'mood-tool'
                  ? 'border-[#C2410C] text-[#C2410C] font-black'
                  : 'border-transparent text-[#1F1917] hover:text-[#C2410C]'
              }`}
            >
              What&apos;s Your Mood?
            </button>

            <button
              type="button"
              data-testid="header-nav-receipts"
              onClick={() => handleNavClick('receipts')}
              className={`py-0.5 transition-colors cursor-pointer inline-flex items-center gap-1 shrink-0 whitespace-nowrap border-b-2 ${
                activeSection === 'receipts'
                  ? 'border-[#C2410C] text-[#C2410C] font-black'
                  : 'border-transparent text-[#1F1917] hover:text-[#C2410C]'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />
              Plan Receipts
            </button>

            <button
              type="button"
              onClick={() => handleShopNav('gear')}
              className={`px-2.5 py-0.5 rounded-xl border-2 font-black text-xs transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                storeRoute === 'gear'
                  ? 'border-[#C2410C] bg-[#FFEDD5] text-[#C2410C]'
                  : 'border-[#1F1917] bg-white text-[#1F1917] hover:bg-[#FFEDD5]'
              }`}
              data-testid="header-shop-gear"
            >
              {GEAR_SHOP_LABEL}
            </button>
            </nav>
          </div>
        </div>
      </div>
      </div>
      </div>
    </header>
    {isMobileMenuOpen &&
      typeof document !== 'undefined' &&
      createPortal(
        <>
            <button
              type="button"
              className={`${HEADER_MOBILE_OVERLAY_CLASS} inset-x-0 bottom-0 left-0 right-0`}
              style={{ top: headerHeight || 96 }}
              aria-label="Close menu"
              onClick={closeMobileMenu}
            />
            <nav
              className={HEADER_MOBILE_MENU_CLASS}
              style={{ top: headerHeight || 96 }}
              aria-label="Mobile navigation"
              data-testid="header-mobile-menu"
            >
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  closeMobileMenu();
                  setActiveSection('hero');
                  onNavigate('home');
                }}
                className="min-h-[44px] px-3 py-2.5 rounded-2xl bg-[#C2410C] text-white text-xs font-black uppercase cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Home
              </button>
              <button
                type="button"
                data-testid="header-mobile-shop-menu"
                onClick={() => handleMobileShopNav('gear')}
                className={`min-h-[44px] px-3 py-2.5 rounded-2xl text-xs font-black uppercase cursor-pointer flex items-center justify-center gap-1.5 ${
                  storeRoute === 'gear' || storeRoute === 'planners'
                    ? 'bg-[#C2410C] text-white'
                    : 'bg-[#FAF8F5] border-2 border-[#1F1917]'
                }`}
              >
                <ShoppingBag className="w-4 h-4" /> Shop
              </button>
              {showMemberships && (
              <button
                type="button"
                onClick={() => {
                  closeMobileMenu();
                  onOpenJoin();
                }}
                className="min-h-[44px] px-3 py-2.5 rounded-2xl bg-[#EA580C] text-white text-xs font-black uppercase cursor-pointer flex items-center justify-center gap-1.5 border-2 border-[#FDBA74]"
              >
                <UserPlus className="w-4 h-4" /> Join
                <ComingSoonBadge className="bg-white/90" />
              </button>
              )}
              {HEADER_TRAILING_LINKS.map((link) => (
                <button
                  key={link.route}
                  type="button"
                  data-testid={`header-mobile-nav-${link.route}`}
                  onClick={() => {
                    closeMobileMenu();
                    onNavigate(link.route);
                  }}
                  className={`min-h-[44px] px-3 py-2.5 rounded-2xl text-xs font-black uppercase cursor-pointer flex items-center justify-center ${
                    storeRoute === link.route
                      ? 'bg-[#C2410C] text-white'
                      : 'bg-[#FAF8F5] border-2 border-[#1F1917]'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            <section className="rounded-2xl border-2 border-[#1F1917] bg-white p-3 space-y-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9A6B3D] px-1">
                {MOBILE_NAV_SECTION_LABELS[0]}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleMobileShopNav('gear')}
                  className="min-h-[44px] px-3 py-2.5 rounded-xl bg-[#FAF8F5] border-2 border-[#1F1917] text-xs font-black uppercase cursor-pointer"
                  data-testid="header-mobile-shop-gear"
                >
                  {GEAR_PAGE_LABEL}
                </button>
                <button
                  type="button"
                  onClick={() => handleMobileShopNav('planners')}
                  className="min-h-[44px] px-3 py-2.5 rounded-xl bg-[#FAF8F5] border-2 border-[#1F1917] text-xs font-black uppercase cursor-pointer"
                >
                  Planners
                </button>
              </div>
            </section>

            <section className="rounded-2xl border-2 border-[#1F1917] bg-white p-3 space-y-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9A6B3D] px-1">
                {MOBILE_NAV_SECTION_LABELS[1]}
              </h3>
              {onOpenAffirmations && (
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    onOpenAffirmations();
                  }}
                  className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-[#FFEDD5] border border-[#C2410C] text-[#C2410C] text-xs font-black uppercase cursor-pointer flex items-center gap-2"
                >
                  {!hasMembershipAccess && <Lock className="w-3.5 h-3.5" />}
                  <Sparkles className="w-4 h-4" /> Affirmations
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  closeMobileMenu();
                  onOpenChallenge();
                }}
                className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-[#FFEDD5] border-2 border-[#C2410C] text-[#C2410C] text-xs font-black uppercase cursor-pointer flex items-center gap-2"
              >
                {!hasMembershipAccess && <Lock className="w-3.5 h-3.5" />}
                7-Day Challenge
              </button>
              <button
                type="button"
                onClick={() => handleMobileNavClick('mood-tool')}
                className="w-full min-h-[44px] text-left px-3 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DFD3] text-xs font-bold cursor-pointer"
              >
                What&apos;s Your Mood?
              </button>
              <button
                type="button"
                onClick={() => handleMobileNavClick('receipts')}
                className="w-full min-h-[44px] text-left px-3 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DFD3] text-xs font-bold cursor-pointer flex items-center gap-2"
              >
                <Flame className="w-4 h-4 text-[#C2410C]" /> Plan Receipts
              </button>
            </section>

            <section className="rounded-2xl border-2 border-[#1F1917] bg-white p-3 space-y-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9A6B3D] px-1">
                {MOBILE_NAV_SECTION_LABELS[2]}
              </h3>
              {currentUser ? (
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    onOpenUserAuth?.();
                  }}
                  className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-[#FFEDD5] border border-[#C2410C] text-xs font-black cursor-pointer truncate text-left"
                >
                  {currentUser.name.split(' ')[0]}
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 text-[9px] font-mono bg-[#C2410C] text-white rounded uppercase">
                    {getRoleLabel(currentUser.role)}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    onOpenUserAuth?.();
                  }}
                  className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-[#FAF8F5] border-2 border-[#1F1917] text-xs font-black cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-4 h-4 text-[#C2410C]" /> Sign In
                </button>
              )}
              {currentUser && onLogoutUser && (
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    onLogoutUser();
                  }}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#C2410C] text-white text-xs font-black uppercase cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" /> Log Out
                </button>
              )}
            </section>

            <div className="space-y-2">
              {adminNavGroups.map((group) => (
                <section
                  key={group.id}
                  className={`rounded-2xl border-2 border-[#1F1917] bg-white p-3 space-y-1.5 ${group.underHub ? 'ml-2' : ''}`}
                >
                  <h3 className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9A6B3D] px-1">
                    {group.label}
                  </h3>
                  <div className="grid grid-cols-2 gap-1.5">
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          closeMobileMenu();
                          openAdminTab(item.id);
                        }}
                        className={`min-h-[44px] px-2.5 py-2 rounded-xl text-[11px] font-bold cursor-pointer flex items-center gap-1.5 ${
                          item.id === 'budget'
                            ? 'bg-[#C2410C] text-white border-2 border-[#1F1917] font-black uppercase col-span-2'
                            : 'bg-[#FAF8F5] border border-[#E5DFD3]'
                        }`}
                        data-testid={
                          item.id === 'agenda'
                            ? 'header-mobile-nav-agenda'
                            : item.id === 'budget'
                              ? 'header-mobile-nav-budget'
                              : `header-mobile-nav-${item.id}`
                        }
                      >
                        {HEADER_ADMIN_ICONS[item.id]}
                        {item.label}
                        {item.id === 'memberships' ? <ComingSoonBadge /> : null}
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
            </nav>
        </>,
        document.body,
      )}
    </>
  );
};

export default Header;

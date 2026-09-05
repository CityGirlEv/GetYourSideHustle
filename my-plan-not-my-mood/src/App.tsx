import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ReceiptBuilder } from './components/ReceiptBuilder';
import { ProductGrid } from './components/ProductGrid';
import { ShopGearPage } from './components/ShopGearPage';
import { CartDrawer } from './components/CartDrawer';
import { ChallengeModal } from './components/ChallengeModal';
import { Footer } from './components/Footer';
import { AdminPortal } from './components/AdminPortal';
import { UserAuthModal } from './components/UserAuthModal';
import { BetaWelcomeModal } from './components/BetaWelcomeModal';
import { DailyAffirmationsModal } from './components/DailyAffirmationsModal';
import { DailyAffirmationsWidget } from './components/DailyAffirmationsWidget';
import { JoinPage } from './components/JoinPage';
import { MakePaymentPage } from './components/MakePaymentPage';
import { SiteMapPage } from './components/SiteMapPage';
import { SessionType } from './data/affirmations';
import { AppUser, getCurrentUserSession, logoutUserAsync, canAccessAdminPortal, hasRole, hydrateAuthFromServer } from './lib/userAuth';
import { shouldShowBetaWelcome } from './lib/betaWelcome';
import type { AdminPortalTab } from './lib/adminPortalTabs';
import {
  adminPortalPath,
  adminReturnPath,
  isAdminPortalPath,
  openPlanFromHeader,
  parseAdminPortalTab,
  shouldOpenAdminPortal,
} from './lib/planPage';
import { parseStoreRoute, routePath, StoreRoute } from './lib/storeRoutes';
import { canSeeMemberships, hasMembershipAccess, markMembershipJoined, MembershipTier } from './lib/membership';
import { parseGearKindFromPath, parseGearProductHandle } from './lib/heroCarouselProducts';
import { shopifyGearSitePath } from './lib/shopifyStore';

interface CartItem {
  productId: string;
  quantity: number;
}

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [isAffirmationsOpen, setIsAffirmationsOpen] = useState(false);
  const [affirmationsSessionType, setAffirmationsSessionType] = useState<SessionType | undefined>();
  const [authStartOnMemberSignup, setAuthStartOnMemberSignup] = useState(false);
  const [authLoginEmail, setAuthLoginEmail] = useState('');
  const [authResetToken, setAuthResetToken] = useState('');
  const [isBetaWelcomeOpen, setIsBetaWelcomeOpen] = useState(() =>
    typeof window !== 'undefined' &&
    shouldShowBetaWelcome(window.location.pathname) &&
    !sessionStorage.getItem('myplan_beta_welcome_dismissed')
  );
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => getCurrentUserSession());
  const [adminTab, setAdminTab] = useState<AdminPortalTab>(() =>
    typeof window !== 'undefined' ? parseAdminPortalTab(window.location.pathname) : 'plan'
  );
  const [pendingAdminPath, setPendingAdminPath] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const path = window.location.pathname;
    if (!isAdminPortalPath(path) || canAccessAdminPortal(getCurrentUserSession())) return null;
    return adminReturnPath(path);
  });
  const [isProposalOpen, setIsProposalOpen] = useState(() =>
    typeof window !== 'undefined'
    && shouldOpenAdminPortal(canAccessAdminPortal(getCurrentUserSession()), window.location.pathname)
  );
  const [isUserAuthOpen, setIsUserAuthOpen] = useState(() =>
    typeof window !== 'undefined'
    && isAdminPortalPath(window.location.pathname)
    && !canAccessAdminPortal(getCurrentUserSession())
  );
  const [storeRoute, setStoreRoute] = useState<StoreRoute>(() =>
    typeof window !== 'undefined' ? parseStoreRoute(window.location.pathname) : 'home'
  );
  const [gearKind, setGearKind] = useState(() =>
    typeof window !== 'undefined' ? parseGearKindFromPath(window.location.pathname) : 'tee'
  );
  const [gearHandle, setGearHandle] = useState(() =>
    typeof window !== 'undefined' ? parseGearProductHandle(window.location.hash) : ''
  );
  const [membershipUnlocked, setMembershipUnlocked] = useState(() => hasMembershipAccess(getCurrentUserSession()));

  useEffect(() => {
    let cancelled = false;
    void hydrateAuthFromServer().then((user) => {
      if (cancelled) return;
      setCurrentUser(user);
      setMembershipUnlocked(hasMembershipAccess(user));
      if (user && canAccessAdminPortal(user) && pendingAdminPath) {
        setIsProposalOpen(true);
        setIsUserAuthOpen(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const signedIn = canAccessAdminPortal(getCurrentUserSession());
      if (isAdminPortalPath(path)) {
        setAdminTab(parseAdminPortalTab(path));
        if (signedIn) {
          setIsProposalOpen(true);
          setPendingAdminPath(null);
        } else {
          setIsProposalOpen(false);
          setPendingAdminPath(adminReturnPath(path));
          setIsUserAuthOpen(true);
        }
      } else {
        setIsProposalOpen(false);
        setStoreRoute(parseStoreRoute(path));
        setGearKind(parseGearKindFromPath(path));
        setGearHandle(parseGearProductHandle(window.location.hash));
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resetToken = params.get('reset')?.trim();
    if (resetToken) {
      setAuthResetToken(resetToken);
      setIsUserAuthOpen(true);
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }
    if (params.get('auth') === 'login') {
      const email = params.get('email')?.trim();
      if (email) {
        setAuthLoginEmail(email);
      }
      setIsUserAuthOpen(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const navigateToPath = useCallback((href: string) => {
    window.history.pushState({}, '', href);
    const path = window.location.pathname;
    const hash = window.location.hash;
    setStoreRoute(parseStoreRoute(path));
    setGearKind(parseGearKindFromPath(path));
    setGearHandle(parseGearProductHandle(hash));
    setIsProposalOpen(false);
    if (parseStoreRoute(path) !== 'home') {
      setIsBetaWelcomeOpen(false);
    }
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, []);

  const navigateToStore = useCallback((route: StoreRoute) => {
    navigateToPath(route === 'home' ? '/' : routePath(route));
  }, [navigateToPath]);

  const handleOpenUserAuth = (memberSignup = false) => {
    setAuthStartOnMemberSignup(memberSignup);
    setIsUserAuthOpen(true);
  };

  const handleOpenBetaSignup = () => {
    setIsBetaWelcomeOpen(false);
    handleOpenUserAuth(true);
  };

  const handleOpenProposal = (tab?: AdminPortalTab) => {
    const nextTab = openPlanFromHeader(tab ?? 'plan');
    const dest = adminPortalPath(nextTab);
    setAdminTab(nextTab);
    if (!canAccessAdminPortal(currentUser)) {
      setPendingAdminPath(dest);
      handleOpenUserAuth(false);
      return;
    }
    setPendingAdminPath(null);
    window.history.pushState({}, '', dest);
    setIsProposalOpen(true);
  };

  const openPendingAdminAfterLogin = (user: AppUser) => {
    if (!canAccessAdminPortal(user)) {
      setPendingAdminPath(null);
      return;
    }
    const dest = pendingAdminPath ?? adminPortalPath('plan');
    const nextTab = parseAdminPortalTab(dest);
    setPendingAdminPath(null);
    setAdminTab(nextTab);
    window.history.pushState({}, '', dest);
    setIsProposalOpen(true);
  };

  const handleBackToStore = () => {
    window.history.pushState({}, '', '/');
    setIsProposalOpen(false);
    setStoreRoute('home');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleOpenJoin = () => {
    if (canSeeMemberships(currentUser)) {
      navigateToStore('join');
      return;
    }
    handleOpenUserAuth(true);
  };

  const handleJoinTier = (tier: MembershipTier) => {
    if (tier.id === 'starter') {
      handleOpenUserAuth(true);
      return;
    }
    alert(`${tier.name} (${tier.priceLabel}) — checkout coming soon. Join free to unlock Affirmations & the 7-Day Challenge now.`);
    handleOpenUserAuth(true);
  };

  const handleOpenAffirmations = (sessionType?: SessionType) => {
    if (!membershipUnlocked) {
      handleOpenJoin();
      return;
    }
    setAffirmationsSessionType(sessionType);
    setIsAffirmationsOpen(true);
  };

  const handleOpenChallenge = () => {
    if (!membershipUnlocked) {
      handleOpenJoin();
      return;
    }
    setIsChallengeOpen(true);
  };

  const handleAddToCart = (productId: string) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const scrollToElement = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToSection = (id: string, filter?: 'planners' | 'gear') => {
    if (filter === 'gear') {
      navigateToStore('gear');
      return;
    }
    if (filter === 'planners') {
      navigateToStore('planners');
      return;
    }
    if (id === 'products') {
      navigateToStore('gear');
      return;
    }
    if (storeRoute !== 'home') {
      navigateToStore('home');
      setTimeout(() => scrollToElement(id), 100);
      return;
    }
    if (id === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (isProposalOpen) {
      handleBackToStore();
      setTimeout(() => scrollToElement(id), 100);
      return;
    }
    scrollToElement(id);
  };

  const handleUserLogout = async () => {
    await logoutUserAsync();
    setCurrentUser(null);
    setMembershipUnlocked(hasMembershipAccess(null));
    if (isProposalOpen) {
      handleBackToStore();
    }
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1F1917] flex flex-col font-sans selection:bg-[#C2410C] selection:text-[#FFFFFF]">
      <Header
        cartCount={totalCartCount}
        currentUser={currentUser}
        storeRoute={storeRoute}
        hasMembershipAccess={membershipUnlocked}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenChallenge={handleOpenChallenge}
        onOpenAffirmations={() => handleOpenAffirmations()}
        onNavigate={navigateToStore}
        onScrollToSection={handleScrollToSection}
        onOpenJoin={handleOpenJoin}
        onOpenProposal={handleOpenProposal}
        onOpenUserAuth={() => handleOpenUserAuth(false)}
        onLogoutUser={handleUserLogout}
      />

      <main className="flex-1">
        {isProposalOpen && canAccessAdminPortal(currentUser) ? (
          <AdminPortal onBackToStore={handleBackToStore} initialTab={adminTab} />
        ) : storeRoute === 'sitemap' ? (
          <SiteMapPage
            onNavigate={navigateToStore}
            canSeeMemberships={canSeeMemberships(currentUser)}
          />
        ) : storeRoute === 'pay' ? (
          <MakePaymentPage />
        ) : storeRoute === 'join' && canSeeMemberships(currentUser) ? (
          <JoinPage
            onJoinTier={handleJoinTier}
            hasMembershipAccess={membershipUnlocked}
            onOpenAffirmations={() => handleOpenAffirmations()}
            onOpenChallenge={handleOpenChallenge}
          />
        ) : storeRoute === 'gear' ? (
          <ShopGearPage
            kind={gearKind}
            productHandle={gearHandle}
            onSelectKind={(nextKind) => navigateToPath(shopifyGearSitePath(nextKind))}
            onOpenProduct={navigateToPath}
          />
        ) : storeRoute === 'planners' ? (
          <ProductGrid onAddToCart={handleAddToCart} pageVariant="planners" />
        ) : (
          <>
            <Hero
              onScrollToSection={handleScrollToSection}
              onNavigateToGear={() => navigateToStore('gear')}
              onOpenCarouselProduct={navigateToPath}
              onOpenChallenge={handleOpenChallenge}
              onOpenJoin={handleOpenJoin}
              onOpenAffirmations={() => handleOpenAffirmations()}
              canManageHero={canAccessAdminPortal(currentUser)}
              hasMembershipAccess={membershipUnlocked}
            />
            <DailyAffirmationsWidget
              onOpenAffirmations={handleOpenAffirmations}
              hasMembershipAccess={membershipUnlocked}
              onOpenJoin={handleOpenJoin}
              membershipsVisible={canSeeMemberships(currentUser)}
            />
            <ReceiptBuilder />
          </>
        )}
      </main>

      <Footer
        onScrollToSection={handleScrollToSection}
        onNavigate={navigateToStore}
        onOpenChallenge={handleOpenChallenge}
        onOpenJoin={handleOpenJoin}
        hasMembershipAccess={membershipUnlocked}
        showMemberships={canSeeMemberships(currentUser)}
      />
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onAddToCart={handleAddToCart}
      />

      <ChallengeModal
        isOpen={isChallengeOpen}
        onClose={() => setIsChallengeOpen(false)}
      />

      <DailyAffirmationsModal
        isOpen={isAffirmationsOpen}
        onClose={() => setIsAffirmationsOpen(false)}
        currentUser={currentUser}
        defaultSessionType={affirmationsSessionType}
      />

      <BetaWelcomeModal
        isOpen={isBetaWelcomeOpen && !isProposalOpen && storeRoute === 'home'}
        onClose={() => {
          sessionStorage.setItem('myplan_beta_welcome_dismissed', '1');
          setIsBetaWelcomeOpen(false);
        }}
        onSignUpAsBetaTester={handleOpenBetaSignup}
      />

      <UserAuthModal
        key={authResetToken ? `reset-${authResetToken}` : authStartOnMemberSignup ? 'member-signup' : 'account'}
        isOpen={isUserAuthOpen}
        currentUser={currentUser}
        initialMemberSignup={authStartOnMemberSignup}
        initialLoginEmail={authLoginEmail}
        initialResetToken={authResetToken}
        onClose={() => {
          setIsUserAuthOpen(false);
          setAuthStartOnMemberSignup(false);
          setAuthLoginEmail('');
          setAuthResetToken('');
        }}
        onUserChange={(user) => {
          setCurrentUser(user);
          if (user) {
            if (authStartOnMemberSignup || hasRole(user, 'member')) {
              markMembershipJoined();
            }
            setMembershipUnlocked(hasMembershipAccess(user));
          } else {
            setMembershipUnlocked(hasMembershipAccess(null));
          }
          if (user) {
            openPendingAdminAfterLogin(user);
          }
        }}
      />
    </div>
  );
}

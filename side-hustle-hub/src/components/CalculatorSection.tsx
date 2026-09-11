import React, { useState } from "react";
import { 
  Building2, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

function CalcLine({
  label,
  detail,
  value,
  emphasize,
  negative,
}: {
  label: string;
  detail?: string;
  value: string;
  emphasize?: boolean;
  negative?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        alignItems: "flex-start",
        paddingBottom: emphasize ? 8 : 0,
        borderBottom: emphasize ? "1px solid rgba(255,255,255,0.08)" : undefined,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <span
          style={{
            color: emphasize ? "white" : "var(--text-primary)",
            fontWeight: emphasize ? 700 : 500,
            display: "block",
          }}
        >
          {label}
        </span>
        {detail ? (
          <span style={{ fontSize: "0.8rem", color: "var(--text-primary)", opacity: 0.85, display: "block", marginTop: 2 }}>
            {detail}
          </span>
        ) : null}
      </div>
      <strong
        style={{
          color: negative ? "#fca5a5" : "white",
          whiteSpace: "nowrap",
          fontWeight: emphasize ? 800 : 700,
        }}
      >
        {value}
      </strong>
    </div>
  );
}

type AirbnbBudgetLine = { id: string; label: string; amount: number };

const DEFAULT_AIRBNB_BUDGET: AirbnbBudgetLine[] = [
  { id: "mortgage", label: "Mortgage / rent", amount: 800 },
  { id: "utilities", label: "Utilities (electric, water, gas)", amount: 150 },
  { id: "insurance", label: "Insurance / STR coverage", amount: 80 },
  { id: "supplies", label: "Supplies & restocking", amount: 60 },
  { id: "cleaning_labor", label: "Cleaning labor (host-paid)", amount: 0 },
  { id: "internet", label: "Internet / Wi‑Fi", amount: 50 },
  { id: "software", label: "Software & channel tools", amount: 30 },
  { id: "taxes", label: "Taxes / HOA / permits", amount: 30 },
  { id: "other", label: "Other monthly costs", amount: 0 },
];

function parseMoneyInput(raw: string): number {
  const n = Number(String(raw).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

interface CalculatorSectionProps {
  initialActiveTab?: string;
  onGoToGuide: (hustleId: string) => void;
}

export const CalculatorSection: React.FC<CalculatorSectionProps> = ({ 
  initialActiveTab = "airbnb",
  onGoToGuide 
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialActiveTab);
  const [howOpen, setHowOpen] = useState(false);

  // Airbnb State
  const [airbnbNightlyRate, setAirbnbNightlyRate] = useState(150);
  const [airbnbOccupancy, setAirbnbOccupancy] = useState(70); // %
  const [airbnbCleaningFee, setAirbnbCleaningFee] = useState(100);
  const [airbnbBudget, setAirbnbBudget] = useState<AirbnbBudgetLine[]>(DEFAULT_AIRBNB_BUDGET);

  // E-Commerce (POD/Dropshipping) State
  const [ecomUnits, setEcomUnits] = useState(250);
  const [ecomPrice, setEcomPrice] = useState(30);
  const [ecomCost, setEcomCost] = useState(12);
  const [ecomAdSpend, setEcomAdSpend] = useState(1000);
  const [ecomPlatformFee, setEcomPlatformFee] = useState(5); // %

  // Social/Influencer State
  const [followers, setFollowers] = useState(25000);
  const [engagement, setEngagement] = useState(4.5); // %
  const [sponsorPosts, setSponsorPosts] = useState(3);
  const [platform, setPlatform] = useState("instagram");

  const setAirbnbBudgetAmount = (id: string, amount: number) => {
    setAirbnbBudget((prev) => prev.map((line) => (line.id === id ? { ...line, amount } : line)));
  };

  // Calculations
  // 1. Airbnb
  const airbnbExpenses = airbnbBudget.reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
  const airbnbNightsBooked = 30 * (airbnbOccupancy / 100);
  const airbnbBookingsCount = Math.round(airbnbNightsBooked / 3); // Average stay of 3 days
  const airbnbRoomRevenue = airbnbNightlyRate * airbnbNightsBooked;
  const airbnbCleaningRevenue = airbnbCleaningFee * airbnbBookingsCount;
  const airbnbRevenue = airbnbRoomRevenue + airbnbCleaningRevenue;
  const airbnbPlatformFeeAmt = airbnbRevenue * 0.03; // Airbnb fee is 3%
  const airbnbNetProfit = airbnbRevenue - airbnbPlatformFeeAmt - airbnbExpenses;
  const airbnbMargin = airbnbRevenue > 0 ? (airbnbNetProfit / airbnbRevenue) * 100 : 0;

  // 2. E-Commerce
  const ecomRevenue = ecomUnits * ecomPrice;
  const ecomCogs = ecomUnits * ecomCost;
  const ecomFeeAmt = ecomRevenue * (ecomPlatformFee / 100);
  const ecomNetProfit = ecomRevenue - ecomCogs - ecomFeeAmt - ecomAdSpend;
  const ecomMargin = ecomRevenue > 0 ? (ecomNetProfit / ecomRevenue) * 100 : 0;

  // 3. Social Media
  const getCpm = (plat: string) => {
    switch (plat) {
      case "youtube": return 25; // higher CPM
      case "tiktok": return 12; // lower CPM
      default: return 18; // Instagram
    }
  };
  const cpm = getCpm(platform);
  // Sponsor Fee = (Followers * (Engagement/100) * CPM / 10) + base fee
  const sponsorFeePerPost = Math.max(
    50, 
    Math.round((followers * (engagement / 100) * cpm) / 100) + Math.round(followers * 0.005)
  );
  const socialRevenue = sponsorFeePerPost * sponsorPosts;
  // Estimated operating expenses (camera, tools, internet)
  const socialExpenses = 150 + Math.round(socialRevenue * 0.05); 
  const socialNetProfit = socialRevenue - socialExpenses;
  const socialMargin = socialRevenue > 0 ? (socialNetProfit / socialRevenue) * 100 : 0;

  // Helper formatters
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(val);
  };

  const getHustleIdFromTab = () => {
    if (activeTab === "airbnb") return "airbnb";
    if (activeTab === "ecom") return "pod"; // links to POD/dropshipping
    return "social";
  };

  return (
    <div className="glass" style={{ padding: "32px", borderRadius: "20px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ fontSize: "1.5rem", color: "white", marginBottom: "8px" }}>
          GYSH Earnings & Profitability Calculator
        </h2>
        <p style={{ color: "var(--text-primary)", fontSize: "0.95rem" }}>
          Adjust rates and the editable budget to estimate startup viability and monthly earnings.
        </p>

        <button
          type="button"
          onClick={() => setHowOpen((o) => !o)}
          aria-expanded={howOpen}
          style={{
            marginTop: 14,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "transparent",
            border: "1px solid var(--border-color)",
            borderRadius: 10,
            padding: "8px 14px",
            color: "var(--text-primary)",
            cursor: "pointer",
            fontSize: "0.95rem",
          }}
        >
          {howOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          How this calculator works
        </button>

        {howOpen && (
          <div
            style={{
              marginTop: 12,
              padding: "16px 18px",
              borderRadius: 12,
              border: "1px solid var(--border-color)",
              background: "rgba(255,255,255,0.03)",
              color: "var(--text-primary)",
              fontSize: "0.95rem",
              lineHeight: 1.55,
            }}
          >
            <p style={{ marginBottom: 12 }}>
              These are <strong style={{ color: "white" }}>planning estimates</strong>, not guarantees.
              Each tab uses simple monthly math from the sliders you set.
            </p>

            {activeTab === "airbnb" && (
              <>
                <p style={{ marginBottom: 8, color: "white", fontWeight: 600 }}>Airbnb Hosting</p>
                <ul style={{ margin: "0 0 8px 18px", padding: 0 }}>
                  <li><strong style={{ color: "white" }}>Inputs:</strong> nightly rate, occupancy %, cleaning fee per booking, and each monthly budget line (mortgage/rent, utilities, insurance, supplies, cleaning labor, internet, software, taxes/HOA, other).</li>
                  <li><strong style={{ color: "white" }}>Assumptions:</strong> 30-day month; average stay = 3 nights; Airbnb platform fee = 3% of gross revenue.</li>
                  <li><strong style={{ color: "white" }}>Formulas:</strong> bookings ≈ round((30 × occupancy) ÷ 3); revenue = (nightly × 30 × occupancy) + (cleaning × bookings); fees = revenue × 3%; expenses = sum of budget lines; net = revenue − fees − expenses.</li>
                  <li><strong style={{ color: "white" }}>Outputs:</strong> estimated net monthly profit, profit margin %, gross revenue, platform fees, and every budget line that feeds the total.</li>
                </ul>
              </>
            )}

            {activeTab === "ecom" && (
              <>
                <p style={{ marginBottom: 8, color: "white", fontWeight: 600 }}>E-Commerce (POD / Dropship)</p>
                <ul style={{ margin: "0 0 8px 18px", padding: 0 }}>
                  <li><strong style={{ color: "white" }}>Inputs:</strong> units sold, selling price, product cost (COGS), ad spend, platform fee %.</li>
                  <li><strong style={{ color: "white" }}>Assumptions:</strong> you enter units directly (ads are a flat monthly cost). Footnotes mention ~2.5% conversion as context only — it is not used in the math.</li>
                  <li><strong style={{ color: "white" }}>Formulas:</strong> revenue = units × price; COGS = units × unit cost; fees = revenue × platform fee %; net = revenue − COGS − fees − ad spend.</li>
                  <li><strong style={{ color: "white" }}>Outputs:</strong> net profit, margin %, gross, platform fees, and combined product COGS + ads.</li>
                </ul>
              </>
            )}

            {activeTab === "social" && (
              <>
                <p style={{ marginBottom: 8, color: "white", fontWeight: 600 }}>Social Monetization</p>
                <ul style={{ margin: "0 0 8px 18px", padding: 0 }}>
                  <li><strong style={{ color: "white" }}>Inputs:</strong> platform, followers, engagement %, sponsored posts per month.</li>
                  <li><strong style={{ color: "white" }}>Assumptions:</strong> estimated CPM by platform (YouTube $25, Instagram $18, TikTok $12). Tooling costs = $150 base + 5% of sponsor revenue.</li>
                  <li><strong style={{ color: "white" }}>Formulas:</strong> fee per post = max($50, round(followers × engagement × CPM ÷ 100) + round(followers × 0.5%)); revenue = fee × posts; net = revenue − tool expenses.</li>
                  <li><strong style={{ color: "white" }}>Outputs:</strong> net profit, margin %, gross sponsor revenue, tool expenses, and estimated $/post.</li>
                </ul>
              </>
            )}

            <p style={{ marginTop: 10, fontSize: "0.9375rem", color: "var(--text-primary)", fontStyle: "italic" }}>
              Tip: use the related Launch Guide to sanity-check real costs and steps against these estimates.
            </p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ 
        display: "flex", 
        gap: "12px", 
        borderBottom: "1px solid var(--border-color)", 
        paddingBottom: "16px",
        marginBottom: "32px",
        overflowX: "auto"
      }}>
        <button 
          onClick={() => setActiveTab("airbnb")}
          className={`nav-link-btn ${activeTab === "airbnb" ? "active" : ""}`}
          style={{ width: "auto", display: "inline-flex", padding: "10px 20px" }}
        >
          <Building2 size={16} />
          Airbnb Hosting
        </button>
        <button 
          onClick={() => setActiveTab("ecom")}
          className={`nav-link-btn ${activeTab === "ecom" ? "active" : ""}`}
          style={{ width: "auto", display: "inline-flex", padding: "10px 20px" }}
        >
          <ShoppingBag size={16} />
          E-Commerce (POD / Dropship)
        </button>
        <button 
          onClick={() => setActiveTab("social")}
          className={`nav-link-btn ${activeTab === "social" ? "active" : ""}`}
          style={{ width: "auto", display: "inline-flex", padding: "10px 20px" }}
        >
          <Users size={16} />
          Social Monetization
        </button>
      </div>

      {/* Calculator Body */}
      <div className="calc-container">
        
        {/* Tab 1: Airbnb */}
        {activeTab === "airbnb" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="form-group">
              <label className="form-label">
                <span>Nightly Rate ($)</span>
                <span className="form-label-value">{formatCurrency(airbnbNightlyRate)}</span>
              </label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="10"
                  value={airbnbNightlyRate}
                  onChange={(e) => setAirbnbNightlyRate(Number(e.target.value))}
                  className="range-slider"
                  style={{ flex: 1 }}
                />
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={airbnbNightlyRate}
                  onChange={(e) => setAirbnbNightlyRate(parseMoneyInput(e.target.value))}
                  className="text-input"
                  style={{ width: 96 }}
                  aria-label="Nightly rate dollars"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Occupancy Rate (%)</span>
                <span className="form-label-value">{airbnbOccupancy}%</span>
              </label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={airbnbOccupancy}
                  onChange={(e) => setAirbnbOccupancy(Number(e.target.value))}
                  className="range-slider"
                  style={{ flex: 1 }}
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={airbnbOccupancy}
                  onChange={(e) =>
                    setAirbnbOccupancy(Math.min(100, Math.max(0, parseMoneyInput(e.target.value))))
                  }
                  className="text-input"
                  style={{ width: 96 }}
                  aria-label="Occupancy percent"
                />
              </div>
              <span style={{ fontSize: "0.9375rem", color: "var(--text-primary)", marginTop: "4px", display: "block" }}>
                Estimated {airbnbBookingsCount} bookings/month (averaging 3 nights per stay).
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Cleaning Fee ($ per booking)</span>
                <span className="form-label-value">{formatCurrency(airbnbCleaningFee)}</span>
              </label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  type="range"
                  min="20"
                  max="300"
                  step="5"
                  value={airbnbCleaningFee}
                  onChange={(e) => setAirbnbCleaningFee(Number(e.target.value))}
                  className="range-slider"
                  style={{ flex: 1 }}
                />
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={airbnbCleaningFee}
                  onChange={(e) => setAirbnbCleaningFee(parseMoneyInput(e.target.value))}
                  className="text-input"
                  style={{ width: 96 }}
                  aria-label="Cleaning fee per booking"
                />
              </div>
            </div>

            <div
              className="form-group"
              style={{
                padding: "14px 16px",
                borderRadius: 12,
                border: "1px solid var(--border-color)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
                <div>
                  <span style={{ color: "white", fontWeight: 700, display: "block" }}>Monthly budget</span>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>
                    Edit every line — totals roll into net profit
                  </span>
                </div>
                <strong style={{ color: "white", whiteSpace: "nowrap" }}>{formatCurrency(airbnbExpenses)}</strong>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {airbnbBudget.map((line) => (
                  <label
                    key={line.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 1fr) 110px",
                      gap: 10,
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "var(--text-primary)", fontSize: "0.92rem" }}>{line.label}</span>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={line.amount}
                      onChange={(e) => setAirbnbBudgetAmount(line.id, parseMoneyInput(e.target.value))}
                      className="text-input"
                      aria-label={`${line.label} monthly amount`}
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: E-Commerce */}
        {activeTab === "ecom" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="form-group">
              <label className="form-label">
                <span>Monthly Sales Volume (Units)</span>
                <span className="form-label-value">{ecomUnits} units</span>
              </label>
              <input 
                type="range" 
                min="10" 
                max="2000" 
                step="10"
                value={ecomUnits}
                onChange={(e) => setEcomUnits(Number(e.target.value))}
                className="range-slider purple"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Unit Retail Price ($)</span>
                <span className="form-label-value">{formatCurrency(ecomPrice)}</span>
              </label>
              <input 
                type="range" 
                min="5" 
                max="300" 
                step="1"
                value={ecomPrice}
                onChange={(e) => setEcomPrice(Number(e.target.value))}
                className="range-slider purple"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Unit Cost / COGS ($)</span>
                <span className="form-label-value">{formatCurrency(ecomCost)}</span>
              </label>
              <input 
                type="range" 
                min="1" 
                max="150" 
                step="1"
                value={ecomCost}
                onChange={(e) => setEcomCost(Number(e.target.value))}
                className="range-slider purple"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Monthly Marketing/Ad Spend ($)</span>
                <span className="form-label-value">{formatCurrency(ecomAdSpend)}</span>
              </label>
              <input 
                type="range" 
                min="0" 
                max="5000" 
                step="50"
                value={ecomAdSpend}
                onChange={(e) => setEcomAdSpend(Number(e.target.value))}
                className="range-slider purple"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Platform Fee % (Etsy, Shopify, etc.)</span>
                <span className="form-label-value">{ecomPlatformFee}%</span>
              </label>
              <input 
                type="range" 
                min="1" 
                max="15" 
                step="0.5"
                value={ecomPlatformFee}
                onChange={(e) => setEcomPlatformFee(Number(e.target.value))}
                className="range-slider purple"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Social Monetization */}
        {activeTab === "social" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="form-group">
              <label className="form-label">
                <span>Primary Platform</span>
                <span className="form-label-value" style={{ textTransform: "capitalize" }}>{platform}</span>
              </label>
              <select 
                value={platform} 
                onChange={(e) => setPlatform(e.target.value)}
                className="select-input"
              >
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Followers count</span>
                <span className="form-label-value">{followers.toLocaleString()}</span>
              </label>
              <input 
                type="range" 
                min="1000" 
                max="500000" 
                step="1000"
                value={followers}
                onChange={(e) => setFollowers(Number(e.target.value))}
                className="range-slider"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Engagement Rate (%)</span>
                <span className="form-label-value">{engagement}%</span>
              </label>
              <input 
                type="range" 
                min="0.5" 
                max="15" 
                step="0.1"
                value={engagement}
                onChange={(e) => setEngagement(Number(e.target.value))}
                className="range-slider"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Sponsored Posts per Month</span>
                <span className="form-label-value">{sponsorPosts} /mo</span>
              </label>
              <input 
                type="range" 
                min="1" 
                max="10" 
                step="1"
                value={sponsorPosts}
                onChange={(e) => setSponsorPosts(Number(e.target.value))}
                className="range-slider"
              />
            </div>
          </div>
        )}

        {/* Results Panel (Right Side) */}
        <div className="glass" style={{ 
          padding: "24px", 
          borderRadius: "14px", 
          background: "rgba(255,255,255,0.015)",
          border: "1px solid var(--border-color)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}>
          <div>
            <span className="glow-badge emerald" style={{ marginBottom: "16px" }}>
              <TrendingUp size={12} /> Profit Projection
            </span>

            {/* Main Profit Display */}
            <div style={{ margin: "16px 0" }}>
              <span style={{ fontSize: "0.95rem", color: "var(--text-primary)", display: "block" }}>
                Est. Net Monthly Profit
              </span>
              <h1 style={{ 
                fontSize: "3rem", 
                fontWeight: 800, 
                color: activeTab === "airbnb" ? "var(--accent-pink)" : activeTab === "ecom" ? "var(--accent-purple)" : "var(--accent-cyan)",
                lineHeight: 1.1,
                filter: `drop-shadow(0 0 10px ${activeTab === "airbnb" ? "var(--accent-pink-glow)" : activeTab === "ecom" ? "var(--accent-purple-glow)" : "var(--accent-cyan-glow)"})`
              }}>
                {formatCurrency(
                  activeTab === "airbnb" ? airbnbNetProfit : 
                  activeTab === "ecom" ? ecomNetProfit : socialNetProfit
                )}
              </h1>
            </div>

            {/* Progress / Breakdown bar */}
            <div style={{ marginTop: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9375rem", color: "var(--text-primary)", marginBottom: "6px" }}>
                <span>Profit Margin</span>
                <span style={{ fontWeight: 700 }}>
                  {activeTab === "airbnb" ? airbnbMargin.toFixed(1) : 
                   activeTab === "ecom" ? ecomMargin.toFixed(1) : socialMargin.toFixed(1)}%
                </span>
              </div>
              <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "9999px", overflow: "hidden" }}>
                <div style={{ 
                  width: `${Math.max(0, Math.min(100, 
                    activeTab === "airbnb" ? airbnbMargin : 
                    activeTab === "ecom" ? ecomMargin : socialMargin
                  ))}%`, 
                  height: "100%", 
                  background: activeTab === "airbnb" ? "var(--grad-pink)" : activeTab === "ecom" ? "var(--grad-primary)" : "var(--accent-cyan)",
                  borderRadius: "9999px",
                  transition: "width var(--transition-normal)"
                }} />
              </div>
            </div>

            {/* Detailed line items */}
            <div style={{ marginTop: "28px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.95rem" }}>
              {activeTab === "airbnb" && (
                <>
                  <p style={{ margin: "0 0 4px", fontSize: "0.85rem", fontWeight: 700, color: "white", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    How we got here
                  </p>
                  <CalcLine
                    label="Nights booked / month"
                    detail={`30 days × ${airbnbOccupancy}% occupancy`}
                    value={`${airbnbNightsBooked.toFixed(1)} nights`}
                  />
                  <CalcLine
                    label="Bookings / month"
                    detail={`${airbnbNightsBooked.toFixed(1)} nights ÷ 3-night avg stay (rounded)`}
                    value={`${airbnbBookingsCount}`}
                  />
                  <CalcLine
                    label="Room revenue"
                    detail={`${formatCurrency(airbnbNightlyRate)} × ${airbnbNightsBooked.toFixed(1)} nights`}
                    value={formatCurrency(airbnbRoomRevenue)}
                  />
                  <CalcLine
                    label="Cleaning fee revenue"
                    detail={`${formatCurrency(airbnbCleaningFee)} × ${airbnbBookingsCount} bookings`}
                    value={formatCurrency(airbnbCleaningRevenue)}
                  />
                  <CalcLine
                    label="Gross revenue"
                    detail="Room revenue + cleaning fee revenue"
                    value={formatCurrency(airbnbRevenue)}
                    emphasize
                  />
                  <CalcLine
                    label="Airbnb platform fee (3%)"
                    detail={`3% × ${formatCurrency(airbnbRevenue)}`}
                    value={`− ${formatCurrency(airbnbPlatformFeeAmt)}`}
                    negative
                  />
                  <p style={{ margin: "8px 0 2px", fontSize: "0.85rem", fontWeight: 700, color: "white" }}>
                    Monthly budget
                  </p>
                  {airbnbBudget.map((line) => (
                    <CalcLine
                      key={line.id}
                      label={line.label}
                      value={`− ${formatCurrency(line.amount)}`}
                      negative={line.amount > 0}
                    />
                  ))}
                  <CalcLine
                    label="Total operating expenses"
                    detail="Sum of budget lines above"
                    value={`− ${formatCurrency(airbnbExpenses)}`}
                    negative
                    emphasize
                  />
                  <div
                    style={{
                      marginTop: 6,
                      paddingTop: 12,
                      borderTop: "1px solid var(--border-color)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
                      <span style={{ color: "white", fontWeight: 700 }}>Net monthly profit</span>
                      <strong
                        style={{
                          color: airbnbNetProfit >= 0 ? "var(--accent-pink)" : "#f87171",
                          fontSize: "1.15rem",
                        }}
                      >
                        {formatCurrency(airbnbNetProfit)}
                      </strong>
                    </div>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>
                      Gross revenue − platform fee − budget total
                    </span>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                      <span style={{ color: "var(--text-primary)" }}>Profit margin</span>
                      <strong style={{ color: "white" }}>{airbnbMargin.toFixed(1)}%</strong>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "ecom" && (
                <>
                  <CalcLine label="Gross Revenue" value={formatCurrency(ecomRevenue)} emphasize />
                  <CalcLine
                    label={`Platform Fees (${ecomPlatformFee}%)`}
                    value={`− ${formatCurrency(ecomFeeAmt)}`}
                    negative
                  />
                  <CalcLine
                    label="Product COGS"
                    detail={`${ecomUnits} units × ${formatCurrency(ecomCost)}`}
                    value={`− ${formatCurrency(ecomCogs)}`}
                    negative
                  />
                  <CalcLine
                    label="Ad spend"
                    value={`− ${formatCurrency(ecomAdSpend)}`}
                    negative
                  />
                  <CalcLine
                    label="Net monthly profit"
                    detail="Revenue − fees − COGS − ads"
                    value={formatCurrency(ecomNetProfit)}
                    emphasize
                  />
                </>
              )}

              {activeTab === "social" && (
                <>
                  <CalcLine
                    label="Fee per sponsored post"
                    detail={`Based on ${followers.toLocaleString()} followers · ${engagement}% engagement · ${platform} CPM $${cpm}`}
                    value={formatCurrency(sponsorFeePerPost)}
                  />
                  <CalcLine
                    label="Gross sponsor revenue"
                    detail={`${formatCurrency(sponsorFeePerPost)} × ${sponsorPosts} posts`}
                    value={formatCurrency(socialRevenue)}
                    emphasize
                  />
                  <CalcLine
                    label="Tool expenses"
                    detail="$150 base + 5% of sponsor revenue"
                    value={`− ${formatCurrency(socialExpenses)}`}
                    negative
                  />
                  <CalcLine
                    label="Net monthly profit"
                    detail="Revenue − tool expenses"
                    value={formatCurrency(socialNetProfit)}
                    emphasize
                  />
                </>
              )}
            </div>
          </div>

          <div style={{ marginTop: "32px", borderTop: "1px solid var(--border-color)", paddingTop: "20px" }}>
            <p style={{ fontSize: "0.9375rem", color: "var(--text-primary)", marginBottom: "16px", fontStyle: "italic" }}>
              {activeTab === "airbnb" && "*Estimates assume professional cleaning and high-season listing demand."}
              {activeTab === "ecom" && "*Assumes an average conversion rate of 2.5% on marketing traffic."}
              {activeTab === "social" && `*Estimated sponsorship rate: ${formatCurrency(sponsorFeePerPost)} per sponsor post.`}
            </p>

            <button 
              onClick={() => onGoToGuide(getHustleIdFromTab())}
              className="btn btn-primary" 
              style={{ width: "100%", fontSize: "0.95rem", gap: "8px" }}
            >
              <BookOpen size={14} />
              View Actionable Launch Guide
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

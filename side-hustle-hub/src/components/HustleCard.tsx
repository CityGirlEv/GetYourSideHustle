import React from "react";
import { 
  Building2, 
  Printer, 
  ShoppingBag, 
  Link as LinkIcon, 
  Globe, 
  Users, 
  ChevronRight, 
  Calculator, 
  BookOpen,
  MapPinned,
  Sparkles,
  KeyRound,
  Wrench,
  Car,
  Bike,
  Crosshair,
  Bot,
  BookMarked,
} from "lucide-react";

export interface Hustle {
  id: string;
  name: string;
  description: string;
  startupCost: string;
  timeReq: string;
  difficulty: "Easy" | "Medium" | "Hard";
  potentialIncome: string;
  type: string;
  gradient: "pink" | "purple" | "cyan" | "emerald" | "amber";
  category: string;
  iconName: string;
  details: string[];
}

interface HustleCardProps {
  hustle: Hustle;
  onSelectAction: (hustleId: string, actionType: "calculator" | "guide") => void;
}

const getIcon = (name: string) => {
  switch (name) {
    case "airbnb": return <Building2 size={20} />;
    case "pod": return <Printer size={20} />;
    case "dropshipping": return <ShoppingBag size={20} />;
    case "affiliate": return <LinkIcon size={20} />;
    case "amazon": return <Globe size={20} />;
    case "social": return <Users size={20} />;
    case "web-leads": return <MapPinned size={20} />;
    case "ai-assets": return <Sparkles size={20} />;
    case "property-mgmt": return <KeyRound size={20} />;
    case "handyman": return <Wrench size={20} />;
    case "rideshare": return <Car size={20} />;
    case "food-delivery": return <Bike size={20} />;
    case "ai-timing": return <Crosshair size={20} />;
    case "ai-agents": return <Bot size={20} />;
    case "book-publishing": return <BookMarked size={20} />;
    default: return <ShoppingBag size={20} />;
  }
};

export const HustleCard: React.FC<HustleCardProps> = ({ hustle, onSelectAction }) => {
  const badgeColor = 
    hustle.difficulty === "Easy" ? "emerald" : 
    hustle.difficulty === "Medium" ? "amber" : "purple";

  return (
    <div className="glass-card flex flex-col h-full" style={{ padding: "24px" }}>
      {/* Card Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div 
          className="brand-logo" 
          style={{ 
            width: "44px", 
            height: "44px", 
            background: `var(--grad-${hustle.gradient})`,
            boxShadow: `0 0 15px var(--accent-${hustle.gradient}-glow)`,
            borderRadius: "12px"
          }}
        >
          {getIcon(hustle.iconName)}
        </div>
        <span className={`glow-badge ${badgeColor}`}>
          {hustle.difficulty}
        </span>
      </div>

      {/* Category */}
      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: `var(--accent-${hustle.gradient})`, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px", display: "block" }}>
        {hustle.category}
      </span>

      {/* Name and Description */}
      <h3 style={{ fontSize: "1.25rem", color: "var(--charcoal)", marginBottom: "8px" }}>{hustle.name}</h3>
      <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "20px", flexGrow: 1 }}>{hustle.description}</p>

      {/* Metrics Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr", 
        gap: "12px", 
        padding: "12px", 
        background: "rgba(247,243,237,0.9)", 
        borderRadius: "8px", 
        border: "1px solid var(--border-color)",
        marginBottom: "20px",
        fontSize: "0.8rem"
      }}>
        <div>
          <span style={{ color: "var(--text-muted)", display: "block" }}>Est. Startup Cost</span>
          <strong style={{ color: "var(--charcoal)", fontSize: "0.9rem" }}>{hustle.startupCost}</strong>
        </div>
        <div>
          <span style={{ color: "var(--text-muted)", display: "block" }}>Time Commitment</span>
          <strong style={{ color: "var(--charcoal)", fontSize: "0.9rem" }}>{hustle.timeReq}</strong>
        </div>
        <div>
          <span style={{ color: "var(--text-muted)", display: "block" }}>Income Style</span>
          <strong style={{ color: "var(--charcoal)", fontSize: "0.9rem" }}>{hustle.type}</strong>
        </div>
        <div>
          <span style={{ color: "var(--text-muted)", display: "block" }}>Potential Profit</span>
          <strong style={{ color: `var(--accent-${hustle.gradient})`, fontSize: "0.9rem" }}>{hustle.potentialIncome}</strong>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button 
          onClick={() => onSelectAction(hustle.id, "calculator")}
          className="btn btn-outline" 
          style={{ flex: 1, padding: "8px 12px", fontSize: "0.85rem", gap: "6px" }}
          title="Calculator"
        >
          <Calculator size={14} />
          Calculator
        </button>
        <button 
          onClick={() => onSelectAction(hustle.id, "guide")}
          className="btn btn-primary" 
          style={{ 
            flex: 1, 
            padding: "8px 12px", 
            fontSize: "0.85rem", 
            gap: "6px",
            background: `var(--grad-${hustle.gradient})`,
            boxShadow: `0 4px 10px var(--accent-${hustle.gradient}-glow)`
          }}
        >
          <BookOpen size={14} />
          Launch Guide
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

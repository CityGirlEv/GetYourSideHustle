import React, { useState } from "react";
import { 
  Award, 
  CheckSquare, 
  Bookmark, 
  Star,
  Zap,
  Check
} from "lucide-react";

interface Goal {
  id: string;
  title: string;
  done: boolean;
}

interface Badge {
  name: string;
  desc: string;
  icon: string;
  unlocked: boolean;
}

export const UserPortal: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([
    { id: "1", title: "Complete the GYSH Match Wizard", done: true },
    { id: "2", title: "Run profit estimates on two side hustles", done: true },
    { id: "3", title: "Select a niche keyword list for POD shirts", done: false },
    { id: "4", title: "Request sample packaging from manufacturer", done: false },
    { id: "5", title: "Verify local city STR/Airbnb permit guidelines", done: false }
  ]);

  const badges: Badge[] = [
    { name: "Scout Apprentice 🏷️", desc: "Searched product databases for profitable margins", icon: "🏷️", unlocked: true },
    { name: "Hustle Rookie 🚀", desc: "Completed your first GYSH Match Wizard questionnaire", icon: "🚀", unlocked: true },
    { name: "Superhost Trainee 🏡", desc: "Calculated Airbnb nightly yields and operating costs", icon: "🏡", unlocked: true },
    { name: "First Sale 🎉", desc: "Receive your first customer purchase confirmation", icon: "🎉", unlocked: false },
    { name: "Ad Manager 📊", desc: "Set up Facebook/TikTok business manager tracking pixels", icon: "📊", unlocked: false }
  ];

  const toggleGoal = (id: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) return { ...g, done: !g.done };
      return g;
    }));
  };

  const completedGoalsCount = goals.filter(g => g.done).length;
  const progressPercent = Math.round((completedGoalsCount / goals.length) * 100);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "32px" }}>
      
      {/* Roadmap Goal Tracker */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Welcome */}
        <div className="glass" style={{ padding: "28px", borderRadius: "16px" }}>
          <h2 style={{ fontSize: "1.5rem", color: "var(--text-primary)", marginBottom: "6px" }}>
            Welcome back, Guest Pilot!
          </h2>
          <p style={{ color: "var(--text-primary)", fontSize: "0.95rem" }}>
            Here is your personalized roadmap tracker. Cross off steps as you build your side business.
          </p>

          {/* Goal progress */}
          <div style={{ marginTop: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: "8px" }}>
              <span>Overall Roadmap Completion</span>
              <span style={{ fontWeight: 700, color: "var(--accent-purple)" }}>{progressPercent}% Complete</span>
            </div>
            <div style={{ width: "100%", height: "8px", background: "rgba(124, 58, 237, 0.05)", borderRadius: "9999px", overflow: "hidden" }}>
              <div style={{ 
                width: `${progressPercent}%`, 
                height: "100%", 
                background: "var(--grad-primary)",
                borderRadius: "9999px"
              }} />
            </div>
          </div>
        </div>

        {/* Dynamic Goal List */}
        <div className="glass" style={{ padding: "28px", borderRadius: "16px" }}>
          <h3 style={{ fontSize: "1.2rem", color: "var(--text-primary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckSquare size={20} style={{ color: "var(--accent-purple)" }} /> My Active Milestones
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {goals.map(g => (
              <div 
                key={g.id} 
                onClick={() => toggleGoal(g.id)}
                className={`checklist-item ${g.done ? "completed" : ""}`}
                style={{ margin: 0 }}
              >
                <div className="checklist-checkbox">
                  {g.done && <Check size={12} />}
                </div>
                <div className="checklist-text">
                  <span style={{ fontSize: "0.925rem" }}>{g.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bookmarked Roadmaps */}
        <div className="glass" style={{ padding: "28px", borderRadius: "16px" }}>
          <h3 style={{ fontSize: "1.2rem", color: "var(--text-primary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Bookmark size={20} style={{ color: "var(--accent-pink)" }} /> Bookmarked Hustles
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ padding: "16px", borderRadius: "10px", border: "1px solid var(--border-color)", background: "rgba(0,0,0,0.01)" }}>
              <span className="glow-badge pink" style={{ fontSize: "0.9375rem", padding: "2px 8px", marginBottom: "8px" }}>Real Estate</span>
              <h4 style={{ fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: "6px" }}>Airbnb Hosting</h4>
              <p style={{ fontSize: "0.9375rem", color: "var(--text-primary)" }}>Active guide progress: 33%</p>
            </div>

            <div style={{ padding: "16px", borderRadius: "10px", border: "1px solid var(--border-color)", background: "rgba(0,0,0,0.01)" }}>
              <span className="glow-badge purple" style={{ fontSize: "0.9375rem", padding: "2px 8px", marginBottom: "8px" }}>E-Commerce</span>
              <h4 style={{ fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: "6px" }}>Print-on-Demand</h4>
              <p style={{ fontSize: "0.9375rem", color: "var(--text-primary)" }}>Active guide progress: 50%</p>
            </div>
          </div>
        </div>

      </div>

      {/* Badges Column */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Unlocked Badges */}
        <div className="glass" style={{ padding: "24px", borderRadius: "16px" }}>
          <h3 style={{ fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Award size={20} style={{ color: "var(--accent-amber)" }} /> Unlocked Badges
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {badges.map((b, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "14px", 
                  opacity: b.unlocked ? 1 : 0.45,
                  background: b.unlocked ? "rgba(124, 58, 237, 0.02)" : "transparent",
                  padding: "10px",
                  borderRadius: "10px",
                  border: b.unlocked ? "1px solid rgba(124, 58, 237, 0.1)" : "1px solid transparent"
                }}
              >
                <div style={{ 
                  width: "42px", 
                  height: "42px", 
                  borderRadius: "10px", 
                  background: b.unlocked ? "var(--grad-amber)" : "rgba(0,0,0,0.05)",
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  fontSize: "1.25rem",
                  boxShadow: b.unlocked ? "0 4px 10px var(--accent-amber-glow)" : "none"
                }}>
                  {b.unlocked ? <Star size={20} style={{ color: "white", fill: "white" }} /> : <Zap size={20} style={{ color: "var(--text-primary)" }} />}
                </div>
                <div>
                  <h4 style={{ fontSize: "0.9375rem", color: "var(--text-primary)", fontWeight: 600 }}>{b.name}</h4>
                  <p style={{ fontSize: "0.9375rem", color: "var(--text-primary)", lineHeight: "1.3" }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Level Info */}
        <div className="glass" style={{ padding: "20px", borderRadius: "16px" }}>
          <h3 style={{ fontSize: "1rem", color: "var(--text-primary)", marginBottom: "12px" }}>Hustle Level: 3</h3>
          <p style={{ fontSize: "0.9375rem", color: "var(--text-primary)", marginBottom: "12px" }}>
            Earn 120 more XP by completing milestones to unlock "Level 4: Affiliate Expert".
          </p>
          <div style={{ width: "100%", height: "6px", background: "rgba(0,0,0,0.03)", borderRadius: "9999px", overflow: "hidden" }}>
            <div style={{ width: "60%", height: "100%", background: "var(--grad-pink)", borderRadius: "9999px" }} />
          </div>
        </div>

      </div>

    </div>
  );
};

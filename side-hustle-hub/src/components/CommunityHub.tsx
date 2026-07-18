import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  ThumbsUp, 
  Send, 
  Filter, 
  UserCheck, 
  Sparkles,
  TrendingUp,
  Users,
  Lightbulb,
  Handshake,
  Heart,
} from "lucide-react";
import gyshCommunityHero from "../assets/gysh-community-hero.png";

interface Comment {
  id: string;
  author: string;
  avatarSeed: string;
  roleBadge: string;
  hustleTag: string;
  content: string;
  likes: number;
  replies: number;
  timestamp: string;
  likedByUser?: boolean;
}

export const CommunityHub: React.FC = () => {
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTag, setNewPostTag] = useState("airbnb");
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      author: "Alex Rivers",
      avatarSeed: "AR",
      roleBadge: "Airbnb Superhost",
      hustleTag: "airbnb",
      content: "Just finalized my automated check-in sequence using smart locks! My response time rating went up to 100% and it saves me about 4 hours of travel per booking. Highly recommend doing this if you are managing a listing remotely.",
      likes: 24,
      replies: 5,
      timestamp: "2 hours ago"
    },
    {
      id: "2",
      author: "Sarah Chen",
      avatarSeed: "SC",
      roleBadge: "Ecom Expert",
      hustleTag: "dropshipping",
      content: "PSA: If you are running Facebook ads for dropshipping, focus on short-form TikTok-style videos. We saw our cost-per-purchase drop by 45% when we switched from static image creatives to custom video hooks.",
      likes: 42,
      replies: 12,
      timestamp: "5 hours ago"
    },
    {
      id: "3",
      author: "Marcus Drake",
      avatarSeed: "MD",
      roleBadge: "POD Creator",
      hustleTag: "pod",
      content: "Etsy's SEO algorithm just rolled out an update. Make sure you revise your long-tail keywords in your tags. Put the absolute most important descriptors in the first 3 tags of your listings!",
      likes: 18,
      replies: 3,
      timestamp: "Yesterday"
    },
    {
      id: "4",
      author: "Elena Rostova",
      avatarSeed: "ER",
      roleBadge: "Brand Influencer",
      hustleTag: "social",
      content: "Negotiated my first brand contract last week! Here is a tip: NEVER accept their first offer. Most brands allocate 30-50% budget head-room for negotiations if your engagement rate is above 4%.",
      likes: 56,
      replies: 15,
      timestamp: "2 days ago"
    },
    {
      id: "5",
      author: "Brian Miller",
      avatarSeed: "BM",
      roleBadge: "Amazon Seller",
      hustleTag: "amazon",
      content: "Finally broke $10k in monthly revenue with Amazon FBA! The first shipment was scary, but once the buy-box kicked in, sales rolled in automatically. Happy to answer any questions about sourcing suppliers on Alibaba.",
      likes: 73,
      replies: 28,
      timestamp: "3 days ago"
    }
  ]);

  const tags = [
    { label: "All Topics", value: "all" },
    { label: "Airbnb Hosting", value: "airbnb" },
    { label: "Print-on-Demand", value: "pod" },
    { label: "Dropshipping", value: "dropshipping" },
    { label: "Affiliate Marketing", value: "affiliate" },
    { label: "Amazon FBA", value: "amazon" },
    { label: "Social Influencer", value: "social" }
  ];

  // Periodic simulated post addition
  useEffect(() => {
    const mockPosts = [
      {
        author: "Devon Vance",
        avatarSeed: "DV",
        roleBadge: "Affiliate Marketer",
        hustleTag: "affiliate",
        content: "Just hit a milestone! Created 3 review posts using Pinterest boards and redirect links. Saw a commission check for $140 this morning. It takes time, but affiliate passive income is real!",
        likes: 12,
        replies: 2
      },
      {
        author: "Chloe King",
        avatarSeed: "CK",
        roleBadge: "POD Designer",
        hustleTag: "pod",
        content: "Pro-tip: Halloween merchandise designs should start going live NOW. Don't wait until October. Search volume peaks in mid-August!",
        likes: 9,
        replies: 1
      },
      {
        author: "Ray Patel",
        avatarSeed: "RP",
        roleBadge: "Airbnb Co-Host",
        hustleTag: "airbnb",
        content: "Co-hosting is an amazing way to start Airbnb with ZERO capital. I manage listings for local owners and split the profits 80/20. Doing this with 3 homes now!",
        likes: 31,
        replies: 8
      }
    ];

    const timer = setInterval(() => {
      const randomPost = mockPosts[Math.floor(Math.random() * mockPosts.length)];
      const newComment: Comment = {
        id: Date.now().toString(),
        author: randomPost.author,
        avatarSeed: randomPost.avatarSeed,
        roleBadge: randomPost.roleBadge,
        hustleTag: randomPost.hustleTag,
        content: randomPost.content,
        likes: randomPost.likes,
        replies: randomPost.replies,
        timestamp: "Just now"
      };

      setComments(prev => [newComment, ...prev]);
    }, 25000); // add one every 25s

    return () => clearInterval(timer);
  }, []);

  const handleLike = (id: string) => {
    setComments(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          likes: c.likedByUser ? c.likes - 1 : c.likes + 1,
          likedByUser: !c.likedByUser
        };
      }
      return c;
    }));
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      author: "You (Hustle Pilot)",
      avatarSeed: "YO",
      roleBadge: "Community Member",
      hustleTag: newPostTag,
      content: newPostContent.trim(),
      likes: 0,
      replies: 0,
      timestamp: "Just now"
    };

    setComments(prev => [newComment, ...prev]);
    setNewPostContent("");
  };

  const filteredComments = selectedTag === "all" 
    ? comments 
    : comments.filter(c => c.hustleTag === selectedTag);

  return (
    <div className="community-hub">
      <section className="community-hero-row" aria-label="GYSH Community">
        <div className="community-hero-media">
          <img
            src={gyshCommunityHero}
            alt="GYSH Community — Ask questions, share updates, and exchange tips with active creators."
            className="community-hero-img"
            width={1024}
            height={682}
            decoding="async"
          />
        </div>
        <div className="glass community-hero-panel">
          <span className="glow-badge emerald" style={{ marginBottom: 8 }}>
            <Users size={12} /> Members
          </span>
          <h2>GYSH Community</h2>
          <p>
            Ask questions, share updates, and exchange tips with active creators. Celebrate wins,
            get help when you&apos;re stuck, and grow together.
          </p>
          <ul className="community-hero-pillars">
            <li><Users size={16} aria-hidden /> Share your wins</li>
            <li><Lightbulb size={16} aria-hidden /> Get help</li>
            <li><Handshake size={16} aria-hidden /> Grow together</li>
            <li><Heart size={16} aria-hidden /> Support each other</li>
          </ul>
        </div>
      </section>

      <div className="community-body">
      {/* Feed Column */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Share Form */}
        <div className="glass" style={{ padding: "24px", borderRadius: "16px" }}>
          <h3 style={{ fontSize: "1.1rem", color: "var(--charcoal)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={16} style={{ color: "var(--bronze)" }} /> Share Your Side Hustle Update
          </h3>

          <form onSubmit={handlePostSubmit}>
            <textarea
              className="text-input"
              rows={3}
              placeholder="What milestone did you reach? Ask a question or share a tip..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              style={{ width: "100%", resize: "none", fontSize: "1rem", marginBottom: "16px" }}
            />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "0.9375rem", color: "var(--text-primary)" }}>Hustle Topic:</span>
                <select 
                  value={newPostTag}
                  onChange={(e) => setNewPostTag(e.target.value)}
                  className="select-input"
                  style={{ width: "180px", padding: "6px 12px", fontSize: "0.9375rem" }}
                >
                  <option value="airbnb">Airbnb Hosting</option>
                  <option value="pod">Print-on-Demand</option>
                  <option value="dropshipping">Dropshipping</option>
                  <option value="affiliate">Affiliate Marketing</option>
                  <option value="amazon">Amazon FBA</option>
                  <option value="social">Social Influencer</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: "8px 16px", fontSize: "0.95rem", gap: "6px" }}>
                <Send size={14} /> Post Update
              </button>
            </div>
          </form>
        </div>

        {/* Filter Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", overflowX: "auto", paddingBottom: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-primary)", fontSize: "0.95rem", whiteSpace: "nowrap" }}>
            <Filter size={14} /> Filter Feed:
          </div>
          {tags.map((t, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedTag(t.value)}
              className={`glow-badge ${selectedTag === t.value ? "purple" : ""}`}
              style={{ 
                cursor: "pointer", 
                border: selectedTag === t.value ? "1px solid var(--accent-purple)" : "1px solid var(--border-color)",
                background: selectedTag === t.value ? "rgba(139, 92, 246, 0.1)" : "rgba(255,255,255,0.01)",
                color: selectedTag === t.value ? "var(--accent-purple)" : "var(--text-secondary)",
                whiteSpace: "nowrap"
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Feed List */}
        <div className="community-feed">
          {filteredComments.map((comment) => {
            const hInfo = tags.find(t => t.value === comment.hustleTag);
            return (
              <div key={comment.id} className="feed-item">
                <div className="feed-item-header">
                  <div className="feed-avatar">
                    {comment.avatarSeed}
                  </div>
                  <div>
                    <span className="feed-username" style={{ color: "var(--charcoal)" }}>{comment.author}</span>
                    <span className="glow-badge" style={{ fontSize: "0.9375rem", padding: "2px 8px", marginLeft: "8px", verticalAlign: "middle" }}>
                      {comment.roleBadge}
                    </span>
                  </div>
                  <span className="feed-timestamp">{comment.timestamp}</span>
                </div>

                <div className="feed-content">
                  {comment.content}
                </div>

                {comment.hustleTag && (
                  <div style={{ marginTop: "12px" }}>
                    <span className="glow-badge cyan" style={{ fontSize: "0.9375rem", padding: "2px 8px" }}>
                      #{hInfo?.label}
                    </span>
                  </div>
                )}

                <div className="feed-actions">
                  <button 
                    onClick={() => handleLike(comment.id)}
                    className="feed-action-btn"
                    style={{ color: comment.likedByUser ? "var(--accent-pink)" : "var(--text-muted)" }}
                  >
                    <ThumbsUp size={14} style={{ fill: comment.likedByUser ? "var(--accent-pink)" : "none" }} /> 
                    {comment.likes} {comment.likes === 1 ? "Like" : "Likes"}
                  </button>
                  <button className="feed-action-btn">
                    <MessageSquare size={14} /> 
                    {comment.replies} {comment.replies === 1 ? "Reply" : "Replies"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Sidebar Column */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Community Stats */}
        <div className="glass" style={{ padding: "20px", borderRadius: "16px" }}>
          <h3 style={{ fontSize: "1rem", color: "var(--charcoal)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <TrendingUp size={16} style={{ color: "var(--accent-emerald)" }} /> Community Stats
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
              <span style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>Active Members:</span>
              <strong style={{ color: "var(--charcoal)" }}>12,840</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
              <span style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>Online Now:</span>
              <strong style={{ color: "var(--accent-emerald)" }}>1,492</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>Weekly Successes:</span>
              <strong style={{ color: "var(--bronze)" }}>243</strong>
            </div>
          </div>
        </div>

        {/* Expert Directory Mock */}
        <div className="glass" style={{ padding: "20px", borderRadius: "16px" }}>
          <h3 style={{ fontSize: "1rem", color: "var(--charcoal)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <UserCheck size={16} style={{ color: "var(--bronze)" }} /> Featured Mentors
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="feed-avatar" style={{ background: "var(--grad-pink)" }}>JD</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--charcoal)" }}>Jordan Davis</span>
                <span style={{ fontSize: "0.9375rem", color: "var(--text-primary)" }}>Amazon FBA ($100k+ Sales)</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="feed-avatar" style={{ background: "var(--grad-amber)" }}>MK</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--charcoal)" }}>Mia K.</span>
                <span style={{ fontSize: "0.9375rem", color: "var(--text-primary)" }}>Airbnb Co-Hosting Coach</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="feed-avatar" style={{ background: "var(--grad-primary)" }}>TW</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--charcoal)" }}>Tyler Webb</span>
                <span style={{ fontSize: "0.9375rem", color: "var(--text-primary)" }}>Affiliate Automation Pro</span>
              </div>
            </div>
          </div>
        </div>

      </div>
      </div>
    </div>
  );
};

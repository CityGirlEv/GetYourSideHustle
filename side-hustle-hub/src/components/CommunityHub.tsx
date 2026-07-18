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
import communityHero from "../assets/membership-hero.png";

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
      <section className="community-hero" aria-label="GYSH Community">
        <div className="community-hero-row">
          <div className="community-hero-media">
            <img
              src={communityHero}
              alt="Join the GYSH Community — together we learn, grow, and succeed. A place for every age: kids, teens, adults, and seniors."
              className="community-hero-img"
              width={1024}
              height={682}
              decoding="async"
            />
          </div>
          <div className="community-hero-side">
            <div className="glass community-hero-panel">
              <span className="glow-badge emerald">
                <Users size={12} aria-hidden /> Community
              </span>
              <h2>Join the GYSH Community</h2>
              <p className="community-hero-lead">
                Together we learn, grow, and succeed — across Kids, Teens, Adults, and Seniors. Ask
                questions, share Side Hustle updates, and trade tips with people building the same way
                you are.
              </p>
              <p>
                Post a win, ask for help when you&apos;re stuck, or drop a tip that saved you time.
                Filter by topic below and grow with the community.
              </p>
            </div>
            <ul className="community-hero-pillars">
              <li>
                <Users size={16} aria-hidden />
                <span>
                  <strong>Share your wins</strong>
                  <em>Celebrate milestones and first earnings</em>
                </span>
              </li>
              <li>
                <Lightbulb size={16} aria-hidden />
                <span>
                  <strong>Get practical help</strong>
                  <em>Ask when you&apos;re stuck — members answer</em>
                </span>
              </li>
              <li>
                <Handshake size={16} aria-hidden />
                <span>
                  <strong>Grow together</strong>
                  <em>Kids, teens, adults &amp; seniors welcome</em>
                </span>
              </li>
              <li>
                <Heart size={16} aria-hidden />
                <span>
                  <strong>Support each other</strong>
                  <em>Kind feedback and accountability</em>
                </span>
              </li>
              <li>
                <TrendingUp size={16} aria-hidden />
                <span>
                  <strong>Topic feed</strong>
                  <em>Airbnb, POD, affiliate, FBA &amp; more</em>
                </span>
              </li>
              <li>
                <MessageSquare size={16} aria-hidden />
                <span>
                  <strong>Real conversations</strong>
                  <em>Tips, questions, and Side Hustle stories</em>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <div className="community-body community-body--feed">
        <div className="community-feed-column">
          <div className="community-bubble-strip" aria-label="Community stats and mentors">
            <div className="community-bubble-group">
              <span className="community-bubble-label">
                <TrendingUp size={14} aria-hidden /> Community Stats
              </span>
              <div className="community-bubbles">
                <span className="community-bubble">
                  <strong>12,840</strong>
                  <em>Active members</em>
                </span>
                <span className="community-bubble community-bubble--live">
                  <strong>1,492</strong>
                  <em>Online now</em>
                </span>
                <span className="community-bubble">
                  <strong>243</strong>
                  <em>Weekly successes</em>
                </span>
              </div>
            </div>
            <div className="community-bubble-group">
              <span className="community-bubble-label">
                <UserCheck size={14} aria-hidden /> Featured Mentors
              </span>
              <div className="community-bubbles">
                <span className="community-bubble community-bubble--mentor">
                  <span className="feed-avatar community-bubble-avatar" style={{ background: "var(--grad-pink)" }}>
                    JD
                  </span>
                  <span>
                    <strong>Jordan Davis</strong>
                    <em>Amazon FBA ($100k+)</em>
                  </span>
                </span>
                <span className="community-bubble community-bubble--mentor">
                  <span className="feed-avatar community-bubble-avatar" style={{ background: "var(--grad-amber)" }}>
                    MK
                  </span>
                  <span>
                    <strong>Mia K.</strong>
                    <em>Airbnb Co-Hosting</em>
                  </span>
                </span>
                <span className="community-bubble community-bubble--mentor">
                  <span className="feed-avatar community-bubble-avatar" style={{ background: "var(--grad-primary)" }}>
                    TW
                  </span>
                  <span>
                    <strong>Tyler Webb</strong>
                    <em>Affiliate Automation</em>
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="glass community-compose">
            <h3>
              <Sparkles size={16} aria-hidden /> Share Your Side Hustle Update
            </h3>

            <form onSubmit={handlePostSubmit}>
              <textarea
                className="text-input"
                rows={3}
                placeholder="What milestone did you reach? Ask a question or share a tip..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
              />

              <div className="community-compose-actions">
                <div className="community-compose-topic">
                  <span>Hustle Topic:</span>
                  <select
                    value={newPostTag}
                    onChange={(e) => setNewPostTag(e.target.value)}
                    className="select-input"
                  >
                    <option value="airbnb">Airbnb Hosting</option>
                    <option value="pod">Print-on-Demand</option>
                    <option value="dropshipping">Dropshipping</option>
                    <option value="affiliate">Affiliate Marketing</option>
                    <option value="amazon">Amazon FBA</option>
                    <option value="social">Social Influencer</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary">
                  <Send size={14} /> Post Update
                </button>
              </div>
            </form>
          </div>

          <div className="community-filter-bar">
            <div className="community-filter-label">
              <Filter size={14} /> Filter Feed:
            </div>
            {tags.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setSelectedTag(t.value)}
                className={`glow-badge ${selectedTag === t.value ? "purple" : ""}`}
                aria-pressed={selectedTag === t.value}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="community-feed">
            {filteredComments.map((comment) => {
              const hInfo = tags.find((t) => t.value === comment.hustleTag);
              return (
                <div key={comment.id} className="feed-item">
                  <div className="feed-item-header">
                    <div className="feed-avatar">{comment.avatarSeed}</div>
                    <div>
                      <span className="feed-username">{comment.author}</span>
                      <span className="glow-badge feed-role-badge">{comment.roleBadge}</span>
                    </div>
                    <span className="feed-timestamp">{comment.timestamp}</span>
                  </div>

                  <div className="feed-content">{comment.content}</div>

                  {comment.hustleTag && (
                    <div className="feed-tag-row">
                      <span className="glow-badge cyan">#{hInfo?.label}</span>
                    </div>
                  )}

                  <div className="feed-actions">
                    <button
                      type="button"
                      onClick={() => handleLike(comment.id)}
                      className={`feed-action-btn${comment.likedByUser ? " is-liked" : ""}`}
                    >
                      <ThumbsUp size={14} />
                      {comment.likes} {comment.likes === 1 ? "Like" : "Likes"}
                    </button>
                    <button type="button" className="feed-action-btn">
                      <MessageSquare size={14} />
                      {comment.replies} {comment.replies === 1 ? "Reply" : "Replies"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

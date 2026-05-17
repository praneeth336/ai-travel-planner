import { useEffect, useState } from 'react';
import { useTripStore } from '../state/tripStore';
import { fetchReviews, submitReview, likeReview } from '../api/client';
import { Review } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MessageSquare, Video, Send, Heart, Share2, Camera, MapPin, Sparkles, Search } from 'lucide-react';

export default function ReviewsPage() {
  const { state } = useTripStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [likedReviews, setLikedReviews] = useState<string[]>([]);
  const [shareToast, setShareToast] = useState<string | null>(null);
  
  // Form State
  const [destination, setDestination] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await fetchReviews();
      setReviews(data);
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (reviewId?: string) => {
    if (!reviewId) return;
    if (likedReviews.includes(reviewId)) return;
    
    // Optimistic update
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, likes: (r.likes || 0) + 1 } : r));
    setLikedReviews(prev => [...prev, reviewId]);
    
    await likeReview(reviewId);
  };

  const handleShare = (review: Review) => {
    const shareText = `Check out this amazing ${review.rating}-star travel review for ${review.destination} on EeezTrip!\n\n"${review.comment}"\n- Shared by ${review.user_name || 'Anonymous Traveler'}`;
    navigator.clipboard.writeText(shareText).then(() => {
      setShareToast(`Review for ${review.destination} copied to clipboard! 📋`);
      setTimeout(() => setShareToast(null), 3000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !comment) return;
    setSubmitting(true);
    
    const newReview = {
      user_id: state.user?.uid || 'anonymous',
      user_name: state.user?.displayName || 'Anonymous Explorer',
      user_photo: state.user?.photoURL || `https://ui-avatars.com/api/?name=${state.user?.displayName || 'Explorer'}`,
      destination,
      rating,
      comment,
      video_url: videoUrl.trim() || null,
    };

    const success = await submitReview(newReview);
    if (success) {
      setDestination('');
      setRating(5);
      setComment('');
      setVideoUrl('');
      setShowForm(false);
      loadReviews();
    }
    setSubmitting(false);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Background Gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(160deg, #f0f9ff 0%, #fdf2f8 45%, #e0f2fe 100%)',
        zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, padding: '120px 24px 80px', maxWidth: 1100, margin: '0 auto' }}>
        
        {/* Header Section */}
        <div className="anim-fade-up" style={{ textAlign: 'center', marginBottom: 60 }}>
          <div className="badge badge-pink" style={{ marginBottom: 16 }}>Community Stories</div>
          <h1 style={{ 
            fontFamily: 'Outfit, sans-serif', 
            fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
            fontWeight: 900, 
            color: '#0c1b33', 
            margin: '0 0 16px',
            letterSpacing: '-0.02em'
          }}>
            Traveler <span className="text-gradient-duo">Moments</span>
          </h1>
          <p style={{ color: '#2d5474', fontSize: '1.15rem', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
            Share your adventures, watch stories from around the world, and inspire your next escape.
          </p>

          <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center', gap: 16 }}>
             <button
                onClick={() => setShowForm(!showForm)}
                className="btn btn-primary btn-lg"
                style={{ borderRadius: 999, padding: '16px 36px', boxShadow: '0 10px 25px rgba(14, 165, 233, 0.25)' }}
              >
                {showForm ? 'Cancel Sharing' : 'Share Your Story'}
                <Sparkles className="w-5 h-5 ml-2" />
              </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="anim-fade-up" style={{ maxWidth: 600, margin: '0 auto 48px', position: 'relative' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#fff',
            border: '1.5px solid rgba(0,0,0,0.08)',
            borderRadius: 24,
            padding: '4px 8px 4px 20px',
            boxShadow: '0 10px 30px rgba(12, 27, 51, 0.04)',
          }}>
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input 
              type="text"
              placeholder="Search reviews by destination (e.g. Kyoto, Bali)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                flexGrow: 1,
                border: 'none',
                outline: 'none',
                fontSize: '1rem',
                color: '#0c1b33',
                padding: '12px 0',
                background: 'transparent',
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#e11d48',
                  cursor: 'pointer',
                  padding: '8px 16px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Submission Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass"
              style={{ padding: '40px', borderRadius: 32, marginBottom: 60, boxShadow: '0 20px 50px rgba(12, 27, 51, 0.08)' }}
            >
              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
                  <div className="space-y-2">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', fontWeight: 800, color: '#0c1b33', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <MapPin className="w-4 h-4 text-brand-coral" />
                      Destination
                    </label>
                    <input 
                      type="text" 
                      required 
                      value={destination} 
                      onChange={e => setDestination(e.target.value)}
                      style={{ width: '100%', padding: '14px 20px', borderRadius: 16, border: '1.5px solid rgba(0,0,0,0.08)', outline: 'none', background: '#fff' }}
                      placeholder="e.g. Kyoto, Japan"
                    />
                  </div>
                  <div className="space-y-2">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', fontWeight: 800, color: '#0c1b33', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <Star className="w-4 h-4 text-brand-amber" />
                      Rating
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          style={{ transition: 'transform 0.2s' }}
                          className={`hover:scale-110 ${rating >= star ? 'text-brand-amber' : 'text-gray-200'}`}
                        >
                          <Star className="w-8 h-8 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', fontWeight: 800, color: '#0c1b33', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <MessageSquare className="w-4 h-4 text-brand-sky" />
                    Your Experience
                  </label>
                  <textarea 
                    required 
                    value={comment} 
                    onChange={e => setComment(e.target.value)}
                    rows={4}
                    style={{ width: '100%', padding: '16px 20px', borderRadius: 20, border: '1.5px solid rgba(0,0,0,0.08)', outline: 'none', background: '#fff', resize: 'vertical' }}
                    placeholder="What were the highlights? Any local secrets to share?"
                  />
                </div>

                <div className="space-y-2">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', fontWeight: 800, color: '#0c1b33', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <Video className="w-4 h-4 text-brand-pink" />
                    Video URL (YouTube or MP4)
                  </label>
                  <input 
                    type="url" 
                    value={videoUrl} 
                    onChange={e => setVideoUrl(e.target.value)}
                    style={{ width: '100%', padding: '14px 20px', borderRadius: 16, border: '1.5px solid rgba(0,0,0,0.08)', outline: 'none', background: '#fff' }}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="btn btn-primary btn-lg" 
                  style={{ width: '100%', padding: '18px', borderRadius: 20, marginTop: 12, fontSize: '1.1rem', fontWeight: 900 }}
                >
                  {submitting ? 'Sharing Moment...' : 'Post to Community'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feed Section */}
        <div style={{ display: 'grid', gap: 40 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
               <div className="w-12 h-12 border-4 border-brand-coral border-t-transparent rounded-full animate-spin mx-auto mb-4" />
               <p className="font-bold text-brand-slate tracking-widest uppercase text-xs">Loading Stories...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="glass" style={{ padding: '80px 40px', textAlign: 'center', borderRadius: 40, border: '2px dashed rgba(0,0,0,0.05)' }}>
              <Camera className="w-20 h-20 text-brand-slate/20 mx-auto mb-6" />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0c1b33', marginBottom: 12 }}>No stories yet</h3>
              <p style={{ color: '#64748b' }}>Be the first to share your journey with the world!</p>
            </div>
          ) : (() => {
            const filtered = reviews.filter(r => 
              r.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
              r.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (r.user_name || '').toLowerCase().includes(searchQuery.toLowerCase())
            );
            if (filtered.length === 0) {
              return (
                <div className="glass" style={{ padding: '80px 40px', textAlign: 'center', borderRadius: 40, border: '2px dashed rgba(0,0,0,0.05)' }}>
                  <Search className="w-16 h-16 text-brand-slate/25 mx-auto mb-6" />
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0c1b33', marginBottom: 12 }}>No matching reviews</h3>
                  <p style={{ color: '#64748b' }}>We couldn't find any reviews matching "{searchQuery}". Try another search!</p>
                </div>
              );
            }
            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 32 }}>
                {filtered.map((r, i) => (
                  <motion.div 
                    key={r.id || i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="glass" 
                    style={{ padding: '32px', borderRadius: 32, boxShadow: '0 10px 30px rgba(12, 27, 51, 0.03)', display: 'flex', flexDirection: 'column' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                         {r.user_photo ? (
                           <img 
                             src={r.user_photo} 
                             alt={r.user_name || 'Traveler'} 
                             style={{ width: 44, height: 44, borderRadius: 14, objectFit: 'cover', border: '1.5px solid rgba(0,0,0,0.08)' }} 
                           />
                         ) : (
                           <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900 }}>
                              {(r.user_name || r.destination).charAt(0)}
                           </div>
                         )}
                         <div>
                           <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0c1b33' }}>{r.destination}</div>
                           <div style={{ fontSize: '0.825rem', color: '#475569', fontWeight: 700 }}>
                             by {r.user_name || 'Anonymous Traveler'}
                           </div>
                           <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 1 }}>
                             {r.created_at ? new Date(r.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recently shared'}
                           </div>
                         </div>
                      </div>
                      <div style={{ display: 'flex', gap: 1, color: '#fbbf24' }}>
                        {[...Array(5)].map((_, idx) => (
                          <Star key={idx} className={`w-4 h-4 ${idx < r.rating ? 'fill-current' : 'text-gray-100'}`} />
                        ))}
                      </div>
                    </div>

                    <p style={{ color: '#2d5474', lineHeight: 1.7, fontSize: '1.05rem', marginBottom: 24, fontStyle: 'italic', flexGrow: 1 }}>
                      "{r.comment}"
                    </p>
                    
                    {r.video_url && (
                      <div style={{ marginBottom: 24, borderRadius: 24, overflow: 'hidden', background: '#000', width: '100%', aspectRatio: '16/9', boxShadow: '0 15px 40px rgba(0,0,0,0.2)' }}>
                        {r.video_url.includes('youtube.com') || r.video_url.includes('youtu.be') ? (
                          <iframe
                            width="100%"
                            height="240"
                            src={`https://www.youtube.com/embed/${r.video_url.split('v=')[1] || r.video_url.split('/').pop()}`}
                            title="Travel Moment"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        ) : (
                          <video controls src={r.video_url} style={{ width: '100%', display: 'block' }} />
                        )}
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', gap: 20, paddingTop: 24, borderTop: '1.5px solid rgba(0,0,0,0.04)' }}>
                      <button 
                        onClick={() => handleLike(r.id || r._id)}
                        className={`flex items-center gap-2 font-bold text-xs uppercase tracking-widest transition-colors ${(r.id || r._id) && likedReviews.includes(r.id || r._id) ? 'text-rose-500 hover:text-rose-600' : 'text-brand-slate hover:text-brand-coral'}`}
                      >
                         <Heart className={`w-4 h-4 ${(r.id || r._id) && likedReviews.includes(r.id || r._id) ? 'fill-current text-rose-500' : ''}`} /> 
                         {r.likes || 0} Likes
                      </button>
                      <button 
                        onClick={() => handleShare(r)}
                        className="flex items-center gap-2 text-brand-slate hover:text-brand-navy transition-colors font-bold text-xs uppercase tracking-widest"
                      >
                         <Share2 className="w-4 h-4" /> Share
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {shareToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            style={{
              position: 'fixed',
              bottom: 30,
              left: '50%',
              x: '-50%',
              zIndex: 1000,
              background: 'rgba(15, 23, 42, 0.95)',
              color: '#fff',
              padding: '14px 28px',
              borderRadius: 999,
              boxShadow: '0 15px 40px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 700,
              fontSize: '0.95rem',
              backdropFilter: 'blur(8px)',
              pointerEvents: 'none'
            }}
          >
            {shareToast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

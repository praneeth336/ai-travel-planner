import { useState, useEffect } from 'react';
import { db, auth, collection, addDoc, query, orderBy, getDocs, serverTimestamp, Timestamp } from '../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, Video, Send, User, Trash2, Heart, Share2 } from 'lucide-react';

interface Review {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  rating: number;
  comment: string;
  videoUrl?: string;
  likes: number;
  createdAt: any;
}

export function CommunityFeed() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedReviews = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      setReviews(fetchedReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert("Please login to share your experience!");
      return;
    }

    setSubmitting(true);
    try {
      const newReview = {
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || "Anonymous Traveler",
        userPhoto: auth.currentUser.photoURL || `https://ui-avatars.com/api/?name=${auth.currentUser.displayName || 'User'}`,
        rating,
        comment,
        videoUrl: videoUrl.trim() || null,
        likes: 0,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'reviews'), newReview);
      setComment('');
      setVideoUrl('');
      setRating(5);
      setShowForm(false);
      fetchReviews();
    } catch (error) {
      console.error("Error adding review:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-black text-brand-navy mb-2">Community Feed</h2>
          <p className="text-brand-slate font-medium">Hear from fellow explorers and share your journey.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-brand-coral text-white rounded-2xl font-bold shadow-lg shadow-brand-coral/20 hover:scale-105 transition-transform"
        >
          {showForm ? 'Cancel' : 'Share Experience'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-[2rem] p-8 border border-brand-border shadow-xl mb-12"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block text-sm font-black text-brand-navy uppercase tracking-widest">Your Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-2 transition-transform hover:scale-110 ${rating >= star ? 'text-brand-amber' : 'text-gray-200'}`}
                      >
                        <Star className="w-8 h-8 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-black text-brand-navy uppercase tracking-widest">Video URL (Optional)</label>
                  <div className="relative">
                    <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-slate" />
                    <input
                      type="url"
                      placeholder="Paste YouTube or MP4 link..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-brand-ice/50 rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-coral outline-none text-brand-navy font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-black text-brand-navy uppercase tracking-widest">Share Your Story</label>
                <textarea
                  required
                  placeholder="Tell others about your trip highlights, hidden gems, and tips..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full p-6 bg-brand-ice/50 rounded-2xl border border-brand-border focus:ring-2 focus:ring-brand-coral outline-none text-brand-navy font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-brand-navy text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-brand-slate transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {submitting ? 'Sharing...' : (
                  <>
                    Post Review
                    <Send className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-brand-coral border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 bg-brand-ice/30 rounded-[3rem] border-2 border-dashed border-brand-border">
            <MessageSquare className="w-16 h-16 text-brand-slate/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-brand-navy">No stories yet</h3>
            <p className="text-brand-slate">Be the first to share your journey!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-[2.5rem] p-8 border border-brand-border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <img
                    src={review.userPhoto}
                    alt={review.userName}
                    className="w-14 h-14 rounded-full border-2 border-brand-ice object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-brand-navy">{review.userName}</h4>
                    <div className="flex gap-1 text-brand-amber">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-xs font-medium text-brand-slate bg-brand-ice px-3 py-1 rounded-full">
                  {review.createdAt instanceof Timestamp ? review.createdAt.toDate().toLocaleDateString() : 'Just now'}
                </div>
              </div>

              <p className="text-brand-slate leading-relaxed mb-6 whitespace-pre-wrap">
                {review.comment}
              </p>

              {review.videoUrl && (
                <div className="mb-6 rounded-3xl overflow-hidden bg-black aspect-video shadow-inner">
                  {review.videoUrl.includes('youtube.com') || review.videoUrl.includes('youtu.be') ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${review.videoUrl.split('v=')[1] || review.videoUrl.split('/').pop()}`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <video
                      src={review.videoUrl}
                      controls
                      className="w-full h-full"
                    />
                  )}
                </div>
              )}

              <div className="flex items-center gap-6 pt-6 border-t border-brand-border/50">
                <button className="flex items-center gap-2 text-brand-slate hover:text-brand-coral transition-colors font-bold text-sm">
                  <Heart className="w-5 h-5" />
                  {review.likes} Likes
                </button>
                <button className="flex items-center gap-2 text-brand-slate hover:text-brand-navy transition-colors font-bold text-sm">
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

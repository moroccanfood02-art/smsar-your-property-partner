import React, { useState, useEffect } from 'react';
import { Star, User, Send, Loader2, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profile?: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface PropertyReviewsProps {
  propertyId: string;
  ownerId: string;
}

const PropertyReviews: React.FC<PropertyReviewsProps> = ({ propertyId, ownerId }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [userReview, setUserReview] = useState<Review | null>(null);

  const translations = {
    ar: {
      reviews: 'التقييمات',
      writeReview: 'اكتب تقييمك',
      noReviews: 'لا توجد تقييمات بعد',
      beFirst: 'كن أول من يقيم هذا العقار',
      submit: 'إرسال التقييم',
      update: 'تحديث التقييم',
      cancel: 'إلغاء',
      commentPlaceholder: 'اكتب تعليقك هنا...',
      reviewSubmitted: 'تم إرسال التقييم بنجاح',
      reviewUpdated: 'تم تحديث التقييم بنجاح',
      reviewDeleted: 'تم حذف التقييم',
      loginRequired: 'يجب تسجيل الدخول للتقييم',
      ownerCantReview: 'لا يمكن للمالك تقييم عقاره',
      selectRating: 'اختر تقييمك',
      average: 'متوسط التقييم',
      basedOn: 'بناءً على',
      reviewsCount: 'تقييم',
    },
    en: {
      reviews: 'Reviews',
      writeReview: 'Write a Review',
      noReviews: 'No reviews yet',
      beFirst: 'Be the first to review this property',
      submit: 'Submit Review',
      update: 'Update Review',
      cancel: 'Cancel',
      commentPlaceholder: 'Write your comment here...',
      reviewSubmitted: 'Review submitted successfully',
      reviewUpdated: 'Review updated successfully',
      reviewDeleted: 'Review deleted',
      loginRequired: 'Please login to review',
      ownerCantReview: 'Owner cannot review their own property',
      selectRating: 'Select your rating',
      average: 'Average Rating',
      basedOn: 'Based on',
      reviewsCount: 'reviews',
    },
    fr: {
      reviews: 'Avis',
      writeReview: 'Écrire un Avis',
      noReviews: 'Pas encore d\'avis',
      beFirst: 'Soyez le premier à évaluer cette propriété',
      submit: 'Soumettre l\'Avis',
      update: 'Mettre à jour l\'Avis',
      cancel: 'Annuler',
      commentPlaceholder: 'Écrivez votre commentaire ici...',
      reviewSubmitted: 'Avis soumis avec succès',
      reviewUpdated: 'Avis mis à jour avec succès',
      reviewDeleted: 'Avis supprimé',
      loginRequired: 'Veuillez vous connecter pour évaluer',
      ownerCantReview: 'Le propriétaire ne peut pas évaluer sa propre propriété',
      selectRating: 'Sélectionnez votre note',
      average: 'Note Moyenne',
      basedOn: 'Basé sur',
      reviewsCount: 'avis',
    },
  };

  const txt = translations[language];

  useEffect(() => {
    fetchReviews();
  }, [propertyId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for reviews
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(r => r.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', userIds);

        const reviewsWithProfiles = data.map(review => ({
          ...review,
          profile: profiles?.find(p => p.user_id === review.user_id),
        }));

        setReviews(reviewsWithProfiles);
        
        // Check if user has already reviewed
        if (user) {
          const existingReview = reviewsWithProfiles.find(r => r.user_id === user.id);
          if (existingReview) {
            setUserReview(existingReview);
          }
        }
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error(txt.loginRequired);
      return;
    }

    if (user.id === ownerId) {
      toast.error(txt.ownerCantReview);
      return;
    }

    if (rating === 0) {
      toast.error(txt.selectRating);
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from('reviews')
          .update({ rating, comment: comment || null })
          .eq('id', editingId);

        if (error) throw error;
        toast.success(txt.reviewUpdated);
      } else {
        const { error } = await supabase
          .from('reviews')
          .insert({
            property_id: propertyId,
            user_id: user.id,
            rating,
            comment: comment || null,
          });

        if (error) throw error;
        toast.success(txt.reviewSubmitted);
      }

      setRating(0);
      setComment('');
      setEditingId(null);
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Error submitting review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (review: Review) => {
    setEditingId(review.id);
    setRating(review.rating);
    setComment(review.comment || '');
  };

  const handleDelete = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      toast.success(txt.reviewDeleted);
      setUserReview(null);
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setRating(0);
    setComment('');
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' }
    );
  };

  const canReview = user && user.id !== ownerId && !userReview;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{txt.reviews}</CardTitle>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                <span className="font-bold text-lg">{averageRating}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                ({reviews.length} {txt.reviewsCount})
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Write Review Form */}
        {(canReview || editingId) && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold">{txt.writeReview}</h4>
            
            {/* Star Rating */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-500 text-amber-500'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Comment */}
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={txt.commentPlaceholder}
              rows={3}
            />

            {/* Submit Button */}
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={submitting || rating === 0}>
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin me-2" />
                ) : (
                  <Send className="w-4 h-4 me-2" />
                )}
                {editingId ? txt.update : txt.submit}
              </Button>
              {editingId && (
                <Button variant="outline" onClick={cancelEdit}>
                  {txt.cancel}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Reviews List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">{txt.noReviews}</p>
            <p className="text-sm text-muted-foreground">{txt.beFirst}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="p-4 border border-border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center overflow-hidden">
                      {review.profile?.avatar_url ? (
                        <img
                          src={review.profile.avatar_url}
                          alt={review.profile.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-amber-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{review.profile?.full_name || 'Anonymous'}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(review.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'fill-amber-500 text-amber-500'
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      ))}
                    </div>
                    {user?.id === review.user_id && (
                      <div className="flex gap-1 ms-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(review)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={() => handleDelete(review.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                {review.comment && (
                  <p className="mt-3 text-muted-foreground">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyReviews;

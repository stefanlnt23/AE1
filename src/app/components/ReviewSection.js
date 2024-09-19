'use client';

import { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import styles from './ReviewSection.module.css';

export default function ReviewSection({ hotelId }) {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    setUser(auth.currentUser);

    const fetchReviews = async () => {
      const db = getFirestore();
      const q = query(collection(db, 'reviews'), where('hotelId', '==', hotelId));
      const querySnapshot = await getDocs(q);
      const fetchedReviews = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(fetchedReviews);
    };

    fetchReviews();
  }, [hotelId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('You must be logged in to submit a review.');
      return;
    }

    const db = getFirestore();
    try {
      const docRef = await addDoc(collection(db, 'reviews'), {
        hotelId,
        userId: user.uid,
        username: user.displayName || 'Anonymous',
        rating: newReview.rating,
        comment: newReview.comment,
        createdAt: serverTimestamp()
      });

      setReviews([...reviews, { 
        id: docRef.id, 
        ...newReview, 
        username: user.displayName || 'Anonymous', 
        createdAt: new Date() 
      }]);
      setNewReview({ rating: 5, comment: '' });
    } catch (error) {
      console.error('Error adding review: ', error);
    }
  };

  return (
    <div className={styles.reviewSection}>
      <h2>Customer Reviews</h2>
      <div className={styles.reviewList}>
        {reviews.map(review => (
          <div key={review.id} className={styles.review}>
            <div className={styles.reviewHeader}>
              <span className={styles.username}>{review.username}</span>
              <span className={styles.rating}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
            </div>
            <p className={styles.comment}>{review.comment}</p>
            <span className={styles.date}>
              {review.createdAt && new Date(review.createdAt.seconds * 1000).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
      {user && (
        <form onSubmit={handleSubmitReview} className={styles.reviewForm}>
          <h3>Write a Review</h3>
          <div className={styles.ratingInput}>
            <label htmlFor="rating">Rating:</label>
            <select
              id="rating"
              value={newReview.rating}
              onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
            >
              {[5, 4, 3, 2, 1].map(num => (
                <option key={num} value={num}>{num} {'★'.repeat(num)}{'☆'.repeat(5 - num)}</option>
              ))}
            </select>
          </div>
          <div className={styles.commentInput}>
            <label htmlFor="comment">Comment:</label>
            <textarea
              id="comment"
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              required
            />
          </div>
          <button type="submit">Submit Review</button>
        </form>
      )}
    </div>
  );
}
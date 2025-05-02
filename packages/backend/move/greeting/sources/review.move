/// Module: review
/// Defines the structure and functions for game reviews, managed primarily through the `game` module.
/// Reviews are created via `game::create_review` (or `create_review_without_pod`) and stored within the Game object's table.
/// Users can interact with existing reviews (e.g., vote) using the entry functions provided here.
module greeting::review;

use std::string::{Self, String};
use sui::clock::{Clock};

/// Intrinsic score (IS): Length of review content.
/// 内在分数（IS）：评论内容的长度。
/// Extrinsic score (ES): Number of votes a review receives.
/// 外在分数 (ES)：评论收到的投票数。
/// Verification multiplier (VM): Reviews with PoD receive a multiplier to improve rating.
/// 验证乘数 (VM)：具有 PoD （游戏时间证明） 的评论将获得乘数以提高评级。
/// Total score (TS): IS + ES * VM.
/// 总分 (TS)：IS + ES * VM.

/// Error code for when review content length is outside the allowed range.
const EInvalidContentLen: u64 = 1;
/// Minimum allowed length for review content.
const MIN_REVIEW_CONTENT_LEN: u64 = 5;
/// Maximum allowed length for review content.
const MAX_REVIEW_CONTENT_LEN: u64 = 1000;

/// Represents a user review for a specific game.
/// Contains content, rating, votes, and a calculated score based on various factors.
public struct Review has key, store {
    id: UID,
    /// The ID of the game being reviewed.
    game_id: ID,
    /// The text content of the review.
    content: String,
    /// Timestamp (from Clock) when the review was created.
    time_issued: u64,
    /// User-provided rating (e.g., 0-5).
    rating: u64,
    /// Length of the review content, used as part of the intrinsic score.
    len: u64,
    /// Net votes (upvotes - downvotes) received by the review.
    votes: u64, // Note: This is signed conceptually but stored as u64. Downvotes subtract.
    /// Duration of interaction provided by ProofOfDuration (e.g., playtime).
    /// Used as a verification multiplier.
    duration: u64,
    /// Calculated total score used for ranking/sorting reviews.
    /// TS = min(len, 150) + (10 * votes) * VM(duration)
    total_score: u64,
    /// The address of the review author.
    owner: address,
}

/// Creates a new Review object. Called internally by the `game` module.
/// Calculates the initial total score.
///
/// # Arguments
/// * `owner`: The address of the review author.
/// * `game_id`: The `ID` of the game being reviewed.
/// * `content`: The text content of the review.
/// * `clock`: A reference to the `Clock` object for timestamps.
/// * `rating`: The user-provided rating.
/// * `duration`: The interaction duration from `ProofOfDuration` (or 0 if none).
/// * `ctx`: The transaction context.
///
/// # Returns
/// * The newly created `Review` object.
///
/// # Aborts
/// * If `content` length is not within `MIN_REVIEW_CONTENT_LEN` and `MAX_REVIEW_CONTENT_LEN` (`EInvalidContentLen`).
public(package) fun create_review(owner: address, game_id: ID, content: String, clock: &Clock, rating: u64, duration: u64, ctx: &mut TxContext) : Review {
    let len = string::length(&content);
    assert!(len >= MIN_REVIEW_CONTENT_LEN && len <= MAX_REVIEW_CONTENT_LEN, EInvalidContentLen);

    let mut review = Review {
        id: object::new(ctx),
        game_id,
        content,
        time_issued: clock.timestamp_ms(),
        rating,
        len,
        votes: 0,
        duration,
        total_score: 0, // Initialized to 0, calculated next
        owner
    };

    // Calculate and set the initial total score
    review.total_score = calculate_total_score(&review);
    review
}

/// Deletes a Review object. Called internally when a review is removed from the game.
///
/// # Arguments
/// * `review`: The `Review` object to delete.
public(package) fun delete_review(review: Review) {
    let Review {
        id,
        // Unpack all fields to ensure the struct is fully consumed
        game_id: _, 
        content: _, 
        time_issued: _, 
        rating: _, 
        len: _, 
        votes: _, 
        duration: _, 
        total_score: _, 
        owner: _, 
    } = review;

    object::delete(id);
}

/// Returns the ID of the review.
public fun get_id(rev: &Review): ID {
    rev.id.to_inner()
}

/// Returns the calculated total score of the review.
public fun get_total_score(rev: &Review): u64 {
    rev.total_score
}

/// Returns the timestamp when the review was issued.
public fun get_time_issued(rev: &Review): u64 {
    rev.time_issued
}

/// Increments the vote count for the review and updates its total score.
/// This is a public entry point. Access control (e.g., preventing double voting)
/// is currently NOT handled here and should be managed by the calling context if needed.
///
/// # Arguments
/// * `rev`: Mutable reference to the `Review` object.
public(package) fun upvote(rev: &mut Review) {
    // Consider potential overflow if votes can be extremely high, although unlikely.
    rev.votes = rev.votes + 1;
    update_total_score(rev);
}

/// Decrements the vote count for the review and updates its total score.
/// This is a public entry point. Access control is NOT handled here.
/// Note: `votes` is u64, this prevents the count from going below zero.
///
/// # Arguments
/// * `rev`: Mutable reference to the `Review` object.
public(package) fun downvote(rev: &mut Review) {
    // Prevents underflow by checking if votes > 0
    if (rev.votes > 0) {
        rev.votes = rev.votes - 1;
    };
    update_total_score(rev);
}

/// Calculates the total score based on length, votes, and duration multiplier.
/// Score = min(Length, 150) + (10 * Votes) * VerificationMultiplier(Duration)
///
/// # Arguments
/// * `rev`: Immutable reference to the `Review` object.
///
/// # Returns
/// * The calculated total score as a `u64`.
fun calculate_total_score(rev: &Review): u64 {
    // Cap intrinsic score (length) at 150
    let intrinsic_score = rev.len.min(150); 
    
    // Extrinsic score based on votes (could be negative if downvotes > upvotes)
    // Since votes is u64, this calculation assumes votes won't underflow in downvote().
    let extrinsic_score = 10 * rev.votes; 

    // Verification Multiplier based on duration
    let vm = if (rev.duration >= 1000) { 10 } // ~16.7 mins
    else if (rev.duration >= 100) { 8 }   // ~1.7 mins
    else if (rev.duration >= 10) { 6 }    // 10 secs
    else if (rev.duration >= 1) { 4 }     // 1 sec
    else { 2 }; // No PoD or < 1 sec

    (intrinsic_score + extrinsic_score) * vm
}

/// Updates the `total_score` field of a review by recalculating it.
///
/// # Arguments
/// * `rev`: Mutable reference to the `Review` object.
fun update_total_score(rev: &mut Review) {
    rev.total_score = calculate_total_score(rev);
}
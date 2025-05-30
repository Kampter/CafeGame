/// Module: game
/// Manages game entities, reviews, guides, purchase access (vector-based), and on-chain access verification.
module greeting::game;

use std::string::{String, utf8};
use sui::balance::{Self, Balance};
use sui::transfer::{public_transfer};
use sui::object_table::{Self, ObjectTable}; // Keep for reviews/guides table
use sui::sui::SUI;
use sui::clock::{Clock};
use sui::event; // Import event module
use sui::dynamic_field as of; // Change alias from df to of
use sui::coin::{Self, Coin}; // Import Coin and coin module
use greeting::review::{Self, Review};
use greeting::guide::{Self, Guide, GuideType, code_to_guide_type};

// === Errors ===

/// Operation failed due to invalid permissions, typically missing or incorrect AdminCap.
const EInvalidPermission: u64 = 0;
/// Payment amount provided is less than the game's price.
const EInsufficientPayment: u64 = 1;
/// The user attempting to purchase the game has already purchased it.
const EAlreadyPurchased: u64 = 2;
/// Access denied for the requested resource, either due to lack of purchase or invalid resource ID prefix.
const ENoAccess: u64 = 3; // New error code for access verification
/// Error for already voted/liked
const EVotedAlready: u64 = 4;

// === Structs ===

/// A capability granting administrative privileges for a specific game.
/// Held by the game creator initially.
public struct AdminCap has key, store {
    id: UID,
    /// The ID of the game this capability is associated with.
    game_id: ID,
}

/// A proof object signifying that the holder has interacted with a game for a certain duration.
/// Consumed when creating a review to potentially weigh the review score.
public struct ProofOfDuration has key, store {
    id: UID,
    /// The ID of the game this proof relates to.
    game_id: ID,
    /// The duration of interaction (e.g., playtime in seconds).
    duration: u64,
}

/// Represents the event of a review being issued for a game.
/// Stored as a dynamic field on the Game object, keyed by the Review ID.
public struct ReviewIssued has copy, store, drop {
    owner: address,
    /// The rating given in the review.
    rating: u64, 
    /// Timestamp (from Clock) when the review was created.
    time_issued: u64,
}

/// Represents the event of a guide being issued for a game.
/// Stored as a dynamic field on the Game object, keyed by the Guide ID.
public struct GuideIssued has copy, store, drop {
    /// The address of the guide author.
    owner: address,
    /// Timestamp (from Clock) when the guide was created.
    time_issued: u64,
    /// The title of the guide.
    title: String, 
}

/// Key for dynamic fields tracking review votes.
public struct ReviewVoteKey has store, copy, drop {
    user: address,
    review_id: ID,
}

/// Key for dynamic fields tracking guide likes.
public struct GuideLikeKey has store, copy, drop {
    user: address,
    guide_id: ID,
}

/// Represents a game on the platform.
public struct Game has key, store {
    id: UID,
    /// Balance holding SUI rewards, funded by game purchases.
    reward_pool: Balance<SUI>,
    /// List of top review IDs. 
    top_reviews: vector<ID>,
    /// Table storing all reviews associated with this game, keyed by Review ID.
    reviews: ObjectTable<ID, Review>,
    /// Table storing all guides associated with this game, keyed by Guide ID.
    guides: ObjectTable<ID, Guide>,
    /// List of recommended guide IDs, potentially for display or promotion.
    recommended_guides: vector<ID>,
    /// The current overall rating, calculated as total_rate / num_reviews.
    overall_rate: u64,
    /// The sum of all ratings received from reviews.
    total_rate: u64,
    /// The total number of reviews submitted.
    num_reviews: u64,
    /// The total number of guides submitted or registered.
    num_guides: u64,
    /// Vector storing addresses of users who have purchased the game.
    access_list: vector<address>,

    // --- Basic Information ---
    name: String,
    genre: String,
    platform: String,
    /// The price required to purchase access to the game (in MIST).
    price: u64,
    description: String,
    /// URL or identifier pointing to the game package stored off-chain (e.g., Walrus).
    game_package_bolb_id: String,
}

// === Public Entry Functions ===

/// Creates a new Game object, shares it, and transfers an AdminCap to the creator.
/// Initializes the game with basic info, empty reward pool, and access list.
///
/// # Arguments
/// * `name`: The name of the game.
/// * `genre`: The genre of the game.
/// * `platform`: The platform the game runs on.
/// * `price`: The price of the game in MIST.
/// * `description`: A short description of the game.
/// * `ctx`: The transaction context.
///
/// # Returns
/// * The `ID` of the newly created Game object.
#[allow(lint(self_transfer))]
public entry fun create_game(name: String, genre: String, platform: String, price: u64, description: String, game_package_bolb_id: String, ctx: &mut TxContext): ID {
    let id = object::new(ctx);
    let game_id = id.to_inner();

    let game = Game {
        id,
        reward_pool: balance::zero(),
        top_reviews: vector[],
        reviews: object_table::new(ctx),
        guides: object_table::new(ctx),
        recommended_guides: vector[],
        overall_rate: 0,
        total_rate: 0,
        num_reviews: 0,
        num_guides: 0,
        access_list: vector::empty<address>(), // Initialize empty vector
        name,
        genre,
        platform,
        price,
        description,
        game_package_bolb_id
    };

    let admin_cap = AdminCap {
        id: object::new(ctx),
        game_id,
    };

    transfer::public_share_object(game);
    transfer::public_transfer(admin_cap, ctx.sender());
    game_id
}

/// Allows a user to purchase access to the game by sending a SUI Coin.
/// Adds the user to the access list vector and deposits the payment into the reward pool.
/// The input Coin object is consumed in this process.
///
/// # Arguments
/// * `game`: Mutable reference to the `Game` object.
/// * `payment`: A `Coin<SUI>` object sent by the user as payment.
/// * `ctx`: The transaction context.
///
/// # Aborts
/// * If the sender has already purchased the game (`EAlreadyPurchased`).
/// * If the `payment` coin value is less than `game.price` (`EInsufficientPayment`).
public entry fun purchase_game(game: &mut Game, payment: Coin<SUI>, ctx: &mut TxContext) {
    let buyer = ctx.sender();
    assert!(!vector::contains(&game.access_list, &buyer), EAlreadyPurchased);
    
    // Check if payment coin value is sufficient
    let payment_amount = coin::value(&payment);
    assert!(payment_amount >= game.price, EInsufficientPayment);

    // Add buyer to access list vector
    vector::push_back(&mut game.access_list, buyer);

    // Convert the Coin<SUI> into a Balance<SUI> and deposit into reward pool
    let payment_balance: Balance<SUI> = coin::into_balance(payment);
    balance::join(&mut game.reward_pool, payment_balance);
}

/// Removes a user's access from the game's access list. Requires AdminCap.
///
/// # Arguments
/// * `game`: Mutable reference to the `Game` object.
/// * `user_to_remove`: The address to remove from the access list.
/// * `admin_cap`: The `AdminCap` associated with this game.
///
/// # Aborts
/// * If `admin_cap` is not valid for this game (`EInvalidPermission`).
/// Note: Does not abort if `user_to_remove` is not found in the list.
public entry fun remove_access(game: &mut Game, user_to_remove: address, admin_cap: &AdminCap) {
    assert!(admin_cap.game_id == &game.id.to_inner(), EInvalidPermission);

    let (found, index): (bool, u64) = vector::index_of(&game.access_list, &user_to_remove);
    
    if (found) {
        vector::remove(&mut game.access_list, index);
    }
    // If user not found (found == false), do nothing.
}

/// Updates the off-chain game package URL. Requires AdminCap.
///
/// # Arguments
/// * `game`: Mutable reference to the `Game` object.
/// * `new_url`: The new URL string for the game package.
/// * `admin_cap`: The `AdminCap` associated with this game.
///
/// # Aborts
/// * If `admin_cap` is not valid for this game (`EInvalidPermission`).
public entry fun update_package_url(game: &mut Game, new_blob_id_str: String, admin_cap: &AdminCap) {
    assert!(admin_cap.game_id == &game.id.to_inner(), EInvalidPermission);
    game.game_package_bolb_id = new_blob_id_str;
}

/// Creates a new review for the game, consuming a ProofOfDuration.
///
/// # Arguments
/// * `game`: Mutable reference to the `Game` object.
/// * `owner`: The address of the review author (obtained from the review object later).
/// * `content`: The text content of the review.
/// * `rating`: The rating given (e.g., 1-5 stars).
/// * `clock`: A reference to the `Clock` object for timestamps.
/// * `pod`: The `ProofOfDuration` object, proving interaction with the game.
/// * `ctx`: The transaction context.
///
/// # Aborts
/// * If `pod.game_id` does not match `game.id` (`EInvalidPermission`).
public entry fun create_review(
    game: &mut Game, 
    owner: address, 
    content: String, 
    rating: u64, 
    clock: &Clock, 
    pod: ProofOfDuration, 
    ctx: &mut TxContext
) {
    assert!(pod.game_id == &game.id.to_inner(), EInvalidPermission);
    let ProofOfDuration { id: pod_id, game_id: _, duration } = pod;
    object::delete(pod_id); // Consume the proof
    let review = review::create_review(ctx.sender(), game.id.to_inner(), content, clock, rating, duration, ctx);
    game.add_review(owner, rating, review, ctx);
}

/// Creates a new review for the game without requiring ProofOfDuration.
/// Useful for scenarios where proof of interaction is not needed or handled differently.
///
/// # Arguments
/// * `game`: Mutable reference to the `Game` object.
/// * `owner`: The address of the review author.
/// * `content`: The text content of the review.
/// * `rating`: The rating given (e.g., 1-5 stars).
/// * `clock`: A reference to the `Clock` object for timestamps.
/// * `ctx`: The transaction context.
public entry fun create_review_without_pod(
    game: &mut Game, 
    owner: address, 
    content: String, 
    rating: u64, 
    clock: &Clock, 
    ctx: &mut TxContext
) {
    // Duration is set to 0 when no PoD is provided
    let review = review::create_review(ctx.sender(), game.id.to_inner(), content, clock, rating, 0, ctx);
    game.add_review(owner, rating, review, ctx);
}

/// Creates a new guide for the game and adds it to the game's guide table.
///
/// # Arguments
/// * `game`: Mutable reference to the `Game` object.
/// * `title`: The title of the guide.
/// * `content`: The main content of the guide.
/// * `guide_type`: The type of guide (e.g., Walkthrough, Tips).
/// * `clock`: A reference to the `Clock` object for timestamps.
/// * `ctx`: The transaction context.
///
/// # Aborts
/// * Aborts if `guide::create_guide` aborts (e.g., invalid content length).
public entry fun create_guide_for_game(
    game: &mut Game,
    title: String,
    content: String,
    guide_type_code: u8,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    // Convert the u8 code to the GuideType enum using the imported function
    let guide_type: GuideType = guide::code_to_guide_type(guide_type_code);

    let owner = ctx.sender(); 
    let game_id = object::id(game); 

    // Create the Guide object using the function from the guide module
    let guide = guide::create_guide(owner, game_id, title, content, guide_type, clock, ctx);
    
    // Get the ID of the newly created Guide object
    let guide_object_id = object::id(&guide);

    // Add the guide to the ObjectTable using its own ID as the key
    object_table::add(&mut game.guides, guide_object_id, guide);
    game.num_guides = game.num_guides + 1;

    // Emit the event
    event::emit(GuideIssued {
        owner,
        time_issued: clock.timestamp_ms(),
        title,
    });
}

/// Allows anyone to register an arbitrary Guide ID with the game.
/// This adds a `GuideIssued` dynamic field entry and increments `num_guides`,
/// even if the Guide object itself doesn't exist in the `game.guides` table.
/// Use with caution or add permission checks if needed.
///
/// # Arguments
/// * `game`: Mutable reference to the `Game` object.
/// * `guide_id`: The `ID` of the guide to register (does not need to exist in `game.guides`).
/// * `ctx`: The transaction context.
public entry fun register_guide_id(
    game: &mut Game,
    guide_id: ID,
    ctx: &mut TxContext
) {
    // Check if already recommended to avoid duplicates in that list
    let already_recommended = vector::contains(&game.recommended_guides, &guide_id);
    
    // Add to recommended list only if not already present
    // Note: This adds ANY ID to recommended, consider if this is desired.
    if (!already_recommended) {
        game.recommended_guides.push_back(guide_id);
    };
        
    // Check if a GuideIssued DF already exists for this ID
    // We should only increment num_guides and add DF if it's truly a new registration
    if (!of::exists_(&game.id, guide_id)) {
        // Increment guide count regardless of presence in the object table
        game.num_guides = game.num_guides + 1;
        
        // Add a dynamic field association, using placeholder data as the actual Guide is not accessed.
        let guide_association = GuideIssued { 
            owner: tx_context::sender(ctx), // Assume sender is associating this ID
            time_issued: 0, // Placeholder timestamp
            title: utf8(b"Registered ID"), // Placeholder title
        };
        of::add(&mut game.id, guide_id, guide_association);
    }
}

/// Adds a guide ID to the recommended list, requires AdminCap.
///
/// # Arguments
/// * `game`: Mutable reference to the `Game` object.
/// * `guide_id`: The `ID` of the guide to add to recommendations.
/// * `admin_cap`: The `AdminCap` associated with this game.
///
/// # Aborts
/// * If `admin_cap` is not valid for this game (`EInvalidPermission`).
/// * If the `guide_id` does not exist in the `game.guides` table (`EInvalidPermission` - reusing error code).
public entry fun add_recommended_guide(
    game: &mut Game,
    guide_id: ID,
    admin_cap: &AdminCap
) {
    assert!(admin_cap.game_id == &game.id.to_inner(), EInvalidPermission);
    // Ensure the guide actually exists in our table before recommending
    assert!(game.guides.contains(guide_id), EInvalidPermission); // Abort if guide doesn't exist
    
    if (!vector::contains(&game.recommended_guides, &guide_id)) {
        game.recommended_guides.push_back(guide_id);
    }
}

/// Removes a guide ID from the recommended list, requires AdminCap.
///
/// # Arguments
/// * `game`: Mutable reference to the `Game` object.
/// * `guide_id`: The `ID` of the guide to remove from recommendations.
/// * `admin_cap`: The `AdminCap` associated with this game.
///
/// # Aborts
/// * If `admin_cap` is not valid for this game (`EInvalidPermission`).
public entry fun remove_recommended_guide(
    game: &mut Game,
    guide_id: ID,
    admin_cap: &AdminCap
) {
    assert!(admin_cap.game_id == &game.id.to_inner(), EInvalidPermission);
    
    // vector::index_of returns (bool, u64)
    let (found, index) = vector::index_of(&game.recommended_guides, &guide_id);

    // Only remove if the guide was found in the recommended list
    if (found) {
        // vector::remove(&mut game.recommended_guides, option::destroy_some(maybe_index)); // Old logic
        vector::remove(&mut game.recommended_guides, index);
    }
    // Does not abort if the guide_id is not found in the recommended list.
}

/// Creates and transfers a ProofOfDuration object to the sender.
///
/// # Arguments
/// * `game_id`: The `ID` of the game the proof is for.
/// * `duration`: The duration value to store in the proof.
/// * `ctx`: The transaction context.
public entry fun generate_proof_of_duration(game_id: ID, duration: u64, ctx: &mut TxContext){
    let pod = ProofOfDuration {
        id: object::new(ctx),
        game_id,
        duration,
    };
    public_transfer(pod, ctx.sender());
}

/// Public entry function to assert that the sender has access to a specific resource
/// identified by an ID prefixed with this game's ID.
/// Mimics the Walrus Seal approval pattern, intended to be called by storage nodes or other services.
///
/// # Arguments
/// * `game`: Immutable reference to the `Game` object.
/// * `resource_id`: The byte vector representation of the resource ID being accessed.
/// * `ctx`: The transaction context.
///
/// # Aborts
/// * If the sender is not in the game's access list or if the resource_id does not have the game ID as a prefix (`ENoAccess`).
public entry fun seal_approve_access(game: &Game, resource_id: vector<u8>, ctx: &TxContext) {
    assert!(approve_access(game, ctx.sender(), resource_id), ENoAccess);
    // If the assert passes, the transaction continues, proving access for this context.
}

/// Adds a review object to the game's review table and updates game stats.
/// This function is now internal (`public(package)`) as review creation should go through `create_review` or `create_review_no_pod`.
public(package) fun add_review(game: &mut Game, owner: address, rating: u64, review: Review, _ctx: &mut TxContext) {
    let review_id = object::id(&review);
    object_table::add(&mut game.reviews, review_id, review);
    game.num_reviews = game.num_reviews + 1;
    game.total_rate = game.total_rate + rating;
    game.overall_rate = game.total_rate / game.num_reviews; // Recalculate overall rating

    // Potentially update top_reviews list (logic omitted for brevity)

    // Add a ReviewIssued event as a dynamic object field
    // Note: Removed redundant time_issued here, assuming Review already has it.
    //       If ReviewIssued needs its own ID separate from Review ID, keep object::new(ctx)
    //       Otherwise, consider if this DF is necessary if Review itself is in ObjectTable.
    //       Keeping it simple for now.
    // let review_issued_event = ReviewIssued {
    //     id: object::new(ctx), // ID for the event itself
    //     owner, 
    //     rating,
    // };
    // of::add(&mut game.id, review_id, review_issued_event);
}

/// Adds a guide object to the game's guide table and updates game stats.
/// This function is now internal (`public(package)`) as guide creation should go through `create_guide`.
public(package) fun add_guide(game: &mut Game, guide: Guide, _ctx: &mut TxContext) {
    let guide_id = object::id(&guide);
    object_table::add(&mut game.guides, guide_id, guide);
    game.num_guides = game.num_guides + 1;

    // Add a GuideIssued event as a dynamic object field
    // Similar notes as add_review regarding redundancy and necessity of this DF.
    // let guide_issued_event = GuideIssued {
    //     id: object::new(ctx), // ID for the event itself
    //     owner: guide::get_owner(&guide), // Assuming function exists
    //     title: guide::get_title(&guide), // Assuming function exists
    // };
    // of::add(&mut game.id, guide_id, guide_issued_event);
}

// === Access Controlled Voting/Liking ===

/// Entry function to upvote a review. Checks if the user has already voted.
public entry fun upvote_review(game: &mut Game, review_id: ID, ctx: &mut TxContext) {
    let user = ctx.sender();
    let key = ReviewVoteKey { user, review_id };

    // Check if the user has already voted on this review using dynamic object field
    assert!(
        !of::exists_with_type<ReviewVoteKey, bool>(&game.id, key),
        EVotedAlready
    );

    // Add a field to mark that the user has voted. The value (true) doesn't matter much.
    of::add(&mut game.id, key, true);

    // Borrow the Review object mutably from the ObjectTable
    let review = object_table::borrow_mut(&mut game.reviews, review_id);
    // Call the internal upvote function in the review module
    review::upvote(review);
}

/// Entry function to downvote a review. Checks if the user has already voted.
public entry fun downvote_review(game: &mut Game, review_id: ID, ctx: &mut TxContext) {
    let user = ctx.sender();
    let key = ReviewVoteKey { user, review_id };

    // Check if the user has already voted on this review
    assert!(
        !of::exists_with_type<ReviewVoteKey, bool>(&game.id, key),
        EVotedAlready
    );

    // Mark that the user has voted
    of::add(&mut game.id, key, true);

    let review = object_table::borrow_mut(&mut game.reviews, review_id);
    review::downvote(review);
}

/// Entry function to like a guide. Checks if the user has already liked.
public entry fun like_guide(game: &mut Game, guide_id: ID, ctx: &mut TxContext) {
    let user = ctx.sender();
    let key = GuideLikeKey { user, guide_id };

    // Check if the user has already liked this guide
    assert!(
        !of::exists_with_type<GuideLikeKey, bool>(&game.id, key),
        EVotedAlready
    );

    // Mark that the user has liked
    of::add(&mut game.id, key, true);

    let guide = object_table::borrow_mut(&mut game.guides, guide_id);
    guide::like_guide(guide);
}

// === Public View Functions ===

/// Checks if a given user address has purchased access to the game (is in the access list vector).
///
/// # Arguments
/// * `game`: Immutable reference to the `Game` object.
/// * `user`: The address to check.
///
/// # Returns
/// * `true` if the user is in the access list, `false` otherwise.
public fun has_purchased(game: &Game, user: address): bool {
    vector::contains(&game.access_list, &user)
}

/// Returns the price of the game.
public fun get_price(game: &Game): u64 {
    game.price
}

/// Returns the game package URL.
public fun get_package_url(game: &Game): String {
    game.game_package_bolb_id // Returns a copy
}

/// Returns the current balance of the reward pool.
public fun get_reward_pool_balance(game: &Game): u64 {
    balance::value(&game.reward_pool)
}

/// Returns a copy of the access list vector.
/// Note: This can be large and potentially expensive to call.
/// Consider alternative patterns (e.g., events, paginated reads) if needed for off-chain use.
public fun get_access_list(game: &Game): vector<address> {
    *&game.access_list // Returns a copy of the vector
}

/// Checks if a user has purchased the game AND if the resource ID belongs to this game's namespace.
/// Used internally by `verify_game_access`.
///
/// # Arguments
/// * `game`: Immutable reference to the `Game` object.
/// * `user`: The address attempting access.
/// * `resource_id`: The byte vector of the resource ID.
///
/// # Returns
/// * `true` if access is approved, `false` otherwise.
fun approve_access(game: &Game, user: address, resource_id: vector<u8>): bool {
    // Check 1: Is the resource ID prefixed by the game ID?
    // Convert game object ID to bytes to use as the namespace prefix
    let namespace = object::id_to_bytes(&object::id(game)); // Use object::id directly on &Game
    if (!is_prefix(namespace, resource_id)) {
        return false
    };

    // Check 2: Is the user in the access list vector?
    vector::contains(&game.access_list, &user)
}

/// Returns true if `prefix` is a prefix of `word`.
///
/// # Arguments
/// * `prefix`: The potential prefix vector.
/// * `word`: The vector to check against.
///
/// # Returns
/// * `true` if `prefix` is a prefix of `word`, `false` otherwise.
fun is_prefix(prefix: vector<u8>, word: vector<u8>): bool {
    let prefix_len = vector::length(&prefix);
    let word_len = vector::length(&word);

    if (prefix_len > word_len) {
        return false
    };
    let mut i = 0;
    while (i < prefix_len) {
        if (*vector::borrow(&prefix, i) != *vector::borrow(&word, i)) {
            return false
        };
        i = i + 1;
    };
    true
}
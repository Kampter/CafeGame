/// Module: guide
/// Defines the structure and functions for game guides, managed primarily through the `game` module.
/// Guides are created via `game::create_guide_for_game` and stored within the Game object's table.
/// Owners can update their guides directly using the entry functions provided here.
module greeting::guide;

use std::string::{Self, String};
// Explicit imports
use sui::clock::{Clock};

// === Errors ===

/// Error code for when guide content length is outside the allowed range.
const EInvalidContentLen: u64 = 1;
/// Error code for when an action is attempted by an address that is not the guide's owner.
const ENotGuideOwner: u64 = 2;

// === Constants ===

/// Minimum allowed length for guide content.
const MIN_GUIDE_CONTENT_LEN: u64 = 50;
/// Maximum allowed length for guide content.
const MAX_GUIDE_CONTENT_LEN: u64 = 10000;

// === Structs & Enums ===

/// Represents the type of a game guide.
public enum GuideType has store, drop {
    Walkthrough,        // Comprehensive guide covering the entire game or a major part.
    TipsAndTricks,      // Collection of helpful hints and shortcuts.
    CharacterGuide,     // Focuses on a specific character's abilities, builds, etc.
    BossStrategy,       // Details how to defeat a specific boss.
    ResourceFarming,    // Explains efficient ways to gather in-game resources.
    LevelUpGuide,       // Provides strategies for gaining experience or levels quickly.
}

/// Represents a game guide created by a user.
public struct Guide has key, store {
    id: UID,
    /// The ID of the game this guide is associated with.
    game_id: ID,
    /// The title of the guide.
    title: String,
    /// The main content body of the guide.
    content: String,
    /// The category or type of the guide.
    guide_type: GuideType,
    /// Timestamp (from Clock) when the guide was first created.
    created_at: u64,
    /// Timestamp (from Clock) when the guide was last updated.
    updated_at: u64,
    /// Number of likes the guide has received.
    likes: u64,
    /// Number of times the guide has been viewed.
    views: u64,
    /// The address of the guide's author/owner.
    owner: address,
}

// === Public Entry Functions (for users interacting with existing Guide objects) ===

/// Updates the content of an existing guide. Only the owner can perform this action.
///
/// # Arguments
/// * `guide`: Mutable reference to the `Guide` object to update.
/// * `new_content`: The new content string.
/// * `clock`: A reference to the `Clock` object for timestamps.
/// * `ctx`: The transaction context (to get the sender).
///
/// # Aborts
/// * If the sender is not the owner of the guide (`ENotGuideOwner`).
/// * If `new_content` length is outside the allowed range (`EInvalidContentLen`).
public entry fun update_guide_content_entry(
    guide: &mut Guide,
    new_content: String,
    clock: &Clock,
    ctx: &mut TxContext
) {
    update_guide_content(guide, new_content, clock, tx_context::sender(ctx));
}

/// Updates the title of an existing guide. Only the owner can perform this action.
///
/// # Arguments
/// * `guide`: Mutable reference to the `Guide` object to update.
/// * `new_title`: The new title string.
/// * `clock`: A reference to the `Clock` object for timestamps.
/// * `ctx`: The transaction context (to get the sender).
///
/// # Aborts
/// * If the sender is not the owner of the guide (`ENotGuideOwner`).
public entry fun update_guide_title_entry(
    guide: &mut Guide,
    new_title: String,
    clock: &Clock,
    ctx: &mut TxContext
) {
    update_guide_title(guide, new_title, clock, tx_context::sender(ctx));
}

/// Updates the type of an existing guide. Only the owner can perform this action.
///
/// # Arguments
/// * `guide`: Mutable reference to the `Guide` object to update.
/// * `guide_type_code`: The numerical code for the new `GuideType`.
/// * `custom_type`: The string for the custom type if applicable.
/// * `clock`: A reference to the `Clock` object for timestamps.
/// * `ctx`: The transaction context (to get the sender).
///
/// # Aborts
/// * If the sender is not the owner of the guide (`ENotGuideOwner`).
public entry fun update_guide_type_entry(
    guide: &mut Guide,
    guide_type_code: u8,
    clock: &Clock,
    ctx: &mut TxContext
) {
    let guide_type = code_to_guide_type(guide_type_code);
    update_guide_type(guide, guide_type, clock, tx_context::sender(ctx));
}

/// Increments the view count of a guide. Can be called by anyone.
///
/// # Arguments
/// * `guide`: Mutable reference to the `Guide` object.
public entry fun view_guide_entry(guide: &mut Guide) {
    view_guide(guide);
}

/// Increments the like count of a guide. Can be called by anyone.
/// Note: Consider adding access control to prevent like spamming if needed.
///
/// # Arguments
/// * `guide`: Mutable reference to the `Guide` object.
public entry fun like_guide_entry(guide: &mut Guide) {
    like_guide(guide);
}

// === Package-Private Functions (for use by `game` module) ===

/// Internal function to create a Guide struct. Called by `game::create_guide_for_game`.
///
/// # Arguments
/// * `owner`: Address of the guide creator.
/// * `game_id`: ID of the associated game.
/// * `title`: Guide title.
/// * `content`: Guide content.
/// * `guide_type`: The `GuideType` enum value.
/// * `clock`: Reference to the Clock.
/// * `ctx`: Transaction context.
///
/// # Returns
/// * The newly created `Guide` object.
///
/// # Aborts
/// * If `content` length is outside the allowed range (`EInvalidContentLen`).
public(package) fun create_guide(
    owner: address, 
    game_id: ID, 
    title: String, 
    content: String, 
    guide_type: GuideType,
    clock: &Clock, 
    ctx: &mut TxContext
): Guide {
    let content_len = string::length(&content);
    assert!(content_len >= MIN_GUIDE_CONTENT_LEN && content_len <= MAX_GUIDE_CONTENT_LEN, EInvalidContentLen);

    let timestamp = clock.timestamp_ms();
    
    Guide {
        id: object::new(ctx),
        game_id,
        title,
        content,
        guide_type,
        created_at: timestamp,
        updated_at: timestamp,
        likes: 0,
        views: 0,
        owner
    }
}

/// Deletes a Guide object. Called internally when a guide is removed from the game.
///
/// # Arguments
/// * `guide`: The `Guide` object to delete.
public(package) fun delete_guide(guide: Guide) {
    let Guide {
        id,
        // Unpack all fields to consume the struct
        game_id: _, 
        title: _, 
        content: _, 
        guide_type: _, 
        created_at: _, 
        updated_at: _, 
        likes: _, 
        views: _, 
        owner: _, 
    } = guide;

    object::delete(id);
}

// === Public View Functions ===

/// Returns the ID of the guide.
public fun get_id(guide: &Guide): ID {
    guide.id.to_inner()
}

/// Returns the ID of the game associated with the guide.
public fun get_game_id(guide: &Guide): ID {
    guide.game_id
}

/// Returns the address of the guide owner.
public fun get_owner(guide: &Guide): address {
    guide.owner
}

/// Returns the creation timestamp of the guide.
public fun get_created_at(guide: &Guide): u64 {
    guide.created_at
}

/// Returns the last update timestamp of the guide.
public fun get_updated_at(guide: &Guide): u64 {
    guide.updated_at
}

/// Returns the title of the guide.
public fun get_title(guide: &Guide): String {
    guide.title // Returns a copy of the String
}

// === Internal Functions ===

/// Internal helper to increment the view count.
fun view_guide(guide: &mut Guide) {
    // Consider potential overflow if views can be extremely high.
    guide.views = guide.views + 1;
}

/// Internal helper to increment the like count.
public(package) fun like_guide(guide: &mut Guide) {
    // Consider potential overflow.
    guide.likes = guide.likes + 1;
}

/// Internal helper to update guide content.
/// Requires owner check.
fun update_guide_content(
    guide: &mut Guide, 
    new_content: String, 
    clock: &Clock, 
    sender: address
) {
    assert!(guide.owner == sender, ENotGuideOwner);
    
    let content_len = string::length(&new_content);
    assert!(content_len >= MIN_GUIDE_CONTENT_LEN && content_len <= MAX_GUIDE_CONTENT_LEN, EInvalidContentLen);
    
    guide.content = new_content;
    guide.updated_at = clock.timestamp_ms();
}

/// Internal helper to update guide title.
/// Requires owner check.
fun update_guide_title(
    guide: &mut Guide, 
    new_title: String, 
    clock: &Clock, 
    sender: address
) {
    assert!(guide.owner == sender, ENotGuideOwner);
    
    guide.title = new_title;
    guide.updated_at = clock.timestamp_ms();
}

/// Internal helper to update guide type.
/// Requires owner check.
fun update_guide_type(
    guide: &mut Guide, 
    new_type: GuideType, 
    clock: &Clock, 
    sender: address
) {
    assert!(guide.owner == sender, ENotGuideOwner);
    
    guide.guide_type = new_type;
    guide.updated_at = clock.timestamp_ms();
}

/// Converts a numerical code and optional custom string into a GuideType enum.
public(package) fun code_to_guide_type(code: u8): GuideType {
    if (code == 0) { GuideType::Walkthrough }
    else if (code == 1) { GuideType::TipsAndTricks }
    else if (code == 2) { GuideType::CharacterGuide }
    else if (code == 3) { GuideType::BossStrategy }
    else if (code == 4) { GuideType::ResourceFarming }
    else { GuideType::LevelUpGuide }
} 
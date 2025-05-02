/// Module: dashboard
/// Manages a collection of games registered to a specific service type.
module greeting::dashboard;

use std::string::String;
use sui::dynamic_field as df;

/// Represents a dashboard that groups games based on a service type.
/// Games are stored as dynamic fields where the key and value are both the game's ID.
public struct Dashboard has key, store {
    id: UID,
    /// The type of service this dashboard represents (e.g., "arcade", "strategy").
    service_name: String,
}

/// Creates a new, empty Dashboard object and shares it publicly.
///
/// Arguments:
/// * `service_type`: A string identifying the type of service for this dashboard.
/// * `ctx`: The transaction context.
public entry fun create_dashboard(service_name: String, ctx: &mut TxContext) {
    let dashboard = Dashboard {
        id: object::new(ctx),
        service_name
    };
    transfer::public_share_object(dashboard);
}

/// Registers a game ID to the dashboard.
/// Uses a dynamic field with the game ID as both key and value to simulate a set.
///
/// Arguments:
/// * `dashboard`: A mutable reference to the Dashboard object.
/// * `game_id`: The ID of the game to register.
public entry fun register_game(dashboard: &mut Dashboard, game_id: ID) {
    // Add the game_id as both key and value to the dynamic field store.
    df::add(&mut dashboard.id, game_id, game_id);
}

/// Unregisters a game ID from the dashboard.
///
/// Arguments:
/// * `dashboard`: A mutable reference to the Dashboard object.
/// * `game_id`: The ID of the game to unregister.
///
/// Returns:
/// * The ID of the game that was removed.
///
/// Aborts:
/// * If the `game_id` does not exist as a dynamic field key on the `dashboard`.
public entry fun unregister_game(dashboard: &mut Dashboard, game_id: ID): ID {
    // Remove the dynamic field entry for the given game_id.
    // This will abort if the game_id is not found.
    let game_id_value = df::remove<ID, ID>(&mut dashboard.id, game_id);
    game_id_value
}


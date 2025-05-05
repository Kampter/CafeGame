import React, { useState } from 'react';
import { Card, Flex, Text, TextField, TextArea, Button, Spinner, Callout } from '@radix-ui/themes';
// Assuming react-router-dom for navigation, adjust if needed
import { useNavigate } from 'react-router-dom'; 
import { useCreateGameMetadataMutation } from '../../hooks/useGameMutations';
import { notification } from '~~/helpers/notification'; // Using existing notification helper
// Import the extracted type
import type { GameFormData } from '~~/dapp/types/game.types';

// Define the structure for form data - removed, now imported
// interface FormData {
//     name: string;
//     genre: string;
//     platform: string;
//     price: string; // Keep as string for input
//     description: string;
// }

export function CreateGameMetadataForm() {
    const navigate = useNavigate(); // Hook for navigation
    // Use the imported GameFormData type
    const [formData, setFormData] = useState<GameFormData>({
        name: '',
        genre: '',
        platform: '',
        price: '',
        description: '',
    });

    const { createGameMetadata, isLoading, progress } = useCreateGameMetadataMutation({
        onSuccess: (data) => {
            console.log('Game Metadata Created Successfully:', data);
            notification.success(`Game "${formData.name}" metadata created!`);
            // Navigate to the new game's detail page
            // TODO: Adjust the route '/game/:gameId' based on your actual routing setup
            navigate(`/game/${data.gameId}`); 
        },
        // onError is handled internally by the hook showing notifications
    });

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        // Basic validation
        if (!formData.name || !formData.genre || !formData.platform || !formData.price || !formData.description) {
             notification.error(null, 'Please fill out all fields.');
            return;
        }
        // Validate price is a non-negative number string
        const priceNum = Number(formData.price);
        if (isNaN(priceNum) || priceNum < 0) {
             notification.error(null, 'Price must be a valid non-negative number.');
            return;
        }

        await createGameMetadata({
            name: formData.name,
            genre: formData.genre,
            platform: formData.platform,
            price: formData.price, // Pass as string
            description: formData.description,
        });
    };

    return (
        <Card>
            <form onSubmit={handleSubmit}>
                <Flex direction="column" gap="4">
                    <Text size="4" weight="bold">Create New Game Listing</Text>
                    
                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Game Name
                        </Text>
                        <TextField.Root
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter game name"
                            required
                            disabled={isLoading}
                        />
                    </label>

                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Genre
                        </Text>
                        <TextField.Root
                            name="genre"
                            value={formData.genre}
                            onChange={handleInputChange}
                            placeholder="e.g., RPG, Strategy, Puzzle"
                            required
                            disabled={isLoading}
                        />
                    </label>

                     <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Platform
                        </Text>
                        <TextField.Root
                            name="platform"
                            value={formData.platform}
                            onChange={handleInputChange}
                            placeholder="e.g., PC, Mobile, Web"
                            required
                            disabled={isLoading}
                        />
                    </label>

                     <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Price (in MIST)
                        </Text>
                        <TextField.Root
                            name="price"
                            type="number" // Use number input but value is string
                            value={formData.price}
                            onChange={handleInputChange}
                            placeholder="Enter price (e.g., 100000000 for 0.1 SUI)"
                            min="0" // Prevent negative numbers in browser
                            required
                            disabled={isLoading}
                        />
                    </label>

                     <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Description
                        </Text>
                        <TextArea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Briefly describe your game"
                            required
                            disabled={isLoading}
                            style={{ height: 100 }} // Adjust height as needed
                        />
                    </label>

                    {progress.step !== 'idle' && progress.step !== 'success' && progress.step !== 'error' && (
                         <Flex align="center" gap="2">
                             {isLoading && <Spinner size="2" />}
                             <Text size="2" color="gray">{progress.message || `Processing step: ${progress.step}`}</Text>
                         </Flex>
                    )}

                    {progress.step === 'error' && progress.error && (
                         <Callout.Root color="red" role="alert">
                             <Callout.Text>{progress.error}</Callout.Text>
                         </Callout.Root>
                    )}

                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Creating...' : 'Create Game Listing'}
                    </Button>
                </Flex>
            </form>
        </Card>
    );
}

// Optional: Export default if this is the main export of the file
// export default CreateGameMetadataForm; 
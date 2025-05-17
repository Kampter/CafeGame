import React, { useState } from 'react';
// Removed Radix imports that will be replaced
// import { Card, Flex, Text, TextField, TextArea, Button, Spinner, Callout } from '@radix-ui/themes';
import { Flex, Spinner, Callout, Text } from '@radix-ui/themes'; // Keep Spinner, Callout, Text for now
import { useNavigate } from 'react-router-dom';
import { useCreateGameMetadataMutation } from '../../hooks/useGameMutations';
import { notification } from '~~/helpers/notification';
import type { GameFormData } from '~~/dapp/types/game.types';

// Import custom UI components
import { Button } from '~~/components/ui/Button';
import { Input } from '~~/components/ui/Input';
import { Textarea } from '~~/components/ui/Textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '~~/components/ui/Card'; // Using our Card

export function CreateGameMetadataForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<GameFormData>({
        name: '',
        genre: '',
        platform: '',
        price: '',
        description: '',
        // imageUrl: '', // Assuming imageUrl is handled separately or in a future step
    });

    const { createGameMetadata, isLoading, progress } = useCreateGameMetadataMutation({
        onSuccess: (data) => {
            console.log('Game Metadata Created Successfully:', data);
            notification.success(`Game "${formData.name}" metadata created!`);
            navigate(`/game/${data.gameId}`);
        },
    });

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!formData.name || !formData.genre || !formData.platform || !formData.price || !formData.description) {
            notification.error(null, 'Please fill out all fields.');
            return;
        }
        const priceNum = Number(formData.price);
        if (isNaN(priceNum) || priceNum < 0) {
            notification.error(null, 'Price must be a valid non-negative number (MIST).');
            return;
        }

        await createGameMetadata({
            name: formData.name,
            genre: formData.genre,
            platform: formData.platform,
            price: formData.price,
            description: formData.description,
            // imageUrl: formData.imageUrl,
        });
    };

    // State for form validation errors - can be integrated with react-hook-form later if desired
    // For now, basic errors are handled by notification helper

    return (
        // Use our custom Card component
        <Card className="w-full max-w-lg mx-auto" glow> 
            <CardHeader>
                {/* CardTitle already styled from Card.tsx */}
                <CardTitle>List New Game</CardTitle> 
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-realm-text-secondary mb-1">
                            Game Name
                        </label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter game name"
                            required
                            disabled={isLoading}
                            // error={/* Pass error state here if using more complex validation */}
                        />
                    </div>

                    <div>
                        <label htmlFor="genre" className="block text-sm font-medium text-realm-text-secondary mb-1">
                            Genre
                        </label>
                        <Input
                            id="genre"
                            name="genre"
                            value={formData.genre}
                            onChange={handleInputChange}
                            placeholder="e.g., RPG, Strategy, Puzzle"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label htmlFor="platform" className="block text-sm font-medium text-realm-text-secondary mb-1">
                            Platform
                        </label>
                        <Input
                            id="platform"
                            name="platform"
                            value={formData.platform}
                            onChange={handleInputChange}
                            placeholder="e.g., PC, Mobile, Web"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-realm-text-secondary mb-1">
                            Price (in MIST)
                        </label>
                        <Input
                            id="price"
                            name="price"
                            type="number"
                            value={formData.price}
                            onChange={handleInputChange}
                            placeholder="e.g., 1000000000 for 1 SUI"
                            min="0"
                            required
                            disabled={isLoading}
                        />
                         <p className="mt-1 text-xs text-realm-text-secondary">1 SUI = 1,000,000,000 MIST.</p>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-realm-text-secondary mb-1">
                            Description
                        </label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Briefly describe your game"
                            required
                            disabled={isLoading}
                            rows={4} // Example for rows
                        />
                    </div>
                    
                    {/* Consider a dedicated image upload field here later */}
                    {/* <div>
                        <label htmlFor="imageUrl" className="block text-sm font-medium text-realm-text-secondary mb-1">
                            Image URL (Optional)
                        </label>
                        <Input
                            id="imageUrl"
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleInputChange}
                            placeholder="https://example.com/image.png"
                            disabled={isLoading}
                        />
                    </div> */}


                    {progress.step !== 'idle' && progress.step !== 'success' && progress.step !== 'error' && (
                        <Flex align="center" gap="2" className="p-2 bg-realm-surface-secondary rounded-md">
                            {isLoading && <Spinner />} {/* Radix Spinner, ensure color is fine or wrap */}
                            <Text size="2" className="text-realm-text-secondary">{progress.message || `Processing: ${progress.step}`}</Text>
                        </Flex>
                    )}

                    {progress.step === 'error' && progress.error && (
                        <Callout.Root color="red" role="alert" variant="surface"> {/* Removed custom Tailwind bg/border for now, rely on Radix color="red" */}
                            <Callout.Icon>
                                {/* Radix will use its default error icon, which should be fine */}
                            </Callout.Icon>
                            <Callout.Text className="text-realm-neon-warning">{progress.error}</Callout.Text> {/* Ensure text uses our neon warning color */}
                        </Callout.Root>
                    )}
                </CardContent>
                <CardFooter>
                    <Button type="submit" variant="cta" isLoading={isLoading} disabled={isLoading} className="w-full">
                        {isLoading ? 'Listing Game...' : 'List My Game'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}

// Optional: Export default if this is the main export of the file
// export default CreateGameMetadataForm; 
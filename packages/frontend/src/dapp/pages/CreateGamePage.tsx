import { Container, Heading } from '@radix-ui/themes';
import { CreateGameMetadataForm } from '../components/game/CreateGameMetadataForm';

/**
 * Page component for creating new game metadata.
 */
function CreateGamePage() {
    return (
        <Container size="2" py="6">
            <Heading as="h1" size="6" mb="5" align="center">Create New Game Listing</Heading>
            <CreateGameMetadataForm />
        </Container>
    );
}

export default CreateGamePage; 
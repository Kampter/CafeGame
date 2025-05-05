import { FC } from 'react';
import { Link } from 'react-router-dom';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { Box, Flex, Heading, Text } from '@radix-ui/themes';

const Header: FC = () => {
  const currentAccount = useCurrentAccount();

  return (
    <header className="sticky top-0 z-10 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <Box className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Flex justify="between" align="center" className="h-16">
          {/* Logo/Site Title */}
          <Link to="/" className="flex items-center space-x-2">
            {/* Replace with actual logo later */}
            <Heading as="h1" size="5" className="font-semibold text-foreground">
              CafeGame
            </Heading>
      </Link>

          {/* Navigation Links & Connect Button */}
          <Flex align="center" gap="6">
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/">
                <Text size="3" className="text-muted-foreground hover:text-foreground transition-colors">
                  Discover
                </Text>
              </Link>
              {/* Add Games link later if needed */}
              {/* <Link to="/games">
                <Text size="3" className="text-muted-foreground hover:text-foreground transition-colors">
                  Games
                </Text>
              </Link> */}
              {currentAccount && (
                <Link to="/profile"> {/* Assuming a /profile route exists or will be added */}
                  <Text size="3" className="text-muted-foreground hover:text-foreground transition-colors">
                    My Profile
                  </Text>
                </Link>
              )}
        </nav>

            {/* Wallet Connect Button - Apply custom styling container if needed, or style directly */}
            <div className="sds-connect-button-container"> {/* Keep existing class for potential targeted styles */}
                 <ConnectButton connectText="Connect Wallet" />
        </div>
          </Flex>
        </Flex>
      </Box>
    </header>
  );
};

export default Header;

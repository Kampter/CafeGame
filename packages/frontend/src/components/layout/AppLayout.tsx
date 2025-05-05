import { FC } from 'react';
import { Box } from '@radix-ui/themes';
import { Outlet } from 'react-router-dom';
import Header from './Header'; // Import the Header component
import Footer from './Footer'; 
// You might want to add a Footer component here later
// Import the extracted type
import type { AppLayoutProps } from '~~/types/components.types';

// Remove original AppLayoutProps definition
// interface AppLayoutProps {
//   children: ReactNode;
// }

// Use the imported AppLayoutProps type
const AppLayout: FC<AppLayoutProps> = () => {
  return (
    // Use Tailwind classes for main layout structure
    <Box className="flex flex-col min-h-screen">
      <Header />
      {/* Adjust padding for main content area based on Wabi-Sabi style (more whitespace) */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
    </Box>
  );
};

export default AppLayout; 
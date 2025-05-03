import { FC } from 'react'
// import GreetingForm from '~~/dapp/components/GreetingForm' // Commented out
import { Flex, Separator, Heading } from '@radix-ui/themes'; // Import necessary layout components
import Layout from '~~/components/layout/Layout'
import NetworkSupportChecker from '../../components/NetworkSupportChecker'
import DashboardFeature from '~~/dapp/components/DashboardFeature' // <-- 添加这个导入
import CreateGameForm from '~~/dapp/components/game/CreateGameForm'; // Import the new form

const IndexPage: FC = () => {
  return (
    <Layout>
      <NetworkSupportChecker />
      {/* Use Flex for better layout control */}
      <Flex direction="column" align="center" gap="6" className="flex-grow p-3">
        {/* <GreetingForm /> // Commented out */}

        {/* Render existing Dashboard feature */}
        <DashboardFeature />

        {/* Add separator and the new Game creation form for testing */}
        <Separator my="6" size="4" className="w-full max-w-xl"/>
        <Heading mb="4" color="gray">Debug: Create New Game</Heading>
        <CreateGameForm />
      </Flex>
    </Layout>
  )
}

export default IndexPage